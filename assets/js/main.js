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

// Add scroll effect to header
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (header) {
        if (window.scrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
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

// Function to get appropriate icon for repository based on language or name
function getProjectIcon(repo) {
    const name = repo.name.toLowerCase();
    const language = repo.language ? repo.language.toLowerCase() : '';
    
    // Language-based icons
    if (language.includes('python')) return 'fab fa-python';
    if (language.includes('javascript')) return 'fab fa-js';
    if (language.includes('typescript')) return 'fab fa-js';
    if (language.includes('java')) return 'fab fa-java';
    if (language.includes('html')) return 'fab fa-html5';
    if (language.includes('css')) return 'fab fa-css3-alt';
    if (language.includes('react')) return 'fab fa-react';
    if (language.includes('node')) return 'fab fa-node-js';
    
    // Name-based icons
    if (name.includes('ml') || name.includes('machine') || name.includes('ai')) return 'fas fa-brain';
    if (name.includes('stock') || name.includes('finance') || name.includes('trading')) return 'fas fa-chart-line';
    if (name.includes('web') || name.includes('app') || name.includes('site')) return 'fas fa-globe';
    if (name.includes('bot') || name.includes('automation')) return 'fas fa-robot';
    if (name.includes('data') || name.includes('analysis')) return 'fas fa-chart-bar';
    if (name.includes('mobile') || name.includes('app')) return 'fas fa-mobile-alt';
    if (name.includes('api') || name.includes('backend')) return 'fas fa-server';
    if (name.includes('game') || name.includes('gaming')) return 'fas fa-gamepad';
    if (name.includes('music') || name.includes('dj')) return 'fas fa-music';
    if (name.includes('social') || name.includes('media')) return 'fas fa-share-alt';
    if (name.includes('education') || name.includes('learn')) return 'fas fa-graduation-cap';
    if (name.includes('portfolio') || name.includes('profile')) return 'fas fa-user';
    
    // Default icon
    return 'fas fa-code';
}

// Function to get technology tags based on repository data
function getTechTags(repo) {
    const tags = [];
    const language = repo.language;
    const name = repo.name.toLowerCase();
    
    if (language) {
        tags.push(language);
    }
    
    // Add relevant tags based on repository characteristics
    if (repo.topics && repo.topics.length > 0) {
        tags.push(...repo.topics.slice(0, 3));
    }
    
    // Add tags based on name/content
    if (name.includes('ml') || name.includes('machine') || name.includes('ai')) {
        tags.push('Machine Learning');
    }
    if (name.includes('data') || name.includes('analysis')) {
        tags.push('Data Science');
    }
    if (name.includes('web') || name.includes('app')) {
        tags.push('Web Development');
    }
    if (name.includes('finance') || name.includes('stock')) {
        tags.push('Financial Analysis');
    }
    if (name.includes('automation') || name.includes('bot')) {
        tags.push('Automation');
    }
    
    // Remove duplicates and limit to 4 tags
    return [...new Set(tags)].slice(0, 4);
}

// Global flag to track if function was called
window.repoFunctionCalled = false;

// Function to fetch and display recent repositories
async function loadRecentRepositories() {
    window.repoFunctionCalled = true;
    console.log('loadRecentRepositories called');
    const projectsGrid = document.querySelector('.projects-grid');
    console.log('projectsGrid found:', projectsGrid);
    
    if (!projectsGrid) {
        console.error('Projects grid not found');
        return;
    }
    
    try {
        // Show loading state
        projectsGrid.innerHTML = '<div class="loading">Loading recent projects...</div>';
        console.log('Loading state set');
        
        // Fetch recent repositories from GitHub API
        console.log('Fetching repositories from GitHub API...');
        const response = await fetch('https://api.github.com/users/insdaguirre/repos?sort=updated&per_page=12');
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const repos = await response.json();
        console.log('Repositories fetched:', repos.length);
        
        if (!Array.isArray(repos)) {
            throw new Error('Failed to fetch repositories - not an array');
        }
        
        // Clear loading state and populate projects
        projectsGrid.innerHTML = '';
        console.log('Cleared loading state');
        
        let projectCount = 0;
        repos.forEach(repo => {
            if (!repo.fork) { // Only show non-forked repositories
                const projectCard = document.createElement('a');
                projectCard.href = repo.html_url;
                projectCard.className = 'project-card';
                projectCard.target = '_blank';
                
                const icon = getProjectIcon(repo);
                const techTags = getTechTags(repo);
                
                projectCard.innerHTML = `
                    <div class="project-header">
                        <div class="project-icon">
                            <span>📁</span>
                        </div>
                        <h3 class="project-title">${repo.name.replace(/_/g, ' ').replace(/-/g, ' ')}</h3>
                    </div>
                    <p class="project-description">${repo.description || 'A personal project showcasing my skills and interests.'}</p>
                    <div class="project-tech">
                        ${techTags.map(tag => `<span class="tech-tag">${tag}</span>`).join('')}
                    </div>
                `;
                
                projectsGrid.appendChild(projectCard);
                projectCount++;
            }
        });
        
        console.log('Added', projectCount, 'project cards');
        
        // Re-observe new project cards for animations
        document.querySelectorAll('.project-card').forEach(el => {
            observer.observe(el);
        });
        
        // Re-add hover effects to new project cards
        addProjectCardHoverEffects();
        
        console.log('Repository loading completed successfully');
        
    } catch (error) {
        console.error('Error loading repositories:', error);
        projectsGrid.innerHTML = `
            <div class="error-message">
                <p>Unable to load recent projects. Error: ${error.message}</p>
                <p>Please check my <a href="https://github.com/insdaguirre" target="_blank">GitHub profile</a> directly.</p>
            </div>
        `;
    }
}

// Function to add hover effects to project cards
function addProjectCardHoverEffects() {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Add typing effect to hero title
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Initialize typing effect when page loads
document.addEventListener('DOMContentLoaded', () => {
    const heroTitle = document.querySelector('.hero h1');
    if (heroTitle) {
        const originalText = heroTitle.textContent;
        typeWriter(heroTitle, originalText, 80);
    }
});

// Add parallax effect to hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero) {
        const rate = scrolled * -0.5;
        hero.style.transform = `translateY(${rate}px)`;
    }
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Add mobile menu functionality
document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelector('.nav-links');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    
    console.log('Mobile menu elements:', { navLinks, mobileMenuBtn });
    
    if (mobileMenuBtn && navLinks) {
        // Simple test - change button color on click
        mobileMenuBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Mobile menu clicked!');
            
            // Toggle menu
            navLinks.classList.toggle('active');
            
            // Change icon
            const icon = mobileMenuBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.className = 'fas fa-times';
                mobileMenuBtn.style.color = 'red'; // Test color change
            } else {
                icon.className = 'fas fa-bars';
                mobileMenuBtn.style.color = 'var(--text)'; // Reset color
            }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileMenuBtn.contains(e.target) && !navLinks.contains(e.target) && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                icon.className = 'fas fa-bars';
                mobileMenuBtn.style.color = 'var(--text)';
            }
        });
        
        // Close menu when clicking on a link
        navLinks.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                navLinks.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                icon.className = 'fas fa-bars';
                mobileMenuBtn.style.color = 'var(--text)';
            }
        });
    } else {
        console.log('Mobile menu elements not found:', { navLinks, mobileMenuBtn });
    }
});

// Load recent repositories when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired');
    
    // Observe existing elements for animations
    document.querySelectorAll('.project-card, .about-content, .contact-content').forEach(el => {
        observer.observe(el);
    });
    
    // Load recent repositories
    loadRecentRepositories();
});

// Fallback: Also try to load repositories when window loads
window.addEventListener('load', () => {
    console.log('Window load event fired');
    const projectsGrid = document.querySelector('.projects-grid');
    if (projectsGrid && projectsGrid.innerHTML.includes('Loading recent projects')) {
        console.log('Projects still loading, retrying...');
        loadRecentRepositories();
    }
});

// Additional fallback: Try after a short delay
setTimeout(() => {
    console.log('Timeout fallback triggered');
    const projectsGrid = document.querySelector('.projects-grid');
    if (projectsGrid && projectsGrid.innerHTML.includes('Loading recent projects')) {
        console.log('Projects still loading after timeout, retrying...');
        loadRecentRepositories();
    }
}, 2000); 