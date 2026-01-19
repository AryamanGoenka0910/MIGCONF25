import React from "react";

export function EyeOnIcon({ className = "h-4 w-4 text-white" }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M17.94 17.94A10 10 0 0 1 6.06 6.06" />
            <path d="M1 1l22 22" />
            <path d="M9.88 9.88A3 3 0 0 0 14.12 14.12" />
        </svg>
    );
}

export default EyeOnIcon;