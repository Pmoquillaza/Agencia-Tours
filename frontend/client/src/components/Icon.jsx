const paths = {
    bed: (
        <>
            <path d="M4 10V5" />
            <path d="M4 14h16" />
            <path d="M20 14v5" />
            <path d="M4 19v-9h16v9" />
            <path d="M8 10V8h4v2" />
        </>
    ),
    calendar: (
        <>
            <path d="M8 3v4" />
            <path d="M16 3v4" />
            <path d="M4 9h16" />
            <rect x="4" y="5" width="16" height="16" rx="2" />
        </>
    ),
    camera: (
        <>
            <path d="M4 8h4l2-3h4l2 3h4v11H4z" />
            <circle cx="12" cy="14" r="3" />
        </>
    ),
    compass: (
        <>
            <circle cx="12" cy="12" r="9" />
            <path d="m15 9-2 6-4 2 2-6z" />
        </>
    ),
    globe: (
        <>
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18" />
            <path d="M12 3a14 14 0 0 1 0 18" />
            <path d="M12 3a14 14 0 0 0 0 18" />
        </>
    ),
    home: (
        <>
            <path d="m3 11 9-8 9 8" />
            <path d="M5 10v10h14V10" />
            <path d="M10 20v-6h4v6" />
        </>
    ),
    mail: (
        <>
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m4 7 8 6 8-6" />
        </>
    ),
    pin: (
        <>
            <path d="M12 21s7-5.5 7-11a7 7 0 0 0-14 0c0 5.5 7 11 7 11z" />
            <circle cx="12" cy="10" r="2.5" />
        </>
    ),
    plane: (
        <>
            <path d="M21 16 3 21l5-9-5-9 18 5-8 4z" />
            <path d="M8 12h5" />
        </>
    ),
    quote: (
        <>
            <path d="M8 11H5c0-3 1.5-5 4.5-6" />
            <path d="M18 11h-3c0-3 1.5-5 4.5-6" />
            <path d="M5 11h5v6H5z" />
            <path d="M15 11h5v6h-5z" />
        </>
    ),
    search: (
        <>
            <circle cx="11" cy="11" r="7" />
            <path d="m16 16 5 5" />
        </>
    ),
    send: (
        <>
            <path d="m21 3-7 18-4-8-7-3z" />
            <path d="m21 3-11 10" />
        </>
    ),
    shield: (
        <>
            <path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6z" />
            <path d="m9 12 2 2 4-5" />
        </>
    ),
    star: (
        <path
            d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z"
            fill="currentColor"
            stroke="none"
        />
    ),
    ticket: (
        <>
            <path d="M4 8a2 2 0 0 0 0 4 2 2 0 0 1 0 4v2h16v-2a2 2 0 0 1 0-4 2 2 0 0 0 0-4V6H4z" />
            <path d="M9 8v8" />
        </>
    ),
    user: (
        <>
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c1.5-4 4-6 8-6s6.5 2 8 6" />
        </>
    ),
    users: (
        <>
            <circle cx="9" cy="8" r="3" />
            <circle cx="17" cy="9" r="2.5" />
            <path d="M3 20c1.2-4 3.2-6 6-6s4.8 2 6 6" />
            <path d="M14 15c2.8.2 4.8 1.8 6 5" />
        </>
    )
};

const Icon = ({ name, className = "", decorative = true }) => (
    <svg
        className={`app-icon ${className}`.trim()}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden={decorative}
        focusable="false"
    >
        {paths[name]}
    </svg>
);

export default Icon;
