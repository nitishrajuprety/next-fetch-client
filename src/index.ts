export * from './types';
export * from './interceptors';
export * from './http';
export * from './config'; // Export the instance class

import { http } from './http';
import type { RequestConfig } from './types';
import { NextFetchClient } from './config';

/**
 * Singleton API (default)
 * Works like api.get/post/put/delete
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

/**
 * Export NextFetchClient class for Axios-like instance usage
 * Example:
 *
 * const client = new NextFetchClient({ baseURL: '/api', headers: { Authorization: 'Bearer ...' } });
 * client.get<User[]>('/users');
 */
export { NextFetchClient };