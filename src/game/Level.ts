import { Brick } from './Brick';
import { BrickType } from '../types';
import {
  BRICK_WIDTH,
  BRICK_HEIGHT,
  BRICK_PADDING,
  BRICK_OFFSET_TOP,
  BRICK_OFFSET_LEFT,
  COLORS
} from '../utils/constants';

// Level layouts: 0 = empty, 1 = standard, 2 = medium, 3 = strong, -1 = indestructible
const LEVELS: number[][][] = [
  // Level 1: Simple rows
  [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ],
  // Level 2: Mixed with medium bricks
  [
    [2, 1, 1, 1, 2, 2, 1, 1, 1, 2],
    [1, 2, 1, 1, 1, 1, 1, 1, 2, 1],
    [1, 1, 2, 1, 1, 1, 1, 2, 1, 1],
    [1, 2, 1, 1, 1, 1, 1, 1, 2, 1],
    [2, 1, 1, 1, 2, 2, 1, 1, 1, 2],
  ],
  // Level 3: Diamond pattern with strong bricks
  [
    [0, 0, 0, 0, 3, 3, 0, 0, 0, 0],
    [0, 0, 0, 2, 1, 1, 2, 0, 0, 0],
    [0, 0, 2, 1, 1, 1, 1, 2, 0, 0],
    [0, 0, 0, 2, 1, 1, 2, 0, 0, 0],
    [0, 0, 0, 0, 3, 3, 0, 0, 0, 0],
  ],
  // Level 4: Fortress
  [
    [-1, 3, 3, 3, 3, 3, 3, 3, 3, -1],
    [0, 2, 2, 2, 2, 2, 2, 2, 2, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 2, 2, 2, 2, 2, 2, 2, 2, 0],
    [-1, 3, 3, 3, 3, 3, 3, 3, 3, -1],
  ],
  // Level 5: Checkerboard
  [
    [3, 0, 3, 0, 3, 0, 3, 0, 3, 0],
    [0, 2, 0, 2, 0, 2, 0, 2, 0, 2],
    [3, 0, 3, 0, 3, 0, 3, 0, 3, 0],
    [0, 2, 0, 2, 0, 2, 0, 2, 0, 2],
    [3, 0, 3, 0, 3, 0, 3, 0, 3, 0],
  ],
];

export class Level {
  bricks: Brick[] = [];
  currentLevel: number = 0;

  constructor() {
    this.loadLevel(0);
  }

  loadLevel(levelIndex: number): void {
    this.currentLevel = levelIndex % LEVELS.length;
    this.bricks = [];

    const layout = LEVELS[this.currentLevel];

    for (let row = 0; row < layout.length; row++) {
      for (let col = 0; col < layout[row].length; col++) {
        const type = layout[row][col];
        if (type === 0) continue; // Empty space

        const x = BRICK_OFFSET_LEFT + col * (BRICK_WIDTH + BRICK_PADDING);
        const y = BRICK_OFFSET_TOP + row * (BRICK_HEIGHT + BRICK_PADDING);

        let color: string;
        if (type === -1) {
          color = '#444444'; // Indestructible bricks are gray
        } else {
          color = COLORS.bricks[row % COLORS.bricks.length];
        }

        const brick = new Brick(
          x,
          y,
          BRICK_WIDTH,
          BRICK_HEIGHT,
          type as BrickType,
          color
        );

        this.bricks.push(brick);
      }
    }
  }

  nextLevel(): void {
    this.loadLevel(this.currentLevel + 1);
  }

  update(dt: number, time: number): void {
    this.bricks.forEach(brick => brick.update(dt, time));
  }

  render(ctx: CanvasRenderingContext2D, time: number): void {
    this.bricks.forEach(brick => brick.render(ctx, time));
  }

  get activeBricks(): Brick[] {
    return this.bricks.filter(b => !b.isDestroyed);
  }

  get destructibleBricksRemaining(): number {
    return this.bricks.filter(
      b => !b.isDestroyed && b.type !== BrickType.INDESTRUCTIBLE
    ).length;
  }

  isComplete(): boolean {
    return this.destructibleBricksRemaining === 0;
  }

  get totalLevels(): number {
    return LEVELS.length;
  }
}
