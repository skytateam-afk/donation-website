/**
 * Blocks API service
 */
import axios from '../axios'

export const blocksApi = {
  /**
   * Get paginated list of blocks
   */
  async getBlockList(channelHash: string, page: number = 1, pageSize: number = 10): Promise<any> {
    const response = await axios.get(`/api/blockAndTxList/${channelHash}/${page}/${pageSize}`)
    return response.data
  },

  /**
   * Get block by number
   */
  async getBlockByNumber(channelHash: string, blockNumber: number): Promise<any> {
    const response = await axios.get(`/api/block/${channelHash}/${blockNumber}`)
    return response.data
  },

  /**
   * Get block by hash
   */
  async getBlockByHash(channelHash: string, blockHash: string): Promise<any> {
    const response = await axios.get(`/api/fetchBlockByHash/${channelHash}/${blockHash}`)
    return response.data
  },

  /**
   * Get transactions in a block
   */
  async getBlockTransactions(channelHash: string, blockNumber: number): Promise<any> {
    // Use txList endpoint with blocknum filter to get transactions for a specific block
    const response = await axios.get(`/api/txList/${channelHash}/${blockNumber}/0`)
    return response.data
  },

  /**
   * Get transaction by ID
   */
  async getTransactionById(channelHash: string, txId: string): Promise<any> {
    const response = await axios.get(`/api/transaction/${channelHash}/${txId}`)
    return response.data
  }
}
