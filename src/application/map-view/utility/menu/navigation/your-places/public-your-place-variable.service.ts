import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Pointer as PointerInteraction } from 'ol/interaction.js';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Icon, Style } from 'ol/style';
import { MapService } from 'src/application/shared/services/map.service';
import { PublicVarService } from 'src/application/shared/services/public-var.service';

@Injectable({
 providedIn: 'root',
})
export class PublicYourPlaceVariableService {
 constructor(
  public publicVar: PublicVarService,
  private mapservice: MapService,
  // for ssr
  @Inject(PLATFORM_ID) private platformId: Object,
 ) {}
 isOpenHome: boolean = false;
 isExistHome: boolean = false;
 isOpenWork: boolean = false;
 isOpenOtherPlace: boolean = false;

 maplayer: VectorLayer;
 layerSource: VectorSource = new VectorSource();

 // ---- this functio for add vector layer(point) and add interaction to map for move point by mouse ----
 addpoint(long: number, lat: number, zoom: number) {
  // for ssr
  if (isPlatformBrowser(this.platformId)) {
   const layerStyle: Style = new Style({
    image: new Icon({
     anchor: [ 0.5, 1 ],
     crossOrigin: 'anonymous',
     scale: 0.3,
     src: '../../../../../assets/img/your-place.png',
    }),
   });
   this.maplayer = new VectorLayer({
    visible: true,
    opacity: 1.0,
    source: this.layerSource,
    style: layerStyle,
    // set z index for layer always top
    zIndex: 1002,
   });
   // ----set name for layer bacause we want remove layer by name
   this.maplayer.set('name', 'yourPlace');

   this.mapservice.map.addLayer(this.maplayer);
   // for return value and show on input
   const Drag = ((PointerInteraction) => {
    function Drag(){
     PointerInteraction.call(this, {
      handleDownEvent: handleDownEvent,
      handleDragEvent: handleDragEvent,
      handleMoveEvent: handleMoveEvent,
      handleUpEvent: handleUpEvent,
     });
     this.coordinate_ = null; // Save mouse click coordinates
     this.cursor_ = 'pointer'; // Save the current mouse cursor style
     this.feature_ = null; // Save the elements that the mouse clicks on and intersects
     this.previousCursor_ = undefined; // Save the last mouse cursor style
    }

    if (PointerInteraction) {
     Drag.__proto__ = PointerInteraction;
    }
    Drag.prototype = Object.create(PointerInteraction && PointerInteraction.prototype);
    Drag.prototype.constructor = Drag;
    return Drag;
   })(PointerInteraction);
   // Function handling "down" events.
   // If the function returns true then a drag sequence is started
   function handleDownEvent(evt){
    const map = evt.map;
    // Return the mouse click on the intersecting elements
    const feature = map.forEachFeatureAtPixel(evt.pixel, (feature) => {
     return feature;
    });

    if (feature) {
     this.coordinate_ = evt.coordinate; // Save the coordinates of the mouse click
     this.feature_ = feature; // Save the feature that intersects the coordinates of the mouse click
    }
    return !!feature; // equivalent to Boolean(feature)
   }
   // Function handling "drag" events.
   // This function is called on "move" events during a drag sequence
   function handleDragEvent(evt){
    const deltaX = evt.coordinate[0] - this.coordinate_[0];
    const deltaY = evt.coordinate[1] - this.coordinate_[1];

    const geometry = this.feature_.getGeometry();
    geometry.translate(deltaX, deltaY); // Make the graph transfer deltaX, deltaY
    // Save the new coordinate point of the mouse to the coordinate_ attribute of app.Drag
    this.coordinate_[0] = evt.coordinate[0];
    this.coordinate_[1] = evt.coordinate[1];
   }
   // Function handling "move" events.
   // This function is called on "move" events, also during a drag sequence
   // (so during a drag sequence both the handleDragEvent function and this function are called).
   function handleMoveEvent(evt){
    if (this.cursor_) {
     const map = evt.map;
     const feature = map.forEachFeatureAtPixel(evt.pixel, function(feature){
      return feature;
     });
     const element = evt.map.getTargetElement(); // Get the div element container of the map
     if (feature) {
      // If the mouse coordinate point intersects a feature
      if (element.style.cursor !== this.cursor_) {
       // If the style of the mouse cursor on the map is different from the mouse style saved by the cursor_
       this.previousCursor_ = element.style.cursor;
       element.style.cursor = this.cursor_; // convert the cursor
      }
     } else if (this.previousCursor_ !== undefined) {
      // If the mouse coordinate point does not intersect any features, and the previousCursor_  is not undefined
      element.style.cursor = this.previousCursor_; // convert the cursor
      this.previousCursor_ = undefined;
     }
    }
   }
   // Function handling "up" events.
   // If the function returns false then the current drag sequence is stopped.
   function handleUpEvent(){
    this.coordinate_ = null;
    this.feature_ = null;
    return false;
   }
   this.mapservice.map.addInteraction(new Drag());
   const iconFeature = new Feature({
    geometry: new Point([ long, lat ]),
   });
   this.layerSource.addFeature(iconFeature);
   this.mapservice.map.getView().setZoom(zoom);
   this.mapservice.map.getView().setCenter([ long, lat ]);
  }
 }
 // ---- this functio for add vector layer(point) ----
 removePoint() {
  this.layerSource.clear();
  // ---for remove layer from base map ----
  const mapLayers = this.mapservice.map.getLayers().getArray();
  mapLayers.forEach((leyer) => {
   const properties = leyer.getProperties();
   for (const property in properties) {
    if (property == 'name') {
     const name = leyer.get('name');
     if (name == 'yourPlace') {
      this.mapservice.map.removeLayer(leyer);
     }
    }
   }
  });
 }

 CreatAddresFromPoint(long, lat) {
  if (lat === undefined || long === undefined) {
   const Center = this.mapservice.map.getView().getCenter();
   long = Center[0];
   lat = Center[1];
  }
  // get map center and zoom to show point on it
  const Zoom = this.mapservice.map.getView().getZoom();
  // ----for first click before move point,add point in center map ----
  this.addpoint(long, lat, Zoom);
  // ----after move point ----
  // get point source and point coordinate
  const source = this.maplayer.getSource();
  // Get the features of the layer
  const features = source.getFeatures();
  let feature;
  // iterate through the array
  for (let i = 0, ii = features.length; i < ii; ++i) {
   feature = features[i];
   // get the geometry for each feature point
   const geometry = feature.getGeometry();
   return geometry;
  }
 }

 toFix(array: Array<number>) {
  return array[0].toFixed(0) + ' , ' + array[1].toFixed(0);
 }
}
