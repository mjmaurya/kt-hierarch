import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Output,
  QueryList,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewChildren,
} from '@angular/core';

import { KtZoomPanComponent } from '../kt-zoom-pan/kt-zoom-pan.component';
import {
  KtDependencyGraphBadgeStyle,
  KtDependencyGraphBoxStyle,
  KtDependencyGraphConfig,
  KtDependencyGraphCss,
  KtDependencyGraphDirection,
  KtDependencyGraphEdge,
  KtDependencyGraphEdgeView,
  KtDependencyGraphLayout,
  KtDependencyGraphModel,
  KtDependencyGraphNode,
  KtDependencyGraphNodeContext,
  KtDependencyGraphNodeView,
  KtDependencyGraphSwatchStyle,
  KtDependencyGraphTextStyle,
} from './kt-dependency-graph.models';

const DEFAULT_LAYOUT: KtDependencyGraphLayout = {
  direction: 'left-right',
  nodeWidth: 172,
  levelGap: 120,
  nodeGap: 16,
  padding: 24,
};

/** Height used for a node until it has been rendered and measured. */
const ESTIMATED_HEIGHT = 46;

const DEFAULT_DASH = '5 4';

let nextInstance = 0;

/**
 * Directed acyclic graph, laid out in the configured direction.
 * Content and look of every node, edge and badge come from the config;
 * node heights follow their content (measured after render).
 *
 * <kt-dependency-graph
 *   [config]="config"
 *   selectionMode="multiple"
 *   (nodeClick)="onNode($event)"
 *   (selectionChange)="selected = $event"></kt-dependency-graph>
 */
