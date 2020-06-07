import { Component, OnInit } from '@angular/core';
import { PublicVarService } from 'src/application/shared/services/public-var.service';

@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.scss']
})
export class AboutUsComponent implements OnInit {

  constructor(public publicVar: PublicVarService) {}

  ngOnInit() {}
  CloaseAboutUs() {
    this.publicVar.isOpenAboutUs = false;
  }

}
