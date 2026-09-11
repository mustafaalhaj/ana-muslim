document.addEventListener('DOMContentLoaded', () => {

    // --- Enforce Arabic Language Only ---
    document.documentElement.lang = 'ar';
    document.documentElement.dir = 'rtl';
    localStorage.setItem('anamuslim_lang', 'ar');

    // --- Scroll & Reveal ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // Navbar scroll
    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', () => { header.classList.toggle('scrolled', window.scrollY > 50); });
    }

    // FAQ Accordions
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            const isOpen = header.classList.contains('active');

            // Close others
            document.querySelectorAll('.accordion-header').forEach(h => {
                if (h !== header && h.classList.contains('active')) {
                    h.classList.remove('active');
                    h.nextElementSibling.style.maxHeight = null;
                    h.nextElementSibling.style.opacity = '0';
                }
            });

            // Toggle current
            header.classList.toggle('active');
            if (!isOpen) {
                content.style.opacity = '1';
                requestAnimationFrame(() => {
                    content.style.maxHeight = (content.scrollHeight + 30) + "px";
                });
            } else {
                content.style.maxHeight = null;
                content.style.opacity = '0';
            }
        });
    });

    // --- 3D Tilt for Cards ---
    const tiltCards = document.querySelectorAll('[data-tilt], .feature-card, .platform-card');
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -5;
            const rotateY = ((x - centerX) / centerX) * 5;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    });

    // --- Custom Cursor Logic ---
    const cursorDot = document.querySelector('[data-cursor-dot]');
    const cursorOutline = document.querySelector('[data-cursor-outline]');

    if (cursorDot && cursorOutline) {
        window.addEventListener('mousemove', function (e) {
            const posX = e.clientX;
            const posY = e.clientY;

            cursorDot.style.left = `${posX}px`;
            cursorDot.style.top = `${posY}px`;

            cursorOutline.animate({
                left: `${posX}px`,
                top: `${posY}px`
            }, { duration: 500, fill: "forwards" });
        });

        const hoverables = document.querySelectorAll('a, button, .feature-card, .platform-card, .accordion-header');
        hoverables.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorOutline.style.width = '60px';
                cursorOutline.style.height = '60px';
                cursorOutline.style.backgroundColor = 'rgba(255,255,255,0.1)';
            });
            el.addEventListener('mouseleave', () => {
                cursorOutline.style.width = '40px';
                cursorOutline.style.height = '40px';
                cursorOutline.style.backgroundColor = 'transparent';
            });
        });
    }

    // --- Mobile Menu Logic ---
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const closeMenuBtn = document.querySelector('.close-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-nav-links a');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
        });

        const closeMenu = () => {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        };

        if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMenu);
        mobileLinks.forEach(link => {
            link.addEventListener('click', closeMenu);
        });
    }

    // --- Cookie Consent Banner ---
    if (!localStorage.getItem('cookie_consent')) {
        const cookieBanner = document.createElement('div');
        cookieBanner.id = 'cookie-consent-banner';
        cookieBanner.className = 'cookie-banner glass';
        cookieBanner.innerHTML = `
            <div class="cookie-banner-content">
                <p>نحن نستخدم ملفات تعريف الارتباط (Cookies) لضمان تقديم أفضل تجربة وإعلانات مخصصة وفقاً لـ <a href="privacy.html">سياسة الخصوصية</a>.</p>
                <div class="cookie-banner-actions">
                    <button id="accept-cookies-btn" class="btn btn-primary btn-sm" style="padding: 6px 18px; border-radius: 8px;">موافق</button>
                </div>
            </div>
        `;
        document.body.appendChild(cookieBanner);
        
        const acceptBtn = document.getElementById('accept-cookies-btn');
        if (acceptBtn) {
            acceptBtn.addEventListener('click', () => {
                localStorage.setItem('cookie_consent', 'accepted');
                cookieBanner.remove();
            });
        }
    }

});

// --- Global iOS IPA Modal Helper Functions ---
function openIosModal(e) {
    if (e) e.preventDefault();
    const modal = document.getElementById('ios-modal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeIosModal() {
    const modal = document.getElementById('ios-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function closeAnnouncementBar() {
    const bar = document.getElementById('announcement-bar');
    if (bar) {
        bar.style.display = 'none';
    }
}

// Close on outside click & ESC key
document.addEventListener('click', (e) => {
    const modal = document.getElementById('ios-modal');
    if (modal && e.target === modal) {
        closeIosModal();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeIosModal();
    }
});
