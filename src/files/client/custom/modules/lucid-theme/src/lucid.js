/************************************************************************
 * This file is part of Lucid Theme for EspoCRM.
 *
 * Copyright (C) 2026 Alexis SANTIN
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 ************************************************************************/

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
 * Whether the theme in use is a Lucid theme (Lucid, Lucid Monochrome, Lucid Brut): those declare
 * their style in the `lucidStyle` theme parameter.
 *
 * @param {import('view').default} view
 * @return {boolean}
 */
export function isLucidTheme(view) {
    return !!getStyle(view);
}

/**
 * The style of the theme in use (`lucid`, `monochrome`, `brut`), or null under another theme.
 *
 * @param {import('view').default} view
 * @return {string|null}
 */
export function getStyle(view) {
    const style = view.getThemeManager().getParam('lucidStyle');

    return typeof style === 'string' && style ? style : null;
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
