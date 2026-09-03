const {
  json,
  readBody,
  load,
  save,
  id,
  requireAuth,
  requestJson,
  server
} = require("../common");

const PRODUCT_URL =
  process.env.PRODUCT_URL ||
  "http://product-service:4002";

const PAYMENT_URL =
  process.env.PAYMENT_URL ||
  "http://payment-service:4005";

async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "GET" && url.pathname === "/health") {
    return json(res, 200, {
      service: "order",
      status: "UP"
    });
  }

  const user = requireAuth(req, res);

  if (!user) {
    return;
  }

  if (req.method === "GET" && url.pathname === "/orders") {
    const orders = load("orders.json", []);

    const userOrders = orders.filter(
      order => order.userId === user.sub
    );

    return json(res, 200, {
      orders: userOrders
    });
  }

  if (
    req.method === "POST" &&
    url.pathname === "/orders"
  ) {
    const body = await readBody(req);

    const items = Array.isArray(body.items)
      ? body.items
      : [];

    if (!items.length) {
      return json(res, 400, {
        error: "Order items are required"
      });
    }

    /*
      Step 1:
      Reserve inventory.
    */

    const reserveResponse = await requestJson(
      `${PRODUCT_URL}/internal/reserve`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: {
          items
        }
      }
    );

    if (reserveResponse.statusCode !== 200) {
      return json(
        res,
        reserveResponse.statusCode || 500,
        {
          error:
            reserveResponse.data?.error ||
            "Unable to reserve inventory"
        }
      );
    }

    const reserved = reserveResponse.data;

    /*
      Step 2:
      Process payment.
    */

    const paymentResponse = await requestJson(
      `${PAYMENT_URL}/payments`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            req.headers.authorization
        },
        body: {
          amount: reserved.total,
          cardNumber: body.cardNumber
        }
      }
    );

    /*
      Step 3:
      Payment failed.
      Release inventory.
    */

    if (paymentResponse.statusCode !== 200) {
      await requestJson(
        `${PRODUCT_URL}/internal/release`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: {
            items
          }
        }
      );

      const failedOrder = {
        id: id("ord"),
        userId: user.sub,
        items: reserved.items,
        total: reserved.total,
        status: "PAYMENT_FAILED",
        createdAt: new Date().toISOString()
      };

      const orders = load("orders.json", []);

      orders.push(failedOrder);

      save("orders.json", orders);

      return json(res, 402, {
        error:
          paymentResponse.data?.payment?.status === "FAILED"
            ? "Payment failed"
            : "Payment service unavailable",
        order: failedOrder
      });
    }

    /*
      Step 4:
      Payment succeeded.
      Create confirmed order.
    */

    const order = {
      id: id("ord"),
      userId: user.sub,
      items: reserved.items,
      total: reserved.total,
      paymentId: paymentResponse.data.payment.id,
      status: "CONFIRMED",
      createdAt: new Date().toISOString()
    };

    const orders = load("orders.json", []);

    orders.push(order);

    save("orders.json", orders);

    return json(res, 201, {
      message: "Order created successfully",
      order
    });
  }

  return json(res, 404, {
    error: "Route not found"
  });
}

server(handler);
