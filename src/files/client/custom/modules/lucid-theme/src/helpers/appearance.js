/**
 * Appearance of the Lucid theme (style, palette, density), shared by the top bar button.
 *
 * The appearance itself is applied by js/appearance.js, a plain script that runs before the
 * stylesheet: it sets data-lucid-style, data-lucid-scheme and data-lucid-density on the root
 * element and remembers the choices in the browser. This module asks it to apply a choice, and
 * makes EspoCRM's own theme parameters follow the style and the palette.
 */

const EVENT = 'lucid:appearance';

/**
 * @param {{mode?: string, style?: string, density?: string}} choice
 */
export function applyAppearance(choice) {
    document.dispatchEvent(new CustomEvent(EVENT, {detail: choice}));
}

/**
 * @return {boolean}
 */
export function isDarkScheme() {
    return document.documentElement.dataset.lucidScheme === 'dark';
}

/**
 * @return {string}
 */
export function currentStyle() {
    return document.documentElement.dataset.lucidStyle || 'lucid';
}

/**
 * EspoCRM reads parts of its look from theme parameters: `isDark` (e-mail bodies, code editors,
 * calendar shades), the e-mail stylesheets and the chart and calendar colours. A theme declares
 * them once, while the Lucid style and palette are choices of each user, and the palette can
 * follow the operating system. The theme's metadata holds the values to use instead:
 * - `lucidStyleParams.<style>.light|dark` for a style;
 * - `lucidDark` for the dark palette, whatever the style.
 * They are returned while they apply. Views read them when they render, so a chart already shown
 * keeps its colours until it is displayed again.
 *
 * If a later EspoCRM version changes the theme manager, nothing is replaced: these elements then
 * keep the look of the Lucid style in the light palette.
 *
 * @param {import('theme-manager').default} themeManager
 * @param {function(): boolean} isActive Whether the Lucid theme is in use.
 */
export function installThemeParams(themeManager, isActive) {
    if (!themeManager || typeof themeManager.getParam !== 'function' || themeManager.lucidThemeParams) {
        return;
    }

    const getParam = themeManager.getParam;
    const darkParams = asObject(getParam.call(themeManager, 'lucidDark'));
    const styleParams = asObject(getParam.call(themeManager, 'lucidStyleParams'));

    if (!darkParams && !styleParams) {
        return;
    }

    themeManager.lucidThemeParams = true;

    const has = (object, name) => !!object && Object.prototype.hasOwnProperty.call(object, name);

    themeManager.getParam = function (name) {
        if (isActive()) {
            const mode = isDarkScheme() ? 'dark' : 'light';
            const forStyle = styleParams && asObject(styleParams[currentStyle()]);
            const forStyleAndMode = forStyle && asObject(forStyle[mode]);

            if (has(forStyleAndMode, name)) {
                return forStyleAndMode[name];
            }

            if (mode === 'dark' && has(darkParams, name)) {
                return darkParams[name];
            }
        }

        return getParam.call(this, name);
    };
}

/**
 * @param {*} value
 * @return {Object|null}
 */
function asObject(value) {
    return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
}
