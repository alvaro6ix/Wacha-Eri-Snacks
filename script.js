// ===== Selectors globales (declarados una sola vez al inicio) =====
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const navbar = document.querySelector('.navbar');
const sections = document.querySelectorAll('section[id]');
const navLinksAll = document.querySelectorAll('.nav-links a');

// ===== Mobile Menu Toggle =====
if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('active');
        menuToggle.classList.toggle('active');
        menuToggle.setAttribute('aria-expanded', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close mobile menu on link click
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            menuToggle.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        });
    });
}

// ===== Smooth Scrolling & Positions (Optimizado para evitar Reflow) =====
let cachedNavHeight = navbar ? navbar.offsetHeight : 70;
let cachedSections = [];

function cacheSectionPositions() {
    if (navbar) cachedNavHeight = navbar.offsetHeight;
    cachedSections = Array.from(sections).map(section => ({
        id: section.getAttribute('id'),
        top: section.offsetTop,
        bottom: section.offsetTop + section.offsetHeight
    }));
}

// Ejecutar cálculos solo cuando la página cargó totalmente
window.addEventListener('load', () => {
    cacheSectionPositions();
    updateActiveNav();
});

window.addEventListener('resize', cacheSectionPositions, { passive: true });

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const target = document.querySelector(targetId);
        if (target) {
            const targetPosition = target.getBoundingClientRect().top + window.scrollY - cachedNavHeight - 16;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ===== Navbar Scroll Effect =====
window.addEventListener('scroll', () => {
    if (!navbar) return;
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}, { passive: true });

// ===== Active Nav Link on Scroll =====
function updateActiveNav() {
    const scrollPos = window.scrollY + 120;
    cachedSections.forEach(({ id, top, bottom }) => {
        if (scrollPos >= top && scrollPos < bottom) {
            navLinksAll.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + id) {
                    link.classList.add('active');
                }
            });
        }
    });
}

window.addEventListener('scroll', updateActiveNav, { passive: true });

// ===== Menu Category Switching =====
const categoryBtns = document.querySelectorAll('.category-btn');
const categorySections = document.querySelectorAll('.category-section');

categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const category = btn.dataset.category;
        categoryBtns.forEach(b => b.classList.remove('active'));
        categorySections.forEach(s => s.classList.remove('active'));

        btn.classList.add('active');
        const targetSection = document.getElementById(category);
        if (targetSection) {
            targetSection.classList.add('active');
            targetSection.querySelectorAll('.scroll-reveal').forEach(el => {
                el.classList.remove('revealed');
                observer.observe(el);
            });
        }
    });
});

// ===== Footer Category Links =====
document.querySelectorAll('a[data-category]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const category = link.dataset.category;
        const targetBtn = document.querySelector(`[data-category="${category}"].category-btn`);
        if (targetBtn) targetBtn.click();
        document.getElementById('menu').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

// ===== Scroll Reveal Animation =====
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));

// ===== Subtle Cursor Glow (Desktop Only) =====
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const glow = document.createElement('div');
    glow.style.cssText = "position:fixed;width:300px;height:300px;background:radial-gradient(circle,rgba(255,107,53,0.04) 0%,transparent 70%);border-radius:50%;pointer-events:none;z-index:0;transform:translate(-50%,-50%);transition:opacity 0.3s ease;opacity:0;";
    document.body.appendChild(glow);

    let glowVisible = false;
    document.addEventListener('mousemove', (e) => {
        if (!glowVisible) { glow.style.opacity = '1'; glowVisible = true; }
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
        glow.style.opacity = '0';
        glowVisible = false;
    });
}