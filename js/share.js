// Share row for project pages. Put <div data-share></div> where it should
// appear and load this script. It shares the page's canonical URL; the preview
// people see (image, title, description) comes from the page's og: tags.
(function () {
  var host = document.querySelector('[data-share]');
  if (!host) return;

  var canon = document.querySelector('link[rel=canonical]');
  var url = canon ? canon.href : location.href.split('#')[0];
  var og = document.querySelector('meta[property="og:title"]');
  var title = (og ? og.content : document.title).replace(/\s*(,|—|&mdash;)\s*CortiCorp$/, '');
  var desc = document.querySelector('meta[property="og:description"]');
  var text = title + (desc ? ': ' + desc.content : '');
  var u = encodeURIComponent(url);

  var css = document.createElement('style');
  css.textContent =
    '.share-row{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:14px}' +
    '.share-row .lbl{font-size:.72rem;letter-spacing:.2em;text-transform:uppercase;color:var(--muted,#9a8e7a);margin-right:4px}' +
    '.share-row a,.share-row button{display:inline-flex;align-items:center;gap:7px;height:36px;padding:0 13px;' +
    'border-radius:8px;border:1px solid var(--border,#2a241c);background:var(--surface2,#1c1915);' +
    'color:var(--text,#e8e0d4);font:inherit;font-size:.85rem;cursor:pointer;text-decoration:none}' +
    '.share-row a:hover,.share-row button:hover{border-color:var(--accent,#d4a555);text-decoration:none}' +
    '.share-row svg{width:16px;height:16px;fill:currentColor;flex:none}';
  document.head.appendChild(css);

  var icons = {
    share: '<path d="M18 16a3 3 0 0 0-2.4 1.2l-6.7-3.4a3 3 0 0 0 0-1.6l6.7-3.4A3 3 0 1 0 15 7l-6.7 3.4a3 3 0 1 0 0 3.2L15 17a3 3 0 1 0 3-1z"/>',
    linkedin: '<path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.75h4V21H3zM9.5 9.75h3.8v1.6h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-4.95c0-1.18-.02-2.7-1.65-2.7-1.65 0-1.9 1.29-1.9 2.62V21h-4z"/>',
    facebook: '<path d="M13.5 21v-7.5H16l.4-3H13.5V8.6c0-.87.25-1.46 1.5-1.46h1.6V4.46A21 21 0 0 0 14.27 4.3c-2.3 0-3.87 1.4-3.87 3.97V10.5H7.8v3h2.6V21z"/>',
    x: '<path d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.78zm-1.08 16.2h1.7L7.4 4.73H5.58z"/>',
    link: '<path d="M10.6 13.4a1 1 0 0 1 0-1.4l3.5-3.5a3 3 0 1 1 4.2 4.2l-2 2a1 1 0 0 1-1.4-1.4l2-2a1 1 0 1 0-1.4-1.4l-3.5 3.5a1 1 0 0 1-1.4 0zm2.8-2.8a1 1 0 0 1 0 1.4l-3.5 3.5a3 3 0 1 1-4.2-4.2l2-2a1 1 0 0 1 1.4 1.4l-2 2a1 1 0 1 0 1.4 1.4l3.5-3.5a1 1 0 0 1 1.4 0z"/>'
  };
  function svg(name) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + icons[name] + '</svg>'; }
  function link(name, label, href) {
    return '<a href="' + href + '" target="_blank" rel="noopener" data-net="' + name + '">' + svg(name) + label + '</a>';
  }

  var html = '<span class="lbl">Share</span>';
  if (navigator.share) html += '<button type="button" data-act="native">' + svg('share') + 'Share</button>';
  html += link('linkedin', 'LinkedIn', 'https://www.linkedin.com/sharing/share-offsite/?url=' + u)
        + link('facebook', 'Facebook', 'https://www.facebook.com/sharer/sharer.php?u=' + u)
        + link('x', 'X', 'https://twitter.com/intent/tweet?url=' + u + '&text=' + encodeURIComponent(title))
        + '<button type="button" data-act="copy">' + svg('link') + '<span>Copy link</span></button>';
  host.className += ' share-row';
  host.innerHTML = html;

  host.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.act === 'native') {
      navigator.share({ title: title, text: text, url: url }).catch(function () {});
    } else if (b.dataset.act === 'copy') {
      var label = b.querySelector('span');
      var done = function () { label.textContent = 'Copied'; setTimeout(function () { label.textContent = 'Copy link'; }, 1800); };
      if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, function () { prompt('Copy this link', url); });
      else prompt('Copy this link', url);
    }
  });
})();
