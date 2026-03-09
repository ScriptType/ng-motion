import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [
    angular({
      tsconfig: 'projects/ng-motion/tsconfig.spec.json',
    }),
  ],
  test: {
    globals: true,
    include: ['projects/**/*.spec.ts'],
    setupFiles: ['./test-setup.ts'],
    environment: 'jsdom',
  },
});
