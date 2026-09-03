const { randomUUID } = require("node:crypto");

function json(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });

  res.end(JSON.stringify(body));
}

function text(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "text/plain; charset=utf-8"
  });

  res.end(body);
}

async function body(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8");

  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw);
  } catch {
    throw Object.assign(
      new Error("Invalid JSON"),
      {
        statusCode: 400
      }
    );
  }
}

function route(req) {
  const url = new URL(
    req.url,
    `http://${req.headers.host || "localhost"}`
  );

  return {
    pathname: url.pathname,
    searchParams: url.searchParams
  };
}

function health(service) {
  return {
    status: "UP",
    service,
    timestamp: new Date().toISOString()
  };
}

function server(service, handler) {
  const http = require("node:http");

  const port = Number(process.env.PORT || 3000);

  const srv = http.createServer(async (req, res) => {
    try {
      if (
        req.method === "GET" &&
        req.url === "/health"
      ) {
        return json(
          res,
          200,
          health(service)
        );
      }

      await handler(req, res);

    } catch (err) {
      console.error(`[${service}]`, err);

      json(
        res,
        err.statusCode || 500,
        {
          error:
            err.message ||
            "Internal Server Error",

          service
        }
      );
    }
  });

  srv.listen(
    port,
    "0.0.0.0",
    () => {
      console.log(
        `[${service}] listening on ${port}`
      );
    }
  );

  return srv;
}

function notFound(res) {
  return json(
    res,
    404,
    {
      error: "Route not found"
    }
  );
}

module.exports = {
  json,
  text,
  body,
  route,
  health,
  server,
  notFound,
  randomUUID
};
