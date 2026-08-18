# kt-hierarch

An Angular component for rendering hierarchical data — org charts, reporting lines, category
trees — with zoom, pan, and full control over how nodes, connectors, and avatars look.

- **Minimum Angular version:** 12
- **Repository:** https://github.com/mjmaurya/kt-hierarch

## Installation

```bash
npm install kt-hierarch
```

Import the module where you need the chart:

```typescript
import { KtHierarchModule } from 'kt-hierarch';

@NgModule({
  imports: [KtHierarchModule],
})
export class AppModule {}
```

## Usage

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

## Inputs

| Input | Type | Description |
| --- | --- | --- |
| `data` | `NodeModel` | Root node of the tree. |
| `config` | `object` | Display configuration. Partial objects are fine — see below. |

### `data`

Each node accepts:

| Property | Type | Description |
| --- | --- | --- |
| `title` | `string` | Primary line of text. |
| `subTitle` | `string` | Secondary line of text. |
| `image` | `string` | Avatar image — any URL or `data:` URI. Omit it and no avatar is rendered. |
| `customContent` | `string` | Raw HTML rendered below the text. |
| `childs` | `NodeModel[]` | Child nodes, same shape, nested to any depth. |

> `customContent` is bound with `innerHTML`. Angular sanitizes it, but never pass unsanitized
> user input through it.

### `config`

Every section is optional, and so is every key inside a section — anything you leave out keeps
its default, so `{ avatar: { borderRadius: '50%' } }` changes only the corner radius.

**`orientation`** — `'vertical'` (default) or `'horizontal'`.

**`connector`** — the lines between nodes.

| Key | Default | Description |
| --- | --- | --- |
| `borderWidth` | `'1px'` | Thickness of the connector line. |
| `borderStyle` | `'solid'` | `solid`, `dashed`, `dotted`, … |
| `borderColor` | `'#d2d1d1'` | Line color. |

**`node`** — the card around each entry.

| Key | Default | Description |
| --- | --- | --- |
| `backgroundColor` | `'#ffffff'` | Card background. |
| `borderWidth` | `'1px'` | Card border thickness. |
| `borderStyle` | `'solid'` | Card border style. |
| `borderColor` | `'#E8E8E8'` | Card border color. |
| `titleColor` | `'#000000'` | Title text color — set this when using a dark background. |
| `subTitleColor` | `'#000000'` | Subtitle text color. |
| `titleTooltip` | `false` | Show the full title as a native tooltip on hover. |

**`avatar`** — the node image.

| Key | Default | Description |
| --- | --- | --- |
| `width` | `'40px'` | Avatar width. |
| `height` | `'40px'` | Avatar height. |
| `backgroundColor` | `'transparent'` | Fill behind the image — visible through transparent PNGs and inside the padding. |
| `borderWidth` | `'0px'` | Border thickness. |
| `borderStyle` | `'solid'` | `solid`, `dashed`, `dotted`, `double`, `none`. |
| `borderColor` | `'transparent'` | Border color. |
| `borderRadius` | `'0px'` | Corner radius — use `'50%'` for a circle. |
| `padding` | `'0px'` | Gap between the border and the image. |
| `objectFit` | `'cover'` | How the image fills the box: `cover`, `contain`, `fill`, `none`. |
| `boxShadow` | `'none'` | Any CSS shadow value. |

Avatars are sized with `box-sizing: border-box`, so `width`/`height` include the border and
padding — a 48px avatar with a 2px border and 2px padding leaves 40px of image.

```typescript
// circular avatar with a white ring
avatar: {
  width: '48px',
  height: '48px',
  borderRadius: '50%',
  borderWidth: '2px',
  borderStyle: 'solid',
  borderColor: '#ffffff',
  backgroundColor: '#ffffff',
  padding: '2px',
  objectFit: 'cover',
}
```

Config is re-applied whenever the `config` input changes, so it can be bound to live form
controls. Mutating the object in place will not be detected — replace it, or use a getter that
returns a fresh object.

## Outputs

| Output | Payload | Description |
| --- | --- | --- |
| `nodeClick` | the clicked node | Emitted when any node is clicked. Use it to select, expand, or open a detail view. |

## Interaction

Zoom and pan are built in: the mouse wheel zooms between 0.2× and 2×, and dragging pans the
chart.

## License

MIT
