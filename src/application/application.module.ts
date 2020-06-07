import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DeviceDetectorModule } from 'ngx-device-detector';
import { NgxUiLoaderHttpModule, NgxUiLoaderModule } from 'ngx-ui-loader';
import { BaseMapComponent } from './map-view/base-map/base-map.component';
import { ContextMenuComponent } from './map-view/context-menu/context-menu.component';
import { AttributeLayerComponent } from './map-view/controller/attribute-layer/attribute-layer.component';
import { MeasureComponent } from './map-view/controller/measure/measure.component';
import { MiniMapComponent } from './map-view/controller/mini-map/mini-map.component';
import { MousePositionComponent } from './map-view/controller/mouse-position/mouse-position.component';
import { ScaleLineComponent } from './map-view/controller/scale-line/scale-line.component';
import { SendFeedbackComponent } from './map-view/controller/send-feedback/send-feedback.component';
import { PopupLocationComponent } from './map-view/controller/user-location/popup-location/popup-location.component';
import { UserLocationComponent } from './map-view/controller/user-location/user-location.component';
import { ZoomComponent } from './map-view/controller/zoom/zoom.component';
import { DirectionComponent } from './map-view/utility/direction/direction.component';
import { MenuComponent } from './map-view/utility/menu/menu.component';
import { AboutUsComponent } from './map-view/utility/menu/navigation/about-us/about-us.component';
import { LableComponent } from './map-view/utility/menu/navigation/lable/lable.component';
import { NavigationComponent } from './map-view/utility/menu/navigation/navigation.component';
import { OddEvenComponent } from './map-view/utility/menu/navigation/odd-even/odd-even.component';
import { StyleModeComponent } from './map-view/utility/menu/navigation/style-mode/style-mode.component';
import { SwitchPoiComponent } from './map-view/utility/menu/navigation/switch-poi/switch-poi.component';
import { TerrainComponent } from './map-view/utility/menu/navigation/terrain/terrain.component';
import { TrafficAreaComponent } from './map-view/utility/menu/navigation/traffic-area/traffic-area.component';
import { TrafficComponent } from './map-view/utility/menu/navigation/traffic/traffic.component';
import { FavoritHomeComponent } from './map-view/utility/menu/navigation/your-places/favorit-home/favorit-home.component';
import { FavoritWorkComponent } from './map-view/utility/menu/navigation/your-places/favorit-work/favorit-work.component';
import { YourPlacesComponent } from './map-view/utility/menu/navigation/your-places/your-places.component';
import { CoordinateComponent } from './map-view/utility/more-search/coordinate/coordinate.component';
import { IntersectionComponent } from './map-view/utility/more-search/intersection/intersection.component';
import { MoreSearchComponent } from './map-view/utility/more-search/more-search.component';
import { PoiComponent } from './map-view/utility/more-search/poi/poi.component';
import { StreetComponent } from './map-view/utility/more-search/street/street.component';
import { SearchBoxComponent } from './map-view/utility/search-box/search-box.component';
import { UtilityComponent } from './map-view/utility/utility.component';
import { AddMissingPlaceComponent } from './partial/add-missing-place/add-missing-place.component';
import { CloseComponent } from './partial/close/close.component';
import { ChangePasswordComponent } from './partial/login/change-password/change-password.component';
import { ForgetPassComponent } from './partial/login/forget-pass/forget-pass.component';
import { LoginPageComponent } from './partial/login/login-page/login-page.component';
import { LoginComponent } from './partial/login/login.component';
import { SigninComponent } from './partial/login/signin/signin.component';
import { VerificationCodeComponent } from './partial/login/verification-code/verification-code.component';
import { MenuIconComponent } from './partial/menu-icon/menu-icon.component';
import { MustLoginComponent } from './partial/must-login/must-login.component';
import { PopupErrorComponent } from './partial/popup-error/popup-error.component';
import { PopupSuccessComponent } from './partial/popup-success/popup-success.component';
import { ReportErrorComponent } from './partial/report-error/report-error.component';
import { AutofocusDirective } from './shared/directive/autofocus.directive';
import { HoverButtonDirective } from './shared/directive/hover-button.directive';
import { TooltipsDirective } from './shared/directive/tooltips.directive';
import { NoCommaPipe } from './shared/pipe/no-comma.pipe';

@NgModule({
 declarations: [
  BaseMapComponent,
  ContextMenuComponent,
  AttributeLayerComponent,
  MeasureComponent,
  MiniMapComponent,
  MousePositionComponent,
  ScaleLineComponent,
  SendFeedbackComponent,
  UserLocationComponent,
  ZoomComponent,
  PopupLocationComponent,
  UtilityComponent,
  DirectionComponent,
  MenuComponent,
  MoreSearchComponent,
  AutofocusDirective,
  HoverButtonDirective,
  TooltipsDirective,
  SearchBoxComponent,
  NavigationComponent,
  AboutUsComponent,
  LableComponent,
  OddEvenComponent,
  SwitchPoiComponent,
  TerrainComponent,
  TrafficComponent,
  TrafficAreaComponent,
  YourPlacesComponent,
  FavoritHomeComponent,
  FavoritWorkComponent,
  CoordinateComponent,
  IntersectionComponent,
  PoiComponent,
  StreetComponent,
  NoCommaPipe,
  AddMissingPlaceComponent,
  CloseComponent,
  LoginComponent,
  MenuIconComponent,
  MustLoginComponent,
  PopupErrorComponent,
  PopupSuccessComponent,
  ReportErrorComponent,
  ChangePasswordComponent,
  ForgetPassComponent,
  LoginPageComponent,
  SigninComponent,
  VerificationCodeComponent,
  StyleModeComponent,
 ],
 imports: [
  CommonModule,
  FormsModule,
  ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' }),
  BrowserModule,
  HttpClientModule,
  BrowserAnimationsModule,
  DeviceDetectorModule.forRoot(),
  NgxUiLoaderModule,
  NgxUiLoaderHttpModule.forRoot({
   showForeground: true,
   exclude: [
    'http://45.82.138.85:4001/api/user/CheckEmailUnique',
    // 'http://45.82.138.85:3000/api/map/identify',
    'https://freegeoip.app/json/',
    'https://api.ipify.org?format=json'
   ],
  }),
 ],
 exports: [ BaseMapComponent ],
 providers: [
  ReportErrorComponent,
  AddMissingPlaceComponent,
  YourPlacesComponent,
  DirectionComponent,
  UtilityComponent,
  MenuComponent,
  FavoritWorkComponent,
  FavoritHomeComponent,
  MeasureComponent,
  CoordinateComponent,
  PoiComponent,
  IntersectionComponent,
  StreetComponent,
 ],
})
export class ApplicationModule {}
