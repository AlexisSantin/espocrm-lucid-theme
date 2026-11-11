/**
 * Appearance of the Lucid themes: style (Lucid, Monochrome, Brut: one per theme), palette (light,
 * dark, or the one of the operating system) and density (comfortable, compact).
 *
 * A plain script, loaded before the stylesheet, so that a page opens directly in the right style
 * and palette instead of flashing the default ones. It sets on the root element:
 * - data-lucid-style: the style, read by css/lucid-style-*.css;
 * - data-lucid-scheme="light|dark": the resolved palette, read by css/lucid-dark.css;
 * - data-lucid-density: the density, read by css/lucid-density.css.
 *
 * The style is the one of the theme: its stylesheet is css/lucid.css or css/lucid-<style>.css, and
 * EspoCRM swaps it for the user's own theme once it has loaded the preferences. The palette and the
 * density are the user's preferences; the browser remembers all three, so that they apply before
 * EspoCRM has loaded, login page included. The top bar button announces a new choice with the
 * `lucid:appearance` event. Under another theme the attributes have no effect.
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

    // The stylesheet of a Lucid theme: css/lucid.css (Lucid) or css/lucid-<style>.css.
    const STYLESHEET = /\/lucid-theme\/css\/lucid(?:-([a-z]+))?\.css(?:[?#]|$)/;

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

    // The style follows the theme's stylesheet, also when EspoCRM swaps it for the user's theme.
    const followStylesheet = link => {
        const update = () => {
            const match = (link.getAttribute('href') || '').match(STYLESHEET);
            const style = match ? (match[1] || DEFAULTS.style) : null;

            if (style && isValid.style(style) && style !== state.style) {
                state.style = style;
                store('style', style);
                apply();
            }
        };

        update();

        new MutationObserver(update).observe(link, {attributes: true, attributeFilter: ['href']});
    };

    const stylesheet = document.getElementById('main-stylesheet');

    if (stylesheet) {
        followStylesheet(stylesheet);
    } else if (window.MutationObserver) {
        // The page declares the stylesheet right after the scripts.
        const observer = new MutationObserver(() => {
            const link = document.getElementById('main-stylesheet');

            if (link) {
                observer.disconnect();
                followStylesheet(link);
            }
        });

        observer.observe(document.documentElement, {childList: true, subtree: true});
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
