const {
  json,
  body,
  route,
  server,
  notFound,
  randomUUID
} = require("../common");

const payments = new Map();

server("payment", async (req, res) => {

  const {
    pathname
  } = route(req);

  // Create payment
  if (
    req.method === "POST" &&
    pathname === "/payments"
  ) {

    const input =
      await body(req);

    if (
      !input.orderId ||
      !input.amount
    ) {

      return json(
        res,
        400,
        {
          error:
            "orderId and amount are required"
        }
      );
    }

    const payment = {

      id: randomUUID(),

      orderId:
        input.orderId,

      amount:
        Number(
          input.amount
        ),

      currency:
        input.currency ||
        "INR",

      status:
        "SUCCESS",

      provider:
        "ShopSphere-Demo",

      createdAt:
        new Date().toISOString()
    };

    payments.set(
      payment.id,
      payment
    );

    return json(
      res,
      201,
      payment
    );
  }

  const match =
    pathname.match(
      /^\/payments\/([^/]+)$/
    );

  // Get payment
  if (
    req.method === "GET" &&
    match
  ) {

    const payment =
      payments.get(
        match[1]
      );

    if (!payment) {

      return json(
        res,
        404,
        {
          error:
            "Payment not found"
        }
      );
    }

    return json(
      res,
      200,
      payment
    );
  }

  return notFound(res);
});
