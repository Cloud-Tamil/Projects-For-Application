const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const PORT =
  Number(
    process.env.PORT || 8080
  );

const routes = {

  "/api/auth":
    process.env.AUTH_URL ||
    "http://localhost:3001",

  "/api/products":
    process.env.PRODUCT_URL ||
    "http://localhost:3002",

  "/api/cart":
    process.env.CART_URL ||
    "http://localhost:3003",

  "/api/orders":
    process.env.ORDER_URL ||
    "http://localhost:3004",

  "/api/payments":
    process.env.PAYMENT_URL ||
    "http://localhost:3005"
};

function json(
  res,
  status,
  data
) {

  res.writeHead(
    status,
    {
      "Content-Type":
        "application/json; charset=utf-8",

      "Access-Control-Allow-Origin":
        "*"
    }
  );

  res.end(
    JSON.stringify(data)
  );
}

function serveFrontend(
  req,
  res
) {

  if (req.url !== "/") {
    return false;
  }

  const filePath =
    path.join(
      __dirname,
      "..",
      "frontend",
      "index.html"
    );

  const content =
    fs.readFileSync(
      filePath
    );

  res.writeHead(
    200,
    {
      "Content-Type":
        "text/html; charset=utf-8"
    }
  );

  res.end(content);

  return true;
}

async function proxy(
  req,
  res,
  targetBase,
  prefix
) {

  const suffix =
    req.url.slice(
      prefix.length
    ) || "/";

  const target =
    `${targetBase}${suffix}`;

  const headers = {

    "Content-Type":
      req.headers[
        "content-type"
      ] ||
      "application/json"
  };

  const init = {

    method:
      req.method,

    headers
  };

  if (
    !["GET", "HEAD"]
      .includes(req.method)
  ) {

    const chunks = [];

    for await (
      const chunk of req
    ) {
      chunks.push(chunk);
    }

    init.body =
      Buffer.concat(
        chunks
      );
  }

  const response =
    await fetch(
      target,
      init
    );

  const data =
    await response.text();

  res.writeHead(
    response.status,
    {
      "Content-Type":
        response.headers.get(
          "content-type"
        ) ||
        "application/json",

      "Access-Control-Allow-Origin":
        "*"
    }
  );

  res.end(data);
}

const server =
  http.createServer(
    async (req, res) => {

      try {

        // CORS
        if (
          req.method ===
          "OPTIONS"
        ) {

          res.writeHead(
            204,
            {
              "Access-Control-Allow-Origin":
                "*",

              "Access-Control-Allow-Methods":
                "GET,POST,PATCH,DELETE,OPTIONS",

              "Access-Control-Allow-Headers":
                "Content-Type, Authorization"
            }
          );

          return res.end();
        }

        // Gateway health
        if (
          req.url ===
          "/health"
        ) {

          return json(
            res,
            200,
            {
              status: "UP",

              service:
                "gateway",

              timestamp:
                new Date()
                  .toISOString()
            }
          );
        }

        // Frontend
        if (
          serveFrontend(
            req,
            res
          )
        ) {
          return;
        }

        // Find microservice
        const prefix =
          Object.keys(
            routes
          ).find(
            p =>
              req.url === p ||
              req.url.startsWith(
                `${p}/`
              )
          );

        if (!prefix) {

          return json(
            res,
            404,
            {
              error:
                "Gateway route not found"
            }
          );
        }

        await proxy(
          req,
          res,
          routes[prefix],
          prefix
        );

      } catch (err) {

        console.error(
          "[gateway]",
          err
        );

        json(
          res,
          502,
          {
            error:
              "Upstream service unavailable",

            details:
              err.message
          }
        );
      }
    }
  );

server.listen(
  PORT,
  "0.0.0.0",
  () => {

    console.log(
      `[gateway] listening on ${PORT}`
    );
  }
);
