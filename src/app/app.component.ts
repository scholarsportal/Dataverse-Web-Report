import { Component, OnInit, ViewChild } from '@angular/core';
import { ReportComponent } from './report/report.component';
import { MultiselectComponent } from './multiselect/multiselect.component';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'Dataverse Report';
  selection: any = [];
  private chartData: Array<any>;
  private chartData1: Array<any>;
  private chartData2: Array<any>;
  private pieChartData: Array<any>;
  private pieChartData2: Array<any>;
  //
  @ViewChild(ReportComponent) reportComponent : ReportComponent;
  @ViewChild(MultiselectComponent) multiselectComponent : MultiselectComponent;

  constructor() {
    this.selection=this.getParameterByName('selection');

  }
  private getParameterByName(name) {
    var url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }

  ngOnInit() {
  }
  createChart(data){
    this.chartData = data;
  }
  createChart1(data){
    this.chartData1 = data;
  }
  createChart2(data){
    this.chartData2 = data;
  }
  createPieChart(data){
    this.pieChartData = data;

  }
  createPieChart2(data){
    this.pieChartData2 = data;
  }


  createDropdown(options){
    this.multiselectComponent.createMultiselectComponent(options);
  }
  updateCharts(selection){

    var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?selection='+selection;
    window.history.pushState({path:newurl},'',newurl);
    //the following broadcasts to regenerate the data which in turn updates the charts
    this.reportComponent.updateTotals(selection);

  }

}
