// Handle right-side dropdown in mobile view
$('.has-dropdown-right > a').on('click', function(e) {
  if ($(window).width() <= 768) { // mobile only
    e.preventDefault();
    $(this).next('.dropdown-right').slideToggle();
  }
});
