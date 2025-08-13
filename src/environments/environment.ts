export const environment = {
  apiBaseUrl: (window as any)._env?.API_BASE_URL || 'https://localhost:7102/properties',
  tenantApiBaseUrl: (window as any)._env?.TENANT_API_BASE_URL || 'https://localhost:7102/tenants',
  fileHandlerApiBaseUrl: (window as any)._env?.FILE_HANDLER_API_BASE_URL || 'http://35.207.12.140:5000/files',
  bookingApiBaseUrl: (window as any)._env?.BOOKING_API_BASE_URL || 'https://localhost:7160',
  paymentApiBaseUrl: (window as any)._env?.PAYMENT_API_BASE_URL || 'https://localhost:7299',
  accessApiBaseUrl: (window as any)._env?.ACCESS_API_BASE_URL || 'https://localhost:7102/access',
};
