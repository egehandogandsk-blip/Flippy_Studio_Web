import { useEffect, useRef } from 'react';

export function MatrixBackground({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    const chars = '0123456789ABCDEF:+*.-';
    const cellSize = 18;
    let cols = 0;
    let rows = 0;
    let grid: number[] = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.parentElement?.clientWidth || window.innerWidth;
      const height = canvas.parentElement?.clientHeight || window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      cols = Math.ceil(width / cellSize);
      rows = Math.ceil(height / cellSize);
      grid = Array.from({ length: cols * rows }, () => Math.random());
    };

    resize();
    window.addEventListener('resize', resize);

    let frame = 0;
    const render = () => {
      frame += 0.015;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      ctx.clearRect(0, 0, width, height);
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const idx = r * cols + c;
          const seed = grid[idx] || 0;
          const wave = Math.sin(c * 0.14 + frame) * Math.cos(r * 0.14 - frame * 0.7);
          const alpha = Math.max(0.02, Math.min(0.16, 0.05 + wave * 0.07 + (seed > 0.92 ? 0.06 : 0)));
          const charIdx = Math.floor((seed * 100 + frame * 2) % chars.length);

          ctx.fillStyle = seed > 0.96
            ? `rgba(0, 194, 255, ${alpha * 1.4})`
            : `rgba(255, 255, 255, ${alpha})`;
          ctx.fillText(chars[charIdx], c * cellSize + cellSize / 2, r * cellSize + cellSize / 2);
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none select-none ${className}`}
      aria-hidden="true"
    />
  );
}
