import { RequestConfig } from './types';
import { http } from './http';

export interface NextFetchClientConfig {
    baseURL?: string;
    headers?: HeadersInit;
    next?: RequestConfig['next'];
}

export class NextFetchClient {
    private config: NextFetchClientConfig;

    constructor(config: NextFetchClientConfig = {}) {
        this.config = config;
    }

    private mergeConfig<TBody>(
        config?: RequestConfig<TBody>
    ): RequestConfig<TBody> {
        return {
            ...config,
            headers: {
                ...(this.config.headers || {}),
                ...(config?.headers || {}),
            },
            next: config?.next ?? this.config.next,
        };
    }

    get<T>(url: string, config?: RequestConfig) {
        return http<T>(this.getFullURL(url), { ...this.mergeConfig(config), method: 'GET' });
    }

    delete<T>(url: string, config?: RequestConfig) {
        return http<T>(this.getFullURL(url), { ...this.mergeConfig(config), method: 'DELETE' });
    }

    post<T, B = unknown>(url: string, body: B, config?: RequestConfig<B>) {
        return http<T, B>(this.getFullURL(url), { ...this.mergeConfig(config), method: 'POST', body });
    }

    put<T, B = unknown>(url: string, body: B, config?: RequestConfig<B>) {
        return http<T, B>(this.getFullURL(url), { ...this.mergeConfig(config), method: 'PUT', body });
    }

    patch<T, B = unknown>(url: string, body: B, config?: RequestConfig<B>) {
        return http<T, B>(this.getFullURL(url), { ...this.mergeConfig(config), method: 'PATCH', body });
    }

    private getFullURL(url: string) {
        if (!this.config.baseURL) return url;
        return url.startsWith('http') ? url : `${this.config.baseURL.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
    }
}