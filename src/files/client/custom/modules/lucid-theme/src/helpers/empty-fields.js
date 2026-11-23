import {el} from 'lucid-theme:lucid';

/** Cells concerned: layout fields and fields of the default side panel. */
const CELL_SELECTOR = '.middle .cell[data-name], .side > .panel[data-name="default"] .cell[data-name]';

/** Watched areas: fields are redrawn there after each change. */
const WATCHED_SELECTOR = '.lucid-inspector, .lucid-content-card';

/** The "About" title, one per record whatever the layout: it holds the button. */
const TITLE_SELECTOR = '.lucid-inspector-title';

/** Remembered choice: the empty fields are hidden. Per user, for every record type. */
const STORAGE_TYPE = 'lucidEmptyFields';
const HIDDEN = 'hidden';

/**
 * Empty fields of the About card, the content card and Record info: shown by default, with a
 * small button in the About title to hide them, or show them again. The choice is remembered per
 * user, in the browser. While editing, every field is visible and the button is hidden.
 */
export default class EmptyFields {

    /**
     * @param {import('views/record/detail').default} view
     */
    constructor(view) {
        this.view = view;
        this.storageName = view.getUser().id;
        this.hideEmpty = this.load();
        this.observer = null;
        this.scheduled = false;
    }

    init() {
        this.view.listenTo(this.view, 'after:render', () => this.observe());
        this.view.once('remove', () => this.observer && this.observer.disconnect());
    }

    /** @private */
    observe() {
        const root = this.view.element;

        if (this.observer) {
            this.observer.disconnect();
        }

        if (!root) {
            return;
        }

        this.observer = new MutationObserver(() => this.schedule());

        root.querySelectorAll(WATCHED_SELECTOR).forEach(target => {
            this.observer.observe(target, {childList: true, subtree: true, characterData: true});
        });

        this.schedule();
    }

    /** @private */
    schedule() {
        if (this.scheduled) {
            return;
        }

        this.scheduled = true;

        requestAnimationFrame(() => {
            this.scheduled = false;
            this.update();
        });
    }

    /** @private */
    update() {
        const root = this.view.element;
        const grid = root && root.querySelector('.lucid-record-grid');

        if (!grid) {
            return;
        }

        let count = 0;

        root.querySelectorAll(CELL_SELECTOR).forEach(cell => {
            const empty = !cell.classList.contains('hidden-cell') && isEmpty(cell);

            if (cell.classList.contains('lucid-empty') !== empty) {
                cell.classList.toggle('lucid-empty', empty);
            }

            if (empty) {
                count++;
            }
        });

        const title = root.querySelector(TITLE_SELECTOR);

        // Without the title, nothing could show them again: they stay visible.
        grid.classList.toggle('lucid-hide-empty', this.hideEmpty && !!title);

        this.renderToggle(root, title, count);
    }

    /**
     * @private
     * @param {HTMLElement} root
     * @param {HTMLElement|null} title
     * @param {number} count
     */
    renderToggle(root, title, count) {
        let toggle = root.querySelector('.lucid-empty-toggle');

        if (!count || !title) {
            if (toggle) {
                toggle.remove();
            }

            return;
        }

        if (!toggle || toggle.parentElement !== title) {
            if (toggle) {
                toggle.remove();
            }

            toggle = el('button', 'lucid-empty-toggle btn btn-text btn-icon');
            toggle.type = 'button';
            toggle.append(el('span', 'fas'), el('span', 'lucid-empty-count'));
            toggle.addEventListener('click', () => {
                this.hideEmpty = !this.hideEmpty;
                this.save();
                this.update();
            });
        }

        // Before the collapse button, which panel-collapse.js may add before or after this one.
        const collapse = title.querySelector(':scope > .lucid-collapse');

        if (toggle.parentElement !== title || (collapse && toggle.nextElementSibling !== collapse)) {
            title.insertBefore(toggle, collapse);
        }

        const label = this.hideEmpty ?
            this.view.translate(count === 1 ? 'lucidShowEmptyOne' : 'lucidShowEmptyMany', 'labels', 'Global')
                .replace('{count}', String(count)) :
            this.view.translate('lucidHideEmpty', 'labels', 'Global');

        if (toggle.title !== label) {
            toggle.title = label;
            toggle.setAttribute('aria-label', label);
        }

        // The icon tells what a click does; while hidden, the number of hidden fields shows too.
        const icon = toggle.querySelector('.fas');
        const iconClass = this.hideEmpty ? 'fas fa-eye' : 'fas fa-eye-slash';

        if (icon.className !== iconClass) {
            icon.className = iconClass;
        }

        const number = toggle.querySelector('.lucid-empty-count');
        const text = this.hideEmpty ? String(count) : '';

        if (number.textContent !== text) {
            number.textContent = text;
        }

        number.setAttribute('aria-hidden', 'true');
        toggle.classList.toggle('lucid-empty-hidden', this.hideEmpty);
    }

    /**
     * @private
     * @return {boolean}
     */
    load() {
        try {
            return this.view.getStorage().get(STORAGE_TYPE, this.storageName) === HIDDEN;
        } catch (e) {
            return false;
        }
    }

    /** @private */
    save() {
        try {
            if (this.hideEmpty) {
                this.view.getStorage().set(STORAGE_TYPE, this.storageName, HIDDEN);
            } else {
                this.view.getStorage().clear(STORAGE_TYPE, this.storageName);
            }
        } catch (e) {
            // Blocked storage: the choice still applies until the page is left.
        }
    }
}

/**
 * Empty: nothing but EspoCRM's "None". A checkbox, an image or a field being edited
 * count as a value.
 *
 * @param {HTMLElement} cell
 * @return {boolean}
 */
function isEmpty(cell) {
    const field = cell.querySelector(':scope > .field');

    if (!field || cell.querySelector('.inline-save-link')) {
        return false;
    }

    if (field.querySelector('input, select, textarea, img, video, iframe, canvas, svg')) {
        return false;
    }

    const text = field.textContent.replace(/\s+/g, '');
    const noneText = [...field.querySelectorAll('.none-value')].map(item => item.textContent).join('').replace(/\s+/g, '');

    return text === '' || text === noneText;
}
