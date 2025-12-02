export class InputManager {
  private keys: Set<string> = new Set();
  private mouseX: number = 0;
  private mouseY: number = 0;
  private useMouseControl: boolean = false;
  private isTouchDevice: boolean = false;
  private touchActive: boolean = false;
  private tapAction: boolean = false;
  private lastTapTime: number = 0;
  private clickX: number = -1;
  private clickY: number = -1;
  private hasClick: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    // Detect touch device
    this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // Keyboard events
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

    // Mouse events (for desktop)
    canvas.addEventListener('mousemove', (e) => {
      if (!this.isTouchDevice) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        this.mouseX = (e.clientX - rect.left) * scaleX;
        this.useMouseControl = true;
      }
    });

    canvas.addEventListener('click', (e) => {
      if (!this.isTouchDevice) {
        this.tapAction = true;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        this.clickX = (e.clientX - rect.left) * scaleX;
        this.clickY = (e.clientY - rect.top) * scaleY;
        this.hasClick = true;
      }
    });

    // Touch events (for mobile)
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.touchActive = true;
      this.useMouseControl = true;

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const touch = e.touches[0];
      this.mouseX = (touch.clientX - rect.left) * scaleX;
      this.mouseY = (touch.clientY - rect.top) * scaleY;
      // Store touch position for click detection
      this.clickX = this.mouseX;
      this.clickY = this.mouseY;

      // Detect tap (quick touch)
      const now = Date.now();
      this.lastTapTime = now;
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (this.touchActive) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const touch = e.touches[0];
        this.mouseX = (touch.clientX - rect.left) * scaleX;
        this.useMouseControl = true;
      }
    }, { passive: false });

    canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      const now = Date.now();
      // If touch was quick (< 200ms), treat as tap for action
      if (now - this.lastTapTime < 200) {
        this.tapAction = true;
        this.hasClick = true;
      }
      this.touchActive = false;
    }, { passive: false });

    canvas.addEventListener('touchcancel', () => {
      this.touchActive = false;
    });
  }

  isMobile(): boolean {
    return this.isTouchDevice;
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
    // Check keyboard action
    if (this.keys.has(' ') || this.keys.has('Enter')) {
      return true;
    }
    // Check tap action (consumed on read)
    if (this.tapAction) {
      this.tapAction = false;
      return true;
    }
    return false;
  }

  isPausePressed(): boolean {
    return this.keys.has('p') || this.keys.has('P') || this.keys.has('Escape');
  }

  clearKey(key: string): void {
    this.keys.delete(key);
  }

  clearTapAction(): void {
    this.tapAction = false;
  }

  getClickPosition(): { x: number; y: number } | null {
    if (this.hasClick) {
      return { x: this.clickX, y: this.clickY };
    }
    return null;
  }

  consumeClick(): { x: number; y: number } | null {
    if (this.hasClick) {
      this.hasClick = false;
      return { x: this.clickX, y: this.clickY };
    }
    return null;
  }

  isClickInRect(x: number, y: number, width: number, height: number): boolean {
    if (!this.hasClick) return false;
    return this.clickX >= x && this.clickX <= x + width &&
           this.clickY >= y && this.clickY <= y + height;
  }

  consumeClickInRect(x: number, y: number, width: number, height: number): boolean {
    if (this.isClickInRect(x, y, width, height)) {
      this.hasClick = false;
      return true;
    }
    return false;
  }

  clearClick(): void {
    this.hasClick = false;
    this.clickX = -1;
    this.clickY = -1;
  }
}
