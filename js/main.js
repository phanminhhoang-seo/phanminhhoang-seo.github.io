// Phan Minh Hoàng – portfolio. Không dùng thư viện ngoài.
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Menu điện thoại
  const btn = document.querySelector('.menu-btn');
  const nav = document.getElementById('site-nav');
  if (btn && nav) {
    const setOpen = (open) => {
      btn.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('open', open);
      document.documentElement.classList.toggle('menu-open', open);
    };
    btn.addEventListener('click', () => setOpen(btn.getAttribute('aria-expanded') !== 'true'));
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('open')) { setOpen(false); btn.focus(); }
    });
    matchMedia('(min-width: 861px)').addEventListener('change', (m) => { if (m.matches) setOpen(false); });
  }

  // 2. Ô tìm kiếm tự gõ truy vấn (chỉ trang trí, đã có bản text cho trình đọc màn hình)
  const q = document.querySelector('.serp-q');
  if (q && q.dataset.queries) {
    const list = q.dataset.queries.split('|');
    if (reduce) { q.textContent = list[0]; }
    else {
      let i = 0, n = 0, del = false;
      const tick = () => {
        const s = list[i];
        n += del ? -1 : 1;
        q.textContent = s.slice(0, n);
        let wait = del ? 35 : 75;
        if (!del && n === s.length) { del = true; wait = 1800; }
        else if (del && n === 0) { del = false; i = (i + 1) % list.length; wait = 400; }
        setTimeout(tick, wait);
      };
      tick();
    }
  }

  // 3. Hiệu ứng con trỏ: các chấm quanh chuột sáng lên như bot đang "crawl"
  if (reduce || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const cv = document.createElement('canvas');
  cv.id = 'crawl';
  cv.setAttribute('aria-hidden', 'true');
  document.body.prepend(cv);
  const ctx = cv.getContext('2d');
  const GAP = 28, OFF = 14, R = 150;
  let w, h, dpr, mx = -999, my = -999, onLink = false, raf = 0;

  const size = () => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = innerWidth; h = innerHeight;
    cv.width = w * dpr; cv.height = h * dpr;
    cv.style.width = w + 'px'; cv.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  };

  function draw() {
    raf = 0;
    ctx.clearRect(0, 0, w, h);
    if (mx < 0) return;
    const rgb = onLink ? '26,13,171' : '26,115,232';
    const x0 = Math.floor((mx - R) / GAP), x1 = Math.ceil((mx + R) / GAP);
    const y0 = Math.floor((my - R) / GAP), y1 = Math.ceil((my + R) / GAP);
    for (let gx = x0; gx <= x1; gx++) {
      for (let gy = y0; gy <= y1; gy++) {
        const px = gx * GAP + OFF, py = gy * GAP + OFF;
        const d = Math.hypot(px - mx, py - my);
        if (d > R) continue;
        const t = 1 - d / R;
        ctx.fillStyle = `rgba(${rgb},${(t * .85).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(px, py, 1 + t * 2.4, 0, 6.2832);
        ctx.fill();
      }
    }
  }

  const queue = () => { if (!raf) raf = requestAnimationFrame(draw); };
  addEventListener('pointermove', (e) => {
    mx = e.clientX; my = e.clientY;
    onLink = !!(e.target.closest && e.target.closest('a, button'));
    queue();
  }, { passive: true });
  document.addEventListener('pointerleave', () => { mx = my = -999; queue(); });
  addEventListener('resize', size);
  size();
})();
