export * from './types';
export * from './interceptors';
export * from './http';

import { http } from './http';
import type { RequestConfig } from './types';

/**
 * Axios-like API surface, fully typed
 */
export const api = {
    get: <T>(
        url: string,
        config?: RequestConfig
    ): Promise<T> =>
        http<T>(url, { ...config, method: 'GET' }),

    post: <T, B = unknown>(
        url: string,
        body: B,
        config?: RequestConfig<B>
    ): Promise<T> =>
        http<T, B>(url, { ...config, method: 'POST', body }),

    put: <T, B = unknown>(
        url: string,
        body: B,
        config?: RequestConfig<B>
    ): Promise<T> =>
        http<T, B>(url, { ...config, method: 'PUT', body }),

    patch: <T, B = unknown>(
        url: string,
        body: B,
        config?: RequestConfig<B>
    ): Promise<T> =>
        http<T, B>(url, { ...config, method: 'PATCH', body }),

    delete: <T>(
        url: string,
        config?: RequestConfig
    ): Promise<T> =>
        http<T>(url, { ...config, method: 'DELETE' }),
};