@Component({
  selector: 'kt-dependency-graph',
  templateUrl: './kt-dependency-graph.component.html',
  styleUrls: ['./kt-dependency-graph.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KtDependencyGraphComponent implements OnChanges, AfterViewInit, OnDestroy {
  /** All data for the graph. Replace the object (immutable update) to re-render. */
  @Input() config!: KtDependencyGraphConfig;
  /** Optional custom node body. Context: { $implicit: node, selected }. */
  @Input() nodeTemplate: TemplateRef<KtDependencyGraphNodeContext> | null = null;
  @Input() selectionMode: 'none' | 'single' | 'multiple' = 'multiple';
  /** Dim everything not upstream/downstream of the hovered node. */
  @Input() highlightOnHover = true;
  /**
   * On hover / focus, show a card with the node's full title, sub-title and custom HTML
   * (in that order, wrapped instead of truncated). Replaces the browser's native tooltip.
   */
  @Input() showHoverText = false;
  /** Drag to pan, wheel / buttons to zoom. Set false to scroll the graph instead. */
  @Input() zoomable = true;
  @Input() zoomControls = true;
  @Input() minZoom = 0.2;
  @Input() maxZoom = 3;

  @Output() readonly nodeClick = new EventEmitter<KtDependencyGraphNodeView>();
  @Output() readonly selectionChange = new EventEmitter<string[]>();

  @ViewChild(KtZoomPanComponent) zoomPan?: KtZoomPanComponent;
  @ViewChildren('nodeEl') private nodeEls!: QueryList<ElementRef<HTMLElement>>;
  @ViewChild('hoverCardEl') private hoverCardEl?: ElementRef<HTMLElement>;

  readonly uid = `kd${nextInstance++}`;

  model: KtDependencyGraphModel = buildModel({ nodes: [], edges: [] }, new Map());
  selected: ReadonlySet<string> = new Set();
  related: { up: Set<string>; down: Set<string> } | null = null;
  /** False until every node has a measured height; the canvas stays hidden meanwhile. */
  measured = false;
  /** The hover card, positioned relative to the host (outside the zoomed content, so it never scales or clips). */
  hoverCard: { node: KtDependencyGraphNodeView; left: number; top: number } | null = null;
  private hovered: string | null = null;
  private markerIndex = new Map<string, number>();
  private readonly heights = new Map<string, number>();
  private resizeObserver: ResizeObserver | null = null;

  constructor(
    private readonly host: ElementRef<HTMLElement>,
    private readonly zone: NgZone,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.config) {
      this.relayout();
      // Re-seed the selection whenever a new config arrives.
      this.selected = new Set(this.config.selectedIds ?? []);
      // Surface data problems (unknown ids, cycles) during development.
      if (this.model.warnings.length) console.warn('[kt-dependency-graph]', ...this.model.warnings);
    }
    if (changes.config || changes.highlightOnHover) this.updateRelated();
    if (changes.config || changes.showHoverText) this.hoverCard = null;
  }

  ngAfterViewInit(): void {
    if (typeof ResizeObserver === 'undefined') {
      this.measured = true; // no measuring available: keep the estimated heights
      this.cdr.markForCheck();
      return;
    }
    this.resizeObserver = new ResizeObserver(() => this.zone.run(() => this.measure()));
    this.observeNodes();
    this.nodeEls.changes.subscribe(() => this.observeNodes());
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  zoomIn(): void {
    this.zoomPan?.zoomIn();
  }

  zoomOut(): void {
    this.zoomPan?.zoomOut();
  }

  resetZoom(): void {
    this.zoomPan?.reset();
  }

  fitToView(): void {
    this.zoomPan?.fit();
  }

  setHovered(id: string | null): void {
    this.hovered = id;
    this.updateRelated();
  }

  onNodeEnter(n: KtDependencyGraphNodeView, event: Event): void {
    this.setHovered(n.id);
    if (this.showHoverText) this.showHoverCard(n, event.currentTarget as HTMLElement);
  }

  onNodeLeave(): void {
    this.setHovered(null);
    this.hoverCard = null;
  }

  /** Panning or zooming moves the node away from the card, so drop the card. */
  hideHoverCard(): void {
    this.hoverCard = null;
  }

  hoverCardId(): string {
    return `${this.uid}-hover`;
  }

  /** One arrowhead marker per distinct edge colour, plus a default one. */
  markerId(color: string | null): string {
    return color == null ? `${this.uid}-arrow` : `${this.uid}-arrow-${this.markerIndex.get(color)}`;
  }

  isSelected(id: string): boolean {
    return this.selected.has(id);
  }

  nodeClass(n: KtDependencyGraphNodeView): string {
    const rel = this.related;
    const classes = ['kdg-node'];
    if (this.isSelected(n.id)) classes.push('is-selected');
    if (rel && !rel.up.has(n.id) && !rel.down.has(n.id)) classes.push('is-dim');
    if (this.selectionMode !== 'none') classes.push('is-interactive');
    return classes.join(' ');
  }

  edgeClass(e: KtDependencyGraphEdgeView): string {
    const rel = this.related;
    const onPath = !rel || (rel.up.has(e.from) && rel.up.has(e.to)) || (rel.down.has(e.from) && rel.down.has(e.to));
    const classes = ['kdg-edge'];
    if (!onPath) classes.push('is-dim');
    if (rel && onPath) classes.push('is-active');
    return classes.join(' ');
  }

  onNodeClick(n: KtDependencyGraphNodeView): void {
    this.nodeClick.emit(n);
    const mode = this.selectionMode;
    if (mode === 'none') return;

    const next = new Set(mode === 'single' ? [] : this.selected);
    if (this.selected.has(n.id)) next.delete(n.id);
    else next.add(n.id);

    this.selected = next;
    this.selectionChange.emit([...next]);
  }

  onKey(event: Event, n: KtDependencyGraphNodeView): void {
    event.preventDefault();
    this.onNodeClick(n);
  }

  trackById(_: number, item: { id: string }): string {
    return item.id;
  }

  /**
   * Renders the card, measures it, then places it below the node — or above when there is
   * no room below — and keeps it inside the component horizontally.
   */
  private showHoverCard(n: KtDependencyGraphNodeView, nodeEl: HTMLElement): void {
    this.hoverCard = { node: n, left: 0, top: 0 };
    this.cdr.detectChanges();
    const card = this.hoverCardEl?.nativeElement;
    if (!card || !this.hoverCard) return;

    const GAP = 8;
    const EDGE = 4;
    const box = this.host.nativeElement.getBoundingClientRect();
    const r = nodeEl.getBoundingClientRect();
    const w = card.offsetWidth;
    const h = card.offsetHeight;

    const nodeTop = r.top - box.top;
    const nodeBottom = r.bottom - box.top;
    let top = nodeBottom + GAP;
    if (top + h > box.height - EDGE && nodeTop - GAP - h >= EDGE) top = nodeTop - GAP - h;

    const centred = r.left - box.left + r.width / 2 - w / 2;
    const left = Math.max(EDGE, Math.min(centred, box.width - w - EDGE));

    this.hoverCard = { node: n, left, top };
    // detectChanges() above cleared the dirty flag the event set; mark again so this renders.
    this.cdr.markForCheck();
  }

  private relayout(): void {
    this.hoverCard = null;
    const ids = new Set((this.config?.nodes ?? []).map((n) => n.id));
    this.heights.forEach((_, id) => ids.has(id) || this.heights.delete(id));
    this.model = buildModel(this.config, this.heights);
    this.markerIndex = new Map(this.model.edgeColors.map((c, i) => [c, i]));
  }

  private observeNodes(): void {
    const ro = this.resizeObserver;
    if (!ro) return;
    ro.disconnect();
    this.nodeEls.forEach((el) => ro.observe(el.nativeElement));
  }

  /** Reads rendered node heights; lays the graph out again if any changed. */
  private measure(): void {
    let changed = false;
    this.nodeEls.forEach(({ nativeElement: el }) => {
      const id = el.getAttribute('data-id');
      const h = el.offsetHeight; // layout size, unaffected by zoom transforms
      if (!id || !h) return; // 0 while hidden (e.g. display: none): keep the last value
      if (this.heights.get(id) !== h) {
        this.heights.set(id, h);
        changed = true;
      }
    });
    if (changed) {
      this.relayout();
      this.updateRelated();
    }
    if (changed || !this.measured) {
      this.measured = this.model.nodes.every((n) => this.heights.has(n.id));
      this.cdr.markForCheck();
    }
  }

  private updateRelated(): void {
    const id = this.hovered;
    this.related = id && this.highlightOnHover ? collectRelated(this.model, id) : null;
  }
}

/* ======================================================================= */
/* Layout                                                                  */
/*                                                                         */
/* Works in "flow" coordinates: the main axis runs along the edges (levels */
/* follow each other on it), the cross axis orders nodes within a level.   */
/* The result is then mapped to x/y for the configured direction.          */

interface Box {
  main: number;
  cross: number;
}

function buildModel(config: KtDependencyGraphConfig, heights: ReadonlyMap<string, number>): KtDependencyGraphModel {
  const layout: KtDependencyGraphLayout = { ...DEFAULT_LAYOUT, ...config.layout };
  const vertical = layout.direction === 'top-bottom' || layout.direction === 'bottom-top';
  const warnings: string[] = [];

  const byId = new Map<string, KtDependencyGraphNode>();
  for (const n of config.nodes ?? []) {
    if (byId.has(n.id)) {
      warnings.push(`Duplicate node id "${n.id}" ignored.`);
      continue;
    }
    byId.set(n.id, n);
  }
  const nodes = [...byId.values()];

  const preds = new Map<string, string[]>(nodes.map((n) => [n.id, []]));
  const succs = new Map<string, string[]>(nodes.map((n) => [n.id, []]));
  const edges: KtDependencyGraphEdge[] = [];
  const seen = new Set<string>();
  for (const e of config.edges ?? []) {
    const key = `${e.from}->${e.to}`;
    if (!byId.has(e.from) || !byId.has(e.to)) {
      warnings.push(`Edge ${key} references an unknown node and was ignored.`);
      continue;
    }
    if (e.from === e.to || seen.has(key)) continue;
    seen.add(key);
    edges.push(e);
    preds.get(e.to)!.push(e.from);
    succs.get(e.from)!.push(e.to);
  }

  const size = (n: KtDependencyGraphNode) => ({ width: n.width ?? layout.nodeWidth, height: heights.get(n.id) ?? ESTIMATED_HEIGHT });
  const flowSize = (n: KtDependencyGraphNode): Box => {
    const { width, height } = size(n);
    return vertical ? { main: height, cross: width } : { main: width, cross: height };
  };

  const order = topologicalOrder(nodes, preds, succs, warnings);
  const levels = assignLevels(order, byId, preds);
  const mainCenters = assignLevelPositions(nodes, levels, flowSize, layout);
  const crossCenters = assignCrossPositions(nodes, levels, preds, flowSize, layout);

  // ---- Node views (left-right / top-bottom first, mirrored below if reversed) ----
  const views: KtDependencyGraphNodeView[] = nodes.map((n) => {
    const { width, height } = size(n);
    const main = mainCenters.get(levels.get(n.id)!)!;
    const cross = crossCenters.get(n.id)!;
    const cx = vertical ? cross : main;
    const cy = vertical ? main : cross;
    const title = n.title ?? n.id;
    const subTitle = n.subTitle ?? '';

    const style = n.style ?? {};
    return {
      id: n.id,
      title,
      subTitle,
      customHtml: n.customHtml ?? null,
      badge: n.badge ?? null,
      tooltip: n.tooltip ?? [title, subTitle].filter(Boolean).join('\n'),
      css: {
        box: toCss(style, BOX_PROPS),
        title: toCss(style.title, TEXT_PROPS),
        subTitle: toCss(style.subTitle, TEXT_PROPS),
        customHtml: toCss(style.customHtml, TEXT_PROPS),
        badge: toCss(n.badge?.style, BADGE_PROPS),
      },
      level: levels.get(n.id)!,
      x: round(cx - width / 2),
      y: round(cy - height / 2),
      width,
      height,
      source: n,
    };
  });

  let width = 0;
  let height = 0;
  for (const v of views) {
    width = Math.max(width, v.x + v.width);
    height = Math.max(height, v.y + v.height);
  }
  width = Math.ceil(width + layout.padding);
  height = Math.ceil(height + layout.padding);

  if (layout.direction === 'right-left') views.forEach((v) => (v.x = round(width - v.x - v.width)));
  if (layout.direction === 'bottom-top') views.forEach((v) => (v.y = round(height - v.y - v.height)));

  // ---- Edge views ----
  const viewById = new Map(views.map((v) => [v.id, v]));
  const edgeColors: string[] = [];
  const edgeViews: KtDependencyGraphEdgeView[] = edges.map((e) => {
    const style = e.style ?? {};
    if (style.color && !edgeColors.includes(style.color)) edgeColors.push(style.color);
    return {
      id: `${e.from}->${e.to}`,
      from: e.from,
      to: e.to,
      path: curve(viewById.get(e.from)!, viewById.get(e.to)!, layout.direction),
      color: style.color ?? null,
      width: style.width ?? null,
      dashArray: style.dashed === true ? DEFAULT_DASH : style.dashed || null,
    };
  });

  return {
    nodes: views,
    edges: edgeViews,
    width,
    height,
    legend: (config.legend ?? []).map((item) => ({ label: item.label, css: toCss(item.style, SWATCH_PROPS) })),
    edgeColors,
    upstream: preds,
    downstream: succs,
    warnings,
  };
}

/* ---------- Styles: the fixed, typed properties → CSS declarations ---------- */

/** [style key, CSS property, is it a length (numbers become px)?] */
type PropMap<T> = Array<[keyof T, string, boolean]>;

const TEXT_PROPS: PropMap<KtDependencyGraphTextStyle> = [
  ['color', 'color', false],
  ['fontSize', 'font-size', true],
  ['fontWeight', 'font-weight', false],
  ['fontFamily', 'font-family', false],
  ['fontStyle', 'font-style', false],
];

const BOX_PROPS: PropMap<KtDependencyGraphBoxStyle> = [
  ['backgroundColor', 'background-color', false],
  ['borderColor', 'border-color', false],
  ['borderWidth', 'border-width', true],
  ['borderStyle', 'border-style', false],
  ['borderRadius', 'border-radius', true],
  ['boxShadow', 'box-shadow', false],
  ['padding', 'padding', true],
  ['textAlign', 'text-align', false],
];

const BADGE_PROPS: PropMap<KtDependencyGraphBadgeStyle> = [
  ...(TEXT_PROPS as PropMap<KtDependencyGraphBadgeStyle>),
  ['backgroundColor', 'background-color', false],
  ['borderColor', 'border-color', false],
  ['borderWidth', 'border-width', true],
  ['borderRadius', 'border-radius', true],
];

const SWATCH_PROPS: PropMap<KtDependencyGraphSwatchStyle> = [
  ['backgroundColor', 'background-color', false],
  ['borderColor', 'border-color', false],
  ['borderRadius', 'border-radius', true],
];

/** Only the listed keys are read, so nothing outside the typed style reaches the DOM. */
function toCss<T>(style: T | undefined, props: PropMap<T>): KtDependencyGraphCss {
  const css: KtDependencyGraphCss = {};
  if (!style) return css;
  for (const [key, property, isLength] of props) {
    const value = style[key] as unknown;
    if (value == null || value === '') continue;
    css[property] = isLength && typeof value === 'number' ? `${value}px` : String(value);
  }
  return css;
}

/** Every node upstream and downstream of `id` (inclusive). Used for hover highlighting. */
function collectRelated(model: KtDependencyGraphModel, id: string): { up: Set<string>; down: Set<string> } {
  const walk = (map: ReadonlyMap<string, readonly string[]>) => {
    const out = new Set<string>([id]);
    const stack = [id];
    while (stack.length) {
      for (const next of map.get(stack.pop()!) ?? []) {
        if (!out.has(next)) {
          out.add(next);
          stack.push(next);
        }
      }
    }
    return out;
  };
  return { up: walk(model.upstream), down: walk(model.downstream) };
}

function topologicalOrder(
  nodes: KtDependencyGraphNode[],
  preds: Map<string, string[]>,
  succs: Map<string, string[]>,
  warnings: string[],
): string[] {
  const indegree = new Map(nodes.map((n) => [n.id, preds.get(n.id)!.length]));
  const ready = nodes.filter((n) => indegree.get(n.id) === 0).map((n) => n.id);
  const out: string[] = [];
  while (ready.length) {
    const id = ready.shift()!;
    out.push(id);
    for (const s of succs.get(id)!) {
      const d = indegree.get(s)! - 1;
      indegree.set(s, d);
      if (d === 0) ready.push(s);
    }
  }
  if (out.length < nodes.length) {
    const done = new Set(out);
    const rest = nodes.filter((n) => !done.has(n.id)).map((n) => n.id);
    warnings.push(`Cycle detected involving: ${rest.join(', ')}`);
    out.push(...rest);
  }
  return out;
}

/** Sources are level 0; every other node sits one level after its furthest input. */
function assignLevels(order: string[], byId: Map<string, KtDependencyGraphNode>, preds: Map<string, string[]>): Map<string, number> {
  const level = new Map<string, number>();
  for (const id of order) {
    const n = byId.get(id)!;
    if (n.level != null) {
      level.set(id, n.level);
      continue;
    }
    const inLevels = preds.get(id)!.map((p) => level.get(p)).filter((l): l is number => l != null);
    level.set(id, inLevels.length ? Math.floor(Math.max(...inLevels)) + 1 : 0);
  }
  return level;
}

/** Centre of each level along the flow; a level is as deep as its largest node. */
function assignLevelPositions(
  nodes: KtDependencyGraphNode[],
  levels: Map<string, number>,
  flowSize: (n: KtDependencyGraphNode) => Box,
  layout: KtDependencyGraphLayout,
): Map<number, number> {
  const depth = new Map<number, number>();
  for (const n of nodes) {
    const l = levels.get(n.id)!;
    depth.set(l, Math.max(depth.get(l) ?? 0, flowSize(n).main));
  }
  const centers = new Map<number, number>();
  let start = layout.padding;
  for (const l of [...depth.keys()].sort((a, b) => a - b)) {
    const d = depth.get(l)!;
    centers.set(l, start + d / 2);
    start += d + layout.levelGap;
  }
  return centers;
}

/** Centre of each node across the flow: next to its inputs, without overlaps. */
function assignCrossPositions(
  nodes: KtDependencyGraphNode[],
  levels: Map<string, number>,
  preds: Map<string, string[]>,
  flowSize: (n: KtDependencyGraphNode) => Box,
  layout: KtDependencyGraphLayout,
): Map<string, number> {
  const buckets = new Map<number, KtDependencyGraphNode[]>();
  for (const n of nodes) {
    const l = levels.get(n.id)!;
    if (!buckets.has(l)) buckets.set(l, []);
    buckets.get(l)!.push(n);
  }

  const centers = new Map<string, number>();
  for (const l of [...buckets.keys()].sort((a, b) => a - b)) {
    const bucket = buckets.get(l)!;
    const hasOrder = bucket.some((n) => n.order != null);

    let stacked = layout.padding;
    const items = bucket.map((n, i) => {
      const placed = preds.get(n.id)!.map((p) => centers.get(p)).filter((c): c is number => c != null);
      const size = flowSize(n).cross;
      // Sit next to the inputs (median keeps one far-away input from dragging the node).
      const desired = placed.length ? median(placed) : stacked + size / 2;
      stacked += size + layout.nodeGap;
      return { n, i, desired, size };
    });

    items.sort(
      (a, b) =>
        (hasOrder ? (a.n.order ?? Infinity) - (b.n.order ?? Infinity) : 0) ||
        a.desired - b.desired ||
        a.i - b.i,
    );

    // Push nodes along just enough to avoid overlaps.
    let next = layout.padding;
    for (const it of items) {
      const c = Math.max(it.desired, next + it.size / 2);
      centers.set(it.n.id, c);
      next = c + it.size / 2 + layout.nodeGap;
    }
  }
  return centers;
}

/** Unit vector of the flow for each direction. */
const FLOW: { [d in KtDependencyGraphDirection]: [number, number] } = {
  'left-right': [1, 0],
  'right-left': [-1, 0],
  'top-bottom': [0, 1],
  'bottom-top': [0, -1],
};

/** Bezier from the source's outgoing side to the target's incoming side. */
function curve(s: KtDependencyGraphNodeView, t: KtDependencyGraphNodeView, direction: KtDependencyGraphDirection): string {
  const [dx, dy] = FLOW[direction];
  // Point on the node's border in direction (ux, uy) from its centre; `gap` keeps the arrow tip off the border.
  const anchor = (v: KtDependencyGraphNodeView, ux: number, uy: number, gap: number) => ({
    x: v.x + v.width / 2 + ux * (v.width / 2 + gap),
    y: v.y + v.height / 2 + uy * (v.height / 2 + gap),
  });
  const p1 = anchor(s, dx, dy, 0);
  const p2 = anchor(t, -dx, -dy, 1);
  const pull = Math.max(40, Math.abs(dx ? p2.x - p1.x : p2.y - p1.y) * 0.45);
  const c1 = { x: p1.x + dx * pull, y: p1.y + dy * pull };
  const c2 = { x: p2.x - dx * pull, y: p2.y - dy * pull };
  const pt = (p: { x: number; y: number }) => `${round(p.x)},${round(p.y)}`;
  return `M${pt(p1)} C${pt(c1)} ${pt(c2)} ${pt(p2)}`;
}

function median(values: number[]): number {
  const v = [...values].sort((a, b) => a - b);
  const mid = Math.floor(v.length / 2);
  return v.length % 2 ? v[mid] : (v[mid - 1] + v[mid]) / 2;
}

function round(v: number): number {
  return Math.round(v * 10) / 10;
}
