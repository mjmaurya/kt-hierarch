# kt-hierarch

## Overview

`kt-hierarch` is an Angular module designed to create and manage hierarchical structures in your Angular applications. It provides a flexible way to display and manipulate hierarchical data, making it ideal for applications that require tree views or nested structures.

🔗 **[Live Playground / Demo](https://mjmaurya.github.io/kt-hierarch/)**

### Minimum Angular Version

- **Angular 12**

## Installation

To install the `kt-hierarch` module, you can use npm:

```bash
npm install kt-hierarch
```

## Importing the Module

After installation, import the `KtHierarchModule` into your Angular application module:

```typescript
import { KtHierarchModule } from 'kt-hierarch';

@NgModule({
  declarations: [
    // your components
  ],
  imports: [
    KtHierarchModule,
    // other modules
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

## Jump To Examples
#### Default Vertical Orientation chart

![example1](https://github.com/user-attachments/assets/b6b9a93c-412f-4182-b937-61a13db6c639)

#### Default Horizontal Orientation chart

![example2](https://github.com/user-attachments/assets/f756c636-5b9e-4b0b-aafa-166ed86bd4ac)

#### Custom Vertical Orientation chart

![example3](https://github.com/user-attachments/assets/85058959-b11a-449f-a0bf-a4e177db508d)



## Playground

The demo app in this repo is an interactive playground — build a hierarchy, swap avatar
images, tune every style option, and copy the resulting `config`/`data` JSON straight into
your own app:

```bash
npm install
npx ng build kt-hierarch          # the demo consumes dist/, so build the library first
npx ng serve kt-hierarch-demo     # http://localhost:4200
```

While developing the library itself, run the two halves in separate terminals so lib edits
reach the demo automatically:

```bash
npx ng build kt-hierarch --watch --configuration development   # rebuilds dist/ on every change
npx ng serve kt-hierarch-demo                                  # reloads whenever dist/ changes
```

> **Node 17+**: webpack hashes with md4, which OpenSSL 3 rejects, so every build above needs
> `NODE_OPTIONS=--openssl-legacy-provider` prefixed — e.g.
> `NODE_OPTIONS=--openssl-legacy-provider npx ng serve kt-hierarch-demo`.

> **After `npm install`**: the workspace lists `kt-hierarch` as a dependency, so the published
> package lands in `node_modules` and acts as a fallback for the `kt-hierarch` import. Always
> build the library before serving the demo — otherwise, with `dist/` missing, the demo
> silently compiles against the published version instead of your local source.

## Usage

### Component Setup

To use the hierarchy component, add the following in your template:

```html
<kt-hierarch [data]="hierarchicalData" [config]="hierarchyConfig" (nodeClick)="onnodeClick($event)"></kt-hierarch>
```

### Input Properties

- **data**: An array of objects representing the hierarchical structure. Each object can have the following properties:
  - `title`: The title of the node.
  - `subTitle`: A subtitle for additional information.
  - `image`: A URL for an image associated with the node.
  - `customContent`: Any custom HTML content to display within the node.
  - `childs`: An array of child nodes, structured similarly.

- **config**: An object for configuring the hierarchy display.
  - `orientation`: Specifies the layout orientation. Options are `vertical` or `horizontal`.
  - `connector`: Styles for the connectors between nodes.
    - `borderWidth`: Width of the connector line (e.g., `'1px'`).
    - `borderStyle`: Style of the connector line (e.g., `'solid'`).
    - `borderColor`: Color of the connector line (e.g., `'#d2d1d1'`).
  - `node`: Styles for the nodes.
    - `backgroundColor`: Background color of the node (e.g., `'#ffffff'`).
    - `borderWidth`: Width of the node border (e.g., `'1px'`).
    - `borderStyle`: Style of the node border (e.g., `'solid'`).
    - `borderColor`: Color of the node border (e.g., `'#E8E8E8'`).
    - `titleColor`: Color of the title text (e.g., `'#000000'`). Set this when using a dark node background.
    - `subTitleColor`: Color of the subtitle text (e.g., `'#000000'`).
    - `titleTooltip`: When `true`, the full title is shown as a native tooltip on hover.
  - `avatar`: Styles for the node image (avatar).
    - `width`: Width of the avatar (e.g., `'40px'`).
    - `height`: Height of the avatar (e.g., `'40px'`).
    - `backgroundColor`: Background color behind the avatar (e.g., `'#ffffff'`).
    - `borderWidth`: Width of the avatar border (e.g., `'2px'`).
    - `borderStyle`: Style of the avatar border (e.g., `'solid'`).
    - `borderColor`: Color of the avatar border (e.g., `'#ffffff'`).
    - `borderRadius`: Corner radius of the avatar (e.g., `'8px'`, or `'50%'` for a circle).
    - `padding`: Space between the border and the image (e.g., `'2px'`).
    - `objectFit`: How the image fills the box (e.g., `'cover'`, `'contain'`).
    - `boxShadow`: Shadow around the avatar (e.g., `'0 2px 6px rgba(0,0,0,.2)'`).

    > Sizing uses `box-sizing: border-box`, so `width`/`height` include the border and padding.

### Output Properties

- **nodeClick**: An event emitted when a node is selected. The event payload will include the selected node's data.

### Example

Here's a simple example of how to use the `kt-hierarch` component:

#### Component Code

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-hierarchy-example',
  templateUrl: './hierarchy-example.component.html'
})
export class HierarchyExampleComponent {
  hierarchicalData = [
    {
      title: 'Node 1',
      subTitle: 'This is Node 1',
      image: 'path/to/image1.png',
      customContent: '<p>Custom Content for Node 1</p>',
      childs: [
        {
          title: 'Node 1.1',
          subTitle: 'This is Node 1.1',
          image: 'path/to/image1.1.png',
          customContent: '<p>Custom Content for Node 1.1</p>',
          childs: []
        },
        {
          title: 'Node 1.2',
          subTitle: 'This is Node 1.2',
          image: 'path/to/image1.2.png',
          customContent: '<p>Custom Content for Node 1.2</p>',
          childs: []
        }
      ]
    },
    {
      title: 'Node 2',
      subTitle: 'This is Node 2',
      image: 'path/to/image2.png',
      customContent: '<p>Custom Content for Node 2</p>',
      childs: []
    }
  ];

  hierarchyConfig = {
    orientation: 'vertical',
    connector: {
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: '#d2d1d1',
    },
    node: {
      backgroundColor: '#ffffff',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: '#E8E8E8',
      titleColor: '#000000',
      subTitleColor: '#000000',
    },
    avatar: {
      width: '40px',
      height: '40px',
      backgroundColor: '#ffffff',
      borderWidth: '2px',
      borderStyle: 'solid',
      borderColor: '#ffffff',
      borderRadius: '8px',
      padding: '2px',
      objectFit: 'cover',
      boxShadow: 'none',
    }
  };

  onnodeClick(item: any) {
    console.log('Selected Item:', item);
  }
}
```

#### Template Code

```html
<kt-hierarch [data]="hierarchicalData" [config]="hierarchyConfig" (nodeClick)="onnodeClick($event)"></kt-hierarch>
```

## API Reference

### `KtHierarchComponent`

- **Inputs:**
  - `data: any[]`: The hierarchical data to display.
  - `config: { orientation: string; connector: { borderWidth: string; borderStyle: string; borderColor: string; }; node: { backgroundColor: string; borderWidth: string; borderStyle: string; borderColor: string; titleColor: string; subTitleColor: string; }; avatar: { width: string; height: string; backgroundColor: string; borderWidth: string; borderStyle: string; borderColor: string; borderRadius: string; padding: string; objectFit: string; boxShadow: string; }; }`: Configuration settings for the hierarchy display. Any section can be partially specified — unspecified keys fall back to the defaults.

- **Outputs:**
  - `nodeClick: EventEmitter<any>`: Emits the selected node.

## Conclusion

The `kt-hierarch` module provides a straightforward way to manage and display hierarchical data in Angular applications. Customize it further to fit your application's needs by leveraging the available input and output properties. For additional features and updates, refer to the official repository or the project's documentation.

## License

This module is licensed under the [MIT License](LICENSE).

