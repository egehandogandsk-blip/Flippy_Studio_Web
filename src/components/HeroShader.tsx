import { useEffect, useRef } from 'react';

export function HeroShader() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let t = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      const w = parent ? parent.clientWidth : window.innerWidth;
      const h = parent ? parent.clientHeight : window.innerHeight;
      canvas.width = Math.floor(w * 0.5);
      canvas.height = Math.floor(h * 0.5);
    };

    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      t += 0.008;
      const w = canvas.width;
      const h = canvas.height;

      ctx.fillStyle = '#030612';
      ctx.fillRect(0, 0, w, h);

      // Deep cobalt left glow
      const g1 = ctx.createRadialGradient(
        w * (0.18 + Math.sin(t * 0.7) * 0.06),
        h * (0.42 + Math.cos(t * 0.5) * 0.08),
        w * 0.02,
        w * 0.25,
        h * 0.45,
        w * 0.65
      );
      g1.addColorStop(0, 'rgba(0, 80, 255, 0.92)');
      g1.addColorStop(0.45, 'rgba(0, 42, 180, 0.6)');
      g1.addColorStop(1, 'rgba(3, 6, 18, 0)');
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, w, h);

      // Electric cyan ribbon sweep (right/center)
      const g2 = ctx.createRadialGradient(
        w * (0.72 + Math.cos(t * 0.6) * 0.08),
        h * (0.35 + Math.sin(t * 0.8) * 0.1),
        w * 0.01,
        w * 0.72,
        h * 0.4,
        w * 0.48
      );
      g2.addColorStop(0, 'rgba(64, 224, 255, 0.75)');
      g2.addColorStop(0.35, 'rgba(0, 120, 255, 0.55)');
      g2.addColorStop(1, 'rgba(3, 6, 18, 0)');
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, w, h);

      // Diagonal dark obsidian fold for contrast
      const fold = ctx.createLinearGradient(0, h, w, 0);
      fold.addColorStop(0, 'rgba(2, 4, 10, 0.35)');
      fold.addColorStop(0.52, 'rgba(2, 4, 10, 0.78)');
      fold.addColorStop(0.68, 'rgba(0, 180, 255, 0.18)');
      fold.addColorStop(1, 'rgba(0, 40, 200, 0.25)');
      ctx.fillStyle = fold;
      ctx.fillRect(0, 0, w, h);

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full object-cover opacity-95"
      aria-hidden="true"
    />
  );
}
