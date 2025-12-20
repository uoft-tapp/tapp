import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import Checker from "vite-plugin-checker";

export default defineConfig({
    plugins: [react(), Checker({ typescript: true })],
    server: {
        host: "0.0.0.0",
        port: 8000,
        proxy: {
            "/api": "http://backend:3000",
            "/public": "http://backend:3000",
            "/debug": "http://backend:3000",
            "/hash": "http://backend:3000",
        },
    },
    build: {
        outDir: "build", // CRA's default build output
    },
    test: {
        globals: true,
    },
});
