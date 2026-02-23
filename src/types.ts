export type HttpMethod =
    | 'GET'
    | 'POST'
    | 'PUT'
    | 'PATCH'
    | 'DELETE';

export interface ApiErrorShape {
    message: string;
    status: number;
    data?: unknown;
}

export class ApiError extends Error {
    status: number;
    data?: unknown;

    constructor({ message, status, data }: ApiErrorShape) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}

/**
 * We do NOT directly import Next.js types
 * to avoid making it a dependency.
 * This keeps the package framework-agnostic.
 */
export interface NextFetchConfig {
    revalidate?: number;
    tags?: string[];
}

export interface RequestConfig<TBody = unknown> {
    method?: HttpMethod;
    headers?: HeadersInit;
    body?: TBody;
    cache?: RequestCache;
    next?: NextFetchConfig;
    credentials?: RequestCredentials;
    signal?: AbortSignal;
}