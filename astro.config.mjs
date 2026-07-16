import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'http://192.168.1.4:8800',
  base: '/staging-web',
  output: 'static',
});
