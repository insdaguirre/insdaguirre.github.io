// Matrix-inspired cascading code rain effect
class MatrixBackground {
    constructor() {
        this.canvas = document.getElementById('tron-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.columns = [];
        this.fontSize = 16;
        this.animationId = null;
        
        // Matrix characters - mix of code symbols, numbers, and special chars
        this.characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*()_+-=[]{}|;:,.<>?/~`';
        this.characters += '01αβγδεζηθικλμνξοπρστυφχψω∀∂∃∅∇∈∉∋∏∑−∗√∝∞∠∧∨∩∪∫∴∼≅≈≠≡≤≥⊂⊃⊄⊆⊇⊕⊗⊥⋅';
        
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
    }
    
    initializeColumns() {
        this.columns = [];
        for (let i = 0; i < this.columnCount; i++) {
            this.columns.push({
                x: i * this.fontSize,
                characters: [],
                speed: 1 + Math.random() * 3,
                nextDrop: Math.random() * this.canvas.height
            });
        }
    }
    
    animate() {
        // Semi-transparent black background for trail effect
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw each column
        this.columns.forEach((column, columnIndex) => {
            // Add new character at top if needed
            if (column.characters.length === 0 || column.characters[column.characters.length - 1].y > column.nextDrop) {
                column.characters.push({
                    char: this.characters[Math.floor(Math.random() * this.characters.length)],
                    y: 0,
                    brightness: 1,
                    age: 0
                });
                column.nextDrop = this.fontSize + Math.random() * this.fontSize * 3;
            }
            
            // Update and draw characters
            for (let i = column.characters.length - 1; i >= 0; i--) {
                const char = column.characters[i];
                
                // Move character down
                char.y += column.speed;
                char.age++;
                
                // Calculate brightness (head is brightest, tail fades)
                const isHead = i === column.characters.length - 1;
                if (isHead) {
                    char.brightness = 1;
                } else {
                    char.brightness = Math.max(0, 1 - (char.age / 30));
                }
                
                // Occasionally change character (glitch effect)
                if (Math.random() < 0.01) {
                    char.char = this.characters[Math.floor(Math.random() * this.characters.length)];
                }
                
                // Draw character
                if (char.brightness > 0) {
                    // Color varies: head is white/cyan, body is cyan to dark blue
                    let color;
                    if (isHead) {
                        color = `rgba(255, 255, 255, ${char.brightness})`;
                        // Add glow to head
                        this.ctx.shadowBlur = 10;
                        this.ctx.shadowColor = '#00f0ff';
                    } else {
                        const r = Math.floor(0 * char.brightness);
                        const g = Math.floor(240 * char.brightness);
                        const b = Math.floor(255 * char.brightness);
                        color = `rgba(${r}, ${g}, ${b}, ${char.brightness})`;
                        this.ctx.shadowBlur = 5;
                        this.ctx.shadowColor = '#00f0ff';
                    }
                    
                    this.ctx.fillStyle = color;
                    this.ctx.font = `${this.fontSize}px monospace`;
                    this.ctx.fillText(char.char, column.x, char.y);
                    this.ctx.shadowBlur = 0;
                }
                
                // Remove if off screen or too faded
                if (char.y > this.canvas.height || char.brightness <= 0) {
                    column.characters.splice(i, 1);
                }
            }
        });
        
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
        window.matrixBackground = new MatrixBackground();
    });
} else {
    window.matrixBackground = new MatrixBackground();
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.matrixBackground) {
        window.matrixBackground.destroy();
    }
});
