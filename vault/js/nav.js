(function() {
  function getPageName(href) {
    return href.replace(/\.\w+$/, '');
  }

  function getCurrentPageName() {
    var page = window.location.pathname.split('/').pop() || 'index.html';
    return page.replace(/\.\w+$/, '');
  }

  function highlightNav() {
    var pageName = getCurrentPageName();
    // Full-screen menu
    document.querySelectorAll('.mil-main-menu a').forEach(function(a) {
      var aPage = getPageName(a.getAttribute('href'));
      var li = a.closest('li');
      if (li) {
        if (aPage === pageName) li.classList.add('mil-active');
        else li.classList.remove('mil-active');
      }
    });

    // Top navigation
    document.querySelectorAll('.mil-top-nav a').forEach(function(a) {
      var aPage = getPageName(a.getAttribute('href'));
      var li = a.closest('li');
      if (li) {
        if (aPage === pageName) li.classList.add('mil-active');
        else li.classList.remove('mil-active');
      } else {
        if (aPage === pageName) a.classList.add('mil-active');
        else a.classList.remove('mil-active');
      }
    });

    // Footer menu
    document.querySelectorAll('.mil-footer-menu a').forEach(function(a) {
      var aPage = getPageName(a.getAttribute('href'));
      var li = a.closest('li');
      if (li) {
        if (aPage === pageName) li.classList.add('mil-active');
        else li.classList.remove('mil-active');
      }
    });
  }

  highlightNav();

  document.addEventListener('swup:contentReplaced', highlightNav);
})();
