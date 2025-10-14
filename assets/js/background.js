// Bloomberg Terminal Matrix Rain with Scroll-Reactive Effects
class BloombergMatrixBackground {
    constructor() {
        this.canvas = document.getElementById('tron-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.columns = [];
        this.fontSize = 14;
        this.animationId = null;
        this.scrollY = 0;
        this.scrollVelocity = 0;
        this.lastScrollY = 0;
        
        // Terminal & Finance character sets
        this.terminalChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        this.codeChars = '{}[]();,.<>?/\\|`~!@#$%^&*-_=+';
        this.financeChars = '$€£¥₿%↑↓←→↗↘↙↖★☆◆◇■□▲△▼▽';
        this.dataChars = 'αβγδεζηθικλμνξοπρστυφχψω∑∏∫∂∇∆';
        this.matrixChars = '01';
        
        // Combine all character sets
        this.characters = this.terminalChars + this.codeChars + this.financeChars + this.dataChars + this.matrixChars;
        
        this.init();
    }
    
    init() {
        this.resize();
        this.setupEventListeners();
        this.initializeColumns();
        this.animate();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.columnCount = Math.floor(this.canvas.width / this.fontSize);
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.resize();
            this.initializeColumns();
        });
        
        // Scroll tracking for reactive effects
        window.addEventListener('scroll', () => {
            this.scrollY = window.pageYOffset;
            this.scrollVelocity = this.scrollY - this.lastScrollY;
            this.lastScrollY = this.scrollY;
        });
    }
    
    initializeColumns() {
        this.columns = [];
        for (let i = 0; i < this.columnCount; i++) {
            this.columns.push({
                x: i * this.fontSize,
                characters: [],
                speed: 1 + Math.random() * 2,
                nextDrop: Math.random() * this.canvas.height,
                twitchOffset: 0,
                twitchVelocity: 0
            });
        }
    }
    
    animate() {
        // Semi-transparent black background for trail effect
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw each column
        this.columns.forEach((column, columnIndex) => {
            // Calculate scroll-reactive speed
            const scrollSpeedMultiplier = 1 + (Math.abs(this.scrollVelocity) * 0.1);
            const baseSpeed = column.speed * scrollSpeedMultiplier;
            
            // Add twitch effect based on scroll velocity
            if (Math.abs(this.scrollVelocity) > 5) {
                column.twitchVelocity += (Math.random() - 0.5) * 0.5;
                column.twitchOffset += column.twitchVelocity;
                column.twitchVelocity *= 0.9; // Damping
            } else {
                column.twitchOffset *= 0.95; // Return to center
            }
            
            // Add new character at top if needed
            if (column.characters.length === 0 || column.characters[column.characters.length - 1].y > column.nextDrop) {
                column.characters.push({
                    char: this.getRandomCharacter(),
                    y: 0,
                    brightness: 1,
                    age: 0,
                    isHead: true
                });
                column.nextDrop = this.fontSize + Math.random() * this.fontSize * 2;
            }
            
            // Update and draw characters
            for (let i = column.characters.length - 1; i >= 0; i--) {
                const char = column.characters[i];
                
                // Move character down with scroll-reactive speed
                char.y += baseSpeed;
                char.age++;
                
                // Calculate brightness (head is brightest, tail fades)
                const isHead = i === column.characters.length - 1;
                if (isHead) {
                    char.brightness = 1;
                    char.isHead = true;
                } else {
                    char.brightness = Math.max(0, 1 - (char.age / 25));
                    char.isHead = false;
                }
                
                // Occasionally change character (glitch effect)
                if (Math.random() < 0.02) {
                    char.char = this.getRandomCharacter();
                }
                
                // Draw character with twitch effect
                if (char.brightness > 0) {
                    const x = column.x + column.twitchOffset;
                    
                    // Color varies: head is white/terminal green, body fades to matrix green
                    let color;
                    if (isHead) {
                        color = `rgba(0, 255, 65, ${char.brightness})`;
                        // Add glow to head
                        this.ctx.shadowBlur = 15;
                        this.ctx.shadowColor = '#00ff41';
                    } else {
                        const r = Math.floor(0 * char.brightness);
                        const g = Math.floor(255 * char.brightness);
                        const b = Math.floor(0 * char.brightness);
                        color = `rgba(${r}, ${g}, ${b}, ${char.brightness * 0.7})`;
                        this.ctx.shadowBlur = 8;
                        this.ctx.shadowColor = '#00ff00';
                    }
                    
                    this.ctx.fillStyle = color;
                    this.ctx.font = `${this.fontSize}px 'IBM Plex Mono', monospace`;
                    this.ctx.fillText(char.char, x, char.y);
                    this.ctx.shadowBlur = 0;
                }
                
                // Remove if off screen or too faded
                if (char.y > this.canvas.height + 50 || char.brightness <= 0) {
                    column.characters.splice(i, 1);
                }
            }
        });
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    getRandomCharacter() {
        // Weighted character selection for more realistic terminal look
        const rand = Math.random();
        if (rand < 0.4) {
            return this.terminalChars[Math.floor(Math.random() * this.terminalChars.length)];
        } else if (rand < 0.6) {
            return this.codeChars[Math.floor(Math.random() * this.codeChars.length)];
        } else if (rand < 0.8) {
            return this.financeChars[Math.floor(Math.random() * this.financeChars.length)];
        } else if (rand < 0.95) {
            return this.dataChars[Math.floor(Math.random() * this.dataChars.length)];
        } else {
            return this.matrixChars[Math.floor(Math.random() * this.matrixChars.length)];
        }
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
        window.bloombergMatrixBackground = new BloombergMatrixBackground();
    });
} else {
    window.bloombergMatrixBackground = new BloombergMatrixBackground();
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.bloombergMatrixBackground) {
        window.bloombergMatrixBackground.destroy();
    }
});