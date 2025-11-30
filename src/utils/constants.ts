// Canvas dimensions
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

// Paddle settings
export const PADDLE_WIDTH = 100;
export const PADDLE_HEIGHT = 15;
export const PADDLE_SPEED = 8;
export const PADDLE_Y_OFFSET = 50;

// Ball settings
export const BALL_RADIUS = 8;
export const BALL_INITIAL_SPEED = 5;
export const BALL_MAX_SPEED = 12;
export const BALL_SPEED_INCREMENT = 0.2;

// Brick settings
export const BRICK_ROWS = 5;
export const BRICK_COLS = 10;
export const BRICK_WIDTH = 70;
export const BRICK_HEIGHT = 25;
export const BRICK_PADDING = 5;
export const BRICK_OFFSET_TOP = 80;
export const BRICK_OFFSET_LEFT = 35;

// Game settings
export const INITIAL_LIVES = 3;

// Points per brick type
export const POINTS = {
  STANDARD: 10,
  MEDIUM: 25,
  STRONG: 50
};

// Neon color palette
export const COLORS = {
  background: '#000000',
  paddle: '#00FFFF',
  ball: '#FF00FF',
  text: '#FFFFFF',
  grid: '#0a1a1a',
  gridLine: '#003333',
  bricks: [
    '#FF0066', // Pink
    '#FF00FF', // Magenta
    '#9900FF', // Purple
    '#00FFFF', // Cyan
    '#00FF66', // Green
  ]
};

// Particle settings
export const PARTICLE_COUNT = 15;
export const PARTICLE_LIFE = 0.8;
export const PARTICLE_SPEED = 5;

// Trail settings
export const TRAIL_LENGTH = 12;
