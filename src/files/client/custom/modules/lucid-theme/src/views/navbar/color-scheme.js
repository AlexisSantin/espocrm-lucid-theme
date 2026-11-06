import View from 'view';
import {isLucidTheme} from 'lucid-theme:lucid';
import {applyColorScheme, installDarkParams, isDarkScheme} from 'lucid-theme:helpers/color-scheme';

const MODES = [
    {value: 'light', icon: 'fas fa-sun', label: 'lucidSchemeLight'},
    {value: 'dark', icon: 'fas fa-moon', label: 'lucidSchemeDark'},
    {value: 'system', icon: 'fas fa-circle-half-stroke', label: 'lucidSchemeSystem'},
];

/**
 * Button of the top bar choosing the palette: Light, Dark or System (follows the operating
 * system). The choice is the user's preference (`lucidColorScheme`) and applies at once.
 *
 * Shown under the Lucid themes only, and only when users may choose their theme: when the
 * administrator has disabled that, everyone keeps the light palette.
 */
export default class LucidColorSchemeNavbarView extends View {

    // language=Handlebars
    templateContent = `
        {{#if enabled}}
        <a
            id="nav-lucid-color-scheme"
            class="dropdown-toggle lucid-scheme-toggle"
            data-toggle="dropdown"
            role="button"
            tabindex="0"
            title="{{title}}"
            aria-label="{{title}}"
        ><span class="{{iconClass}}" aria-hidden="true"></span></a>
        <ul class="dropdown-menu lucid-scheme-menu" role="menu" aria-labelledby="nav-lucid-color-scheme">
            <li class="dropdown-header">{{title}}</li>
            {{#each options}}
            <li><a
                role="menuitemradio"
                tabindex="0"
                data-action="lucidSetScheme"
                data-value="{{value}}"
                aria-checked="{{#if selected}}true{{else}}false{{/if}}"
            ><span class="lucid-scheme-icon {{icon}}" aria-hidden="true"></span><span>{{label}}</span>{{#if selected}}<span class="lucid-scheme-check fas fa-check" aria-hidden="true"></span>{{/if}}</a></li>
            {{/each}}
        </ul>
        {{/if}}
    `

    data() {
        const mode = this.getMode();
        const current = MODES.find(item => item.value === mode) || MODES[0];

        return {
            enabled: this.enabled,
            title: this.translate('lucidScheme', 'labels', 'Global'),
            iconClass: current.icon,
            options: MODES.map(item => ({
                value: item.value,
                icon: item.icon,
                label: this.translate(item.label, 'labels', 'Global'),
                selected: item.value === mode,
            })),
        };
    }

    setup() {
        const isLucid = isLucidTheme(this);

        this.enabled = isLucid && !this.getConfig().get('userThemesDisabled');

        if (!isLucid) {
            return;
        }

        // The stored preference wins over what the browser remembered from a previous session.
        applyColorScheme(this.enabled ? this.getMode() : 'light');

        installDarkParams(this.getThemeManager(), () => isLucidTheme(this) && isDarkScheme());

        this.addActionHandler('lucidSetScheme', (e, element) => {
            e.preventDefault();

            this.setMode(element.dataset.value);
        });
    }

    /**
     * @return {'light'|'dark'|'system'}
     */
    getMode() {
        const mode = this.getPreferences().get('lucidColorScheme');

        return MODES.some(item => item.value === mode) ? mode : 'light';
    }

    /**
     * @param {string} mode
     */
    setMode(mode) {
        if (!MODES.some(item => item.value === mode) || mode === this.getMode()) {
            return;
        }

        applyColorScheme(mode);

        this.getPreferences()
            .save({lucidColorScheme: mode}, {patch: true})
            .catch(() => {});

        this.reRender();
    }
}
