const {
    json,
    readBody,
    load,
    save,
    auth,
    server
} = require("../common");


const PORT =
    Number(process.env.PORT || 4003);


let carts =
    load(
        "carts.json",
        {}
    );


server(async (req, res) => {


    if (req.url === "/health") {

        return json(
            res,
            200,
            {
                service: "cart",
                status: "UP"
            }
        );
    }


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


    carts[user.sub] ??= [];


    // --------------------------------------------------------
    // GET CART
    // --------------------------------------------------------

    if (
        req.method === "GET" &&
        req.url === "/cart"
    ) {

        return json(
            res,
            200,
            {
                items:
                    carts[user.sub]
            }
        );
    }


    // --------------------------------------------------------
    // ADD TO CART
    // --------------------------------------------------------

    if (
        req.method === "POST" &&
        req.url === "/cart/items"
    ) {

        const body =
            await readBody(req);


        const productId =
            String(
                body.productId || ""
            );


        const quantity =
            Number(
                body.quantity || 1
            );


        if (
            !productId ||
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
                        "productId and positive integer quantity required"
                }
            );
        }


        const existing =
            carts[user.sub].find(
                item =>
                    item.productId ===
                    productId
            );


        if (existing) {

            existing.quantity +=
                quantity;

        } else {

            carts[user.sub].push({
                productId,
                quantity
            });
        }


        save(
            "carts.json",
            carts
        );


        return json(
            res,
            201,
            {
                items:
                    carts[user.sub]
            }
        );
    }


    // --------------------------------------------------------
    // CLEAR CART
    // --------------------------------------------------------

    if (
        req.method === "DELETE" &&
        req.url === "/cart"
    ) {

        carts[user.sub] = [];


        save(
            "carts.json",
            carts
        );


        return json(
            res,
            200,
            {
                items: []
            }
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
            `cart-service listening on ${PORT}`
        )
);
