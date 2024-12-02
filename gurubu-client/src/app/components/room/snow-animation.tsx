import { useEffect, useRef, memo, useState } from 'react';

interface SnowAnimationProps {
  isActive: boolean;
}

const SnowAnimation = memo(({ isActive }: SnowAnimationProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>();
  const [isReverse, setIsReverse] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    const directionInterval = setInterval(() => {
      setIsReverse(prev => !prev);
    }, 15000);

    return () => {
      clearInterval(directionInterval);
    };
  }, [isActive]);

  useEffect(() => {
    if (!isActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    const snowflakes = new Array(50).fill(null).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 3 + 1,
      speed: Math.random() * 1 + 0.5,
      wind: Math.random() * 0.5 - 0.25,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = 'white';
      ctx.beginPath();
      
      snowflakes.forEach(flake => {
        ctx.moveTo(flake.x, flake.y);
        ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
        
        flake.y += flake.speed;
        flake.x += flake.wind;
        
        if (flake.y > canvas.height) {
          flake.y = -5;
          flake.x = Math.random() * canvas.width;
        }
        if (flake.x > canvas.width) {
          flake.x = 0;
        } else if (flake.x < 0) {
          flake.x = canvas.width;
        }
      });
      
      ctx.fill();
      rafRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      window.removeEventListener('resize', setCanvasSize);
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
      <div className="santa-container">
        <div className={`santa ${isReverse ? 'reverse' : ''}`} />
      </div>
    </>
  );
});

SnowAnimation.displayName = 'SnowAnimation';

export default SnowAnimation;