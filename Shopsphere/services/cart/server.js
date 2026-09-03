const {
  json,
  body,
  route,
  server,
  notFound
} = require("../common");

const carts = new Map();

function getCart(userId) {

  if (!carts.has(userId)) {
    carts.set(userId, []);
  }

  return carts.get(userId);
}

server("cart", async (req, res) => {

  const {
    pathname
  } = route(req);

  const match =
    pathname.match(
      /^\/carts\/([^/]+)$/
    );

  // Get cart
  if (
    req.method === "GET" &&
    match
  ) {

    const userId =
      match[1];

    const items =
      getCart(userId);

    return json(
      res,
      200,
      {
        userId,

        items,

        totalItems:
          items.reduce(
            (
              total,
              item
            ) =>
              total +
              item.quantity,
            0
          )
      }
    );
  }

  // Add item
  if (
    req.method === "POST" &&
    pathname === "/carts/items"
  ) {

    const input =
      await body(req);

    if (
      !input.userId ||
      !input.productId
    ) {

      return json(
        res,
        400,
        {
          error:
            "userId and productId are required"
        }
      );
    }

    const quantity =
      Math.max(
        1,
        Number(
          input.quantity || 1
        )
      );

    const items =
      getCart(input.userId);

    const existing =
      items.find(
        item =>
          item.productId ===
          input.productId
      );

    if (existing) {

      existing.quantity +=
        quantity;

    } else {

      items.push({

        productId:
          input.productId,

        name:
          input.name ||
          "Product",

        price:
          Number(
            input.price || 0
          ),

        quantity
      });
    }

    return json(
      res,
      201,
      {
        userId:
          input.userId,

        items
      }
    );
  }

  // Delete cart
  if (
    req.method === "DELETE" &&
    match
  ) {

    carts.delete(
      match[1]
    );

    return json(
      res,
      200,
      {
        userId: match[1],

        items: []
      }
    );
  }

  return notFound(res);
});
