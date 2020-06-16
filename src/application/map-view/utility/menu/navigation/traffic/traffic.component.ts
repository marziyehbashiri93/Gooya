import { Component, OnInit } from "@angular/core";
import { PublicVarService } from "src/application/shared/services/public-var.service";
import { MapService } from "src/application/shared/services/map.service";

@Component({
  selector: "app-traffic",
  template: `<label class="switch">
    <input
      type="checkbox"
      #checkboxTraffic
      (change)="switchTraffic(checkboxTraffic)"
      [checked]="this.publicVar.isTrafficON"/>
    <div class="slider"></div>
  </label>`,
})
export class TrafficComponent implements OnInit {
  constructor(
    public publicVar: PublicVarService,
    private mapservice: MapService
  ) {}

  ngOnInit() {
  }

  switchTraffic(TrafficInput: HTMLInputElement) {

    if (TrafficInput.checked) {
      this.publicVar.isTrafficON = true;
      this.mapservice.map.addLayer(this.publicVar.WMTSLayerTraffic);
      console.log("Traffic.checked");
    } else {
      setTimeout(() => {
        if (!TrafficInput.checked) {
          this.publicVar.isTrafficON = false;
          this.mapservice.map.removeLayer(this.publicVar.WMTSLayerTraffic);
        }
      }, 1500);
    }
    this.publicVar.status.traffic = this.publicVar.isTrafficON;
    localStorage.setItem("Status", JSON.stringify(this.publicVar.status));
  }

}
