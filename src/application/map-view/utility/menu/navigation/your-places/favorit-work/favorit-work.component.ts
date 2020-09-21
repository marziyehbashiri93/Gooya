import { state, style, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { MapService } from 'src/application/shared/services/map.service';
import { PublicVarService } from 'src/application/shared/services/public-var.service';
import { PublicYourPlaceVariableService } from '../public-your-place-variable.service';

@Component({
  selector: 'app-favorit-work',
  templateUrl: './favorit-work.component.html',
  styleUrls: ['./favorit-work.component.scss'],
  animations: [
    trigger('openCloseWork', [
      state(
        'close',
        style({
          height: '60px',
        })
      ),
      state(
        'openDontHaveWork',
        style({
          height: '146px',
        })
      ),
      state(
        'openHaveWork',
        style({
          height: '100px',
        })
      ),
      state(
        'openEditWork',
        style({
          height: '146px',
        })
      ),
    ]),
  ],
})
export class FavoritWorkComponent implements OnInit {
  // ----for home ----
  existWork = '';

  isOpenWorkEdit: boolean = false;
  isOpenWorkDelete: boolean = false;
  workAddres: string;
  coordPoint: Array<number>;

  constructor(
    private mapservice: MapService,
    public publicVar: PublicVarService,
    public publicVarYourPlace: PublicYourPlaceVariableService
  ) {}

  ngOnInit() {}

  openCloseWork() {
    this.isOpenWorkEdit = false;
    this.isOpenWorkDelete = false;

    if (this.publicVarYourPlace.isOpenWork) {
      console.log('CloseWork');

      this.publicVarYourPlace.isOpenWork = false;
    } else if (this.publicVar.isOpenPlaces) {
      console.log('OpenWork');
      this.publicVarYourPlace.isOpenWork = true;
      if (this.publicVarYourPlace.isExistWork) {
        this.workAddres = 'testAddres';
        setTimeout(() => {
          this.existWork = 'HaveWork';
        }, 550);
      } else {
        setTimeout(() => {
          this.existWork = 'DontHaveWork';
        }, 550);
        const Center = this.mapservice.map.getView().getCenter();
        this.coordPoint = [Center[0].toFixed(0), Center[1].toFixed(0)];
        const geom = this.publicVarYourPlace.CreatAddresFromPoint(Center[0], Center[1] );
      }
    }
  }
}
