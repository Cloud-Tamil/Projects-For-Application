const test =
    require("node:test");

const assert =
    require("node:assert/strict");


const BASE =
    process.env.BASE_URL ||
    "http://localhost:18080";


async function api(
    path,
    options = {}
) {

    const response =
        await fetch(
            BASE + path,
            options
        );


    const body =
        await response
            .json()
            .catch(
                () => ({})
            );


    return {
        status:
            response.status,

        body
    };
}


// ============================================================
// GATEWAY
// ============================================================

test(
    "gateway health",
    async () => {

        const result =
            await api(
                "/health"
            );


        assert.equal(
            result.status,
            200
        );


        assert.equal(
            result.body.status,
            "UP"
        );
    }
);


// ============================================================
// SERVICES
// ============================================================

test(
    "microservice health checks",
    async () => {

        const services = [
            "auth",
            "products",
            "cart",
            "orders",
            "payments"
        ];


        for (
            const service
            of services
        ) {

            const result =
                await api(
                    `/api/${service}/health`
                );


            assert.equal(
                result.status,
                200,
                service
            );


            assert.equal(
                result.body.status,
                "UP",
                service
            );
        }
    }
);


// ============================================================
// PRODUCTS
// ============================================================

test(
    "product listing",
    async () => {

        const result =
            await api(
                "/api/products"
            );


        assert.equal(
            result.status,
            200
        );


        assert.ok(
            Array.isArray(
                result.body
            )
        );


        assert.ok(
            result.body.length >= 1
        );
    }
);


// ============================================================
// REGISTER + LOGIN + CART + ORDER
// ============================================================

test(
    "complete successful purchase flow",
    async () => {

        const email =
            `test-${Date.now()}@example.com`;


        // Register
        let result =
            await api(
                "/api/auth/register",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            email,

                            password:
                                "Password123!",

                            name:
                                "Integration Tester"
                        })
                }
            );


        assert.equal(
            result.status,
            201
        );


        // Login
        result =
            await api(
                "/api/auth/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            email,

                            password:
                                "Password123!"
                        })
                }
            );


        assert.equal(
            result.status,
            200
        );


        assert.ok(
            result.body.token
        );


        const token =
            result.body.token;


        // Add to cart
        result =
            await api(
                "/api/cart/items",
                {
                    method: "POST",

                    headers: {

                        Authorization:
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            productId:
                                "prd_1003",

                            quantity: 1
                        })
                }
            );


        assert.equal(
            result.status,
            201
        );


        // Create order
        result =
            await api(
                "/api/orders",
                {
                    method: "POST",

                    headers: {

                        Authorization:
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            items: [
                                {
                                    productId:
                                        "prd_1003",

                                    quantity: 1
                                }
                            ],

                            cardNumber:
                                "4111111111111111"
                        })
                }
            );


        assert.equal(
            result.status,
            201
        );


        assert.equal(
            result.body.status,
            "CONFIRMED"
        );
    }
);


// ============================================================
// PAYMENT FAILURE / COMPENSATION
// ============================================================

test(
    "failed payment releases inventory",
    async () => {

        const email =
            `fail-${Date.now()}@example.com`;


        // Register
        let result =
            await api(
                "/api/auth/register",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            email,

                            password:
                                "Password123!"
                        })
                }
            );


        assert.equal(
            result.status,
            201
        );


        // Login
        result =
            await api(
                "/api/auth/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            email,

                            password:
                                "Password123!"
                        })
                }
            );


        const token =
            result.body.token;


        // Check inventory
        result =
            await api(
                "/api/products/prd_1004"
            );


        const beforeStock =
            result.body.stock;


        // Force payment failure.
        // Demo rule: card ending in 0000.
        result =
            await api(
                "/api/orders",
                {
                    method: "POST",

                    headers: {

                        Authorization:
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            items: [
                                {
                                    productId:
                                        "prd_1004",

                                    quantity: 1
                                }
                            ],

                            cardNumber:
                                "4000000000000000"
                        })
                }
            );


        assert.equal(
            result.status,
            402
        );


        assert.equal(
            result.body.status,
            "PAYMENT_FAILED"
        );


        // Verify compensation.
        result =
            await api(
                "/api/products/prd_1004"
            );


        assert.equal(
            result.body.stock,
            beforeStock
        );
    }
);
