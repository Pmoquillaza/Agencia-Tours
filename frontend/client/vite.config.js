import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [
        react(),
        tailwindcss()
    ],
    build: {
        cssCodeSplit: true,
        sourcemap: false,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (!id.includes("node_modules")) {
                        return undefined;
                    }

                    if (id.includes("@stripe")) {
                        return "stripe";
                    }

                    if (id.includes("react-router-dom")) {
                        return "router";
                    }

                    if (
                        id.includes("react-dom") ||
                        id.includes("react/")
                    ) {
                        return "react-vendor";
                    }

                    if (id.includes("axios")) {
                        return "api-vendor";
                    }

                    return "vendor";
                }
            }
        }
    }
});
