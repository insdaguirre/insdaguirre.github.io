// Global mouse tracking for effects
window.mousePosition = { x: 0, y: 0 };

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Track mouse position globally
document.addEventListener('mousemove', (e) => {
    window.mousePosition.x = e.clientX;
    window.mousePosition.y = e.clientY;
});

// Add scroll effect to header with Tron styling
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (header) {
        if (window.scrollY > 100) {
            header.style.background = 'rgba(10, 10, 10, 0.95)';
            header.style.boxShadow = '0 0 30px rgba(0, 240, 255, 0.2)';
        } else {
            header.style.background = 'rgba(10, 10, 10, 0.8)';
            header.style.boxShadow = '0 0 20px rgba(0, 240, 255, 0.1)';
        }
    }
});

// Add fade-in animation to elements when they come into view
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
        }
    });
}, observerOptions);

// Observe all project cards and sections
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.project-card, .about-content, .contact-content').forEach(el => {
        observer.observe(el);
    });
});

// Add typing effect to hero title with cursor
function typeWriter(element, text, speed = 80) {
    let i = 0;
    element.innerHTML = '';
    const cursor = '<span class="typing-cursor" style="color: var(--primary); animation: blink 1s infinite;">|</span>';
    
    function type() {
        if (i < text.length) {
            element.innerHTML = text.substring(0, i + 1) + cursor;
            i++;
            setTimeout(type, speed);
        } else {
            // Remove cursor after typing is complete
            setTimeout(() => {
                element.innerHTML = text;
            }, 1000);
        }
    }
    
    type();
}

// Add CSS for cursor blink
const style = document.createElement('style');
style.textContent = `
    @keyframes blink {
        0%, 49% { opacity: 1; }
        50%, 100% { opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize typing effect when page loads
document.addEventListener('DOMContentLoaded', () => {
    const heroTitle = document.querySelector('.hero h1');
    if (heroTitle) {
        const originalText = heroTitle.textContent;
        typeWriter(heroTitle, originalText, 80);
    }
});

// Add parallax effect to hero section with smoother motion
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero) {
        const rate = scrolled * -0.3;
        hero.style.transform = `translateY(${rate}px)`;
    }
    
    // Parallax effect on project cards
    const cards = document.querySelectorAll('.project-card');
    cards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        const scrollPercent = (window.innerHeight - rect.top) / window.innerHeight;
        if (scrollPercent > 0 && scrollPercent < 1) {
            const offset = (scrollPercent - 0.5) * 20;
            card.style.transform = `translateY(${offset}px)`;
        }
    });
});

// Add enhanced hover effects to project cards with 3D tilt
document.addEventListener('DOMContentLoaded', () => {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            card.style.transform = `translateY(-10px) scale(1.02) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1) perspective(1000px) rotateX(0) rotateY(0)';
        });
    });
});

// Make div-based project cards clickable to their repo while preserving inner links
document.addEventListener('DOMContentLoaded', () => {
    const cardsWithRepo = document.querySelectorAll('.project-card[data-repo]');
    cardsWithRepo.forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', (e) => {
            // If clicking an inner link or button, let it handle navigation
            const target = e.target;
            if (target.closest('a')) return;
            const repo = card.getAttribute('data-repo');
            if (repo) {
                window.open(repo, '_blank', 'noopener,noreferrer');
            }
        });

        // Keyboard accessibility
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const repo = card.getAttribute('data-repo');
                if (repo) window.open(repo, '_blank', 'noopener,noreferrer');
            }
        });
    });
});

// Add loading animation with scan line effect
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    
    // Create scan line effect on load
    const scanLine = document.createElement('div');
    scanLine.className = 'scan-line';
    document.body.appendChild(scanLine);
    
    // Remove after animation
    setTimeout(() => {
        scanLine.style.opacity = '0';
        setTimeout(() => scanLine.remove(), 1000);
    }, 3000);
});

// Add glitch effect to section titles on scroll
const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px'
};

const titleObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'none';
            setTimeout(() => {
                entry.target.style.animation = 'glitchText 0.3s ease';
            }, 10);
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.section-title').forEach(title => {
        titleObserver.observe(title);
    });
});

// Add mobile menu functionality with Tron styling
document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelector('.nav-links');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Toggle menu
            navLinks.classList.toggle('active');
            
            // Change icon
            const icon = mobileMenuBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.className = 'fas fa-times';
                mobileMenuBtn.style.boxShadow = '0 0 20px rgba(255, 0, 110, 0.8)';
                mobileMenuBtn.style.borderColor = 'var(--accent)';
                mobileMenuBtn.style.color = 'var(--accent)';
            } else {
                icon.className = 'fas fa-bars';
                mobileMenuBtn.style.boxShadow = 'var(--glow-cyan)';
                mobileMenuBtn.style.borderColor = 'var(--primary)';
                mobileMenuBtn.style.color = 'var(--primary)';
            }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileMenuBtn.contains(e.target) && !navLinks.contains(e.target) && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                icon.className = 'fas fa-bars';
                mobileMenuBtn.style.boxShadow = 'var(--glow-cyan)';
                mobileMenuBtn.style.borderColor = 'var(--primary)';
                mobileMenuBtn.style.color = 'var(--primary)';
            }
        });
        
        // Close menu when clicking on a link
        navLinks.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                navLinks.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                icon.className = 'fas fa-bars';
                mobileMenuBtn.style.boxShadow = 'var(--glow-cyan)';
                mobileMenuBtn.style.borderColor = 'var(--primary)';
                mobileMenuBtn.style.color = 'var(--primary)';
            }
        });
    }
}); 