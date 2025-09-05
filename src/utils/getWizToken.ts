import { blue } from './logger.ts';

/**
 * Retrieve a Wiz access token based on service account credentials
 * @param clientId wiz client id
 * @param clientSecret wiz client secret
 * @param tokenEndpoint the token endpoint that should be used
 * @returns plain access token string
 */
export const getWizToken = async (clientId: string, clientSecret: string, tokenEndpoint: string) => {
    const payload = new URLSearchParams({
        'grant_type': 'client_credentials',
        'client_id': clientId,
        'client_secret': clientSecret,
        'audience': 'wiz-api'
    }).toString();

    blue(`- Getting a Wiz API token from ${tokenEndpoint}`)
    const resp = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: payload
    });

    if (!resp.ok) throw `Failed to get a token! \nError: '${await resp.text()} - ${resp.status}'`;

    const token = (await resp.json()).access_token;
    return token as string;
}