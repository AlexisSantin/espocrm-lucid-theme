/**
 * Shared settings of the Lucid record view.
 */

/** Bottom panels of the Activity tab, below the quick actions. */
export const ACTIVITY_PANELS = ['stream'];

/** Theme with the classic layout: fields and bottom panels on the left, side panels on the right. */
const CLASSIC_THEME = 'LucidClassic';

/**
 * @param {import('view').default} view
 * @return {boolean}
 */
export function isLucidTheme(view) {
    return ['Lucid', CLASSIC_THEME].includes(view.getThemeManager().getName());
}

/**
 * @param {import('view').default} view
 * @return {boolean}
 */
export function isClassicLayout(view) {
    return view.getThemeManager().getName() === CLASSIC_THEME;
}

/**
 * @param {string} tag
 * @param {string} [className]
 * @param {string} [text]
 * @return {HTMLElement}
 */
export function el(tag, className, text) {
    const element = document.createElement(tag);

    if (className) {
        element.className = className;
    }

    if (text !== undefined) {
        element.textContent = text;
    }

    return element;
}
