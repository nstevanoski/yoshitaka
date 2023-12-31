import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';

import { CoreTranslationService } from '@core/services/translation.service';

import { locale as english } from 'app/main/expense/i18n/en';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationDialogComponent } from 'app/ui/confirmation-dialog/confirmation-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GlobalLoaderService } from 'app/shared/services/global-loader.service';
import { Expense } from '../models/expense.model';

import * as XLSX from 'xlsx';
import { ExpensesService } from 'app/main/expense/expense.service';
import { ExpenseCreateComponent } from 'app/main/expense/expense-create/expense-create.component';

@Component({
  selector: 'app-expense',
  templateUrl: './expense.component.html',
  styleUrls: ['./expense.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ExpenseComponent implements OnInit {
  // Private
  private _unsubscribeAll: Subject<any>;
  private tempData = [];

  page = 1;
  totalLength: number;

  // public
  public contentHeader: object;
  public rows: any;
  public selected = [];
  public expenses: any;
  public basicSelectedOption: any = 100;
  public ColumnMode = ColumnMode;
  public expanded = {};
  public editingName = {};
  public editingStatus = {};
  public editingAge = {};
  public editingSalary = {};
  public chkBoxSelected = [];
  public SelectionType = SelectionType;

  public listType: string = 'grid';

  public isExportLoading = false;
  public isSendInfoEmailLoading = false;

  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild('tableRowDetails') tableRowDetails: any;


  // Public Methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Inline editing Name
   *
   * @param event
   * @param cell
   * @param rowIndex
   */
  inlineEditingUpdateName(event, cell, rowIndex) {
    this.editingName[rowIndex + '-' + cell] = false;
    this.rows[rowIndex][cell] = event.target.value;
    this.rows = [...this.rows];
  }

  /**
   * Inline editing Age
   *
   * @param event
   * @param cell
   * @param rowIndex
   */
  inlineEditingUpdateAge(event, cell, rowIndex) {
    this.editingAge[rowIndex + '-' + cell] = false;
    this.rows[rowIndex][cell] = event.target.value;
    this.rows = [...this.rows];
  }

  changeListType(listType: 'grid' | 'list') {
    this.listType = listType;

    localStorage.setItem('listType', listType);
  }

  /**
   * Inline editing Salary
   *
   * @param event
   * @param cell
   * @param rowIndex
   */
  inlineEditingUpdateSalary(event, cell, rowIndex) {
    this.editingSalary[rowIndex + '-' + cell] = false;
    this.rows[rowIndex][cell] = event.target.value;
    this.rows = [...this.rows];
  }

  /**
   * Search (filter)
   *
   * @param event
   */
  filterUpdate(event) {
    const val = event.target.value.toLowerCase();

    // filter our data
    const temp = this.tempData.filter(function (d) {
      return d.name.toLowerCase().indexOf(val) !== -1 || !val;
    });

    // update the rows
    this.expenses = temp;
    // Whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }

  /**
   * Row Details Toggle
   *
   * @param row
   */
  rowDetailsToggleExpand(row) {
    this.tableRowDetails.rowDetail.toggleExpandRow(row);
  }

  /**
   * For ref only, log selected values
   *
   * @param selected
   */
  onSelect({ selected }) {
    console.log('Select Event', selected, this.selected);

    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }

  /**
   * For ref only, log activate events
   *
   * @param selected
   */
  onActivate(event) {
    // console.log('Activate Event', event);
  }

  /**
   * Custom Chkbox On Select
   *
   * @param { selected }
   */
  customChkboxOnSelect({ selected }) {
    this.chkBoxSelected.splice(0, this.chkBoxSelected.length);
    this.chkBoxSelected.push(...selected);
  }

  /**
   * Constructor
   *
   * @param {DatatablesService} _datatablesService
   * @param {CoreTranslationService} _coreTranslationService
   */
  constructor(private _datatablesService: ExpensesService, private _coreTranslationService: CoreTranslationService, private modalService: NgbModal, private _snackBar: MatSnackBar, private globalLoaderService: GlobalLoaderService) {
    this._unsubscribeAll = new Subject();
    this._coreTranslationService.translate(english);
  }

  // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit() {
    this._datatablesService.onExpensesChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((expenses: Expense[]) => {
        this.rows = expenses;
        this.tempData = this.rows;
        this.expenses = this.rows;
      }, error => {
        this._snackBar.open(error.error.message, 'Close', {
          duration: 2500,
          panelClass: ['kriturs-danger-snackbar']
        });      
      });

    this._datatablesService.onExpensesTotal
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((totalLength: number) => {
        this.totalLength = totalLength;
      });

    this._datatablesService.onPerPageChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((perPage) => {
        this.basicSelectedOption = perPage;
      }); 

    // content header
    this.contentHeader = {
      headerTitle: 'Expenses',
      actionButton: false,
      breadcrumb: {
        type: '',
        links: [
          {
            name: 'Expenses',
            isLink: true,
            link: '/'
          },
          {
            name: 'List',
            isLink: false
          }
        ]
      }
    };

    if (localStorage.getItem('listType')) {
      this.listType = localStorage.getItem('listType').toString()
    }
  }

  sort(event) {
    this._datatablesService.onSortChanged?.next(event);
  }

  onPaginateChange(event: any): void {
    this.getItems(event.page);
  }

  getId(row) {    
    return row.id;
  }

  getItems(item: number): void {
    this.page = item;
    this._datatablesService.list(item).then(() => {
      window.scrollTo({ top: 0 });
    });
  }

  openEditModal(expense: Expense) {
    const modal = this.modalService.open(ExpenseCreateComponent, {
      centered: true
    });

    modal.componentInstance.expense = expense;
    modal.componentInstance.currentPage = this.page;
  }

  deleteExpense(expense: Expense) {
    const modal = this.modalService.open(ConfirmationDialogComponent, {
      centered: true
    });

    modal.componentInstance.info = {
      title: 'Delete Expense',
      message: 'Are you sure you want to delete this expense?'
    }

    modal.result.then((res) => {
      if (res) {
        this._datatablesService.deleteExpensePost(expense.id)
          .then(() => {
            this._snackBar.open('Invoice has been deleted successfully!', 'Close', {
              duration: 2500,
              panelClass: ['yoshitaka-success-snackbar']
            });
          }).catch((err) => {
            this._snackBar.open(err.error.message, 'Close', {
              duration: 2500,
              panelClass: ['yoshitaka-danger-snackbar']
            });
          })
      }
    })
  }
 

  exportDataToExcel(data: any[], fileName: string): void {
    // Create a worksheet
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
  
    // Create a workbook
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  
    // Save the workbook to a file
    XLSX.writeFile(wb, fileName + '.xlsx');
  }
}
