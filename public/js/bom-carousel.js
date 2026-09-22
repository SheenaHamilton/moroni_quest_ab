document.addEventListener("DOMContentLoaded", () => {
    const cards = Array.from(document.querySelectorAll(".bomCard"));
    const dots = Array.from(document.querySelectorAll(".bom__dot"));

    const prev = document.getElementById("prevWeek");
    const next = document.getElementById("nextWeek");
    const label = document.getElementById("weekLabel");
    const viewport = document.querySelector(".bom__viewport");

    if (!cards.length || !prev || !next || !label || !viewport) {
        console.warn("BOM carousel: missing elements.");
        return;
    }


    const WEEK1_START = new Date(2026, 3, 12); // Jan=0

    const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

    function getCurrentWeekNumber() {
        const today = startOfDay(new Date());
        const start = startOfDay(WEEK1_START);
        const diffDays = Math.floor((today - start) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) return 1;
        return Math.floor(diffDays / 7) + 1;
    }

    function clamp(n, min, max) {
        return Math.max(min, Math.min(max, n));
    }

    // Find the max week you actually have cards for (based on data-week)
    const weekNums = cards
        .map((c) => parseInt(c.dataset.week || "0", 10))
        .filter(Boolean);

    const maxWeek = weekNums.length ? Math.max(...weekNums) : cards.length;

    // ✅ Default index based on today's computed week
    const desiredWeek = clamp(getCurrentWeekNumber(), 1, maxWeek);

    let index = cards.findIndex(
        (c) => parseInt(c.dataset.week || "0", 10) === desiredWeek
    );

    // Fallback if no matching data-week exists
    if (index < 0) index = 0;

    function render() {
        cards.forEach((c, i) => c.classList.toggle("is-active", i === index));
        dots.forEach((d, i) => d.classList.toggle("is-active", i === index));

        const wk = cards[index].dataset.week || String(index + 1);
        label.textContent = `Week ${wk}`;

        viewport.setAttribute(
            "aria-label",
            `Weekly challenges. Showing Week ${wk}. Use left/right arrow keys to navigate.`
        );

        const carousel = document.getElementById("bom-challenge-carousel");
        const bg = cards[index].dataset.bg;

        if (bg) {
            carousel.style.setProperty("--carousel-bg", `url("${bg}")`);
        }
    }

    function go(delta) {
        index = (index + delta + cards.length) % cards.length;
        render();
    }

    prev.addEventListener("click", () => go(-1));
    next.addEventListener("click", () => go(1));

    dots.forEach((dot, i) => {
        dot.addEventListener("click", () => {
            index = i;
            render();
        });
    });

    viewport.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") {
            e.preventDefault();
            go(-1);
        } else if (e.key === "ArrowRight") {
            e.preventDefault();
            go(1);
        }
    });

    let startX = 0;
    let startY = 0;
    let tracking = false;

    viewport.addEventListener(
        "touchstart",
        (e) => {
            if (!e.touches || e.touches.length !== 1) return;
            tracking = true;
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        },
        { passive: true }
    );

    viewport.addEventListener(
        "touchend",
        (e) => {
            if (!tracking) return;
            tracking = false;

            const t = e.changedTouches && e.changedTouches[0];
            if (!t) return;

            const dx = t.clientX - startX;
            const dy = t.clientY - startY;

            if (Math.abs(dx) < 40) return;
            if (Math.abs(dx) < Math.abs(dy)) return;

            if (dx < 0) go(1);
            else go(-1);
        },
        { passive: true }
    );

    render();
});
