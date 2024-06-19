import * as dotenv from "dotenv/config";

const config = {
    PORT: process.env.PORT,
    DB_URL: process.env.DBUrl,
    LOCAL_DB_URL: process.env.LocalUrl,
    JWT_KEY: process.env.JWT_Key,
    CRYPTO_KEY: process.env.CRYPTO_KEY,
    EMAIL: process.env.EMAIL,
    EMAIL_SECRET_PASS: process.env.EMAIL_SECRET_PASS,
    MAILER_SERVICE: process.env.MAILER_SERVICE,
    MAILER_HOST: process.env.MAILER_HOST,
    MAILER_PORT: process.env.MAILER_PORT,
    FRONTEND_HOST: process.env.FRONTEND_HOST
}

export default config;