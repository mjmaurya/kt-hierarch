import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';

/** Pointer movement (px) before a press counts as a drag rather than a click. */
const DRAG_THRESHOLD = 4;
const BUTTON_STEP = 1.2;

/** Elements that keep their own pointer behaviour instead of starting a pan. */
const INTERACTIVE = 'input, textarea, select, button, a, [contenteditable], .kt-zp-controls';

/**
 * Pan & zoom viewport.
 * - Drag anywhere to pan (a drag never fires the click of the node under it).
 * - Mouse wheel / trackpad pinch zooms around the pointer.
 * - Built-in +, −, reset (click the %) and fit-to-view buttons.
 *
 * Give the host a height (or put it in a container that has one); without it,
 * the viewport is as tall as its content.
 *
 * <kt-zoom-pan [minZoom]="0.2" [maxZoom]="3" (zoomChange)="z = $event">
 *   ...anything...
 * </kt-zoom-pan>
 */
@Component({
  selector: 'kt-zoom-pan',
  template: `
    <div class="kt-zp-content" #content><ng-content></ng-content></div>
    <div class="kt-zp-controls" *ngIf="!disabled && showControls">
      <button type="button" title="Zoom in" aria-label="Zoom in" (click)="zoomIn()" [disabled]="scale >= maxZoom">
        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3v10M3 8h10" /></svg>
      </button>
      <button type="button" title="Zoom out" aria-label="Zoom out" (click)="zoomOut()" [disabled]="scale <= minZoom">
        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10" /></svg>
      </button>
      <button type="button" class="kt-zp-level" title="Reset to 100%" aria-label="Reset zoom" (click)="reset()">
        {{ scale * 100 | number: '1.0-0' }}%
      </button>
      <button type="button" title="Fit to view" aria-label="Fit to view" (click)="fit()">
        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4" /></svg>
      </button>
    </div>
  `,
  styles: [
    `
      /* --kt-zp-* colours fall back to the defaults below; set them on any ancestor to theme the controls. */
      :host {
        display: block;
        position: relative;
        height: 100%;
        overflow: hidden;
        cursor: grab;
        touch-action: none;
      }
      :host(.is-panning) {
        cursor: grabbing;
        user-select: none;
      }
      :host(.is-disabled) {
        overflow: auto;
        cursor: auto;
        touch-action: auto;
      }
      .kt-zp-content {
        transform-origin: 0 0;
        width: max-content;
        min-width: 100%;
        box-sizing: border-box;
        padding: var(--kt-zoom-padding, 0);
      }
      :host(.is-disabled) .kt-zp-content {
        width: auto;
        transform: none !important;
      }
      .kt-zp-controls {
        position: absolute;
        right: 12px;
        bottom: 12px;
        display: flex;
        flex-direction: column;
        background: var(--kt-zp-bg, #ffffff);
        border: 1px solid var(--kt-zp-border, #d0d5dd);
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(16, 24, 40, 0.12);
        overflow: hidden;
        cursor: auto;
      }
      .kt-zp-controls button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 32px;
        padding: 0;
        font: 600 10px/1 system-ui, sans-serif;
        color: var(--kt-zp-text, #1f2328);
        background: none;
        border: 0;
        border-top: 1px solid var(--kt-zp-border, #d0d5dd);
        cursor: pointer;
      }
      .kt-zp-controls button:first-child {
        border-top: 0;
      }
      .kt-zp-controls button:hover:not(:disabled) {
        background: var(--kt-zp-hover, #f2f4f7);
      }
      .kt-zp-controls button:disabled {
        opacity: 0.35;
        cursor: default;
      }
      .kt-zp-controls svg {
        width: 14px;
        height: 14px;
        fill: none;
        stroke: currentColor;
        stroke-width: 1.6;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
    `,
  ],
  // is-panning is toggled directly in onPointerMove/onPointerUp, outside change detection.
  host: {
    '[class.is-disabled]': 'disabled',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KtZoomPanComponent implements AfterViewInit, OnDestroy {
  /** Turns off panning, zooming and the controls; the content then scrolls normally. */
  @Input() disabled = false;
  @Input() minZoom = 0.2;
  @Input() maxZoom = 3;
  @Input() showControls = true;
  /** Zoom with the mouse wheel / trackpad pinch. */
  @Input() wheelZoom = true;

  @Output() readonly zoomChange = new EventEmitter<number>();

  @ViewChild('content', { static: true }) private content!: ElementRef<HTMLElement>;

  scale = 1;
  private panning = false;
  private x = 0;
  private y = 0;

  private press: { id: number; startX: number; startY: number; originX: number; originY: number } | null = null;
  private suppressClick = false;
  private readonly unlisten: Array<() => void> = [];

  constructor(
    private readonly host: ElementRef<HTMLElement>,
    private readonly zone: NgZone,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngAfterViewInit(): void {
    // Pointer and wheel events fire constantly; keep them out of change detection.
    this.zone.runOutsideAngular(() => {
      this.listen('pointerdown', (e) => this.onPointerDown(e as PointerEvent));
      this.listen('pointermove', (e) => this.onPointerMove(e as PointerEvent));
      this.listen('pointerup', (e) => this.onPointerUp(e as PointerEvent));
      this.listen('pointercancel', (e) => this.onPointerUp(e as PointerEvent));
      this.listen('wheel', (e) => this.onWheel(e as WheelEvent), { passive: false });
      // Capture phase, so a drag that ends over a node doesn't also select it.
      this.listen('click', (e) => this.onClickCapture(e), { capture: true });
    });
  }

  ngOnDestroy(): void {
    this.unlisten.forEach((fn) => fn());
  }

  zoomIn(): void {
    this.zoomAtCenter(this.scale * BUTTON_STEP);
  }

  zoomOut(): void {
    this.zoomAtCenter(this.scale / BUTTON_STEP);
  }

  /** Back to 100% and the top-left origin. */
  reset(): void {
    this.x = 0;
    this.y = 0;
    this.setScale(1);
  }

  /** Scales the content down (never up past 100%) so all of it is visible, and centres it. */
  fit(): void {
    const box = this.host.nativeElement.getBoundingClientRect();
    const el = this.content.nativeElement;
    // offsetWidth/Height are layout sizes, unaffected by the current transform.
    const w = el.scrollWidth || el.offsetWidth;
    const h = el.scrollHeight || el.offsetHeight;
    if (!w || !h || !box.width || !box.height) return;

    const next = this.clamp(Math.min(box.width / w, box.height / h, 1));
    this.x = (box.width - w * next) / 2;
    this.y = (box.height - h * next) / 2;
    this.setScale(next);
  }

  private zoomAtCenter(next: number): void {
    const box = this.host.nativeElement.getBoundingClientRect();
    this.zoomAt(next, box.width / 2, box.height / 2);
  }

  /** Zooms so the content point under (px, py) — host-relative — stays put. */
  private zoomAt(next: number, px: number, py: number): void {
    next = this.clamp(next);
    if (next === this.scale) return;
    const ratio = next / this.scale;
    this.x = px - (px - this.x) * ratio;
    this.y = py - (py - this.y) * ratio;
    this.setScale(next);
  }

  private setScale(next: number): void {
    const changed = next !== this.scale;
    this.scale = next;
    this.apply();
    // The % label and button states are the only template bindings that change.
    this.zone.run(() => {
      this.cdr.markForCheck();
      if (changed) this.zoomChange.emit(next);
    });
  }

  private apply(): void {
    this.content.nativeElement.style.transform = `translate(${this.x}px, ${this.y}px) scale(${this.scale})`;
  }

  private clamp(value: number): number {
    return Math.min(this.maxZoom, Math.max(this.minZoom, value));
  }

  /* ---------- pointer ---------- */

  private onPointerDown(e: PointerEvent): void {
    if (this.disabled || e.button !== 0 || this.press) return;
    if ((e.target as Element).closest(INTERACTIVE)) return;
    this.press = { id: e.pointerId, startX: e.clientX, startY: e.clientY, originX: this.x, originY: this.y };
  }

  private onPointerMove(e: PointerEvent): void {
    const p = this.press;
    if (!p || e.pointerId !== p.id) return;
    const dx = e.clientX - p.startX;
    const dy = e.clientY - p.startY;

    if (!this.panning) {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      this.panning = true;
      this.host.nativeElement.setPointerCapture(e.pointerId);
      this.host.nativeElement.classList.add('is-panning');
    }
    this.x = p.originX + dx;
    this.y = p.originY + dy;
    this.apply();
  }

  private onPointerUp(e: PointerEvent): void {
    if (!this.press || e.pointerId !== this.press.id) return;
    this.press = null;
    if (!this.panning) return;

    this.panning = false;
    this.host.nativeElement.classList.remove('is-panning');
    if (this.host.nativeElement.hasPointerCapture(e.pointerId)) {
      this.host.nativeElement.releasePointerCapture(e.pointerId);
    }
    // The click event (if any) fires right after pointerup; swallow just that one.
    this.suppressClick = true;
    setTimeout(() => (this.suppressClick = false));
  }

  private onClickCapture(e: Event): void {
    if (!this.suppressClick) return;
    this.suppressClick = false;
    e.stopPropagation();
    e.preventDefault();
  }

  /* ---------- wheel ---------- */

  private onWheel(e: WheelEvent): void {
    if (this.disabled || !this.wheelZoom) return;
    e.preventDefault();
    // Trackpad pinch arrives as ctrl+wheel with small deltas, so it needs a stronger factor.
    const speed = e.ctrlKey ? 0.01 : 0.0015;
    const delta = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY; // lines → px
    const box = this.host.nativeElement.getBoundingClientRect();
    this.zoomAt(this.scale * Math.exp(-delta * speed), e.clientX - box.left, e.clientY - box.top);
  }

  private listen(type: string, fn: (e: Event) => void, options?: AddEventListenerOptions): void {
    const el = this.host.nativeElement;
    el.addEventListener(type, fn, options);
    this.unlisten.push(() => el.removeEventListener(type, fn, options));
  }
}
