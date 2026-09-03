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
    Number(process.env.PORT || 4002);


let products =
    load(
        "products.json",
        [
            {
                id: "prd_1001",
                name: "Laptop Pro 14",
                price: 1299.99,
                stock: 10
            },
            {
                id: "prd_1002",
                name: "Wireless Headphones",
                price: 149.99,
                stock: 25
            },
            {
                id: "prd_1003",
                name: "Mechanical Keyboard",
                price: 89.99,
                stock: 40
            },
            {
                id: "prd_1004",
                name: "4K Monitor",
                price: 399.99,
                stock: 15
            }
        ]
    );


// Persist initial catalogue if this is first startup.
save(
    "products.json",
    products
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
                service: "product",
                status: "UP"
            }
        );
    }


    // --------------------------------------------------------
    // GET PRODUCTS
    // --------------------------------------------------------

    if (
        req.method === "GET" &&
        req.url === "/products"
    ) {

        return json(
            res,
            200,
            products
        );
    }


    // --------------------------------------------------------
    // GET PRODUCT
    // --------------------------------------------------------

    const match =
        req.url.match(
            /^\/products\/([^/]+)$/
        );


    if (
        req.method === "GET" &&
        match
    ) {

        const product =
            products.find(
                item =>
                    item.id === match[1]
            );


        if (!product) {

            return json(
                res,
                404,
                {
                    error:
                        "product not found"
                }
            );
        }


        return json(
            res,
            200,
            product
        );
    }


    // --------------------------------------------------------
    // CREATE PRODUCT
    // --------------------------------------------------------

    if (
        req.method === "POST" &&
        req.url === "/products"
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


        const product = {

            id: id("prd"),

            name:
                String(
                    body.name ||
                    "Unnamed product"
                ),

            price:
                Number(body.price),

            stock:
                Number(
                    body.stock || 0
                )
        };


        if (
            !Number.isFinite(
                product.price
            ) ||
            product.price < 0 ||
            !Number.isInteger(
                product.stock
            ) ||
            product.stock < 0
        ) {

            return json(
                res,
                400,
                {
                    error:
                        "invalid price/stock"
                }
            );
        }


        products.push(product);

        save(
            "products.json",
            products
        );


        return json(
            res,
            201,
            product
        );
    }


    // --------------------------------------------------------
    // RESERVE INVENTORY
    // --------------------------------------------------------

    if (
        req.method === "POST" &&
        req.url === "/internal/reserve"
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


        const needed =
            new Map();


        for (const item of items) {

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

                return json(
                    res,
                    400,
                    {
                        error:
                            "invalid items"
                    }
                );
            }


            needed.set(
                productId,

                (needed.get(productId) || 0)
                    + quantity
            );
        }


        // Validate everything first.
        for (
            const [
                productId,
                quantity
            ] of needed
        ) {

            const product =
                products.find(
                    p =>
                        p.id === productId
                );


            if (!product) {

                return json(
                    res,
                    404,
                    {
                        error:
                            `product not found: ${productId}`
                    }
                );
            }


            if (
                product.stock < quantity
            ) {

                return json(
                    res,
                    409,
                    {
                        error:
                            `insufficient stock: ${product.name}`
                    }
                );
            }
        }


        // Reserve.
        for (
            const [
                productId,
                quantity
            ] of needed
        ) {

            const product =
                products.find(
                    p =>
                        p.id === productId
                );

            product.stock -= quantity;
        }


        save(
            "products.json",
            products
        );


        return json(
            res,
            200,
            {
                reserved: true
            }
        );
    }


    // --------------------------------------------------------
    // RELEASE INVENTORY
    // --------------------------------------------------------

    if (
        req.method === "POST" &&
        req.url === "/internal/release"
    ) {

        const body =
            await readBody(req);


        const items =
            Array.isArray(body.items)
                ? body.items
                : [];


        for (const item of items) {

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


        return json(
            res,
            200,
            {
                released: true
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
            `product-service listening on ${PORT}`
        )
);
