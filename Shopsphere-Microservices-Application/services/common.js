const http = require("http");
const https = require("https");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const DATA_DIR =
  process.env.DATA_DIR ||
  path.join(process.cwd(), "data");

function ensureDataDir() {
  fs.mkdirSync(DATA_DIR, {
    recursive: true
  });
}

function json(res, statusCode, data) {
  const body = JSON.stringify(data);

  res.writeHead(statusCode, {
    "Content-Type":
      "application/json; charset=utf-8",

    "Content-Length":
      Buffer.byteLength(body),

    "Cache-Control":
      "no-store"
  });

  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", chunk => {
      body += chunk;

      if (body.length > 1024 * 1024) {
        reject(
          new Error("Request body too large")
        );

        req.destroy();
      }
    });

    req.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch {
        reject(
          new Error("Invalid JSON")
        );
      }
    });

    req.on("error", reject);
  });
}

function load(filename, fallback) {
  ensureDataDir();

  const file = path.join(
    DATA_DIR,
    filename
  );

  if (!fs.existsSync(file)) {
    save(filename, fallback);
    return fallback;
  }

  try {
    return JSON.parse(
      fs.readFileSync(
        file,
        "utf8"
      )
    );
  } catch {
    return fallback;
  }
}

function save(filename, data) {
  ensureDataDir();

  const file = path.join(
    DATA_DIR,
    filename
  );

  const temp = `${file}.tmp`;

  fs.writeFileSync(
    temp,
    JSON.stringify(data, null, 2)
  );

  fs.renameSync(
    temp,
    file
  );
}

function id(prefix) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function hashPassword(password) {
  const salt =
    crypto
      .randomBytes(16)
      .toString("hex");

  const hash =
    crypto
      .scryptSync(
        password,
        salt,
        64
      )
      .toString("hex");

  return `${salt}:${hash}`;
}

function verifyPassword(
  password,
  stored
) {
  const [
    salt,
    storedHash
  ] = stored.split(":");

  if (
    !salt ||
    !storedHash
  ) {
    return false;
  }

  const hash =
    crypto
      .scryptSync(
        password,
        salt,
        64
      )
      .toString("hex");

  const a =
    Buffer.from(
      hash,
      "hex"
    );

  const b =
    Buffer.from(
      storedHash,
      "hex"
    );

  if (
    a.length !==
    b.length
  ) {
    return false;
  }

  return crypto.timingSafeEqual(
    a,
    b
  );
}

function base64url(value) {
  return Buffer
    .from(value)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64urlDecode(value) {
  value = value
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  while (
    value.length % 4
  ) {
    value += "=";
  }

  return Buffer
    .from(value, "base64")
    .toString("utf8");
}

function signJwt(
  payload,
  secret,
  expiresInSeconds = 3600
) {
  const header = {
    alg: "HS256",
    typ: "JWT"
  };

  const now =
    Math.floor(
      Date.now() / 1000
    );

  const completePayload = {
    ...payload,
    iat: now,
    exp:
      now +
      expiresInSeconds
  };

  const encodedHeader =
    base64url(
      JSON.stringify(header)
    );

  const encodedPayload =
    base64url(
      JSON.stringify(
        completePayload
      )
    );

  const unsigned =
    `${encodedHeader}.${encodedPayload}`;

  const signature =
    crypto
      .createHmac(
        "sha256",
        secret
      )
      .update(unsigned)
      .digest("base64url");

  return `${unsigned}.${signature}`;
}

function verifyJwt(
  token,
  secret
) {
  try {
    const parts =
      token.split(".");

    if (
      parts.length !== 3
    ) {
      return null;
    }

    const [
      header,
      payload,
      signature
    ] = parts;

    const unsigned =
      `${header}.${payload}`;

    const expected =
      crypto
        .createHmac(
          "sha256",
          secret
        )
        .update(unsigned)
        .digest("base64url");

    const a =
      Buffer.from(signature);

    const b =
      Buffer.from(expected);

    if (
      a.length !==
      b.length
    ) {
      return null;
    }

    if (
      !crypto.timingSafeEqual(
        a,
        b
      )
    ) {
      return null;
    }

    const decoded =
      JSON.parse(
        base64urlDecode(
          payload
        )
      );

    if (
      decoded.exp &&
      decoded.exp <
        Math.floor(
          Date.now() / 1000
        )
    ) {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}

function getAuthUser(req) {
  const authorization =
    req.headers.authorization ||
    "";

  if (
    !authorization.startsWith(
      "Bearer "
    )
  ) {
    return null;
  }

  const token =
    authorization.slice(7);

  return verifyJwt(
    token,
    process.env.JWT_SECRET ||
      "shopsphere-local-secret"
  );
}

function requireAuth(
  req,
  res
) {
  const user =
    getAuthUser(req);

  if (!user) {
    json(res, 401, {
      error:
        "Authentication required"
    });

    return null;
  }

  return user;
}

function requestJson(
  urlString,
  options = {}
) {
  return new Promise(
    (resolve, reject) => {
      const url =
        new URL(urlString);

      const client =
        url.protocol ===
        "https:"
          ? https
          : http;

      const requestOptions = {
        hostname:
          url.hostname,

        port:
          url.port ||
          (url.protocol ===
          "https:"
            ? 443
            : 80),

        path:
          `${url.pathname}${url.search}`,

        method:
          options.method ||
          "GET",

        headers: {
          ...(options.headers ||
            {})
        },

        timeout: 5000
      };

      const req =
        client.request(
          requestOptions,
          res => {
            let body = "";

            res.on(
              "data",
              chunk => {
                body += chunk;
              }
            );

            res.on(
              "end",
              () => {
                let data;

                try {
                  data = body
                    ? JSON.parse(
                        body
                      )
                    : {};
                } catch {
                  data = {
                    raw: body
                  };
                }

                resolve({
                  statusCode:
                    res.statusCode,

                  data
                });
              }
            );
          }
        );

      req.on(
        "timeout",
        () => {
          req.destroy(
            new Error(
              `Request timeout: ${urlString}`
            )
          );
        }
      );

      req.on(
        "error",
        reject
      );

      if (options.body) {
        req.write(
          typeof options.body ===
            "string"
            ? options.body
            : JSON.stringify(
                options.body
              )
        );
      }

      req.end();
    }
  );
}

function server(handler) {
  const port =
    Number(
      process.env.PORT || 3000
    );

  const httpServer =
    http.createServer(
      async (req, res) => {
        try {
          await handler(
            req,
            res
          );
        } catch (error) {
          console.error(error);

          if (
            !res.headersSent
          ) {
            json(res, 500, {
              error:
                "Internal server error"
            });
          }
        }
      }
    );

  httpServer.listen(
    port,
    "0.0.0.0",
    () => {
      console.log(
        `Service listening on port ${port}`
      );
    }
  );

  return httpServer;
}

module.exports = {
  json,
  readBody,
  load,
  save,
  id,
  hashPassword,
  verifyPassword,
  signJwt,
  verifyJwt,
  getAuthUser,
  requireAuth,
  requestJson,
  server
};
