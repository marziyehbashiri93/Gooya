import { Component, OnInit, ViewChild } from '@angular/core';
import { SearchBoxComponent } from './search-box/search-box.component';
import { PublicVarService } from 'src/application/shared/services/public-var.service';

@Component({
 selector: 'app-utility',
 template: `
  <div
    id="utility"
    class="utility row"
    [ngStyle]="{
      'box-shadow':
        this.publicVar.isOpenSearchResult === true
          ? 'none'
          : 'rgba(17, 17, 17, 0.5) 0 5px 10px'
    }"
  >
    <app-menu></app-menu>
    <div class="search-box-container">
      <app-search-box></app-search-box>
    </div>
    <hr />
    <div class="direction-container">
      <app-direction
        *ngIf="!this.publicVar.isOpenSearchResult"
      ></app-direction>
      <div
        id="search-closer"
        class="search-closer"
        (click)="this.SearchBoxComponent.closeSearch()"
        *ngIf="this.publicVar.isOpenSearchResult"
      >
        <app-close></app-close>
      </div>
    </div>
  </div>
  <app-more-search id="more-search"></app-more-search>
`,
 styleUrls: [ './utility.component.scss' ],
})
export class UtilityComponent implements OnInit {
  @ViewChild(SearchBoxComponent, { static: false })
  SearchBoxComponent: SearchBoxComponent;
  constructor(public publicVar: PublicVarService) {}

 ngOnInit() {}
}
