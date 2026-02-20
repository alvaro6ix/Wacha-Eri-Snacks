// ===== Selectors globales =====
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

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            menuToggle.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        });
    });
}

// ===== Smooth Scrolling & Positions (PROTECCIÓN TOTAL CONTRA REFLOW) =====
let cachedNavHeight = 70;
let cachedSections = [];

function cacheSectionPositions() {
    // Usamos un solo frame para leer todo el DOM de golpe y evitar lecturas intercaladas
    requestAnimationFrame(() => {
        if (navbar) cachedNavHeight = navbar.offsetHeight;
        
        // Mapeo optimizado: leemos offsetTop una sola vez por sección
        const newPositions = [];
        sections.forEach(section => {
            const top = section.offsetTop;
            newPositions.push({
                id: section.getAttribute('id'),
                top: top,
                bottom: top + section.offsetHeight
            });
        });
        cachedSections = newPositions;
    });
}

// Inicialización diferida (El secreto para el 100/100 en Performance)
window.addEventListener('load', () => {
    // Damos un respiro de 200ms para que el navegador termine de "acomodar" el layout
    setTimeout(() => {
        cacheSectionPositions();
        updateActiveNav();
    }, 200);
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

// ===== Navbar Scroll Effect (Optimizado con Passive Listener) =====
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
    if (cachedSections.length === 0) return;
    const scrollPos = window.scrollY + 120;
    
    for (const section of cachedSections) {
        if (scrollPos >= section.top && scrollPos < section.bottom) {
            navLinksAll.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === '#' + section.id);
            });
            break; // Encontramos la sección activa, no necesitamos seguir el loop
        }
    }
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
            // Diferimos la lectura de posiciones al siguiente frame para evitar forced reflow
            // (leer offsetTop/offsetHeight justo después de classList.add causa reflow)
            requestAnimationFrame(() => {
                requestAnimationFrame(cacheSectionPositions);
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

// ===== Scroll Reveal Animation (Intersection Observer es lo más eficiente) =====
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
    glow.id = 'cursor-glow';
    glow.style.cssText = "position:fixed;width:300px;height:300px;background:radial-gradient(circle,rgba(255,107,53,0.04) 0%,transparent 70%);border-radius:50%;pointer-events:none;z-index:0;transform:translate(-50%,-50%);transition:opacity 0.3s ease;opacity:0;";
    document.body.appendChild(glow);

    document.addEventListener('mousemove', (e) => {
        glow.style.opacity = '1';
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
    }, { passive: true });

    document.addEventListener('mouseleave', () => glow.style.opacity = '0');
}