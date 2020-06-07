import { Component, OnInit } from '@angular/core';
import { DirectionComponent } from '../../../direction/direction.component';
import { PublicVarService } from 'src/application/shared/services/public-var.service';
import { PublicYourPlaceVariableService } from './public-your-place-variable.service';
import { MeasureComponent } from 'src/application/map-view/controller/measure/measure.component';
import { FavoritHomeComponent } from './favorit-home/favorit-home.component';
import { slide } from 'src/application/shared/animation/slide';

@Component({
  selector: 'app-your-places',
  templateUrl: './your-places.component.html',
  styleUrls: ['./your-places.component.scss'],
  animations: [ slide ],
  providers: [ DirectionComponent]
})
export class YourPlacesComponent implements OnInit {
  constructor(
    public publicVar: PublicVarService,
    public publicVarYourPlace: PublicYourPlaceVariableService,
    public measure: MeasureComponent,
    public favoritHome: FavoritHomeComponent // public favoritWork: FavoritWorkComponent
  ) {}

  ngOnInit() {}

  closePlaces() {
    this.publicVar.isOpenPlaces = false;
    // this.publicVarYourPlace.isOpenWork = false;
    this.favoritHome.openCloseHome();
  }
  openPlaces() {
    if (this.publicVar.isOpenMeasure) {
      this.measure.openMeasure();
    }
    this.publicVar.isOpenMoreSearch = false;
    this.publicVar.isOpenPlaces = true;
  }
}

