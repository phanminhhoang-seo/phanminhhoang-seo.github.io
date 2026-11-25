(function () {
  'use strict';

  var EN = /^en/i.test(document.documentElement.lang || '');
  function T(vi, en) { return EN ? en : vi; }

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
    '.ea-grid{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:14px;align-items:start}',
    '@media (max-width:640px){.ea-grid{grid-template-columns:1fr}}',
    '.ea-card{border:1px solid var(--rule,#dce1e8);border-radius:10px;padding:10px 12px;font-size:.88rem;background:var(--surface,#fff);margin-bottom:10px}',
    '.ea-card b{display:block;margin-bottom:4px}',
    '.ea-tri{display:flex;flex-wrap:wrap;gap:6px;align-items:center;font-size:.84rem}',
    '.ea-tri span{border-radius:999px;padding:3px 10px;background:var(--paper,#f7f8fa);border:1px solid var(--rule,#dce1e8)}',
    '.ea-tri .p{background:color-mix(in srgb,var(--impr,#5e35b1) 10%,#fff);border-color:color-mix(in srgb,var(--impr,#5e35b1) 35%,#fff)}',
    '.ea-list{list-style:none;margin:0;padding:0;display:grid;gap:6px}',
    '.ea-list li{display:flex;justify-content:space-between;gap:8px;border:1px solid var(--rule,#dce1e8);border-radius:10px;padding:8px 12px;font-size:.88rem;background:var(--surface,#fff);transition:opacity .25s}',
    '.ea-list li.off{opacity:.45}',
    '.ea-tag{font-size:.75rem;font-weight:600;border-radius:999px;padding:2px 8px;white-space:nowrap}',
    '.ea-tag.s{background:color-mix(in srgb,var(--clicks,#1a73e8) 14%,#fff);color:var(--clicks,#1a73e8)}',
    '.ea-tag.m{background:color-mix(in srgb,var(--pos,#e8710a) 16%,#fff);color:#9a4a06}',
    '.ea-tag.n{background:var(--paper,#f7f8fa);color:var(--muted,#586371)}'
  ].join('');

  var AG = ['Kalicube', 'WordLift', 'Schema App', 'iPullRank', 'Holistic SEO & Digital', T('Phan Minh Hoàng (người viết bài)', 'Phan Minh Hoàng (author)')];

  var L = [
    {
      label: T('1. Danh tính', '1. Identity'),
      what: T('Một trang gốc (thường là trang Giới thiệu) nói rõ doanh nghiệp là ai, cùng một mã định danh ổn định trong Knowledge Graph của Google và trên Wikidata.',
              'One entity home (usually the About page) that states who the business is, plus a stable ID in Google’s Knowledge Graph and on Wikidata.'),
      tri: [T('Gạch Sao Mai', 'Sao Mai Tiles'), T('giống với', 'same as'), T('mục Wikidata Q…', 'Wikidata item Q…')],
      fit: [2, 0, 0, 0, 1, 1]
    },
    {
      label: T('2. Đồ thị trên website', '2. On-site graph'),
      what: T('Schema trên các trang được nối với nhau bằng @id: tổ chức, người sáng lập, sản phẩm, dịch vụ trỏ vào nhau thay vì mỗi trang một khối riêng lẻ.',
              'Schema across pages joined by @id: the organisation, founder, products and services point to each other instead of sitting in isolated blocks.'),
      tri: [T('Gạch Sao Mai', 'Sao Mai Tiles'), T('sản xuất', 'makes'), T('Gạch 60×60 men mờ', '60×60 matt tile')],
      fit: [1, 2, 2, 0, 0, 2]
    },
    {
      label: T('3. Nội dung và internal link', '3. Content and links'),
      what: T('Nội dung phủ đủ chủ đề, các trang được nối với nhau theo thực thể mà chúng nói tới, không phải theo anchor text khớp từ khoá.',
              'Content that covers the topic fully, with pages linked by the entity they are about rather than by exact-match anchor text.'),
      tri: [T('Bài “chống trơn”', '“Slip resistance” article'), T('nói về', 'is about'), T('Gạch 60×60 men mờ', '60×60 matt tile')],
      fit: [0, 1, 0, 2, 2, 1]
    },
    {
      label: T('4. Xác nhận từ bên ngoài', '4. Outside corroboration'),
      what: T('Báo chí, danh bạ, website đối tác và Wikidata nói cùng một dữ kiện. Dữ kiện được nhiều nguồn độc lập lặp lại thì đáng tin hơn.',
              'Press, directories, partner sites and Wikidata state the same fact. A fact repeated by independent sources is easier to trust.'),
      tri: [T('Báo xây dựng', 'Trade press'), T('nhắc', 'mentions'), T('Gạch Sao Mai, thành lập 2008', 'Sao Mai Tiles, founded 2008')],
      fit: [2, 0, 0, 1, 0, 2]
    }
  ];

  var TAG = [
    ['n', T('Không phải trọng tâm', 'Not the focus')],
    ['m', T('Có làm', 'Part of the work')],
    ['s', T('Thế mạnh chính', 'Main strength')]
  ];

  function render(fig) {
    if (fig.__ea) return; fig.__ea = 1;
    if (!document.getElementById('ea-css')) document.head.appendChild(h('style', { id: 'ea-css' }, CSS));
    var b = h('div', { 'class': 'mh-box' });
    b.appendChild(h('div', { 'class': 'mh-head' }, [
      h('span', { 'class': 'mh-title' }, T('Bốn lớp của quan hệ thực thể', 'Four layers of entity relationships')),
      h('span', { 'class': 'mh-fake' }, T('Minh hoạ, thương hiệu giả định', 'Illustration, fictional brand'))
    ]));
    var bar = h('div', { 'class': 'mh-bar', role: 'group', 'aria-label': T('Chọn lớp', 'Choose a layer') });
    var btns = L.map(function (l, i) {
      return h('button', { type: 'button', 'class': 'mh-btn', 'aria-pressed': 'false', onclick: function () { show(i); } }, l.label);
    });
    btns.forEach(function (x) { bar.appendChild(x); });
    b.appendChild(bar);

    var cWhat = h('div', { 'class': 'ea-card' });
    var cTri = h('div', { 'class': 'ea-card' });
    var list = h('ul', { 'class': 'ea-list', 'aria-live': 'polite' });
    b.appendChild(h('div', { 'class': 'ea-grid' }, [h('div', null, [cWhat, cTri]), list]));
    b.appendChild(h('p', { 'class': 'mh-note' }, T(
      'Mức độ “thế mạnh” là cách tôi đọc tài liệu công khai của từng bên, không phải đánh giá chính thức; dòng cuối là tôi tự mô tả mình. Gạch Sao Mai là thương hiệu giả định.',
      'The strength levels are my reading of each firm’s public material, not an official rating; the last row is my own self-description. Sao Mai Tiles is a fictional brand.')));
    var cap = fig.querySelector('figcaption');
    fig.insertBefore(b, cap);

    function show(i) {
      var l = L[i];
      btns.forEach(function (x, j) { x.setAttribute('aria-pressed', j === i ? 'true' : 'false'); });
      cWhat.innerHTML = '';
      cWhat.appendChild(h('b', null, T('Lớp này gồm gì', 'What this layer covers')));
      cWhat.appendChild(document.createTextNode(l.what));
      cTri.innerHTML = '';
      cTri.appendChild(h('b', null, T('Một triple ví dụ', 'An example triple')));
      cTri.appendChild(h('div', { 'class': 'ea-tri' }, [h('span', null, l.tri[0]), h('span', { 'class': 'p' }, l.tri[1]), h('span', null, l.tri[2])]));
      list.innerHTML = '';
      AG.forEach(function (name, j) {
        var t = TAG[l.fit[j]];
        list.appendChild(h('li', { 'class': l.fit[j] ? '' : 'off' }, [h('span', null, name), h('span', { 'class': 'ea-tag ' + t[0] }, t[1])]));
      });
    }
    show(0);
    fig.classList.add('mh-ready');
  }

  function init() {
    [].forEach.call(document.querySelectorAll('figure.mh[data-mh="entityagency"]'), render);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
