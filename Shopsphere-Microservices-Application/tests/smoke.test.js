const test = require("node:test");
const assert = require("node:assert");

const BASE_URL =
  process.env.BASE_URL ||
  "http://localhost:18080";

async function request(
  path,
  options = {}
) {

  const response =
    await fetch(
      `${BASE_URL}${path}`,
      options
    );

  const data =
    await response.json();

  return {
    response,
    data
  };

}


test(
  "ShopSphere end-to-end smoke test",
  async () => {

    const email =
      `test-${Date.now()}@example.com`;

    /*
      Register
    */

    let result =
      await request(
        "/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json"
          },
          body: JSON.stringify({
            name: "Test User",
            email,
            password: "password123"
          })
        }
      );

    assert.equal(
      result.response.status,
      201
    );

    /*
      Login
    */

    result =
      await request(
        "/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json"
          },
          body: JSON.stringify({
            email,
            password: "password123"
          })
        }
      );

    assert.equal(
      result.response.status,
      200
    );

    const token =
      result.data.token;

    assert.ok(token);

    const headers = {
      "Content-Type":
        "application/json",
      Authorization:
        `Bearer ${token}`
    };

    /*
      Products
    */

    result =
      await request(
        "/api/products",
        {
          headers
        }
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

    /*
      Add to cart
    */

    result =
      await request(
        "/api/cart/items",
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            productId:
              product.id,
            quantity: 1
          })
        }
      );

    assert.equal(
      result.response.status,
      200
    );

    /*
      Get cart
    */

    result =
      await request(
        "/api/cart",
        {
          headers
        }
      );

    assert.equal(
      result.response.status,
      200
    );

    assert.equal(
      result.data.cart.items.length,
      1
    );

    /*
      Create order
    */

    result =
      await request(
        "/api/orders",
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            items: [
              {
                productId:
                  product.id,
                quantity: 1
              }
            ],
            cardNumber:
              "4111111111111111"
          })
        }
      );

    assert.equal(
      result.response.status,
      201
    );

    assert.equal(
      result.data.order.status,
      "CONFIRMED"
    );

  }
);
