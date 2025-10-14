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

// Add scroll effect to header with Apple styling
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (header) {
        if (window.scrollY > 100) {
            header.style.background = 'rgba(28, 28, 30, 0.95)';
            header.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)';
        } else {
            header.style.background = 'rgba(28, 28, 30, 0.8)';
            header.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)';
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

// Matrix Bloomberg Apple Fusion Animation Systems

// Glitch Effect System
class GlitchEffect {
    constructor(element, options = {}) {
        this.element = element;
        this.interval = options.interval || 3000;
        this.duration = options.duration || 200;
        this.intensity = options.intensity || 1;
        this.isActive = false;
        
        this.init();
    }
    
    init() {
        this.element.style.transition = 'all 0.1s ease';
        this.startGlitch();
    }
    
    startGlitch() {
        if (this.isActive) return;
        this.isActive = true;
        
        const glitch = () => {
            if (!this.isActive) return;
            
            // Apply glitch effect
            this.element.style.transform = `translate(${(Math.random() - 0.5) * 4 * this.intensity}px, ${(Math.random() - 0.5) * 4 * this.intensity}px)`;
            this.element.style.textShadow = `${2 * this.intensity}px 0 var(--bloomberg-orange), ${-2 * this.intensity}px 0 var(--terminal-green)`;
            this.element.style.filter = `hue-rotate(${Math.random() * 360}deg)`;
            
            setTimeout(() => {
                if (!this.isActive) return;
                this.element.style.transform = 'translate(0)';
                this.element.style.textShadow = 'none';
                this.element.style.filter = 'none';
            }, this.duration);
            
            setTimeout(glitch, this.interval + Math.random() * 2000);
        };
        
        glitch();
    }
    
    stop() {
        this.isActive = false;
        this.element.style.transform = 'translate(0)';
        this.element.style.textShadow = 'none';
        this.element.style.filter = 'none';
    }
}

// Parallax Scroll System
class ParallaxScroll {
    constructor() {
        this.layers = [];
        this.init();
    }
    
    init() {
        // Create parallax layers
        this.layers = [
            { element: document.querySelector('#tron-canvas'), speed: 0.2 },
            { element: document.querySelector('.hero'), speed: 0.5 },
            { element: document.querySelector('.section'), speed: 1.0 }
        ];
        
        window.addEventListener('scroll', () => this.update());
    }
    
    update() {
        const scrolled = window.pageYOffset;
        
        this.layers.forEach(layer => {
            if (layer.element) {
                const yPos = -(scrolled * layer.speed);
                layer.element.style.transform = `translateY(${yPos}px)`;
            }
        });
    }
}

// 3D Tilt Effect for Cards
class Tilt3D {
    constructor(element) {
        this.element = element;
        this.init();
    }
    
    init() {
        this.element.addEventListener('mousemove', (e) => {
            const rect = this.element.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            this.element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
        });
        
        this.element.addEventListener('mouseleave', () => {
            this.element.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
        });
    }
}

// Number Counter Animation
class NumberCounter {
    constructor(element, target, duration = 2000) {
        this.element = element;
        this.target = target;
        this.duration = duration;
        this.start = 0;
        this.startTime = null;
        
        this.animate();
    }
    
    animate(currentTime) {
        if (!this.startTime) this.startTime = currentTime;
        
        const progress = Math.min((currentTime - this.startTime) / this.duration, 1);
        const current = Math.floor(this.start + (this.target - this.start) * this.easeOutCubic(progress));
        
        this.element.textContent = current.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame((time) => this.animate(time));
        }
    }
    
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
}

