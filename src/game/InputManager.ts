export class InputManager {
  private keys: Set<string> = new Set();
  private mouseX: number = 0;
  private useMouseControl: boolean = false;

  constructor(canvas: HTMLCanvasElement) {

    window.addEventListener('keydown', (e) => {
      this.keys.add(e.key);
      // Switch to keyboard control when arrow keys pressed
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' ||
          e.key === 'a' || e.key === 'd' || e.key === 'A' || e.key === 'D') {
        this.useMouseControl = false;
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.key);
    });

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      this.mouseX = (e.clientX - rect.left) * scaleX;
      this.useMouseControl = true;
    });

    // Also support touch for mobile
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const touch = e.touches[0];
      this.mouseX = (touch.clientX - rect.left) * scaleX;
      this.useMouseControl = true;
    });
  }

  isUsingMouse(): boolean {
    return this.useMouseControl;
  }

  getMouseX(): number {
    return this.mouseX;
  }

  isMovingLeft(): boolean {
    return this.keys.has('ArrowLeft') || this.keys.has('a') || this.keys.has('A');
  }

  isMovingRight(): boolean {
    return this.keys.has('ArrowRight') || this.keys.has('d') || this.keys.has('D');
  }

  isKeyPressed(key: string): boolean {
    return this.keys.has(key);
  }

  isActionPressed(): boolean {
    return this.keys.has(' ') || this.keys.has('Enter');
  }

  isPausePressed(): boolean {
    return this.keys.has('p') || this.keys.has('P') || this.keys.has('Escape');
  }

  clearKey(key: string): void {
    this.keys.delete(key);
  }
}
