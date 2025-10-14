// Apple Stocks-inspired Mouse-Reactive Particle System
class MouseReactiveBackground {
    constructor() {
        this.canvas = document.getElementById('tron-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: 0, y: 0 };
        this.mouseVelocity = { x: 0, y: 0 };
        this.lastMouse = { x: 0, y: 0 };
        this.animationId = null;
        
        this.init();
    }
    
    init() {
        this.resizeCanvas();
        this.createParticles();
        this.bindEvents();
        this.animate();
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createParticles() {
        const particleCount = Math.floor((this.canvas.width * this.canvas.height) / 15000);
        this.particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1,
                opacity: Math.random() * 0.6 + 0.2,
                color: this.getRandomColor(),
                life: 1,
                maxLife: Math.random() * 300 + 200
            });
        }
    }
    
    getRandomColor() {
        const colors = [
            'rgba(0, 122, 255, 0.6)',    // Apple Blue
            'rgba(52, 199, 89, 0.6)',    // Apple Green
            'rgba(255, 149, 0, 0.6)',    // Apple Orange
            'rgba(255, 59, 48, 0.6)',    // Apple Red
            'rgba(175, 82, 222, 0.6)',   // Apple Purple
            'rgba(255, 45, 146, 0.6)',   // Apple Pink
            'rgba(255, 204, 0, 0.6)'     // Apple Yellow
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    bindEvents() {
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.createParticles();
        });
        
        window.addEventListener('mousemove', (e) => {
            this.lastMouse.x = this.mouse.x;
            this.lastMouse.y = this.mouse.y;
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
            
            // Calculate mouse velocity
            this.mouseVelocity.x = this.mouse.x - this.lastMouse.x;
            this.mouseVelocity.y = this.mouse.y - this.lastMouse.y;
        });
        
        window.addEventListener('mouseleave', () => {
            this.mouse.x = -1000;
            this.mouse.y = -1000;
            this.mouseVelocity.x = 0;
            this.mouseVelocity.y = 0;
        });
    }
    
    updateParticles() {
        this.particles.forEach((particle, index) => {
            // Calculate distance to mouse
            const dx = this.mouse.x - particle.x;
            const dy = this.mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Mouse interaction
            if (distance < 150) {
                const force = (150 - distance) / 150;
                const angle = Math.atan2(dy, dx);
                
                // Apply mouse velocity influence
                particle.vx += Math.cos(angle) * force * 0.02;
                particle.vy += Math.sin(angle) * force * 0.02;
                
                // Apply horizontal/vertical mouse movement
                particle.vx += this.mouseVelocity.x * 0.001;
                particle.vy += this.mouseVelocity.y * 0.001;
                
                // Increase opacity near mouse
                particle.opacity = Math.min(1, particle.opacity + force * 0.1);
            } else {
                // Fade back to normal opacity
                particle.opacity = Math.max(0.2, particle.opacity - 0.005);
            }
            
            // Apply velocity
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Apply friction
            particle.vx *= 0.98;
            particle.vy *= 0.98;
            
            // Boundary wrapping
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;
            
            // Life cycle
            particle.life -= 0.5;
            if (particle.life <= 0) {
                particle.x = Math.random() * this.canvas.width;
                particle.y = Math.random() * this.canvas.height;
                particle.life = particle.maxLife;
                particle.vx = (Math.random() - 0.5) * 0.5;
                particle.vy = (Math.random() - 0.5) * 0.5;
                particle.color = this.getRandomColor();
            }
        });
    }
    
    drawParticles() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.opacity * (particle.life / particle.maxLife);
            this.ctx.fillStyle = particle.color;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = particle.color;
            
            // Draw particle as circle
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw connection lines to nearby particles
            this.particles.forEach(otherParticle => {
                if (particle === otherParticle) return;
                
                const dx = particle.x - otherParticle.x;
                const dy = particle.y - otherParticle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    this.ctx.globalAlpha = (1 - distance / 100) * 0.1 * particle.opacity;
                    this.ctx.strokeStyle = particle.color;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.beginPath();
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(otherParticle.x, otherParticle.y);
                    this.ctx.stroke();
                }
            });
            
            this.ctx.restore();
        });
    }
    
    animate() {
        this.updateParticles();
        this.drawParticles();
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MouseReactiveBackground();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.mouseReactiveBackground) {
        window.mouseReactiveBackground.destroy();
    }
});