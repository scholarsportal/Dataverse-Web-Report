//Ref https://embed.plnkr.co/MzukQC8M7l0xUKBC0wL5/

import { Component, OnInit, Input, Output, EventEmitter  } from '@angular/core';
import { IMultiSelectOption,IMultiSelectSettings, IMultiSelectTexts  } from 'angular-2-dropdown-multiselect';
@Component({
  selector: 'app-multiselect',
  templateUrl: './multiselect.component.html',
  styleUrls: ['./multiselect.component.css']
})
export class MultiselectComponent implements OnInit {
  @Output() parentUpdateCharts: EventEmitter<any> = new EventEmitter<any>();
  myOptions: IMultiSelectOption[];
  @Input() selection: any = [];
  optionsModel: number[];
  myTexts: IMultiSelectTexts;
  mySettings: IMultiSelectSettings;
  constructor() { }

  ngOnInit() {
    var selection = [];
    if (this.selection != 0) {
      var selection_str = this.selection;
      try {
        var selection_str_array = selection_str.split(",");
        for (let i = 0; i < selection_str_array.length; i++) {
          selection.push(Number(selection_str_array[i]));
        }
      } catch (e) {

      }
    }
    // set the default selection
   this.optionsModel = selection;
   this.mySettings = {
      enableSearch: true,
      buttonClasses: 'btn btn-default btn-block',
      dynamicTitleMaxItems: 3,
      displayAllSelectedText: true,
      showCheckAll: false,
      showUncheckAll: true,
      checkedStyle: 'fontawesome',
     closeOnSelect: true,
     selectionLimit : 1,
     autoUnselect: true

   };
     this.myTexts = {
      checkAll: 'Select all',
      uncheckAll: 'Unselect ',
      checked: 'item selected',
      checkedPlural: 'items selected',
      searchPlaceholder: 'Find',
      searchEmptyResult: 'Nothing found...',
      searchNoRenderText: 'Type in search box to see results...',
      defaultTitle: 'Select Dataverse',
      allSelected: 'All selected',
    };
  }

  createMultiselectComponent(options){
    //labels
    this.myOptions=options;
  }
  onChange(e) {
    this.parentUpdateCharts.emit( this.optionsModel );
  }
}
