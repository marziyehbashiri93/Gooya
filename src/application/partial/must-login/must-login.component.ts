import { Component, OnInit } from '@angular/core';
import { PublicVarService } from 'src/application/shared/services/public-var.service';

@Component({
  selector: 'app-must-login',
  templateUrl: './must-login.component.html',
  styleUrls: ['./must-login.component.scss']
})
export class MustLoginComponent implements OnInit {

  constructor(
    public publicVar: PublicVarService,
  ) { }

  ngOnInit() {
  }

}
