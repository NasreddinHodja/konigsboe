import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { orgPlugin } from './src/lib/org-plugin';

export default defineConfig({ plugins: [tailwindcss(), sveltekit(), orgPlugin()] });
