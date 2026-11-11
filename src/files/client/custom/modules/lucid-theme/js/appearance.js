/**
 * Appearance of the Lucid theme: style (Lucid, Monochrome…), palette (light, dark, or the one of
 * the operating system) and density (comfortable, compact).
 *
 * A plain script, loaded before the stylesheet, so that a page opens directly in the right style
 * and palette instead of flashing the default ones. It sets on the root element:
 * - data-lucid-style: the style, read by css/lucid-style-*.css;
 * - data-lucid-scheme="light|dark": the resolved palette, read by css/lucid-dark.css;
 * - data-lucid-density: the density, read by css/lucid-density.css.
 *
 * The choices are the user's preferences (the style falls back to the administrator's default);
 * the browser remembers them too, so that they apply before EspoCRM has loaded the preferences,
 * login page included. The top bar button announces a new choice with the `lucid:appearance`
 * event. Under another theme the attributes have no effect.
 */
(() => {
    const MODES = ['light', 'dark', 'system'];
    const DENSITIES = ['comfortable', 'compact'];
    // Styles are open-ended: a value without its stylesheet simply leaves the default look.
    const STYLE_PATTERN = /^[a-z][a-z-]{0,30}$/;

    const KEYS = {
        mode: 'lucid-color-scheme',
        style: 'lucid-style',
        density: 'lucid-density',
    };

    const isValid = {
        mode: value => MODES.includes(value),
        style: value => typeof value === 'string' && STYLE_PATTERN.test(value),
        density: value => DENSITIES.includes(value),
    };

    const DEFAULTS = {
        mode: 'light',
        style: 'lucid',
        density: 'comfortable',
    };

    const media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

    const read = name => {
        try {
            const stored = localStorage.getItem(KEYS[name]);

            return isValid[name](stored) ? stored : DEFAULTS[name];
        } catch (e) {
            return DEFAULTS[name];
        }
    };

    const store = (name, value) => {
        try {
            localStorage.setItem(KEYS[name], value);
        } catch (e) {
            // Blocked storage: the choice still applies until the next page load.
        }
    };

    const state = {
        mode: read('mode'),
        style: read('style'),
        density: read('density'),
    };

    const apply = () => {
        const root = document.documentElement;
        const isDark = state.mode === 'dark' || (state.mode === 'system' && !!media && media.matches);

        root.dataset.lucidScheme = isDark ? 'dark' : 'light';
        root.dataset.lucidStyle = state.style;
        root.dataset.lucidDensity = state.density;
    };

    apply();

    // System: follows the operating system when it switches, at nightfall for instance.
    if (media && media.addEventListener) {
        media.addEventListener('change', () => {
            if (state.mode === 'system') {
                apply();
            }
        });
    }

    document.addEventListener('lucid:appearance', event => {
        const detail = event.detail || {};

        Object.keys(KEYS).forEach(name => {
            if (name in detail && isValid[name](detail[name])) {
                state[name] = detail[name];
                store(name, detail[name]);
            }
        });

        apply();
    });
})();
