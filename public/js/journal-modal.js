(() => {
    const modal = document.getElementById("imgModal");
    if (!modal) return;

    const img = modal.querySelector(".img-modal__img");
    const caption = modal.querySelector(".img-modal__caption");
    const closeBtn = modal.querySelector(".img-modal__close");

    // Open modal when clicking a thumbnail button
    document.addEventListener("click", (e) => {
        const btn = e.target.closest(".step-thumb");
        if (!btn) return;

        const fullSrc = btn.getAttribute("data-full");
        const alt = btn.getAttribute("data-alt") || "Expanded image";

        img.src = fullSrc;
        img.alt = alt;
        caption.textContent = alt;

        // showModal for true modal behavior
        if (typeof modal.showModal === "function") {
            modal.showModal();
        } else {
            // fallback: toggle open attribute
            modal.setAttribute("open", "open");
        }
    });

    const closeModal = () => {
        img.src = "";
        img.alt = "";
        caption.textContent = "";
        if (typeof modal.close === "function") modal.close();
        else modal.removeAttribute("open");
    };

    closeBtn.addEventListener("click", closeModal);

    // Click outside image closes (dialog backdrop click)
    modal.addEventListener("click", (e) => {
        const rect = modal.getBoundingClientRect();
        const clickedInDialog =
            e.clientX >= rect.left &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom;

        // If you clicked the backdrop (outside the figure), close
        if (clickedInDialog && e.target === modal) closeModal();
    });

    // Esc closes automatically for showModal dialogs, but keep a fallback
    modal.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeModal();
    });
})();
