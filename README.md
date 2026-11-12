# kt-hierarch

Angular components for drawing connected data:

| Component | Use it for |
| --- | --- |
| [`<kt-hierarch>`](#hierarchy-chart-kt-hierarch) | Trees with one parent per node: org charts, reporting lines, category trees. |
| [`<kt-dependency-graph>`](#dependency-graph-kt-dependency-graph) | Graphs where a node can have several inputs: dependencies, cause and effect, pipelines, approval flows. |
| [`<kt-zoom-pan>`](#zoom-and-pan-kt-zoom-pan) | The zoom-and-drag viewport both charts use. Wrap any content in it. |

Both charts zoom (mouse wheel, trackpad pinch or buttons) and pan (drag), and both take all of
their content and styling from your data.

- **Live playground:** https://mjmaurya.github.io/kt-hierarch/
- **Repository:** https://github.com/mjmaurya/kt-hierarch
- **Minimum Angular version:** 12

### Examples

The hierarchy chart, vertical:

![Vertical hierarchy chart](https://github.com/user-attachments/assets/b6b9a93c-412f-4182-b937-61a13db6c639)

Horizontal:

![Horizontal hierarchy chart](https://github.com/user-attachments/assets/f756c636-5b9e-4b0b-aafa-166ed86bd4ac)

With custom styles:

![Custom vertical hierarchy chart](https://github.com/user-attachments/assets/85058959-b11a-449f-a0bf-a4e177db508d)

## Installation

```bash
npm install kt-hierarch
```

Import the module for each component you use:

```typescript
import { KtHierarchModule, KtDependencyGraphModule } from 'kt-hierarch';

@NgModule({
  imports: [KtHierarchModule, KtDependencyGraphModule],
})
export class AppModule {}
```

Peer dependencies: `@angular/core`, `@angular/common` and `@angular/platform-browser`, version 12.2 or later.

---

## Hierarchy chart (`<kt-hierarch>`)

```html
<kt-hierarch [data]="data" [config]="config" (nodeClick)="onNodeClick($event)"></kt-hierarch>
```

```typescript
data = {
  title: 'Aaron Loeb',
  subTitle: 'Executive Director',
  image: 'https://example.com/aaron.jpg',
  childs: [
    { title: 'Cahaya Dewi', subTitle: 'Production Manager', image: '…', childs: [] },
    { title: 'Drew Feig',   subTitle: 'Marketing Manager',  image: '…', childs: [] },
  ],
};

config = {
  orientation: 'vertical',
  node:   { backgroundColor: '#111827', titleColor: '#ffffff', subTitleColor: '#cbd5e1' },
  avatar: { width: '48px', height: '48px', borderRadius: '50%', borderWidth: '2px', borderColor: '#ffffff' },
};

onNodeClick(node: any) {
  console.log('clicked', node);
}
```

### Inputs

| Input | Type | Default | Description |
| --- | --- | --- | --- |
| `data` | `NodeModel` | | Root node of the tree. |
| `config` | `object` | | Display configuration. Partial objects are fine; see [`config`](#config). |
| `zoomable` | `boolean` | `true` | Drag to pan and zoom with the wheel or buttons. Set `false` for a static chart that scrolls normally. |
| `zoomControls` | `boolean` | `true` | Show the zoom buttons. |
| `minZoom` | `number` | `0.2` | Smallest zoom factor. |
| `maxZoom` | `number` | `3` | Largest zoom factor. |

### Outputs

| Output | Payload | Description |
| --- | --- | --- |
| `nodeClick` | the clicked node | Emitted when a node is clicked. Not emitted when the click ends a drag. |

### Methods

Get the component with `@ViewChild(KtHierarchComponent)` and call:

| Method | Description |
| --- | --- |
| `zoomIn()` / `zoomOut()` | Zoom one step around the centre of the view. |
| `resetZoom()` | Back to 100% and the starting position. |
| `fitToView()` | Shrink the chart (never past 100%) so it fits, and centre it. |

### `data`

Each node accepts:

| Property | Type | Description |
| --- | --- | --- |
| `title` | `string` | Main line of text. |
| `subTitle` | `string` | Second line of text. |
| `image` | `string` | Avatar image: any URL or `data:` URI. Leave it out and no avatar is shown. |
| `customContent` | `string` | HTML shown below the text. |
| `childs` | `NodeModel[]` | Child nodes, with the same shape, nested to any depth. |

> `customContent` is bound with `innerHTML`. Angular sanitizes it, but never pass unchecked
> user input through it.

### `config`

Every section is optional, and so is every key inside a section. Anything you leave out keeps
its default, so `{ avatar: { borderRadius: '50%' } }` changes only the corner radius.

**`orientation`**: `'vertical'` (default) or `'horizontal'`.

**`connector`**: the lines between nodes.

| Key | Default | Description |
| --- | --- | --- |
| `borderWidth` | `'1px'` | Line thickness. |
| `borderStyle` | `'solid'` | `solid`, `dashed`, `dotted`, … |
| `borderColor` | `'#d2d1d1'` | Line colour. |

**`node`**: the card around each entry.

| Key | Default | Description |
| --- | --- | --- |
| `backgroundColor` | `'#ffffff'` | Card background. |
| `borderWidth` | `'1px'` | Card border thickness. |
| `borderStyle` | `'solid'` | Card border style. |
| `borderColor` | `'#E8E8E8'` | Card border colour. |
| `titleColor` | `'#000000'` | Title text colour. Set this when using a dark background. |
| `subTitleColor` | `'#000000'` | Sub-title text colour. |
| `titleTooltip` | `false` | Show the full title as a tooltip on hover. |

**`avatar`**: the node image.

| Key | Default | Description |
| --- | --- | --- |
| `width` | `'40px'` | Avatar width. |
| `height` | `'40px'` | Avatar height. |
| `backgroundColor` | `'transparent'` | Fill behind the image, visible through transparent PNGs and inside the padding. |
| `borderWidth` | `'0px'` | Border thickness. |
| `borderStyle` | `'solid'` | `solid`, `dashed`, `dotted`, `double`, `none`. |
| `borderColor` | `'transparent'` | Border colour. |
| `borderRadius` | `'0px'` | Corner radius. Use `'50%'` for a circle. |
| `padding` | `'0px'` | Gap between the border and the image. |
| `objectFit` | `'cover'` | How the image fills the box: `cover`, `contain`, `fill`, `none`. |
| `boxShadow` | `'none'` | Any CSS shadow value. |

The avatar's `width` and `height` include the border and padding, so a 48px avatar with a 2px
border and 2px padding leaves 40px for the image.

The config is applied again whenever the `config` input changes, so you can bind it to live form
controls. Changing the object in place is not detected: replace it, or use a getter that returns
a new object.

### Size

The chart fills the height of its container, and you drag to reach anything outside it. If the
container has no set height, the chart is as tall as its content.

---

## Dependency graph (`<kt-dependency-graph>`)

<img width="1408" height="950" alt="image" src="https://github.com/user-attachments/assets/f5873443-83fd-4dd0-9793-882f0e7c5cb6" />



Draws nodes connected by arrows and lays them out in levels: nodes with no inputs come first,
and every other node sits one level after its furthest input. The component handles layout,
hover, selection and zoom. The text and look of every node, edge and badge come from your data.

```html
<kt-dependency-graph
  [config]="config"
  selectionMode="multiple"
  (nodeClick)="onNodeClick($event)"
  (selectionChange)="selected = $event"
></kt-dependency-graph>
```

```typescript
import { KtDependencyGraphConfig, KtDependencyGraphNodeView } from 'kt-hierarch';

config: KtDependencyGraphConfig = {
  layout: { direction: 'left-right' },
  nodes: [
    { id: 'sensor', title: 'Pressure sensor', subTitle: 'Tank 2 · 8.4 d',
      style: { backgroundColor: '#fbe3e4', borderColor: '#d9464b', borderRadius: 999 } },
    { id: 'vote', title: '2 of 3', subTitle: 'voting', width: 80,
      style: { textAlign: 'center', title: { fontWeight: 700 } } },
    { id: 'pump', title: 'Pump 1 trip', subTitle: 'Equipment',
      customHtml: '<small>Last reading 2 min ago</small>',
      badge: { text: 'NEW', position: 'bottom-right' } },
  ],
  edges: [
    { from: 'sensor', to: 'vote', style: { color: '#d23f3f', width: 2 } },
    { from: 'vote', to: 'pump', style: { dashed: true } },
  ],
  selectedIds: ['pump'],
};

onNodeClick(node: KtDependencyGraphNodeView) {
  console.log(node.id, node.source.data);
}
```

### Inputs

| Input | Type | Default | Description |
| --- | --- | --- | --- |
| `config` | `KtDependencyGraphConfig` | | Nodes, edges, layout, legend and the starting selection. See [`config`](#config-1). |
| `selectionMode` | `'none' \| 'single' \| 'multiple'` | `'multiple'` | How clicks select nodes. `'none'` turns selection off but still emits `nodeClick`. |
| `highlightOnHover` | `boolean` | `true` | When a node is hovered, fade everything that isn't upstream or downstream of it. |
| `showHoverText` | `boolean` | `false` | When a node is hovered or focused, show a card with its full title, sub-title and custom HTML. See [Hover text](#hover-text). |
| `nodeTemplate` | `TemplateRef` | `null` | Your own template for the inside of every node. See [Custom node template](#custom-node-template). |
| `zoomable` | `boolean` | `true` | Drag to pan and zoom with the wheel or buttons. Set `false` to scroll the graph instead. |
| `zoomControls` | `boolean` | `true` | Show the zoom buttons. |
| `minZoom` | `number` | `0.2` | Smallest zoom factor. |
| `maxZoom` | `number` | `3` | Largest zoom factor. |

### Outputs

| Output | Payload | Description |
| --- | --- | --- |
| `nodeClick` | `KtDependencyGraphNodeView` | Emitted when a node is clicked, or when Enter or Space is pressed on it. Not emitted when the click ends a drag. `source` holds your original node, including `data`. |
| `selectionChange` | `string[]` | The selected node ids after each change. |

### Methods

Get the component with `@ViewChild(KtDependencyGraphComponent)` and call `zoomIn()`, `zoomOut()`,
`resetZoom()` or `fitToView()`. They work the same as on the [hierarchy chart](#methods).

### `config`

| Key | Type | Description |
| --- | --- | --- |
| `nodes` | `KtDependencyGraphNode[]` | The nodes. Ids must be unique. |
| `edges` | `KtDependencyGraphEdge[]` | The arrows, from `from` to `to`. |
| `layout` | `Partial<KtDependencyGraphLayout>` | Direction and spacing. See [Layout](#layout). |
| `legend` | `KtDependencyGraphLegendItem[]` | Optional legend shown under the graph. |
| `selectedIds` | `string[]` | Nodes selected when the config is first shown. |

### Nodes

| Property | Type | Description |
| --- | --- | --- |
| `id` | `string` | Unique id, used by edges. Required. |
| `title` | `string` | Main line of text. Defaults to the id. |
| `subTitle` | `string` | Second line of text. |
| `customHtml` | `string \| SafeHtml` | Extra content shown below the sub-title. See [Custom HTML](#custom-html). |
| `badge` | `KtDependencyGraphBadge` | A small label in one corner of the node. See [Badges](#badges). |
| `style` | `KtDependencyGraphNodeStyle` | How the node looks. See [Styles](#styles). |
| `tooltip` | `string` | Browser tooltip and screen-reader label. Defaults to the title and sub-title. The tooltip is not shown when `showHoverText` is on. |
| `width` | `number` | Width in px for this node. Defaults to `layout.nodeWidth`. |
| `level` | `number` | Put the node in this level (0 is the first) instead of the one worked out from its inputs. |
| `order` | `number` | Position within its level. Nodes are otherwise placed next to their inputs. |
| `data` | `unknown` | Anything you want back in `nodeClick` or a custom template, as `node.source.data`. |

There is no height setting: each node is as tall as its content. The graph measures the nodes
after they render, lays them out, and measures again whenever their content changes.

### Edges

| Property | Type | Description |
| --- | --- | --- |
| `from` | `string` | Id of the node the arrow starts at. |
| `to` | `string` | Id of the node the arrow points to. |
| `style` | `KtDependencyGraphEdgeStyle` | `color`, `width` and `dashed`. See [Styles](#styles). |

### Layout

| Key | Default | Description |
| --- | --- | --- |
| `direction` | `'left-right'` | Which way the arrows flow: `'left-right'`, `'right-left'`, `'top-bottom'` or `'bottom-top'`. |
| `nodeWidth` | `172` | Default node width in px. |
| `levelGap` | `120` | Space between two levels, along the flow. |
| `nodeGap` | `16` | Space between two nodes in the same level. |
| `padding` | `24` | Space around the whole graph. |

### Styles

Styles use a fixed set of camelCase properties; nothing else is read. Lengths accept a number
(px) or a CSS string such as `'0.5rem'` or `'50%'`.

**Node style** (`KtDependencyGraphNodeStyle`): the box, plus a separate text style for each part
of the content.

```typescript
style: {
  backgroundColor: '#fbe3e4',
  borderColor: '#d9464b',
  borderWidth: 1.5,
  borderStyle: 'solid',        // solid | dashed | dotted | double | none
  borderRadius: 4,
  boxShadow: '0 0 0 3px #fbe3e4',
  padding: 8,
  textAlign: 'center',         // left | center | right
  title:      { color: '#111827', fontSize: 13, fontWeight: 600 },
  subTitle:   { color: '#5b616b', fontSize: 11.5 },
  customHtml: { color: '#5b616b', fontSize: 12, fontStyle: 'italic' },
}
```

**Text style** (for `title`, `subTitle` and `customHtml`): `color`, `fontSize`, `fontWeight`
(`number`, `'normal'` or `'bold'`), `fontFamily`, `fontStyle` (`'normal'` or `'italic'`).

**Badge style**: `backgroundColor`, `color`, `borderColor`, `borderWidth`, `borderRadius`,
`fontSize`, `fontWeight`, `fontFamily`, `fontStyle`.

**Edge style**:

| Key | Default | Description |
| --- | --- | --- |
| `color` | grey | Line and arrowhead colour. |
| `width` | `1.6` | Line width in px. |
| `dashed` | `false` | `true` for the default dash, or an SVG dash pattern such as `'2 3'`. |

**Legend swatch style**: `backgroundColor`, `borderColor`, `borderRadius`.

```typescript
legend: [
  { label: 'Critical', style: { backgroundColor: '#fbe3e4', borderColor: '#d9464b' } },
  { label: 'OK',       style: { backgroundColor: '#e7f6eb', borderColor: '#3ea35c' } },
]
```

### Badges

```typescript
badge: { text: 'NEW', position: 'bottom-right', style: { backgroundColor: '#d9464b' } }
```

`position` is one of `'top-left'`, `'top-right'` (default), `'bottom-left'` or `'bottom-right'`.
The badge sits inside that corner of the node, so on a short node it can cover the text. Give
the node some `padding`, or pick another corner.

### Custom HTML

`customHtml` is shown below the sub-title. Angular sanitizes it, which removes scripts and
`style` attributes. To keep inline styles in HTML you trust, pass it through
`DomSanitizer.bypassSecurityTrustHtml()` first. Never do that with user input.

### Hover text

Long titles and sub-titles are cut off with "…" inside the node. With `showHoverText`, hovering
or focusing a node shows a card with the full text, in the same order as the node: title,
sub-title, then custom HTML.

```html
<kt-dependency-graph [config]="config" [showHoverText]="true"></kt-dependency-graph>
```

- **Position:** the card appears below the node, or above it when there's no room below, and
  stays inside the graph's area. It isn't affected by the zoom level.
- **Hiding:** the card disappears when the pointer leaves the node, or when you start dragging
  or zooming.
- **Tooltip:** the browser's own tooltip is turned off while the card is in use, so they never
  both show.

### Selection

Clicking a node selects it (`'single'`) or toggles it (`'multiple'`). Selected nodes get a dark
outline, and `selectionChange` emits the new list of ids.

The selection starts over from `config.selectedIds` every time a new config arrives. To keep
the user's selection when you update the data, store what `selectionChange` emits and pass it
back as `selectedIds`.

### Updating the data

The graph only notices a new `config` object; changing the existing one in place is not
detected. Make a copy with your change:

```typescript
this.config = {
  ...this.config,
  nodes: this.config.nodes.map((n) => (n.id === 'pump' ? { ...n, subTitle: 'Tripped' } : n)),
};
```

### Custom node template

To render the inside of every node yourself, pass a template. It receives the node view and
whether the node is selected. The box, its `style` and the badge are still drawn by the graph.

```html
<kt-dependency-graph [config]="config" [nodeTemplate]="node"></kt-dependency-graph>

<ng-template #node let-node let-selected="selected">
  <strong>{{ node.title }}</strong>
  <span *ngIf="selected">✓</span>
  <small>{{ node.subTitle }}</small>
</ng-template>
```

`node.source.data` is typed `unknown`; read it through a method or pipe in your component that
casts it to your own type.

### Content below the graph

Anything you put between the tags is shown under the legend, for example a details panel:

```html
<kt-dependency-graph [config]="config" (nodeClick)="picked = $event">
  <p *ngIf="picked">{{ picked.title }}</p>
</kt-dependency-graph>
```

### Problems in the data

Problems are reported with `console.warn` and do not stop the graph from drawing:

- A node id used twice: the later node is skipped.
- An edge to or from an unknown id: the edge is skipped.
- A cycle (A → B → A): the nodes in it are still drawn, but the levels may look wrong. The
  layout is meant for graphs without cycles.

### Theme

Set these CSS variables on the element or on any parent to change the defaults for every graph.
Anything set in a node's or edge's `style` takes priority.

```css
kt-dependency-graph {
  --kt-dependency-graph-node-bg: #111827;
  --kt-dependency-graph-edge-color: #60a5fa;
}
```

| Variable | Default | Used for |
| --- | --- | --- |
| `--kt-dependency-graph-font` | `Inter, system-ui, …` | Font for all text. |
| `--kt-dependency-graph-text` | `#1f2328` | Title text. |
| `--kt-dependency-graph-text-muted` | `#5b616b` | Sub-title and legend text. |
| `--kt-dependency-graph-node-bg` | `#ffffff` | Node background. |
| `--kt-dependency-graph-node-border` | `#d0d5dd` | Node border. |
| `--kt-dependency-graph-node-radius` | `6px` | Node corner radius. |
| `--kt-dependency-graph-edge-color` | `#98a2b3` | Edges without a `color`. |
| `--kt-dependency-graph-selected` | `#111827` | Outline of selected nodes. |
| `--kt-dependency-graph-focus` | `#3a6ee6` | Keyboard focus ring. |
| `--kt-dependency-graph-badge-bg` | `#2f55d4` | Badge background. |
| `--kt-dependency-graph-badge-text` | `#ffffff` | Badge text. |
| `--kt-dependency-graph-hover-bg` | `#ffffff` | Hover card background. |
| `--kt-dependency-graph-hover-border` | `#d0d5dd` | Hover card border. |
| `--kt-dependency-graph-hover-text` | `#1f2328` | Hover card title and custom HTML. |
| `--kt-dependency-graph-hover-muted` | `#5b616b` | Hover card sub-title. |

### Size

The graph fills the height of its container, with the legend below it. If the container has
no set height, the graph is as tall as its content.

### Types

Everything is exported from `kt-hierarch`: `KtDependencyGraphConfig`, `KtDependencyGraphNode`,
`KtDependencyGraphEdge`, `KtDependencyGraphLayout`, `KtDependencyGraphDirection`,
`KtDependencyGraphNodeStyle`, `KtDependencyGraphTextStyle`, `KtDependencyGraphBadge`,
`KtDependencyGraphBadgeStyle`, `KtDependencyGraphBadgePosition`, `KtDependencyGraphEdgeStyle`,
`KtDependencyGraphLegendItem`, `KtDependencyGraphNodeView` and `KtDependencyGraphNodeContext`.

---

## Zoom and pan (`<kt-zoom-pan>`)

Both charts zoom and pan the same way:

- **Drag** anywhere to move the content. A drag that starts on a node does not click it.
- **Mouse wheel** or **trackpad pinch** zooms around the pointer.
- **Buttons** in the bottom-right corner: zoom in, zoom out, the current zoom (click it to go
  back to 100%) and fit to view.

To use it on your own content, import `KtZoomPanModule`:

```html
<kt-zoom-pan style="height: 400px" [maxZoom]="4" (zoomChange)="zoom = $event">
  <img src="floor-plan.svg" />
</kt-zoom-pan>
```

| Input | Default | Description |
| --- | --- | --- |
| `disabled` | `false` | Turn zoom, pan and the buttons off. The content then scrolls normally. |
| `minZoom` | `0.2` | Smallest zoom factor. |
| `maxZoom` | `3` | Largest zoom factor. |
| `showControls` | `true` | Show the zoom buttons. |
| `wheelZoom` | `true` | Zoom with the mouse wheel and trackpad pinch. |

| Output | Payload | Description |
| --- | --- | --- |
| `zoomChange` | `number` | The new zoom factor. |
| `panStart` | none | Emitted once when a press turns into a drag. |

Methods: `zoomIn()`, `zoomOut()`, `reset()`, `fit()`.

Give the viewport a height, or put it in a container that has one. Without that it is as tall
as its content.

| Variable | Default | Used for |
| --- | --- | --- |
| `--kt-zoom-padding` | `0` | Space around the content inside the viewport, e.g. `48px 24px`. |
| `--kt-zp-bg` | `#ffffff` | Button panel background. |
| `--kt-zp-border` | `#d0d5dd` | Button panel border. |
| `--kt-zp-text` | `#1f2328` | Button icons and zoom level. |
| `--kt-zp-hover` | `#f2f4f7` | Button hover background. |

## Playground and local development

The demo app in this repo is an interactive playground with one tab per chart. Edit the data,
try every style and layout option, and copy the resulting config as JSON into your own app.
The published version is at https://mjmaurya.github.io/kt-hierarch/.

```bash
npm install
npm run build                 # builds the library; the demo uses dist/, so do this first
npm start                     # http://localhost:4200
```

The `npm` scripts already set `NODE_OPTIONS=--openssl-legacy-provider`, which webpack needs on
Node 17 and later. If you run `npx ng …` directly, prefix it yourself, for example
`NODE_OPTIONS=--openssl-legacy-provider npx ng serve kt-hierarch-demo`.

While working on the library, run the two halves in separate terminals so library changes
reach the demo automatically:

```bash
npm run watch                 # rebuilds dist/ on every change
npm start                     # reloads whenever dist/ changes
```

> **Build the library before serving the demo.** The workspace also lists the published
> `kt-hierarch` package as a dependency, so after `npm install` it sits in `node_modules`. If
> `dist/` is missing, the demo quietly compiles against that published version instead of
> your local code.

> **Restart `npm start` after a full library build.** `npm run build` deletes
> and recreates `dist/`, and a running dev server does not always recover from that. `npm run
> watch` doesn't have this problem.

> **Editor errors in `tsconfig.json`:** VS Code's built-in TypeScript is newer than the
> project's (4.3) and reports some of its options as deprecated. `.vscode/settings.json` points
> VS Code at the project's own TypeScript; accept the prompt, or run
> **TypeScript: Select TypeScript Version → Use Workspace Version**.

## License

MIT
