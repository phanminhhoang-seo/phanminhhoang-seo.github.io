(function () {
  'use strict';

  var EN = /^en/i.test(document.documentElement.lang || '');
  function T(vi, en) { return EN ? en : vi; }
  var RM = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var SVGNS = 'http://www.w3.org/2000/svg';

  function build(ns, tag, a, kids) {
    var el = ns ? document.createElementNS(ns, tag) : document.createElement(tag);
    if (a) for (var k in a) {
      var v = a[k];
      if (v == null || v === false) continue;
      if (k === 'text') el.textContent = v;
      else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v);
    }
    if (kids) [].concat(kids).forEach(function (c) {
      if (c == null || c === false) return;
      el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return el;
  }
  function h(t, a, k) { return build(null, t, a, k); }
  function s(t, a, k) { return build(SVGNS, t, a, k); }
  function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); }
  function btn(label, on, extra) {
    var b = h('button', { type: 'button', 'class': 'mh-btn' + (extra ? ' ' + extra : ''), onclick: on }, label);
    return b;
  }
  function pressGroup(btns, i) { btns.forEach(function (b, j) { b.setAttribute('aria-pressed', j === i ? 'true' : 'false'); }); }
  function pct(x) { return Math.round(x * 100) + '%'; }
  function nf(x, d) { var t = x.toFixed(d); return EN ? t : t.replace('.', ','); }
  function fake() { return h('span', { 'class': 'mh-fake' }, T('Minh hoạ, số liệu giả định', 'Illustrative, made-up data')); }
  function onResize(el, fn) {
    var last = el.clientWidth, t;
    function check() { var w = el.clientWidth; if (Math.abs(w - last) > 4) { last = w; fn(); } }
    if (window.ResizeObserver) new ResizeObserver(function () { clearTimeout(t); t = setTimeout(check, 80); }).observe(el);
    else window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(check, 120); });
  }
  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  var CSS = [
    '.mh{margin:28px 0}',
    '.mh-box{--a:var(--impr,#5e35b1);--b:var(--clicks,#1a73e8);--c:var(--ctr,#00897b);--d:var(--pos,#e8710a);background:var(--surface,#fff);border:1px solid var(--rule,#dce1e8);border-radius:14px;padding:16px;font-size:.95rem;line-height:1.5;color:var(--ink,#17202c)}',
    '.mh figcaption{font-size:.88rem;color:var(--muted,#586371);margin-top:8px}',
    '.mh-head{display:flex;justify-content:space-between;align-items:baseline;gap:8px;flex-wrap:wrap;margin-bottom:10px}',
    '.mh-title{font-weight:600}',
    '.mh-fake{font-size:.75rem;color:var(--muted,#586371);border:1px dashed var(--rule,#dce1e8);border-radius:999px;padding:1px 8px}',
    '.mh-bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:0 0 12px}',
    '.mh-btn{min-height:36px;padding:0 14px;border-radius:999px;border:1px solid var(--rule,#dce1e8);background:var(--paper,#f7f8fa);color:var(--ink,#17202c);font:inherit;font-size:.88rem;cursor:pointer;line-height:1.2}',
    '.mh-btn:hover{border-color:var(--muted,#586371)}',
    '.mh-btn[aria-pressed=true]{background:var(--ink,#17202c);color:#fff;border-color:var(--ink,#17202c)}',
    '.mh-btn.pri{background:var(--a);border-color:var(--a);color:#fff}',
    '.mh-btn:disabled{opacity:.45;cursor:default}',
    '.mh-btn:focus-visible,.mh-hit:focus-visible{outline:2px solid var(--b);outline-offset:2px}',
    '.mh-lbl{font-size:.75rem;letter-spacing:.04em;text-transform:uppercase;color:var(--muted,#586371);font-weight:600}',
    '.mh-note{font-size:.85rem;color:var(--muted,#586371);margin:10px 0 0}',
    '.mh-panel{background:var(--paper,#f7f8fa);border-radius:10px;padding:12px 14px;margin-top:12px}',
    '.mh-panel p{margin:.2em 0}',
    '.mh code,.mh pre{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:.82rem}',
    '.mh pre{background:var(--ink,#17202c);color:#e6ebf2;border-radius:8px;padding:10px 12px;overflow-x:auto;margin:8px 0 0;white-space:pre}',
    '.mh svg{display:block;width:100%;height:auto;overflow:visible}',
    '.mh svg text{font-family:inherit}',
    '.mh-range{display:flex;align-items:center;gap:8px;font-size:.88rem}',
    '.mh-range input{accent-color:var(--a);width:120px}',
    '.mh-lane{margin-bottom:12px}',
    '.mh-flow{display:flex;flex-wrap:wrap;align-items:stretch;gap:6px;margin-top:6px}',
    '.mh-node{flex:1 1 0;min-width:96px;border:1.5px solid var(--rule,#dce1e8);border-radius:10px;padding:8px 10px;font-size:.85rem;background:var(--surface,#fff);transition:border-color .25s,background .25s,transform .25s}',
    '.mh-node b{display:block;font-size:.88rem}',
    '.mh-node.done{border-color:color-mix(in srgb,var(--a) 45%,#fff)}',
    '.mh-node.on{border-color:var(--a);background:color-mix(in srgb,var(--a) 9%,#fff);transform:translateY(-2px)}',
    '.mh-arr{align-self:center;color:var(--muted,#586371);font-size:1rem}',
    '.mh-sub2{display:block;font-size:.8rem;color:var(--muted,#586371)}',
    '.mh-node.on .mh-num,.mh-node.done .mh-num{background:var(--a)}',
    '@media (max-width:640px){.mh-flow{display:grid;grid-template-columns:1fr 1fr;gap:6px}.mh-arr,.mh-sub2{display:none}.mh-node{min-width:0;padding:6px 8px}.mh-node b{font-size:.82rem}}',
    '.mh-chunks{display:grid;gap:6px;margin-top:8px}',
    '.mh-chunk{display:flex;gap:10px;align-items:baseline;border:1px solid var(--rule,#dce1e8);border-radius:8px;padding:6px 10px;background:var(--surface,#fff);font-size:.86rem}',
    '.mh-score{font-variant-numeric:tabular-nums;font-weight:600;color:var(--a);min-width:3.2em}',
    '.mh-src{color:var(--c);font-size:.8rem}',
    '.mh-cite{display:inline-block;min-width:1.4em;text-align:center;border-radius:4px;background:color-mix(in srgb,var(--b) 14%,#fff);color:var(--b);font-size:.75rem;font-weight:700;padding:0 4px;margin-left:2px}',
    '.mh-fan{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.5fr) minmax(0,1fr);gap:14px;align-items:center}',
    '@media (max-width:640px){.mh-fan{grid-template-columns:1fr}}',
    '.mh-q{border:2px solid var(--a);border-radius:12px;padding:12px;font-weight:600;background:color-mix(in srgb,var(--a) 7%,#fff)}',
    '.mh-subs{display:grid;gap:6px;position:relative}',
    '.mh-sub{border:1px solid var(--rule,#dce1e8);border-left:3px solid var(--b);border-radius:8px;padding:6px 10px;font-size:.86rem;background:var(--surface,#fff);opacity:0;transform:translateX(-10px);transition:opacity .35s,transform .35s}',
    '.mh-sub.in{opacity:1;transform:none}',
    '.mh-sub small{display:block;color:var(--muted,#586371);font-size:.76rem}',
    '.mh-ans{border:2px dashed var(--rule,#dce1e8);border-radius:12px;padding:12px;font-size:.88rem;color:var(--muted,#586371);transition:all .4s}',
    '.mh-ans.in{border-style:solid;border-color:var(--c);color:var(--ink,#17202c);background:color-mix(in srgb,var(--c) 7%,#fff)}',
    '.mh-doc{border:1px solid var(--rule,#dce1e8);border-radius:10px;padding:12px;font-size:.88rem;line-height:1.75;background:var(--surface,#fff)}',
    '.mh-doc .h{font-weight:700}',
    '.mh-ck{border-radius:4px;padding:2px 0;box-decoration-break:clone;-webkit-box-decoration-break:clone}',
    '.mh-ck.c0{background:color-mix(in srgb,var(--a) 13%,#fff)}',
    '.mh-ck.c1{background:color-mix(in srgb,var(--c) 15%,#fff)}',
    '.mh-ck.pick{outline:2px solid var(--d);outline-offset:1px}',
    '.mh-num{display:inline-block;font-size:.68rem;font-weight:700;color:#fff;background:var(--muted,#586371);border-radius:999px;padding:0 6px;margin-right:4px;vertical-align:1px}',
    '.mh-sec{border:1px solid var(--rule,#dce1e8);border-radius:8px;padding:6px 10px;margin:6px 0}',
    '.mh-sec.pick{border:2px solid var(--d)}',
    '.mh mark{background:color-mix(in srgb,var(--d) 30%,#fff);color:inherit;border-radius:3px;padding:0 1px}',
    '.mh-ok{color:var(--c);font-weight:600}.mh-bad{color:#c5221f;font-weight:600}.mh-warn{color:#b45309;font-weight:600}',
    '.mh-hit{cursor:pointer}',
    '.mh-triple{display:flex;flex-wrap:wrap;gap:6px;align-items:center}',
    '.mh-triple span{border-radius:8px;padding:4px 10px;font-size:.88rem;font-weight:600}',
    '.mh-triple .s{background:color-mix(in srgb,var(--a) 13%,#fff)}',
    '.mh-triple .p{background:color-mix(in srgb,var(--d) 16%,#fff)}',
    '.mh-triple .o{background:color-mix(in srgb,var(--c) 15%,#fff)}',
    '.mh-cands{display:grid;gap:8px;grid-template-columns:repeat(auto-fit,minmax(min(100%,190px),1fr));margin-top:10px}',
    '.mh-cand{border:1.5px solid var(--rule,#dce1e8);border-radius:10px;padding:8px 10px;font-size:.86rem;transition:all .3s}',
    '.mh-cand.win{border-color:var(--c);background:color-mix(in srgb,var(--c) 8%,#fff)}',
    '.mh-meter{height:6px;border-radius:3px;background:var(--rule,#dce1e8);margin-top:6px;overflow:hidden}',
    '.mh-meter i{display:block;height:100%;background:var(--c);transition:width .4s}',
    '.mh-sent{font-size:1.02rem;margin:8px 0}',
    '.mh-sent .men{border-bottom:2px solid var(--a);font-weight:700}',
    '.mh-sent .cue{background:color-mix(in srgb,var(--d) 25%,#fff);border-radius:3px}',
    '.mh-tbl{width:100%;border-collapse:collapse;font-size:.84rem;min-width:0!important}',
    '.mh-tbl th,.mh-tbl td{padding:6px 6px;border-bottom:1px solid var(--rule,#dce1e8);text-align:center;vertical-align:middle}',
    '.mh-tbl th:first-child,.mh-tbl td:first-child{text-align:left}',
    '.mh-dot{display:inline-block;width:14px;height:14px;border-radius:50%;border:1.5px solid var(--rule,#dce1e8);vertical-align:middle}',
    '.mh-dot.y{background:var(--a);border-color:var(--a)}',
    '.mh-dot.o{background:var(--rule,#dce1e8)}',
    '.mh-bars{display:grid;gap:8px;margin-top:6px}',
    '.mh-brow{display:grid;grid-template-columns:90px 1fr 48px;gap:8px;align-items:center;font-size:.86rem}',
    '.mh-btrack{height:12px;background:var(--rule,#dce1e8);border-radius:6px;overflow:hidden}',
    '.mh-btrack i{display:block;height:100%;background:var(--a);border-radius:6px;transition:width .45s}',
    '.mh-btrack.sv i{background:var(--b)}'
  ].join('');
  function injectCSS() {
    if (document.getElementById('mh-css')) return;
    document.head.appendChild(h('style', { id: 'mh-css' }, CSS));
  }

  function box(fig, title, isFake) {
    var b = h('div', { 'class': 'mh-box' });
    b.appendChild(h('div', { 'class': 'mh-head' }, [h('span', { 'class': 'mh-title' }, title), isFake ? fake() : null]));
    var cap = fig.querySelector('figcaption');
    fig.insertBefore(b, cap);
    return b;
  }

  var C = {};

  C.rag = function (fig) {
    var b = box(fig, T('RAG: AI tìm tài liệu trước, rồi mới viết câu trả lời', 'RAG: the AI retrieves first, then writes'), true);
    var Q = T('Gạch Sao Mai bảo hành bao lâu?', 'How long is the Sao Mai tile warranty?');
    var CH = [
      [0.89, 'saomai.example/bao-hanh', T('Gạch Sao Mai được bảo hành 10 năm cho lỗi men và nứt do sản xuất…', 'Sao Mai tiles carry a 10-year warranty against glaze defects and manufacturing cracks…')],
      [0.81, 'diendan.example/gach', T('Mình mua Sao Mai năm ngoái, hãng bảo hành tận nhà khá nhanh…', 'Bought Sao Mai last year, their on-site warranty service was quick…')],
      [0.62, 'saomai.example/gioi-thieu', T('Sao Mai sản xuất gạch ốp lát từ năm 2015…', 'Sao Mai has made floor and wall tiles since 2015…')]
    ];
    var lanes = [
      { name: T('Giai đoạn 1 · chuẩn bị (trước khi có câu hỏi)', 'Stage 1 · indexing (before any question)'), nodes: [
        [T('Trang web, tài liệu', 'Web pages, documents'), T('nguồn', 'sources')],
        [T('Cắt thành đoạn', 'Split into chunks'), 'chunking'],
        [T('Đổi thành vector', 'Turn into vectors'), 'embedding'],
        [T('Kho vector', 'Vector store'), T('đoạn + link', 'chunk + link')]] },
      { name: T('Giai đoạn 2 · khi người dùng hỏi', 'Stage 2 · when someone asks'), nodes: [
        [T('Câu hỏi', 'Question'), T('người dùng', 'user')],
        [T('Vector câu hỏi', 'Query vector'), 'embedding'],
        [T('Lấy K đoạn gần nhất', 'Fetch top-K chunks'), 'retrieval'],
        [T('Ghép vào prompt', 'Build the prompt'), T('câu hỏi + đoạn', 'question + chunks')],
        [T('LLM trả lời', 'LLM answers'), T('kèm nguồn', 'with citations')]] }
    ];
    var STEPS = [
      T('Hệ thống có sẵn một nguồn dữ liệu: chỉ mục web của công cụ tìm kiếm, hoặc kho tài liệu riêng của doanh nghiệp.', 'The system starts from a corpus: a search engine\'s web index or a company\'s own documents.'),
      T('Mỗi trang được cắt thành nhiều đoạn nhỏ. AI lấy về từng đoạn, không lấy cả trang, nên một đoạn phải tự hiểu được khi đứng riêng.', 'Each page is split into chunks. The AI retrieves chunks, not whole pages, so each chunk has to make sense on its own.'),
      T('Mô hình embedding đổi mỗi đoạn thành một dãy số (vector) thể hiện ý nghĩa của đoạn.', 'An embedding model turns each chunk into a list of numbers (a vector) that captures its meaning.'),
      T('Vector được lưu cùng đoạn văn gốc và đường link để sau này trích dẫn.', 'Vectors are stored with the original text and URL so they can be cited later.'),
      T('Người dùng hỏi: “' + Q + '”', 'The user asks: “' + Q + '”'),
      T('Câu hỏi cũng được đổi thành vector, bằng cùng mô hình embedding.', 'The question is embedded with the same model.'),
      T('Hệ thống lấy K đoạn có vector gần với câu hỏi nhất. Đoạn không lọt vào đây thì không có cơ hội được trích dẫn.', 'The system fetches the K chunks closest to the question. A chunk that misses this cut cannot be cited.'),
      T('Câu hỏi và các đoạn tìm được được ghép thành prompt gửi cho LLM.', 'The question and retrieved chunks are combined into the prompt.'),
      T('LLM viết câu trả lời dựa trên các đoạn đó và gắn nguồn cho từng ý.', 'The LLM writes an answer grounded in those chunks and cites them.')
    ];
    var nodeEls = [];
    lanes.forEach(function (ln) {
      var flow = h('div', { 'class': 'mh-flow' });
      ln.nodes.forEach(function (n, i) {
        if (i) flow.appendChild(h('span', { 'class': 'mh-arr', 'aria-hidden': 'true' }, '→'));
        var el = h('div', { 'class': 'mh-node' }, [h('b', null, [h('span', { 'class': 'mh-num' }, String(nodeEls.length + 1)), n[0]]), h('span', { 'class': 'mh-sub2' }, n[1])]);
        nodeEls.push(el); flow.appendChild(el);
      });
      b.appendChild(h('div', { 'class': 'mh-lane' }, [h('div', { 'class': 'mh-lbl' }, ln.name), flow]));
    });
    var panel = h('div', { 'class': 'mh-panel', 'aria-live': 'polite' });
    var prev = btn('◀ ' + T('Trước', 'Back'), function () { stop(); go(cur - 1); });
    var next = btn(T('Bước tiếp', 'Next step') + ' ▶', function () { stop(); go(cur + 1); }, 'pri');
    var play = btn('▶ ' + T('Chạy hết', 'Play all'), function () { timer ? stop() : run(); });
    var count = h('span', { 'class': 'mh-note', style: 'margin:0' });
    b.appendChild(h('div', { 'class': 'mh-bar', style: 'margin-top:4px' }, [prev, next, play, count]));
    b.appendChild(panel);
    var cur = 0, timer = null;

    function extra(i) {
      if (i === 6 || i === 7) {
        return h('div', { 'class': 'mh-chunks' }, CH.map(function (c, k) {
          return h('div', { 'class': 'mh-chunk' }, [h('span', { 'class': 'mh-score' }, nf(c[0], 2)),
            h('span', null, [c[2], ' ', h('span', { 'class': 'mh-src' }, c[1])]), h('span', { 'class': 'mh-cite' }, String(k + 1))]);
        }));
      }
      if (i === 8) {
        return h('div', { 'class': 'mh-chunk', style: 'margin-top:8px;display:block' }, [
          T('Gạch Sao Mai được bảo hành 10 năm cho lỗi men và nứt do sản xuất', 'Sao Mai tiles have a 10-year warranty for glaze defects and manufacturing cracks'),
          h('span', { 'class': 'mh-cite' }, '1'), '. ',
          T('Người dùng cũng cho biết hãng hỗ trợ bảo hành tận nhà', 'Users also report on-site warranty service'),
          h('span', { 'class': 'mh-cite' }, '2'), '.']);
      }
      return null;
    }
    function go(i) {
      cur = Math.max(0, Math.min(STEPS.length - 1, i));
      nodeEls.forEach(function (el, k) {
        el.classList.toggle('on', k === cur);
        el.classList.toggle('done', k < cur);
      });
      clear(panel);
      panel.appendChild(h('p', null, [h('b', null, T('Bước ', 'Step ') + (cur + 1) + '. '), STEPS[cur]]));
      var x = extra(cur); if (x) panel.appendChild(x);
      count.textContent = (cur + 1) + ' / ' + STEPS.length;
      prev.disabled = cur === 0; next.disabled = cur === STEPS.length - 1;
    }
    function run() {
      if (cur >= STEPS.length - 1) go(0);
      play.textContent = '⏸ ' + T('Dừng', 'Pause');
      timer = setInterval(function () { if (cur >= STEPS.length - 1) return stop(); go(cur + 1); }, 2400);
    }
    function stop() { clearInterval(timer); timer = null; play.textContent = '▶ ' + T('Chạy hết', 'Play all'); }
    go(0);
    if (!RM) whenVisible(b, run);
    b.appendChild(h('p', { 'class': 'mh-note' }, T('Gạch Sao Mai và các trang .example là ví dụ giả định. Điểm số là độ gần giữa vector câu hỏi và vector đoạn văn.', 'Sao Mai and the .example sites are fictional. Scores show how close each chunk vector is to the query vector.')));
  };

  C.vector = function (fig) {
    var b = box(fig, T('Vector search: tìm đoạn gần nghĩa nhất với câu hỏi', 'Vector search: find the chunks closest in meaning'), true);
    var P = [
      [.12, .20, T('Giá gạch 60×60: 245.000 đ/m²', '60×60 tile price: 245,000 VND/m²')],
      [.24, .11, T('Bảng giá gạch ốp tường 2026', '2026 wall tile price list')],
      [.16, .36, T('Mua từ 100 m² được giảm 5%', '5% off orders over 100 m²')],
      [.58, .15, T('Bảo hành 10 năm cho lỗi men', '10-year warranty on glaze defects')],
      [.67, .28, T('Đổi trả trong 7 ngày nếu gạch lỗi', 'Defective tiles can be returned within 7 days')],
      [.54, .38, T('Quy trình bảo hành tận nhà', 'On-site warranty process')],
      [.14, .62, T('Gạch 30×60 hợp phòng tắm nhỏ', '30×60 tiles suit small bathrooms')],
      [.27, .76, T('Gạch chống trơn cho nhà tắm', 'Anti-slip bathroom tiles')],
      [.08, .88, T('Các kích thước gạch phổ biến', 'Common tile sizes')],
      [.50, .68, T('Cách lát gạch phòng tắm', 'How to lay bathroom tiles')],
      [.62, .86, T('Vệ sinh mạch gạch bằng gì', 'How to clean tile grout')],
      [.92, .58, T('Tuyển nhân viên kho', 'Hiring warehouse staff')],
      [.90, .92, T('Giá trị cốt lõi của công ty', 'Our company values')],
      [.42, .52, T('Sao Mai thành lập năm 2015', 'Sao Mai was founded in 2015')]
    ];
    var QS = [
      { t: T('Gạch này giá bao nhiêu?', 'How much does this tile cost?'), x: .21, y: .26, hl: 12,
        n: T('“Giá trị cốt lõi của công ty” có chữ “giá” nhưng nằm rất xa: trùng chữ nhưng khác nghĩa.', '“Our company values” shares the word “value” with pricing talk, but sits far away: same word, different meaning.') },
      { t: T('Lỡ gạch hỏng thì sao?', 'What if a tile breaks?'), x: .62, y: .23,
        n: T('Câu hỏi không có chữ “bảo hành” nào, nhưng các đoạn về bảo hành vẫn gần nhất vì cùng ý.', 'The question never says “warranty”, yet warranty chunks are closest because they mean the same thing.') },
      { t: T('Phòng tắm nhỏ nên lát gạch gì?', 'Which tiles for a small bathroom?'), x: .21, y: .68, hl: 9,
        n: T('“Cách lát gạch phòng tắm” có nhiều chữ trùng nhưng nói về thi công, nên xếp sau các đoạn về loại gạch.', '“How to lay bathroom tiles” shares many words but is about installation, so it ranks below tile-choice chunks.') }
    ];
    var qi = 0, K = 3, pin = -1;
    var qb = QS.map(function (q, i) { return btn(q.t, function () { qi = i; pin = -1; pressGroup(qb, qi); draw(); }); });
    pressGroup(qb, 0);
    var kOut = h('b', null, '3');
    var kIn = h('input', { type: 'range', min: 1, max: 5, value: 3, 'aria-label': 'K', oninput: function () { K = +kIn.value; kOut.textContent = K; draw(); } });
    b.appendChild(h('div', { 'class': 'mh-bar' }, qb));
    b.appendChild(h('div', { 'class': 'mh-bar' }, [h('label', { 'class': 'mh-range' }, ['K =', kIn, kOut]),
      h('span', { 'class': 'mh-note', style: 'margin:0' }, T('số đoạn được lấy về', 'chunks retrieved'))]));
    var wrap = h('div'); b.appendChild(wrap);
    var list = h('div', { 'class': 'mh-chunks', 'aria-live': 'polite' }); b.appendChild(list);
    var note = h('p', { 'class': 'mh-note' }); b.appendChild(note);
    b.appendChild(h('p', { 'class': 'mh-note' }, T('Bản đồ 2 chiều chỉ để dễ hình dung. Vector thật có hàng trăm đến hàng nghìn chiều và độ gần thường đo bằng cosine.', 'The 2-D map is a simplification. Real embeddings have hundreds or thousands of dimensions, and closeness is usually cosine similarity.')));

    function draw() {
      var W = Math.max(280, wrap.clientWidth || 600), H = Math.round(W < 480 ? W * .9 : W * .52), pad = 22;
      var X = function (v) { return pad + v * (W - 2 * pad); }, Y = function (v) { return pad + v * (H - 2 * pad); };
      var q = QS[qi];
      var ranked = P.map(function (p, i) {
        var d = Math.hypot(p[0] - q.x, (p[1] - q.y));
        return { i: i, d: d, sim: Math.max(0, 1 - d / 1.1) };
      }).sort(function (a, c) { return a.d - c.d; });
      var top = ranked.slice(0, K), topSet = {};
      top.forEach(function (r) { topSet[r.i] = 1; });
      var svg = s('svg', { viewBox: '0 0 ' + W + ' ' + H, width: W, height: H, role: 'img',
        'aria-label': T('Bản đồ các đoạn văn và câu hỏi; các đoạn gần câu hỏi nhất được nối lại', 'Map of chunks and the query; the closest chunks are connected') });
      svg.appendChild(s('rect', { x: 1, y: 1, width: W - 2, height: H - 2, rx: 10, fill: 'var(--paper,#f7f8fa)', stroke: 'var(--rule,#dce1e8)' }));
      var rr = top[top.length - 1].d;
      svg.appendChild(s('ellipse', { cx: X(q.x), cy: Y(q.y), rx: rr * (W - 2 * pad) + 14, ry: rr * (H - 2 * pad) + 14,
        fill: 'color-mix(in srgb,var(--impr,#5e35b1) 6%,transparent)', stroke: 'var(--impr,#5e35b1)', 'stroke-dasharray': '4 4', opacity: .8 }));
      top.forEach(function (r) {
        var p = P[r.i];
        svg.appendChild(s('line', { x1: X(q.x), y1: Y(q.y), x2: X(p[0]), y2: Y(p[1]), stroke: 'var(--impr,#5e35b1)', 'stroke-width': 1.5 }));
      });
      P.forEach(function (p, i) {
        var on = topSet[i], hl = q.hl === i;
        var g = s('g', { 'class': 'mh-hit', tabindex: 0, role: 'button', 'aria-label': p[2], onclick: function () { pin = pin === i ? -1 : i; draw(); } });
        g.appendChild(s('circle', { cx: X(p[0]), cy: Y(p[1]), r: on ? 11 : 9, fill: on ? 'var(--ctr,#00897b)' : '#fff', stroke: hl ? 'var(--pos,#e8710a)' : on ? 'var(--ctr,#00897b)' : 'var(--muted,#586371)', 'stroke-width': hl ? 2.5 : 1.5 }));
        g.appendChild(s('text', { x: X(p[0]), y: Y(p[1]) + 4, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 700, fill: on ? '#fff' : 'var(--ink,#17202c)' }, String(i + 1)));
        svg.appendChild(g);
        if ((on || hl || pin === i) && W >= 420) {
          var left = p[0] > .72, tx = X(p[0]) + (left ? -15 : 15), fz = 12, tw = p[2].length * fz * .52 + 8;
          svg.appendChild(s('rect', { x: left ? tx - tw + 4 : tx - 4, y: Y(p[1]) - 9, width: tw, height: 18, rx: 4, fill: 'var(--surface,#fff)', opacity: .92 }));
          svg.appendChild(s('text', { x: tx, y: Y(p[1]) + 4, 'text-anchor': left ? 'end' : 'start', 'font-size': fz,
            fill: on ? 'var(--ink,#17202c)' : 'var(--pos,#e8710a)', 'font-weight': on ? 600 : 500 }, p[2]));
        }
      });
      var qx = X(q.x), qy = Y(q.y), r = 10, star = '';
      for (var k = 0; k < 10; k++) { var a = Math.PI / 5 * k - Math.PI / 2, rad = k % 2 ? r * .45 : r; star += (k ? 'L' : 'M') + (qx + rad * Math.cos(a)).toFixed(1) + ' ' + (qy + rad * Math.sin(a)).toFixed(1); }
      svg.appendChild(s('path', { d: star + 'Z', fill: 'var(--pos,#e8710a)', stroke: '#fff', 'stroke-width': 1 }));
      clear(wrap); wrap.appendChild(svg);
      clear(list);
      list.appendChild(h('div', { 'class': 'mh-lbl' }, T('Top-' + K + ' đoạn được lấy về', 'Top-' + K + ' retrieved chunks')));
      top.forEach(function (r2, k) {
        list.appendChild(h('div', { 'class': 'mh-chunk' }, [h('span', { 'class': 'mh-score' }, nf(r2.sim, 2)),
          h('span', null, [h('span', { 'class': 'mh-num', style: 'background:var(--ctr,#00897b)' }, String(r2.i + 1)), P[r2.i][2]])]));
      });
      note.textContent = pin > -1 ? (pin + 1) + '. ' + P[pin][2] : q.n;
    }
    draw(); onResize(wrap, draw);
  };

  C.fanout = function (fig) {
    var b = box(fig, T('Query fan-out: một câu hỏi, nhiều truy vấn con', 'Query fan-out: one question, many sub-queries'), true);
    var SRC = { w: T('trang doanh nghiệp', 'company site'), f: T('diễn đàn', 'forum'), n: T('báo', 'news'), v: 'video', g: T('hướng dẫn chính thức', 'official docs'), r: T('trang review', 'review site') };
    var EX = [
      { q: T('Nên học SEO ở đâu?', 'Where should I learn SEO?'), subs: [
        [T('khoá học SEO online uy tín', 'reputable online SEO courses'), 'wrf'],
        [T('học phí khoá học SEO', 'SEO course fees'), 'wr'],
        [T('review khoá học SEO', 'SEO course reviews'), 'frv'],
        [T('học SEO 1 kèm 1', '1-on-1 SEO tutoring'), 'wf'],
        [T('lộ trình học SEO cho người mới', 'SEO learning path for beginners'), 'vgw']] },
      { q: T('Phòng tắm nhỏ nên lát gạch gì?', 'Best tiles for a small bathroom?'), subs: [
        [T('kích thước gạch cho phòng tắm nhỏ', 'tile size for small bathrooms'), 'wf'],
        [T('gạch chống trơn phòng tắm', 'anti-slip bathroom tiles'), 'wn'],
        [T('màu gạch giúp phòng tắm rộng hơn', 'tile colours that make bathrooms look bigger'), 'vn'],
        [T('gạch 30×60 hay 60×60 cho phòng tắm', '30×60 vs 60×60 for bathrooms'), 'fw'],
        [T('giá gạch phòng tắm 2026', 'bathroom tile prices 2026'), 'wr']] },
      { q: T('Có nên dùng AI viết bài SEO?', 'Should I use AI to write SEO content?'), subs: [
        [T('Google có phạt nội dung AI không', 'does Google penalise AI content'), 'gn'],
        [T('hướng dẫn nội dung của Google 2026', 'Google content guidelines 2026'), 'g'],
        [T('ưu nhược điểm viết bài bằng AI', 'pros and cons of AI writing'), 'nfv'],
        [T('cách biên tập nội dung AI', 'how to edit AI drafts'), 'vw'],
        [T('ví dụ bài SEO viết bằng AI', 'examples of AI-written SEO pages'), 'fr']] }
    ];
    var ei = 0, timers = [];
    var eb = EX.map(function (e, i) { return btn(e.q, function () { ei = i; pressGroup(eb, i); play(); }); });
    pressGroup(eb, 0);
    var replay = btn('↻ ' + T('Chạy lại', 'Replay'), function () { play(); });
    b.appendChild(h('div', { 'class': 'mh-bar' }, eb.concat([replay])));
    var qEl = h('div', { 'class': 'mh-q' }), subs = h('div', { 'class': 'mh-subs', 'aria-live': 'polite' }), ans = h('div', { 'class': 'mh-ans' });
    b.appendChild(h('div', { 'class': 'mh-fan' }, [
      h('div', null, [h('div', { 'class': 'mh-lbl' }, T('Câu hỏi gốc', 'Original question')), qEl]),
      h('div', null, [h('div', { 'class': 'mh-lbl' }, T('Truy vấn con AI tự tạo', 'Sub-queries the AI generates')), subs]),
      h('div', null, [h('div', { 'class': 'mh-lbl' }, T('Câu trả lời', 'Answer')), ans])]));
    b.appendChild(h('p', { 'class': 'mh-note' }, T('Truy vấn con chỉ là ví dụ minh hoạ: Google và OpenAI không công khai truy vấn thật mà hệ thống tạo ra.', 'Sub-queries are illustrative: Google and OpenAI do not publish the real queries their systems generate.')));
    function play() {
      timers.forEach(clearTimeout); timers = [];
      var e = EX[ei], total = 0;
      qEl.textContent = e.q; clear(subs);
      ans.classList.remove('in'); ans.textContent = T('Đang tổng hợp…', 'Synthesising…');
      var els = e.subs.map(function (sb) {
        total += sb[1].length;
        var el = h('div', { 'class': 'mh-sub' }, [sb[0], h('small', null, sb[1].split('').map(function (c) { return SRC[c]; }).join(' · '))]);
        subs.appendChild(el); return el;
      });
      var gap = RM ? 0 : 380;
      els.forEach(function (el, i) { timers.push(setTimeout(function () { el.classList.add('in'); }, gap * (i + 1))); });
      timers.push(setTimeout(function () {
        ans.classList.add('in');
        ans.textContent = T('Một câu trả lời tổng hợp từ ' + total + ' nguồn của ' + e.subs.length + ' truy vấn con. Trang của bạn có thể được trích dẫn nhờ một truy vấn con, dù không xếp hạng cho câu hỏi gốc.',
          'One answer synthesised from ' + total + ' sources across ' + e.subs.length + ' sub-queries. Your page can be cited through a sub-query even if it does not rank for the original question.');
      }, gap * (els.length + 1.5)));
    }
    play();
  };

  C.chunk = function (fig) {
    var b = box(fig, T('Chunking: cùng một bài, hai cách cắt', 'Chunking: one page, two ways to split it'), true);
    var TITLE = T('Gạch ốp lát Sao Mai 60×60', 'Sao Mai 60×60 tiles');
    var SECS = [
      [T('Giới thiệu', 'Overview'), T('Gạch Sao Mai 60×60 là dòng gạch men bóng cho phòng khách và phòng ngủ. Bề mặt chống trầy, màu không phai.', 'Sao Mai 60×60 is a glossy glazed tile for living rooms and bedrooms. The surface resists scratches and the colour does not fade.')],
      [T('Kích thước', 'Sizes'), T('Dòng này có ba kích thước: 30×60, 60×60 và 80×80 cm. Độ dày từ 8 đến 10 mm.', 'The range comes in three sizes: 30×60, 60×60 and 80×80 cm. Thickness is 8 to 10 mm.')],
      [T('Giá bán', 'Price'), T('Giá niêm yết năm 2026 là 245.000 đồng mỗi mét vuông. Mua từ 100 m² được giảm 5%.', 'The 2026 list price is 245,000 VND per square metre. Orders over 100 m² get 5% off.')],
      [T('Bảo hành', 'Warranty'), T('Sản phẩm được bảo hành 10 năm cho lỗi men và nứt do sản xuất. Khách gửi ảnh và hoá đơn để được hỗ trợ.', 'Products carry a 10-year warranty against glaze defects and manufacturing cracks. Send a photo and the invoice to claim.')],
      [T('Vệ sinh', 'Cleaning'), T('Lau bằng nước ấm pha xà phòng trung tính. Không dùng axit vì làm mờ men.', 'Clean with warm water and neutral soap. Avoid acid, which dulls the glaze.')]
    ];
    var QS = [
      { t: T('Gạch bảo hành bao lâu?', 'How long is the warranty?'), a: T('bảo hành 10 năm', '10-year warranty'), kw: T(['bảo hành', 'năm', 'lỗi'], ['warranty', 'year', 'defects']) },
      { t: T('Giá bao nhiêu một mét vuông?', 'What is the price per square metre?'), a: T('245.000 đồng mỗi mét vuông', '245,000 VND per square metre'), kw: T(['giá', 'mét vuông', 'đồng'], ['price', 'square metre', 'VND']) },
      { t: T('Có những kích thước nào?', 'Which sizes are available?'), a: T('30×60, 60×60 và 80×80 cm', '30×60, 60×60 and 80×80 cm'), kw: T(['kích thước', '×'], ['sizes', '×']) }
    ];
    var SIZE = EN ? 110 : 100;
    var mode = 0, qi = 0;
    var mb = [btn(T('Cắt mỗi ' + SIZE + ' ký tự', 'Every ' + SIZE + ' characters'), function () { mode = 0; pressGroup(mb, 0); draw(); }),
      btn(T('Cắt theo heading', 'By heading'), function () { mode = 1; pressGroup(mb, 1); draw(); })];
    pressGroup(mb, 0);
    var qb = QS.map(function (q, i) { return btn(q.t, function () { qi = i; pressGroup(qb, i); draw(); }); });
    pressGroup(qb, 0);
    b.appendChild(h('div', { 'class': 'mh-bar' }, [h('span', { 'class': 'mh-lbl' }, T('Cách cắt', 'Split')), mb[0], mb[1]]));
    b.appendChild(h('div', { 'class': 'mh-bar' }, [h('span', { 'class': 'mh-lbl' }, T('Câu hỏi', 'Question'))].concat(qb)));
    var doc = h('div', { 'class': 'mh-doc' }), out = h('div', { 'class': 'mh-panel', 'aria-live': 'polite' });
    b.appendChild(doc); b.appendChild(out);

    var FLAT = TITLE + '. ' + SECS.map(function (x) { return x[0] + '. ' + x[1]; }).join(' ');
    function fixedChunks() {
      var res = [], i = 0;
      while (i < FLAT.length) {
        var end = Math.min(FLAT.length, i + SIZE);
        if (end < FLAT.length) { var sp = FLAT.lastIndexOf(' ', end); if (sp > i + SIZE * .6) end = sp; }
        res.push(FLAT.slice(i, end).trim()); i = end;
      }
      return res;
    }
    function headChunks() { return SECS.map(function (x) { return { crumb: TITLE + ' › ' + x[0], body: x[1] }; }); }
    function score(text, kw) { var t = text.toLowerCase(), n = 0; kw.forEach(function (k) { if (t.indexOf(k.toLowerCase()) > -1) n++; }); return n; }
    function markText(text, ans) {
      var i = text.toLowerCase().indexOf(ans.toLowerCase());
      if (i < 0) return [text];
      return [text.slice(0, i), h('mark', null, text.slice(i, i + ans.length)), text.slice(i + ans.length)];
    }
    function draw() {
      var q = QS[qi]; clear(doc); clear(out);
      var chunks, pick = 0, best = -1, texts;
      if (mode === 0) {
        chunks = fixedChunks(); texts = chunks;
      } else {
        chunks = headChunks(); texts = chunks.map(function (c) { return c.crumb + ': ' + c.body; });
      }
      texts.forEach(function (t, i) { var sc = score(t, q.kw); if (sc > best) { best = sc; pick = i; } });
      if (mode === 0) {
        chunks.forEach(function (t, i) {
          var sp = h('span', { 'class': 'mh-ck c' + (i % 2) + (i === pick ? ' pick' : '') }, [h('span', { 'class': 'mh-num' }, String(i + 1))].concat(i === pick ? markText(t, q.a) : [t]));
          doc.appendChild(sp); doc.appendChild(document.createTextNode(' '));
        });
      } else {
        doc.appendChild(h('div', { 'class': 'h' }, TITLE));
        chunks.forEach(function (c, i) {
          doc.appendChild(h('div', { 'class': 'mh-sec' + (i === pick ? ' pick' : '') }, [h('span', { 'class': 'mh-num' }, String(i + 1)),
            h('span', { 'class': 'h' }, SECS[i][0] + '. ')].concat(i === pick ? markText(c.body, q.a) : [c.body])));
        });
      }
      var got = texts[pick];
      var full = got.toLowerCase().indexOf(q.a.toLowerCase()) > -1;
      out.appendChild(h('div', { 'class': 'mh-lbl' }, T('Đoạn AI lấy về (đoạn ' + (pick + 1) + ')', 'Chunk the AI retrieves (#' + (pick + 1) + ')')));
      out.appendChild(h('p', null, '“' + got + '”'));
      out.appendChild(h('p', { 'class': full ? (mode ? 'mh-ok' : 'mh-warn') : 'mh-bad' }, full
        ? (mode ? T('Đủ để trả lời, và đoạn mang theo tên sản phẩm nên AI biết đang nói về gạch nào.', 'Enough to answer, and the chunk carries the product name, so the AI knows which tile it is about.')
          : T('Đủ để trả lời, nhưng đoạn không mang tên sản phẩm. Nếu nhiều trang cùng nói “bảo hành 10 năm”, AI khó biết của hãng nào.', 'Enough to answer, but the product name is missing. If many pages say the same thing, the AI cannot tell whose it is.'))
        : T('Câu trả lời bị cắt ngang sang đoạn bên cạnh: AI lấy được nửa ý, dễ trả lời thiếu hoặc bỏ qua nguồn này.', 'The answer is cut across two chunks: the AI gets half the fact and may answer incompletely or skip this source.')));
    }
    draw();
    b.appendChild(h('p', { 'class': 'mh-note' }, T('Ở chế độ cắt theo heading, mỗi đoạn được gắn kèm tiêu đề bài và tên mục. Đây là cách nhiều hệ thống RAG làm, nhưng mỗi nền tảng AI cắt theo cách riêng và không công khai.', 'In heading mode each chunk is prefixed with the page title and section name. Many RAG systems do this, but each AI platform uses its own undisclosed method.')));
  };

  C.kg = function (fig) {
    var b = box(fig, T('Knowledge graph: mỗi đường nối là một triple', 'Knowledge graph: every edge is a triple'), true);
    var N = {
      A: [T('Gạch Sao Mai', 'Sao Mai Tiles'), T('Tổ chức', 'Organization'), .50, .44, .50, .40, '--impr'],
      H: [T('TP. Hồ Chí Minh', 'Ho Chi Minh City'), T('Thành phố', 'City'), .14, .14, .15, .08, '--ctr'],
      V: [T('Việt Nam', 'Vietnam'), T('Quốc gia', 'Country'), .06, .80, .13, .64, '--ctr'],
      B: [T('Nguyễn Văn B', 'Nguyen Van B'), T('Người', 'Person'), .34, .90, .46, .92, '--clicks'],
      Y: ['2015', T('Năm', 'Year'), .88, .16, .85, .08, '--pos'],
      P: [T('Gạch ốp lát', 'Floor & wall tiles'), T('Sản phẩm', 'Product'), .86, .82, .86, .64, '--pos']
    };
    var E = [
      ['A', 'H', T('có trụ sở tại', 'located in'), 'location', '"location": { "@type": "City", "name": "' + N.H[0] + '" }'],
      ['A', 'B', T('người sáng lập', 'founder'), 'founder', '"founder": { "@type": "Person", "name": "' + N.B[0] + '" }'],
      ['A', 'Y', T('năm thành lập', 'founding date'), 'foundingDate', '"foundingDate": "2015"'],
      ['A', 'P', T('bán sản phẩm', 'offers'), 'makesOffer', '"makesOffer": { "@type": "Offer", "itemOffered": { "@type": "Product", "category": "' + N.P[0] + '" } }'],
      ['H', 'V', T('thuộc', 'part of'), 'containedInPlace', '"containedInPlace": { "@type": "Country", "name": "' + N.V[0] + '" }'],
      ['B', 'V', T('quốc tịch', 'nationality'), 'nationality', '"nationality": { "@type": "Country", "name": "' + N.V[0] + '" }']
    ];
    var TYPES = { A: 'Organization', H: 'City', B: 'Person' };
    var sel = { e: 0 };
    var wrap = h('div'); b.appendChild(wrap);
    var panel = h('div', { 'class': 'mh-panel', 'aria-live': 'polite' }); b.appendChild(panel);
    b.appendChild(h('p', { 'class': 'mh-note' }, T('Bấm vào một đường nối hoặc một thực thể. Doanh nghiệp và người trong ví dụ là giả định.', 'Tap an edge or an entity. The company and person are fictional.')));

    function showEdge(i) {
      var e = E[i]; clear(panel);
      panel.appendChild(h('div', { 'class': 'mh-triple' }, [h('span', { 'class': 's' }, N[e[0]][0]), '→', h('span', { 'class': 'p' }, e[2]), '→', h('span', { 'class': 'o' }, N[e[1]][0])]));
      panel.appendChild(h('p', { 'class': 'mh-note' }, T('Chủ thể – quan hệ – đối tượng. Trên website, triple này được khai báo bằng thuộc tính schema.org ', 'Subject – predicate – object. On a website this triple is declared with the schema.org property ') + e[3] + ':'));
      panel.appendChild(h('pre', null, '{\n  "@context": "https://schema.org",\n  "@type": "' + TYPES[e[0]] + '",\n  "name": "' + N[e[0]][0] + '",\n  ' + e[4] + '\n}'));
    }
    function showNode(id) {
      clear(panel);
      panel.appendChild(h('p', null, [h('b', null, N[id][0]), ' · ' + N[id][1]]));
      E.forEach(function (e, i) {
        if (e[0] !== id && e[1] !== id) return;
        panel.appendChild(h('div', { 'class': 'mh-triple', style: 'margin:6px 0' }, [h('span', { 'class': 's' }, N[e[0]][0]), '→', h('span', { 'class': 'p' }, e[2]), '→', h('span', { 'class': 'o' }, N[e[1]][0])]));
      });
      panel.appendChild(h('p', { 'class': 'mh-note' }, T('Mọi dữ kiện về một thực thể đều là các triple nối vào nó.', 'Everything known about an entity is the set of triples attached to it.')));
    }
    function draw() {
      var W = Math.max(280, wrap.clientWidth || 600), narrow = W < 520, H = Math.round(narrow ? W * 1.3 : W * .6);
      var pos = function (id) { var n = N[id]; return narrow ? [24 + n[4] * (W - 48), 24 + n[5] * (H - 48)] : [40 + n[2] * (W - 80), 30 + n[3] * (H - 60)]; };
      var svg = s('svg', { viewBox: '0 0 ' + W + ' ' + H, width: W, height: H, role: 'img', 'aria-label': T('Đồ thị thực thể của một doanh nghiệp mẫu', 'Entity graph of a sample company') });
      svg.appendChild(s('defs', null, [s('marker', { id: 'mh-ar', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' },
        [s('path', { d: 'M0 0L10 5L0 10z', fill: 'var(--muted,#586371)' })])]));
      var fs = narrow ? 11 : 12.5;
      E.forEach(function (e, i) {
        var a = pos(e[0]), c = pos(e[1]), on = sel.e === i;
        var dx = c[0] - a[0], dy = c[1] - a[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, R = narrow ? 32 : 40;
        var x1 = a[0] + ux * R, y1 = a[1] + uy * R, x2 = c[0] - ux * R, y2 = c[1] - uy * R;
        var g = s('g', { 'class': 'mh-hit', tabindex: 0, role: 'button', 'aria-label': N[e[0]][0] + ' ' + e[2] + ' ' + N[e[1]][0],
          onclick: function () { sel = { e: i }; draw(); showEdge(i); },
          onkeydown: function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); sel = { e: i }; draw(); showEdge(i); } } });
        g.appendChild(s('line', { x1: x1, y1: y1, x2: x2, y2: y2, stroke: 'transparent', 'stroke-width': 18 }));
        g.appendChild(s('line', { x1: x1, y1: y1, x2: x2, y2: y2, stroke: on ? 'var(--pos,#e8710a)' : 'var(--muted,#586371)', 'stroke-width': on ? 2.5 : 1.4, 'marker-end': 'url(#mh-ar)' }));
        var mx = (x1 + x2) / 2, my = (y1 + y2) / 2, tw = e[2].length * fs * .58 + 14;
        if (narrow && !on) { g.appendChild(s('circle', { cx: mx, cy: my, r: 5, fill: 'var(--surface,#fff)', stroke: 'var(--muted,#586371)' })); svg.appendChild(g); return; }
        g.appendChild(s('rect', { x: mx - tw / 2, y: my - fs * .9, width: tw, height: fs * 1.7, rx: 6, fill: on ? 'var(--pos,#e8710a)' : 'var(--surface,#fff)', stroke: on ? 'none' : 'var(--rule,#dce1e8)' }));
        g.appendChild(s('text', { x: mx, y: my + fs * .35, 'text-anchor': 'middle', 'font-size': fs, fill: on ? '#fff' : 'var(--ink,#17202c)' }, e[2]));
        svg.appendChild(g);
      });
      Object.keys(N).forEach(function (id) {
        var n = N[id], p = pos(id), R = narrow ? 32 : 40, on = sel.n === id;
        var g = s('g', { 'class': 'mh-hit', tabindex: 0, role: 'button', 'aria-label': n[0] + ', ' + n[1],
          onclick: function () { sel = { n: id }; draw(); showNode(id); },
          onkeydown: function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); sel = { n: id }; draw(); showNode(id); } } });
        g.appendChild(s('circle', { cx: p[0], cy: p[1], r: R, fill: 'color-mix(in srgb,var(' + n[6] + ') ' + (on ? 30 : 13) + '%,#fff)', stroke: 'var(' + n[6] + ')', 'stroke-width': on ? 3 : 1.5 }));
        var words = n[0].split(' '), lines = words.length > 2 ? [words.slice(0, words.length - 1).join(' '), words[words.length - 1]] : words.length === 2 && n[0].length > 9 ? words : [n[0]];
        lines.forEach(function (ln, k) {
          g.appendChild(s('text', { x: p[0], y: p[1] + (k - (lines.length - 1) / 2) * (fs + 3) + fs * .36, 'text-anchor': 'middle', 'font-size': fs - .5, 'font-weight': 700, fill: 'var(--ink,#17202c)' }, ln));
        });
        g.appendChild(s('text', { x: p[0], y: p[1] + R + fs + 2, 'text-anchor': 'middle', 'font-size': fs - 1.5, fill: 'var(--muted,#586371)' }, n[1]));
        svg.appendChild(g);
      });
      clear(wrap); wrap.appendChild(svg);
    }
    draw(); showEdge(0); onResize(wrap, draw);
  };

  C['entity-link'] = function (fig) {
    var b = box(fig, T('Entity linking: ngữ cảnh quyết định “Sao Mai” là ai', 'Entity linking: context decides which “Sao Mai”'), true);
    var CAND = [
      [T('Gạch Sao Mai', 'Sao Mai Tiles'), T('Doanh nghiệp (giả định)', 'Company (fictional)')],
      [T('Sao Mai (sao Kim)', 'Sao Mai (Venus)'), T('Hành tinh', 'Planet')],
      [T('Giải Sao Mai', 'Sao Mai Awards'), T('Cuộc thi ca hát', 'Singing contest')]
    ];
    var SENT = [
      { p: [T('Showroom ', 'The '), T(' vừa mở ở Thủ Đức, bán ', ' showroom just opened in Thu Duc, selling '), T('gạch 60×60', '60×60 tiles'), T(' giá tốt.', ' at good prices.')], cues: [2], w: [.86, .05, .09],
        why: T('“showroom”, “gạch 60×60”, “giá” là các từ gắn với doanh nghiệp bán gạch.', '“showroom”, “60×60 tiles” and “prices” point to the tile company.') },
      { p: [T('Sáng mai, ', 'Tomorrow, '), T(' mọc trước 5 giờ, ', ' rises before 5 a.m.; '), T('nhìn về phía đông', 'look east'), T(' sẽ thấy rõ nhất.', ' to see it best.')], cues: [2], w: [.04, .90, .06],
        why: T('“5 giờ sáng”, “phía đông”, “nhìn thấy” khớp với sao Kim mọc buổi sớm.', '“5 a.m.”, “east”, “see” match Venus rising before dawn.') },
      { p: [T('Thí sinh đoạt giải ', 'The winner of '), T(' năm nay ', ' this year '), T('hát dân ca', 'sang folk songs'), T(' trong đêm chung kết.', ' in the final.')], cues: [2], w: [.03, .05, .92],
        why: T('“thí sinh”, “đoạt giải”, “hát”, “chung kết” khớp với cuộc thi.', '“winner”, “sang”, “final” match the contest.') }
    ];
    var si = 0;
    var sb = SENT.map(function (x, i) { return btn(T('Câu ', 'Sentence ') + (i + 1), function () { si = i; pressGroup(sb, i); draw(); }); });
    pressGroup(sb, 0);
    b.appendChild(h('div', { 'class': 'mh-bar' }, sb));
    var sent = h('p', { 'class': 'mh-sent' }), cands = h('div', { 'class': 'mh-cands' }), why = h('p', { 'class': 'mh-note', 'aria-live': 'polite' });
    b.appendChild(sent); b.appendChild(h('div', { 'class': 'mh-lbl' }, T('Các thực thể có thể khớp', 'Candidate entities'))); b.appendChild(cands); b.appendChild(why);
    function draw() {
      var x = SENT[si]; clear(sent); clear(cands);
      sent.appendChild(document.createTextNode(x.p[0]));
      sent.appendChild(h('span', { 'class': 'men' }, 'Sao Mai'));
      sent.appendChild(document.createTextNode(x.p[1]));
      sent.appendChild(h('span', { 'class': 'cue' }, x.p[2]));
      sent.appendChild(document.createTextNode(x.p[3]));
      var win = x.w.indexOf(Math.max.apply(null, x.w));
      CAND.forEach(function (c, i) {
        var m = h('i', { style: 'width:0' });
        cands.appendChild(h('div', { 'class': 'mh-cand' + (i === win ? ' win' : '') }, [h('b', null, c[0]), h('div', { 'class': 'mh-note', style: 'margin:0' }, c[1] + ' · ' + pct(x.w[i])), h('div', { 'class': 'mh-meter' }, m)]));
        setTimeout(function () { m.style.width = pct(x.w[i]); }, 30);
      });
      why.textContent = x.why;
    }
    draw();
  };

  C.som = function (fig) {
    var b = box(fig, T('Share of Model: thương hiệu được AI nhắc trong bao nhiêu câu trả lời', 'Share of Model: how many AI answers mention a brand'), true);
    var BR = ['Sao Mai', T('Bình Minh', 'Binh Minh'), T('Hoàng Hôn', 'Hoang Hon'), T('Ánh Dương', 'Anh Duong')];
    var PL = ['ChatGPT', 'Gemini', 'Perplexity'];
    var PR = [
      T('gạch lát nền phòng khách loại nào tốt', 'best living-room floor tiles'),
      T('thương hiệu gạch ốp lát uy tín', 'trusted tile brands'),
      T('gạch chống trơn cho phòng tắm', 'anti-slip bathroom tiles'),
      T('nên mua gạch 60×60 hãng nào', 'which brand of 60×60 tiles'),
      T('gạch men bóng hay gạch mờ', 'glossy or matte tiles'),
      T('gạch Việt Nam hay gạch nhập khẩu', 'local or imported tiles'),
      T('gạch ốp bếp dễ lau chùi', 'easy-clean kitchen tiles'),
      T('bảng giá gạch ốp lát 2026', '2026 tile price list')
    ];
    var D = [
      [[0, 1], [0, 1, 2], [1, 3]],
      [[1, 2, 3], [0, 1, 2], [1, 2]],
      [[1], [0, 3], [3]],
      [[0, 1], [0, 1], [1, 2]],
      [[2], [2, 3], [0, 2]],
      [[1, 3], [0, 1], [1]],
      [[0, 2], [0, 2], [2, 3]],
      [[1, 2], [1, 3], [1, 2]]
    ];
    var bi = 0;
    var bb = BR.map(function (n, i) { return btn(n, function () { bi = i; pressGroup(bb, i); draw(); }); });
    pressGroup(bb, 0);
    b.appendChild(h('div', { 'class': 'mh-bar' }, [h('span', { 'class': 'mh-lbl' }, T('Thương hiệu', 'Brand'))].concat(bb)));
    var tw = h('div', { style: 'overflow-x:auto' }), bars = h('div', { 'aria-live': 'polite' });
    b.appendChild(tw); b.appendChild(bars);
    b.appendChild(h('p', { 'class': 'mh-note' }, T('Share of Model = số câu trả lời có nhắc thương hiệu ÷ tổng số câu trả lời, tính riêng từng nền tảng. Share of voice = số lần thương hiệu được nhắc ÷ tổng số lần mọi thương hiệu được nhắc. Bốn thương hiệu trong ví dụ đều là giả định.',
      'Share of Model = answers mentioning the brand ÷ all answers, per platform. Share of voice = the brand\'s mentions ÷ all brand mentions. All four brands are fictional.')));
    function draw() {
      clear(tw); clear(bars);
      var tbl = h('table', { 'class': 'mh-tbl' });
      tbl.appendChild(h('thead', null, h('tr', null, [h('th', null, T('Câu hỏi', 'Prompt'))].concat(PL.map(function (p) { return h('th', null, p); })))));
      var tb = h('tbody');
      PR.forEach(function (p, r) {
        tb.appendChild(h('tr', null, [h('td', null, p)].concat(PL.map(function (_, c) {
          var list = D[r][c], y = list.indexOf(bi) > -1;
          return h('td', { title: list.map(function (k) { return BR[k]; }).join(', ') }, h('span', { 'class': 'mh-dot ' + (y ? 'y' : 'o'), 'aria-label': y ? T('có nhắc', 'mentioned') : T('không nhắc', 'not mentioned') }));
        }))));
      });
      tbl.appendChild(tb); tw.appendChild(tbl);
      bars.appendChild(h('div', { 'class': 'mh-lbl', style: 'margin-top:12px' }, BR[bi] + ' · Share of Model'));
      var g1 = h('div', { 'class': 'mh-bars' }), g2 = h('div', { 'class': 'mh-bars' });
      PL.forEach(function (p, c) {
        var hit = 0, men = 0, all = 0;
        D.forEach(function (row) { var l = row[c]; all += l.length; if (l.indexOf(bi) > -1) { hit++; men++; } });
        var som = hit / D.length, sov = men / all;
        var i1 = h('i', { style: 'width:0' }), i2 = h('i', { style: 'width:0' });
        g1.appendChild(h('div', { 'class': 'mh-brow' }, [p, h('div', { 'class': 'mh-btrack' }, i1), h('b', null, pct(som))]));
        g2.appendChild(h('div', { 'class': 'mh-brow' }, [p, h('div', { 'class': 'mh-btrack sv' }, i2), h('b', null, pct(sov))]));
        setTimeout(function () { i1.style.width = pct(som); i2.style.width = pct(sov); }, 30);
      });
      bars.appendChild(g1);
      bars.appendChild(h('div', { 'class': 'mh-lbl', style: 'margin-top:12px' }, BR[bi] + ' · Share of voice'));
      bars.appendChild(g2);
    }
    draw();
  };

  C.variance = function (fig) {
    var b = box(fig, T('Hỏi AI cùng một câu nhiều lần: tỉ lệ nhắc tên dao động thế nào', 'Ask the same prompt many times: how the mention rate moves'), true);
    var p = .4, N = 30, seed = 15;
    var pb = [[.2, '20%'], [.4, '40%'], [.7, '70%']].map(function (x, i) { return btn(x[1], function () { p = x[0]; pressGroup(pb, i); draw(); }); });
    pressGroup(pb, 1);
    var nOut = h('b', null, '30');
    var nIn = h('input', { type: 'range', min: 1, max: 100, value: 30, 'aria-label': T('Số lần hỏi', 'Number of runs'), oninput: function () { N = +nIn.value; nOut.textContent = N; draw(); } });
    var again = btn('↻ ' + T('Hỏi lại', 'Re-run'), function () { seed++; draw(); }, 'pri');
    b.appendChild(h('div', { 'class': 'mh-bar' }, [h('span', { 'class': 'mh-lbl' }, T('Tỉ lệ thật', 'True rate'))].concat(pb)));
    b.appendChild(h('div', { 'class': 'mh-bar' }, [h('label', { 'class': 'mh-range' }, [T('Số lần hỏi', 'Runs'), nIn, nOut]), again]));
    var wrap = h('div'), out = h('div', { 'class': 'mh-panel', 'aria-live': 'polite' });
    b.appendChild(wrap); b.appendChild(out);
    b.appendChild(h('p', { 'class': 'mh-note' }, T('Mô phỏng: mỗi lần hỏi, thương hiệu được nhắc với xác suất bằng “tỉ lệ thật”. Dải màu là khoảng tin cậy 95% (Wilson).', 'Simulation: each run mentions the brand with probability equal to the “true rate”. The band is a 95% Wilson interval.')));
    function wilson(k, n) {
      var z = 1.96, ph = k / n, d = 1 + z * z / n, c = ph + z * z / (2 * n), m = z * Math.sqrt(ph * (1 - ph) / n + z * z / (4 * n * n));
      return [Math.max(0, (c - m) / d), Math.min(1, (c + m) / d)];
    }
    function draw() {
      var r = rng(seed * 9973), k = 0, pts = [];
      for (var i = 1; i <= 100; i++) { if (r() < p) k++; if (i <= N) pts.push([i, k / i, wilson(k, i)]); }
      var W = Math.max(280, wrap.clientWidth || 600), H = Math.round(Math.min(300, Math.max(200, W * .45)));
      var L = 40, R = 12, Tp = 12, B = 28;
      var X = function (i) { return L + (i - 1) / Math.max(1, 99) * (W - L - R); }, Y = function (v) { return Tp + (1 - v) * (H - Tp - B); };
      var svg = s('svg', { viewBox: '0 0 ' + W + ' ' + H, width: W, height: H, role: 'img', 'aria-label': T('Đường tỉ lệ nhắc tên theo số lần hỏi', 'Mention rate by number of runs') });
      [0, .25, .5, .75, 1].forEach(function (v) {
        svg.appendChild(s('line', { x1: L, x2: W - R, y1: Y(v), y2: Y(v), stroke: 'var(--rule,#dce1e8)' }));
        svg.appendChild(s('text', { x: L - 6, y: Y(v) + 4, 'text-anchor': 'end', 'font-size': 11, fill: 'var(--muted,#586371)' }, pct(v)));
      });
      [1, 25, 50, 75, 100].forEach(function (i) {
        svg.appendChild(s('text', { x: X(i), y: H - 8, 'text-anchor': 'middle', 'font-size': 11, fill: 'var(--muted,#586371)' }, String(i)));
      });
      var band = 'M' + pts.map(function (q) { return X(q[0]).toFixed(1) + ' ' + Y(q[2][1]).toFixed(1); }).join('L') +
        'L' + pts.slice().reverse().map(function (q) { return X(q[0]).toFixed(1) + ' ' + Y(q[2][0]).toFixed(1); }).join('L') + 'Z';
      svg.appendChild(s('path', { d: band, fill: 'color-mix(in srgb,var(--impr,#5e35b1) 16%,transparent)' }));
      svg.appendChild(s('line', { x1: L, x2: W - R, y1: Y(p), y2: Y(p), stroke: 'var(--pos,#e8710a)', 'stroke-width': 1.5, 'stroke-dasharray': '5 4' }));
      svg.appendChild(s('text', { x: W - R, y: Y(p) - 6, 'text-anchor': 'end', 'font-size': 11, fill: 'var(--pos,#e8710a)', 'font-weight': 600 }, T('tỉ lệ thật ', 'true rate ') + pct(p)));
      svg.appendChild(s('path', { d: 'M' + pts.map(function (q) { return X(q[0]).toFixed(1) + ' ' + Y(q[1]).toFixed(1); }).join('L'), fill: 'none', stroke: 'var(--impr,#5e35b1)', 'stroke-width': 2 }));
      var last = pts[pts.length - 1];
      svg.appendChild(s('circle', { cx: X(last[0]), cy: Y(last[1]), r: 4.5, fill: 'var(--impr,#5e35b1)' }));
      clear(wrap); wrap.appendChild(svg);
      clear(out);
      out.appendChild(h('p', null, [T('Sau ', 'After '), h('b', null, String(N)), T(' lần hỏi: thương hiệu xuất hiện ', ' runs: the brand appears in '), h('b', null, pct(last[1])),
        T(' số câu trả lời. Khoảng tin cậy 95%: ', ' of answers. 95% interval: '), h('b', null, pct(last[2][0]) + ' – ' + pct(last[2][1])), '.']));
      out.appendChild(h('p', { 'class': 'mh-note', style: 'margin:4px 0 0' }, N === 1
        ? T('Chỉ hỏi 1 lần thì kết quả chỉ có thể là 0% hoặc 100%, không nói được gì về tỉ lệ thật.', 'With one run the result can only be 0% or 100%, which says nothing about the real rate.')
        : T('Khoảng càng rộng, kết luận càng kém chắc chắn. Muốn so sánh trước và sau, hai khoảng không nên chồng lên nhau.', 'The wider the band, the weaker the conclusion. To claim a before/after change, the two intervals should not overlap.')));
    }
    draw(); onResize(wrap, draw);
  };

  C.bm25 = function (fig) {
    var b = box(fig, T('BM25: lặp từ khoá có giới hạn, trang dài bị trừ điểm', 'BM25: repetition saturates, long pages are penalised'), true);
    var k1 = 1.2, tf = 3, len = 1, bb = .75;
    function tfPart(f, L) { return f * (k1 + 1) / (f + k1 * (1 - bb + bb * L)); }
    var tfOut = h('b', null, '3'), lenOut = h('b', null, '1×');
    var tfIn = h('input', { type: 'range', min: 0, max: 20, value: 3, 'aria-label': T('Số lần từ xuất hiện', 'Term frequency'), oninput: function () { tf = +tfIn.value; tfOut.textContent = tf; draw(); } });
    var lenIn = h('input', { type: 'range', min: 25, max: 300, step: 25, value: 100, 'aria-label': T('Độ dài trang so với trung bình', 'Page length vs average'), oninput: function () { len = +lenIn.value / 100; lenOut.textContent = len + '×'; draw(); } });
    b.appendChild(h('div', { 'class': 'mh-bar' }, [h('label', { 'class': 'mh-range' }, [T('Số lần từ xuất hiện', 'Times the term appears'), tfIn, tfOut])]));
    b.appendChild(h('div', { 'class': 'mh-bar' }, [h('label', { 'class': 'mh-range' }, [T('Độ dài trang so với trung bình', 'Page length vs average'), lenIn, lenOut])]));
    var wrap = h('div'), out = h('div', { 'class': 'mh-panel', 'aria-live': 'polite' });
    b.appendChild(wrap); b.appendChild(out);
    function draw() {
      var W = Math.max(280, wrap.clientWidth || 600), H = 220, L = 40, R = 14, Tp = 12, B = 30, max = (k1 + 1);
      var X = function (f) { return L + f / 20 * (W - L - R); }, Y = function (v) { return Tp + (1 - v / max) * (H - Tp - B); };
      var svg = s('svg', { viewBox: '0 0 ' + W + ' ' + H, width: W, height: H, role: 'img', 'aria-label': T('Đường điểm tần suất từ của BM25', 'BM25 term-frequency curve') });
      [0, 5, 10, 15, 20].forEach(function (f) { svg.appendChild(s('text', { x: X(f), y: H - 10, 'text-anchor': 'middle', 'font-size': 11, fill: 'var(--muted,#586371)' }, String(f))); });
      [0, 1, 2].forEach(function (v) {
        svg.appendChild(s('line', { x1: L, x2: W - R, y1: Y(v), y2: Y(v), stroke: 'var(--rule,#dce1e8)' }));
        svg.appendChild(s('text', { x: L - 6, y: Y(v) + 4, 'text-anchor': 'end', 'font-size': 11, fill: 'var(--muted,#586371)' }, String(v)));
      });
      function path(Ln) { var d = ''; for (var f = 0; f <= 20; f += .25) d += (f ? 'L' : 'M') + X(f).toFixed(1) + ' ' + Y(tfPart(f, Ln)).toFixed(1); return d; }
      svg.appendChild(s('path', { d: path(1), fill: 'none', stroke: 'var(--rule,#dce1e8)', 'stroke-width': 2, 'stroke-dasharray': '4 4' }));
      svg.appendChild(s('path', { d: path(len), fill: 'none', stroke: 'var(--impr,#5e35b1)', 'stroke-width': 2.5 }));
      svg.appendChild(s('line', { x1: L, x2: W - R, y1: Y(max), y2: Y(max), stroke: 'var(--pos,#e8710a)', 'stroke-dasharray': '5 4' }));
      svg.appendChild(s('text', { x: L + 6, y: Y(max) - 4, 'text-anchor': 'start', 'font-size': 11, fill: 'var(--pos,#e8710a)' }, T('mức trần', 'ceiling')));
      svg.appendChild(s('circle', { cx: X(tf), cy: Y(tfPart(tf, len)), r: 5, fill: 'var(--impr,#5e35b1)' }));
      clear(wrap); wrap.appendChild(svg);
      var v = tfPart(tf, len), v1 = tf ? tfPart(tf - 1, len) : 0;
      clear(out);
      out.appendChild(h('p', null, [T('Điểm phần tần suất: ', 'Term-frequency score: '), h('b', null, nf(v, 2)), T(' (tối đa ', ' (max '), nf(max, 1), '). ',
        tf ? T('Lần xuất hiện thứ ' + tf + ' chỉ cộng thêm ' + nf(v - v1, 2) + ' điểm.', 'Occurrence #' + tf + ' adds only ' + nf(v - v1, 2) + '.') : T('Từ không xuất hiện thì không có điểm.', 'No occurrences, no score.')]));
      out.appendChild(h('p', { 'class': 'mh-note', style: 'margin:4px 0 0' }, T('Đường nét đứt là trang có độ dài trung bình. Tham số mặc định của Lucene và Elasticsearch: k1 = 1,2; b = 0,75. Điểm cuối cùng còn nhân với độ hiếm của từ (IDF).', 'The dashed curve is an average-length page. Lucene and Elasticsearch defaults: k1 = 1.2, b = 0.75. The final score is also multiplied by how rare the term is (IDF).')));
    }
    draw(); onResize(wrap, draw);

    var D = [
      [T('Bảng giá gạch Sao Mai 60×60', 'Sao Mai 60×60 price list'), .92, .70],
      [T('Gạch Sao Mai 60×60 giá bao nhiêu một mét vuông', 'How much is Sao Mai 60×60 per square metre'), .80, .95],
      [T('Chi phí lát nền phòng khách 30 m²', 'Cost of tiling a 30 m² living room'), .20, .82],
      [T('Sao Mai tuyển nhân viên bán hàng', 'Sao Mai is hiring sales staff'), .55, .15]
    ];
    var a = .5, aOut = h('b', null, '50%');
    var aIn = h('input', { type: 'range', min: 0, max: 100, step: 10, value: 50, 'aria-label': T('Trọng số từ khoá', 'Keyword weight'), oninput: function () { a = +aIn.value / 100; aOut.textContent = Math.round(a * 100) + '%'; rank(); } });
    b.appendChild(h('div', { 'class': 'mh-lbl', style: 'margin-top:16px' }, T('Hybrid search · câu hỏi: “gạch sao mai 60x60 giá”', 'Hybrid search · query: “sao mai 60x60 price”')));
    b.appendChild(h('div', { 'class': 'mh-bar', style: 'margin-top:6px' }, [h('label', { 'class': 'mh-range' }, [T('Ngữ nghĩa', 'Semantic'), aIn, T('Từ khoá', 'Keyword'), aOut])]));
    var list = h('div', { 'class': 'mh-chunks', 'aria-live': 'polite' }); b.appendChild(list);
    function rank() {
      clear(list);
      D.map(function (d) { return [d[0], a * d[1] + (1 - a) * d[2], d[1], d[2]]; }).sort(function (x, y) { return y[1] - x[1]; }).forEach(function (r, i) {
        list.appendChild(h('div', { 'class': 'mh-chunk' }, [h('span', { 'class': 'mh-score' }, nf(r[1], 2)), h('span', null, [h('span', { 'class': 'mh-num', style: i === 0 ? 'background:var(--ctr,#00897b)' : '' }, String(i + 1)), r[0],
          h('span', { 'class': 'mh-src' }, T('  · từ khoá ', '  · keyword ') + nf(r[2], 2) + T(' · ngữ nghĩa ', ' · semantic ') + nf(r[3], 2))])]));
      });
    }
    rank();
    b.appendChild(h('p', { 'class': 'mh-note' }, T('Điểm trong ví dụ là giả định, đã đưa về thang 0–1. Hệ thống thật thường trộn bằng thứ hạng (ví dụ reciprocal rank fusion) chứ không cộng thẳng điểm.', 'Scores are made up and normalised to 0–1. Real systems often fuse by rank (e.g. reciprocal rank fusion) rather than adding raw scores.')));
  };

  C['geo-paper'] = function (fig) {
    var b = box(fig, T('Bài nghiên cứu GEO đo độ hiển thị thế nào', 'How the GEO paper measures visibility'), true);
    var BASE = [[18, 'A'], [14, 'B'], [22, 'A'], [12, 'C'], [16, 'B'], [10, 'C']];
    var BOOST = [[18, 'A'], [20, 'B'], [22, 'A'], [12, 'C'], [16, 'B'], [10, 'C']];
    var mode = 0;
    var mb = [btn(T('Bản gốc', 'Original'), function () { mode = 0; pressGroup(mb, 0); draw(); }),
      btn(T('Nguồn B thêm số liệu', 'Source B adds statistics'), function () { mode = 1; pressGroup(mb, 1); draw(); })];
    pressGroup(mb, 0);
    b.appendChild(h('div', { 'class': 'mh-bar' }, mb));
    var ans = h('div', { 'class': 'mh-doc' }), out = h('div', { 'class': 'mh-bars', 'aria-live': 'polite', style: 'margin-top:12px' });
    b.appendChild(ans); b.appendChild(out);
    function draw() {
      var S = mode ? BOOST.slice() : BASE.slice();
      if (mode) { S = [S[1], S[0], S[2], S[3], S[4], S[5]]; }
      clear(ans); clear(out);
      var n = S.length, tot = { A: 0, B: 0, C: 0 }, wc = { A: 0, B: 0, C: 0 }, all = 0;
      S.forEach(function (x, i) {
        var w = x[0] * Math.exp(-i / n); tot[x[1]] += w; wc[x[1]] += x[0]; all += x[0];
        ans.appendChild(h('span', null, [T('Câu ', 'Sentence ') + (i + 1) + ' (' + x[0] + T(' chữ) ', ' words) '), h('span', { 'class': 'mh-cite' }, x[1]), '  ']));
      });
      var sum = tot.A + tot.B + tot.C;
      ['A', 'B', 'C'].forEach(function (k) {
        var v = tot[k] / sum, i1 = h('i', { style: 'width:0' });
        out.appendChild(h('div', { 'class': 'mh-brow' }, [T('Nguồn ', 'Source ') + k, h('div', { 'class': 'mh-btrack' }, i1), h('b', null, pct(v))]));
        setTimeout(function () { i1.style.width = pct(v); }, 30);
      });
    }
    draw();
    b.appendChild(h('p', { 'class': 'mh-note' }, T('Chỉ số chính của bài báo là “position-adjusted word count”: phần chữ trong câu trả lời được gán cho một nguồn, câu càng ở đầu càng được tính nặng. Các con số ở đây là ví dụ giả định để thấy cách tính, không phải số liệu của bài báo.', 'The paper’s main metric is position-adjusted word count: the share of the answer’s words attributed to a source, weighted more heavily the earlier the sentence appears. Numbers here are made up to show the calculation, not the paper’s results.')));
  };

  C.grounding = function (fig) {
    var b = box(fig, T('Bao nhiêu nguồn AI trích dẫn nằm trong top 10 Google?', 'How many AI citations rank in Google’s top 10?'), false);
    var D = [
      [T('AI Overviews (7/2025)', 'AI Overviews (Jul 2025)'), 76],
      [T('AI Overviews (3/2026)', 'AI Overviews (Mar 2026)'), 38],
      ['Perplexity', 28.6],
      [T('Trung bình 4 trợ lý AI', '4-assistant average'), 12],
      [T('ChatGPT (trích dẫn trong câu)', 'ChatGPT (in-text citations)'), 8]
    ];
    var out = h('div', { 'class': 'mh-bars' }); b.appendChild(out);
    D.forEach(function (d) {
      var i1 = h('i', { style: 'width:0;background:var(--' + (/AI Overviews/.test(d[0]) ? 'clicks,#1a73e8' : 'impr,#5e35b1') + ')' });
      out.appendChild(h('div', { 'class': 'mh-brow', style: 'grid-template-columns:minmax(120px,190px) 1fr 52px' }, [d[0], h('div', { 'class': 'mh-btrack' }, i1), h('b', null, String(d[1]).replace('.', EN ? '.' : ',') + '%')]));
      whenVisible(b, function () { i1.style.width = d[1] + '%'; });
      if (!('IntersectionObserver' in window)) i1.style.width = d[1] + '%';
    });
    b.appendChild(h('p', { 'class': 'mh-note' }, T('Tỉ lệ URL được AI trích dẫn cũng nằm trong top 10 Google cho cùng truy vấn. Nguồn: Ahrefs, nghiên cứu 15.000 câu hỏi (8/2025) và nghiên cứu 863.000 từ khoá AI Overviews (3/2026). Bốn trợ lý: ChatGPT, Gemini, Copilot, Perplexity.', 'Share of AI-cited URLs that also rank in Google’s top 10 for the same query. Source: Ahrefs, 15,000-prompt study (Aug 2025) and 863,000-keyword AI Overviews study (Mar 2026). Four assistants: ChatGPT, Gemini, Copilot, Perplexity.')));
  };

  function whenVisible(el, fn) {
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (es) {
      if (es.some(function (e) { return e.isIntersecting; })) { io.disconnect(); fn(); }
    }, { threshold: .35 });
    io.observe(el);
  }

  function start(fig) {
    if (fig.__mh) return; fig.__mh = 1;
    var fn = C[fig.getAttribute('data-mh')];
    if (!fn) return;
    try { fn(fig); fig.classList.add('mh-ready'); } catch (e) { if (window.console) console.warn('minh-hoa:', e); }
  }
  function init() {
    var figs = [].slice.call(document.querySelectorAll('figure.mh[data-mh]'));
    if (!figs.length) return;
    injectCSS();
    figs.forEach(start);
  }
  window.MinhHoa = { start: start, list: Object.keys(C) };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
