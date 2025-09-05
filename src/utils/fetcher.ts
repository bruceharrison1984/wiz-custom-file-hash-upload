import { GET_CUSTOM_SCANNER_SETTINGS, GET_PRESIGNED_URL, UPDATE_CUSTOM_SCANNER_SETTINGS } from '../const.ts';
import { CustomScannerSettings, UpdateCustomScannerSettings } from '../types/CustomScannerSettings.ts';
import { createWriteStream, openAsBlob } from 'node:fs';
import { pipeline } from 'node:stream';
import { promisify } from 'node:util';
import { PresignedUrl } from '../types/PresignedUrl.ts';
import { blue, green } from './logger.ts';

/** generic fetcher for wiz endpoints */
const wizFetch = async <T>(apiToken: string, apiEndpoint: string, query: string, variables: Record<string, any> = {}) => {
  const resp = await fetch(apiEndpoint, {
    method: 'POST',
    headers: {
      'Authorization': ['Bearer', apiToken].join(' '),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query,
      variables
    })
  });

  if (!resp.ok) throw `GraphQL query failed! \nError: '${await resp.text()} - ${resp.status}'`;

  const jsonResult = await resp.json();
  return jsonResult as T;
}

/** This will request a new pre-signed URL from Wiz that can be used to upload the file */
export const getPresignedUploadUrl = async (apiToken: string, apiEndpoint: string, filename: string) => {
  blue("- Getting pre-signed upload URL");
  return wizFetch<PresignedUrl>(apiToken, apiEndpoint, GET_PRESIGNED_URL, {
    filename
  })
}

/** Get the existing custom scanner settings */
export const getCustomScannerSettings = async (apiToken: string, apiEndpoint: string) => {
  blue("- Getting custom scanner configuration");
  return wizFetch<CustomScannerSettings>(apiToken, apiEndpoint, GET_CUSTOM_SCANNER_SETTINGS)
}

/** Get the existing custom scanner settings */
export const updateCustomScannerSettings = async (apiToken: string, apiEndpoint: string, hashFileId: string) => {
  blue("- Update custom scanner hash configuration");
  return wizFetch<UpdateCustomScannerSettings>(apiToken, apiEndpoint, UPDATE_CUSTOM_SCANNER_SETTINGS, {
    input: {
      patch: {
        customFileDetectionListUploadId: hashFileId
      }
    }
  })
}

/** Clear the existing custom scanner hash settings */
export const clearCustomScannerSettings = async (apiToken: string, apiEndpoint: string) => {
  blue("- Clear custom scanner configuration");
  return wizFetch<UpdateCustomScannerSettings>(apiToken, apiEndpoint, UPDATE_CUSTOM_SCANNER_SETTINGS, {
    input: {
      patch: {
        customFileDetectionListUploadId: ""
      }
    }
  })
}

/** Download the current Custom Hash file from a URL. This is just a standard file download, and isn't Wiz specific */
export const downloadCustomHashFile = async (fileUrl: string, filename: string) => {
  const response = await fetch(fileUrl);
  if (!response.ok) throw new Error(`Failed to download: ${response.statusText}`);

  await promisify(pipeline)(response.body!, createWriteStream(filename));
  green(`- File downloaded successfully to ${filename}`);
}

/**
 * Upload a custom hash file
 * 
 * @param fileUrl The pre-signed URL to upload the file to
 * @param filename The local file name
 */
export const uploadCustomHashFile = async (fileUrl: string, filename: string) => {
  blue("- Upload custom hash file");
  const fileBlob = await openAsBlob(filename, { type: 'text/csv' })

  const resp = await fetch(fileUrl, {
    headers: {
      'Content-Type': 'text/csv',
    },
    method: 'PUT',
    body: fileBlob, // upload is just a blob body, no form-data needed
  });

  if (!resp.ok) throw `File upload failed! \nError: '${await resp.text()} - ${resp.status}'`;

  green('- Upload successful');
}