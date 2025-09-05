export interface CustomScannerSettings {
    data: {
        scannerSettings: ScannerSettings
    },
    errors: Errors[]
}

export interface UpdateCustomScannerSettings {
    data: {
        updateScannerSettings: ScannerSettings
    }
    errors: Errors[]
}

interface Errors {
    message: string,
    path: string[],
    extensions: Record<string, string>
}

interface ScannerSettings {
    computeResourceGroupMemberScanSamplingEnabled: boolean
    prioritizeActiveComputeResourceGroupMembers: boolean
    maxComputeResourceGroupMemberScanCount: number
    customFileDetectionList: {
        id: string
        url: string
        name: string
        fileDetectionCount: number
    }
    excludedComputeResourceGroupNativeTypes: any
    containerHostSampling: {
        enabled: boolean
        excludedScope: any
        includedScope: any
    }
}