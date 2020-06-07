import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import Overlay from 'ol/Overlay';
import GeometryType from 'ol/geom/GeometryType';
import Draw from 'ol/interaction/Draw';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import { trigger, transition, animate, style } from '@angular/animations';
import { MapService } from 'src/application/shared/services/map.service';
import { PublicVarService } from 'src/application/shared/services/public-var.service';

@Component({
 selector: 'app-measure',
 templateUrl: './measure.component.html',
 styleUrls: [ './measure.component.scss' ],
 animations: [
  trigger('openClose', [
   transition(':enter', [
    style({ width: '0px' }),
    animate(
     '300ms',
     style({
      width: '190px',
     }),
    ),
   ]),
   transition(':leave', [ style({ width: '190px' }), animate('300ms', style({ width: '0px' })) ]),
  ]),
 ],
 // baraye anke class ol-tooltip ra az css bekhanad
 encapsulation: ViewEncapsulation.None,
})
export /* chon az in kamponent dar context menu estefadeh mishavad bayad vector layer va measuring tool va
mesuaring result ra dar public var benvisim chera ke vaghti click ras mikonem kar nemikonad Interaction pak nemishavad
radio value btn ham nemikhanad */

class MeasureComponent implements OnInit {
 constructor(public mapservice: MapService, public publicVar: PublicVarService) {}
 selectRadioValue;
 helpMsg = 'برای شروع کلیک کنید';
 continueMsgFa = 'برای ادامه کلیک و برای اتمام دوبار کلیک کنید';
 continueMsgEn = 'Click to continue drawing and dblclick to end';
 helpTooltipElement: HTMLDivElement;
 // payami k bayad namaysh dadeh shavad
 pointerMoveHandler = (evt) => {
  if (evt.dragging) {
   return;
  }

  if (this.publicVar.isPersian) {
   this.helpMsg = 'برای شروع کلیک کنید';
  } else {
   this.helpMsg = 'Click to start drawing';
  }
  if (this.publicVar.sketch) {
   if (this.publicVar.isPersian) {
    this.helpMsg = this.continueMsgFa;
   } else {
    this.helpMsg = this.continueMsgEn;
   }
  }
  if (this.helpTooltipElement) {
   this.helpTooltipElement.innerHTML = this.helpMsg;
   // cordinate pointerMove
   this.publicVar.helpTooltip.setPosition(evt.coordinate);
   this.helpTooltipElement.classList.remove('hidden');
  }
 }

 ngOnInit() {}

 openMeasure() {
  this.publicVar.isOpenPopupAttribute = false;
  if (!this.publicVar.isOpenMeasure) {
   // colse other element
   this.publicVar.isOpenDirection = false;
   this.publicVar.isOpenPlaces = false;
   this.publicVar.isOpenMoreSearch = false;
   this.publicVar.isOpenStreet = false;
   this.publicVar.isOpenPoi = false;
   this.publicVar.isOpenIntersect = false;
   this.publicVar.isOpenCoordinate = false;
   this.mapservice.map.addLayer(this.publicVar.measureLayer);
   this.publicVar.isOpenMeasure = true;
   this.publicVar.mouseCursor = 'default';
   this.selectRadioValue = 'LineString';
   this.enableMeasuringTool();
   this.createHelpTooltip();
   this.mapservice.map.on('pointermove', this.pointerMoveHandler);
  } else {
   this.publicVar.resultMeasure = '';
   this.publicVar.isOpenMeasure = false;
   this.publicVar.measureLayer.getSource().clear();
   this.mapservice.map.removeInteraction(this.publicVar.measuringTool);
   this.mapservice.map.removeLayer(this.publicVar.measureLayer);
   this.publicVar.mouseCursor = 'grab';
   // baraye anke hazf konad overlay ra
   this.removeHelpTooltip();
  }
 }

 enableMeasuringTool() {
  this.mapservice.map.removeInteraction(this.publicVar.measuringTool);
  const geometryType = this.selectRadioValue;
  this.publicVar.measuringTool = new Draw({
   type: geometryType === 'Polygon' ? GeometryType.POLYGON : GeometryType.LINE_STRING,
   source: this.publicVar.measureLayer.getSource(),
   style: new Style({
    fill: new Fill({
     color: 'rgba(255, 255, 255, 0.5)',
    }),
    stroke: new Stroke({
     color: 'rgba(0, 0, 0, 0.5)',
     lineDash: [ 10, 10 ],
     width: 2,
    }),
    image: new CircleStyle({
     radius: 5,
     stroke: new Stroke({
      color: '#ffffff',
     }),
     fill: new Fill({
      color: '#0099ff',
     }),
    }),
   }),
  });
  this.mapservice.map.addInteraction(this.publicVar.measuringTool);
  this.publicVar.measuringTool.on('drawstart', (eventStart) => {
   // baraye help tool tip
   this.publicVar.sketch = eventStart.feature;
   this.publicVar.measureLayer.getSource().clear();
   eventStart.feature.on('change', (event) => {
    const measurement =
     geometryType === 'Polygon' ? event.target.getGeometry().getArea() : event.target.getGeometry().getLength();
    let measurementFormatted;
    if (geometryType === 'Polygon') {
     if (measurement > 10000) {
      measurementFormatted = Math.round(measurement / 1000000 * 100) / 100 + ' km';
     } else {
      measurementFormatted = Math.round(measurement * 100) / 100 + ' m';
     }
    } else {
     if (geometryType === 'LineString') {
      if (measurement > 1000) {
       measurementFormatted = Math.round(measurement / 1000 * 100) / 100 + ' km';
      } else {
       measurementFormatted = Math.round(measurement * 100) / 100 + ' m';
      }
     }
    }
    this.publicVar.resultMeasure = measurementFormatted;
   });
  });
  // baraye anke vaghti finish draw shod hlep massage b halat start beravad
  this.publicVar.measuringTool.on('drawend', (e) => {
   this.publicVar.sketch = null;
  });
 }

 removeHelpTooltip() {
  this.helpTooltipElement = null;
  this.mapservice.map.removeOverlay(this.publicVar.helpTooltip);
 }

 createHelpTooltip() {
  this.helpTooltipElement = document.createElement('div');
  // this.helpTooltipElement =  this._renderer.createElement('div','');
  this.helpTooltipElement.className = 'ol-tooltip hidden';
  this.publicVar.helpTooltip = new Overlay({
   element: this.helpTooltipElement,
   offset: [ 15, 0 ],
  });
  this.mapservice.map.addOverlay(this.publicVar.helpTooltip);
 }

 changeRadioButton(event) {
  this.selectRadioValue = event.target.value;
  this.publicVar.resultMeasure = '';
  this.publicVar.measureLayer.getSource().clear();
  this.enableMeasuringTool();
  this.publicVar.mouseCursor = 'default';
 }
}
