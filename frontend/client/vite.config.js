import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const inlineEntryCss = () => ({
    name: "inline-entry-css",
    apply: "build",
    enforce: "post",
    generateBundle(_options, bundle) {
        const htmlAsset = bundle["index.html"];

        if (!htmlAsset || typeof htmlAsset.source !== "string") {
            return;
        }

        htmlAsset.source = htmlAsset.source.replace(
            /<link rel="stylesheet" crossorigin href="\/([^"]+\.css)">/,
            (tag, fileName) => {
                const cssAsset = bundle[fileName];

                if (!cssAsset || cssAsset.type !== "asset") {
                    return tag;
                }

                delete bundle[fileName];

                return `<style>${cssAsset.source}</style>`;
            }
        );
    }
});

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        inlineEntryCss()
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
