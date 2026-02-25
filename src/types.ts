
/**
 * Represents the standard HTTP methods used in RESTful API requests.
 * This type is a union of the following string literals: 'GET', 'POST', 'PUT', 'PATCH', and 'DELETE'.
 */
export type HttpMethod =
    | 'GET'
    | 'POST'
    | 'PUT'
    | 'PATCH'
    | 'DELETE';

/**
 * Represents the shape of an API error response.
 * @property {string} message - The error message.
 * @property {number} status - The HTTP status code.
 * @property {unknown} data - Additional error data.
 */
export interface ApiErrorShape {
    message: string;
    status: number;
    data?: unknown;
}

/**
 * Represents an error that occurs during API operations.
 * Extends the built-in Error class to include additional metadata.
 */
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
 * Configuration interface for Next.js API route fetching behavior.
 * Provides options to control revalidation intervals and cache tags.
 *
 * @property {number} [revalidate] - Time interval (in seconds) for revalidating data. Defaults to 60 seconds.
 * @property {string[]} [tags] - Array of cache tags associated with the data. Used for targeted cache invalidation.
 */
export interface NextFetchConfig {
    revalidate?: number;
    tags?: string[];
}

/**
 * Configuration interface for HTTP requests.
 *
 * @property {HttpMethod} [method] - HTTP method (e.g., GET, POST).
 * @property {HeadersInit} [headers] - HTTP headers configuration.
 * @property {TBody} [body] - Request body data.
 * @property {RequestCache} [cache] - Cache mode for the request.
 * @property {NextFetchConfig} [next] - Configuration for Next.js fetch handling.
 * @property {RequestCredentials} [credentials] - Credential handling mode.
 * @property {AbortSignal} [signal] - Signal to abort the request.
 *
 * Type parameters:
 * @template TBody - Type of the request body.
 */
export interface RequestConfig<TBody = unknown> {
    method?: HttpMethod;
    headers?: HeadersInit;
    body?: TBody;
    cache?: RequestCache;
    next?: NextFetchConfig;
    credentials?: RequestCredentials;
    signal?: AbortSignal;
}
