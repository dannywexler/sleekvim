import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [sveltekit(), tailwindcss()],
    preview: {
        port: 4001,
        strictPort: true
    },
    server: {
        port: 4000,
        strictPort: true
    }
});
