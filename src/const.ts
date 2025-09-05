export const WIZ_COMMERCIAL_TOKEN_ENDPOINT = "https://auth.app.wiz.io/oauth/token"
export const GET_PRESIGNED_URL = `
query RequestFileDetectionUploadURL($filename: String!) {
  requestScannerSettingsCustomFileDetectionListUpload(filename: $filename) {
    upload {
      id
      url
    }
  }
}`;

export const GET_CUSTOM_SCANNER_SETTINGS = `
query LoadScanningSamplingSettings {
  scannerSettings {
    computeResourceGroupMemberScanSamplingEnabled
    prioritizeActiveComputeResourceGroupMembers
    maxComputeResourceGroupMemberScanCount
    customFileDetectionList {
      id
      url
      name
      fileDetectionCount
    }
    excludedComputeResourceGroupNativeTypes
    containerHostSampling {
      enabled
      excludedScope {
        regions
        cloudAccountIds
        projectIds
      }
      includedScope {
        regions
        cloudAccountIds
        projectIds
      }
    }
  }
}`;

export const UPDATE_CUSTOM_SCANNER_SETTINGS = `
mutation UpdateScannerSamplingSettings($input: UpdateScannerSettingsInput!) {
  updateScannerSettings(input: $input) {
    scannerSettings {
      computeResourceGroupMemberScanSamplingEnabled
      prioritizeActiveComputeResourceGroupMembers
      maxComputeResourceGroupMemberScanCount
      customFileDetectionList {
        id
        url
        name
        fileDetectionCount
      }
      excludedComputeResourceGroupNativeTypes
      containerHostSampling {
        enabled
        excludedScope {
          regions
          cloudAccountIds
          projectIds
        }
        includedScope {
          regions
          cloudAccountIds
          projectIds
        }
      }
    }
  }
}`;