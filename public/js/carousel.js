(function initMQCarousel() {
    const root = document.querySelector('[data-carousel]');
    if (!root) return;

    const track = root.querySelector('[data-track]');
    const slides = Array.from(track.children);
    const dotsWrap = root.querySelector('[data-dots]');
    const btnPrev = root.querySelector('[data-prev]');
    const btnNext = root.querySelector('[data-next]');

    let index = 0;
    let dots = [];
    let perView = 1;
    let pageCount = 1;
    let timer = null;
    const intervalMs = 5500;

    function getPerView() {
        const value = getComputedStyle(root).getPropertyValue('--slides-per-view');
        return Math.max(1, Number.parseInt(value, 10) || 1);
    }

    function buildDots() {
        dotsWrap.replaceChildren();
        dots = Array.from({ length: pageCount }, (_, i) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'mq-carousel__dot';
            b.setAttribute('aria-label', `Go to carousel page ${i + 1}`);
            b.addEventListener('click', () => goTo(i, true));
            dotsWrap.appendChild(b);
            return b;
        });
    }

    function setLayout() {
        const nextPerView = getPerView();
        const nextPageCount = Math.ceil(slides.length / nextPerView);

        if (nextPerView !== perView || nextPageCount !== pageCount || dots.length === 0) {
            perView = nextPerView;
            pageCount = nextPageCount;
            index = Math.min(index, pageCount - 1);
            buildDots();
        }

        update();
    }

    function update() {
        const firstSlide = Math.min(index * perView, Math.max(0, slides.length - perView));
        track.style.transform = `translateX(-${firstSlide * (100 / perView)}%)`;
        dots.forEach((d, i) => d.setAttribute('aria-current', i === index ? 'true' : 'false'));
    }

    function goTo(i, userAction = false) {
        index = (i + pageCount) % pageCount;
        update();
        if (userAction) restart();
    }

    function next(userAction = false) { goTo(index + 1, userAction); }
    function prev(userAction = false) { goTo(index - 1, userAction); }

    function start() {
        stop();
        timer = window.setInterval(() => next(false), intervalMs);
    }
    function stop() {
        if (timer) window.clearInterval(timer);
        timer = null;
    }
    function restart() {
        start();
    }

    btnNext.addEventListener('click', () => next(true));
    btnPrev.addEventListener('click', () => prev(true));

    // Pause on hover/focus
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    root.addEventListener('focusin', stop);
    root.addEventListener('focusout', start);

    // Swipe support
    let startX = 0, dx = 0, touching = false;
    root.addEventListener('touchstart', (e) => {
        touching = true;
        startX = e.touches[0].clientX;
        dx = 0;
        stop();
    }, { passive: true });

    root.addEventListener('touchmove', (e) => {
        if (!touching) return;
        dx = e.touches[0].clientX - startX;
    }, { passive: true });

    root.addEventListener('touchend', () => {
        touching = false;
        if (Math.abs(dx) > 40) (dx < 0 ? next(true) : prev(true));
        start();
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(setLayout, 120);
    });

    setLayout();
    start();
})();
