const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DATA = path.join(process.cwd(), "data");

fs.mkdirSync(DATA, {
    recursive: true
});


// ============================================================
// JSON RESPONSE
// ============================================================

function json(res, status, body) {

    res.writeHead(status, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store"
    });

    res.end(JSON.stringify(body));
}


// ============================================================
// REQUEST BODY
// ============================================================

function readBody(req) {

    return new Promise((resolve, reject) => {

        let raw = "";

        req.on("data", chunk => {

            raw += chunk;

            if (raw.length > 1024 * 1024) {

                req.destroy();

                reject(
                    new Error("request body too large")
                );
            }
        });

        req.on("end", () => {

            if (!raw) {
                return resolve({});
            }

            try {

                resolve(JSON.parse(raw));

            } catch {

                reject(
                    new Error("invalid JSON")
                );
            }
        });

        req.on("error", reject);
    });
}


// ============================================================
// LOAD JSON
// ============================================================

function load(name, fallback) {

    try {

        return JSON.parse(
            fs.readFileSync(
                path.join(DATA, name),
                "utf8"
            )
        );

    } catch {

        return fallback;
    }
}


// ============================================================
// SAVE JSON
// ============================================================

function save(name, value) {

    const file = path.join(DATA, name);

    const temporaryFile = `${file}.tmp`;

    fs.writeFileSync(
        temporaryFile,
        JSON.stringify(value, null, 2)
    );

    fs.renameSync(
        temporaryFile,
        file
    );
}


// ============================================================
// ID
// ============================================================

function id(prefix) {

    return `${prefix}_${crypto.randomUUID()}`;
}


// ============================================================
// PASSWORD HASH
// ============================================================

function hash(password) {

    const salt =
        crypto.randomBytes(16).toString("hex");

    const digest =
        crypto.scryptSync(
            password,
            salt,
            64
        ).toString("hex");

    return `${salt}:${digest}`;
}


// ============================================================
// PASSWORD VERIFY
// ============================================================

function verify(password, encoded) {

    try {

        const [salt, digest] =
            String(encoded).split(":");

        if (!salt || !digest) {
            return false;
        }

        const actual =
            crypto.scryptSync(
                password,
                salt,
                64
            ).toString("hex");

        return crypto.timingSafeEqual(
            Buffer.from(actual, "hex"),
            Buffer.from(digest, "hex")
        );

    } catch {

        return false;
    }
}


// ============================================================
// BASE64 URL
// ============================================================

function b64(value) {

    return Buffer
        .from(JSON.stringify(value))
        .toString("base64url");
}


// ============================================================
// JWT SIGN
// ============================================================

function sign(payload, secret) {

    const header =
        b64({
            alg: "HS256",
            typ: "JWT"
        });

    const body =
        b64(payload);

    const signature =
        crypto
            .createHmac(
                "sha256",
                secret
            )
            .update(`${header}.${body}`)
            .digest("base64url");

    return `${header}.${body}.${signature}`;
}


// ============================================================
// JWT VERIFY
// ============================================================

function verifyJwt(token, secret) {

    try {

        const parts =
            String(token).split(".");

        if (parts.length !== 3) {
            return null;
        }

        const [
            header,
            body,
            signature
        ] = parts;

        const expected =
            crypto
                .createHmac(
                    "sha256",
                    secret
                )
                .update(`${header}.${body}`)
                .digest("base64url");

        if (
            signature.length !== expected.length ||
            !crypto.timingSafeEqual(
                Buffer.from(signature),
                Buffer.from(expected)
            )
        ) {

            return null;
        }

        const payload =
            JSON.parse(
                Buffer
                    .from(body, "base64url")
                    .toString("utf8")
            );

        if (
            payload.exp &&
            Math.floor(Date.now() / 1000)
                >= payload.exp
        ) {

            return null;
        }

        return payload;

    } catch {

        return null;
    }
}


// ============================================================
// AUTH MIDDLEWARE
// ============================================================

function auth(req) {

    const value =
        req.headers.authorization || "";

    if (!value.startsWith("Bearer ")) {
        return null;
    }

    return verifyJwt(
        value.substring(7),
        process.env.JWT_SECRET ||
        "shopsphere-local-secret"
    );
}


// ============================================================
// HTTP REQUEST BETWEEN SERVICES
// ============================================================

async function request(url, options = {}) {

    const response =
        await fetch(url, options);

    const text =
        await response.text();

    let body;

    try {

        body = text
            ? JSON.parse(text)
            : {};

    } catch {

        body = {
            raw: text
        };
    }

    return {
        status: response.status,
        body
    };
}


// ============================================================
// SERVER WRAPPER
// ============================================================

function server(handler) {

    return http.createServer(
        async (req, res) => {

            try {

                await handler(req, res);

            } catch (error) {

                console.error(error);

                json(
                    res,
                    500,
                    {
                        error:
                            error.message ||
                            "internal server error"
                    }
                );
            }
        }
    );
}


module.exports = {
    json,
    readBody,
    load,
    save,
    id,
    hash,
    verify,
    sign,
    auth,
    request,
    server
};
