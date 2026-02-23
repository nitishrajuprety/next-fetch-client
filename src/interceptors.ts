import type { RequestConfig } from './types';

export type RequestInterceptorFn = (
    config: RequestConfig
) => RequestConfig | Promise<RequestConfig>;

export type ResponseInterceptorFn<T = any> = (
    response: T
) => T | Promise<T>;

interface Interceptor<T> {
    id: number;
    fulfilled: T;
}

export class InterceptorManager<T> {
    private interceptors: Interceptor<T>[] = [];
    private counter = 0;

    use(fulfilled: T): number {
        const id = this.counter++;
        this.interceptors.push({ id, fulfilled });
        return id;
    }

    eject(id: number) {
        this.interceptors = this.interceptors.filter((i) => i.id !== id);
    }

    async run(arg: any): Promise<any> {
        let result = arg;
        for (const interceptor of this.interceptors) {
            result = await (interceptor.fulfilled as any)(result);
        }
        return result;
    }
}

// Export a type for instance interceptors
export interface Interceptors {
    request: InterceptorManager<RequestInterceptorFn>;
    response: InterceptorManager<ResponseInterceptorFn>;
}