# @nitishrajuprety/next-fetch-client

[![npm version](https://img.shields.io/npm/v/@nitishrajuprety/next-fetch-client)](https://www.npmjs.com/package/@nitishrajuprety/next-fetch-client)
[![license](https://img.shields.io/npm/l/@nitishrajuprety/next-fetch-client)](https://opensource.org/licenses/MIT)
[![downloads](https://img.shields.io/npm/dm/@nitishrajuprety/next-fetch-client)](https://www.npmjs.com/package/@nitishrajuprety/next-fetch-client)

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

## 📦 Usage

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

---

## ⚡ Interceptors

```ts
import { setRequestInterceptor, setResponseInterceptor } from '@nitishrajuprety/next-fetch-client';

// Add auth token
setRequestInterceptor(async (config) => ({
  ...config,
  headers: {
    ...config.headers,
    Authorization: `Bearer ${process.env.API_TOKEN}`,
  },
}));

// Transform response globally
setResponseInterceptor<User[]>((users) =>
  users.map(u => ({ ...u, name: u.name.toUpperCase() }))
);
```

---

## 📝 FormData Upload

```ts
const fd = new FormData();
fd.append('file', fileInput.files[0]);

await api.post('/api/upload', fd);
```

> No need to manually set `Content-Type`; automatically handled.

---

## 🔧 Next.js Cache Support

```ts
await api.get<User[]>('/api/users', { next: { revalidate: 120, tags: ['users'] } });
await api.post<User, { name: string }>('/api/users', { name: 'Alice' }, { next: { revalidate: 0 } });
```

---
## ⚖️ License

MIT &copy; [Nitish Raj Uprety](https://github.com/nitishrajuprety)