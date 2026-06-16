(function() {

    function init() {

        // Session check — redirect to login if no session (skip login page)
        var sessionPage = window.location.pathname.split('/').pop();
        if (sessionPage !== 'index.html' && !window.location.pathname.includes('login')) {
            if (!sessionStorage.getItem('testudo_admin_session')) {
                window.location.href = 'index.html';
                return;
            }
        }

        // Page transition on internal links
        var transitionOverlay = document.createElement('div');
        transitionOverlay.className = 'page-transition';
        document.body.appendChild(transitionOverlay);

        document.addEventListener('click', function(e) {
            var link = e.target.closest('a');
            if (!link) return;
            var href = link.getAttribute('href');
            if (!href || href === '#' || href.startsWith('javascript:') || link.getAttribute('onclick')) return;
            var isInternal = href.indexOf('://') === -1 && !href.startsWith('//');
            if (!isInternal) return;
            e.preventDefault();
            transitionOverlay.classList.add('active');
            setTimeout(function() {
                window.location.href = href;
            }, 350);
        });

        // Page loaded
        document.body.classList.add('page-loading');
        setTimeout(function() {
            document.body.classList.remove('page-loading');
            document.body.classList.add('page-loaded');
        }, 50);

        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
            anchor.addEventListener('click', function(e) {
                var target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });

        // Scroll reveal with IntersectionObserver
        var revealElements = function() {
            var els = document.querySelectorAll('.reveal');
            if (!els.length) return;
            var observer = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('revealed');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });
            els.forEach(function(el) { observer.observe(el); });
        };
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', revealElements);
        } else {
            revealElements();
        }

        // Sidebar toggle
        window.toggleSidebar = function() {
            var sidebar = document.querySelector('.sidebar');
            if (window.innerWidth <= 768) {
                sidebar.classList.toggle('mobile-open');
            } else {
                sidebar.classList.toggle('collapsed');
            }
        };

        // Close sidebar on mobile when clicking outside
        document.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                var sidebar = document.querySelector('.sidebar');
                if (!sidebar.contains(e.target) && !e.target.closest('.sidebar-toggle')) {
                    sidebar.classList.remove('mobile-open');
                }
            }
        });

        // Toast system
        if (!document.querySelector('.toast-container')) {
            var toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }

        window.showToast = function(title, msg, type, duration) {
            type = type || 'success';
            duration = duration || 4000;
            var container = document.querySelector('.toast-container');
            var icons = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle', warning: 'fa-exclamation-triangle' };

            var toast = document.createElement('div');
            toast.className = 'toast';
            toast.innerHTML = '<div class="toast-icon ' + type + '"><i class="fa ' + (icons[type] || icons.success) + '"></i></div><div class="toast-content"><div class="toast-title">' + title + '</div><div class="toast-msg">' + msg + '</div></div><button class="toast-close" onclick="this.closest(\'.toast\').classList.add(\'removing\');setTimeout(function(){this.closest(\'.toast\').remove()}.bind(this),300)">&times;</button>';
            container.appendChild(toast);

            setTimeout(function() {
                toast.classList.add('removing');
                setTimeout(function() { toast.remove(); }, 300);
            }, duration);
        };

        // Loading state helper
        window.setLoading = function(el, loading, loadingText) {
            if (!el) return;
            if (loading) {
                el.dataset.originalText = el.textContent;
                el.disabled = true;
                el.innerHTML = '<span class="spinner" style="vertical-align:middle;margin-right:6px"></span> ' + (loadingText || 'Saving...');
            } else {
                el.disabled = false;
                el.textContent = el.dataset.originalText || 'Save Changes';
            }
        };

        // Cookie consent
        if (!localStorage.getItem('testudo_cookie_consent')) {
            var cookieBar = document.createElement('div');
            cookieBar.className = 'cookie-bar';
            cookieBar.id = 'cookieBar';
            cookieBar.innerHTML = '<div class="cookie-inner"><div class="cookie-text"><i class="fa fa-cookie-bite"></i><p>This site uses cookies to improve your experience. By continuing, you agree to our <a href="#">Privacy Policy</a>.</p></div><div class="cookie-actions"><button class="btn-cookie decline" onclick="declineCookies()">Decline</button><button class="btn-cookie accept" onclick="acceptCookies()">Accept All</button></div></div>';
            document.body.appendChild(cookieBar);
            setTimeout(function() { cookieBar.classList.add('active'); }, 300);
        }

        window.acceptCookies = function() {
            localStorage.setItem('testudo_cookie_consent', 'accepted');
            var bar = document.getElementById('cookieBar');
            bar.classList.remove('active');
            setTimeout(function() { bar.remove(); }, 300);
            showToast('Cookies Accepted', 'Your preferences have been saved.', 'success');
        };

        window.declineCookies = function() {
            localStorage.setItem('testudo_cookie_consent', 'declined');
            var bar = document.getElementById('cookieBar');
            bar.classList.remove('active');
            setTimeout(function() { bar.remove(); }, 300);
            showToast('Cookies Declined', 'Only essential cookies will be used.', 'info');
        };

        // Table row hover
        document.querySelectorAll('.table-card table tbody tr').forEach(function(row) {
            row.addEventListener('mouseenter', function() {
                this.style.transition = 'background 0.15s ease';
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();