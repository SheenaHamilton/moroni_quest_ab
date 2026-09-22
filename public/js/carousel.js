(function initMQCarousel() {
    const root = document.querySelector('[data-carousel]');
    if (!root) return;

    const track = root.querySelector('[data-track]');
    const slides = Array.from(track.children);
    const dotsWrap = root.querySelector('[data-dots]');
    const btnPrev = root.querySelector('[data-prev]');
    const btnNext = root.querySelector('[data-next]');

    let index = 0;
    let timer = null;
    const intervalMs = 5500;

    // Build dots
    const dots = slides.map((_, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'mq-carousel__dot';
        b.setAttribute('aria-label', `Go to slide ${i + 1}`);
        b.addEventListener('click', () => goTo(i, true));
        dotsWrap.appendChild(b);
        return b;
    });

    function update() {
        track.style.transform = `translateX(-${index * 100}%)`;
        dots.forEach((d, i) => d.setAttribute('aria-current', i === index ? 'true' : 'false'));
    }

    function goTo(i, userAction = false) {
        index = (i + slides.length) % slides.length;
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

    update();
    start();
})();
