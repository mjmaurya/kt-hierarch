import { SafeHtml } from '@angular/platform-browser';

/**
 * Data model for <kt-dependency-graph>.
 *
 * The component only lays the graph out (levels, ordering, edge curves) and handles
 * hover / selection. Node height follows the content; it is measured after render.
 * What a node says and how it looks comes from the consumer through `title`, `subTitle`,
 * `customHtml`, `badge` and `style` (or a full `nodeTemplate`).
 *
 * Styles use a fixed set of camelCase properties. Lengths accept a number (px) or a
 * CSS string ('0.5rem', '50%').
 */

/** A length: a number is taken as px, a string is used as is. */
export type KtDependencyGraphLength = number | string;

export type KtDependencyGraphBorderStyle = 'solid' | 'dashed' | 'dotted' | 'double' | 'none';

export interface KtDependencyGraphTextStyle {
  color?: string;
  fontSize?: KtDependencyGraphLength;
  fontWeight?: number | 'normal' | 'bold';
  fontFamily?: string;
  fontStyle?: 'normal' | 'italic';
}

export interface KtDependencyGraphBoxStyle {
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: KtDependencyGraphLength;
  borderStyle?: KtDependencyGraphBorderStyle;
  borderRadius?: KtDependencyGraphLength;
  boxShadow?: string;
  padding?: KtDependencyGraphLength;
  textAlign?: 'left' | 'center' | 'right';
}

/** Node box style, with separate text styles for each part of the content. */
export interface KtDependencyGraphNodeStyle extends KtDependencyGraphBoxStyle {
  title?: KtDependencyGraphTextStyle;
  subTitle?: KtDependencyGraphTextStyle;
  customHtml?: KtDependencyGraphTextStyle;
}

export interface KtDependencyGraphBadgeStyle extends KtDependencyGraphTextStyle {
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: KtDependencyGraphLength;
  borderRadius?: KtDependencyGraphLength;
}

export interface KtDependencyGraphEdgeStyle {
  /** Line and arrow colour. Defaults to the --kt-dependency-graph-edge-color CSS variable. */
  color?: string;
  /** Stroke width in px. Default 1.6. */
  width?: number;
  /** true for the default dash, or an SVG dash array such as '2 3'. */
  dashed?: boolean | string;
}

export interface KtDependencyGraphSwatchStyle {
  backgroundColor?: string;
  borderColor?: string;
  borderRadius?: KtDependencyGraphLength;
}

export type KtDependencyGraphBadgePosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface KtDependencyGraphBadge {
  text: string;
  /** Corner of the node the badge sits in. Default 'top-right'. */
  position?: KtDependencyGraphBadgePosition;
  style?: KtDependencyGraphBadgeStyle;
}

export interface KtDependencyGraphNode {
  /** Unique id, referenced by edges. */
  id: string;
  /** Main text. Defaults to the id. */
  title?: string;
  subTitle?: string;
  /**
   * Extra content rendered below the sub-title. Angular sanitizes it, which strips
   * `style` attributes and scripts; pass a SafeHtml (DomSanitizer.bypassSecurityTrustHtml)
   * for trusted markup that needs inline styles.
   */
  customHtml?: string | SafeHtml;
  badge?: KtDependencyGraphBadge;

  style?: KtDependencyGraphNodeStyle;
  /** Hover text. Defaults to title + subTitle. */
  tooltip?: string;

  /** Width override for this node; defaults to layout.nodeWidth. Height always follows the content. */
  width?: number;
  /** Level override (0 = first). By default a node sits one level after its furthest input. */
  level?: number;
  /** Explicit order within its level (top-to-bottom, or left-to-right for vertical flows). */
  order?: number;

  /** Anything you want back in nodeClick / custom templates. */
  data?: unknown;
}

export interface KtDependencyGraphEdge {
  from: string;
  to: string;
  style?: KtDependencyGraphEdgeStyle;
}

/** Which way edges flow: 'left-right' puts sources on the left, 'top-bottom' at the top, … */
export type KtDependencyGraphDirection = 'left-right' | 'right-left' | 'top-bottom' | 'bottom-top';

export interface KtDependencyGraphLayout {
  /** Default 'left-right'. */
  direction: KtDependencyGraphDirection;
  nodeWidth: number;
  /** Space between two levels (along the flow). */
  levelGap: number;
  /** Space between two nodes in the same level (across the flow). */
  nodeGap: number;
  padding: number;
}

export interface KtDependencyGraphLegendItem {
  label: string;
  /** Style of the small swatch in front of the label. */
  style?: KtDependencyGraphSwatchStyle;
}

export interface KtDependencyGraphConfig {
  nodes: KtDependencyGraphNode[];
  edges: KtDependencyGraphEdge[];
  layout?: Partial<KtDependencyGraphLayout>;
  /** Optional legend shown under the graph. */
  legend?: KtDependencyGraphLegendItem[];
  /** Initially selected node ids. */
  selectedIds?: string[];
}

/* ---------- View model produced by the layout ---------- */

/** Resolved CSS declarations, ready for [ngStyle]. */
export interface KtDependencyGraphCss {
  [property: string]: string;
}

export interface KtDependencyGraphNodeView {
  id: string;
  title: string;
  subTitle: string;
  customHtml: string | SafeHtml | null;
  badge: KtDependencyGraphBadge | null;
  tooltip: string;
  /** CSS for the box, title, sub-title, custom HTML and badge, resolved from `source.style`. */
  css: { box: KtDependencyGraphCss; title: KtDependencyGraphCss; subTitle: KtDependencyGraphCss; customHtml: KtDependencyGraphCss; badge: KtDependencyGraphCss };
  level: number;
  x: number;
  y: number;
  width: number;
  height: number;
  source: KtDependencyGraphNode;
}

export interface KtDependencyGraphEdgeView {
  id: string;
  from: string;
  to: string;
  path: string;
  color: string | null;
  width: number | null;
  dashArray: string | null;
}

export interface KtDependencyGraphModel {
  nodes: KtDependencyGraphNodeView[];
  edges: KtDependencyGraphEdgeView[];
  width: number;
  height: number;
  legend: Array<{ label: string; css: KtDependencyGraphCss }>;
  /** Distinct custom edge colours, one arrowhead marker each. */
  edgeColors: string[];
  upstream: ReadonlyMap<string, readonly string[]>;
  downstream: ReadonlyMap<string, readonly string[]>;
  warnings: string[];
}

/** Context for a custom node template: `<ng-template let-node let-selected="selected">`. */
export interface KtDependencyGraphNodeContext {
  $implicit: KtDependencyGraphNodeView;
  selected: boolean;
}
