// Particle Burst Animation using Canvas API
export class ParticleBurst {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.animId = null;
    }

    burst(x, y, count = 30, colors = ['#7C3AED', '#06B6D4', '#EC4899', '#F59E0B', '#10B981']) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = 2 + Math.random() * 5;
            const size = 3 + Math.random() * 5;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: 1,
                decay: 0.02 + Math.random() * 0.02,
                gravity: 0.1,
            });
        }
        if (!this.animId) this.animate();
    }

    animate() {
        const { ctx, canvas } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        this.particles = this.particles.filter(p => p.alpha > 0.01);

        for (const p of this.particles) {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.vx *= 0.98;
            p.alpha -= p.decay;

            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.restore();
        }

        if (this.particles.length > 0) {
            this.animId = requestAnimationFrame(() => this.animate());
        } else {
            this.animId = null;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    resize(w, h) {
        this.canvas.width = w;
        this.canvas.height = h;
    }

    destroy() {
        if (this.animId) cancelAnimationFrame(this.animId);
        this.particles = [];
    }
}

// Magnetic hover effect
export function createMagneticEffect(element, strength = 0.4) {
    if (!element) return () => { };

    const handleMove = (e) => {
        const rect = element.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 100;

        if (dist < maxDist) {
            const force = (1 - dist / maxDist) * strength;
            element.style.transform = `translate(${dx * force}px, ${dy * force}px)`;
        } else {
            element.style.transform = 'translate(0,0)';
        }
    };

    const handleLeave = () => {
        element.style.transform = 'translate(0,0)';
        element.style.transition = 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)';
    };

    const handleEnter = () => {
        element.style.transition = 'transform 0.1s linear';
    };

    window.addEventListener('mousemove', handleMove);
    element.addEventListener('mouseleave', handleLeave);
    element.addEventListener('mouseenter', handleEnter);

    return () => {
        window.removeEventListener('mousemove', handleMove);
        element.removeEventListener('mouseleave', handleLeave);
        element.removeEventListener('mouseenter', handleEnter);
    };
}

// Card tilt effect
export function createTiltEffect(element, maxTilt = 10) {
    if (!element) return () => { };

    const handleMove = (e) => {
        const rect = element.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const tiltX = (y - 0.5) * maxTilt;
        const tiltY = (0.5 - x) * maxTilt;
        element.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02,1.02,1.02)`;
    };

    const handleLeave = () => {
        element.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale3d(1,1,1)';
    };

    element.addEventListener('mousemove', handleMove);
    element.addEventListener('mouseleave', handleLeave);

    return () => {
        element.removeEventListener('mousemove', handleMove);
        element.removeEventListener('mouseleave', handleLeave);
    };
}

// Shake animation for validation
export function shakeElement(element) {
    if (!element) return;
    element.style.animation = 'none';
    element.offsetHeight; // reflow
    element.style.animation = 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both';
}

// Debounce utility
export function debounce(fn, delay) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}
