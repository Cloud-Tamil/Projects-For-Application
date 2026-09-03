const {
  json,
  body,
  route,
  server,
  notFound,
  randomUUID
} = require("../common");

const orders = new Map();

server("order", async (req, res) => {

  const {
    pathname
  } = route(req);

  // Create order
  if (
    req.method === "POST" &&
    pathname === "/orders"
  ) {

    const input =
      await body(req);

    if (
      !input.userId ||
      !Array.isArray(
        input.items
      ) ||
      input.items.length === 0
    ) {

      return json(
        res,
        400,
        {
          error:
            "userId and non-empty items are required"
        }
      );
    }

    const total =
      input.items.reduce(
        (
          sum,
          item
        ) =>
          sum +
          Number(
            item.price || 0
          ) *
          Number(
            item.quantity || 1
          ),
        0
      );

    const order = {

      id: randomUUID(),

      userId:
        input.userId,

      items:
        input.items,

      total:
        Number(
          total.toFixed(2)
        ),

      status:
        "CREATED",

      createdAt:
        new Date().toISOString()
    };

    orders.set(
      order.id,
      order
    );

    return json(
      res,
      201,
      order
    );
  }

  // Get all orders
  if (
    req.method === "GET" &&
    pathname === "/orders"
  ) {

    return json(
      res,
      200,
      {
        orders:
          [...orders.values()]
      }
    );
  }

  const match =
    pathname.match(
      /^\/orders\/([^/]+)$/
    );

  // Get order
  if (
    req.method === "GET" &&
    match
  ) {

    const order =
      orders.get(
        match[1]
      );

    if (!order) {

      return json(
        res,
        404,
        {
          error:
            "Order not found"
        }
      );
    }

    return json(
      res,
      200,
      order
    );
  }

  // Update order status
  if (
    req.method === "PATCH" &&
    match
  ) {

    const order =
      orders.get(
        match[1]
      );

    if (!order) {

      return json(
        res,
        404,
        {
          error:
            "Order not found"
        }
      );
    }

    const input =
      await body(req);

    order.status =
      input.status ||
      order.status;

    return json(
      res,
      200,
      order
    );
  }

  return notFound(res);
});
