export const environment = {
  apiBaseUrl:
    (window as any)._env?.API_BASE_URL ||
    'https://gateway.kejahunt.co.ke/properties',
  tenantApiBaseUrl:
    (window as any)._env?.TENANT_API_BASE_URL ||
    'https://gateway.kejahunt.co.ke/tenants',

  bookingApiBaseUrl:
    (window as any)._env?.BOOKING_API_BASE_URL ||
    'https://gateway.kejahunt.co.ke/booking',
  paymentApiBaseUrl:
    (window as any)._env?.PAYMENT_API_BASE_URL ||
    'https://gateway.kejahunt.co.ke/payments',
  accessApiBaseUrl:
    (window as any)._env?.ACCESS_API_BASE_URL ||
    'https://gateway.kejahunt.co.ke/access',
  paymentCallbackUrl:
    (window as any)._env?.PAYMENT_CALLBACK_URL ||
    'http://localhost:5000/api/payments/callback',
};
