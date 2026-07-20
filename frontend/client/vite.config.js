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

// Keep this source in sync with the script-src hash in deploy/nginx-travelgo.conf.
const deferredHomeLoaderSource = "(()=>{const entry=document.currentScript.dataset.entry;let loaded=false;const load=()=>{if(loaded||!entry)return;loaded=true;import(entry);};const path=location.pathname.replace(/\\/$/,\"\")||\"/\";if(path===\"/\"||path===\"/home\"){[\"pointermove\",\"pointerdown\",\"touchstart\",\"keydown\",\"wheel\",\"focusin\"].forEach((eventName)=>addEventListener(eventName,load,{once:true,passive:true}));}else{load();}})();";

const deferHomeEntryScript = () => ({
    name: "defer-home-entry-script",
    apply: "build",
    enforce: "post",
    generateBundle(_options, bundle) {
        const htmlAsset = bundle["index.html"];

        if (!htmlAsset || typeof htmlAsset.source !== "string") {
            return;
        }

        let entryFileName;

        htmlAsset.source = htmlAsset.source.replace(
            /<script type="module" crossorigin src="\/([^"]+\.js)"><\/script>/,
            (tag, fileName) => {
                entryFileName = fileName;

                return tag;
            }
        );

        if (!entryFileName) {
            return;
        }

        htmlAsset.source = htmlAsset.source
            .replace(
                /\s*<link rel="modulepreload" crossorigin href="\/assets\/[^"]+">/g,
                ""
            )
            .replace(
                /<script type="module" crossorigin src="\/[^"]+\.js"><\/script>/,
                `<script data-entry="/${entryFileName}">${deferredHomeLoaderSource}</script>`
            );
    }
});

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        inlineEntryCss(),
        deferHomeEntryScript()
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
