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
const users = await api.get<User[]>('/api/users', {
  next: { revalidate: 60 },
});

// POST request
const newUser = await api.post<User, { name: string }>('/api/users', {
  name: 'Nitish',
});
```
> Quick usage when no base URL or default headers are needed.

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
const newUser = await client.post<User, { name: string }>('/users', { name: 'Alice' });

```
> Useful for multiple API endpoints with shared config like `baseURL`, default headers, or default Next.js caching options.

---

## ⚡ Interceptors

```ts
import { setRequestInterceptor, setResponseInterceptor } from '@nitishrajuprety/next-fetch-client';

// Request interceptor – add auth token
setRequestInterceptor(async (config) => ({
    ...config,
    headers: {
        ...config.headers,
        Authorization: `Bearer ${process.env.API_TOKEN}`,
    },
}));

// Response interceptor – transform responses globally
setResponseInterceptor<User[]>((users) =>
    users.map(u => ({ ...u, name: u.name.toUpperCase() }))
);
```
> Interceptors apply to both singleton `api` and any `NextFetchClient` instance.

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