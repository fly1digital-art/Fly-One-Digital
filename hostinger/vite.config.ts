import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/postcss';
import path from 'node:path';
export default defineConfig({
 root:path.resolve(import.meta.dirname,'..'),
 plugins:[react()],publicDir:false,
 resolve:{alias:{'@':path.resolve(import.meta.dirname,'..')}},
 css:{postcss:{plugins:[tailwindcss()]}},
 build:{outDir:'webassets',emptyOutDir:true,manifest:true,sourcemap:false,
 rollupOptions:{input:'hostinger/main.tsx',output:{entryFileNames:'app-[hash].js',chunkFileNames:'chunk-[hash].js',assetFileNames:'[name]-[hash][extname]'}}}
});
