const http = require("http");
const fs = require("fs");
const path = require("path");


const PORT =
    Number(
        process.env.PORT || 18080
    );


// ============================================================
// ROUTES
// ============================================================

const routes = {

    auth: {
        env: "AUTH_URL"
    },

    products: {
        env: "PRODUCT_URL"
    },

    cart: {
        env: "CART_URL"
    },

    orders: {
        env: "ORDER_URL"
    },

    payments: {
        env: "PAYMENT_URL"
    }
};


// ============================================================
// FIND TARGET
// ============================================================

function routeTarget(req) {

    for (
        const [
            name,
            config
        ] of Object.entries(routes)
    ) {

        const root =
            `/api/${name}`;


        if (
            req.url === root ||
            req.url.startsWith(
                `${root}/`
            )
        ) {

            return {

                base:
                    process.env[
                        config.env
                    ],

                path:
                    req.url.substring(
                        root.length
                    )
            };
        }
    }


    return null;
}


// ============================================================
// PROXY
// ============================================================

function proxy(req, res) {

    const target =
        routeTarget(req);


    if (
        !target ||
        !target.base
    ) {

        return false;
    }


    const url =
        new URL(
            target.base +
            target.path
        );


    const options = {

        method:
            req.method,

        headers: {
            ...req.headers,

            host:
                url.host
        }
    };


    const upstream =
        http.request(
            url,
            options,
            response => {

                res.writeHead(
                    response.statusCode,
                    response.headers
                );

                response.pipe(res);
            }
        );


    upstream.on(
        "error",
        error => {

            if (!res.headersSent) {

                res.writeHead(
                    502,
                    {
                        "Content-Type":
                            "application/json"
                    }
                );
            }


            res.end(
                JSON.stringify({
                    error:
                        `upstream unavailable: ${error.message}`
                })
            );
        }
    );


    req.pipe(upstream);

    return true;
}


// ============================================================
// STATIC FRONTEND
// ============================================================

function serveFrontend(req, res) {

    const requested =
        req.url === "/"
            ? "/frontend/index.html"
            : `/frontend${req.url}`;


    const root =
        path.resolve(
            process.cwd()
        );


    const frontendRoot =
        path.resolve(
            root,
            "frontend"
        );


    const file =
        path.resolve(
            root,
            `.${requested}`
        );


    // Prevent path traversal.
    if (
        file !== frontendRoot &&
        !file.startsWith(
            frontendRoot +
            path.sep
        )
    ) {

        return false;
    }


    if (
        !fs.existsSync(file) ||
        !fs.statSync(file).isFile()
    ) {

        return false;
    }


    const ext =
        path.extname(file);


    let contentType =
        "application/octet-stream";


    if (ext === ".html") {

        contentType =
            "text/html; charset=utf-8";

    } else if (ext === ".js") {

        contentType =
            "text/javascript; charset=utf-8";

    } else if (ext === ".css") {

        contentType =
            "text/css; charset=utf-8";
    }


    res.writeHead(
        200,
        {
            "Content-Type":
                contentType
        }
    );


    fs.createReadStream(
        file
    ).pipe(res);


    return true;
}


// ============================================================
// SERVER
// ============================================================

http.createServer(
    (req, res) => {


        // Gateway health
        if (
            req.url === "/health"
        ) {

            res.writeHead(
                200,
                {
                    "Content-Type":
                        "application/json"
                }
            );


            return res.end(
                JSON.stringify({
                    service:
                        "gateway",

                    status:
                        "UP"
                })
            );
        }


        // API proxy
        if (
            proxy(
                req,
                res
            )
        ) {

            return;
        }


        // Frontend
        if (
            serveFrontend(
                req,
                res
            )
        ) {

            return;
        }


        // 404
        res.writeHead(
            404,
            {
                "Content-Type":
                    "application/json"
            }
        );


        res.end(
            JSON.stringify({
                error:
                    "not found"
            })
        );

    }
).listen(
    PORT,
    () =>
        console.log(
            `gateway listening on ${PORT}`
        )
);
