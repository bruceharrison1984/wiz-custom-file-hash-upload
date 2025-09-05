import 'isomorphic-fetch';

import { getWizToken } from "./utils/getWizToken.ts";
import { downloadCustomHashFile, getCustomScannerSettings } from "./utils/fetcher.ts";
import { green, red, yellow } from './utils/logger.ts';
import { getEnv } from './utils/getEnv.ts';

const csvFilename = 'wiz_custom_hashes.csv'
const { WIZ_CLIENT_ID, WIZ_CLIENT_SECRET, WIZ_TOKEN_ENDPOINT, WIZ_API_ENDPOINT } = getEnv()

const bearerToken = await getWizToken(WIZ_CLIENT_ID, WIZ_CLIENT_SECRET, WIZ_TOKEN_ENDPOINT);
green(`- Bearer token: ${bearerToken.substring(0, 10)}...`);

//query the current configuration to get the download URL for the existing CSV file
const currentScannerSettingsResp = await getCustomScannerSettings(bearerToken, WIZ_API_ENDPOINT);

if (!currentScannerSettingsResp.data.scannerSettings.customFileDetectionList)
    red('No custom scanner hash file exists!')

await downloadCustomHashFile(currentScannerSettingsResp.data.scannerSettings.customFileDetectionList.url, csvFilename);

yellow('** The existing file has been downloaded and any edits would occur now, before re-uploading **');