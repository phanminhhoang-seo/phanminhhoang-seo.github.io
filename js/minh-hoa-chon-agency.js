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
    '.ca-list{list-style:none;margin:0;padding:0;display:grid;gap:8px}',
    '.ca-item{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center;border:1px solid var(--rule,#dce1e8);border-radius:10px;padding:10px 12px;background:var(--surface,#fff);font-size:.9rem}',
    '.ca-item small{display:block;color:var(--muted,#586371);font-size:.8rem;margin-top:2px}',
    '.ca-opts{display:flex;gap:6px}',
    '.ca-opts .mh-btn{min-height:32px;padding:0 12px;font-size:.82rem}',
    '.ca-opts .mh-btn.y[aria-pressed=true]{background:var(--ctr,#00897b);border-color:var(--ctr,#00897b)}',
    '.ca-opts .mh-btn.n[aria-pressed=true]{background:#c62828;border-color:#c62828}',
    '.ca-meter{height:10px;border-radius:999px;background:var(--paper,#f7f8fa);border:1px solid var(--rule,#dce1e8);overflow:hidden;margin:6px 0 8px}',
    '.ca-meter span{display:block;height:100%;width:0;background:var(--ctr,#00897b);transition:width .3s,background .3s}',
    '@media (max-width:560px){.ca-item{grid-template-columns:1fr}}'
  ].join('');

  var Q = [
    ['Có kết quả GEO đã làm, đo trước và sau trên cùng một bộ câu hỏi', 'Có ngày đo, nền tảng đo, ảnh chụp câu trả lời hoặc số liệu GA4'],
    ['Bộ câu hỏi được viết theo người hỏi thật của bạn', 'Tách theo từng nhóm khách và từng chặng: tìm hiểu, so sánh, quyết định'],
    ['Đề xuất nói rõ trang nào trên website của bạn sẽ sửa gì', 'Xoá tên bạn khỏi đề xuất thì nó không còn dùng được cho công ty khác'],
    ['KPI có mức nền, chia theo tháng, không tính phần bạn đã có sẵn', 'Từ khoá đang ở top và lượt nhắc hiện có được tách riêng'],
    ['Đo trên nhiều nền tảng, đo lặp lại, kết hợp Search Console và GA4', 'Không chốt kết quả bằng một lần hỏi ChatGPT'],
    ['Đề xuất tính tới kế hoạch, mùa vụ và quy định ngành của bạn', 'Ví dụ website sắp làm lại, mùa cao điểm, quy định quảng cáo y tế, giáo dục'],
    ['Nói được AI đang trích nguồn nào trong ngành và cách có mặt ở đó', 'Không chỉ bán số lượng bài viết, backlink hay tài khoản mạng xã hội'],
    ['Có cam kết bằng văn bản về những việc không làm', 'Review giả, spam diễn đàn, trang mạo danh, mua link số lượng']
  ];

  var V = [
    [0, 'Chưa đủ thông tin để đánh giá. Hãy gửi lại agency các câu hỏi ở mục 4.'],
    [4, 'Rủi ro cao. Phần lớn đề xuất là lý thuyết hoặc lời hứa, chưa phải kế hoạch cho doanh nghiệp của bạn.'],
    [6, 'Tạm được. Yêu cầu bổ sung những mục còn thiếu trước khi ký, hoặc bắt đầu bằng một giai đoạn thử 2 đến 3 tháng.'],
    [8, 'Đề xuất có nền tảng tốt. Vẫn nên chốt bằng văn bản mức nền và cách đo trước khi bắt đầu.']
  ];

  function render(fig) {
    if (fig.__ca) return; fig.__ca = 1;
    if (!document.getElementById('ca-css')) document.head.appendChild(h('style', { id: 'ca-css' }, CSS));
    var ans = Q.map(function () { return null; });
    var b = h('div', { 'class': 'mh-box' });
    b.appendChild(h('div', { 'class': 'mh-head' }, [
      h('span', { 'class': 'mh-title' }, 'Tự chấm một đề xuất GEO'),
      h('span', { 'class': 'mh-fake' }, '8 tiêu chí, bấm Có hoặc Không')
    ]));
    var list = h('ul', { 'class': 'ca-list' });
    var groups = [];
    Q.forEach(function (q, i) {
      var y = h('button', { type: 'button', 'class': 'mh-btn y', 'aria-pressed': 'false', onclick: function () { set(i, 1); } }, 'Có');
      var n = h('button', { type: 'button', 'class': 'mh-btn n', 'aria-pressed': 'false', onclick: function () { set(i, 0); } }, 'Không');
      groups.push([y, n]);
      list.appendChild(h('li', { 'class': 'ca-item' }, [
        h('div', null, [h('span', null, (i + 1) + '. ' + q[0]), h('small', null, q[1])]),
        h('div', { 'class': 'ca-opts', role: 'group', 'aria-label': q[0] }, [y, n])
      ]));
    });
    b.appendChild(list);
    var panel = h('div', { 'class': 'mh-panel', 'aria-live': 'polite' });
    var score = h('p', null);
    var bar = h('span', null);
    var verdict = h('p', null);
    panel.appendChild(h('span', { 'class': 'mh-lbl' }, 'Kết quả'));
    panel.appendChild(score);
    panel.appendChild(h('div', { 'class': 'ca-meter' }, bar));
    panel.appendChild(verdict);
    b.appendChild(panel);
    b.appendChild(h('p', { 'class': 'mh-note' }, 'Thang điểm chỉ để tham khảo nhanh. Một tiêu chí “Không” ở mục 1 hoặc mục 8 đã đủ để hỏi lại agency trước khi ký.'));
    fig.insertBefore(b, fig.querySelector('figcaption'));

    function set(i, v) {
      ans[i] = v;
      groups[i][0].setAttribute('aria-pressed', v === 1 ? 'true' : 'false');
      groups[i][1].setAttribute('aria-pressed', v === 0 ? 'true' : 'false');
      upd();
    }
    function upd() {
      var done = ans.filter(function (a) { return a !== null; }).length;
      var yes = ans.filter(function (a) { return a === 1; }).length;
      score.textContent = done ? (yes + '/8 tiêu chí đạt, đã trả lời ' + done + '/8') : 'Chưa trả lời tiêu chí nào.';
      bar.style.width = (yes / 8 * 100) + '%';
      bar.style.background = yes >= 7 ? 'var(--ctr,#00897b)' : yes >= 5 ? 'var(--pos,#e8710a)' : '#c62828';
      var t = V[0][1];
      if (done === 8) {
        t = yes >= 7 ? V[3][1] : yes >= 5 ? V[2][1] : V[1][1];
        if (ans[0] === 0 || ans[7] === 0) t += ' Lưu ý: đề xuất chưa có kết quả đã làm hoặc chưa cam kết việc không làm.';
      } else if (done) t = 'Trả lời đủ 8 tiêu chí để xem đánh giá.';
      verdict.textContent = t;
    }
    upd();
    fig.classList.add('mh-ready');
  }

  function init() {
    [].forEach.call(document.querySelectorAll('figure.mh[data-mh="chonagency"]'), render);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
