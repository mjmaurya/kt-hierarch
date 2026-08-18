import { Component } from '@angular/core';

export interface ChartNode {
  title: string;
  subTitle?: string;
  image?: string;
  customContent?: string;
  childs: ChartNode[];
}

type ImageStatus = 'empty' | 'checking' | 'ok' | 'broken' | 'invalid';

const AVATAR_PRESETS: { [key: string]: { borderRadius: number; borderRadiusUnit: string; borderWidth: number; padding: number } } = {
  square:  { borderRadius: 0,  borderRadiusUnit: 'px', borderWidth: 0, padding: 0 },
  rounded: { borderRadius: 10, borderRadiusUnit: 'px', borderWidth: 2, padding: 2 },
  circle:  { borderRadius: 50, borderRadiusUnit: '%',  borderWidth: 2, padding: 2 },
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  orientation: 'vertical' | 'horizontal' = 'vertical';

  /* ---------- style state (numbers here, CSS strings built in `config` below) ---------- */
  avatar = {
    size: 48,
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: '#ffffff',
    borderRadius: 10,
    borderRadiusUnit: 'px',
    backgroundColor: '#ffffff',
    padding: 2,
    objectFit: 'cover',
    shadow: true,
  };

  nodeStyle = {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#111827',
    titleColor: '#ffffff',
    subTitleColor: '#cbd5e1',
  };

  connector = {
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: '#93c5fd',
  };

  /* ---------- tree state ---------- */
  data: ChartNode = {
    title: 'Aaron Loeb',
    subTitle: 'Executive Director',
    image: 'https://i.pravatar.cc/150?img=12',
    childs: [
      {
        title: 'Cahaya Dewi',
        subTitle: 'Production Manager',
        image: 'https://i.pravatar.cc/150?img=45',
        childs: [
          { title: 'Yael Amari', subTitle: 'Product Designer', image: 'https://i.pravatar.cc/150?img=33', childs: [] },
          { title: 'Chiaki Sato', subTitle: 'Product Reviewer', image: 'https://i.pravatar.cc/150?img=47', childs: [] },
        ],
      },
      {
        title: 'Drew Feig',
        subTitle: 'Marketing Manager',
        image: 'https://i.pravatar.cc/150?img=15',
        childs: [
          { title: 'Neil Tran', subTitle: 'Data Analyst', image: 'https://i.pravatar.cc/150?img=52', childs: [] },
          { title: 'Matt Zhang', subTitle: 'Content Analyst', image: 'https://i.pravatar.cc/150?img=60', childs: [] },
        ],
      },
    ],
  };

  selected: ChartNode | null = null;
  imageStatus: ImageStatus = 'empty';
  imageError = '';
  copied = false;

  /* ---------- config handed to <kt-hierarch> ---------- */
  get config() {
    return {
      orientation: this.orientation,
      connector: {
        borderWidth: this.connector.borderWidth + 'px',
        borderStyle: this.connector.borderStyle,
        borderColor: this.connector.borderColor,
      },
      node: {
        titleTooltip: true,
        backgroundColor: this.nodeStyle.backgroundColor,
        borderWidth: this.nodeStyle.borderWidth + 'px',
        borderStyle: this.nodeStyle.borderStyle,
        borderColor: this.nodeStyle.borderColor,
        titleColor: this.nodeStyle.titleColor,
        subTitleColor: this.nodeStyle.subTitleColor,
      },
      avatar: {
        width: this.avatar.size + 'px',
        height: this.avatar.size + 'px',
        backgroundColor: this.avatar.backgroundColor,
        borderWidth: this.avatar.borderWidth + 'px',
        borderStyle: this.avatar.borderStyle,
        borderColor: this.avatar.borderColor,
        borderRadius: this.avatar.borderRadius + this.avatar.borderRadiusUnit,
        padding: this.avatar.padding + 'px',
        objectFit: this.avatar.objectFit,
        boxShadow: this.avatar.shadow ? '0 2px 8px rgba(0,0,0,.25)' : 'none',
      },
    };
  }

  /* ---------- selection ---------- */
  onNodeClick(node: ChartNode): void {
    this.selected = node;
    this.validateImage(node.image);
  }

  /* ---------- tree editing ---------- */
  addChild(parent: ChartNode | null): void {
    const target = parent || this.data;
    const child: ChartNode = { title: 'New member', subTitle: 'Role', image: '', childs: [] };
    target.childs = [...(target.childs || []), child];
    this.selected = child;
    this.validateImage(child.image);
  }

  addSibling(node: ChartNode): void {
    const parent = this.findParent(this.data, node);
    if (!parent) {
      return; // root has no siblings
    }
    this.addChild(parent);
  }

  deleteNode(node: ChartNode): void {
    const parent = this.findParent(this.data, node);
    if (!parent) {
      return; // guarded in the template: the root cannot be deleted
    }
    parent.childs = parent.childs.filter((c) => c !== node);
    this.selected = null;
  }

  isRoot(node: ChartNode | null): boolean {
    return !!node && node === this.data;
  }

  childCount(node: ChartNode | null): number {
    return node && node.childs ? node.childs.length : 0;
  }

  private findParent(current: ChartNode, target: ChartNode): ChartNode | null {
    for (const child of current.childs || []) {
      if (child === target) {
        return current;
      }
      const found = this.findParent(child, target);
      if (found) {
        return found;
      }
    }
    return null;
  }

  /* ---------- avatar image ---------- */
  applyPreset(name: string): void {
    const preset = AVATAR_PRESETS[name];
    if (preset) {
      this.avatar = { ...this.avatar, ...preset };
    }
  }

  onImageUrlChange(url: string): void {
    if (this.selected) {
      this.selected.image = url;
    }
    this.validateImage(url);
  }

  onImageFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) {
      return;
    }
    if (!file.type.startsWith('image/')) {
      this.imageStatus = 'invalid';
      this.imageError = 'That file is not an image.';
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      this.imageStatus = 'invalid';
      this.imageError = 'Image is larger than 2 MB — use a URL instead of inlining it.';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (this.selected) {
        this.selected.image = String(reader.result);
        this.imageStatus = 'ok';
        this.imageError = '';
      }
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  /** Validates the URL shape, then confirms the browser can actually decode it. */
  validateImage(url: string | undefined): void {
    this.imageError = '';
    if (!url) {
      this.imageStatus = 'empty';
      return;
    }
    if (!/^(https?:\/\/|data:image\/|\/|\.\/)/.test(url)) {
      this.imageStatus = 'invalid';
      this.imageError = 'Use an http(s) URL, a data:image URI, or a path starting with / or ./';
      return;
    }
    this.imageStatus = 'checking';
    const probe = new Image();
    probe.onload = () => {
      if (this.selected && this.selected.image === url) {
        this.imageStatus = 'ok';
      }
    };
    probe.onerror = () => {
      if (this.selected && this.selected.image === url) {
        this.imageStatus = 'broken';
        this.imageError = 'The image did not load — check the URL or CORS headers.';
      }
    };
    probe.src = url;
  }

  /* ---------- validation ---------- */
  get titleError(): string {
    if (!this.selected) {
      return '';
    }
    const title = (this.selected.title || '').trim();
    if (!title) {
      return 'Title is required — the node renders empty without it.';
    }
    if (title.length > 40) {
      return 'Titles over 40 characters overflow the node box.';
    }
    return '';
  }

  get avatarWarning(): string {
    // range inputs hand back strings — coerce before doing arithmetic
    const inner = Number(this.avatar.size) - 2 * (Number(this.avatar.borderWidth) + Number(this.avatar.padding));
    if (inner <= 0) {
      return 'Border + padding consume the whole box — nothing of the image is left.';
    }
    if (inner < 16) {
      return 'Only ' + inner + 'px of image remains inside the border and padding.';
    }
    return '';
  }

  get isValid(): boolean {
    return !this.titleError && !this.avatarWarning && this.imageStatus !== 'invalid';
  }

  /* ---------- export ---------- */
  get exported(): string {
    return JSON.stringify({ config: this.config, data: this.data }, null, 2);
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
