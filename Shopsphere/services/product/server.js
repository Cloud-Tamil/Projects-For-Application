const {
  json,
  route,
  server,
  notFound,
  randomUUID
} = require("../common");

const products = [

  {
    id: "p-1001",
    name: "Wireless Headphones",
    category: "electronics",
    price: 2499,
    stock: 25
  },

  {
    id: "p-1002",
    name: "Mechanical Keyboard",
    category: "electronics",
    price: 3499,
    stock: 18
  },

  {
    id: "p-1003",
    name: "Running Shoes",
    category: "fashion",
    price: 2999,
    stock: 40
  },

  {
    id: "p-1004",
    name: "Smart Watch",
    category: "electronics",
    price: 4999,
    stock: 12
  },

  {
    id: "p-1005",
    name: "Travel Backpack",
    category: "lifestyle",
    price: 1899,
    stock: 30
  }

];

server("product", async (req, res) => {

  const {
    pathname,
    searchParams
  } = route(req);

  // Get products
  if (
    req.method === "GET" &&
    pathname === "/products"
  ) {

    const q =
      (
        searchParams.get("q") ||
        ""
      ).toLowerCase();

    const category =
      searchParams.get(
        "category"
      );

    const result =
      products.filter(
        product => {

          const matchesQuery =
            !q ||
            product.name
              .toLowerCase()
              .includes(q);

          const matchesCategory =
            !category ||
            product.category ===
              category;

          return (
            matchesQuery &&
            matchesCategory
          );
        }
      );

    return json(
      res,
      200,
      {
        products: result,
        count: result.length
      }
    );
  }

  // Get single product
  const match =
    pathname.match(
      /^\/products\/([^/]+)$/
    );

  if (
    req.method === "GET" &&
    match
  ) {

    const product =
      products.find(
        p => p.id === match[1]
      );

    if (!product) {
      return json(
        res,
        404,
        {
          error:
            "Product not found"
        }
      );
    }

    return json(
      res,
      200,
      product
    );
  }

  // Create product
  if (
    req.method === "POST" &&
    pathname === "/products"
  ) {

    let raw = "";

    for await (
      const chunk of req
    ) {
      raw += chunk;
    }

    const input =
      raw
        ? JSON.parse(raw)
        : {};

    if (
      !input.name ||
      input.price == null
    ) {

      return json(
        res,
        400,
        {
          error:
            "name and price are required"
        }
      );
    }

    const product = {

      id: randomUUID(),

      name: input.name,

      category:
        input.category ||
        "general",

      price:
        Number(input.price),

      stock:
        Number(input.stock || 0)
    };

    products.push(product);

    return json(
      res,
      201,
      product
    );
  }

  return notFound(res);
});
