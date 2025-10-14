// Tron-inspired animated background with grid, light trails, and particles
class TronBackground {
    constructor() {
        this.canvas = document.getElementById('tron-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.mouse = { x: 0, y: 0, smoothX: 0, smoothY: 0 };
        this.scrollY = 0;
        this.lightTrails = [];
        this.particles = [];
        this.gridLines = [];
        this.animationId = null;
        
        this.init();
    }
    
    init() {
        this.resize();
        this.setupEventListeners();
        this.createGridLines();
        this.createLightTrails();
        this.createParticles();
        this.animate();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.resize();
            this.createGridLines();
        });
        
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        
        window.addEventListener('scroll', () => {
            this.scrollY = window.pageYOffset;
        });
    }
    
    createGridLines() {
        this.gridLines = [];
        const gridSize = 80;
        const rows = Math.ceil(this.canvas.height / gridSize) + 10;
        const cols = Math.ceil(this.canvas.width / gridSize) + 10;
        
        // Horizontal lines
        for (let i = -5; i < rows; i++) {
            this.gridLines.push({
                type: 'horizontal',
                y: i * gridSize,
                opacity: 0.15
            });
        }
        
        // Vertical lines
        for (let i = -5; i < cols; i++) {
            this.gridLines.push({
                type: 'vertical',
                x: i * gridSize,
                opacity: 0.15
            });
        }
    }
    
    createLightTrails() {
        const trailCount = 8;
        for (let i = 0; i < trailCount; i++) {
            this.lightTrails.push(this.createLightTrail());
        }
    }
    
    createLightTrail() {
        const isHorizontal = Math.random() > 0.5;
        return {
            isHorizontal,
            position: Math.random() * (isHorizontal ? this.canvas.height : this.canvas.width),
            progress: Math.random() * 100,
            speed: 0.5 + Math.random() * 1.5,
            length: 100 + Math.random() * 200,
            color: Math.random() > 0.7 ? '#ff006e' : '#00f0ff',
            opacity: 0.6 + Math.random() * 0.4
        };
    }
    
    createParticles() {
        const particleCount = 50;
        for (let i = 0; i < particleCount; i++) {
            this.particles.push(this.createParticle());
        }
    }
    
    createParticle() {
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: 1 + Math.random() * 2,
            opacity: 0.3 + Math.random() * 0.5,
            color: Math.random() > 0.5 ? '#00f0ff' : '#0080ff',
            pulseSpeed: 0.02 + Math.random() * 0.03,
            pulsePhase: Math.random() * Math.PI * 2
        };
    }
    
    drawGrid() {
        // Smooth mouse interpolation
        this.mouse.smoothX += (this.mouse.x - this.mouse.smoothX) * 0.1;
        this.mouse.smoothY += (this.mouse.y - this.mouse.smoothY) * 0.1;
        
        const parallaxOffset = this.scrollY * 0.3;
        
        this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
        this.ctx.lineWidth = 1;
        
        this.gridLines.forEach(line => {
            this.ctx.beginPath();
            
            if (line.type === 'horizontal') {
                const y = line.y - parallaxOffset % 80;
                
                // Calculate distance from mouse for distortion
                const distFromMouse = Math.abs(this.mouse.smoothY - y);
                const distortion = Math.max(0, 50 - distFromMouse) / 50;
                const offset = distortion * 20;
                
                this.ctx.moveTo(0, y + offset);
                this.ctx.lineTo(this.canvas.width, y + offset);
            } else {
                const x = line.x;
                
                const distFromMouse = Math.abs(this.mouse.smoothX - x);
                const distortion = Math.max(0, 50 - distFromMouse) / 50;
                const offset = distortion * 20;
                
                this.ctx.moveTo(x + offset, 0);
                this.ctx.lineTo(x + offset, this.canvas.height);
            }
            
            this.ctx.globalAlpha = line.opacity;
            this.ctx.stroke();
            this.ctx.globalAlpha = 1;
        });
    }
    
    drawLightTrails() {
        this.lightTrails.forEach((trail, index) => {
            trail.progress += trail.speed;
            
            if (trail.progress > (trail.isHorizontal ? this.canvas.width : this.canvas.height) + trail.length) {
                this.lightTrails[index] = this.createLightTrail();
                return;
            }
            
            const gradient = trail.isHorizontal
                ? this.ctx.createLinearGradient(trail.progress - trail.length, 0, trail.progress, 0)
                : this.ctx.createLinearGradient(0, trail.progress - trail.length, 0, trail.progress);
            
            gradient.addColorStop(0, 'transparent');
            gradient.addColorStop(0.5, trail.color);
            gradient.addColorStop(1, 'transparent');
            
            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = 2;
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = trail.color;
            
            this.ctx.beginPath();
            if (trail.isHorizontal) {
                this.ctx.moveTo(trail.progress - trail.length, trail.position);
                this.ctx.lineTo(trail.progress, trail.position);
            } else {
                this.ctx.moveTo(trail.position, trail.progress - trail.length);
                this.ctx.lineTo(trail.position, trail.progress);
            }
            this.ctx.globalAlpha = trail.opacity;
            this.ctx.stroke();
            this.ctx.globalAlpha = 1;
            
            this.ctx.shadowBlur = 0;
        });
    }
    
    drawParticles() {
        this.particles.forEach((particle, index) => {
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Bounce off edges
            if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;
            
            // Mouse interaction
            const dx = this.mouse.smoothX - particle.x;
            const dy = this.mouse.smoothY - particle.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 150) {
                const force = (150 - dist) / 150;
                particle.x -= (dx / dist) * force * 2;
                particle.y -= (dy / dist) * force * 2;
            }
            
            // Pulse effect
            particle.pulsePhase += particle.pulseSpeed;
            const pulse = Math.sin(particle.pulsePhase) * 0.5 + 0.5;
            const currentOpacity = particle.opacity * (0.5 + pulse * 0.5);
            
            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color;
            this.ctx.globalAlpha = currentOpacity;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = particle.color;
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
            this.ctx.globalAlpha = 1;
        });
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawGrid();
        this.drawLightTrails();
        this.drawParticles();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.tronBackground = new TronBackground();
    });
} else {
    window.tronBackground = new TronBackground();
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.tronBackground) {
        window.tronBackground.destroy();
    }
});

