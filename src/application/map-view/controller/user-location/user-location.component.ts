import { Component, OnInit } from '@angular/core';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import VectorLayer from 'ol/layer/Vector';
import { transform } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import View from 'ol/View';
import { MapService } from 'src/application/shared/services/map.service';
import { PublicVarService } from 'src/application/shared/services/public-var.service';


@Component({
 selector: 'app-user-location',
 templateUrl: './user-location.component.html',
 styleUrls: [ './user-location.component.scss' ],
})
export class UserLocationComponent implements OnInit {
 // ---- var get location ----
 lat: number;
 lng: number;
 valueView: View;
 // ---- addMarker ----
 markerSource: VectorSource;
 markerStyle: Style;
 layer;
 addgeolocation: boolean = false;
 constructor(private mapservice: MapService, public publicVar: PublicVarService) {}

 ngOnInit() {
  this.addLayer();
 }

 addLayer() {
  this.markerSource = new VectorSource();
  this.markerStyle = new Style({
   image: new CircleStyle({
    radius: 8,
    fill: new Fill({
     color: '#3399CC',
    }),
    stroke: new Stroke({
     color: '#fff',
     width: 2,
    }),
   }),
  });
  this.layer = new VectorLayer({
   source: this.markerSource,
   style: this.markerStyle,
   // set z index for layer always top
   zIndex: 1001,
  });
  this.layer.set('name', 'userLocation');
  this.mapservice.map.addLayer(
   // addMarker(*1*)
   this.layer
  );
 }

 // ----add a marker to VectorLayer in initializeMap(*1*)----
 addMarker(postion) {
  const iconFeature = new Feature({
   geometry: new Point(postion),
  });
  this.markerSource.addFeature(iconFeature);
 }

 // ----create function to get user loaction and zoom to location----
 // ---function user loaction----
 userLocation() {
  // ----agar clear nakonim har bar be feature 1 point ezafeh mishe----
  this.publicVar.isOpenPopupAttribute = false;
  this.markerSource.clear();
  // this.mapservice.map.removeLayer(this.layer)

  if (navigator.geolocation) {
   navigator.geolocation.getCurrentPosition(
    (position: Position) => {
     if (position) {
      this.lat = position.coords.latitude;
      this.lng = position.coords.longitude;
      // ---- because lan and log in dgree format we should transform
      const center = transform([ this.lng, this.lat ], 'EPSG:4326', this.mapservice.project);
      // ----get View attribute from map variable and set center and zoom and addMarker----
      this.valueView = this.mapservice.map.getView();
      this.valueView.animate({
       center: [ center[0], center[1] ],
       zoom: 17,
       duration: 1000,
      });
      if (!this.addgeolocation) {
       this.addMarker(center);
      } else {
       this.mapservice.map.removeLayer(this.layer);
       this.addMarker(center);
      }
     }
    },
    (error: PositionError) => {
     console.log(error);
     this.publicVar.isOpenPopupLocation = true;
    }
   );
  } else {
   alert('مرورگر شما لوکیشن را پشتیبانی نمیکند.');
  }
 }
}
