import { Component, OnInit, Output,Input, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit {
  @Output() parentCreateChart: EventEmitter<any> = new EventEmitter<any>();
  @Output() parentCreateChart1: EventEmitter<any> = new EventEmitter<any>();
  @Output() parentCreateChart2: EventEmitter<any> = new EventEmitter<any>();
  @Output() parentCreateDropdown: EventEmitter<any> = new EventEmitter<any>();
  @Output() parentCreatePieChart: EventEmitter<any> = new EventEmitter<any>();
  @Output() parentCreatePieChart2: EventEmitter<any> = new EventEmitter<any>();
  @Output() parentChangeDateRange: EventEmitter<any> = new EventEmitter<string>();

  constructor(private http: HttpClient) { }
  dataverses: {id:number, name:string}[];
  csv_data: any[] = [];
  selection: any[] = [];
  date_range:"";
  //
  file_type_lookup : any[] = [["zip","ZIP"], ["application/pdf","PDF"],["application/msword", "Word"],["application/vnd.ms-excel", "Excel"]];

  ngOnInit() {
    this.dataverses = [];
    //the following loads mulitple csv files and processes them to be used in chart generation
    this.loadCSV('assets/Downloads_by_Dataverse.csv',0,this.parseFeed);
    this.loadCSV('assets/Downloads_by_Dataset.csv',1,this.parseFeed1);
    this.loadCSV('assets/Subjects.csv',2,this.parseFeed2);
    this.loadCSV('assets/File_Types.csv',3,this.parseFeed3);
  }

  loadCSV(file_name,id,func){
    this.http.get(file_name, {responseType: 'text'})
      .subscribe(
        data => this.extractData(data,id),
        error => console.log(error),
        ()=>func(this,id)
        );
  }
  //https://stackoverflow.com/questions/8493195/how-can-i-parse-a-csv-string-with-javascript-which-contains-comma-in-data
  private CSVtoArray(text) {
    var re_valid = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/;
    var re_value = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g;
    // Return NULL if input string is not well formed CSV string.
    if (!re_valid.test(text)) return null;
    var a = [];                     // Initialize array to receive values.
    text.replace(re_value, // "Walk" the string using replace with callback.
      function(m0, m1, m2, m3) {
        // Remove backslash from \' in single quoted values.
        if      (m1 !== undefined) a.push(m1.replace(/\\'/g, "'"));
        // Remove backslash from \" in double quoted values.
        else if (m2 !== undefined) a.push(m2.replace(/\\"/g, '"'));
        else if (m3 !== undefined) a.push(m3);
        return ''; // Return empty string.
      });
    // Handle special case of empty last value.
    if (/,\s*$/.test(text)) a.push('');
    return a;
  };
  private extractData(res: String,id) {
   let csv_data = res
    let allTextLines = csv_data.split(/\r\n|\n/);
    let lines = [];

    for ( let i = 0; i < allTextLines.length; i++) {
      // split
      let data = this.CSVtoArray(allTextLines[i]);
      //failsafe
      if(data==null){
        data=allTextLines[i].split(",");
      }

      if (data && typeof (data.length)!="undefined") {
        let tarr = [];
        for ( let j = 0; j < data.length; j++) {
          tarr.push(data[j]);
        }
        lines.push(tarr);
      }
    }//
    this.csv_data[id] = lines;
  }
  //parse download feed
  private parseFeed(obj,id){
    // keep track of all the dataverse names
    // disregard the first item and the last
    if(obj.dataverses.length==0) {
      for (var i = 1; i < obj.csv_data[id].length - 2; i++) {
        //make sure its published
        if(obj.csv_data[id][i][2]!="") {
          obj.dataverses.push({id: i, name: obj.csv_data[id][i][0]});
        }
      }


      obj.dataverses.sort(function s(a,b) {
        if (a.name.toUpperCase() < b.name.toUpperCase())
          return -1;
        if (a.name.toUpperCase() > b.name.toUpperCase())
          return 1;
        return 0;
      });
      //
      obj.parentCreateDropdown.emit(obj.dataverses);
    }
    //
    var chart_data = obj.getTotals(id,obj.getSubject);
    obj.parentCreateChart.emit( chart_data );
  }
  //parse dataset count
  private parseFeed1(obj,id){
    var chart_data = obj.getTotals1(id,"count");
    obj.parentCreateChart1.emit( chart_data );
    //
    var chart_data = obj.getTotals1(id,"size");
    obj.parentCreateChart2.emit( chart_data );
  }
  //parse the subject feed
  private parseFeed2(obj,id){
   var chart_data = obj.getTotals2(id,obj.getSubject);
    obj.parentCreatePieChart.emit( chart_data );
  }
  //parse the type feed
  private parseFeed3(obj,id){
    var chart_data = obj.getTotals2(id,obj.getSubject1);
   obj.parentCreatePieChart2.emit( chart_data );
  }
  /////////
  private getSelectionNames(){
   var selection_names=[];
    if(this.selection){
      //need to get the selection name -- note the ids are off due to header
        for(var i = 0; i < this.dataverses.length; i++) {
          for(var j = 0; j < this.selection.length; j++){
            if(this.dataverses[i].id==this.selection[j]){
              selection_names.push(this.dataverses[i].name)
            }

        }
      }
    }
    return selection_names;
  }

  //
  private getTotals(id) {
    var totals = <any>[];
    // step 1. get the slots for the totals
    for (var j = 0; j < this.csv_data[id][0].length; j++) {
      // first create the attribute
      if (typeof(totals[j]) === 'undefined') {
        totals.push(0);
      }
    }
    ///
    for (var i = 0; i < this.csv_data[id].length; i++) {
      // only take the data which is selected or use all the data
      if (this.selection.indexOf(i) > -1 || this.selection.length==0) {
        for (var j = 0; j < this.csv_data[id][i].length; j++) {
          if (!isNaN(this.csv_data[id][i][j])) {
            totals[j] = totals[j] + Number(this.csv_data[id][i][j]);
          }
        }
      }
    }
    // we just want a subset of the data
    var chart_data = [];
    var start = 3;
    for (let i = start; i < totals.length - 1; i++) {
    chart_data.push([
        this.csv_data[id][0][i],
        totals[i]
      ]);
      // get the range
      if (i === start) {
        this.date_range = this.csv_data[id][0][i];
      } else if (i === totals.length - 2 ) {
        this.date_range += ' to ' + this.csv_data[id][0][i];
        this.parentChangeDateRange.emit(this.date_range);
      }
    }
    totals = chart_data;
    return totals;
  }
  private getTotals1(id,variable) {
    //count the number of datasets within a dataverse
    //create a two demensional array [[title,count]]
    //group by dataverse or just the first column
    var max_length=18;
    var indexed_array={};
    var chart_data = <any>[];
    //
    var selection_names=this.getSelectionNames();

    if(typeof(this.csv_data[id])=="undefined"){
      return;
    }
    var status_slot = this.csv_data[id][0].indexOf("Status");
    var size_slot = this.csv_data[id][0].indexOf("Size (KB)");
    //
    for (var i = 1; i < this.csv_data[id].length-1; i++) {//
      var row = this.csv_data[id][i];
      if(row[status_slot]=="RELEASED"){
        //depending on the selection use either all the top level dataverses or the second level one
        var name=row[0];
        if(selection_names.indexOf(name)>-1 || selection_names.length==0  ) {
          if(selection_names.length>0){
            name=row[1];
          }
          if (typeof(indexed_array[name]) == 'undefined') {
            indexed_array[name] = {count: 0, size: 0};
          }
          indexed_array[name].count += 1
          indexed_array[name].size += Number(row[size_slot]) / 1048576;
        }
      }
    }
    //convert the json into a two demensional array
    for (var o in indexed_array) {//
      //var strip the dataverse part
      var name:any = o;
      if(name.indexOf(" Dataverse")>-1){
        name=name.substring(0,name.indexOf(" Dataverse"))
      }
      if(name.length>max_length){
        name=name.substring(0,max_length)+"..."
      }
      chart_data.push([
        name,indexed_array[o][variable]
      ])
    }
    //sort it
    chart_data.sort(function(a, b) {
      a = a[1];
      b = b[1];
      return a > b ? -1 : (a < b ? 1 : 0);
    });
    //
    return chart_data
  }
  //
  // parse the feed filtering by selections
  private getTotals2(id,subjectFunc) {
    var chart_data = <any>[];
    //
    var selection_names=this.getSelectionNames();

    if(typeof(this.csv_data[id])=="undefined"){
      return;
    }
    var status_slot = this.csv_data[id][0].indexOf("Status");
    var subjects=[];
    var sub_start=8;
    var sub_end=this.csv_data[id][0].length

    //create an array of subjects for quick lookup
    for (var i = sub_start; i < sub_end; i++) {
      subjects.push(this.csv_data[id][0][i])
    }
    //
    for (var i = 1; i < this.csv_data[id].length-1; i++) {//
      var row = this.csv_data[id][i];
      if(row[status_slot]=="RELEASED"){
        if(selection_names.indexOf(row[0])>-1 || selection_names.length==0  ) {
          var k = -1;
          for (var j = sub_start; j < sub_end - 1; j++) {
            k++
            if (Number(row[j]) > 0) {
              var subject = subjectFunc(this, subjects[k])
              chart_data.push({family: subject})
            }
          }
        }
      }
    }
    //
    return chart_data
  }

  private getSubject(obj,subject) {
    return subject;

  }
  private getSubject1(obj,subject) {
    var subject_new=subject.substring(0,subject.indexOf("/"));//Only difference
    subject_new=subject_new.charAt(0).toUpperCase() + subject_new.slice(1);
    //add a few sub catagories
    for(var l = 0; l < obj.file_type_lookup.length; l++){
      if(subject.indexOf(obj.file_type_lookup[l][0])>-1){
        subject_new=obj.file_type_lookup[l][1];
      }
    }
    return subject_new
  }

  //** the entry point from the root app **/
  public updateTotals(selection) {
    this.selection = selection;
    //
    this.parseFeed(this,0);
    this.parseFeed1(this,1);
    this.parseFeed2(this,2);
    this.parseFeed3(this,3);
    //

  }
}

interface ItemsResponse {
  results: string[];
}
