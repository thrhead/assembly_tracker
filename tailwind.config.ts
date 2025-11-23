import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#16A34A", // Green-600
                "background-light": "#F8FAFC", // Slate-50
                "background-dark": "#0D1117", // Custom Dark Gray
                background: "var(--background)",
                foreground: "var(--foreground)",
            },
            fontFamily: {
                display: ["Inter", "sans-serif"],
            },
            borderRadius: {
                DEFAULT: "0.75rem", // 12px
            },
        },
    },
    plugins: [],
};
export default config;
