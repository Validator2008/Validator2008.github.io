// Mobile Navigation Toggle + Theme Toggle
document.addEventListener('DOMContentLoaded', function() {
    // Constants
    const SCROLL_OFFSET = 150;
    
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Theme toggle elements
    const themeToggle = document.getElementById('themeToggle');
    const themeToggleIcon = document.getElementById('themeToggleIcon');
    const themeToggleLabel = document.getElementById('themeToggleLabel');
    const body = document.body;

    // ---- THEME LOGIC ----

    function applyTheme(theme) {
        const isDark = theme === 'dark';

        if (isDark) {
            body.classList.add('dark-theme');
            if (themeToggleIcon) themeToggleIcon.textContent = '☀️';
            if (themeToggleLabel) themeToggleLabel.textContent = 'Light';
        } else {
            body.classList.remove('dark-theme');
            if (themeToggleIcon) themeToggleIcon.textContent = '🌙';
            if (themeToggleLabel) themeToggleLabel.textContent = 'Dark';
        }
    }

    // Initialize theme from localStorage or system preference
    (function initTheme() {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme === 'light' || storedTheme === 'dark') {
            applyTheme(storedTheme);
        } else {
            const prefersDark = window.matchMedia &&
                window.matchMedia('(prefers-color-scheme: dark)').matches;
            applyTheme(prefersDark ? 'dark' : 'light');
        }
    })();

    // Toggle theme on click
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const isCurrentlyDark = body.classList.contains('dark-theme');
            const newTheme = isCurrentlyDark ? 'light' : 'dark';
            applyTheme(newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    // ---- NAV / SCROLL LOGIC (existing) ----

    // Toggle mobile menu
    navToggle.addEventListener('click', function() {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a nav link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInsideNav = navToggle.contains(event.target) || navMenu.contains(event.target);
        
        if (!isClickInsideNav && navMenu.classList.contains('active')) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });

    // Add active state to nav links based on scroll position
    const sections = document.querySelectorAll('.section, .hero');
    
    function setActiveNavLink() {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (window.pageYOffset >= sectionTop - SCROLL_OFFSET) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }

    // Throttle scroll event for better performance
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        if (scrollTimeout) {
            window.cancelAnimationFrame(scrollTimeout);
        }
        
        scrollTimeout = window.requestAnimationFrame(function() {
            setActiveNavLink();
        });
    });

    // Smooth scroll with offset for fixed navbar
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const navbarHeight = document.getElementById('navbar').offsetHeight;
                const targetPosition = targetSection.offsetTop - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add animation on scroll for sections
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all sections for animation
    const animatedElements = document.querySelectorAll('.section');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // ---- EXPERIENCE ACCORDION LOGIC ----
    const experienceItems = document.querySelectorAll('.experience-item[data-experience]');
    const experienceToggles = document.querySelectorAll('.experience-toggle');

    function collapseAllExperiences() {
        experienceItems.forEach(item => {
            item.classList.remove('expanded');
            const btn = item.querySelector('.experience-toggle');
            if (btn) btn.textContent = 'Read more...';
        });
    }

    experienceToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const item = this.closest('.experience-item');
            const isExpanded = item.classList.contains('expanded');

            // Only one expanded at a time
            collapseAllExperiences();

            if (!isExpanded) {
                item.classList.add('expanded');
                this.textContent = 'Show less';
            }
        });
    });
});
