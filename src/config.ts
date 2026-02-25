import { http } from './http';
import type { RequestConfig } from './types';
import { InterceptorManager, Interceptors, RequestInterceptorFn, ResponseInterceptorFn } from './interceptors';

/**
 * Configuration interface for the NextFetchClient.
 *
 * @property {string} [baseURL] - The base URL to prepend to all request URLs.
 * @property {HeadersInit} [headers] - Headers to include in all requests, using the HeadersInit type.
 * @property {RequestConfig['next']} [next] - Configuration object for Next.js-specific request options.
 */
export interface NextFetchClientConfig {
    baseURL?: string;
    headers?: HeadersInit;
    next?: RequestConfig['next'];
}

/**
 * A client for making HTTP requests with support for interceptors and configuration merging.
 * This class provides methods for common HTTP verbs (GET, POST, etc.) and allows customization
 * through configuration and interceptors.
 */
export class NextFetchClient {
    /**
     * Configuration object for the NextFetchClient.
     * This object contains settings used to configure the client's behavior.
     * The exact structure and available options are defined by the NextFetchClientConfig type.
     */
    private config: NextFetchClientConfig;
    /**
     * An array of interceptor functions used to modify or observe the behavior of certain operations.
     * @type {Interceptors}
     */
    public interceptors: Interceptors;

    /**
     * @param {NextFetchClientConfig} [config] - Configuration object for the client. Defaults to an empty object.
     * @return {void}
     */
    constructor(config: NextFetchClientConfig = {}) {
        this.config = config;
        this.interceptors = {
            request: new InterceptorManager<RequestInterceptorFn>(),
            response: new InterceptorManager<ResponseInterceptorFn>(),
        };
    }

    /**
     * Merges the provided configuration with the instance's configuration.
     * @param config Optional configuration object to merge with the instance's configuration.
     * @return A new configuration object with merged headers and next property.
     */
    private mergeConfig<TBody>(config?: RequestConfig<TBody>): RequestConfig<TBody> {
        return {
            ...config,
            headers: {
                ...(this.config.headers || {}),
                ...(config?.headers || {}),
            },
            next: config?.next ?? this.config.next,
        };
    }

    /**
     * @param {string} url The URL to send the request to.
     * @param {RequestConfig<B>} config The configuration object for the request.
     * @return {Promise<T>} A promise that resolves to the response data of type T after processing through interceptors.
     */
    private async request<T, B = unknown>(url: string, config: RequestConfig<B>): Promise<T> {
        // Run request interceptors
        const finalConfig = await this.interceptors.request.run(this.mergeConfig(config));

        const response = await http<T, B>(
            this.getFullURL(url),
            finalConfig
        );

        // Run response interceptors
        return this.interceptors.response.run(response) as Promise<T>;
    }

    /**
     * Sends a GET request to the specified URL with optional configuration and query parameters.
     * @param url The base URL for the request.
     * @param config Optional configuration object for the request.
     * @param params Optional query parameters to append to the URL as a query string.
     * @return A promise that resolves to the response data of type T.
     */
    get<T>(url: string, config?: RequestConfig, params?: Record<string, string | number | boolean>) {
        let finalUrl = url;

        if (params) {
            const qs = new URLSearchParams(
                Object.entries(params).reduce((acc, [k, v]) => {
                    acc[k] = v.toString();
                    return acc;
                }, {} as Record<string, string>)
            ).toString();

            finalUrl += url.includes('?') ? '&' + qs : '?' + qs;
        }

        return this.request<T>(finalUrl, { ...config, method: 'GET' });
    }

    /**
     * Sends a DELETE request to the specified URL.
     * @param url The URL to send the request to.
     * @param config Optional configuration object for the request.
     * @return A Promise that resolves to the response data of type T.
     */
    delete<T>(url: string, config?: RequestConfig) {
        return this.request<T>(url, { ...config, method: 'DELETE' });
    }

    /**
     * Sends a POST request to the specified URL with the given body and configuration.
     * @param url The URL to send the request to.
     * @param body The data to send as the request body.
     * @param config Optional configuration object for the request.
     * @return A Promise that resolves to the response data of type T.
     */
    post<T, B = unknown>(url: string, body: B, config?: RequestConfig<B>) {
        return this.request<T, B>(url, { ...config, method: 'POST', body });
    }

    /**
     * Sends a PUT request to the specified URL with the provided body and configuration.
     * @param url The URL to send the request to.
     * @param body The data to send in the request body.
     * @param config Optional configuration object for the request.
     * @return A Promise that resolves to the response data of type T.
     */
    put<T, B = unknown>(url: string, body: B, config?: RequestConfig<B>) {
        return this.request<T, B>(url, { ...config, method: 'PUT', body });
    }

    /**
     * Sends a PATCH request to the specified URL with the provided body and configuration.
     * @param url The URL to send the request to.
     * @param body The data to send in the request body.
     * @param config Optional configuration object for the request.
     * @return A Promise that resolves to the response data of type T.
     */
    patch<T, B = unknown>(url: string, body: B, config?: RequestConfig<B>) {
        return this.request<T, B>(url, { ...config, method: 'PATCH', body });
    }

    /**
     * Constructs the full URL by combining the provided URL with the base URL from configuration.
     * @param url The relative or absolute path to be combined with the base URL.
     * @return The fully constructed URL. If the input URL is absolute, it is returned as-is. Otherwise, it is combined with the base URL.
     */
    private getFullURL(url: string) {
        if (!this.config.baseURL) return url;
        return url.startsWith('http') ? url : `${this.config.baseURL.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
    }
}