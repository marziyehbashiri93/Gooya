import { Component, OnInit } from '@angular/core';
import { PublicVarService } from 'src/application/shared/services/public-var.service';
import { MapService } from 'src/application/shared/services/map.service';

@Component({
 selector: 'app-terrain',
 template: `
  <label class="switch">
    <input type="checkbox" #checkboxTerrain (change)="switchTerrain(checkboxTerrain)"
    [checked]="this.publicVar.isTerrainON"
    />
    <div class="slider"></div>
  </label>
`,
})
export class TerrainComponent implements OnInit {
 constructor(public publicVar: PublicVarService, private mapservice: MapService) {}

 ngOnInit() {}

 switchTerrain(TerrainInput: HTMLInputElement) {
  if (TerrainInput.checked) {
   this.publicVar.isTerrainON = true;
   this.mapservice.map.addLayer(
    this.publicVar.createWMTSLayer(
     this.publicVar.layerStatus.terrain.layerName,
     this.publicVar.layerStatus.terrain.olName,
     this.publicVar.layerStatus.terrain.zIndex,
     this.publicVar.layerStatus.terrain.maxZoom,
     this.publicVar.layerStatus.terrain.minZoom,
    ),
   );
  } else {
   this.publicVar.isTerrainON = false;
   this.publicVar.removeLayerByName(this.publicVar.layerStatus.terrain.olName);
  }
  this.publicVar.status.terrain = this.publicVar.isTerrainON;
  localStorage.setItem('Status', JSON.stringify(this.publicVar.status));
 }
}
