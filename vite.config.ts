import { sveltekit } from "@sveltejs/kit/vite"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"

export default defineConfig({
    plugins: [sveltekit(), tailwindcss()],
    preview: {
        port: 3001,
        strictPort: true,
    },
    server: {
        port: 3000,
        strictPort: true,
    },
})
