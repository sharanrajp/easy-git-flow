import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  const plugins: any[] = [react()]
  
  if (mode === 'development') {
    try {
      const { componentTagger } = await import("lovable-tagger")
      const taggerPlugin = componentTagger()
      if (Array.isArray(taggerPlugin)) {
        plugins.push(...taggerPlugin)
      } else if (taggerPlugin) {
        plugins.push(taggerPlugin)
      }
    } catch (error) {
      console.warn('Failed to load lovable-tagger:', error)
    }
  }

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
  }
})