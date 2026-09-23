(function () {
  const d = document.getElementById('d');
  const h = document.getElementById('h');
  const m = document.getElementById('m');
  const s = document.getElementById('s');
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // The countdown only exists on the homepage. The script is loaded through
  // the shared footer, so other pages should stop after updating the year.
  if (!d || !h || !m || !s) return;

  const startISO = window.CAMP_START_ISO || '2027-09-01T09:00:00-06:00';
  const start = new Date(startISO).getTime();

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    const now = Date.now();
    const diff = Math.max(0, start - now);
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    d.textContent = days; h.textContent = pad(hours); m.textContent = pad(mins); s.textContent = pad(secs);
  }
  tick();
  setInterval(tick, 1000);
})();
