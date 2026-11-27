import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

// Автотести ключової логіки: `npm test`.
export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('.', import.meta.url)) } },
  test: { include: ['tests/**/*.test.ts'], environment: 'node' },
});
