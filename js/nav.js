/* Top menu that always fits.
   Every page carries its own hand-written <nav> with a different number of
   links, so a fixed breakpoint cannot serve them all. This measures instead:
   when the links fit on one row beside the brand they stay as they are; when
   they do not, they fold behind a Menu button and open as a list under the
   bar. Without this the links wrapped inside a fixed-height bar and the first
   rows were cut off above the top of the screen. */
(function () {
  var nav = document.querySelector('nav');
  if (!nav) return;
  var inner = nav.querySelector('.nav-inner');
  var links = nav.querySelector('.nav-links');
  if (!inner || !links) return;

  var css =
    'nav .nav-inner{position:relative}' +
    'nav .nav-links{display:flex;align-items:center;white-space:nowrap;flex-shrink:0}' +
    'nav .nav-toggle{display:none;align-items:center;gap:8px;height:36px;padding:0 12px;' +
      'background:transparent;border:1px solid var(--border,#30444f);border-radius:8px;' +
      'color:var(--text,#e6edf1);font:inherit;font-size:.9rem;cursor:pointer}' +
    'nav .nav-toggle:hover{border-color:var(--muted,#9db0ba)}' +
    'nav .nav-toggle svg{display:block}' +
    'nav.nav-collapsed .nav-toggle{display:inline-flex}' +
    'nav.nav-collapsed .nav-links{display:none}' +
    'nav.nav-collapsed.nav-open .nav-links{display:flex;flex-direction:column;align-items:stretch;' +
      'position:absolute;top:100%;left:0;right:0;white-space:normal;padding:6px 0 10px;' +
      'max-height:calc(100vh - 56px);overflow-y:auto;' +
      'border-top:1px solid var(--border,#30444f);border-bottom:1px solid var(--border,#30444f);' +
      'box-shadow:0 18px 30px rgba(0,0,0,.45)}' +
    'nav.nav-collapsed.nav-open .nav-links a{margin:0;padding:13px 24px;font-size:1rem}';
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'nav-toggle';
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-label', 'Menu');
  btn.innerHTML =
    '<svg width="16" height="12" viewBox="0 0 16 12" aria-hidden="true">' +
    '<path d="M0 1h16M0 6h16M0 11h16" stroke="currentColor" stroke-width="1.6"/></svg>' +
    '<span>Menu</span>';
  inner.appendChild(btn);

  // The open list sits over the page, so it takes the bar's own colour made solid.
  var m = /rgba?\((\d+)[, ]+(\d+)[, ]+(\d+)/.exec(getComputedStyle(nav).backgroundColor || '');
  var solid = m && (+m[1] + +m[2] + +m[3] > 0 || /rgb\(/.test(getComputedStyle(nav).backgroundColor))
    ? 'rgb(' + m[1] + ',' + m[2] + ',' + m[3] + ')'
    : '#101923';

  function setOpen(open) {
    nav.classList.toggle('nav-open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    links.style.background = open ? solid : '';
  }

  function fit() {
    setOpen(false);
    nav.classList.remove('nav-collapsed');
    // Uncollapsed, the links never shrink or wrap, so too many of them push
    // the row wider than the bar.
    if (inner.scrollWidth > inner.clientWidth + 1) nav.classList.add('nav-collapsed');
  }

  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    setOpen(!nav.classList.contains('nav-open'));
  });
  links.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('a')) setOpen(false);
  });
  document.addEventListener('click', function (e) {
    if (!nav.contains(e.target)) setOpen(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setOpen(false);
  });

  var lastW = -1;
  window.addEventListener('resize', function () {
    if (window.innerWidth === lastW) return; // phone address bar hiding fires resize too
    lastW = window.innerWidth;
    fit();
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  lastW = window.innerWidth;
  fit();
})();
