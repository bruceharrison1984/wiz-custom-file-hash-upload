import 'isomorphic-fetch';

import { getWizToken } from "./utils/getWizToken.ts";
import { getPresignedUploadUrl, updateCustomScannerSettings, uploadCustomHashFile } from "./utils/fetcher.ts";
import { green } from './utils/logger.ts';
import { getEnv } from './utils/getEnv.ts';

const csvFilename = 'wiz_custom_hashes.csv'
const { WIZ_CLIENT_ID, WIZ_CLIENT_SECRET, WIZ_TOKEN_ENDPOINT, WIZ_API_ENDPOINT } = getEnv()

const bearerToken = await getWizToken(WIZ_CLIENT_ID, WIZ_CLIENT_SECRET, WIZ_TOKEN_ENDPOINT);
green(`- Bearer token: ${bearerToken.substring(0, 10)}...`);

const presignedUploadUrlResp = await getPresignedUploadUrl(bearerToken, WIZ_API_ENDPOINT, csvFilename);
const { id, url } = presignedUploadUrlResp.data.requestScannerSettingsCustomFileDetectionListUpload.upload
green(`- Pre-signed Upload URL: ${url.split('?')[0]}...`);
green(`- New Custom Hash File ID: '${id}'`);

await uploadCustomHashFile(url, csvFilename);
const updateResp = await updateCustomScannerSettings(bearerToken, WIZ_API_ENDPOINT, id);
if (updateResp.errors) console.log(updateResp.errors)