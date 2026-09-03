const {
    json,
    readBody,
    load,
    save,
    id,
    auth,
    request,
    server
} = require("../common");


const PORT =
    Number(process.env.PORT || 4004);


const PRODUCT_URL =
    process.env.PRODUCT_URL ||
    "http://localhost:4002";


const PAYMENT_URL =
    process.env.PAYMENT_URL ||
    "http://localhost:4005";


let orders =
    load(
        "orders.json",
        []
    );


server(async (req, res) => {


    // --------------------------------------------------------
    // HEALTH
    // --------------------------------------------------------

    if (req.url === "/health") {

        return json(
            res,
            200,
            {
                service: "order",
                status: "UP"
            }
        );
    }


    // --------------------------------------------------------
    // AUTH
    // --------------------------------------------------------

    const user =
        auth(req);


    if (!user) {

        return json(
            res,
            401,
            {
                error:
                    "unauthorized"
            }
        );
    }


    // --------------------------------------------------------
    // GET ORDERS
    // --------------------------------------------------------

    if (
        req.method === "GET" &&
        req.url === "/orders"
    ) {

        return json(
            res,
            200,
            orders.filter(
                order =>
                    order.userId ===
                    user.sub
            )
        );
    }


    // --------------------------------------------------------
    // CREATE ORDER
    // --------------------------------------------------------

    if (
        req.method === "POST" &&
        req.url === "/orders"
    ) {

        const body =
            await readBody(req);


        const items =
            Array.isArray(body.items)
                ? body.items
                : [];


        if (!items.length) {

            return json(
                res,
                400,
                {
                    error:
                        "items required"
                }
            );
        }


        const details = [];

        let total = 0;


        // ----------------------------------------------------
        // GET PRODUCT DETAILS
        // ----------------------------------------------------

        for (const item of items) {

            const quantity =
                Number(
                    item.quantity
                );


            if (
                !item.productId ||
                !Number.isInteger(
                    quantity
                ) ||
                quantity <= 0
            ) {

                return json(
                    res,
                    400,
                    {
                        error:
                            "invalid items"
                    }
                );
            }


            const result =
                await request(
                    `${PRODUCT_URL}/products/${encodeURIComponent(
                        item.productId
                    )}`
                );


            if (
                result.status !== 200
            ) {

                return json(
                    res,
                    404,
                    {
                        error:
                            "product not found"
                    }
                );
            }


            const product =
                result.body;


            details.push({

                productId:
                    product.id,

                name:
                    product.name,

                price:
                    product.price,

                quantity
            });


            total +=
                product.price *
                quantity;
        }


        total =
            Number(
                total.toFixed(2)
            );


        // ----------------------------------------------------
        // RESERVE INVENTORY
        // ----------------------------------------------------

        const reservation =
            await request(
                `${PRODUCT_URL}/internal/reserve`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            items
                        })
                }
            );


        if (
            reservation.status !== 200
        ) {

            return json(
                res,
                reservation.status,
                reservation.body
            );
        }


        // ----------------------------------------------------
        // CREATE PENDING ORDER
        // ----------------------------------------------------

        const order = {

            id:
                id("ord"),

            userId:
                user.sub,

            items:
                details,

            total,

            status:
                "PENDING",

            createdAt:
                new Date().toISOString()
        };


        // ----------------------------------------------------
        // PAYMENT
        // ----------------------------------------------------

        const payment =
            await request(
                `${PAYMENT_URL}/payments`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            req.headers.authorization ||
                            ""
                    },

                    body:
                        JSON.stringify({
                            orderId:
                                order.id,

                            amount:
                                order.total,

                            cardNumber:
                                body.cardNumber
                        })
                }
            );


        // ----------------------------------------------------
        // PAYMENT FAILED
        // ----------------------------------------------------

        if (
            payment.status !== 200
        ) {

            // Compensation action:
            // return reserved inventory.

            await request(
                `${PRODUCT_URL}/internal/release`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            items
                        })
                }
            );


            order.status =
                "PAYMENT_FAILED";


            orders.push(order);


            save(
                "orders.json",
                orders
            );


            return json(
                res,
                402,
                order
            );
        }


        // ----------------------------------------------------
        // SUCCESS
        // ----------------------------------------------------

        order.status =
            "CONFIRMED";


        order.paymentId =
            payment.body.id;


        orders.push(order);


        save(
            "orders.json",
            orders
        );


        return json(
            res,
            201,
            order
        );
    }


    return json(
        res,
        404,
        {
            error: "not found"
        }
    );

}).listen(
    PORT,
    () =>
        console.log(
            `order-service listening on ${PORT}`
        )
);
