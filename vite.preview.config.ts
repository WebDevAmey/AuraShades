// Builds a single-file, client-only preview of the site (memory history, no SSR).
import { defineConfig } from 'vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'
import path from 'node:path'

export default defineConfig({
  root: 'preview',
  resolve: { tsconfigPaths: true },
  plugins: [
    {
      name: 'preview-root',
      enforce: 'pre',
      resolveId(id, importer) {
        if (id === './routes/__root' && importer?.endsWith('routeTree.gen.ts')) return path.resolve('preview/root.tsx')
      },
    },
    tailwindcss(),
    viteReact(),
    viteSingleFile(),
  ],
  build: { outDir: '../dist-preview', emptyOutDir: true, assetsInlineLimit: 100_000_000 },
})
