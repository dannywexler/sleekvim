import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [sveltekit(), tailwindcss()],
    preview: {
        port: 3001,
        strictPort: true
    },
    server: {
        port: 3000,
        strictPort: true
    }
});
