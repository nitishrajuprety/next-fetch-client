import { http } from './http';
import type { RequestConfig } from './types';
import { InterceptorManager, Interceptors, RequestInterceptorFn, ResponseInterceptorFn } from './interceptors';

export interface NextFetchClientConfig {
    baseURL?: string;
    headers?: HeadersInit;
    next?: RequestConfig['next'];
}

export class NextFetchClient {
    private config: NextFetchClientConfig;
    public interceptors: Interceptors;

    constructor(config: NextFetchClientConfig = {}) {
        this.config = config;
        this.interceptors = {
            request: new InterceptorManager<RequestInterceptorFn>(),
            response: new InterceptorManager<ResponseInterceptorFn>(),
        };
    }

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

    get<T>(url: string, config?: RequestConfig) {
        return this.request<T>(url, { ...config, method: 'GET' });
    }

    delete<T>(url: string, config?: RequestConfig) {
        return this.request<T>(url, { ...config, method: 'DELETE' });
    }

    post<T, B = unknown>(url: string, body: B, config?: RequestConfig<B>) {
        return this.request<T, B>(url, { ...config, method: 'POST', body });
    }

    put<T, B = unknown>(url: string, body: B, config?: RequestConfig<B>) {
        return this.request<T, B>(url, { ...config, method: 'PUT', body });
    }

    patch<T, B = unknown>(url: string, body: B, config?: RequestConfig<B>) {
        return this.request<T, B>(url, { ...config, method: 'PATCH', body });
    }

    private getFullURL(url: string) {
        if (!this.config.baseURL) return url;
        return url.startsWith('http') ? url : `${this.config.baseURL.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
    }
}