import { Component, OnInit, ViewChild, ElementRef, DoCheck } from '@angular/core';
import { MapService } from 'src/application/shared/services/map.service';
import { PublicVarService } from 'src/application/shared/services/public-var.service';
import MousePosition from 'ol/control/MousePosition';
import { createStringXY } from 'ol/coordinate';
@Component({
 selector: 'app-mouse-position',
 templateUrl: './mouse-position.component.html',
 styleUrls: [ './mouse-position.component.scss' ],
})
export class MousePositionComponent implements OnInit, DoCheck {
 projecMousePosition: string = 'EPSG:4326';
 mousePositionValue;
 @ViewChild('checkboxMouseposition', { static: true })
 checkboxMouseposition: ElementRef;

 @ViewChild('mousePosition', { static: true })
 mousePosition: ElementRef;

 constructor(private mapservice: MapService, public publicVar: PublicVarService) {}

 ngOnInit() {
  this.setMousePosition(5, this.projecMousePosition);
  // agar dom load ro nazarim baraye  checkboxMouseposition undifine midahad
  this.changeMousePosProject();
 }

 ngDoCheck() {
  // Called every time that the input properties of a component or a directive are checked.
  //  Use it to extend change detection by performing a custom check.
  // Add 'implements DoCheck' to the class.
  this.changeMousePositionFormat();
 }

 setMousePosition(numberStringX: number, projects: string) {
  let undefine;
  if (this.publicVar.isPersian) {
   undefine = 'نامشخص';
  } else {
   undefine = 'undefined';
  }
  this.mapservice.map.addControl(
   new MousePosition({
    coordinateFormat: createStringXY(numberStringX),
    projection: projects,
    target: 'mouse-position',
    undefinedHTML: undefine,
   }),
  );
 }

 changeMousePositionFormat() {
  // agar time out nazarim barayer this.mousePosition undifine mideh
  let undefine;
  if (this.publicVar.isPersian) {
   undefine = 'نامشخص';
  } else {
   undefine = 'undefined';
  }
  const mousePosContent = this.mousePosition.nativeElement.innerText;
  const arrayMouse = mousePosContent.split(',');
  const long = parseFloat(arrayMouse[0]);
  const lat = parseFloat(arrayMouse[1]);
  let longFormat: string = null;
  let latFormat: string = null;
  if (long > 0) {
   longFormat = long + 'E';
  } else if (long < 0) {
   longFormat =  Math.abs(long) + 'W';
  } else {
   longFormat = long.toString();
  }
  if (lat > 0) {
   latFormat = lat + 'N';
  } else if (lat < 0) {
   latFormat =  Math.abs(lat )+ 'S';
  } else {
   latFormat = lat.toString();
  }
  const moseFormat = longFormat + ' , ' + latFormat;
  if (mousePosContent !== undefine  && arrayMouse[0] !== undefined && arrayMouse[1] !== undefined) {
   if (!this.checkboxMouseposition.nativeElement.checked) {
    this.mousePositionValue = moseFormat;
   } else {
    this.mousePositionValue = mousePosContent;
   }
  } else {
   this.mousePositionValue = undefine;
  }
 }

 changeMousePosProject() {
  this.checkboxMouseposition.nativeElement.addEventListener('change', (event) => {
   this.mapservice.map.getControls().forEach((element) => {
    const elemKey = element.getKeys();
    elemKey.forEach((elm) => {
     if (elm === 'projection') {
      this.mapservice.map.removeControl(element);
      if (this.checkboxMouseposition.nativeElement.checked) {
       this.publicVar.mousePositionProject = this.mapservice.project;
       this.setMousePosition(0, this.mapservice.project);
      } else {
       this.publicVar.mousePositionProject = 'EPSG:4326';
       this.setMousePosition(5, 'EPSG:4326');
      }
     }
    });
   });
  });
 }
}
