import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; // required for ngModel
import { MultiselectDropdownModule } from 'angular-2-dropdown-multiselect';
import { AppComponent } from './app.component';
import { ReportComponent } from './report/report.component';
import { ChartComponent } from './chart/chart.component';
import { MultiselectComponent } from './multiselect/multiselect.component';
import { PiechartComponent } from './piechart/piechart.component';
import { SumPipe } from './_pipes/sum.pipe';
import { WindowRefService } from './window-ref.service';


@NgModule({
  declarations: [
    AppComponent,
    ReportComponent,
    ChartComponent,
    MultiselectComponent,
    PiechartComponent,
    SumPipe
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    MultiselectDropdownModule
  ],
  providers: [WindowRefService],
  bootstrap: [AppComponent]
})
export class AppModule { }
