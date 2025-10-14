// Matrix Bloomberg Apple Fusion - Memory Efficient Background
class MatrixBackground {
    constructor() {
        this.canvas = document.getElementById('tron-canvas');
        this.ctx = this.canvas.getContext('2d', { alpha: false }); // Performance boost
        
        // Memory-efficient data structures
        this.columnCount = 0;
        this.columnPositions = null; // Float32Array
        this.columnSpeeds = null; // Float32Array  
        this.columnOffsets = null; // Float32Array (cursor displacement)
        this.characters = '01アイウエオカキクケコサシスセソタチツテトABCDEFGHIJKLMNOPQRSTUVWXYZ{}[]()<>';
        
        // Mouse tracking
        this.mouse = { x: -1000, y: -1000 };
        this.targetMouse = { x: -1000, y: -1000 };
        
        // Particle pool for floating code fragments
        this.particlePool = new Array(50);
        this.activeParticles = [];
        this.particleIndex = 0;
        
        // Performance tracking
        this.lastTime = 0;
        this.frameCount = 0;
        this.fps = 60;
        
        this.init();
    }
    
    init() {
        this.resize();
        this.bindEvents();
        this.initParticlePool();
        this.animate();
    }
    
    resize() {
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = window.innerWidth * dpr;
        this.canvas.height = window.innerHeight * dpr;
        this.ctx.scale(dpr, dpr);
        
        // Calculate columns (every 25px for optimal performance)
        this.columnCount = Math.ceil(window.innerWidth / 25);
        
        // Allocate typed arrays for memory efficiency
        this.columnPositions = new Float32Array(this.columnCount);
        this.columnSpeeds = new Float32Array(this.columnCount);
        this.columnOffsets = new Float32Array(this.columnCount);
        
        // Initialize random positions and speeds
        for (let i = 0; i < this.columnCount; i++) {
            this.columnPositions[i] = Math.random() * window.innerHeight;
            this.columnSpeeds[i] = 1 + Math.random() * 3;
            this.columnOffsets[i] = 0;
        }
    }
    
    initParticlePool() {
        // Initialize particle pool for floating code fragments
        for (let i = 0; i < 50; i++) {
            this.particlePool[i] = {
                x: 0,
                y: 0,
                vx: 0,
                vy: 0,
                size: 0,
                opacity: 0,
                char: '',
                life: 0,
                maxLife: 0,
                active: false
            };
        }
    }
    
    spawnParticle() {
        const particle = this.particlePool[this.particleIndex];
        if (particle.active) return;
        
        particle.x = Math.random() * window.innerWidth;
        particle.y = window.innerHeight + 20;
        particle.vx = (Math.random() - 0.5) * 0.5;
        particle.vy = -Math.random() * 2 - 0.5;
        particle.size = 12 + Math.random() * 8;
        particle.opacity = 0.3 + Math.random() * 0.4;
        particle.char = this.characters[Math.floor(Math.random() * this.characters.length)];
        particle.life = 0;
        particle.maxLife = 200 + Math.random() * 300;
        particle.active = true;
        
        this.activeParticles.push(particle);
        this.particleIndex = (this.particleIndex + 1) % 50;
    }
    
    updateParticles() {
        // Update existing particles
        for (let i = this.activeParticles.length - 1; i >= 0; i--) {
            const particle = this.activeParticles[i];
            
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life++;
            
            // Cursor attraction
            const dx = this.mouse.x - particle.x;
            const dy = this.mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
                const force = (100 - distance) / 100;
                particle.vx += (dx / distance) * force * 0.02;
                particle.vy += (dy / distance) * force * 0.02;
            }
            
            // Remove dead particles
            if (particle.life >= particle.maxLife || particle.y < -20) {
                particle.active = false;
                this.activeParticles.splice(i, 1);
            }
        }
        
        // Spawn new particles occasionally
        if (Math.random() < 0.1) {
            this.spawnParticle();
        }
    }
    
    updateColumns() {
        // Smooth mouse interpolation
        this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.1;
        this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.1;
        
        const CURSOR_RADIUS = 150;
        const MAX_DISPLACEMENT = 40;
        
        for (let i = 0; i < this.columnCount; i++) {
            const x = i * 25;
            
            // Update position
            this.columnPositions[i] += this.columnSpeeds[i];
            if (this.columnPositions[i] > window.innerHeight) {
                this.columnPositions[i] = -20;
            }
            
            // Cursor avoidance (parting effect)
            const dx = x - this.mouse.x;
            const dy = this.columnPositions[i] - this.mouse.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < CURSOR_RADIUS) {
                const force = 1 - (distance / CURSOR_RADIUS);
                const targetOffset = (dx > 0 ? 1 : -1) * force * MAX_DISPLACEMENT;
                this.columnOffsets[i] += (targetOffset - this.columnOffsets[i]) * 0.15;
            } else {
                this.columnOffsets[i] *= 0.9; // Return to center
            }
        }
    }
    
    draw() {
        // Clear with fade trail effect for Matrix look
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        this.ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
        
        this.ctx.font = '16px JetBrains Mono';
        
        // Draw Matrix columns
        for (let i = 0; i < this.columnCount; i++) {
            const x = i * 25 + this.columnOffsets[i];
            const y = this.columnPositions[i];
            
            // Draw trail (dimmer characters)
            for (let j = 0; j < 10; j++) {
                const trailY = y - j * 20;
                if (trailY < 0) break;
                
                const opacity = 1 - (j / 10);
                this.ctx.fillStyle = `rgba(0, 255, 65, ${opacity * 0.5})`;
                
                const char = this.characters[Math.floor(Math.random() * this.characters.length)];
                this.ctx.fillText(char, x, trailY);
            }
            
            // Draw bright head character with glow
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = '#00FF41';
            this.ctx.fillStyle = '#FFFFFF';
            const headChar = this.characters[Math.floor(Math.random() * this.characters.length)];
            this.ctx.fillText(headChar, x, y);
            this.ctx.shadowBlur = 0;
        }
        
        // Draw floating particles
        this.drawParticles();
    }
    
    drawParticles() {
        this.ctx.font = '14px JetBrains Mono';
        
        this.activeParticles.forEach(particle => {
            const alpha = particle.opacity * (1 - particle.life / particle.maxLife);
            this.ctx.fillStyle = `rgba(0, 255, 65, ${alpha})`;
            this.ctx.shadowBlur = 5;
            this.ctx.shadowColor = '#00FF41';
            this.ctx.fillText(particle.char, particle.x, particle.y);
            this.ctx.shadowBlur = 0;
        });
    }
    
    animate(currentTime) {
        // Performance optimization - limit to 60fps
        if (currentTime - this.lastTime >= 1000 / 60) {
            this.updateColumns();
            this.updateParticles();
            this.draw();
            
            this.lastTime = currentTime;
            this.frameCount++;
            
            // Log FPS every 60 frames
            if (this.frameCount % 60 === 0) {
                console.log(`Matrix FPS: ${Math.round(1000 / (currentTime - this.lastTime))}`);
            }
        }
        
        this.animationId = requestAnimationFrame((time) => this.animate(time));
    }
    
    bindEvents() {
        window.addEventListener('resize', () => {
            this.resize();
            this.initParticlePool();
        });
        
        window.addEventListener('mousemove', (e) => {
            this.targetMouse.x = e.clientX;
            this.targetMouse.y = e.clientY;
        });
        
        window.addEventListener('mouseleave', () => {
            this.targetMouse.x = -1000;
            this.targetMouse.y = -1000;
        });
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.matrixBackground = new MatrixBackground();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.matrixBackground) {
        window.matrixBackground.destroy();
    }
});