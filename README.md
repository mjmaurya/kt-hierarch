# kt-hierarch

## Overview

`kt-hierarch` is an Angular module designed to create and manage hierarchical structures in your Angular applications. It provides a flexible way to display and manipulate hierarchical data, making it ideal for applications that require tree views or nested structures.

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
  - `config: { orientation: string; connector: { borderWidth: string; borderStyle: string; borderColor: string; }; node: { backgroundColor: string; borderWidth: string; borderStyle: string; borderColor: string; }; }`: Configuration settings for the hierarchy display.

- **Outputs:**
  - `nodeClick: EventEmitter<any>`: Emits the selected node.

## Conclusion

The `kt-hierarch` module provides a straightforward way to manage and display hierarchical data in Angular applications. Customize it further to fit your application's needs by leveraging the available input and output properties. For additional features and updates, refer to the official repository or the project's documentation.

## License

This module is licensed under the [MIT License](LICENSE).

