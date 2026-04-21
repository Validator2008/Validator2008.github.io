(async function loadPosts() {
  const RSS_URL = 'https://ilyasakharov.substack.com/feed';
  const API = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(RSS_URL);

  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error('network');
    const data = await res.json();
    if (data.status !== 'ok' || !data.items?.length) throw new Error('no items');

    // ── Latest post ──────────────────────────────────────────────
    const post = data.items[0];
    const tmp = document.createElement('div');
    tmp.innerHTML = post.description || '';
    const excerpt = (tmp.textContent || tmp.innerText || '').trim().slice(0, 280);
    const date = post.pubDate
      ? new Date(post.pubDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : '';

    document.getElementById('post-title').textContent = post.title;
    document.getElementById('post-title').href = post.link;
    document.getElementById('post-date').textContent = date;
    document.getElementById('post-excerpt').textContent = excerpt ? excerpt + (excerpt.length >= 280 ? '…' : '') : '';
    document.getElementById('post-link').href = post.link;

    // Extract cover image from content HTML
    const contentDiv = document.createElement('div');
    contentDiv.innerHTML = post.content || '';
    const firstImg = contentDiv.querySelector('img');
    const coverSrc = post.thumbnail || (firstImg ? firstImg.src : null);
    if (coverSrc) {
      const coverEl = document.getElementById('post-cover');
      coverEl.src = coverSrc;
      coverEl.style.display = 'block';
    }

    document.getElementById('post-skeleton').style.display = 'none';
    document.getElementById('post-content').style.display = 'block';

    // ── Carousel (all posts, skipping index 0 which is already shown) ──
    const track = document.getElementById('carousel-track');
    const items = data.items;

    items.forEach(function(item) {
      // Try to extract first image from content HTML
      const contentDiv = document.createElement('div');
      contentDiv.innerHTML = item.content || '';
      const firstImg = contentDiv.querySelector('img');
      const imgSrc = item.thumbnail || (firstImg ? firstImg.src : null);

      // Clean subtitle from description HTML
      const descDiv = document.createElement('div');
      descDiv.innerHTML = item.description || '';
      const subtitle = (descDiv.textContent || descDiv.innerText || '').trim();

      const itemDate = item.pubDate
        ? new Date(item.pubDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        : '';

      const card = document.createElement('a');
      card.className = 'carousel-card';
      card.href = item.link;
      card.target = '_blank';
      card.rel = 'noreferrer';

      const imgHtml = imgSrc
        ? '<img class="carousel-card-img" src="' + imgSrc + '" alt="" loading="lazy">'
        : '<div class="carousel-card-img-placeholder">&#9998;</div>';

      card.innerHTML =
        imgHtml +
        '<div class="carousel-card-body">' +
          '<div class="carousel-card-date">' + itemDate + '</div>' +
          '<div class="carousel-card-title">' + item.title + '</div>' +
          (subtitle ? '<div class="carousel-card-sub">' + subtitle + '</div>' : '') +
        '</div>';

      track.appendChild(card);
    });

    // Show carousel
    document.getElementById('posts-carousel').style.display = 'block';

    // ── Navigation ───────────────────────────────────────────────
    let page = 0;
    const CARDS_PER_VIEW = window.innerWidth <= 520 ? 1 : window.innerWidth <= 860 ? 2 : 3;

    function getCardsPerView() {
      return window.innerWidth <= 520 ? 1 : window.innerWidth <= 860 ? 2 : 3;
    }

    function updateCarousel() {
      const cpv = getCardsPerView();
      const maxPage = Math.max(0, items.length - cpv);
      page = Math.min(page, maxPage);

      const cardWidth = track.children[0]
        ? track.children[0].getBoundingClientRect().width + 14
        : 0;

      track.style.transform = 'translateX(-' + (page * cardWidth) + 'px)';
      document.getElementById('carousel-prev').style.opacity = page === 0 ? '0.35' : '1';
      document.getElementById('carousel-next').style.opacity = page >= maxPage ? '0.35' : '1';
    }

    document.getElementById('carousel-prev').addEventListener('click', function() {
      page = Math.max(0, page - 1);
      updateCarousel();
    });

    document.getElementById('carousel-next').addEventListener('click', function() {
      const maxPage = Math.max(0, items.length - getCardsPerView());
      page = Math.min(maxPage, page + 1);
      updateCarousel();
    });

    window.addEventListener('resize', function() { page = 0; updateCarousel(); });
    updateCarousel();

  } catch (e) {
    // On failure, hide the skeleton and show a plain fallback link
    const card = document.getElementById('latest-post-card');
    card.innerHTML =
      '<div class="latest-label">Writing on Substack</div>' +
      '<p class="post-excerpt" style="margin-bottom:14px;">Thoughts on engineering leadership, technology strategy, and building resilient organizations.</p>' +
      '<a class="btn" href="https://ilyasakharov.substack.com/" target="_blank" rel="noreferrer">Read on Substack &rarr;</a>';
  }
})();

// ── Utils nav dropdown toggle ─────────────────────────────────────────────
(function () {
  var wrap = document.getElementById('nav-utils-wrap');
  var btn  = document.getElementById('nav-utils-btn');
  if (!wrap || !btn) return;
  btn.addEventListener('click', function () {
    var open = wrap.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
  });
  document.addEventListener('click', function (e) {
    if (!wrap.contains(e.target)) {
      wrap.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
})();
