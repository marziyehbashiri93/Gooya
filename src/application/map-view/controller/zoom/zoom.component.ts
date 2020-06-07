import { Component, OnInit, ViewEncapsulation, Renderer2 } from '@angular/core';
import { MapService } from 'src/application/shared/services/map.service';
import { PublicVarService } from 'src/application/shared/services/public-var.service';
import Zoom from 'ol/control/Zoom';

@Component({
 selector: 'app-zoom',
 templateUrl: './zoom.component.html',
 styleUrls: [ './zoom.component.scss' ],
 encapsulation: ViewEncapsulation.None,
})
export class ZoomComponent implements OnInit {
 constructor(private mapservice: MapService, private renderer: Renderer2, public publicVar: PublicVarService) {}

 ngOnInit() {
  this.setZoom();
 }
 setZoom() {
  this.publicVar.isOpenPopupAttribute = false;
  const elemenZoomOut = this.renderer.createElement('div');
  elemenZoomOut.innerHTML = `
    <svg viewBox="0 0 30 30">
      <path d="M27.32,11.69h-9.11c-0.3,0-6.13,0-6.43,0H2.68C1.2,11.69,0,13.17,0,15s1.2,3.31,2.68,3.31h9.11c0.3,0,6.13,0,6.43,0h9.11
        C28.8,18.31,30,16.83,30,15S28.8,11.69,27.32,11.69z"/>
    </svg>`;
  const elemenZoomIn = this.renderer.createElement('div');

  elemenZoomIn.innerHTML = `
    <svg height="30px" viewBox="0 0 448 448" width="30px">
      <path d="m408 184h-136c-4.417969 0-8-3.582031-8-8v-136c0-22.089844-17.910156-40-40-40s-40 17.910156-40 40v136c0
       4.417969-3.582031 8-8 8h-136c-22.089844 0-40 17.910156-40 40s17.910156 40 40 40h136c4.417969 0 8 3.582031 8 8v136c0
       22.089844 17.910156 40 40 40s40-17.910156 40-40v-136c0-4.417969 3.582031-8 8-8h136c22.089844 0
        40-17.910156 40-40s-17.910156-40-40-40zm0 0"/>
    </svg>`;

  this.mapservice.map.addControl(
   new Zoom({
    zoomInTipLabel: '',
    zoomOutTipLabel: '',
    target: 'zoom-controller',
    zoomOutLabel: elemenZoomOut,
    zoomInLabel: elemenZoomIn,
   }),
  );
 }
}
