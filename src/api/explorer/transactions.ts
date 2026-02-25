/**
 * Transactions API service
 */
import axios from '../axios'

export const transactionsApi = {
  /**
   * Get paginated list of transactions with optional filters
   * Note: The API expects /api/txList/{channel}/{page}/{pageSize}
   */
  async getTransactionList(
    channelHash: string, 
    page: number = 0, 
    pageSize: number = 10,
    filters?: Record<string, any>
  ): Promise<any> {
    const response = await axios.get(`/api/txList/${channelHash}/${page}/${pageSize}`, {
      params: filters
    })
    return response.data
  },

  /**
   * Get transaction by ID
   * Note: The API returns { status: 200, transaction: {...} }
   */
  async getTransactionById(channelHash: string, txId: string): Promise<any> {
    const response = await axios.get(`/api/transaction/${channelHash}/${txId}`)
    return response.data
  }
}
