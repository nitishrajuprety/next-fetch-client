export * from './types';
export * from './http';
export * from './config';
export * from './interceptors';

import { http } from './http';
import type { RequestConfig } from './types';
import { NextFetchClient } from './config';

/**
 * A utility class providing HTTP methods for making requests.
 */
export const api = {
    /**
     * Sends a GET request to the specified URL with optional configuration.
     * @param url The URL to send the GET request to.
     * @param config Optional configuration object for the request.
     * @return A Promise that resolves to the response data of type T.
     */
    get<T>(url: string, config?: RequestConfig) {
        return http<T>(url, { ...config, method: 'GET' });
    },

    /**
     * Sends a POST request to the specified URL with the given body and configuration.
     * @param url The URL to send the request to.
     * @param body The request body data.
     * @param config Optional configuration object for the request. If provided, it will be merged with the method and body settings.
     * @return A Promise that resolves to the response data parsed as type T.
     */
    post<T, B = unknown>(url: string, body: B, config?: RequestConfig<B>) {
        return http<T, B>(url, { ...config, method: 'POST', body });
    },

    /**
     * Sends a PUT request to the specified URL with the provided body and configuration.
     * @param url The URL to send the PUT request to.
     * @param body The data to send in the request body.
     * @param config Optional configuration object for the request. May include headers and other settings. The method is set to 'PUT' regardless of this configuration.
     * @return A Promise that resolves to the response data of type T.
     */
    put<T, B = unknown>(url: string, body: B, config?: RequestConfig<B>) {
        return http<T, B>(url, { ...config, method: 'PUT', body });
    },

    /**
     * Sends a PATCH request to the specified URL with the provided body and configuration.
     * @param url The URL to send the PATCH request to.
     * @param body The data to send in the request body.
     * @param config Optional configuration object for the request.
     * @return Returns a promise or value of type T, depending on the http implementation.
     */
    patch<T, B = unknown>(url: string, body: B, config?: RequestConfig<B>) {
        return http<T, B>(url, { ...config, method: 'PATCH', body });
    },

    /**
     * Sends a DELETE request to the specified URL with optional configuration.
     * @param url The API endpoint URL.
     * @param config Optional configuration object for the request.
     * @return A Promise that resolves to the response data of type T.
     */
    delete<T>(url: string, config?: RequestConfig) {
        return http<T>(url, { ...config, method: 'DELETE' });
    },
}

export { NextFetchClient };