import View from 'view';
import {getStyle, isLucidTheme, LAYOUTS} from 'lucid-theme:lucid';
import {applyAppearance, installThemeParams} from 'lucid-theme:helpers/appearance';

/** Order of the Lucid themes in the menu, by style; a theme with another style comes last. */
const STYLE_ORDER = ['lucid', 'monochrome', 'brut'];

const MODES = [
    {value: 'light', icon: 'fas fa-sun', label: 'lucidSchemeLight'},
    {value: 'dark', icon: 'fas fa-moon', label: 'lucidSchemeDark'},
    {value: 'system', icon: 'fas fa-circle-half-stroke', label: 'lucidSchemeSystem'},
];

const LAYOUT_OPTIONS = [
    {value: 'split', icon: 'fas fa-table-columns', label: 'lucidLayoutSplit'},
    {value: 'classic', icon: 'fas fa-table-list', label: 'lucidLayoutClassic'},
];

const DENSITIES = [
    {value: 'comfortable', icon: 'fas fa-grip-lines', label: 'lucidDensityComfortable'},
    {value: 'compact', icon: 'fas fa-align-justify', label: 'lucidDensityCompact'},
];

const OPTIONS = {
    mode: MODES,
    layout: LAYOUT_OPTIONS.filter(item => LAYOUTS.includes(item.value)),
    density: DENSITIES,
};

/** Preference holding each choice. */
const PREFERENCES = {
    mode: 'lucidColorScheme',
    layout: 'lucidLayout',
    density: 'lucidDensity',
};

/**
 * Choices with a default set by the administrator, and the setting holding it (Administration >
 * User Interface, see handlers/user-interface.js).
 */
const SETTINGS = {
    layout: 'lucidLayout',
};

/**
 * Appearance button of the top bar, under a Lucid theme:
 * - Theme: Lucid, Lucid Monochrome or Lucid Brut, EspoCRM's own theme preference. Shown only when
 *   users may choose their theme; the administrator's theme is marked as the default;
 * - Mode: Light, Dark, or System, which follows the operating system;
 * - Layout of the record view: Split or Classic, with a default set by the administrator;
 * - Density: Comfortable or Compact.
 *
 * Each choice is saved in the user's preferences and applies at once, without reloading the page.
 * Mode, layout and density stay available when the administrator imposes the theme: they are
 * personal choices, like the language.
 */
export default class LucidAppearanceNavbarView extends View {

    // language=Handlebars
    templateContent = `
        {{#if enabled}}
        <a
            id="nav-lucid-appearance"
            class="dropdown-toggle lucid-scheme-toggle"
            data-toggle="dropdown"
            role="button"
            tabindex="0"
            title="{{title}}"
            aria-label="{{title}}"
        ><span class="{{iconClass}}" aria-hidden="true"></span></a>
        <ul class="dropdown-menu lucid-scheme-menu" role="menu" aria-labelledby="nav-lucid-appearance">
            {{#each groups}}
            {{#unless @first}}<li class="divider" role="separator"></li>{{/unless}}
            <li class="dropdown-header">{{label}}</li>
            {{#each options}}
            <li><a
                role="menuitemradio"
                tabindex="0"
                data-action="lucidSetAppearance"
                data-name="{{../name}}"
                data-value="{{value}}"
                aria-checked="{{#if selected}}true{{else}}false{{/if}}"
            >{{#if swatch}}<span class="lucid-style-swatch" data-style="{{swatch}}" aria-hidden="true"></span>{{else}}<span class="lucid-scheme-icon {{icon}}" aria-hidden="true"></span>{{/if}}<span>{{label}}{{#if note}} <span class="lucid-scheme-note">{{note}}</span>{{/if}}</span>{{#if selected}}<span class="lucid-scheme-check fas fa-check" aria-hidden="true"></span>{{/if}}</a></li>
            {{/each}}
            {{/each}}
        </ul>
        {{/if}}
    `

    data() {
        const label = name => this.translate(name, 'labels', 'Global');
        const defaultNote = label('lucidDefault');
        const mode = MODES.find(item => item.value === this.getChoice('mode')) || MODES[0];

        const group = (name, titleLabel) => ({
            name: name,
            label: label(titleLabel),
            options: OPTIONS[name].map(item => ({
                value: item.value,
                icon: item.icon,
                label: label(item.label),
                note: name in SETTINGS && item.value === this.getDefault(name) ? defaultNote : null,
                selected: item.value === this.getChoice(name),
            })),
        });

        const groups = [];

        if (this.canChooseTheme()) {
            const current = this.getThemeManager().getName();
            const systemTheme = this.getConfig().get('theme');

            groups.push({
                name: 'theme',
                label: this.translate('theme', 'fields', 'Preferences'),
                options: this.getLucidThemes().map(item => ({
                    value: item.name,
                    swatch: item.style,
                    label: this.translate(item.name, 'themes', 'Global'),
                    note: item.name === systemTheme ? defaultNote : null,
                    selected: item.name === current,
                })),
            });
        }

        groups.push(
            group('mode', 'lucidMode'),
            group('layout', 'lucidLayout'),
            group('density', 'lucidDensity'),
        );

        return {
            enabled: this.enabled,
            title: label('lucidScheme'),
            iconClass: mode.icon,
            groups: groups,
        };
    }

