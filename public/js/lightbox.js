(function () {
    const modal = document.getElementById("lightbox");
    if (!modal) return;

    const img = document.getElementById("lightboxImg");
    const title = document.getElementById("lightboxTitle");
    const openLink = document.getElementById("lightboxOpen");
    const closeButton = modal.querySelector(".lightbox__close");
    const galleryImages = Array.from(document.querySelectorAll(".mq-carousel__slide img"));
    let galleryIndex = -1;

    document.querySelectorAll(".mq-carousel__slide img").forEach((carouselImage) => {
        carouselImage.tabIndex = 0;
        carouselImage.setAttribute("role", "button");
        carouselImage.setAttribute("aria-label", `Open ${carouselImage.alt || "costume image"} full screen`);
    });

    let lastFocused = null;

    function open(src, caption) {
        if (!modal.classList.contains("is-open")) {
            lastFocused = document.activeElement;
        }

        img.src = src;
        img.alt = caption || "Preview";
        title.textContent = caption || "";

        openLink.href = src;

        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        closeButton?.focus();
    }

    function close() {
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        img.src = "";
        document.body.style.overflow = "";

        if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    function showGalleryImage(offset) {
        if (!galleryImages.length) return;
        galleryIndex = (galleryIndex + offset + galleryImages.length) % galleryImages.length;
        const galleryImage = galleryImages[galleryIndex];
        open(galleryImage.currentSrc || galleryImage.src, galleryImage.alt);
        modal.scrollTop = 0;
    }

    document.addEventListener("click", (e) => {
        const btn = e.target.closest(".js-lightbox, .mq-carousel__slide img");
        if (btn) {
            e.preventDefault();
            const src = btn.dataset.src || btn.currentSrc || btn.src;
            const caption = btn.dataset.title || btn.alt;
            galleryIndex = galleryImages.indexOf(btn);
            open(src, caption);
            return;
        }

        if (e.target.closest("[data-lightbox-prev]")) {
            showGalleryImage(-1);
            return;
        }

        if (e.target.closest("[data-lightbox-next]")) {
            showGalleryImage(1);
            return;
        }

        if (modal.classList.contains("is-open") && e.target.closest("[data-close]")) {
            close();
        }
    });

    document.addEventListener("keydown", (e) => {
        const carouselImage = e.target.closest?.(".mq-carousel__slide img");
        if (carouselImage && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            open(carouselImage.currentSrc || carouselImage.src, carouselImage.alt);
            return;
        }

        if (e.key === "Escape" && modal.classList.contains("is-open")) {
            close();
        } else if (e.key === "ArrowLeft" && modal.classList.contains("is-open")) {
            showGalleryImage(-1);
        } else if (e.key === "ArrowRight" && modal.classList.contains("is-open")) {
            showGalleryImage(1);
        }
    });

    let touchStartX = 0;
    let touchStartY = 0;

    modal.addEventListener("touchstart", (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    modal.addEventListener("touchend", (e) => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
            showGalleryImage(dx < 0 ? 1 : -1);
        }
    }, { passive: true });
})();
