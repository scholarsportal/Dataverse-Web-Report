import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {HttpClientModule} from '@angular/common/http';
import {FormsModule} from '@angular/forms';//required for ngModel
import { MultiselectDropdownModule } from 'angular-2-dropdown-multiselect';
import { AngularFontAwesomeModule } from 'angular-font-awesome';

import { AppComponent } from './app.component';
import { ReportComponent } from './report/report.component';
import { ChartComponent } from './chart/chart.component';
import {MultiselectComponent} from './multiselect/multiselect.component';
import { PiechartComponent } from './piechart/piechart.component';


@NgModule({
  declarations: [
    AppComponent,
    ReportComponent,
    ChartComponent,
    MultiselectComponent,
    PiechartComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    MultiselectDropdownModule,
    AngularFontAwesomeModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
