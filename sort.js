/*
 *   This content is licensed according to the W3C Software License at
 *   https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
 *
 *   File:   sortable-table.js
 *
 *   Desc:   Adds sorting to a HTML data table that implements ARIA Authoring Practices
 */

'use strict';
class SortableTable {
  constructor(tableNode) {
    this.tableNode = tableNode;
    this.columnHeaders = tableNode.querySelectorAll('thead th:not(.no-sort)');
    this.sortColumns = [];

    for (var i = 0; i < this.columnHeaders.length; i++) {
      var ch = this.columnHeaders[i];
      var buttonNode = ch//.querySelector('span');
      if (buttonNode) {
        this.sortColumns.push(i);
        buttonNode.setAttribute('data-column-index', i);
        buttonNode.addEventListener('click', this.handleClick.bind(this));
      }
    }

    this.optionCheckbox = document.querySelector(
      'input[type="checkbox"][value="show-unsorted-icon"]'
    );

    if (this.optionCheckbox) {
      this.optionCheckbox.addEventListener(
        'change',
        this.handleOptionChange.bind(this)
      );
      if (this.optionCheckbox.checked) {
        this.tableNode.classList.add('show-unsorted-icon');
      }
    }
  }

  setColumnHeaderSort(columnIndex) {
    if (typeof columnIndex === 'string') {
      columnIndex = parseInt(columnIndex);
    }

    for (var i = 0; i < this.columnHeaders.length; i++) {
      var ch = this.columnHeaders[i];
      var buttonNode = ch.querySelector('button');
      if (i === columnIndex) {
        var value = ch.getAttribute('aria-sort');
        var new_value = value === 'descending' ? 'ascending' : 'descending'
        ch.setAttribute('aria-sort', new_value);
        this.sortColumn(
          columnIndex,
          new_value,
          ch.className
        );
      } else {
        if (ch.hasAttribute('aria-sort') && buttonNode) {
          ch.removeAttribute('aria-sort');
        }
      }
    }
  }

  sortColumn(columnIndex, sortValue, className) {
    function compareValues(a, b) {
      if (a.value === b.value) return 0;
      if (className != '') {
        return sortValue === 'ascending' ? a.value - b.value : b.value - a.value ;
      } else {
        return sortValue === 'ascending' ? (a.value < b.value ? -1 : 1) : (a.value > b.value ? -1 : 1)
      }
    }

    const parseDate = (value) => {
      const MONTHS = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']

      if (value.match(':') != null) return parseInt(value.match(new RegExp(/\d+/g))[0],10)
      if (value.match('мин') != null) return parseInt(value.match(new RegExp(/\d+/g))[0],10)
      if (value.match('час') != null) return 60 + parseInt(value.match(new RegExp(/\d+/g))[0],10)
      if (value.match('сегодня') != null) return 85
      if (value.match('послезавтра') != null) return 87
      if (value.match('завтра') != null) return 86
      let month_index = MONTHS.findIndex(month => { return value.match(month) != null })
      if (month_index > 0) return 100 + (month_index * 100) + parseInt(value.match(new RegExp(/\d+/g))[0],10)
      return 99999999999
    }

    var tbodyNode = this.tableNode.querySelector('tbody');
    var rowNodes = [];
    var dataCells = [];

    var rowNode = tbodyNode.firstElementChild;

    var index = 0;
    while (rowNode) {
      rowNodes.push(rowNode);
      var rowCells = rowNode.querySelectorAll('th, td');
      var dataCell = rowCells[columnIndex];

      var data = {};
      data.index = index;
      data.value = dataCell.textContent.toLowerCase().trim();
      if (className == 'sort_by_price') {
        data.value = dataCell.parentNode.dataset.price
      }
      else if (className == 'sort_by_date') {
        if (dataCell.dataset.date == undefined) dataCell.dataset.date = parseDate(data.value)
        data.value = parseInt(dataCell.dataset.date,10)
      }
      dataCells.push(data);
      rowNode = rowNode.nextElementSibling;
      index += 1;
    }

    dataCells.sort(compareValues);

    // remove rows
    while (tbodyNode.firstChild) {
      tbodyNode.removeChild(tbodyNode.lastChild);
    }

    // add sorted rows
    for (var i = 0; i < dataCells.length; i += 1) {
      tbodyNode.appendChild(rowNodes[dataCells[i].index]);
    }
  }

  /* EVENT HANDLERS */

  handleClick(event) {
    var tgt = event.currentTarget;
    this.setColumnHeaderSort(tgt.getAttribute('data-column-index'));
  }

  handleOptionChange(event) {
    var tgt = event.currentTarget;

    if (tgt.checked) {
      this.tableNode.classList.add('show-unsorted-icon');
    } else {
      this.tableNode.classList.remove('show-unsorted-icon');
    }
  }
}

// Initialize sortable table buttons
window.addEventListener('load', function () {
  var sortableTables = document.querySelectorAll('table.sortable');
  for (var i = 0; i < sortableTables.length; i++) {
    new SortableTable(sortableTables[i]);
  }
});
