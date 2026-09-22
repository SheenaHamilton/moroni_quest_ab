(() => {
    const select = document.querySelector('[data-autosubmit]');
    if (!select) return;

    const form = select.closest('form');
    if (!form) return;

    select.addEventListener('change', () => form.submit());
})();
