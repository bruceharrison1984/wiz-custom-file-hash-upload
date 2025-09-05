import dotenv from 'dotenv';
dotenv.config({ quiet: true });
import { env } from "node:process";

export const getEnv = () => {
    const WIZ_CLIENT_ID = env.WIZ_CLIENT_ID as string
    if (!WIZ_CLIENT_ID) throw "envvar WIZ_CLIENT_ID must be set!"

    const WIZ_CLIENT_SECRET = env.WIZ_CLIENT_SECRET as string
    if (!WIZ_CLIENT_SECRET) throw "envvar WIZ_CLIENT_SECRET must be set!"

    const WIZ_API_ENDPOINT = env.WIZ_API_ENDPOINT as string
    if (!WIZ_API_ENDPOINT) throw "envvar WIZ_API_ENDPOINT must be set!"

    const WIZ_TOKEN_ENDPOINT = env.WIZ_TOKEN_ENDPOINT
    if (!WIZ_TOKEN_ENDPOINT) throw "envvar WIZ_TOKEN_ENDPOINT must be set!"

    return {
        WIZ_CLIENT_ID,
        WIZ_CLIENT_SECRET,
        WIZ_API_ENDPOINT,
        WIZ_TOKEN_ENDPOINT,
    }
}