import axios from '../axios'

export const channelsApi = {
  async getChannelsInfo(): Promise<any> {
    const response = await axios.get('/api/channels/info')
    return response.data
  },

  async getPeerStatus(channelName: string): Promise<any> {
    const response = await axios.get(`/api/peersStatus/${channelName}`)
    return response.data
  }
}
