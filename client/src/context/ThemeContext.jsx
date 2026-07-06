import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext();
const THEME_STORAGE_KEY = 'theme';

const getSystemTheme = () => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const normalizeTheme = (value) => {
    return value === 'dark' || value === 'light' || value === 'system' ? value : 'system';
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        if (typeof window === 'undefined') return 'system';
        return normalizeTheme(window.localStorage.getItem(THEME_STORAGE_KEY));
    });

    const resolvedTheme = theme === 'system' ? getSystemTheme() : theme;

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const root = window.document.documentElement;
        const body = window.document.body;
        root.classList.remove('light', 'dark');
        body?.classList.remove('light', 'dark');
        root.classList.add(resolvedTheme);
        body?.classList.add(resolvedTheme);
        root.style.colorScheme = resolvedTheme;
        root.dataset.theme = resolvedTheme;
        window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    }, [theme, resolvedTheme]);

    useEffect(() => {
        if (typeof window === 'undefined' || theme !== 'system') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            const nextTheme = getSystemTheme();
            const root = window.document.documentElement;
            const body = window.document.body;
            root.classList.remove('light', 'dark');
            body?.classList.remove('light', 'dark');
            root.classList.add(nextTheme);
            body?.classList.add(nextTheme);
            root.style.colorScheme = nextTheme;
            root.dataset.theme = nextTheme;
        };

        mediaQuery.addEventListener?.('change', handleChange);
        return () => mediaQuery.removeEventListener?.('change', handleChange);
    }, [theme]);

    const value = useMemo(() => ({ theme, setTheme, resolvedTheme }), [theme, resolvedTheme]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
