import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { KtHierarchModule } from 'kt-hierarch';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    KtHierarchModule
    
  ],
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
