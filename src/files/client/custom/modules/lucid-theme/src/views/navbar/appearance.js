import View from 'view';
import {isLucidTheme, LAYOUTS} from 'lucid-theme:lucid';
import {applyAppearance, installThemeParams} from 'lucid-theme:helpers/appearance';

/** Styles: the names are proper names, the same in every language. */
const STYLES = [
    {value: 'lucid', label: 'Lucid'},
    {value: 'monochrome', label: 'Monochrome'},
    {value: 'brut', label: 'Brut'},
];

const LAYOUT_OPTIONS = [
    {value: 'split', icon: 'fas fa-table-columns', label: 'lucidLayoutSplit'},
    {value: 'classic', icon: 'fas fa-table-list', label: 'lucidLayoutClassic'},
];

const MODES = [
    {value: 'light', icon: 'fas fa-sun', label: 'lucidSchemeLight'},
    {value: 'dark', icon: 'fas fa-moon', label: 'lucidSchemeDark'},
    {value: 'system', icon: 'fas fa-circle-half-stroke', label: 'lucidSchemeSystem'},
];

const DENSITIES = [
    {value: 'comfortable', icon: 'fas fa-grip-lines', label: 'lucidDensityComfortable'},
    {value: 'compact', icon: 'fas fa-align-justify', label: 'lucidDensityCompact'},
];

const OPTIONS = {
    style: STYLES,
    layout: LAYOUT_OPTIONS.filter(item => LAYOUTS.includes(item.value)),
    mode: MODES,
    density: DENSITIES,
};

/** Preference holding each choice. */
const PREFERENCES = {
    style: 'lucidStyle',
    layout: 'lucidLayout',
    mode: 'lucidColorScheme',
    density: 'lucidDensity',
};

/** Choices with a default set by the administrator, and the setting holding it. */
const SETTINGS = {
    style: 'lucidStyle',
    layout: 'lucidLayout',
};

/**
 * Appearance button of the top bar: style (Lucid, Monochrome, Brut), record layout (Split,
 * Classic), palette (Light, Dark, System, which follows the operating system) and density
 * (Comfortable, Compact). Each choice is a preference of the user and applies at once. Style and
 * layout fall back to the administrator's defaults (settings), which an administrator sets from
 * this menu.
 *
 * Shown under the Lucid theme only. It stays available when the administrator imposes the theme
 * (users may not choose their theme): the appearance is a personal choice, like the language.
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
            >{{#if swatch}}<span class="lucid-style-swatch" data-style="{{value}}" aria-hidden="true"></span>{{else}}<span class="lucid-scheme-icon {{icon}}" aria-hidden="true"></span>{{/if}}<span>{{label}}{{#if note}} <span class="lucid-scheme-note">{{note}}</span>{{/if}}</span>{{#if selected}}<span class="lucid-scheme-check fas fa-check" aria-hidden="true"></span>{{/if}}</a></li>
            {{/each}}
            {{/each}}
            {{#if canSetDefault}}
            <li class="divider" role="separator"></li>
            <li><a role="menuitem" tabindex="0" data-action="lucidSetDefaults"><span class="lucid-scheme-icon fas fa-users" aria-hidden="true"></span><span>{{setDefaultLabel}}</span></a></li>
            {{/if}}
        </ul>
        {{/if}}
    `

    data() {
        const label = name => this.translate(name, 'labels', 'Global');
        const mode = MODES.find(item => item.value === this.getChoice('mode')) || MODES[0];

        const group = (name, titleLabel) => ({
            name: name,
            label: label(titleLabel),
            options: OPTIONS[name].map(item => ({
                value: item.value,
                icon: item.icon,
                swatch: name === 'style',
                label: name === 'style' ? item.label : label(item.label),
                note: name in SETTINGS && item.value === this.getDefault(name) ? label('lucidDefault') : null,
                selected: item.value === this.getChoice(name),
            })),
        });

        return {
            enabled: this.enabled,
            title: label('lucidScheme'),
            iconClass: mode.icon,
            groups: [
                group('style', 'lucidStyle'),
                group('layout', 'lucidLayout'),
                group('mode', 'lucidMode'),
                group('density', 'lucidDensity'),
            ],
            canSetDefault: this.getUser().isAdmin() &&
                Object.keys(SETTINGS).some(name => this.getChoice(name) !== this.getDefault(name)),
            setDefaultLabel: label('lucidMakeDefault'),
        };
    }

    setup() {
        this.enabled = isLucidTheme(this);

        if (!this.enabled) {
            return;
        }

        // The stored preferences win over what the browser remembered from a previous session.
        applyAppearance({
            style: this.getChoice('style'),
            mode: this.getChoice('mode'),
            density: this.getChoice('density'),
        });

        installThemeParams(this.getThemeManager(), () => isLucidTheme(this));

        this.addActionHandler('lucidSetAppearance', (e, element) => {
            e.preventDefault();

            this.setChoice(element.dataset.name, element.dataset.value);
        });

        this.addActionHandler('lucidSetDefaults', e => {
            e.preventDefault();

            this.setDefaults();
        });
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
     * @param {'style'|'layout'} name
     * @return {string}
     */
    getDefault(name) {
        const value = this.getConfig().get(SETTINGS[name]);

        return this.isOption(name, value) ? value : OPTIONS[name][0].value;
    }

    /**
     * @param {'style'|'layout'|'mode'|'density'} name
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

    /**
     * Makes the current style and layout the defaults of everyone who has not chosen them.
     * Administrators only; EspoCRM refuses the change to anyone else.
     */
    setDefaults() {
        if (!this.getUser().isAdmin()) {
            return;
        }

        const data = {};

        Object.keys(SETTINGS).forEach(name => data[SETTINGS[name]] = this.getChoice(name));

        // PUT: EspoCRM's settings controller only accepts it, and merges the values it receives.
        Espo.Ajax.putRequest('Settings', data)
            .then(() => {
                Object.keys(data).forEach(key => this.getConfig().set(key, data[key]));
                Espo.Ui.success(this.translate('Saved'));
                this.reRender();
            })
            .catch(() => {});
    }
}
