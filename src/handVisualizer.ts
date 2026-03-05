import { HandLandmarks, GestureState } from './types';
import { LANDMARKS, VISUAL, GESTURE } from './constants';

// Hand skeleton connections
const HAND_CONNECTIONS = [
  // Thumb
  [LANDMARKS.WRIST, LANDMARKS.THUMB_CMC],
  [LANDMARKS.THUMB_CMC, LANDMARKS.THUMB_MCP],
  [LANDMARKS.THUMB_MCP, LANDMARKS.THUMB_IP],
  [LANDMARKS.THUMB_IP, LANDMARKS.THUMB_TIP],
  // Index
  [LANDMARKS.WRIST, LANDMARKS.INDEX_MCP],
  [LANDMARKS.INDEX_MCP, LANDMARKS.INDEX_PIP],
  [LANDMARKS.INDEX_PIP, LANDMARKS.INDEX_DIP],
  [LANDMARKS.INDEX_DIP, LANDMARKS.INDEX_TIP],
  // Middle
  [LANDMARKS.WRIST, LANDMARKS.MIDDLE_MCP],
  [LANDMARKS.MIDDLE_MCP, LANDMARKS.MIDDLE_PIP],
  [LANDMARKS.MIDDLE_PIP, LANDMARKS.MIDDLE_DIP],
  [LANDMARKS.MIDDLE_DIP, LANDMARKS.MIDDLE_TIP],
  // Ring
  [LANDMARKS.WRIST, LANDMARKS.RING_MCP],
  [LANDMARKS.RING_MCP, LANDMARKS.RING_PIP],
  [LANDMARKS.RING_PIP, LANDMARKS.RING_DIP],
  [LANDMARKS.RING_DIP, LANDMARKS.RING_TIP],
  // Pinky
  [LANDMARKS.WRIST, LANDMARKS.PINKY_MCP],
  [LANDMARKS.PINKY_MCP, LANDMARKS.PINKY_PIP],
  [LANDMARKS.PINKY_PIP, LANDMARKS.PINKY_DIP],
  [LANDMARKS.PINKY_DIP, LANDMARKS.PINKY_TIP],
  // Palm
  [LANDMARKS.INDEX_MCP, LANDMARKS.MIDDLE_MCP],
  [LANDMARKS.MIDDLE_MCP, LANDMARKS.RING_MCP],
  [LANDMARKS.RING_MCP, LANDMARKS.PINKY_MCP]
];

// Gesture name mappings for the HUD badge
const GESTURE_INFO: Record<string, { label: string; emoji: string }> = {
  'draw': { label: 'DRAW', emoji: '✏️' },
  'pinch': { label: 'GRAB', emoji: '🤏' },
  'palm': { label: 'INFLATE', emoji: '🎈' },
  'fist': { label: 'FIST', emoji: '✊' },
  'swipe': { label: 'SWIPE', emoji: '👋' },
  'poke': { label: 'POKE', emoji: '👆' },
  'none': { label: 'IDLE', emoji: '🖐️' },
};

