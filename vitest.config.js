import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: 'jsdom',
        setupFiles: './src/setupTests.js',
    },
    esbuild: {
        jsx: "automatic", // Allows JSX without importing React
    }
});