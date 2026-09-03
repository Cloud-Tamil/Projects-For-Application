const {
  json,
  readBody,
  load,
  save,
  id,
  hashPassword,
  verifyPassword,
  signJwt,
  server
} = require("../common");

const PORT = Number(process.env.PORT || 4001);

const JWT_SECRET =
  process.env.JWT_SECRET || "shopsphere-local-secret";

function validEmail(email) {
  return (
    typeof email === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  );
}

async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "GET" && url.pathname === "/health") {
    return json(res, 200, {
      service: "auth",
      status: "UP"
    });
  }

  if (req.method === "POST" && url.pathname === "/register") {
    const body = await readBody(req);

    const email = String(body.email || "")
      .trim()
      .toLowerCase();

    const password = String(body.password || "");

    const name = String(body.name || "")
      .trim();

    if (!name) {
      return json(res, 400, {
        error: "Name is required"
      });
    }

    if (!validEmail(email)) {
      return json(res, 400, {
        error: "Valid email is required"
      });
    }

    if (password.length < 6) {
      return json(res, 400, {
        error: "Password must contain at least 6 characters"
      });
    }

    const users = load("auth.json", []);

    if (users.some(user => user.email === email)) {
      return json(res, 409, {
        error: "User already exists"
      });
    }

    const user = {
      id: id("usr"),
      name,
      email,
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString()
    };

    users.push(user);

    save("auth.json", users);

    return json(res, 201, {
      message: "Registration successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  }

  if (req.method === "POST" && url.pathname === "/login") {
    const body = await readBody(req);

    const email = String(body.email || "")
      .trim()
      .toLowerCase();

    const password = String(body.password || "");

    const users = load("auth.json", []);

    const user = users.find(
      item => item.email === email
    );

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return json(res, 401, {
        error: "Invalid email or password"
      });
    }

    const token = signJwt(
      {
        sub: user.id,
        name: user.name,
        email: user.email
      },
      JWT_SECRET,
      60 * 60 * 8
    );

    return json(res, 200, {
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  }

  return json(res, 404, {
    error: "Route not found"
  });
}

server(handler);
