(function() {
  var handlers = {};

  handlers.default = function(target, c) {
    if (typeof c === 'string') {
      var htmlField = target.querySelector('[data-field="html"]');
      if (htmlField) htmlField.innerHTML = c;
      else target.innerHTML = c;
      return true;
    }
    var fields = target.querySelectorAll('[data-field]');
    if (fields.length) {
      fields.forEach(function(el) {
        var field = el.getAttribute('data-field');
        if (c[field] != null) {
          if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.value = c[field];
          else el.innerHTML = c[field];
        }
      });
      return true;
    }
    if (c.html) { target.innerHTML = c.html; return true; }
    if (c.heading) {
      var h = target.querySelector('h1, h2, h3, h4, h5, h6');
      if (h) h.innerHTML = c.heading;
    }
    if (c.text) {
      var p = target.querySelector('p');
      if (p) p.textContent = c.text;
    }
    if (c.title) {
      var h = target.querySelector('h1, h2, h3, h4, h5, h6');
      if (h) h.innerHTML = c.title;
    }
    if (c.desc) {
      var p = target.querySelector('p');
      if (p) p.textContent = c.desc;
    }
    if (c.q) {
      var qEl = target.querySelector('[data-field="q"]');
      if (qEl) qEl.textContent = c.q;
    }
    if (c.a) {
      var aEl = target.querySelector('[data-field="a"]');
      if (aEl) aEl.textContent = c.a;
    }
    if (c.label) {
      var lEl = target.querySelector('[data-field="label"]');
      if (lEl) lEl.textContent = c.label;
    }
    if (c.value) {
      var vEl = target.querySelector('[data-field="value"]');
      if (vEl) vEl.textContent = c.value;
    }
    if (c.bio) {
      var bEl = target.querySelector('[data-field="bio"]');
      if (bEl) bEl.innerHTML = c.bio;
    }
    if (c.url) {
      var iframe = target.querySelector('iframe');
      if (iframe) iframe.src = c.url;
    }
    return true;
  };

  handlers.testimonial = function(target, c) {
    var nameEl = target.querySelector('[data-field="name"]');
    if (nameEl && c.name) nameEl.textContent = c.name;
    var roleEl = target.querySelector('[data-field="role"]');
    if (roleEl && c.role) roleEl.textContent = c.role;
    var textEl = target.querySelector('[data-field="text"]');
    if (textEl && c.text) textEl.textContent = c.text;
  };

  handlers.stats = function(target, c) {
    Object.keys(c).forEach(function(k) {
      var el = target.querySelector('[data-field="' + k + '"]');
      if (el) el.textContent = c[k];
    });
  };

  handlers.videoUrl = function(target, c) {
    var iframe = target.querySelector('iframe');
    if (iframe && c.url) iframe.src = c.url;
  };

  window.renderSections = function(sections) {
    if (!sections) return;
    sections.forEach(function(s) {
      var c = s.content || {};
      var type = s.type;
      var target = document.querySelector('[data-section="' + type + '"]');
      if (!target) return;

      if (handlers[type]) handlers[type](target, c);
      else handlers.default(target, c);
    });
  };
})();
