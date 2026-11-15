// Phan Minh Hoàng – portfolio. Không dùng thư viện ngoài.
// URL Web App của Google Apps Script (…/exec): nhận form liên hệ và chatbot AI. Để trống thì form/chatbot chưa chạy.
const PMH_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyeQ1ru7z36mL4789uIH72LDd-T3uDJRJakMt10--N8w0qeYfDk74yZ81E5DLn1zouG/exec';
// Bật chatbot AI khi Apps Script đã có GEMINI_API_KEY và chạy testChat thành công
const PMH_CHAT = false;
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
  const FORM_ENDPOINT = PMH_ENDPOINT;
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

// Chatbot AI: trả lời bằng Gemini qua Apps Script, mỗi lượt chat được lưu vào Google Sheet
(() => {
  'use strict';
  if (!PMH_ENDPOINT || !PMH_CHAT) return;
  const en = document.documentElement.lang === 'en';
  const T = en ? {
    open: 'Ask the AI assistant', title: 'AI assistant', sub: 'Questions about SEO, GEO and courses',
    close: 'Close chat', placeholder: 'Type your question…', send: 'Send',
    hello: 'Hi! I am the AI assistant on Hoàng\'s website. Ask me about SEO, GEO services or the 1-on-1 courses.',
    note: 'AI answers may be wrong. Chats are saved so Hoàng can follow up.',
    err: 'Sorry, something went wrong. Please try again, or email hoangphan.180197@gmail.com.',
    chips: ['What does the GEO service include?', 'How much is the SEO course?', 'How is SEO priced?'],
  } : {
    open: 'Hỏi trợ lý AI', title: 'Trợ lý AI', sub: 'Hỏi về dịch vụ SEO, GEO và khoá học',
    close: 'Đóng khung chat', placeholder: 'Nhập câu hỏi của bạn…', send: 'Gửi',
    hello: 'Chào bạn! Mình là trợ lý AI trên website của Hoàng. Bạn cứ hỏi về dịch vụ SEO, GEO hoặc các khoá học 1 kèm 1 nhé.',
    note: 'Trợ lý AI có thể trả lời chưa chính xác. Nội dung chat được lưu lại để Hoàng hỗ trợ bạn.',
    err: 'Xin lỗi, có lỗi khi gửi. Bạn thử lại hoặc liên hệ Zalo 0382 65 7845 nhé.',
    chips: ['Dịch vụ GEO gồm những gì?', 'Học phí khoá học SEO?', 'Báo giá SEO thế nào?'],
  };
  const ss = {
    get: (k) => { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) { /* bỏ qua */ } },
  };
  let sid = ss.get('pmh-sid');
  if (!sid) {
    sid = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
    ss.set('pmh-sid', sid);
  }
  let hist = [];
  try { hist = JSON.parse(ss.get('pmh-chat') || '[]'); } catch (e) { hist = []; }

  const h = (tag, attrs = {}, kids = []) => {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    for (const c of [].concat(kids)) el.append(c);
    return el;
  };
  const icon = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path fill="currentColor" d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4v-4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm3 6.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm5 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm5 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/></svg>';

  const btn = h('button', { class: 'cb-btn', type: 'button', 'aria-expanded': 'false', 'aria-controls': 'cb-panel' });
  btn.innerHTML = icon + '<span>' + T.open + '</span>';
  const closeBtn = h('button', { class: 'cb-close', type: 'button', 'aria-label': T.close }, '×');
  const log = h('div', { class: 'cb-log', role: 'log', 'aria-live': 'polite' });
  const chips = h('div', { class: 'cb-chips' });
  const input = h('textarea', { class: 'cb-input', rows: '1', maxlength: '800', placeholder: T.placeholder, 'aria-label': T.placeholder });
  const send = h('button', { class: 'cb-send', type: 'submit' }, T.send);
  const form = h('form', { class: 'cb-form' }, [input, send]);
  const panel = h('section', { class: 'cb-panel', id: 'cb-panel', role: 'dialog', 'aria-labelledby': 'cb-title', hidden: '' }, [
    h('header', { class: 'cb-head' }, [h('div', {}, [h('p', { class: 'cb-title', id: 'cb-title' }, T.title), h('p', { class: 'cb-sub' }, T.sub)]), closeBtn]),
    log, chips, form, h('p', { class: 'cb-note' }, T.note),
  ]);
  document.body.append(btn, panel);

  // Hiển thị chữ an toàn: xuống dòng + tự tạo link cho URL
  const render = (text) => {
    const frag = document.createDocumentFragment();
    text.split(/(https?:\/\/[^\s<>"')]+[^\s<>"').,;:!?])/g).forEach((part, i) => {
      if (i % 2) {
        const internal = part.startsWith(location.origin) || /^https:\/\/phanminhhoang-seo\.github\.io\//.test(part);
        const a = h('a', internal ? { href: part } : { href: part, rel: 'nofollow noopener', target: '_blank' }, part);
        frag.append(a);
      } else {
        part.split('\n').forEach((line, j) => { if (j) frag.append(h('br')); frag.append(line); });
      }
    });
    return frag;
  };
  const bubble = (role, text) => {
    const b = h('div', { class: 'cb-msg cb-' + role });
    b.append(render(text));
    log.append(b);
    log.scrollTop = log.scrollHeight;
    return b;
  };
  const drawChips = () => {
    chips.replaceChildren();
    if (hist.length) return;
    T.chips.forEach((c) => {
      const b = h('button', { type: 'button', class: 'cb-chip' }, c);
      b.addEventListener('click', () => ask(c));
      chips.append(b);
    });
  };
  bubble('model', T.hello);
  hist.forEach((m) => bubble(m.role, m.text));
  drawChips();

  let busy = false;
  const ask = async (text) => {
    text = text.trim().slice(0, 800);
    if (!text || busy) return;
    busy = true; send.disabled = true;
    const prev = hist.slice(-24);
    bubble('user', text);
    hist.push({ role: 'user', text });
    chips.replaceChildren();
    input.value = ''; input.style.height = '';
    const wait = bubble('model', '…');
    wait.classList.add('cb-wait');
    if (hist.length === 1 && typeof gtag === 'function') gtag('event', 'chat_start');
    let reply = '';
    try {
      const body = new URLSearchParams({ action: 'chat', cid: sid, message: text, history: JSON.stringify(prev), page: location.href, lang: en ? 'en' : 'vi' });
      const res = await fetch(PMH_ENDPOINT, { method: 'POST', body });
      const data = await res.json();
      reply = (data && data.reply) || '';
    } catch (e) { reply = ''; }
    wait.remove();
    if (reply) { hist.push({ role: 'model', text: reply }); ss.set('pmh-chat', JSON.stringify(hist.slice(-40))); }
    else { hist.pop(); }
    bubble('model', reply || T.err);
    busy = false; send.disabled = false; input.focus();
  };

  const setOpen = (open) => {
    panel.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
    btn.classList.toggle('cb-hide', open);
    if (open) { input.focus(); log.scrollTop = log.scrollHeight; } else btn.focus();
  };
  btn.addEventListener('click', () => setOpen(true));
  closeBtn.addEventListener('click', () => setOpen(false));
  panel.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  form.addEventListener('submit', (e) => { e.preventDefault(); ask(input.value); });
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(input.value); } });
  input.addEventListener('input', () => { input.style.height = ''; input.style.height = Math.min(input.scrollHeight, 120) + 'px'; });
})();
