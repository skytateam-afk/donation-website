/**
 * Search API service
 */
import axios from '../axios'

export const searchApi = {
  /**
   * Search by block number
   */
  async searchByBlockNumber(channelHash: string, blockNumber: number): Promise<any> {
    const response = await axios.get(`/api/block/${channelHash}/${blockNumber}`)
    return response.data.block || response.data
  },

  /**
   * Search by block hash
   */
  async searchByBlockHash(channelHash: string, blockHash: string): Promise<any> {
    const response = await axios.get(`/api/fetchBlockByHash/${channelHash}/${blockHash}`)
    return response.data
  },

  /**
   * Search by transaction ID
   */
  async searchByTransactionId(channelHash: string, txId: string): Promise<any> {
    const response = await axios.get(`/api/transaction/${channelHash}/${txId}`)
    return response.data
  }
}
