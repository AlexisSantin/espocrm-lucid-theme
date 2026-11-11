/**
 * Collapsible groups in the side menu: a click on a title (CRM, Activities…) folds the items below
 * it, up to the next title. The state is remembered per user, in the browser.
 *
 * A plain script rather than a module: EspoCRM's navbar view has no setup handler, and this only
 * relies on the menu's markup. If that markup changes in another version, the menu stays as it is.
 */
(() => {
    const MENU_SELECTOR = '#navbar ul.tabs';
    // The stylesheet of a Lucid theme: css/lucid.css (Lucid) or css/lucid-<style>.css (Lucid
    // Monochrome, Lucid Brut…), the same rule as js/appearance.js.
    const THEME_STYLESHEET = /\/lucid-theme\/css\/lucid(?:-[a-z]+)?\.css(?:[?#]|$)/;
    // The user's own link, in the top right menu. The Last Viewed panel, also in the navbar, can
    // hold links to other users, whose stored state must not be read.
    const USER_SELECTOR = '#navbar .menu-container a[href^="#User/view/"]';
    const STORAGE_PREFIX = 'lucid-nav-groups-';

    let scheduled = false;
    let observed = null;

    const storageKey = () => {
        const link = document.querySelector(USER_SELECTOR);

        return STORAGE_PREFIX + (link ? link.getAttribute('href').split('/').pop() : 'default');
    };

    const load = () => {
        try {
            const stored = JSON.parse(localStorage.getItem(storageKey()));

            return Array.isArray(stored) ? stored : [];
        } catch (e) {
            return [];
        }
    };

    const save = collapsed => {
        try {
            localStorage.setItem(storageKey(), JSON.stringify(collapsed));
        } catch (e) {
            // Blocked storage: the group still folds until the next page load.
        }
    };

    const toggle = label => {
        const collapsed = load();

        save(collapsed.includes(label) ? collapsed.filter(item => item !== label) : [...collapsed, label]);
        update();
    };

    const decorate = (title, label, isCollapsed) => {
        let button = title.querySelector(':scope > div > .lucid-nav-toggle');

        if (!button) {
            const row = title.firstElementChild;
            const icon = document.createElement('span');

            button = document.createElement('button');
            button.type = 'button';
            button.className = 'lucid-nav-toggle';
            icon.className = 'fas fa-chevron-down';
            icon.setAttribute('aria-hidden', 'true');
            button.append(icon);
            row.append(button);
            row.addEventListener('click', () => toggle(label));
        }

        button.setAttribute('aria-label', label);
        button.setAttribute('aria-expanded', String(!isCollapsed));
        title.classList.toggle('lucid-nav-collapsed', isCollapsed);
    };

    function isLucidTheme() {
        return [...document.querySelectorAll('link[rel="stylesheet"]')]
            .some(link => THEME_STYLESHEET.test(link.getAttribute('href') || ''));
    }

    function update() {
        watch();

        const menu = document.querySelector(MENU_SELECTOR);

        if (!menu || !isLucidTheme()) {
            return;
        }

        const collapsed = load();
        let isFolding = false;

        [...menu.children].forEach(item => {
            if (item.classList.contains('tab-divider')) {
                const text = item.querySelector('.label-text');
                const label = text ? text.textContent.trim() : '';

                // A separator without text has no title to click: it just ends the group above.
                isFolding = !!label && collapsed.includes(label);

                if (label) {
                    decorate(item, label, isFolding);
                }

                return;
            }

            if (item.classList.contains('more')) {
                isFolding = false;
            }

            // The page in progress stays visible, so that the user always sees where they are.
            const isCurrent = item.classList.contains('active') || !!item.querySelector('.active');

            item.classList.toggle('lucid-nav-hidden', isFolding && !isCurrent);
        });
    }

    const schedule = () => {
        if (scheduled) {
            return;
        }

        scheduled = true;

        requestAnimationFrame(() => {
            scheduled = false;
            update();
        });
    };

    // EspoCRM redraws the menu and moves the current page marker without any event to listen to.
    const observer = new MutationObserver(schedule);

    // Only the header holds the menu: the rest of the page changes far more often. Until it exists
    // (and if it gets replaced), the whole document is watched.
    function watch() {
        const header = document.querySelector('#header');
        const target = header || document.documentElement;

        if (target !== observed) {
            observer.disconnect();
            observer.observe(target, {childList: true, subtree: true});
            observed = target;
        }
    }

    watch();
    window.addEventListener('hashchange', schedule);
})();