export class HandVisualizer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private cursorPulse = 0;

  // Gesture badge DOM element (managed externally, we just update it)
  private gestureBadge: HTMLElement | null = null;
  private progressRing: HTMLElement | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D context');
    this.ctx = ctx;

    // Find or ignore badge elements (they may not exist yet)
    this.gestureBadge = document.getElementById('gesture-badge');
    this.progressRing = document.getElementById('palm-progress-ring');
  }

  resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  render(
    landmarks: HandLandmarks | null,
    gestureState: GestureState,
    currentColor: string,
    deltaTime: number,
    palmHoldProgress: number = 0
  ): void {
    this.clear();

    // Update gesture badge
    this.updateGestureBadge(gestureState, landmarks !== null);

    if (!landmarks) {
      this.updateProgressRing(0);
      return;
    }

    // Update cursor pulse
    this.cursorPulse += deltaTime * VISUAL.CURSOR_PULSE_SPEED;

    // Render hand skeleton (faint)
    this.renderSkeleton(landmarks, gestureState);

    // Render cursor at index fingertip
    const indexTip = landmarks.landmarks[LANDMARKS.INDEX_TIP];
    this.renderCursor(indexTip.x, indexTip.y, currentColor, gestureState);

    // Render pinch indicator when pinching
    if (gestureState.current === 'pinch') {
      this.renderPinchIndicator(landmarks, currentColor);
    }

    // Render palm hold progress
    if (gestureState.current === 'palm' && palmHoldProgress > 0) {
      this.renderPalmProgress(landmarks, palmHoldProgress, currentColor);
    }
    this.updateProgressRing(gestureState.current === 'palm' ? palmHoldProgress : 0);
  }

  private updateGestureBadge(state: GestureState, handDetected: boolean): void {
    if (!this.gestureBadge) {
      this.gestureBadge = document.getElementById('gesture-badge');
    }
    if (!this.gestureBadge) return;

    if (!handDetected) {
      this.gestureBadge.style.opacity = '0';
      return;
    }

    const info = GESTURE_INFO[state.current] || GESTURE_INFO['none'];
    this.gestureBadge.textContent = `${info.emoji} ${info.label}`;
    this.gestureBadge.style.opacity = '1';

    // Color the badge based on gesture
    if (state.current === 'draw') {
      this.gestureBadge.style.borderColor = 'rgba(74, 222, 128, 0.6)';
    } else if (state.current === 'palm') {
      this.gestureBadge.style.borderColor = 'rgba(251, 191, 36, 0.6)';
    } else if (state.current === 'pinch') {
      this.gestureBadge.style.borderColor = 'rgba(96, 165, 250, 0.6)';
    } else if (state.current === 'swipe') {
      this.gestureBadge.style.borderColor = 'rgba(248, 113, 113, 0.6)';
    } else {
      this.gestureBadge.style.borderColor = 'rgba(190, 225, 125, 0.3)';
    }
  }

  private updateProgressRing(progress: number): void {
    if (!this.progressRing) {
      this.progressRing = document.getElementById('palm-progress-ring');
    }
    if (!this.progressRing) return;

    const circle = this.progressRing.querySelector('.progress-circle') as SVGCircleElement;
    if (!circle) return;

    const circumference = 2 * Math.PI * 18; // r=18
    const dashOffset = circumference * (1 - progress);
    circle.style.strokeDashoffset = String(dashOffset);

    this.progressRing.style.opacity = progress > 0 ? '1' : '0';
  }

  private renderSkeleton(landmarks: HandLandmarks, gestureState: GestureState): void {
    this.ctx.save();

    // Slightly brighter skeleton during active gestures
    const opacity = gestureState.current !== 'none'
      ? VISUAL.HAND_SKELETON_OPACITY * 1.5
      : VISUAL.HAND_SKELETON_OPACITY;
    this.ctx.globalAlpha = Math.min(opacity, 0.6);

    // Color skeleton based on gesture
    let skeletonColor = 'white';
    if (gestureState.current === 'draw') skeletonColor = '#4ade80';
    else if (gestureState.current === 'pinch') skeletonColor = '#60a5fa';
    else if (gestureState.current === 'palm') skeletonColor = '#fbbf24';

    this.ctx.strokeStyle = skeletonColor;
    this.ctx.lineWidth = VISUAL.HAND_SKELETON_WIDTH;
    this.ctx.lineCap = 'round';

    // Draw connections
    for (const [from, to] of HAND_CONNECTIONS) {
      const start = landmarks.landmarks[from];
      const end = landmarks.landmarks[to];

      this.ctx.beginPath();
      this.ctx.moveTo(start.x, start.y);
      this.ctx.lineTo(end.x, end.y);
      this.ctx.stroke();
    }

    // Draw joints as small circles
    this.ctx.fillStyle = skeletonColor;
    for (const landmark of landmarks.landmarks) {
      this.ctx.beginPath();
      this.ctx.arc(landmark.x, landmark.y, 3, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.restore();
  }

  private renderCursor(
    x: number,
    y: number,
    color: string,
    gestureState: GestureState
  ): void {
    const isReadyToDraw = gestureState.current === 'draw' || gestureState.current === 'none';
    const pulseAmount = isReadyToDraw ? Math.sin(this.cursorPulse) * 0.3 + 1 : 1;

    // Different cursor sizes for different gestures
    let cursorScale = 1;
    if (gestureState.current === 'pinch') cursorScale = 0.7;
    else if (gestureState.current === 'palm') cursorScale = 1.5;

    this.ctx.save();

    // Outer glow
    const gradient = this.ctx.createRadialGradient(
      x, y, 0,
      x, y, VISUAL.CURSOR_GLOW_SIZE * pulseAmount * cursorScale
    );
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.3, this.hexToRgba(color, 0.5));
    gradient.addColorStop(1, this.hexToRgba(color, 0));

    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(x, y, VISUAL.CURSOR_GLOW_SIZE * pulseAmount * cursorScale, 0, Math.PI * 2);
    this.ctx.fill();

    // Inner solid cursor
    this.ctx.fillStyle = color;
    this.ctx.shadowColor = color;
    this.ctx.shadowBlur = 10;
    this.ctx.beginPath();
    this.ctx.arc(x, y, VISUAL.CURSOR_SIZE / 2 * pulseAmount * cursorScale, 0, Math.PI * 2);
    this.ctx.fill();

    // Bright center
    this.ctx.fillStyle = 'white';
    this.ctx.beginPath();
    this.ctx.arc(x, y, VISUAL.CURSOR_SIZE / 4, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  /** Draw line between thumb and index showing pinch strength */
  private renderPinchIndicator(landmarks: HandLandmarks, _color: string): void {
    const thumb = landmarks.landmarks[LANDMARKS.THUMB_TIP];
    const index = landmarks.landmarks[LANDMARKS.INDEX_TIP];
    const dist = Math.sqrt(
      Math.pow(thumb.x - index.x, 2) + Math.pow(thumb.y - index.y, 2)
    );
    const strength = 1 - Math.min(dist / GESTURE.PINCH_THRESHOLD, 1);

    this.ctx.save();
    this.ctx.globalAlpha = 0.6;

    // Gradient from green (far) to blue (close/pinched)
    const gradient = this.ctx.createLinearGradient(thumb.x, thumb.y, index.x, index.y);
    gradient.addColorStop(0, `rgba(96, 165, 250, ${strength})`);
    gradient.addColorStop(1, `rgba(74, 222, 128, ${1 - strength})`);

    this.ctx.strokeStyle = gradient;
    this.ctx.lineWidth = 2 + strength * 3;
    this.ctx.setLineDash([4, 4]);

    this.ctx.beginPath();
    this.ctx.moveTo(thumb.x, thumb.y);
    this.ctx.lineTo(index.x, index.y);
    this.ctx.stroke();

    this.ctx.restore();
  }

  /** Render a circular progress arc around the palm center */
  private renderPalmProgress(landmarks: HandLandmarks, progress: number, color: string): void {
    const wrist = landmarks.landmarks[LANDMARKS.WRIST];
    const indexMcp = landmarks.landmarks[LANDMARKS.INDEX_MCP];
    const pinkyMcp = landmarks.landmarks[LANDMARKS.PINKY_MCP];

    const cx = (wrist.x + indexMcp.x + pinkyMcp.x) / 3;
    const cy = (wrist.y + indexMcp.y + pinkyMcp.y) / 3;

    const radius = 40;

    this.ctx.save();

    // Background ring
    this.ctx.globalAlpha = 0.2;
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    this.ctx.stroke();

    // Progress arc
    this.ctx.globalAlpha = 0.8;
    this.ctx.strokeStyle = '#fbbf24';
    this.ctx.lineWidth = 4;
    this.ctx.lineCap = 'round';
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
    this.ctx.stroke();

    // Percentage text
    if (progress > 0.1) {
      this.ctx.globalAlpha = 0.9;
      this.ctx.fillStyle = '#fbbf24';
      this.ctx.font = '14px Inter, sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(`${Math.round(progress * 100)}%`, cx, cy);
    }

    this.ctx.restore();
  }

  private hexToRgba(hex: string, alpha: number): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return `rgba(255, 255, 255, ${alpha})`;

    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  renderGestureIndicator(_gestureState: GestureState): void {
    // Implemented via badge + canvas rendering now
  }
}
