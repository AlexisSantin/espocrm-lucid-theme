/**
 * Shared settings of the Lucid record view.
 */

/** Bottom panels of the Activity tab, below the quick actions. */
export const ACTIVITY_PANELS = ['stream'];

/**
 * Record view layouts: `split` puts the fields on the left and the activity on the right;
 * `classic` keeps fields and bottom panels on the left and side panels on the right, as EspoCRM.
 */
export const LAYOUTS = ['split', 'classic'];

/**
 * @param {import('view').default} view
 * @return {boolean}
 */
export function isLucidTheme(view) {
    return view.getThemeManager().getName() === 'Lucid';
}

/**
 * The record view layout: the user's choice (`lucidLayout` preference), else the administrator's
 * default (`lucidLayout` setting), else Split.
 *
 * @param {import('view').default} view
 * @return {'split'|'classic'}
 */
export function getLayout(view) {
    const chosen = view.getPreferences().get('lucidLayout');

    if (LAYOUTS.includes(chosen)) {
        return chosen;
    }

    const byDefault = view.getConfig().get('lucidLayout');

    return LAYOUTS.includes(byDefault) ? byDefault : LAYOUTS[0];
}

/**
 * @param {import('view').default} view
 * @return {boolean}
 */
export function isClassicLayout(view) {
    return getLayout(view) === 'classic';
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
