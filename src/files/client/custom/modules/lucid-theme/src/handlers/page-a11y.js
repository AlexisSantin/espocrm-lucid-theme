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

import {isLucidTheme} from 'lucid-theme:lucid';

/**
 * Page accessibility under the Lucid theme (RGAA 8.3 and 10.4): EspoCRM doesn't declare the
 * document language and blocks zooming on mobile. Called when lists, records, forms and the
 * login page open.
 */
export default class PageA11yHandler {

    /**
     * @param {import('view').default} view
     */
    constructor(view) {
        this.view = view;
    }

    process() {
        if (!isLucidTheme(this.view)) {
            return;
        }

        const language = this.view.getLanguage().name || this.view.getConfig().get('language');

        if (language) {
            document.documentElement.lang = language.replace('_', '-');
        }

        const viewport = document.querySelector('meta[name="viewport"]');

        if (viewport && /user-scalable\s*=\s*no|maximum-scale/.test(viewport.content)) {
            viewport.content = 'width=device-width, initial-scale=1.0';
        }
    }
}
