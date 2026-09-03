const {
  json,
  body,
  route,
  server,
  notFound,
  randomUUID
} = require("../common");

const users = new Map();

server("auth", async (req, res) => {

  const { pathname } = route(req);

  // Register
  if (
    req.method === "POST" &&
    pathname === "/register"
  ) {

    const input = await body(req);

    if (
      !input.email ||
      !input.password
    ) {
      return json(
        res,
        400,
        {
          error:
            "email and password are required"
        }
      );
    }

    if (users.has(input.email)) {
      return json(
        res,
        409,
        {
          error:
            "User already exists"
        }
      );
    }

    const user = {
      id: randomUUID(),

      name:
        input.name ||
        "ShopSphere User",

      email: input.email,

      createdAt:
        new Date().toISOString()
    };

    users.set(
      input.email,
      {
        ...user,
        password: input.password
      }
    );

    return json(
      res,
      201,
      {
        user
      }
    );
  }

  // Login
  if (
    req.method === "POST" &&
    pathname === "/login"
  ) {

    const input = await body(req);

    const user =
      users.get(input.email);

    if (
      !user ||
      user.password !== input.password
    ) {
      return json(
        res,
        401,
        {
          error:
            "Invalid credentials"
        }
      );
    }

    return json(
      res,
      200,
      {
        token:
          `demo-${Buffer
            .from(user.id)
            .toString("base64url")}`,

        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      }
    );
  }

  // List users
  if (
    req.method === "GET" &&
    pathname === "/users"
  ) {

    return json(
      res,
      200,
      {
        users:
          [...users.values()]
            .map(
              ({
                password,
                ...user
              }) => user
            )
      }
    );
  }

  return notFound(res);
});
