(function() {
  function setText(sel, val) {
    var el = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if (el && val) el.textContent = val;
  }

  function setHTML(sel, val) {
    var el = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if (el && val) el.innerHTML = val;
  }

  function setAttr(sel, attr, val) {
    var el = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if (el && val) el.setAttribute(attr, val);
  }

  function forEach(sel, fn) {
    document.querySelectorAll(sel).forEach(fn);
  }

  window.initPage = async function() {
    // 1. Get current settings and apply to footer/common elements
    try {
      var res = await api.getSettings();
      var s = res.settings || res;
      if (s) {
        // Footer brand name
        forEach('.mil-logo.mil-muted, footer .mil-logo', function(el) {
          if (s.siteName) el.textContent = s.siteName;
        });

        // Footer phone (replace any text containing a phone pattern)
        if (s.contactPhone) {
          forEach('footer .mil-light-soft', function(el) {
            el.textContent = el.textContent.replace(/[\+\d][\d\s\(\)\-]{7,20}/g, s.contactPhone);
          });
        }

        // Social links
        if (s.social) {
          forEach('.mil-social-icons a', function(a) {
            var icon = a.querySelector('i');
            if (!icon) return;
            var cls = icon.className;
            var platform = null;
            if (cls.indexOf('facebook') > -1 || cls.indexOf('behance') > -1) platform = 'behance';
            else if (cls.indexOf('dribbble') > -1) platform = 'dribbble';
            else if (cls.indexOf('twitter') > -1) platform = 'twitter';
            else if (cls.indexOf('github') > -1) platform = 'github';
            else if (cls.indexOf('linkedin') > -1) platform = 'linkedin';
            else if (cls.indexOf('instagram') > -1) platform = 'instagram';
            if (platform && s.social[platform]) a.href = s.social[platform];
          });
        }

        // Site description for newsletter subscribe text
        if (s.siteDescription) {
          forEach('[data-editable="site-description"]', function(el) {
            el.textContent = s.siteDescription;
          });
        }

        // Copyright year
        forEach('footer', function(el) {
          el.innerHTML = el.innerHTML.replace(/\d{4}/, new Date().getFullYear().toString());
        });
      }
    } catch (e) { console.warn('Settings API unavailable', e); }

    // 2. Determine slug of current page
    var path = window.location.pathname;
    var filename = path.substring(path.lastIndexOf('/') + 1);
    var slug = filename.replace('.html', '') || 'home';
    if (slug === 'index') slug = 'home';

    // 3. Load page-specific API content
    try {
      var pageData = await api.getPage(slug);
      var page = pageData.page;
      if (page) {
        // Meta title
        document.title = page.seo?.metaTitle || page.title || 'Testudo';
        if (page.seo?.metaDescription) {
          var meta = document.querySelector('meta[name="description"]');
          if (!meta) {
            meta = document.createElement('meta');
            meta.name = 'description';
            document.head.appendChild(meta);
          }
          meta.content = page.seo.metaDescription;
        }

        // Render generic sections via sections.js
        if (typeof renderSections === 'function') {
          renderSections(page.sections);
        }

        // Current page label
        var curPage = document.querySelector('.mil-frame-top .mil-current-page');
        if (curPage) curPage.textContent = page.title || 'Page';

        // Hero custom mapping if needed
        var sections = page.sections || [];
        var heroSection = sections.find(function(s) { return s.type === 'hero'; });
        if (heroSection) {
          var c = heroSection.content || {};
          var h1 = document.querySelector('.mil-dark-bg h1, [data-editable="hero-heading"]');
          if (h1 && c.heading) h1.innerHTML = c.heading;
          var sub = document.querySelector('.mil-dark-bg .mil-text-xl, [data-editable="hero-text"]');
          if (sub && c.subheading) sub.innerHTML = c.subheading;
        }

        // Page specific initializations
        if (slug === 'home') {
          await loadHomeGrids();
        } else if (slug === 'about') {
          var storySection = sections.find(function(s) { return s.type === 'story'; });
          if (storySection) {
            var c = storySection.content || {};
            var storyEl = document.getElementById('about-story-content');
            if (storyEl) {
              var html = '';
              if (c.heading) html += '<h2 class="mil-up mil-mb-30">' + c.heading + '</h2>';
              if (c.html) html += c.html;
              if (html) storyEl.innerHTML = html;
            }
          }
        } else if (slug === 'services') {
          await loadServicesGrid();
        } else if (slug === 'team') {
          await loadTeamGrid();
        } else if (slug === 'contact') {
          await setupContactPage(s);
        }
      }
    } catch (e) {
      console.warn('Page API execution failed', e);
    }
  };

  // Helper functions for page specific grid loads
  async function loadHomeGrids() {
    try {
      var servicesData = await api.getServices();
      var services = servicesData.services || servicesData;
      var grid = document.getElementById('services-grid');
      if (grid && services && services.length) {
        grid.innerHTML = '';
        services.slice(0, 4).forEach(function(svc) {
          var col = document.createElement('div');
          col.className = 'col-md-6 col-lg-3 mil-services-grid-item p-0';
          col.innerHTML = '<a href="services.html" class="mil-service-card-sm mil-up">' +
            '<h5 class="mil-muted mil-mb-30">' + (svc.title || '') + '</h5>' +
            '<p class="mil-light-soft mil-mb-30">' + (svc.shortDescription || '') + '</p>' +
            '<div class="mil-button mil-icon-button-sm mil-arrow-place"></div></a>';
          grid.appendChild(col);
        });
      }
    } catch (e) { console.warn('Home services grid load failed', e); }

    try {
      var teamData = await api.getTeam();
      var members = teamData.members || teamData;
      var teamGrid = document.getElementById('team-grid');
      if (teamGrid && members && members.length) {
        teamGrid.innerHTML = '';
        var col1 = document.createElement('div');
        col1.className = 'col-sm-6';
        var col2 = document.createElement('div');
        col2.className = 'col-sm-6';
        members.slice(0, 4).forEach(function(m, i) {
          var card = document.createElement('div');
          card.className = 'mil-team-card mil-up mil-mb-30';
          var img = m.image || 'img/photo/vault_mercy.jpg';
          var socialIcons = '';
          if (m.linkedin) socialIcons += '<li><a href="' + m.linkedin + '" target="_blank" class="social-icon"><i class="fab fa-linkedin"></i></a></li>';
          if (m.twitter) socialIcons += '<li><a href="' + m.twitter + '" target="_blank" class="social-icon"><i class="fab fa-twitter"></i></a></li>';
          card.innerHTML = '<img src="' + img + '" alt="' + (m.name || '') + '">' +
            '<div class="mil-description"><div class="mil-secrc-text">' +
            '<h5 class="mil-muted mil-mb-5">' + (m.name || '') + '</h5>' +
            '<p class="mil-link mil-light-soft mil-mb-10">' + (m.role || '') + '</p>' +
            '<ul class="mil-social-icons mil-center">' + socialIcons + '</ul>' +
            '</div></div>';
          if (i % 2 === 0) col1.appendChild(card);
          else col2.appendChild(card);
        });
        teamGrid.appendChild(col1);
        teamGrid.appendChild(col2);
      }
    } catch (e) { console.warn('Home team grid load failed', e); }
  }

  async function loadServicesGrid() {
    try {
      var svcData = await api.getServices();
      var services = svcData.services || svcData;
      var grid = document.getElementById('services-grid');
      if (grid && services && services.length) {
        grid.innerHTML = '';
        services.forEach(function(svc) {
          var col = document.createElement('div');
          col.className = 'col-md-6 col-lg-3 mil-services-grid-item p-0';
          col.innerHTML = '<a href="services.html" class="mil-service-card-sm mil-up">' +
            '<h5 class="mil-muted mil-mb-30">' + (svc.title || '') + '</h5>' +
            '<p class="mil-light-soft mil-mb-30">' + (svc.shortDescription || '') + '</p>' +
            '<div class="mil-button mil-icon-button-sm mil-arrow-place"></div></a>';
          grid.appendChild(col);
        });
      }
    } catch (e) { console.warn('Services grid load failed', e); }
  }

  async function loadTeamGrid() {
    try {
      var teamData = await api.getTeam();
      var members = teamData.members || teamData;
      var teamGrid = document.getElementById('team-grid');
      if (teamGrid && members && members.length) {
        teamGrid.innerHTML = '';
        members.forEach(function(m) {
          var col = document.createElement('div');
          col.className = 'col-sm-6 col-lg-3 mil-mb-30';
          var img = m.image || 'img/photo/vault_mercy.jpg';
          var socialIcons = '';
          if (m.linkedin) socialIcons += '<li><a href="' + m.linkedin + '" target="_blank" class="social-icon"><i class="fab fa-linkedin"></i></a></li>';
          if (m.twitter) socialIcons += '<li><a href="' + m.twitter + '" target="_blank" class="social-icon"><i class="fab fa-twitter"></i></a></li>';
          col.innerHTML = '<div class="mil-team-card mil-up mil-mb-30">' +
            '<img src="' + img + '" alt="' + (m.name || '') + '">' +
            '<div class="mil-description"><div class="mil-secrc-text">' +
            '<h5 class="mil-muted mil-mb-5">' + (m.name || '') + '</h5>' +
            '<p class="mil-link mil-light-soft mil-mb-10">' + (m.role || '') + '</p>' +
            '<ul class="mil-social-icons mil-center">' + socialIcons + '</ul>' +
            '</div></div></div>';
          teamGrid.appendChild(col);
        });
      }
    } catch (e) { console.warn('Team grid load failed', e); }
  }

  async function setupContactPage(s) {
    if (s) {
      document.querySelectorAll('[data-editable="email"]').forEach(function(el) {
        if (s.contactEmail) el.textContent = s.contactEmail;
      });
      document.querySelectorAll('[data-editable="phone"]').forEach(function(el) {
        if (s.contactPhone) el.textContent = s.contactPhone;
      });
      document.querySelectorAll('[data-editable="address"]').forEach(function(el) {
        if (s.contactAddress) el.textContent = s.contactAddress;
      });
      document.querySelectorAll('[data-editable="office-hours"]').forEach(function(el) {
        if (s.officeHours) el.textContent = s.officeHours;
      });
    }

    var form = document.querySelector('form');
    if (form) {
      // Clean up previous event listener by replacing the form node (to avoid double submission issues)
      var newForm = form.cloneNode(true);
      form.parentNode.replaceChild(newForm, form);
      
      newForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        var inputs = newForm.querySelectorAll('input, textarea');
        var data = {};
        var labels = ['name', 'email', 'subject', 'message'];
        inputs.forEach(function(inp, i) {
          if (labels[i]) data[labels[i]] = inp.value;
        });
        try {
          await api.sendMessage(data);
          alert('Message sent successfully!');
          newForm.querySelectorAll('input, textarea').forEach(function(i) { i.value = ''; });
        } catch (err) {
          alert('Failed to send: ' + err.message);
        }
      });
    }
  }

  // Run immediately on initial script execution (only if DOMContentLoaded has already fired or is fired)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initPage);
  } else {
    window.initPage();
  }
})();
