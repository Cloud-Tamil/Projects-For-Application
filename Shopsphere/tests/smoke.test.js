const test =
  require("node:test");

const assert =
  require("node:assert/strict");

const base =
  process.env.BASE_URL ||
  "http://localhost:8080";

test(
  "gateway health endpoint",
  async () => {

    const response =
      await fetch(
        `${base}/health`
      );

    assert.equal(
      response.status,
      200
    );

    const data =
      await response.json();

    assert.equal(
      data.status,
      "UP"
    );
  }
);