    setup() {
        this.enabled = isLucidTheme(this);

        if (!this.enabled) {
            return;
        }

        // The stored preferences win over what the browser remembered from a previous session.
        applyAppearance({
            style: getStyle(this),
            mode: this.getChoice('mode'),
            density: this.getChoice('density'),
        });

        installThemeParams(this.getThemeManager(), () => isLucidTheme(this));

        this.addActionHandler('lucidSetAppearance', (e, element) => {
            e.preventDefault();

            if (element.dataset.name === 'theme') {
                this.setTheme(element.dataset.value);

                return;
            }

            this.setChoice(element.dataset.name, element.dataset.value);
        });
    }

    /**
     * The installed Lucid themes, in menu order.
     *
     * @return {{name: string, style: string}[]}
     */
    getLucidThemes() {
        const themes = this.getMetadata().get(['themes']) || {};
        const rank = style => {
            const index = STYLE_ORDER.indexOf(style);

            return index === -1 ? STYLE_ORDER.length : index;
        };

        return Object.keys(themes)
            .filter(name => themes[name] && typeof themes[name].lucidStyle === 'string')
            .map(name => ({name: name, style: themes[name].lucidStyle}))
            .sort((a, b) => rank(a.style) - rank(b.style) || a.name.localeCompare(b.name));
    }

    /**
     * Users choose their theme unless the administrator imposes it; portal users get the portal's.
     *
     * @return {boolean}
     */
    canChooseTheme() {
        return !this.getConfig().get('userThemesDisabled') &&
            !this.getUser().isPortal() &&
            this.getLucidThemes().length > 1;
    }

    /**
     * Saves the theme in EspoCRM's theme preference. The administrator's theme is saved as no
     * theme of one's own, so that the user follows it again if it changes. The Lucid themes share
     * their stylesheet, so the new style applies at once; the next page load uses the theme's own
     * stylesheet, as EspoCRM does.
     *
     * @param {string} name
     */
    setTheme(name) {
        const theme = this.getLucidThemes().find(item => item.name === name);

        if (!theme || !this.canChooseTheme() || name === this.getThemeManager().getName()) {
            return;
        }

        const value = name === this.getConfig().get('theme') ? '' : name;

        applyAppearance({style: theme.style});

        this.getPreferences()
            .save({theme: value}, {patch: true})
            .catch(() => {});

        this.reRender();
    }

    /**
     * @param {string} name
     * @param {*} value
     * @return {boolean}
     */
    isOption(name, value) {
        return (OPTIONS[name] || []).some(item => item.value === value);
    }

    /**
     * The administrator's default, or the first option.
     *
     * @param {'layout'} name
     * @return {string}
     */
    getDefault(name) {
        const value = this.getConfig().get(SETTINGS[name]);

        return this.isOption(name, value) ? value : OPTIONS[name][0].value;
    }

    /**
     * @param {'layout'|'mode'|'density'} name
     * @return {string}
     */
    getChoice(name) {
        const value = this.getPreferences().get(PREFERENCES[name]);

        if (this.isOption(name, value)) {
            return value;
        }

        return name in SETTINGS ? this.getDefault(name) : OPTIONS[name][0].value;
    }

    /**
     * @param {string} name
     * @param {string} value
     */
    setChoice(name, value) {
        if (!(name in PREFERENCES) || !this.isOption(name, value) || value === this.getChoice(name)) {
            return;
        }

        if (name === 'layout' && this.isRecordShown()) {
            // The record on screen is shown again in the new layout. A form with unsaved changes
            // asks first, as when leaving it; cancelling changes nothing.
            this.confirmLeaveOut(() => {
                this.saveChoice(name, value);
                Backbone.history.loadUrl();
            });

            return;
        }

        // Any other page picks the layout up on the next record.
        this.saveChoice(name, value);
    }

    /**
     * @private
     * @param {string} name
     * @param {string} value
     */
    saveChoice(name, value) {
        applyAppearance({[name]: value});

        // Set locally at once: a record shown again right after already reads the new layout.
        this.getPreferences()
            .save({[PREFERENCES[name]]: value}, {patch: true})
            .catch(() => {});

        this.reRender();
    }

    /**
     * @private
     * @return {boolean}
     */
    isRecordShown() {
        const router = this.getRouter();
        const last = router && router.getLast ? router.getLast() : null;

        return !!last && last.action === 'view' && !!window.Backbone && !!Backbone.history;
    }

    /**
     * @private
     * @param {function(): void} proceed
     */
    confirmLeaveOut(proceed) {
        const router = this.getRouter();

        if (typeof router.checkConfirmLeaveOut === 'function') {
            router.checkConfirmLeaveOut(proceed, this);

            return;
        }

        proceed();
    }
}
