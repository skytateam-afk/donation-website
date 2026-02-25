import apiClient from './axios'

export interface PackageChaincodeRequest {
  chaincodeName: string
  version: string
  chaincodeType?: 'golang' | 'node' | 'java'
}

export interface InstallChaincodeRequest {
  packageName: string
  organizations?: string[]
}

export interface ApproveChaincodeRequest {
  channelName: string
  chaincodeName: string
  version: string
  packageId: string
  sequence: number
  organizations?: string[]
}

export interface CommitChaincodeRequest {
  channelName: string
  chaincodeName: string
  version: string
  sequence: number
}

export interface DeployChaincodeRequest {
  chaincodeName: string
  version: string
  channelName: string
  chaincodeType?: 'golang' | 'node' | 'java'
  sequence?: number
  initLedger?: boolean
}

export interface InitializeLedgerRequest {
  channelName: string
  chaincodeName: string
}

export interface InvokeChaincodeRequest {
  channelName: string
  chaincodeName: string
  functionName: string
  args?: string[]
}

export interface QueryChaincodeRequest {
  channelName: string
  chaincodeName: string
  functionName: string
  args?: string[]
}

export const chaincodeManagementApi = {
  /**
   * Upload chaincode source code
   */
  uploadChaincode: async (file: File, chaincodeName: string) => {
    const formData = new FormData()
    formData.append('chaincode', file)
    formData.append('chaincodeName', chaincodeName)
    
    const response = await apiClient.post('/api/chaincode-management/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  /**
   * Package chaincode
   */
  packageChaincode: async (data: PackageChaincodeRequest) => {
    const response = await apiClient.post('/api/chaincode-management/package', data)
    return response.data
  },

  /**
   * Install chaincode on peers
   */
  installChaincode: async (data: InstallChaincodeRequest) => {
    const response = await apiClient.post('/api/chaincode-management/install', data)
    return response.data
  },

  /**
   * Approve chaincode for organization
   */
  approveChaincode: async (data: ApproveChaincodeRequest) => {
    const response = await apiClient.post('/api/chaincode-management/approve', data)
    return response.data
  },

  /**
   * Commit chaincode definition to channel
   */
  commitChaincode: async (data: CommitChaincodeRequest) => {
    const response = await apiClient.post('/api/chaincode-management/commit', data)
    return response.data
  },

  /**
   * Deploy chaincode (complete flow)
   */
  deployChaincode: async (data: DeployChaincodeRequest) => {
    const response = await apiClient.post('/api/chaincode-management/deploy', data)
    return response.data
  },

  /**
   * Initialize chaincode ledger
   */
  initializeLedger: async (data: InitializeLedgerRequest) => {
    const response = await apiClient.post('/api/chaincode-management/initialize', data)
    return response.data
  },

  /**
   * Get installed chaincodes
   */
  getInstalledChaincodes: async () => {
    const response = await apiClient.get('/api/chaincode-management/installed')
    return response.data
  },

  /**
   * Get committed chaincodes on a channel
   */
  getCommittedChaincodes: async (channel: string) => {
    const response = await apiClient.get(`/api/chaincode-management/committed/${channel}`)
    return response.data
  },

  /**
   * Get chaincode definition
   */
  getChaincodeDefinition: async (channel: string, chaincode: string) => {
    const response = await apiClient.get(`/api/chaincode-management/definition/${channel}/${chaincode}`)
    return response.data
  },

  /**
   * Check commit readiness
   */
  checkCommitReadiness: async (channel: string, chaincode: string, version: string, sequence: number) => {
    const response = await apiClient.get(
      `/api/chaincode-management/check-commit-readiness/${channel}/${chaincode}`,
      { params: { version, sequence } }
    )
    return response.data
  },

  /**
   * Invoke chaincode
   */
  invokeChaincode: async (data: InvokeChaincodeRequest) => {
    const response = await apiClient.post('/api/chaincode-management/invoke', data)
    return response.data
  },

  /**
   * Query chaincode
   */
  queryChaincode: async (data: QueryChaincodeRequest) => {
    const response = await apiClient.post('/api/chaincode-management/query', data)
    return response.data
  }
}
