import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { HierarchyPlaygroundComponent } from './hierarchy-playground/hierarchy-playground.component';
import { DependencyGraphPlaygroundComponent } from './dependency-graph-playground/dependency-graph-playground.component';
import { KtDependencyGraphModule, KtHierarchModule } from 'kt-hierarch';

@NgModule({
  declarations: [
    AppComponent,
    HierarchyPlaygroundComponent,
    DependencyGraphPlaygroundComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    KtHierarchModule,
    KtDependencyGraphModule
  ],
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
