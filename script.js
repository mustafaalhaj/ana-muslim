document.addEventListener('DOMContentLoaded', () => {

    // --- Preloader & Entry ---
    const preloader = document.getElementById('preloader');
    if (preloader) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                preloader.style.opacity = '0';
                preloader.style.visibility = 'hidden';

                // Trigger entry animations
                document.querySelector('.header').classList.remove('initial-hidden');
                document.querySelectorAll('.hero .reveal-text').forEach(el => el.classList.add('active'));

                // Start Text Scramble
                const heroTitle = document.querySelector('.hero-title');
                if (heroTitle) {
                    new ScrambleText(heroTitle, "رفيقك اليومي \n في العبادة والحياة").start();
                }
            }, 1000);
        });
    }

    // --- 3D Globe / Network Canvas ---
    const canvas = document.getElementById('bg-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;

        // Globe Config
        const GLOBE_RADIUS = 400;
        const DOTS_AMOUNT = 800;
        const DOT_RADIUS = 1.5;
        let fieldOfView;

        class Dot3D {
            constructor(x, y, z) {
                this.x = x; this.y = y; this.z = z;
                this.xProjected = 0; this.yProjected = 0;
                this.scaleProjected = 0;
            }
            project() {
                this.scaleProjected = fieldOfView / (fieldOfView + this.z);
                this.xProjected = (this.x * this.scaleProjected) + width / 2; // Center
                this.yProjected = (this.y * this.scaleProjected) + height / 2;
            }
            draw() {
                this.project();
                // Opacity based on Z (depth)
                // We clamp opacity to avoid negative values
                let alpha = (this.z + GLOBE_RADIUS) / (2 * GLOBE_RADIUS);
                // Invert so front is opaque
                alpha = 1 - Math.min(Math.max(alpha, 0), 1);
                // Make back dots very faint
                if (alpha < 0.1) alpha = 0.1;

                ctx.globalAlpha = alpha;

                // Color based on x position for gradient effect
                if (this.x > 0) ctx.fillStyle = '#0FC2C0'; // Teal
                else ctx.fillStyle = '#A855F7'; // Purple

                ctx.beginPath();
                ctx.arc(this.xProjected, this.yProjected, DOT_RADIUS * this.scaleProjected, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        let dots = [];

        function initGlobe() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            fieldOfView = width * 0.8;
            dots = [];

            for (let i = 0; i < DOTS_AMOUNT; i++) {
                const theta = Math.random() * 2 * Math.PI; // Random angle
                const phi = Math.acos((Math.random() * 2) - 1);

                const x = GLOBE_RADIUS * Math.sin(phi) * Math.cos(theta);
                const y = GLOBE_RADIUS * Math.sin(phi) * Math.sin(theta);
                const z = GLOBE_RADIUS * Math.cos(phi);

                dots.push(new Dot3D(x, y, z));
            }
        }

        let rotationSpeed = 0.001;

        window.addEventListener('mousemove', e => {
            // Accelerate rotation slightly on mouse move
            rotationSpeed = 0.005;
            clearTimeout(window.rotationTimer);
            window.rotationTimer = setTimeout(() => { rotationSpeed = 0.001; }, 500);

            // CSS Mouse tracking for cards
            document.querySelectorAll('.feature-card, .holo-card').forEach(card => {
                const rect = card.getBoundingClientRect();
                card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
                card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
            });
        });

        function animateGlobe() {
            ctx.clearRect(0, 0, width, height);

            dots.forEach(dot => {
                // Rotate Y
                const cosRot = Math.cos(rotationSpeed);
                const sinRot = Math.sin(rotationSpeed);
                const x1 = dot.x * cosRot - dot.z * sinRot;
                const z1 = dot.z * cosRot + dot.x * sinRot;
                dot.x = x1; dot.z = z1;

                // Rotate X (Slight constant tilt)
                const angleX = 0.0005;
                const cosX = Math.cos(angleX);
                const sinX = Math.sin(angleX);
                const y2 = dot.y * cosX - dot.z * sinX;
                const z2 = dot.z * cosX + dot.y * sinX;
                dot.y = y2; dot.z = z2;

                dot.draw();
            });

            requestAnimationFrame(animateGlobe);
        }

        window.addEventListener('resize', initGlobe);
        initGlobe();
        animateGlobe();
    }


    // --- Text Scramble Class ---
    class ScrambleText {
        constructor(el, finalHeader) {
            this.el = el;
            this.finalHeader = finalHeader || el.innerText;
            this.chars = '!<>-_\\/[]{}—=+*^?#________';
            this.queue = [];
            this.frame = 0;
            this.update = this.update.bind(this);
            this.resolve = this.resolve.bind(this);
            this.frameRequest = null;
        }

        setText(newText) {
            const oldText = this.el.innerText;
            const length = Math.max(oldText.length, newText.length);
            const promise = new Promise((resolve) => this.resolve = resolve);
            this.queue = [];
            for (let i = 0; i < length; i++) {
                const from = oldText[i] || '';
                const to = newText[i] || '';
                const start = Math.floor(Math.random() * 40);
                const end = start + Math.floor(Math.random() * 40);
                this.queue.push({ from, to, start, end });
            }
            if (this.frameRequest) cancelAnimationFrame(this.frameRequest);
            this.frame = 0;
            this.update();
            return promise;
        }

        update() {
            let output = '';
            let complete = 0;
            for (let i = 0, n = this.queue.length; i < n; i++) {
                let { from, to, start, end, char } = this.queue[i];
                if (this.frame >= end) {
                    complete++;
                    output += to;
                } else if (this.frame >= start) {
                    if (!char || Math.random() < 0.28) {
                        char = this.chars[Math.floor(Math.random() * this.chars.length)];
                        this.queue[i].char = char;
                    }
                    output += `<span class="scramble-text" style="color:var(--primary-color)">${char}</span>`;
                } else {
                    output += from;
                }
            }
            this.el.innerHTML = output;
            if (complete === this.queue.length) {
                // Done
            } else {
                this.frameRequest = requestAnimationFrame(this.update);
                this.frame++;
            }
        }

        start() {
            this.setText(this.finalHeader);
        }
    }

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

    // FAQ
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;

            // Close others
            document.querySelectorAll('.accordion-header').forEach(h => {
                if (h !== header && h.classList.contains('active')) {
                    h.classList.remove('active');
                    h.nextElementSibling.style.maxHeight = null;
                }
            });

            // Toggle current
            header.classList.toggle('active');
            if (header.classList.contains('active')) content.style.maxHeight = content.scrollHeight + "px";
            else content.style.maxHeight = null;
        });
    });

    // --- 3D Tilt for Cards (Vanilla JS) ---
    const tiltCards = document.querySelectorAll('[data-tilt], .feature-card, .holo-card');
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Calculate rotation (max 10deg)
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

    window.addEventListener('mousemove', function (e) {
        const posX = e.clientX;
        const posY = e.clientY;

        // Dot follows instantly
        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;

        // Outline follows with lag
        cursorOutline.animate({
            left: `${posX}px`,
            top: `${posY}px`
        }, { duration: 500, fill: "forwards" });
    });

    // Expand cursor on hoverable elements
    const hoverables = document.querySelectorAll('a, button, .feature-card, .holo-card, .accordion-header');
    hoverables.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorOutline.style.width = '60px'; // Expand
            cursorOutline.style.height = '60px';
            cursorOutline.style.backgroundColor = 'rgba(255,255,255,0.1)';
        });
        el.addEventListener('mouseleave', () => {
            cursorOutline.style.width = '40px'; // Shrink
            cursorOutline.style.height = '40px';
            cursorOutline.style.backgroundColor = 'transparent';
        });
    });

});
