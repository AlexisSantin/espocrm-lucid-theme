/**
 * A thin progress bar at the top of the page while EspoCRM works, in place of its spinner message.
 * It starts as soon as the user acts, which is what makes the wait feel shorter.
 *
 * A plain script rather than a module: it has to see the requests of every view. If it doesn't
 * load, the EspoCRM spinner stays (the stylesheet only hides it once this script has run).
 */
(() => {
    const THEME_SELECTOR = 'link[href*="modules/lucid-theme/css/lucid.css"]';
    const READY_CLASS = 'lucid-activity-ready';
    const ON_CLASS = 'lucid-progress-on';
    const DONE_CLASS = 'lucid-progress-done';
    // A request this soon after a click or a key press comes from the user, not from a polling loop.
    const USER_ACTION_WINDOW = 1000;
    // Chained requests and the rendering that follows them count as the same wait.
    const SETTLE_DELAY = 150;
    const FADE_DURATION = 350;
    const MAX_DURATION = 20000;

    let bar = null;
    let isRunning = false;
    let pending = 0;
    let lastUserAction = 0;
    let settleTimer = null;
    let fadeTimer = null;
    let maxTimer = null;

    const isEnabled = () => !!document.querySelector(THEME_SELECTOR);

    const hasSpinner = () => !!document.querySelector('#notification .fa-spinner');

    const finish = () => {
        clearTimeout(settleTimer);
        clearTimeout(maxTimer);

        isRunning = false;
        pending = 0;

        bar.classList.remove(ON_CLASS);
        bar.classList.add(DONE_CLASS);

        fadeTimer = setTimeout(() => bar.classList.remove(DONE_CLASS), FADE_DURATION);
    };

    const settle = () => {
        clearTimeout(settleTimer);

        settleTimer = setTimeout(() => {
            if (pending > 0 || hasSpinner()) {
                settle();

                return;
            }

            finish();
        }, SETTLE_DELAY);
    };

    const start = () => {
        if (!document.body || !isEnabled()) {
            return;
        }

        if (!bar) {
            bar = document.createElement('div');
            bar.className = 'lucid-progress';
            bar.setAttribute('aria-hidden', 'true');
        }

        // EspoCRM rewrites the content of the body when the application starts.
        if (!bar.isConnected) {
            document.body.append(bar);
        }

        settle();

        if (isRunning) {
            return;
        }

        isRunning = true;

        clearTimeout(fadeTimer);
        clearTimeout(maxTimer);

        maxTimer = setTimeout(finish, MAX_DURATION);

        bar.classList.remove(DONE_CLASS);
        bar.classList.add(ON_CLASS);
    };

    const markUserAction = () => {
        lastUserAction = Date.now();
    };

    const originalSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.send = function (...args) {
        if (isRunning || Date.now() - lastUserAction < USER_ACTION_WINDOW) {
            start();

            if (isRunning) {
                pending++;

                this.addEventListener('loadend', () => {
                    pending = Math.max(0, pending - 1);

                    if (isRunning) {
                        settle();
                    }
                }, {once: true});
            }
        }

        return originalSend.apply(this, args);
    };

    window.addEventListener('pointerdown', markUserAction, {capture: true, passive: true});
    window.addEventListener('keydown', markUserAction, {capture: true, passive: true});

    // On the click itself: by the time the address changes, EspoCRM is already busy with the new page.
    document.addEventListener('click', event => {
        const link = event.target.closest ? event.target.closest('a[href^="#"]:not([href="#"])') : null;

        if (link && !link.target && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
            start();
        }
    }, true);

    window.addEventListener('hashchange', () => {
        markUserAction();
        start();
    });

    const init = () => {
        document.documentElement.classList.add(READY_CLASS);

        // EspoCRM adds its message directly in the body: there is no need to watch deeper.
        new MutationObserver(() => {
            if (hasSpinner()) {
                start();
            }
        }).observe(document.body, {childList: true});
    };

    if (document.body) {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }
})();
