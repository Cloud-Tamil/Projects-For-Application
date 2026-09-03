const {
  json,
  readBody,
  load,
  save,
  id,
  requireAuth,
  server
} = require("../common");

async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "GET" && url.pathname === "/health") {
    return json(res, 200, {
      service: "payment",
      status: "UP"
    });
  }

  const user = requireAuth(req, res);

  if (!user) {
    return;
  }

  if (
    req.method === "POST" &&
    url.pathname === "/payments"
  ) {
    const body = await readBody(req);

    const cardNumber = String(
      body.cardNumber || ""
    ).replace(/\s/g, "");

    const amount = Number(body.amount);

    if (!/^\d{12,19}$/.test(cardNumber)) {
      return json(res, 400, {
        error: "Invalid card number"
      });
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return json(res, 400, {
        error: "Invalid payment amount"
      });
    }

    /*
      DEMO ONLY

      Any card ending in 0000 fails.
    */

    const failed = cardNumber.endsWith("0000");

    const payment = {
      id: id("pay"),
      userId: user.sub,
      amount,
      status: failed ? "FAILED" : "SUCCESS",
      last4: cardNumber.slice(-4),
      createdAt: new Date().toISOString()
    };

    const payments = load("payments.json", []);

    payments.push(payment);

    save("payments.json", payments);

    if (failed) {
      return json(res, 402, {
        payment
      });
    }

    return json(res, 200, {
      payment
    });
  }

  return json(res, 404, {
    error: "Route not found"
  });
}

server(handler);
