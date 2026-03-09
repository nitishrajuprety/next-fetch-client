import { ApiError, RequestConfig, SseCallbacks, SseMessage } from './types';

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
    const { method = 'GET', headers, body, ...rest } = config;

    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
    const isBlob = typeof Blob !== 'undefined' && body instanceof Blob;

    try {
        const response = await fetch(url, {
            method,
            headers: {
                'Accept': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                ...(body && !isFormData && !isBlob ? { 'Content-Type': 'application/json' } : {}),
                ...headers,
            },
            body: body == null ? undefined : isFormData || isBlob ? body : JSON.stringify(body),
            ...rest,
        });

        if (!response.ok) { /* ... keep existing error logic ... */ }

        callbacks.onOpen?.(response);

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No readable stream available');

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            // SSE blocks are separated by double newlines
            const blocks = buffer.split('\n\n');
            buffer = blocks.pop() || '';

            for (const block of blocks) {
                if (!block.trim()) continue;

                const message: SseMessage = {};
                const lines = block.split('\n');
                const dataParts: string[] = [];

                for (const line of lines) {
                    const colonIndex = line.indexOf(':');
                    if (colonIndex <= 0) continue; // Skip comments or invalid lines

                    const field = line.slice(0, colonIndex).trim();
                    const value = line.slice(colonIndex + 1).trim();

                    switch (field) {
                        case 'event': message.event = value; break;
                        case 'id':    message.id = value; break;
                        case 'retry': message.retry = parseInt(value, 10); break;
                        case 'data':  dataParts.push(value); break;
                    }
                }

                if (dataParts.length > 0) {
                    message.data = dataParts.join('\n');
                }

                if (Object.keys(message).length > 0) {
                    callbacks.onMessage?.(message);
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