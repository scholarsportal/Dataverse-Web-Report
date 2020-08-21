import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import { FormsModule } from '@angular/forms'; // required for ngModel
import { MultiselectDropdownModule } from 'angular-2-dropdown-multiselect';
import { AppComponent } from './app.component';
import { ReportComponent } from './report/report.component';
import { ChartComponent } from './chart/chart.component';
import { MultiselectComponent } from './multiselect/multiselect.component';
import { PiechartComponent } from './piechart/piechart.component';
import { SumPipe } from './_pipes/sum.pipe';
import { WindowRefService } from './window-ref.service';

import { MatomoModule } from 'ngx-matomo';

import { APP_INITIALIZER } from '@angular/core';
import { ConfigService } from './config.service';
import { of, Observable, ObservableInput } from '../../node_modules/rxjs';
import { map, catchError } from 'rxjs/operators';

export function load(http: HttpClient, config: ConfigService): (() => Promise<boolean>) {
  return (): Promise<boolean> => {
    return new Promise<boolean>((resolve: (a: boolean) => void): void => {
      console.log("Here");
      http.get('./assets/config.json')
        .pipe(
          map((x: ConfigService) => {
            config.baseUrl = x.baseUrl;
            console.log(config.baseUrl);
            config.id = x.id;
            resolve(true);
          }),
          catchError((x: { status: number }, caught: Observable<void>): ObservableInput<{}> => {
            if (x.status !== 404) {
              resolve(false);
            }
            config.baseUrl = '';
            config.id = -1;
            resolve(true);
            return of({});
          })
        ).subscribe();
    });
  };
}

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
    MultiselectDropdownModule,
    MatomoModule
  ],
  providers: [WindowRefService,  {
    provide: APP_INITIALIZER,
    useFactory: load,
    deps: [
      HttpClient,
      ConfigService
    ],
    multi: true
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
