import axios from '../axios'

export const chaincodesApi = {
  async getChaincodeList(channelHash: string): Promise<any> {
    const response = await axios.get(`/api/chaincode/${channelHash}`)
    return response.data
  }
}
