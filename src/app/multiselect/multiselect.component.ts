// Ref https://embed.plnkr.co/MzukQC8M7l0xUKBC0wL5/

import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { IMultiSelectOption, IMultiSelectSettings, IMultiSelectTexts  } from 'angular-2-dropdown-multiselect';
@Component({
  selector: 'app-multiselect',
  templateUrl: './multiselect.component.html',
  styleUrls: ['./multiselect.component.scss']
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
    const selection = [];
    if (this.selection != 0) {
      const selectionStr = this.selection;
      try {
        const selectionStrArray = selectionStr.split(',');
        for (let i = 0; i < selectionStrArray.length; i++) {
          selection.push(Number(selectionStrArray[i]));
        }
      } catch (e) {}
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
      selectionLimit: 1,
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

  createMultiselectComponent(options) {
    // labels
    // strip the names
    const _options = [];
    for (let i = 0; i < options.length; i++) {
      const tempObj = Object.assign({}, options[i]);
      tempObj.name = tempObj.name.replace(/['"]+/g, '');
      _options.push(tempObj);
    }

    _options.sort(function s(a, b) {
      if (a.name.toUpperCase() < b.name.toUpperCase()) {
        return -1;
      }
      if (a.name.toUpperCase() > b.name.toUpperCase()) {
        return 1;
      }
      return 0;
    });

    this.myOptions = _options;
  }
  onChange(e) {
    this.parentUpdateCharts.emit( this.optionsModel );
  }
}
