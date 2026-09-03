const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

const requiredFiles = [
  "docker-compose.yml",
  "package.json",
  ".dockerignore",
  ".gitignore",

  "docker/gateway.Dockerfile",
  "docker/service.Dockerfile",

  "gateway/server.js",

  "frontend/index.html",

  "services/common.js",
  "services/auth/server.js",
  "services/product/server.js",
  "services/cart/server.js",
  "services/order/server.js",
  "services/payment/server.js"
];

test("ShopSphere required files exist", () => {

  for (const file of requiredFiles) {

    const fullPath =
      path.join(root, file);

    assert.equal(
      fs.existsSync(fullPath),
      true,
      `Missing file: ${file}`
    );

  }

});
