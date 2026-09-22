(function () {
    const toggle = document.querySelector('.menu-toggle');
    const menu = document.getElementById('primary-menu');
    if (!toggle || !menu) return;

    function setExpanded(expanded) {
        toggle.setAttribute('aria-expanded', String(expanded));
        menu.classList.toggle('is-open', expanded);
        document.body.classList.toggle('nav-open', expanded);
    }

    toggle.addEventListener('click', () => {
        const expanded = toggle.getAttribute('aria-expanded') === 'true';
        setExpanded(!expanded);
    });

    menu.addEventListener('click', (e) => {
        const a = e.target.closest('a');
        if (!a) return;
        if (a.classList.contains('disabled')) return;
        setExpanded(false);
    });

    // Close on escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') setExpanded(false);
    });

    // Close if clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (e.target.closest('.nav') || e.target.closest('.menu-toggle')) return;
        setExpanded(false);
    });
})();
