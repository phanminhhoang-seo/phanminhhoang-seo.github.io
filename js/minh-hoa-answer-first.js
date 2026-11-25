(function () {
  'use strict';

  function h(tag, a, kids) {
    var el = document.createElement(tag);
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

  var CSS = [
    '.af-q{border:2px solid var(--impr,#5e35b1);border-radius:12px;padding:10px 12px;font-weight:600;background:color-mix(in srgb,var(--impr,#5e35b1) 7%,#fff);margin-bottom:12px}',
    '.af-grid{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(0,1fr);gap:14px;align-items:start}',
    '@media (max-width:640px){.af-grid{grid-template-columns:1fr}}',
    '.af-doc{position:relative;border:1px solid var(--rule,#dce1e8);border-radius:10px;padding:12px 12px 12px 22px;font-size:.88rem;line-height:1.7;background:var(--surface,#fff)}',
    '.af-doc .af-h{font-weight:700;margin:0 0 4px}',
    '.af-doc p{margin:0 0 6px}',
    '.af-zone{position:absolute;left:6px;top:12px;width:6px;border-radius:3px;background:var(--clicks,#1a73e8);opacity:.85;transition:height .35s}',
    '.af-s{border-radius:3px;padding:1px 0;transition:background .3s}',
    '.af-s.top{background:color-mix(in srgb,var(--clicks,#1a73e8) 10%,#fff)}',
    '.af-s.ans{background:color-mix(in srgb,var(--pos,#e8710a) 28%,#fff);font-weight:600}',
    '.af-side{display:grid;gap:10px}',
    '.af-card{border:1px solid var(--rule,#dce1e8);border-radius:10px;padding:10px 12px;font-size:.86rem;background:var(--paper,#f7f8fa)}',
    '.af-card b{display:block;margin-bottom:2px}',
    '.af-key{display:flex;gap:12px;flex-wrap:wrap;font-size:.8rem;color:var(--muted,#586371);margin-top:8px}',
    '.af-key i{display:inline-block;width:12px;height:12px;border-radius:3px;vertical-align:-2px;margin-right:4px}'
  ].join('');

  var Q = 'Gạch Sao Mai 60×60 bảo hành bao lâu?';
  var V = [
    {
      label: 'Viết kiểu dẫn dắt',
      h: 'Chính sách bảo hành',
      paras: [
        ['Gạch ốp lát là vật liệu gắn bó với ngôi nhà hàng chục năm, vì vậy khi chọn gạch, nhiều gia đình rất quan tâm đến chính sách sau bán hàng.', ''],
        ['Gạch Sao Mai đã có mặt trên thị trường từ năm 2008 và luôn đặt chất lượng lên hàng đầu.', ''],
        ['Mỗi dòng sản phẩm có chính sách khác nhau, tuỳ bề mặt và kích thước.', ''],
        ['Với dòng 60×60, sản phẩm được bảo hành 10 năm cho lỗi men khi mua tại đại lý chính hãng.', 'ans']
      ],
      top: 'Lời dẫn về gạch nói chung và lịch sử công ty. Chưa có câu trả lời.',
      lift: '“Với dòng 60×60, sản phẩm được bảo hành 10 năm…” Câu này nằm cuối mục và không nhắc tên Gạch Sao Mai.',
      pos: 'Cuối mục'
    },
    {
      label: 'Viết answer first',
      h: 'Chính sách bảo hành',
      paras: [
        ['Gạch Sao Mai 60×60 được bảo hành 10 năm cho lỗi men, với điều kiện mua tại đại lý chính hãng.', 'ans'],
        ['Bảo hành không áp dụng cho vết nứt do thi công sai kỹ thuật hoặc do va đập.', ''],
        ['Các kích thước khác có thời hạn riêng, xem bảng ở cuối trang.', ''],
        ['Khi cần bảo hành, giữ hoá đơn và liên hệ đại lý nơi mua.', '']
      ],
      top: 'Câu trả lời đầy đủ: tên sản phẩm, thời hạn, phạm vi và điều kiện.',
      lift: '“Gạch Sao Mai 60×60 được bảo hành 10 năm cho lỗi men, với điều kiện mua tại đại lý chính hãng.” Câu này tự đứng được khi bị tách khỏi trang.',
      pos: 'Câu đầu tiên'
    }
  ];

  function render(fig) {
    if (fig.__af) return; fig.__af = 1;
    if (!document.getElementById('af-css')) document.head.appendChild(h('style', { id: 'af-css' }, CSS));
    var b = h('div', { 'class': 'mh-box' });
    b.appendChild(h('div', { 'class': 'mh-head' }, [
      h('span', { 'class': 'mh-title' }, 'Cùng một mục, hai cách viết'),
      h('span', { 'class': 'mh-fake' }, 'Minh hoạ, thương hiệu giả định')
    ]));
    var bar = h('div', { 'class': 'mh-bar', role: 'group', 'aria-label': 'Chọn cách viết' });
    var btns = V.map(function (v, i) {
      return h('button', { type: 'button', 'class': 'mh-btn', 'aria-pressed': 'false', onclick: function () { show(i); } }, v.label);
    });
    btns.forEach(function (x) { bar.appendChild(x); });
    b.appendChild(bar);
    b.appendChild(h('div', { 'class': 'af-q' }, [h('div', { 'class': 'mh-lbl' }, 'Câu hỏi người dùng'), Q]));
    var doc = h('div', { 'class': 'af-doc', 'aria-live': 'polite' });
    var zone = h('span', { 'class': 'af-zone', 'aria-hidden': 'true' });
    var cTop = h('div', { 'class': 'af-card' }), cLift = h('div', { 'class': 'af-card' }), cPos = h('div', { 'class': 'af-card' });
    b.appendChild(h('div', { 'class': 'af-grid' }, [
      h('div', null, [doc, h('div', { 'class': 'af-key' }, [
        h('span', null, [h('i', { style: 'background:var(--clicks,#1a73e8)' }), '30% đầu của mục']),
        h('span', null, [h('i', { style: 'background:color-mix(in srgb,var(--pos,#e8710a) 45%,#fff)' }), 'Câu trả lời'])
      ])]),
      h('div', { 'class': 'af-side' }, [cPos, cTop, cLift])
    ]));
    b.appendChild(h('p', { 'class': 'mh-note' }, 'Vùng màu xanh là 30% đầu của mục. Trong nghiên cứu của Kevin Indig trên ChatGPT, 44,2% trích dẫn nằm ở 30% đầu bài viết. Thương hiệu và nội dung bảo hành là giả định.'));
    var cap = fig.querySelector('figcaption');
    fig.insertBefore(b, cap);

    function show(i) {
      var v = V[i];
      btns.forEach(function (x, j) { x.setAttribute('aria-pressed', j === i ? 'true' : 'false'); });
      while (doc.firstChild) doc.removeChild(doc.firstChild);
      doc.appendChild(zone);
      doc.appendChild(h('p', { 'class': 'af-h' }, v.h));
      var total = 0; v.paras.forEach(function (p) { total += p[0].length; });
      var acc = 0;
      v.paras.forEach(function (p) {
        var inTop = acc < total * 0.3;
        acc += p[0].length;
        var cls = 'af-s' + (p[1] === 'ans' ? ' ans' : inTop ? ' top' : '');
        doc.appendChild(h('p', null, h('span', { 'class': cls }, p[0])));
      });
      requestAnimationFrame(function () {
        var head = doc.querySelector('.af-h');
        var start = head.offsetTop + head.offsetHeight;
        var end = doc.scrollHeight - 12;
        zone.style.top = start + 'px';
        zone.style.height = Math.max(8, (end - start) * 0.3) + 'px';
      });
      cPos.innerHTML = ''; cPos.appendChild(h('b', null, 'Câu trả lời nằm ở')); cPos.appendChild(document.createTextNode(v.pos));
      cTop.innerHTML = ''; cTop.appendChild(h('b', null, 'Trong 30% đầu có gì')); cTop.appendChild(document.createTextNode(v.top));
      cLift.innerHTML = ''; cLift.appendChild(h('b', null, 'Câu AI có thể lấy ra')); cLift.appendChild(document.createTextNode(v.lift));
    }
    show(0);
    var t;
    window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(function () {
      var i = btns.findIndex ? btns.findIndex(function (x) { return x.getAttribute('aria-pressed') === 'true'; }) : 0;
      show(i < 0 ? 0 : i);
    }, 150); });
    fig.classList.add('mh-ready');
  }

  function init() {
    [].forEach.call(document.querySelectorAll('figure.mh[data-mh="answerfirst"]'), render);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
