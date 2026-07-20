import React from 'react'
import ReactDOM from 'react-dom/client'

import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

import "./styles/global.css";

const loadMaterialSymbols = () => {
    const existingLink = document.querySelector(
        "link[data-material-symbols]"
    );

    if (existingLink) {
        return;
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap";
    link.dataset.materialSymbols = "true";

    const enableIcons = () => {
        document.documentElement.classList.add(
            "material-symbols-ready"
        );
    };

    link.addEventListener("load", () => {
        if (document.fonts?.load) {
            document.fonts
                .load('24px "Material Symbols Outlined"')
                .finally(enableIcons);

            return;
        }

        enableIcons();
    });

    document.head.appendChild(link);
};

const watchForMaterialSymbols = () => {
    if (document.querySelector(".material-symbols-outlined")) {
        loadMaterialSymbols();

        return;
    }

    const observer = new MutationObserver(() => {
        if (!document.querySelector(".material-symbols-outlined")) {
            return;
        }

        observer.disconnect();
        loadMaterialSymbols();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
};

if (typeof window !== "undefined") {
    window.addEventListener("load", watchForMaterialSymbols, {
        once: true
    });
}

const rootElement = document.getElementById("root");
const app = (
    <React.StrictMode>
        <AuthProvider>
            <App />
        </AuthProvider>
    </React.StrictMode>
);
const normalizedPath = window.location.pathname.replace(/\/$/, "") || "/";
const canHydrateHome =
    rootElement.hasChildNodes() &&
    ["/", "/home"].includes(normalizedPath);

if (canHydrateHome && ReactDOM.hydrateRoot) {
    ReactDOM.hydrateRoot(rootElement, app);
} else {
    rootElement.replaceChildren();
    ReactDOM.createRoot(rootElement).render(app);
}
