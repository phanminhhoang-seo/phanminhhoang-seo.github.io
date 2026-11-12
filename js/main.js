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

  // 2. Hoạt cảnh hành trình khách hàng: Google -> ChatGPT -> Claude -> Gemini -> sau khi tối ưu
  const jr = document.querySelector('.journey');
  if (jr) {
    const scenes = [...jr.querySelectorAll('.scene')];
    const tabs = [...jr.querySelectorAll('.jt')];
    const pauseBtn = jr.querySelector('.j-pause');
    const bar = jr.querySelector('.j-progress span');
    const DUR = [4600, 4800, 4800, 4800, 5200];
    let i = -1, timer = 0, typers = [], paused = false, started = 0;

    const clearTypers = () => { typers.forEach(clearTimeout); typers = []; };
    const typeIn = (el) => {
      const full = el.dataset.text || '';
      el.textContent = ''; el.classList.remove('done');
      if (reduce) { el.textContent = full; el.classList.add('done'); return; }
      let n = 0;
      const step = () => {
        el.textContent = full.slice(0, ++n);
        if (n < full.length) typers.push(setTimeout(step, 45));
        else el.classList.add('done');
      };
      typers.push(setTimeout(step, 250));
    };
    const show = (k) => {
      clearTypers();
      i = k;
      scenes.forEach((s, n) => s.classList.toggle('on', n === k));
      tabs.forEach((t, n) => {
        t.classList.toggle('active', n === k);
        t.classList.toggle('done', k < 4 && n < k);
        t.classList.toggle('ok', k === 4);
      });
      scenes[k].querySelectorAll('.typed').forEach(typeIn);
      if (bar) {
        bar.style.transition = 'none'; bar.style.width = (k / scenes.length * 100) + '%';
        if (!paused && !reduce) {
          requestAnimationFrame(() => requestAnimationFrame(() => {
            bar.style.transition = `width ${DUR[k]}ms linear`;
            bar.style.width = ((k + 1) / scenes.length * 100) + '%';
          }));
        }
      }
      started = Date.now();
      clearTimeout(timer);
      if (!paused && !reduce) timer = setTimeout(() => show((k + 1) % scenes.length), DUR[k]);
    };
    const setPaused = (p) => {
      paused = p;
      pauseBtn.setAttribute('aria-pressed', String(p));
      pauseBtn.textContent = p ? pauseBtn.dataset.play : pauseBtn.dataset.pause;
      clearTimeout(timer);
      if (bar) { bar.style.transition = 'none'; bar.style.width = getComputedStyle(bar).width; }
      if (!p) show((i + 1) % scenes.length);
    };
    tabs.forEach((t, n) => t.addEventListener('click', () => { paused = true; setPaused(true); show(n); }));
    pauseBtn.addEventListener('click', () => setPaused(!paused));
    // chỉ chạy khi khối đang nằm trong màn hình
    if (reduce) { pauseBtn.hidden = true; show(0); }
    else if ('IntersectionObserver' in window) {
      let first = true;
      new IntersectionObserver(([en]) => {
        if (en.isIntersecting) { if (first) { first = false; show(0); } else if (!paused) show(i); }
        else clearTimeout(timer);
      }, { threshold: 0.25 }).observe(jr);
    } else show(0);
  }

  // 3. Hiệu ứng con trỏ: một quầng sáng mềm đi theo chuột, nằm dưới nội dung nên không che chữ
  if (reduce || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const glow = document.createElement('div');
  glow.id = 'glow';
  glow.setAttribute('aria-hidden', 'true');
  document.body.prepend(glow);
  let x = 0, y = 0, tx = 0, ty = 0, raf = 0;
  const loop = () => {
    x += (tx - x) * 0.18; y += (ty - y) * 0.18;
    glow.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    raf = (Math.abs(tx - x) + Math.abs(ty - y) > 0.5) ? requestAnimationFrame(loop) : 0;
  };
  addEventListener('pointermove', (e) => {
    tx = e.clientX; ty = e.clientY;
    if (!glow.classList.contains('on')) { x = tx; y = ty; glow.classList.add('on'); }
    if (!raf) raf = requestAnimationFrame(loop);
  }, { passive: true });
  document.addEventListener('pointerleave', () => glow.classList.remove('on'));
})();
