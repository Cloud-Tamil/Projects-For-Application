const {
  json,
  readBody,
  load,
  save,
  id,
  requireAuth,
  requestJson,
  server
} = require("../common");

const PRODUCT_URL =
  process.env.PRODUCT_URL ||
  "http://product-service:4002";

function getCart(userId) {
  const carts = load("carts.json", []);

  return (
    carts.find(cart => cart.userId === userId) || {
      userId,
      items: []
    }
  );
}

function saveCart(cart) {
  const carts = load("carts.json", []);

  const index = carts.findIndex(
    item => item.userId === cart.userId
  );

  if (index === -1) {
    carts.push(cart);
  } else {
    carts[index] = cart;
  }

  save("carts.json", carts);
}

async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "GET" && url.pathname === "/health") {
    return json(res, 200, {
      service: "cart",
      status: "UP"
    });
  }

  const user = requireAuth(req, res);

  if (!user) {
    return;
  }

  if (req.method === "GET" && url.pathname === "/cart") {
    const cart = getCart(user.sub);

    return json(res, 200, {
      cart
    });
  }

  if (
    req.method === "POST" &&
    url.pathname === "/cart/items"
  ) {
    const body = await readBody(req);

    const productId = String(
      body.productId || ""
    );

    const quantity = Number(body.quantity);

    if (
      !productId ||
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      return json(res, 400, {
        error: "Valid productId and quantity are required"
      });
    }

    const productResponse = await requestJson(
      `${PRODUCT_URL}/products/${encodeURIComponent(productId)}`
    );

    if (productResponse.statusCode !== 200) {
      return json(res, 404, {
        error: "Product not found"
      });
    }

    const product = productResponse.data.product;

    const cart = getCart(user.sub);

    const existing = cart.items.find(
      item => item.productId === product.id
    );

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({
        id: id("cartitem"),
        productId: product.id,
        quantity
      });
    }

    saveCart(cart);

    return json(res, 200, {
      message: "Product added to cart",
      cart
    });
  }

  if (
    req.method === "DELETE" &&
    url.pathname === "/cart"
  ) {
    saveCart({
      userId: user.sub,
      items: []
    });

    return json(res, 200, {
      message: "Cart cleared"
    });
  }

  return json(res, 404, {
    error: "Route not found"
  });
}

server(handler);
