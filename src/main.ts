import { Game } from './game/Game';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './utils/constants';

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;

  if (!canvas) {
    console.error('Canvas element not found!');
    return;
  }

  // Set internal canvas resolution
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  // Function to resize canvas display size while maintaining aspect ratio
  function resizeCanvas(): void {
    const container = document.getElementById('gameContainer');
    if (!container) return;

    const containerWidth = window.innerWidth - 20;
    const containerHeight = window.innerHeight - 20;

    const aspectRatio = CANVAS_WIDTH / CANVAS_HEIGHT;
    let displayWidth: number;
    let displayHeight: number;

    if (containerWidth / containerHeight > aspectRatio) {
      // Container is wider than canvas aspect ratio
      displayHeight = containerHeight;
      displayWidth = displayHeight * aspectRatio;
    } else {
      // Container is taller than canvas aspect ratio
      displayWidth = containerWidth;
      displayHeight = displayWidth / aspectRatio;
    }

    // Apply display size via CSS (internal resolution stays the same)
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;
  }

  // Initial resize
  resizeCanvas();

  // Resize on window resize and orientation change
  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('orientationchange', () => {
    // Delay to let the browser finish rotating
    setTimeout(resizeCanvas, 100);
  });

  // Create and start the game
  const game = new Game(canvas);
  game.start();

  // Prevent default behaviors that interfere with gameplay
  window.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'ArrowDown' ||
        e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
    }
  });

  // Prevent context menu on long press (mobile)
  canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });

  // Prevent double-tap zoom on iOS
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  }, { passive: false });

  // Prevent pinch zoom
  document.addEventListener('gesturestart', (e) => {
    e.preventDefault();
  });

  // Prevent scroll on touch
  document.addEventListener('touchmove', (e) => {
    if (e.target === canvas) {
      e.preventDefault();
    }
  }, { passive: false });
});
