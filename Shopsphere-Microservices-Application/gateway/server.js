const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 18080);

const routes = {
  auth: process.env.AUTH_URL || "http://auth-service:4001",
  products:
    process.env.PRODUCT_URL ||
    "http://product-service:4002",
  cart:
    process.env.CART_URL ||
    "http://cart-service:4003",
  orders:
    process.env.ORDER_URL ||
    "http://order-service:4004",
  payments:
    process.env.PAYMENT_URL ||
    "http://payment-service:4005"
};

const frontendFile = path.join(
  process.cwd(),
  "frontend",
  "index.html"
);

function sendJson(res, statusCode, data) {
  const body = JSON.stringify(data);

  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body)
  });

  res.end(body);
}

function getTarget(req) {
  const match = req.url.match(
    /^\/api\/(auth|products|cart|orders|payments)(\/.*)?$/
  );

  if (!match) {
    return null;
  }

  const service = match[1];
  const remainingPath = match[2] || "/";

  const base = routes[service];

  return new URL(
    remainingPath + (req.url.includes("?")
      ? `?${req.url.split("?")[1]}`
      : ""),
    `${base}/`
  );
}

async function proxy(req, res, target) {
  const protocol =
    target.protocol === "https:" ? require("https") : http;

  const headers = {
    ...req.headers,
    host: target.host
  };

  const options = {
    hostname: target.hostname,
    port: target.port,
    path: `${target.pathname}${target.search}`,
    method: req.method,
    headers
  };

  const proxyRequest = protocol.request(
    options,
    proxyResponse => {
      res.writeHead(
        proxyResponse.statusCode || 500,
        proxyResponse.headers
      );

      proxyResponse.pipe(res);
    }
  );

  proxyRequest.on("error", error => {
    console.error("Gateway proxy error:", error.message);

    if (!res.headersSent) {
      sendJson(res, 502, {
        error: "Service unavailable"
      });
    }
  });

  req.pipe(proxyRequest);
}

const server = http.createServer(
  async (req, res) => {
    try {
      if (
        req.method === "GET" &&
        req.url === "/health"
      ) {
        return sendJson(res, 200, {
          service: "gateway",
          status: "UP"
        });
      }

      const target = getTarget(req);

      if (target) {
        return proxy(req, res, target);
      }

      if (
        req.method === "GET" &&
        (req.url === "/" ||
          req.url === "/index.html")
      ) {
        if (!fs.existsSync(frontendFile)) {
          return sendJson(res, 404, {
            error: "Frontend not found"
          });
        }

        const content = fs.readFileSync(
          frontendFile
        );

        res.writeHead(200, {
          "Content-Type": "text/html; charset=utf-8"
        });

        return res.end(content);
      }

      return sendJson(res, 404, {
        error: "Gateway route not found"
      });
    } catch (error) {
      console.error(error);

      if (!res.headersSent) {
        sendJson(res, 500, {
          error: "Gateway internal error"
        });
      }
    }
  }
);

server.listen(PORT, "0.0.0.0", () => {
  console.log(
    `ShopSphere Gateway running on port ${PORT}`
  );
});
