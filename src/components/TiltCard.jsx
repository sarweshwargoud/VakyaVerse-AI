import { useRef, forwardRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

/**
 * TiltCard — silky 3D spring tilt on hover using Framer Motion.
 * Uses forwardRef so parent components (e.g. ImageTranslator) can attach a ref.
 * Accepts all standard div event props via spread.
 *
 * Cards have an opaque dark background so the Three.js particle field
 * stays clearly BEHIND them, not showing through.
 */
const TiltCard = forwardRef(function TiltCard({
    children,
    style = {},
    className = '',
    maxTilt = 10,
    glowColor = 'rgba(124, 58, 237, 0.3)',
    scale = 1.02,
    disabled = false,
    // Pass-through HTML props
    onClick,
    onDragOver,
    onDragLeave,
    onDrop,
    onKeyDown,
    onMouseEnter: outerMouseEnter,
    onMouseLeave: outerMouseLeave,
    role,
    tabIndex,
    id,
    'aria-label': ariaLabel,
}, ref) {
    const internalRef = useRef(null);
    // Use forwarded ref if provided, otherwise use internal ref
    const cardRef = ref || internalRef;

    // Raw mouse position relative to card centre (-0.5 to 0.5)
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Spring physics
    const springCfg = { stiffness: 200, damping: 22, mass: 0.6 };
    const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [maxTilt, -maxTilt]), springCfg);
    const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-maxTilt, maxTilt]), springCfg);
    const scaleV = useSpring(1, { stiffness: 220, damping: 20 });
    const glowX = useSpring(useTransform(mouseX, [-0.5, 0.5], [20, 80]), springCfg);
    const glowY = useSpring(useTransform(mouseY, [-0.5, 0.5], [20, 80]), springCfg);

    const handleMouseMove = (e) => {
        if (disabled) return;
        const el = cardRef?.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
        mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    };

    const handleMouseEnter = (e) => {
        if (!disabled) scaleV.set(scale);
        outerMouseEnter?.(e);
    };

    const handleMouseLeave = (e) => {
        mouseX.set(0);
        mouseY.set(0);
        scaleV.set(1);
        outerMouseLeave?.(e);
    };

    return (
        <motion.div
            ref={cardRef}
            id={id}
            role={role}
            tabIndex={tabIndex}
            aria-label={ariaLabel}
            onClick={onClick}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onKeyDown={onKeyDown}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`glass-card ${className}`.trim()}
            style={{
                rotateX,
                rotateY,
                scale: scaleV,
                transformPerspective: 900,
                transformStyle: 'preserve-3d',
                position: 'relative',
                willChange: 'transform',
                ...style,
            }}
        >
            {/* Dynamic inner glow follows cursor position */}
            {!disabled && (
                <motion.div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: 'inherit',
                        pointerEvents: 'none',
                        zIndex: 0,
                        background: `radial-gradient(circle at ${glowX}% ${glowY}%, ${glowColor} 0%, transparent 60%)`,
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                    }}
                    whileHover={{ opacity: 0.8 }}
                />
            )}

            {/* Content layer sits in front of the glow */}
            <div style={{ position: 'relative', zIndex: 1, height: '100%' }}>
                {children}
            </div>
        </motion.div>
    );
});

export default TiltCard;
