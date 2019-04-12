import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
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
  dataverses: {id: number, name: string}[];
  csvData: any[] = [];
  selection: any[] = [];
  dateRange: '';
  fileTypeLookup: any[] = [
    ['zip', 'ZIP'],
    ['application/pdf', 'PDF'],
    ['application/msword', 'Word'],
    ['application/vnd.ms-excel', 'Excel']
  ];

  ngOnInit() {
    this.dataverses = [];
    // the following loads multiple csv files and processes them to be used in chart generation
    this.loadCSV('assets/Downloads_by_Dataverse.csv', 0, this.parseFeed);
    this.loadCSV('assets/Downloads_by_Dataset.csv', 1, this.parseFeed1);
    this.loadCSV('assets/Subjects.csv', 2, this.parseFeed2);
    this.loadCSV('assets/File_Types.csv', 3, this.parseFeed3);
  }

  loadCSV(fileName, id, func) {
    this.http.get(fileName, {responseType: 'text'})
      .subscribe(
        data => this.extractData(data,id),
        error => console.log(error),
        () => func(this, id)
      );
  }

  // https://stackoverflow.com/questions/8493195/how-can-i-parse-a-csv-string-with-javascript-which-contains-comma-in-data
  private CSVtoArray(text) {
    let ret = [''], i = 0, p = '', s = true;
    for (let l in text) {
      l = text[l];
      if ('"' === l) {
        s = !s;
        if ('"' === p) {
          ret[i] += '"';
          l = '-';
        } else if ('' === p)
          l = '-';
      } else if (s && ',' === l) {
        l = ret[++i] = '';
      } else {
        ret[i] += l;
      }
      p = l;
    }
    return ret;
  };

  private extractData(res: String, id) {
    const csvData = res;
    const allTextLines = csvData.split(/\r\n|\n/);
    const lines = [];

    for (let i = 0; i < allTextLines.length; i++) {
      // split
      let data = this.CSVtoArray(allTextLines[i]);
      // failsafe
      if (data == null) {
        data = allTextLines[i].split(',');
      }

      if (data && typeof (data.length) !== 'undefined') {
        const tarr = [];
        for (let j = 0; j < data.length; j++) {
          tarr.push(data[j]);
        }
        lines.push(tarr);
      }
    }
    this.csvData[id] = lines;
  }
  // parse download feed
  private parseFeed(obj, id) {
    // keep track of all the dataverse names
    // disregard the first item and the last
    if (obj.dataverses.length === 0) {
      for (let i = 1; i < obj.csvData[id].length - 2; i++) {
        // make sure its published
        if (obj.csvData[id][i][2] !== '') {
          obj.dataverses.push({id: i, name: obj.csvData[id][i][0]});
        }
      }
      obj.parentCreateDropdown.emit(obj.dataverses);
    }

    let chartData = obj.getTotals(id, obj.getSubject);
    obj.parentCreateChart.emit(chartData);
  }

  // parse dataset count
  private parseFeed1(obj, id) {
    let chartData = obj.getTotals1(id, 'count');
    obj.parentCreateChart1.emit( chartData );

    chartData = obj.getTotals1(id, 'size');
    obj.parentCreateChart2.emit( chartData );
  }

  // parse the subject feed
  private parseFeed2(obj, id) {
    const chartData = obj.getTotals2(id, obj.getSubject);
    obj.parentCreatePieChart.emit( chartData );
  }

  // parse the type feed
  private parseFeed3(obj, id) {
    const chartData = obj.getTotals2(id, obj.getSubject1);
    obj.parentCreatePieChart2.emit(chartData);
  }

  private getSelectionNames() {
    const selectionNames = [];
    if (this.selection) {
      // need to get the selection name -- note the ids are off due to header
      for (let i = 0; i < this.dataverses.length; i++) {
        for (let j = 0; j < this.selection.length; j++) {
          if (this.dataverses[i].id==this.selection[j]) {
            selectionNames.push(this.dataverses[i].name);
          }
        }
      }
    }
    return selectionNames;
  }

  private getTotals(id) {
    let totals = <any>[];
    // step 1. get the slots for the totals
    for (let j = 0; j < this.csvData[id][0].length; j++) {
      // first create the attribute
      if (typeof(totals[j]) === 'undefined') {
        totals.push(0);
      }
    }

    for (let i = 0; i < this.csvData[id].length; i++) {
      // only take the data which is selected or use all the data
      if (this.selection.indexOf(i) > -1 || this.selection.length === 0) {
        for (let j = 0; j < this.csvData[id][i].length; j++) {
          if (!isNaN(this.csvData[id][i][j])) {
            totals[j] = totals[j] + Number(this.csvData[id][i][j]);
          }
        }
      }
    }

    // we just want a subset of the data
    const chartData = [];
    const start = 3;
    for (let i = start; i < totals.length - 2; i++) { // omit the last two columns hiding totals
      chartData.push([
        this.csvData[id][0][i],
        totals[i]
      ]);
      // get the range
      if (i === start) {
        this.dateRange = this.csvData[id][0][i];
      } else if (i === totals.length - 3 ) { // omit the last 2 header cols containing totals
        this.dateRange += ' to ' + this.csvData[id][0][i];
        this.parentChangeDateRange.emit(this.dateRange);
      }
    }
    totals = chartData;
    return totals;
  }
  private getTotals1(id, variable) {
    // count the number of datasets within a dataverse
    // create a two dimensional array [[title,count]]
    // group by dataverse or just the first column
    const maxLength = 18;
    const indexedArray = {};
    const chartData = <any>[];
    const selectionNames = this.getSelectionNames();

    if(typeof(this.csvData[id]) === 'undefined') {
      return;
    }

    const statusSlot = this.csvData[id][0].indexOf('Status');
    let sizeSlot = this.csvData[id][0].indexOf('Size (KB)');

    for (let i = 1; i < this.csvData[id].length - 1; i++) {
      let row = this.csvData[id][i];
      if (row[statusSlot] === 'RELEASED') {
        // depending on the selection use either all the top level dataverses or the second level one
        let name = row[0];
        if (selectionNames.indexOf(name) > -1 || selectionNames.length === 0  ) {
          if (selectionNames.length > 0) {
            name = row[1];
          }
          if (typeof(indexedArray[name]) === 'undefined') {
            indexedArray[name] = {count: 0, size: 0};
          }
          indexedArray[name].count += 1;
          indexedArray[name].size += Number(row[sizeSlot]) / 1048576;
        }
      }
    }
    // convert the json into a two dimensional array
    for (let o in indexedArray) {
      // let strip the dataverse part
      let name: any = o;
      if (name.indexOf(" Dataverse") > -1) {
        name = name.substring(0, name.indexOf(" Dataverse"))
      }
      if (name.length > maxLength) {
        name = name.substring(0, maxLength) + '...';
      }
      chartData.push([
        name, indexedArray[o][variable]
      ])
    }

    // sort it
    chartData.sort(function(a, b) {
      a = a[1];
      b = b[1];
      return a > b ? -1 : (a < b ? 1 : 0);
    });

    // group matching records and add totals
    const groupedData = [];
    for (let i = 0; i < chartData.length; i++) {
      const index = groupedData.findIndex(groupedData => groupedData[0] === chartData[i][0]);

      if (index === -1) {
        groupedData.push(chartData[i]);
      } else {
        groupedData[index][1] += chartData[i][1];
      }
    }
    return groupedData;
  }

  // parse the feed filtering by selections
  private getTotals2(id, subjectFunc) {
    const chartData = <any>[];
    const selectionNames = this.getSelectionNames();

    if (typeof(this.csvData[id]) === 'undefined') {
      return;
    }

    const statusSlot = this.csvData[id][0].indexOf('Status');
    const subjects = [];
    const subStart = 8;
    const subEnd = this.csvData[id][0].length;

    // create an array of subjects for quick lookup
    for (let i = subStart; i < subEnd; i++) {
      subjects.push(this.csvData[id][0][i]);
    }

    for (let i = 1; i < this.csvData[id].length - 1; i++) {
      const row = this.csvData[id][i];
      if (row[statusSlot] === 'RELEASED') {
        if (selectionNames.indexOf(row[0]) > -1 || selectionNames.length === 0) {
          let k = -1;
          for (let j = subStart; j < subEnd - 1; j++) {
            k++;
            if (Number(row[j]) > 0) {
              const subject = subjectFunc(this, subjects[k]);
              chartData.push({family: subject});
            }
          }
        }
      }
    }
    return chartData;
  }

  private getSubject(obj, subject) {
    return subject;
  }

  private getSubject1(obj, subject) {
    let subjectNew = subject.substring(0, subject.indexOf('/')); // Only difference
    subjectNew = subjectNew.charAt(0).toUpperCase() + subjectNew.slice(1);
    // add a few sub categories
    for (let l = 0; l < obj.fileTypeLookup.length; l++){
      if (subject.indexOf(obj.fileTypeLookup[l][0]) > -1) {
        subjectNew = obj.fileTypeLookup[l][1];
      }
    }
    return subjectNew;
  }

  // ** the entry point from the root app **/
  public updateTotals(selection) {
    this.selection = selection;
    this.parseFeed(this, 0);
    this.parseFeed1(this, 1);
    this.parseFeed2(this, 2);
    this.parseFeed3(this, 3);
  }
}

interface ItemsResponse {
  results: string[];
}