// Dynamic Stock Ticker
class DynamicTicker {
    constructor() {
        this.ticker = document.getElementById('ticker-content');
        this.stocks = [
            { symbol: 'AAPL', price: 182.52, change: 0.15 },
            { symbol: 'TSLA', price: 248.42, change: -0.08 },
            { symbol: 'BTC', price: 43250.00, change: 1250.00 },
            { symbol: 'ETH', price: 2650.00, change: 45.00 },
            { symbol: 'NVDA', price: 875.28, change: 12.50 },
            { symbol: 'MSFT', price: 378.85, change: -2.15 },
            { symbol: 'GOOGL', price: 142.30, change: 0.85 },
            { symbol: 'AMZN', price: 155.20, change: -1.20 }
        ];
        
        this.init();
    }
    
    init() {
        this.updateTicker();
        setInterval(() => this.updatePrices(), 5000);
    }
    
    updatePrices() {
        this.stocks.forEach(stock => {
            const change = (Math.random() - 0.5) * 10;
            stock.price += change;
            stock.change = change;
        });
        this.updateTicker();
    }
    
    updateTicker() {
        const tickerHTML = this.stocks.map(stock => {
            const changeClass = stock.change >= 0 ? 'price-up' : 'price-down';
            const changeSymbol = stock.change >= 0 ? '↑' : '↓';
            return `<span class="ticker-item">${stock.symbol}: $${stock.price.toFixed(2)} <span class="${changeClass}">${changeSymbol}</span></span>`;
        }).join('');
        
        this.ticker.innerHTML = tickerHTML;
    }
}

// Add typing effect to hero title with Apple-style cursor
function typeWriter(element, text, speed = 80) {
    let i = 0;
    element.innerHTML = '';
    const cursor = '<span class="typing-cursor" style="color: var(--apple-blue); animation: blink 1s infinite;">|</span>';
    
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

// Initialize Matrix Bloomberg Apple Fusion systems
document.addEventListener('DOMContentLoaded', () => {
    // Initialize typing effect
    const heroTitle = document.querySelector('.hero h1');
    if (heroTitle) {
        const originalText = heroTitle.textContent;
        typeWriter(heroTitle, originalText, 80);
        
        // Add glitch effect to hero title
        setTimeout(() => {
            new GlitchEffect(heroTitle, { interval: 4000, duration: 300, intensity: 1.5 });
        }, 2000);
    }
    
    // Initialize parallax scroll
    new ParallaxScroll();
    
    // Initialize dynamic ticker
    new DynamicTicker();
    
    // Add 3D tilt to project cards
    document.querySelectorAll('.project-card').forEach(card => {
        new Tilt3D(card);
    });
    
    // Add glitch effects to section titles
    document.querySelectorAll('.section-title').forEach(title => {
        new GlitchEffect(title, { interval: 6000, duration: 200, intensity: 0.8 });
    });
    
    // Add number counters to any elements with data-counter attribute
    document.querySelectorAll('[data-counter]').forEach(element => {
        const target = parseInt(element.getAttribute('data-counter'));
        new NumberCounter(element, target);
    });
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

// Add mobile menu functionality with terminal styling
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
                    mobileMenuBtn.style.boxShadow = '0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)';
                    mobileMenuBtn.style.borderColor = 'var(--apple-blue)';
                    mobileMenuBtn.style.color = 'var(--apple-blue)';
                } else {
                    icon.className = 'fas fa-bars';
                    mobileMenuBtn.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)';
                    mobileMenuBtn.style.borderColor = 'var(--border)';
                    mobileMenuBtn.style.color = 'var(--text-secondary)';
                }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileMenuBtn.contains(e.target) && !navLinks.contains(e.target) && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                icon.className = 'fas fa-bars';
                mobileMenuBtn.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)';
                mobileMenuBtn.style.borderColor = 'var(--border)';
                mobileMenuBtn.style.color = 'var(--text-secondary)';
            }
        });
        
        // Close menu when clicking on a link
        navLinks.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                navLinks.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                icon.className = 'fas fa-bars';
                mobileMenuBtn.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)';
                mobileMenuBtn.style.borderColor = 'var(--border)';
                mobileMenuBtn.style.color = 'var(--text-secondary)';
            }
        });
    }
}); 