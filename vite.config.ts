import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    tailwindcss(),
    tanstackStart({
      prerender: {
        enabled: true,
        crawlLinks: true,
        // Only canonical pages: filtered library views, #anchors and trailing-slash twins are the same documents.
        filter: ({ path }) => !path.includes('?') && !path.includes('#') && (path === '/' || !path.endsWith('/')),
      },
    }),
    nitro(),
    viteReact(),
  ],
})
