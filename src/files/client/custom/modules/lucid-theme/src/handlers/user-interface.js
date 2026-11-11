/**
 * Administration > User Interface: adds the default record layout of the Lucid themes (Split or
 * Classic) right below the theme. It applies to the users who have not chosen their own in the
 * Appearance menu of the top bar. The style is the theme itself, chosen in the Theme field.
 *
 * The field is inserted into EspoCRM's own layout of the page instead of replacing it, so the page
 * keeps what a later EspoCRM version adds to it: in the free cell of the row below the theme, else
 * on a row of its own below it, else in a block of its own after the first one. If anything
 * fails, the page stays as EspoCRM made it.
 */

/** The settings field. */
const FIELD = 'lucidLayout';

export default class LucidUserInterfaceHandler {

    /**
     * @param {import('views/record/edit').default} view
     */
    constructor(view) {
        this.view = view;
    }

    process() {
        const view = /** @type {Object.<string, *>} */ this.view;

        if (view.layoutName !== 'userInterface') {
            return;
        }

        try {
            if (view.detailLayout) {
                // The layout was read before this handler ran (it was cached): the fields are
                // built again with the defaults, before the page is first shown.
                const layout = Espo.Utils.cloneDeep(view.detailLayout);

                if (!insertField(layout)) {
                    return;
                }

                view.detailLayout = layout;
                view.gridLayout = null;
                view.createMiddleView();

                return;
            }

            const modify = view.modifyDetailLayout.bind(view);

            view.hasModifyDetailLayout = true;

            view.modifyDetailLayout = layout => {
                modify(layout);
                insertField(layout);
            };
        } catch (e) {
            console.warn('Lucid: the appearance defaults could not be added to the page.', e);
        }
    }
}

/**
 * @param {Object[]} layout Panels of a record layout.
 * @return {boolean} Whether the field was added.
 */
function insertField(layout) {
    if (!Array.isArray(layout)) {
        return false;
    }

    const isCell = (cell, name) => !!cell && typeof cell === 'object' && cell.name === name;
    const hasCell = (row, name) => Array.isArray(row) && row.some(cell => isCell(cell, name));

    if (layout.some(panel => (panel.rows || []).some(row => hasCell(row, FIELD)))) {
        return false;
    }

    const cell = {name: FIELD};

    for (const panel of layout) {
        const rows = panel.rows || [];
        const index = rows.findIndex(row => hasCell(row, 'theme'));

        if (index === -1) {
            continue;
        }

        const next = rows[index + 1];

        // EspoCRM 10 leaves the first cell of that row free (Disable avatars is on the right)
        if (Array.isArray(next) && next.length === 2 && next[0] === false) {
            next[0] = cell;
        } else {
            rows.splice(index + 1, 0, [cell, false]);
        }

        return true;
    }

    layout.splice(Math.min(1, layout.length), 0, {rows: [[cell, false]]});

    return true;
}
