/**
 * Palette of the Lucid theme: light, dark, or the one of the operating system.
 *
 * A plain script, loaded before the stylesheet, so that a page opens directly in the dark palette
 * instead of flashing the light one. It sets data-lucid-scheme="light|dark" on the root element,
 * read by css/lucid-dark.css. The choice (light, dark or system) is the user's preference; the
 * browser remembers it too, so that it applies before EspoCRM has loaded the preferences, login
 * page included. The top bar button announces a new choice with the `lucid:color-scheme` event.
 * Under another theme the attribute has no effect.
 */
(() => {
    const STORAGE_KEY = 'lucid-color-scheme';
    const MODES = ['light', 'dark', 'system'];
    const media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

    const read = () => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);

            return MODES.includes(stored) ? stored : 'light';
        } catch (e) {
            return 'light';
        }
    };

    const store = value => {
        try {
            localStorage.setItem(STORAGE_KEY, value);
        } catch (e) {
            // Blocked storage: the palette still applies until the next page load.
        }
    };

    let mode = read();

    const apply = () => {
        const isDark = mode === 'dark' || (mode === 'system' && !!media && media.matches);

        document.documentElement.dataset.lucidScheme = isDark ? 'dark' : 'light';
    };

    apply();

    // System: follows the operating system when it switches, at nightfall for instance.
    if (media && media.addEventListener) {
        media.addEventListener('change', () => {
            if (mode === 'system') {
                apply();
            }
        });
    }

    document.addEventListener('lucid:color-scheme', event => {
        if (!MODES.includes(event.detail)) {
            return;
        }

        mode = event.detail;
        store(mode);
        apply();
    });
})();
