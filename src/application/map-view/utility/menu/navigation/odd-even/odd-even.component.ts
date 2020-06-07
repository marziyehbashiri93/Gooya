import { Component, OnInit } from '@angular/core';
import { PublicVarService } from 'src/application/shared/services/public-var.service';
import { MapService } from 'src/application/shared/services/map.service';

@Component({
 selector: 'app-odd-even',
 template: `
  <label class="switch">
    <input
      type="checkbox"
      #checkboxOddEven
      (change)="switchOddEven(checkboxOddEven)"
      [checked]="this.publicVar.isOddEvenON"
    />
    <div class="slider"></div>
  </label>
`,
})
export class OddEvenComponent implements OnInit {
 constructor(public publicVar: PublicVarService, private mapservice: MapService) {}

 ngOnInit() {}
 switchOddEven(OddEvenInput: HTMLInputElement) {
  if (OddEvenInput.checked) {
   this.publicVar.isOddEvenON = true;
   console.log('OddEvenInput.checked');
   this.mapservice.map.addLayer(this.publicVar.WMTSLayerOddEvenArea);
  } else {
   this.publicVar.isOddEvenON = false;
   this.mapservice.map.removeLayer(this.publicVar.WMTSLayerOddEvenArea);
  }
  this.publicVar.status.oddEven = this.publicVar.isOddEvenON;
  localStorage.setItem('Status', JSON.stringify(this.publicVar.status));
 }
}
