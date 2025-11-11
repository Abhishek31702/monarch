// common.js
async function loadPartial(selector, url) {
  try {
    const resp = await fetch(url, { cache: "no-store" });
    if (!resp.ok) throw new Error(`Failed to load ${url}: ${resp.status}`);
    const html = await resp.text();
    document.querySelector(selector).innerHTML = html;

    // ✅ If header is loaded, initialize mobile menu
    if (url.includes('header')) {
      initMobileMenu();
    }

  } catch (err) {
    console.error(err);
  }
}

function markActiveLink() {
  const links = document.querySelectorAll('.main-nav a');
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  
  links.forEach(a => {
    const href = a.getAttribute('href').split('/').pop();
    if (href === currentPage) {
      a.classList.add('active');
    } else {
      a.classList.remove('active');
    }
  });
}

// ✅ Mobile menu function
function initMobileMenu() {
  const $toggleButton = $('.s-header__menu-toggle');
  const $nav = $('.s-header__nav');

  $toggleButton.on('click', function (event) {
    event.preventDefault();
    $toggleButton.toggleClass('is-clicked');
    $nav.slideToggle();
  });

  if ($toggleButton.is(':visible')) $nav.addClass('mobile');

  $(window).resize(function () {
    if ($toggleButton.is(':visible')) $nav.addClass('mobile');
    else $nav.removeClass('mobile');
  });

  $('.s-header__nav ul').find('a').on("click", function () {
    if ($nav.hasClass('mobile')) {
      $toggleButton.trigger('click');
    }
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadPartial('#header', '/partials/header.html');
  await loadPartial('#footer', '/partials/footer.html');

  // Set year in footer
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  markActiveLink();
});
