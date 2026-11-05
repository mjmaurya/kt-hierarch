import { Component, HostListener } from '@angular/core';

type Tab = 'hierarchy' | 'dependency-graph';

const TABS: { id: Tab; label: string }[] = [
  { id: 'hierarchy', label: 'Hierarchy' },
  { id: 'dependency-graph', label: 'Dependency graph' },
];

/** Read from the URL hash so a tab can be linked to directly (e.g. …/#dependency-graph). */
function tabFromHash(): Tab {
  const id = location.hash.slice(1);
  return TABS.some((t) => t.id === id) ? (id as Tab) : 'hierarchy';
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  readonly tabs = TABS;
  active: Tab = tabFromHash();

  select(tab: Tab): void {
    this.active = tab;
    history.replaceState(null, '', '#' + tab);
  }

  /** Follows manual edits of the hash and back/forward navigation. */
  @HostListener('window:hashchange')
  onHashChange(): void {
    this.active = tabFromHash();
  }
}
