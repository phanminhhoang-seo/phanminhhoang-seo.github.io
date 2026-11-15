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

// Form liên hệ ở trang dịch vụ: gửi về Google Sheet + email qua Google Apps Script
(() => {
  'use strict';
  const FORM_ENDPOINT = ''; // URL Web App của Google Apps Script (…/exec)
  const form = document.querySelector('.lead-form');
  if (!form) return;
  const status = form.querySelector('.lf-status');
  const submit = form.querySelector('button[type="submit"]');
  const loadedAt = Date.now();
  const say = (msg, cls) => { status.textContent = msg; status.className = 'lf-status' + (cls ? ' ' + cls : ''); };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = form.elements;
    [f.name, f.email, f.phone, f.message].forEach((el) => el.removeAttribute('aria-invalid'));
    const bad = (el, msg) => { el.setAttribute('aria-invalid', 'true'); el.focus(); say(msg, 'err'); };
    if (!f.name.value.trim()) return bad(f.name, 'Vui lòng nhập họ tên.');
    const email = f.email.value.trim(), phone = f.phone.value.trim();
    if (!email && !phone) return bad(f.email, 'Vui lòng để lại email hoặc số điện thoại.');
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return bad(f.email, 'Email chưa đúng định dạng.');
    if (phone && phone.replace(/\D/g, '').length < 9) return bad(f.phone, 'Số điện thoại chưa đúng.');
    if (!f.message.value.trim()) return bad(f.message, 'Vui lòng nhập nội dung.');
    if (f.company_url.value) return; // bot
    if (!FORM_ENDPOINT) return say('Form đang được thiết lập. Vui lòng liên hệ qua email hoặc Zalo bên dưới.', 'err');

    const data = new URLSearchParams(new FormData(form));
    data.set('page', location.href);
    data.set('t', String(Date.now() - loadedAt));
    submit.disabled = true; say('Đang gửi…');
    try {
      await fetch(FORM_ENDPOINT, { method: 'POST', mode: 'no-cors', body: data });
      form.reset();
      say('Đã gửi. Tôi sẽ liên hệ lại với bạn sớm nhất, thường trong ngày làm việc.', 'ok');
      if (typeof gtag === 'function') gtag('event', 'generate_lead', { form_service: data.get('service') });
    } catch (err) {
      say('Chưa gửi được. Vui lòng thử lại hoặc liên hệ qua email, Zalo bên dưới.', 'err');
    } finally {
      submit.disabled = false;
    }
  });
})();
