import { ApiError, RequestConfig } from './types';

/**
 * Sends an HTTP request to the specified URL with the given configuration.
 * @param url The URL to send the request to.
 * @param config The configuration object for the request. Contains method, headers, body, and additional options.
 * @return A Promise that resolves to the parsed response data of type TResponse. Rejects with an ApiError if the request fails.
 */
export async function http<TResponse = unknown, TBody = unknown>(
    url: string,
    config: RequestConfig<TBody> = {}
): Promise<TResponse> {
    const { method = 'GET', headers, body, ...rest } = config;

    const isFormData =
        typeof FormData !== 'undefined' && body instanceof FormData;
    const isBlob = typeof Blob !== 'undefined' && body instanceof Blob;

    const response = await fetch(url, {
        method,
        headers: {
            ...(isFormData || isBlob
                ? {}
                : body
                    ? { 'Content-Type': 'application/json' }
                    : {}),
            ...headers,
        },
        body:
            body == null
                ? undefined
                : isFormData || isBlob
                    ? body
                    : JSON.stringify(body),
        ...rest,
    });

    const contentType = response.headers.get('content-type');

    let parsed: unknown;
    if (contentType?.includes('application/json')) {
        parsed = await response.json();
    } else {
        parsed = await response.text();
    }

    if (!response.ok) {
        throw new ApiError({
            message:
                (parsed as any)?.message || response.statusText || 'Request failed',
            status: response.status,
            data: parsed,
        });
    }

    return parsed as TResponse;
}