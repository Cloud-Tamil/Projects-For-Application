const test =
  require("node:test");

const assert =
  require("node:assert/strict");

const base =
  process.env.BASE_URL ||
  "http://localhost:8080";

async function request(
  path,
  options = {}
) {

  const response =
    await fetch(
      `${base}${path}`,
      {
        headers: {
          "Content-Type":
            "application/json",

          ...(options.headers || {})
        },

        ...options
      }
    );

  const data =
    await response.json();

  return {
    response,
    data
  };
}


// -------------------------------------
// Product → Cart → Order → Payment
// -------------------------------------

test(
  "ShopSphere product -> cart -> order -> payment flow",
  async () => {

    let result =
      await request(
        "/api/products/products"
      );

    assert.equal(
      result.response.status,
      200
    );

    assert.ok(
      result.data.products.length > 0
    );

    const product =
      result.data.products[0];


    // Add product to cart

    result =
      await request(
        "/api/cart/carts/items",
        {
          method: "POST",

          body:
            JSON.stringify({
              userId:
                "integration-user",

              productId:
                product.id,

              name:
                product.name,

              price:
                product.price,

              quantity: 2
            })
        }
      );

    assert.equal(
      result.response.status,
      201
    );

    assert.equal(
      result.data.items[0]
        .quantity,
      2
    );


    // Create order

    result =
      await request(
        "/api/orders/orders",
        {
          method: "POST",

          body:
            JSON.stringify({
              userId:
                "integration-user",

              items:
                result.data.items
            })
        }
      );

    assert.equal(
      result.response.status,
      201
    );

    const order =
      result.data;

    assert.equal(
      order.status,
      "CREATED"
    );


    // Payment

    result =
      await request(
        "/api/payments/payments",
        {
          method: "POST",

          body:
            JSON.stringify({
              orderId:
                order.id,

              amount:
                order.total
            })
        }
      );

    assert.equal(
      result.response.status,
      201
    );

    assert.equal(
      result.data.status,
      "SUCCESS"
    );
  }
);


// -------------------------------------
// Authentication
// -------------------------------------

test(
  "register and login",
  async () => {

    const email =
      `test-${Date.now()}@example.com`;


    // Register

    let result =
      await request(
        "/api/auth/register",
        {
          method: "POST",

          body:
            JSON.stringify({
              name:
                "Integration User",

              email,

              password:
                "Passw0rd!"
            })
        }
      );

    assert.equal(
      result.response.status,
      201
    );


    // Login

    result =
      await request(
        "/api/auth/login",
        {
          method: "POST",

          body:
            JSON.stringify({
              email,

              password:
                "Passw0rd!"
            })
        }
      );

    assert.equal(
      result.response.status,
      200
    );

    assert.ok(
      result.data.token
    );
  }
);
