import { ApiError, RequestConfig, SseCallbacks } from './types';

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

/**
 * Initiates an SSE (Server-Sent Events) connection and reads the stream.
 * @param url The URL to connect to.
 * @param callbacks Object containing onMessage, onOpen, onError, and onClose handlers.
 * @param config Optional request configuration.
 */
export async function httpSse(
    url: string,
    callbacks: SseCallbacks,
    config: RequestConfig<unknown> = {}
): Promise<void> {
    // 1. Destructure body so we can handle it manually
    const { method = 'GET', headers, body, ...rest } = config;

    // 2. Identify body type (logic mirrored from your http function)
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
    const isBlob = typeof Blob !== 'undefined' && body instanceof Blob;

    try {
        const response = await fetch(url, {
            method,
            headers: {
                'Accept': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                // Add Content-Type if there is a body that isn't FormData/Blob
                ...(body && !isFormData && !isBlob ? { 'Content-Type': 'application/json' } : {}),
                ...headers,
            },
            // 3. Attach the body correctly
            body: body == null ? undefined : isFormData || isBlob ? body : JSON.stringify(body),
            ...rest,
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new ApiError({
                message: response.statusText || 'SSE request failed',
                status: response.status,
                data: errorData,
            });
        }

        callbacks.onOpen?.(response);

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No readable stream available');

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.startsWith('data:')) {
                    const data = line.replace(/^data:\s*/, '').trim();
                    if (data) callbacks.onMessage?.(data);
                }
            }
        }
        callbacks.onClose?.();
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            callbacks.onClose?.();
        } else {
            callbacks.onError?.(error);
        }
    }
}