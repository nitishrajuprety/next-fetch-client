import { ApiError, RequestConfig } from './types';
import { runRequestInterceptor, runResponseInterceptor } from './interceptors';

/**
 * Core HTTP function
 */
export async function http<TResponse = unknown, TBody = unknown>(
    url: string,
    config: RequestConfig<TBody> = {}
): Promise<TResponse> {
    // Apply request interceptor
    const finalConfig = await runRequestInterceptor(config);

    const { method = 'GET', headers, body, ...rest } = finalConfig;

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
        ...rest, // preserves Next.js cache options
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

    // Cast parsed to TResponse here, and then pass to interceptor
    const typedResponse = parsed as TResponse;

    return runResponseInterceptor<TResponse>(typedResponse);
}