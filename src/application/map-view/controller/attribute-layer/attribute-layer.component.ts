import { Component, OnInit, ElementRef } from '@angular/core';
import { toStringXY } from 'ol/coordinate';
import { transform } from 'ol/proj';
import { Identify } from 'src/application/shared/interface/identify';
import { MapService } from 'src/application/shared/services/map.service';
import { PublicVarService } from 'src/application/shared/services/public-var.service';
import { IranBoundryService } from 'src/application/shared/services/iran-boundry.service';
import { HttpClient } from '@angular/common/http';
@Component({
 selector: 'app-attribute-layer',
 templateUrl: './attribute-layer.component.html',
 styleUrls: [ './attribute-layer.component.scss' ],
})
export class AttributeLayerComponent implements OnInit {
 featureName: string;
 featureCoord: string;
 showArrow = 'bottom';
 posTop: number;
 posLeft: number;
 isInIran: boolean;
 constructor(
  public mapservice: MapService,
  public publicVar: PublicVarService,
  public IranBoundry: IranBoundryService,
  private httpClient: HttpClient,
  private elRef: ElementRef,
 ) {}

 ngOnInit() {
  // window.addEventListener('DOMContentLoaded', (e) => {
  //  this.openPopupAttribute();
  // });
 }

 openPopupAttribute() {
  // in 2 variable baraye taghir check box mouse position estefadeh maishavad
  let currentMousePositionPrj;
  let clickCoord;
  this.mapservice.map.on('singleclick', (evt: any) => {
   const zoom = this.mapservice.map.getView().getZoom();
   this.featureName = '';
   if (
    zoom > 11 &&
    !this.publicVar.isOpenPopupAttribute &&
    !this.publicVar.isOpenDirection &&
    !this.publicVar.isOpenPlaces &&
    !this.publicVar.isOpenMeasure &&
    !this.publicVar.isOpenStreet &&
    !this.publicVar.isOpenIntersect &&
    !this.publicVar.isOpenPoi &&
    !this.publicVar.isOpenCoordinate &&
    this.publicVar.isMiniMapSatellite
   ) {
    // baraye anke agar ro search click shode bood az halat fucos darbiyayad
    this.elRef.nativeElement.ownerDocument.activeElement.blur();
    const clientX = evt.originalEvent.clientX;
    const clientY = evt.originalEvent.clientY;
    const baseMapWidth = this.mapservice.map.getTargetElement().offsetWidth;
    // const baseMapHeight = this.mapservice.map.getTargetElement().offsetHeight;
    // set position popup
    const popupWidth = 172;
    // attribute + arrow + circle
    const popupHeight = 55;
    const circleArrow = 12 + 12;
    // baraye meqdar dehi be coordinate ba tavajoh b format mouse position
    currentMousePositionPrj = this.publicVar.mousePositionProject;
    if (currentMousePositionPrj === this.mapservice.project) {
     this.featureCoord = toStringXY(evt.coordinate, 0);
     clickCoord = this.featureCoord;
    } else {
     this.featureCoord = toStringXY(transform(evt.coordinate, this.mapservice.project, 'EPSG:4326'), 4);
     clickCoord = this.featureCoord;
    }
    // baraye meqdar dehi be attribute bar asase dakhel ya kharej iran
    const inside = require('point-in-polygon');
    if (inside(evt.coordinate, this.IranBoundry.Iran)) {
     const XY = transform(evt.coordinate, this.mapservice.project, 'EPSG:4326');
     const URL =
      this.publicVar.baseUrl +
      ':' +
      this.publicVar.portMap +
      '/api/map/identify?X=' +
      XY[0].toString() +
      '&Y=' +
      XY[1].toString() +
      '&ZoomLevel=' +
      zoom.toFixed(0).toString();
     this.httpClient.get<Identify>(URL).toPromise().then((identy) => {
      console.log(identy);
      if (this.publicVar.isPersian) {
      }
      if ((!identy[0] || identy[0].F_NAME === '?') && this.publicVar.isPersian) {
       this.featureName = 'عارضه بی نام';
      } else if ((!identy[0] || identy[0].E_NAME === '?') && !this.publicVar.isPersian) {
       this.featureName = 'anonymous feature';
      } else {
       if (this.publicVar.isPersian) {
        this.featureName = identy[0].F_NAME;
       } else {
        this.featureName = identy[0].E_NAME;
       }
      }
      this.publicVar.isOpenPopupAttribute = true;
     });
    } else {
     this.featureName = 'مکان موردنظر خارج ایران است.';
     this.publicVar.isOpenPopupAttribute = true;
    }
    if (/*if click on left of browsers */ clientX < popupWidth / 2) {
     this.showArrow = 'left';
     this.posLeft = clientX + circleArrow - 6;
     this.posTop = clientY - popupHeight / 2 - 1;
    } else if (/*if click on rigth of browsers */ clientX > baseMapWidth - popupWidth / 2) {
     this.showArrow = 'right';
     this.posLeft = clientX - (popupWidth + circleArrow) + 4;
     this.posTop = clientY - popupHeight / 2 - 1;
    } else if (
     /*if click on top of browsers */
     clientY <
     popupHeight + circleArrow
    ) {
     this.showArrow = 'top';
     this.posLeft = clientX - popupWidth / 2 - 4;
     this.posTop = clientY + circleArrow - 6;
    } else {
     this.showArrow = 'bottom';
     this.posLeft = clientX - popupWidth / 2 - 4;
     this.posTop = clientY + 5 - (popupHeight + circleArrow);
    }
   } else {
    this.publicVar.isOpenPopupAttribute = false;
   }
  });
  /* be ezaye har tagir dar check box mouseposition agar projoct jadid mouse position ba zamani k open att karde
   yeki nabood an ra be projoct jadid tagir midahim ama agar yeki bod haman megdar click namayeh midahim(clickCoord)
   */
  this.elRef.nativeElement.ownerDocument.activeElement.addEventListener('change', (e) => {
   if (e.target.id === 'checkboxMouseposition' && this.publicVar.isOpenPopupAttribute) {
    if (this.publicVar.mousePositionProject !== currentMousePositionPrj && clickCoord) {
     const newCoord = clickCoord.split(',');
     if (this.publicVar.mousePositionProject === 'EPSG:4326') {
      this.featureCoord = toStringXY(
       transform([ Number(newCoord[0]), Number(newCoord[1]) ], 'EPSG:900913', 'EPSG:4326'),
       4,
      );
     } else {
      this.featureCoord = toStringXY(
       transform([ Number(newCoord[0]), Number(newCoord[1]) ], 'EPSG:4326', 'EPSG:900913'),
       0,
      );
     }
     // currentMousePositionPrj = this.publicVar.mousePositionProject;
    } else {
     this.featureCoord = clickCoord;
    }
   }
  });

  // ---- Close the popup when moving in the map ----
  this.mapservice.map.on('movestart', () => {
   if (this.publicVar.isOpenPopupAttribute) {
    setTimeout(() => {
     this.publicVar.isOpenPopupAttribute = false;
    }, 30);
   }
  });
  // ---- Close the popup by right click----
  window.addEventListener('contextmenu', () => {
   if (this.publicVar.isOpenPopupAttribute) {
    this.publicVar.isOpenPopupAttribute = false;
   }
  });
 }
}
