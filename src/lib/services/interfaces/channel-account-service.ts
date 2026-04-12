export type SupportedChannel = 'whatsapp' | 'telegram'

export interface ChannelAccount {
  channel: SupportedChannel
  channelAccountId: string | null
  maskedToken: string | null
  status: string
  connectedAt: string
}

export interface ConnectChannelParams {
  channel: SupportedChannel
  access_token: string
}

export interface IChannelAccountService {
  list(): Promise<ChannelAccount[]>
  connect(params: ConnectChannelParams): Promise<ChannelAccount>
  disconnect(channel: SupportedChannel): Promise<void>
}
