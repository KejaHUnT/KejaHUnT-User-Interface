export interface AddGatewayConfigDto {
  accountId: string;
  gateway: string;
  configJson: string;
}

export interface ApiMessageResponse {
  message: string;
}

export interface PaystackConfig {
  publicKey: string;
  secretKey: string;
  callbackUrl: string;
}

export interface GatewayConfigDetailsResponse {
  accountId: string;
  gateway: string;
  config: PaystackConfig;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string | null;
}