import { build } from 'esbuild';

await build({
  entryPoints: ['src/client/index.ts'],
  bundle: true,
  format: 'iife',
  platform: 'browser',
  outfile: 'client.js',
  external: ['react', '@deepseek-ai/dsh-client-ui-primitives'],
  logLevel: 'info',
});
