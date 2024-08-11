import { generateKeyPairSync } from "crypto";
import fs from "fs";

const { privateKey, publicKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
        type: "pkcs1",
        format: "pem",
    },
    privateKeyEncoding: {
        type: "pkcs1",
        format: "pem",
    },
});

fs.writeFileSync("certs/public.pem", publicKey);
fs.writeFileSync("certs/private.pem", privateKey);
