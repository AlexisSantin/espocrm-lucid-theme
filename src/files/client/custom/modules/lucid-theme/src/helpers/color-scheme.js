/**
 * Light and dark palettes of the Lucid theme, shared by the top bar button.
 *
 * The palette itself is applied by js/color-scheme.js, a plain script that runs before the
 * stylesheet: it sets data-lucid-scheme="light|dark" on the root element and remembers the
 * choice in the browser. This module asks it to apply a choice, and makes EspoCRM's own dark
 * behaviours follow the palette.
 */

const EVENT = 'lucid:color-scheme';

/**
 * @param {'light'|'dark'|'system'} mode
 */
export function applyColorScheme(mode) {
    document.dispatchEvent(new CustomEvent(EVENT, {detail: mode}));
}

/**
 * @return {boolean}
 */
export function isDarkScheme() {
    return document.documentElement.dataset.lucidScheme === 'dark';
}

/**
 * EspoCRM reads how dark the theme is from theme parameters: `isDark` (e-mail bodies, code
 * editors, calendar shades), the e-mail stylesheets and the chart and calendar colours. A theme
 * declares them once, while the Lucid palette is a choice of each user that can follow the
 * operating system. While the dark palette is on, the values of the theme's `lucidDark` block are
 * returned instead, the way EspoCRM's own Dark theme declares them. Views read them when they
 * render, so a chart already shown keeps its colours until it is displayed again.
 *
 * If a later EspoCRM version changes the theme manager, nothing is replaced: these elements then
 * keep their light look.
 *
 * @param {import('theme-manager').default} themeManager
 * @param {function(): boolean} isDark
 */
export function installDarkParams(themeManager, isDark) {
    if (!themeManager || typeof themeManager.getParam !== 'function' || themeManager.lucidDarkParams) {
        return;
    }

    const getParam = themeManager.getParam;
    const darkParams = getParam.call(themeManager, 'lucidDark');

    if (!darkParams || typeof darkParams !== 'object') {
        return;
    }

    themeManager.lucidDarkParams = darkParams;

    themeManager.getParam = function (name) {
        if (Object.prototype.hasOwnProperty.call(darkParams, name) && isDark()) {
            return darkParams[name];
        }

        return getParam.call(this, name);
    };
}
