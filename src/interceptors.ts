import type { RequestConfig } from './types';

export type RequestInterceptor = (
    config: RequestConfig
) => Promise<RequestConfig> | RequestConfig;

export type ResponseInterceptor<T = any> = (
    response: T
) => Promise<T> | T;

let requestInterceptor: RequestInterceptor | null = null;
let responseInterceptor: ResponseInterceptor<any> | null = null;

export function setRequestInterceptor(fn: RequestInterceptor) {
    requestInterceptor = fn;
}

export function setResponseInterceptor<T>(fn: ResponseInterceptor<T>) {
    responseInterceptor = fn as ResponseInterceptor<any>;
}

/**
 * Run request interceptor
 */
export async function runRequestInterceptor(
    config: RequestConfig
): Promise<RequestConfig> {
    if (!requestInterceptor) return config;
    return requestInterceptor(config);
}

/**
 * Run response interceptor
 * Type-safe: generic T is preserved
 */
export async function runResponseInterceptor<T>(response: T): Promise<T> {
    if (!responseInterceptor) return response;
    // cast to T because interceptor may be typed as any internally
    return (await responseInterceptor(response)) as T;
}