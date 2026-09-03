const {
    json,
    readBody,
    load,
    save,
    id,
    auth,
    server
} = require("../common");


const PORT =
    Number(process.env.PORT || 4005);


let payments =
    load(
        "payments.json",
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
                service: "payment",
                status: "UP"
            }
        );
    }


    // --------------------------------------------------------
    // PAYMENT
    // --------------------------------------------------------

    if (
        req.method === "POST" &&
        req.url === "/payments"
    ) {

        if (!auth(req)) {

            return json(
                res,
                401,
                {
                    error:
                        "unauthorized"
                }
            );
        }


        const body =
            await readBody(req);


        const amount =
            Number(body.amount);


        if (
            !body.orderId ||
            !Number.isFinite(amount) ||
            amount <= 0
        ) {

            return json(
                res,
                400,
                {
                    error:
                        "orderId and valid amount required"
                }
            );
        }


        /*
         * DEMO ONLY
         *
         * Any card ending in 0000 fails.
         */

        const cardNumber =
            String(
                body.cardNumber || ""
            );


        const status =
            cardNumber.endsWith("0000")
                ? "FAILED"
                : "SUCCESS";


        const payment = {

            id: id("pay"),

            orderId:
                body.orderId,

            amount,

            status,

            createdAt:
                new Date().toISOString()
        };


        payments.push(payment);


        save(
            "payments.json",
            payments
        );


        return json(
            res,
            status === "SUCCESS"
                ? 200
                : 402,
            payment
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
            `payment-service listening on ${PORT}`
        )
);
