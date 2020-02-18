import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ReportComponent } from './report/report.component';
import { MultiselectComponent } from './multiselect/multiselect.component';
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

  @ViewChild(ReportComponent, { static: true }) reportComponent: ReportComponent;
  @ViewChild(MultiselectComponent, { static: true }) multiselectComponent: MultiselectComponent;

  constructor() {
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
    this.multiselectComponent.createMultiselectComponent(options);
  }

  updateCharts(selection) {
    const newurl = window.location.protocol + '//' + window.location.host + window.location.pathname + '?selection=' + selection;
    window.history.pushState({path: newurl}, '', newurl);
    // the following broadcasts to regenerate the data which in turn updates the charts
    this.reportComponent.updateTotals(selection);
  }

}
