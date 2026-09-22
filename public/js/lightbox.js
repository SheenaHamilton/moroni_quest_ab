(function () {
    const modal = document.getElementById("lightbox");
    if (!modal) return;

    const img = document.getElementById("lightboxImg");
    const title = document.getElementById("lightboxTitle");
    const openLink = document.getElementById("lightboxOpen");

    let lastFocused = null;

    function open(src, caption) {
        lastFocused = document.activeElement;

        img.src = src;
        img.alt = caption || "Preview";
        title.textContent = caption || "";

        openLink.href = src;

        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    }

    function close() {
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        img.src = "";
        document.body.style.overflow = "";

        if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    document.addEventListener("click", (e) => {
        const btn = e.target.closest(".js-lightbox");
        if (btn) {
            e.preventDefault();
            open(btn.dataset.src, btn.dataset.title);
            return;
        }

        if (modal.classList.contains("is-open") && e.target.closest("[data-close]")) {
            close();
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.classList.contains("is-open")) {
            close();
        }
    });
})();
