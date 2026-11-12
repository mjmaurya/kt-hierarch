import { Component } from '@angular/core';
import {
  KtDependencyGraphBadgePosition,
  KtDependencyGraphBadgeStyle,
  KtDependencyGraphBoxStyle,
  KtDependencyGraphConfig,
  KtDependencyGraphDirection,
  KtDependencyGraphEdge,
  KtDependencyGraphNode,
  KtDependencyGraphNodeView,
  KtDependencyGraphTextStyle,
} from 'kt-hierarch';

import { SAMPLE_GRAPH } from './dependency-graph-sample';

type SelectionMode = 'none' | 'single' | 'multiple';
type TextPart = 'title' | 'subTitle' | 'customHtml';

@Component({
  selector: 'app-dependency-graph-playground',
  templateUrl: './dependency-graph-playground.component.html',
  styleUrls: ['../playground.css', './dependency-graph-playground.component.css'],
})
export class DependencyGraphPlaygroundComponent {
  readonly badgePositions: KtDependencyGraphBadgePosition[] = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
  readonly directions: KtDependencyGraphDirection[] = ['left-right', 'right-left', 'top-bottom', 'bottom-top'];
  readonly textParts: Array<{ key: TextPart; label: string; color: string; size: number }> = [
    { key: 'title', label: 'Title', color: '#1f2328', size: 13 },
    { key: 'subTitle', label: 'Sub-title', color: '#5b616b', size: 11.5 },
    { key: 'customHtml', label: 'Custom HTML', color: '#1f2328', size: 12 },
  ];

  /* ---------- graph data (edited in place, then handed over as a fresh config) ---------- */
  nodes: KtDependencyGraphNode[] = [];
  edges: KtDependencyGraphEdge[] = [];

  layout = {
    direction: 'left-right' as KtDependencyGraphDirection,
    nodeWidth: 172,
    levelGap: 120,
    nodeGap: 16,
  };

  selectionMode: SelectionMode = 'multiple';
  highlightOnHover = true;
  showHoverText = true;
  showLegend = true;
  zoomControls = true;

  selectedIds: string[] = [];
  active: KtDependencyGraphNode | null = null;
  copied = false;

  config!: KtDependencyGraphConfig;

  constructor() {
    this.reset();
  }

  /** Builds a new config object so <kt-dependency-graph> picks up the change (it reacts to new references). */
  rebuild(): void {
    this.config = {
      nodes: this.nodes.map((n) => JSON.parse(JSON.stringify(n))),
      edges: this.edges.map((e) => ({ ...e })),
      selectedIds: [...this.selectedIds],
      legend: this.showLegend ? SAMPLE_GRAPH.legend : [],
      layout: {
        direction: this.layout.direction,
        nodeWidth: Number(this.layout.nodeWidth),
        levelGap: Number(this.layout.levelGap),
        nodeGap: Number(this.layout.nodeGap),
      },
    };
  }

  reset(): void {
    const sample: KtDependencyGraphConfig = JSON.parse(JSON.stringify(SAMPLE_GRAPH));
    this.nodes = sample.nodes;
    this.edges = sample.edges;
    this.selectedIds = sample.selectedIds || [];
    this.active = null;
    this.rebuild();
  }

  /* ---------- graph events ---------- */
  onNodeClick(view: KtDependencyGraphNodeView): void {
    this.active = this.nodes.find((n) => n.id === view.id) || null;
  }

  onSelectionChange(ids: string[]): void {
    // Kept so the selection survives the next rebuild().
    this.selectedIds = ids;
  }

  clearSelection(): void {
    this.selectedIds = [];
    this.rebuild();
  }

  /* ---------- node content ---------- */
  setCustomHtml(html: string): void {
    if (!this.active) return;
    this.active.customHtml = html.trim() ? html : undefined;
    this.rebuild();
  }

  get customHtmlText(): string {
    const html = this.active && this.active.customHtml;
    return typeof html === 'string' ? html : '';
  }

  /* ---------- node style ---------- */
  boxValue(key: keyof KtDependencyGraphBoxStyle, fallback: string | number): string | number {
    const value = this.active && this.active.style && this.active.style[key];
    return value == null ? fallback : value;
  }

  setBox(key: keyof KtDependencyGraphBoxStyle, value: string | number): void {
    if (!this.active) return;
    this.active.style = { ...this.active.style, [key]: value };
    this.rebuild();
  }

  textValue(part: TextPart, key: keyof KtDependencyGraphTextStyle, fallback: string | number): string | number {
    const text = this.active && this.active.style && this.active.style[part];
    const value = text && text[key];
    return value == null ? fallback : value;
  }

  setText(part: TextPart, key: keyof KtDependencyGraphTextStyle, value: string | number): void {
    if (!this.active) return;
    const style = this.active.style || {};
    this.active.style = { ...style, [part]: { ...style[part], [key]: value } };
    this.rebuild();
  }

  /** Radius slider value; a string radius like '50%' shows as 30 (the slider max). */
  get radius(): number {
    const r = this.boxValue('borderRadius', 6);
    return typeof r === 'number' ? Math.min(r, 30) : 30;
  }

  /* ---------- badge ---------- */
  setBadgeText(text: string): void {
    if (!this.active) return;
    this.active.badge = text ? { ...this.active.badge, text } : undefined;
    this.rebuild();
  }

  setBadgePosition(position: KtDependencyGraphBadgePosition): void {
    if (!this.active || !this.active.badge) return;
    this.active.badge = { ...this.active.badge, position };
    this.rebuild();
  }

  badgeStyleValue(key: keyof KtDependencyGraphBadgeStyle, fallback: string): string | number {
    const badge = this.active && this.active.badge;
    const value = badge && badge.style && badge.style[key];
    return value == null ? fallback : value;
  }

  setBadgeStyle(key: keyof KtDependencyGraphBadgeStyle, value: string): void {
    if (!this.active || !this.active.badge) return;
    this.active.badge = { ...this.active.badge, style: { ...this.active.badge.style, [key]: value } };
    this.rebuild();
  }

  /* ---------- export ---------- */
  get exported(): string {
    return JSON.stringify(this.config, null, 2);
  }

  copyExport(): void {
    const write = navigator.clipboard && navigator.clipboard.writeText(this.exported);
    if (write) {
      write.then(() => {
        this.copied = true;
        setTimeout(() => (this.copied = false), 1500);
      });
    }
  }
}
