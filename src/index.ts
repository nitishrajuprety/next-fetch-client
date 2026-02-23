export * from './types';
export * from './http';
export * from './config';
export * from './interceptors';

import { http } from './http';
import type { RequestConfig } from './types';
import { NextFetchClient } from './config';

/**
 * Default singleton API (basic usage)
 * Interceptors are instance-based now, not global
 */
export const api = {
    get: <T>(url: string, config?: RequestConfig) =>
        http<T>(url, { ...config, method: 'GET' }),

    post: <T, B = unknown>(url: string, body: B, config?: RequestConfig<B>) =>
        http<T, B>(url, { ...config, method: 'POST', body }),

    put: <T, B = unknown>(url: string, body: B, config?: RequestConfig<B>) =>
        http<T, B>(url, { ...config, method: 'PUT', body }),

    patch: <T, B = unknown>(url: string, body: B, config?: RequestConfig<B>) =>
        http<T, B>(url, { ...config, method: 'PATCH', body }),

    delete: <T>(url: string, config?: RequestConfig) =>
        http<T>(url, { ...config, method: 'DELETE' }),
};

// Export the Axios-like client
export { NextFetchClient };