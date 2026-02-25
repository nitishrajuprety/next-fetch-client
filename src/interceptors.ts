import type { RequestConfig } from './types';

/**
 * A function type that intercepts and modifies a request configuration before it is sent.
 * The function can either return a modified RequestConfig object synchronously or
 * a Promise that resolves to a RequestConfig object asynchronously.
 * This allows for dynamic modification of request parameters, headers, or other configuration properties.
 *
 * @param {RequestConfig} config - The request configuration object to be intercepted and potentially modified.
 * @returns {RequestConfig | Promise<RequestConfig>} The modified request configuration object or a Promise resolving to it.
 */
export type RequestInterceptorFn = (
    config: RequestConfig
) => RequestConfig | Promise<RequestConfig>;

/**
 * A function type used to intercept and process responses.
 * It receives a response object and returns the same object or a Promise resolving to it.
 * Typically used in HTTP clients to modify, transform, or handle responses asynchronously.
 *
 * @template T The type of the response object.
 * @param {T} response The response object to be intercepted.
 * @returns {T | Promise<T>} The processed response object or a Promise that resolves to it.
 */
export type ResponseInterceptorFn<T = any> = (
    response: T
) => T | Promise<T>;

/**
 * Represents an interceptor with a unique identifier and a fulfilled action.
 * @template T The type of the fulfilled action or result.
 */
interface Interceptor<T> {
    id: number;
    fulfilled: T;
}

/**
 * Manages a list of interceptors, allowing registration, removal, and execution of interceptors in sequence.
 * @class
 * @template T
 */
export class InterceptorManager<T> {
    /**
     * Array of interceptors used to process values of type T.
     * Each interceptor is a function that takes a value of type T and returns a modified value.
     * The interceptors are applied in the order they appear in the array.
     * @template T The type of the value being processed by the interceptors.
     */
    private interceptors: Interceptor<T>[] = [];
    /**
     * Counter variable initialized to 0.
     * @type {number}
     */
    private counter = 0;

    /**
     * Registers a fulfilled handler for the interceptor.
     * @param fulfilled The handler function to be executed when the operation is fulfilled.
     * @return The ID assigned to the interceptor.
     */
    use(fulfilled: T): number {
        const id = this.counter++;
        this.interceptors.push({ id, fulfilled });
        return id;
    }

    /**
     * Removes the interceptor with the specified ID from the interceptors array.
     * @param id The ID of the interceptor to be removed.
     * @return void
     */
    eject(id: number) {
        this.interceptors = this.interceptors.filter((i) => i.id !== id);
    }

    /**
     * Executes the provided argument through a series of interceptors, applying each interceptor's fulfilled handler sequentially.
     * @param arg - The input argument to be processed. This can be any type as it is passed through interceptors.
     * @return A Promise that resolves to the final result after all interceptors have been applied.
     */
    async run(arg: any): Promise<any> {
        let result = arg;
        for (const interceptor of this.interceptors) {
            result = await (interceptor.fulfilled as any)(result);
        }
        return result;
    }
}

/**
 * Interface representing interceptors for managing request and response interceptors.
 *
 * @property {InterceptorManager<RequestInterceptorFn>} request - Manages interceptors for modifying request configurations before they are sent.
 * @property {InterceptorManager<ResponseInterceptorFn>} response - Manages interceptors for handling responses after they are received.
 */
export interface Interceptors {
    request: InterceptorManager<RequestInterceptorFn>;
    response: InterceptorManager<ResponseInterceptorFn>;
}