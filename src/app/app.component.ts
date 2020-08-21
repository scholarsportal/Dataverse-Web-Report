import {Component, OnInit, Input, ViewChild, AfterViewInit} from '@angular/core';
import { ReportComponent } from './report/report.component';
import { MultiselectComponent } from './multiselect/multiselect.component';
import { MetricsService } from './metrics.service';
import { MatomoInjector } from 'ngx-matomo';
import { ConfigService } from './config.service';
import { environment } from './../environments/environment';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Dataverse Report';
  dateRange: string;
  selection: any = [];
  chartData: Array<any>;
  chartData1: Array<any>;
  chartData2: Array<any>;
  pieChartData: Array<any>;
  pieChartData2: Array<any>;
  // dynamically update the chart title depending on the number of bars
  chartTitle2 = '';
  chartTitle1 = '';
  show = true;
  private reports: any = [];
  private listUrl;
  private reportUrl;
  private listEndpoint = '/api/metrics/list';
  private reportEndpoint = '/api/metrics/report';


  @ViewChild(ReportComponent, { static: false }) reportComponent: ReportComponent;
  @ViewChild(MultiselectComponent, { static: false }) multiselectComponent: MultiselectComponent;
  constructor(private metrics: MetricsService,
              private config: ConfigService,
              private matomoInjector: MatomoInjector) {
    this.matomoInjector.init(this.config.baseUrl, this.config.id);
    this.selection = this.getParameterByName('selection');
  }

  private getParameterByName(name) {
    const url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    const results = regex.exec(url);
    if (!results) { return null; }
    if (!results[2]) { return ''; }
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }

  ngOnInit() {
    this.listUrl = environment.apiUrl + this.listEndpoint;
    this.reportUrl = environment.apiUrl + this.reportEndpoint;
    this.listReports();
  }

  listReports() {
    this.metrics.getReportsList().subscribe((data: any[]) => {
      data.forEach((datum) => {
        this.reports.push({name: datum, url: this.reportUrl + '?date=' + datum});
      });
    });
  }

  createChart(data) {
    this.chartData = data;
  }

  createChart1(data) {
    this.chartTitle1 = 'Number of Datasets by Dataverse';
    if (typeof(data) !== 'undefined' && data.length > 15) {
      this.chartData1 = data.slice(0, 15);
      this.chartTitle1 += ' (Top 15)';
    } else {
      this.chartData1 = data;
    }
  }
  createChart2(data) {
    // restrict to top 15
    this.chartTitle2 = 'Size of Dataverses';
    if (typeof(data) !== 'undefined' && data.length > 15 ) {
      this.chartData2 = data.slice(0 , 15);
      this.chartTitle2 += ' (Top 15)';
    } else {
      this.chartData2 = data;
    }
  }

  createPieChart(data) {
    this.pieChartData = data;
  }

  createPieChart2(data) {
    this.pieChartData2 = data;
  }

  updateDateRange(str) {
    this.dateRange = str;
  }

  createDropdown(options) {
    setTimeout(() => {
      this.multiselectComponent.createMultiselectComponent(options);
    });
  }

  updateCharts(selection) {
    const newurl = window.location.protocol + '//' + window.location.host + window.location.pathname + '?selection=' + selection;
    window.history.pushState({path: newurl}, '', newurl);
    // the following broadcasts to regenerate the data which in turn updates the charts
    this.reportComponent.updateTotals(selection);
  }

}
