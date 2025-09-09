## custom-file-hash-upload
This script facilitates downloading, updating, and re-uploading the file hash list for the custom scanner. It demonstrates all steps of the process. In this example we simply re-upload the same file, but in practice you would alter the file after download, then reupload it.

## Usage
```bash
## .env file
export WIZ_CLIENT_ID="<client_id>"
export WIZ_CLIENT_SECRET="<client_secret>"
export WIZ_API_ENDPOINT="<api-endpoint>" 
export WIZ_TOKEN_ENDPOINT="<token-endpoint>"

npm install
npm run download ## download the current hashes from Wiz
npm run upload ## upload the local hashes file contained in wiz_custom_hashes.csv
```

## Steps
- Download:
  - Current settings are retrieved via a `scannerSettings` request
    - A pre-signed download url is contained in `data.scannerSettings.customFileDetectionList.url`
- Upload:
  - A new presigned url is created via a `requestScannerSettingsCustomFileDetectionListUpload` request
  - The file is uploaded to the presigned url via `PUT` (backend is S3)
  - The custom scanner settings are updated with the presigned url information via a `updateScannerSettings` request
    - This request includes in the new hash file id recieved when the pre-signed url was generated.

## Python
There is an additional example written in python in `python/custom-hash-api.py`