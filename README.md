# @nitishrajuprety/next-fetch-client

[![npm version](https://img.shields.io/npm/v/@nitishrajuprety/next-fetch-client)](https://www.npmjs.com/package/@nitishrajuprety/next-fetch-client)
[![license](https://img.shields.io/npm/l/@nitishrajuprety/next-fetch-client)](https://opensource.org/licenses/MIT)
[![downloads](https://img.shields.io/npm/dm/@nitishrajuprety/next-fetch-client)](https://www.npmjs.com/package/@nitishrajuprety/next-fetch-client)
[![GitHub stars](https://img.shields.io/github/stars/nitishrajuprety/next-fetch-client?style=social)](https://github.com/nitishrajuprety/next-fetch-client/stargazers)

**Axios-like fetch wrapper optimized for Next.js 16 App Router**

- Fully typed with TypeScript
- Supports JSON & FormData
- Interceptors for request & response
- Preserves Next.js caching (`next.revalidate`, `next.tags`)
- Works with npm / pnpm / yarn / bun
- ESM + CJS + `.d.ts` included

---

## 🚀 Installation

```bash
# npm
npm install @nitishrajuprety/next-fetch-client

# pnpm
pnpm add @nitishrajuprety/next-fetch-client

# yarn
yarn add @nitishrajuprety/next-fetch-client

# bun
bun add @nitishrajuprety/next-fetch-client
```

---

## 📦 Usage – Singleton api

```ts
import { api } from '@nitishrajuprety/next-fetch-client';

interface User {
    id: number;
    name: string;
}

// GET request
const users = await api.get<User[]>('/api/users', { next: { revalidate: 60 } });

// POST request
const newUser = await api.post<User, { name: string }>('/api/users', { name: 'Alice' });
```
> Singleton `api` is for quick usage; interceptors are instance-based only.

## 📦 Axios-like Instance – `NextFetchClient`

```ts
import { NextFetchClient } from '@nitishrajuprety/next-fetch-client';

const client = new NextFetchClient({
    baseURL: 'https://api.example.com',
    headers: { 'X-Client': 'next-fetch-client' },
    next: { revalidate: 60 }
});

// GET request
const users = await client.get<User[]>('/users');

// POST request
const newUser = await client.post<User, { name: string }>('/users', { name: 'Bob' });

```
> Useful for multiple API endpoints with shared config like `baseURL`, default headers, or default Next.js caching options.

---

## ⚡ Interceptors

```ts
// Add request & response interceptors
const reqId = client.interceptors.request.use(async (config) => {
    config.headers = { ...config.headers, Authorization: 'Bearer my-token' };
    return config;
});

const resId = client.interceptors.response.use((response) => {
    console.log('Response received:', response);
    return response;
});

// Multiple interceptors supported
client.interceptors.request.use((config) => {
    console.log('Another request interceptor', config);
    return config;
});

// Eject interceptors if needed
client.interceptors.request.eject(reqId);
client.interceptors.response.eject(resId);
```
> Interceptors are per-instance, just like Axios.

---

## 📝 FormData Upload

```ts
const fd = new FormData();
fd.append('file', fileInput.files[0]);

await api.post('/api/upload', fd);
```

> `Content-Type` is automatically handled; no need to set it manually.

---

## 🔧 Next.js Cache Support

```ts
// Singleton api
await api.get<User[]>('/api/users', { next: { revalidate: 120, tags: ['users'] } });
await api.post<User, { name: string }>('/api/users', { name: 'Alice' }, { next: { revalidate: 0 } });

// Instance client
const client = new NextFetchClient({ baseURL: '/api', next: { revalidate: 60 } });
await client.get<User[]>('/users');
```
> Works with ISR revalidation, tags, and no-cache options.

---
## ⚖️ License

MIT &copy; [Nitish Raj Uprety](https://github.com/nitishrajuprety)