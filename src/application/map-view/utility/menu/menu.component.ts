import { StyleModeComponent } from './navigation/style-mode/style-mode.component';
import { Component, OnInit, ViewChild } from '@angular/core';
import { PublicVarService } from 'src/application/shared/services/public-var.service';

@Component({
  selector: 'app-menu',
  template: `
    <div class="menu">
      <button (click)="openNavigation()">
        <app-menu-icon></app-menu-icon>
      </button>
    </div>
  `,
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
  constructor(public publicVar: PublicVarService) {}
  ngOnInit() {}
  openNavigation() {
    this.publicVar.isOpenPopupAttribute = false;
    this.publicVar.isOpenNavigation = true;
    this.publicVar.isOpenMoreSearch = false;
  }
}
