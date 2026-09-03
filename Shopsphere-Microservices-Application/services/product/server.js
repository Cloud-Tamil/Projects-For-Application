const {
  json,
  readBody,
  load,
  save,
  server
} = require("../common");

const seedProducts = [
  {
    id: "prd-laptop",
    name: "ShopSphere Pro Laptop",
    description:
      "14-inch performance laptop",
    price: 1299.99,
    stock: 10,
    category: "Electronics"
  },

  {
    id: "prd-phone",
    name: "ShopSphere Smart Phone",
    description:
      "5G smartphone",
    price: 799.99,
    stock: 20,
    category: "Electronics"
  },

  {
    id: "prd-headphones",
    name: "Wireless Headphones",
    description:
      "Noise cancelling wireless headphones",
    price: 149.99,
    stock: 30,
    category: "Audio"
  },

  {
    id: "prd-keyboard",
    name: "Mechanical Keyboard",
    description:
      "RGB mechanical keyboard",
    price: 89.99,
    stock: 50,
    category: "Accessories"
  },

  {
    id: "prd-mouse",
    name: "Wireless Mouse",
    description:
      "Ergonomic wireless mouse",
    price: 39.99,
    stock: 75,
    category: "Accessories"
  }
];

function getProducts() {
  return load(
    "products.json",
    seedProducts
  );
}

async function handler(
  req,
  res
) {
  const url =
    new URL(
      req.url,
      `http://${req.headers.host}`
    );

  if (
    req.method === "GET" &&
    url.pathname === "/health"
  ) {
    return json(res, 200, {
      service: "product",
      status: "UP"
    });
  }

  if (
    req.method === "GET" &&
    url.pathname === "/products"
  ) {
    const products =
      getProducts();

    const query =
      String(
        url.searchParams.get(
          "q"
        ) || ""
      )
        .trim()
        .toLowerCase();

    const result = query
      ? products.filter(
          product =>
            `${product.name} ${product.description} ${product.category}`
              .toLowerCase()
              .includes(query)
        )
      : products;

    return json(res, 200, {
      products: result
    });
  }

  const productMatch =
    url.pathname.match(
      /^\/products\/([^/]+)$/
    );

  if (
    req.method === "GET" &&
    productMatch
  ) {
    const products =
      getProducts();

    const product =
      products.find(
        item =>
          item.id ===
          productMatch[1]
      );

    if (!product) {
      return json(res, 404, {
        error:
          "Product not found"
      });
    }

    return json(res, 200, {
      product
    });
  }

  if (
    req.method === "POST" &&
    url.pathname ===
      "/internal/reserve"
  ) {
    const body =
      await readBody(req);

    const items =
      Array.isArray(body.items)
        ? body.items
        : [];

    if (!items.length) {
      return json(res, 400, {
        error:
          "Items are required"
      });
    }

    const products =
      getProducts();

    const normalizedItems =
      [];

    for (
      const item of items
    ) {
      const productId =
        String(
          item.productId || ""
        );

      const quantity =
        Number(
          item.quantity
        );

      if (
        !productId ||
        !Number.isInteger(
          quantity
        ) ||
        quantity <= 0
      ) {
        return json(res, 400, {
          error:
            "Invalid order item"
        });
      }

      const product =
        products.find(
          p =>
            p.id ===
            productId
        );

      if (!product) {
        return json(res, 404, {
          error:
            `Product not found: ${productId}`
        });
      }

      if (
        product.stock <
        quantity
      ) {
        return json(res, 409, {
          error:
            `Insufficient stock for ${product.name}`
        });
      }

      normalizedItems.push({
        product,
        quantity
      });
    }

    for (
      const item of
        normalizedItems
    ) {
      const product =
        products.find(
          p =>
            p.id ===
            item.product.id
        );

      product.stock -=
        item.quantity;
    }

    save(
      "products.json",
      products
    );

    const orderItems =
      normalizedItems.map(
        item => ({
          productId:
            item.product.id,

          name:
            item.product.name,

          price:
            item.product.price,

          quantity:
            item.quantity,

          subtotal:
            Number(
              (
                item.product.price *
                item.quantity
              ).toFixed(2)
            )
        })
      );

    const total =
      Number(
        orderItems
          .reduce(
            (
              sum,
              item
            ) =>
              sum +
              item.subtotal,
            0
          )
          .toFixed(2)
      );

    return json(res, 200, {
      items:
        orderItems,
      total
    });
  }

  if (
    req.method === "POST" &&
    url.pathname ===
      "/internal/release"
  ) {
    const body =
      await readBody(req);

    const items =
      Array.isArray(body.items)
        ? body.items
        : [];

    const products =
      getProducts();

    for (
      const item of items
    ) {
      const product =
        products.find(
          p =>
            p.id ===
            item.productId
        );

      if (product) {
        product.stock +=
          Number(
            item.quantity || 0
          );
      }
    }

    save(
      "products.json",
      products
    );

    return json(res, 200, {
      message:
        "Inventory released"
    });
  }

  return json(res, 404, {
    error: "Route not found"
  });
}

server(handler);
