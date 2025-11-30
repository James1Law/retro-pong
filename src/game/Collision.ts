import { Ball } from './Ball';
import { Brick } from './Brick';
import { CollisionResult } from '../types';

export function checkBallBrickCollision(ball: Ball, brick: Brick): CollisionResult | null {
  if (brick.isDestroyed) return null;

  // Find closest point on brick to ball center
  const closestX = Math.max(brick.x, Math.min(ball.x, brick.x + brick.width));
  const closestY = Math.max(brick.y, Math.min(ball.y, brick.y + brick.height));

  // Calculate distance from ball center to closest point
  const distX = ball.x - closestX;
  const distY = ball.y - closestY;
  const distance = Math.sqrt(distX * distX + distY * distY);

  // Check collision
  if (distance < ball.radius) {
    // Determine which side was hit
    const side = determineSide(ball, brick, closestX, closestY);
    return { hit: true, side };
  }

  return null;
}

function determineSide(
  ball: Ball,
  brick: Brick,
  closestX: number,
  closestY: number
): 'top' | 'bottom' | 'left' | 'right' {
  const dx = ball.x - closestX;
  const dy = ball.y - closestY;

  // If the closest point is on a corner, determine side by velocity
  const isOnVerticalEdge = closestX === brick.x || closestX === brick.x + brick.width;
  const isOnHorizontalEdge = closestY === brick.y || closestY === brick.y + brick.height;

  if (isOnVerticalEdge && isOnHorizontalEdge) {
    // Corner hit - determine by which component is larger
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? 'right' : 'left';
    } else {
      return dy > 0 ? 'bottom' : 'top';
    }
  }

  if (isOnVerticalEdge) {
    return closestX === brick.x ? 'left' : 'right';
  }

  if (isOnHorizontalEdge) {
    return closestY === brick.y ? 'top' : 'bottom';
  }

  // Ball is inside brick - use position relative to center
  const relX = ball.x - brick.centerX;
  const relY = ball.y - brick.centerY;

  if (Math.abs(relX / brick.width) > Math.abs(relY / brick.height)) {
    return relX > 0 ? 'right' : 'left';
  }
  return relY > 0 ? 'bottom' : 'top';
}

export function handleBallBrickBounce(ball: Ball, collision: CollisionResult): void {
  switch (collision.side) {
    case 'top':
      ball.velocityY = -Math.abs(ball.velocityY);
      break;
    case 'bottom':
      ball.velocityY = Math.abs(ball.velocityY);
      break;
    case 'left':
      ball.velocityX = -Math.abs(ball.velocityX);
      break;
    case 'right':
      ball.velocityX = Math.abs(ball.velocityX);
      break;
  }
}
