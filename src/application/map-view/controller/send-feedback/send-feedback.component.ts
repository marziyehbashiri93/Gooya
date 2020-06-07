import { Component, OnInit } from '@angular/core';
import { ReportErrorComponent } from 'src/application/partial/report-error/report-error.component';
import { MapService } from 'src/application/shared/services/map.service';
import { PublicVarService } from 'src/application/shared/services/public-var.service';
import { IranBoundryService } from 'src/application/shared/services/iran-boundry.service';

@Component({
  selector: 'app-send-feedback',
  template: `
  <div class="send-feedback" (click)="this.publicVar.isauthenticate ? openReportError():this.publicVar.isOpenMustLogin = true;
  this.publicVar.isOpenPopupAttribute = false;changeExtent()"
  [ngStyle]="{ padding: this.publicVar.isPersian ? '1px 10px' : '1px 7px' }"
  >
  <span *ngIf="this.publicVar.isPersian">ارسال بازخورد</span>
  <span *ngIf="!this.publicVar.isPersian">Send feedback</span>
  </div>
`,
styleUrls: [ './send-feedback.component.scss' ],
providers: [ ReportErrorComponent ],
})
export class SendFeedbackComponent implements OnInit {
constructor(
public mapservice: MapService,
public publicVar: PublicVarService,
public IranBoundry: IranBoundryService,
public ReportError: ReportErrorComponent
) {}

ngOnInit() {}
openReportError() {
// agar funclose direction ro call konim error midahad
this.publicVar.isOpenDirection = false;
this.publicVar.DirectionEndPointValue = null;
this.publicVar.DirectionStartPointValue = null;
this.ReportError.openReportError();
}
changeExtent() {
setTimeout(() => {
 const extentBaseMap = this.mapservice.map
  .getView()
  .calculateExtent(this.mapservice.map.getSize());
 this.ReportError.addMap(extentBaseMap, undefined);
}, 10);
}
}
