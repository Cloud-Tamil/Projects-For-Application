const {
    json,
    readBody,
    load,
    save,
    id,
    hash,
    verify,
    sign,
    server
} = require("../common");


const PORT =
    Number(process.env.PORT || 4001);


const JWT_SECRET =
    process.env.JWT_SECRET ||
    "shopsphere-local-secret";


let users =
    load("auth.json", []);


// ============================================================
// SERVER
// ============================================================

server(async (req, res) => {


    // --------------------------------------------------------
    // HEALTH
    // --------------------------------------------------------

    if (req.url === "/health") {

        return json(
            res,
            200,
            {
                service: "auth",
                status: "UP"
            }
        );
    }


    // --------------------------------------------------------
    // REGISTER
    // --------------------------------------------------------

    if (
        req.method === "POST" &&
        req.url === "/register"
    ) {

        const body =
            await readBody(req);


        const email =
            String(
                body.email || ""
            )
                .trim()
                .toLowerCase();


        const password =
            String(
                body.password || ""
            );


        if (
            !email ||
            password.length < 6
        ) {

            return json(
                res,
                400,
                {
                    error:
                        "email and password (min 6 chars) required"
                }
            );
        }


        if (
            users.some(
                user =>
                    user.email === email
            )
        ) {

            return json(
                res,
                409,
                {
                    error:
                        "email exists"
                }
            );
        }


        const user = {

            id: id("usr"),

            email,

            password:
                hash(password),

            name:
                String(
                    body.name ||
                    email
                ),

            role: "CUSTOMER"
        };


        users.push(user);

        save(
            "auth.json",
            users
        );


        return json(
            res,
            201,
            {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        );
    }


    // --------------------------------------------------------
    // LOGIN
    // --------------------------------------------------------

    if (
        req.method === "POST" &&
        req.url === "/login"
    ) {

        const body =
            await readBody(req);


        const email =
            String(
                body.email || ""
            )
                .trim()
                .toLowerCase();


        const user =
            users.find(
                item =>
                    item.email === email
            );


        if (
            !user ||
            !verify(
                String(
                    body.password || ""
                ),
                user.password
            )
        ) {

            return json(
                res,
                401,
                {
                    error:
                        "invalid credentials"
                }
            );
        }


        const token =
            sign(
                {
                    sub: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,

                    exp:
                        Math.floor(
                            Date.now() / 1000
                        ) + 86400
                },

                JWT_SECRET
            );


        return json(
            res,
            200,
            {
                token
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
            `auth-service listening on ${PORT}`
        )
);
