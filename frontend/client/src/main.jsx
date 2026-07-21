import React from 'react'
import ReactDOM from 'react-dom/client'

import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

import "./styles/global.css";

const materialIconPaths = {
    add: '<path d="M12 5v14"/><path d="M5 12h14"/>',
    arrowRight: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
    badge: '<rect x="5" y="4" width="14" height="16" rx="3"/><circle cx="12" cy="10" r="2.5"/><path d="M8.5 16c.8-2 2-3 3.5-3s2.7 1 3.5 3"/>',
    bank: '<path d="m3 10 9-6 9 6"/><path d="M5 10h14"/><path d="M6 10v8"/><path d="M10 10v8"/><path d="M14 10v8"/><path d="M18 10v8"/><path d="M4 18h16"/>',
    bed: '<path d="M4 10V5"/><path d="M4 14h16"/><path d="M20 14v5"/><path d="M4 19v-9h16v9"/><path d="M8 10V8h4v2"/>',
    bus: '<rect x="5" y="4" width="14" height="14" rx="3"/><path d="M7 9h10"/><path d="M8 18v2"/><path d="M16 18v2"/><circle cx="8.5" cy="14.5" r="1"/><circle cx="15.5" cy="14.5" r="1"/>',
    calendar: '<path d="M8 3v4"/><path d="M16 3v4"/><path d="M4 9h16"/><rect x="4" y="5" width="16" height="16" rx="2"/>',
    card: '<rect x="3" y="6" width="18" height="12" rx="3"/><path d="M3 10h18"/><path d="M7 15h4"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    checkCircle: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
    city: '<path d="M4 20h16"/><path d="M6 20V8h6v12"/><path d="M12 20V4h6v16"/><path d="M8 11h2"/><path d="M8 15h2"/><path d="M14 8h2"/><path d="M14 12h2"/><path d="M14 16h2"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="m15 9-2 6-4 2 2-6z"/>',
    error: '<circle cx="12" cy="12" r="9"/><path d="M12 7v6"/><path d="M12 17h.01"/>',
    grid: '<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/>',
    heart: '<path d="M20.8 8.6c0 5.2-8.8 10.4-8.8 10.4S3.2 13.8 3.2 8.6A4.6 4.6 0 0 1 12 6.5a4.6 4.6 0 0 1 8.8 2.1z"/>',
    list: '<path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/>',
    lock: '<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    login: '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="M10 17l5-5-5-5"/><path d="M15 12H3"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>',
    mailCheck: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/><path d="m14 16 2 2 4-5"/>',
    map: '<path d="m9 18-6 3V6l6-3 6 3 6-3v15l-6 3z"/><path d="M9 3v15"/><path d="M15 6v15"/>',
    pin: '<path d="M12 21s7-5.5 7-11a7 7 0 0 0-14 0c0 5.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    plane: '<path d="M21 16 3 21l5-9-5-9 18 5-8 4z"/><path d="M8 12h5"/>',
    print: '<path d="M7 8V4h10v4"/><path d="M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/><path d="M7 14h10v7H7z"/>',
    receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6"/><path d="M9 12h6"/><path d="M9 16h4"/>',
    restaurant: '<path d="M7 3v8"/><path d="M4 3v5a3 3 0 0 0 6 0V3"/><path d="M7 11v10"/><path d="M17 3v18"/><path d="M14 3h5v8h-5z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/>',
    seat: '<path d="M7 4v8h8a4 4 0 0 1 4 4v3"/><path d="M6 12h9"/><path d="M5 20h14"/><path d="M7 4h5v5H7z"/>',
    shield: '<path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6z"/><path d="m9 12 2 2 4-5"/>',
    sliders: '<path d="M4 6h10"/><path d="M18 6h2"/><path d="M4 12h2"/><path d="M10 12h10"/><path d="M4 18h8"/><path d="M16 18h4"/><circle cx="16" cy="6" r="2"/><circle cx="8" cy="12" r="2"/><circle cx="14" cy="18" r="2"/>',
    star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z" fill="currentColor" stroke="none"/>',
    support: '<circle cx="12" cy="12" r="9"/><path d="M8 15v-3a4 4 0 0 1 8 0v3"/><path d="M8 15h2"/><path d="M14 15h2"/><path d="M12 18h2"/>',
    ticket: '<path d="M4 8a2 2 0 0 0 0 4 2 2 0 0 1 0 4v2h16v-2a2 2 0 0 1 0-4 2 2 0 0 0 0-4V6H4z"/><path d="M9 8v8"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4-6 8-6s6.5 2 8 6"/>',
    userPlus: '<circle cx="9" cy="8" r="4"/><path d="M3 21c1.5-4 3.5-6 6-6"/><path d="M17 10v6"/><path d="M14 13h6"/>',
    users: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c1.2-4 3.2-6 6-6s4.8 2 6 6"/><path d="M14 15c2.8.2 4.8 1.8 6 5"/>'
};

const materialIconAliases = {
    account_balance: "bank",
    airline_seat_recline_normal: "seat",
    arrow_forward: "arrowRight",
    calendar_today: "calendar",
    card_membership: "card",
    commute: "bus",
    confirmation_number: "ticket",
    credit_card: "card",
    directions_bus: "bus",
    explore: "compass",
    favorite: "heart",
    flight_takeoff: "plane",
    group: "users",
    grid_view: "grid",
    hotel: "bed",
    location_city: "city",
    location_on: "pin",
    mark_email_read: "mailCheck",
    password: "lock",
    payments: "card",
    person: "user",
    person_add: "userPlus",
    receipt_long: "receipt",
    schedule: "calendar",
    shield_lock: "shield",
    stars: "star",
    travel_explore: "compass",
    tune: "sliders",
    verified: "checkCircle",
    verified_user: "shield",
    view_list: "list",
    workspace_premium: "star"
};

const getMaterialIconPath = (iconName) =>
    materialIconPaths[iconName] ||
    materialIconPaths[materialIconAliases[iconName]];

const renderMaterialIconSvg = (path) =>
    `<svg class="material-symbol-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${path}</svg>`;

const upgradeMaterialSymbolElement = (element) => {
    const requestedIcon =
        element.textContent.trim() ||
        element.dataset.iconName ||
        "";
    const path = getMaterialIconPath(requestedIcon);

    if (!path) {
        element.textContent = "";
        element.dataset.iconUpgraded = "unknown";
        return;
    }

    if (
        element.dataset.iconUpgraded === "true" &&
        element.dataset.iconName === requestedIcon &&
        !element.textContent.trim()
    ) {
        return;
    }

    element.dataset.iconName = requestedIcon;
    element.dataset.iconUpgraded = "true";
    element.setAttribute("aria-hidden", "true");
    element.textContent = "";
    element.insertAdjacentHTML("afterbegin", renderMaterialIconSvg(path));
};

const upgradeMaterialSymbols = (root = document) => {
    if (root.matches?.(".material-symbols-outlined")) {
        upgradeMaterialSymbolElement(root);
    }

    root.querySelectorAll?.(".material-symbols-outlined")
        .forEach(upgradeMaterialSymbolElement);
};

const watchForMaterialSymbols = () => {
    upgradeMaterialSymbols();

    const observer = new MutationObserver(() => {
        queueMicrotask(upgradeMaterialSymbols);
    });

    observer.observe(document.body, {
        childList: true,
        characterData: true,
        subtree: true
    });
};

if (typeof window !== "undefined") {
    if (document.body) {
        watchForMaterialSymbols();
    } else {
        window.addEventListener("DOMContentLoaded", watchForMaterialSymbols, {
            once: true
        });
    }
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
