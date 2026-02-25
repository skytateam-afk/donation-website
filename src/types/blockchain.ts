/**
 * TypeScript type definitions for Hyperledger Fabric Blockchain Explorer
 */

// Dashboard Statistics
export interface DashboardStats {
  latestBlock: number
  txCount: number
  peerCount: number
  chaincodeCount: number
}

// Block
export interface Block {
  blocknum: number
  datahash: string
  prehash: string
  txcount: number
  createdt: string
  prev_blockhash: string
  blockhash: string
  channelname: string
  txhash: string[]
}

export interface BlockActivity {
  blocknum: number
  createdt: string
  txcount: number
  datahash: string
  blockhash: string
  channelname: string
}

// Transaction
export interface Transaction {
  txhash: string
  createdt: string
  chaincodename: string
  channelname: string
  blockid: number
  status: number
  creator_msp_id: string
  endorser_msp_id: string
  type: string
  read_set: Record<string, any>
  write_set: Record<string, any>
  validation_code: string
  payload_proposal_hash: string
  payload_extension: string
}

export interface TransactionList {
  rows: Transaction[]
  count: number
}

// Peer
export interface Peer {
  server_hostname: string
  requests: string
  channel_genesis_hash: string
  peer_type: string
  mspid: string
  ledger_height_low: string
  ledger_height_high: string
  status: string
}

export interface PeerStatus {
  peers: Peer[]
}

// Channel
export interface Channel {
  id: number
  name: string
  blocks: number
  trans: number
  createdat: string
  channel_hash: string
  channel_genesis_hash: string
}

export interface ChannelInfo {
  channelname: string
  channel_genesis_hash: string
  blocks: number
  transactions: number
  createdat: string
}

// Chaincode
export interface Chaincode {
  chaincodename: string
  channelName: string
  path: string
  txCount: number
  version: string
  source: string
}

export interface ChaincodeMetadata {
  chaincodename: string
  version: string
  path: string
  input: string
  output: string
}

// Chart Data
export interface ChartDataPoint {
  datetime: string
  count: number
}

export interface TransactionByOrg {
  creator_msp_id: string
  count: number
}

// Search Results
export interface SearchResult {
  type: 'block' | 'transaction'
  data: Block | Transaction
}

// API Response Types
export interface ApiResponse<T = any> {
  status: number
  success?: boolean
  message?: string
  data?: T
  error?: string
}

// Authentication
export interface LoginCredentials {
  user: string
  password: string
  network: string
}

export interface LoginResponse {
  success: boolean
  token: string
  message?: string
  user: {
    id: string
    username: string
    email: string
    role: string
    message?: string
  }
}

export interface User {
  id?: string
  username: string
  email?: string
  role?: string
  networkName: string
  firstName?: string
  lastName?: string
  institution?: string
}

export interface RegisterUser {
  user: string
  password: string
  affiliation: string
  roles: string
}

// Network
export interface Network {
  name: string
  id: string
}

// WebSocket Message
export interface WebSocketMessage {
  type: 'block' | 'transaction' | 'notification'
  data: any
}

// Notification
export interface Notification {
  title: string
  type: 'block' | 'transaction' | 'info' | 'error'
  time: string
  txcount?: number
  datahash?: string
  blockhash?: string
  channelName?: string
}

// Filter and Pagination
export interface PaginationParams {
  page: number
  pageSize: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface FilterParams {
  channelHash: string
  startDate?: string
  endDate?: string
  searchTerm?: string
}
