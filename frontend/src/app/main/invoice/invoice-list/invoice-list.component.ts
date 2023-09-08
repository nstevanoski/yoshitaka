import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';

import { CoreTranslationService } from '@core/services/translation.service';

import { locale as english } from 'app/main/invoice/invoice-list/i18n/en';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationDialogComponent } from 'app/ui/confirmation-dialog/confirmation-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GlobalLoaderService } from 'app/shared/services/global-loader.service';
import { InvoicesService } from './invoice-list.service';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-invoices-list',
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class InvoicesComponent implements OnInit {
  // Private
  private _unsubscribeAll: Subject<any>;
  private tempData = [];

  page = 1;
  totalLength: number;

  // public
  public contentHeader: object;
  public rows: any;
  public selected = [];
  public kitchenSinkRows: any;
  public basicSelectedOption: any = 10;
  public ColumnMode = ColumnMode;
  public expanded = {};
  public editingName = {};
  public editingStatus = {};
  public editingAge = {};
  public editingSalary = {};
  public chkBoxSelected = [];
  public SelectionType = SelectionType;

  public member_id: number;

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
   * Inline editing Status
   *
   * @param event
   * @param cell
   * @param rowIndex
   */
  inlineEditingUpdateStatus(event, cell, rowIndex, row) {
    this.globalLoaderService.show();
    this._datatablesService.updateInvoiceStatus(row, event.target.value, 'put')
      .then(() => {
        this.editingStatus[rowIndex + '-' + cell] = false;
        this.rows[rowIndex][cell] = event.target.value;
        this.rows = [...this.rows];

        this._snackBar.open('Invoice status has been updated successfully!', 'Close', {
          duration: 2500,
          panelClass: ['ribbet-success-snackbar']
        });
        this.globalLoaderService.hide();
      }).catch((err) => {
        this.editingStatus[rowIndex + '-' + cell] = false;
        this.rows[rowIndex][cell] = row.status;
        this.rows = [...this.rows];

        this._snackBar.open(err.error.message, 'Close', {
          duration: 2500,
          panelClass: ['ribbet-danger-snackbar']
        });
        this.globalLoaderService.hide();
      })
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
    this.kitchenSinkRows = temp;
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
  constructor(private _datatablesService: InvoicesService, private _coreTranslationService: CoreTranslationService, private modalService: NgbModal, private _snackBar: MatSnackBar, private globalLoaderService: GlobalLoaderService, private route: ActivatedRoute) {
    this._unsubscribeAll = new Subject();
    this._coreTranslationService.translate(english);

    this.member_id = this.route.snapshot.params.member_id;

    if (this.member_id) {
      this._datatablesService.memberId = this.member_id;
      this._datatablesService.list(1, this.member_id)
    }
  }

  // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit() {
    this._datatablesService.onInvoicesChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((invoices: any[]) => {
        this.rows = invoices;
        this.tempData = this.rows;
        this.kitchenSinkRows = this.rows;
      }, error => {
        this._snackBar.open(error.error.message, 'Close', {
          duration: 2500,
          panelClass: ['ribbet-danger-snackbar']
        });      
      });

    this._datatablesService.onInvoicesTotal
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
      headerTitle: 'Invoices',
      actionButton: false,
      breadcrumb: {
        type: '',
        links: [
          {
            name: 'Home',
            isLink: true,
            link: '/'
          },
          {
            name: 'Invoices',
            isLink: false,
          },
          {
            name: 'List',
            isLink: false
          }
        ]
      }
    };
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
    this._datatablesService.list(item, this._datatablesService.memberId).then(() => {
      window.scrollTo({ top: 0 });
    });
  }

  openEditModal(invoice: any) {
    // const modal = this.modalService.open(InvoiceCreateComponent, {
    //   centered: true
    // });

    // modal.componentInstance.invoice = invoice;
    // modal.componentInstance.currentPage = this.page;
  }

  deleteInvoice(invoice: any) {
    const modal = this.modalService.open(ConfirmationDialogComponent, {
      centered: true
    });

    modal.componentInstance.info = {
      title: 'Delete Invoice',
      message: 'Are you sure you want to delete this invoice?'
    }

    modal.result.then((res) => {
      if (res) {
        this._datatablesService.deleteInvoicePost(invoice.id)
          .then(() => {
            this._snackBar.open('Invoice has been deleted successfully!', 'Close', {
              duration: 2500,
              panelClass: ['ribbet-success-snackbar']
            });
          }).catch((err) => {
            this._snackBar.open(err.error.message, 'Close', {
              duration: 2500,
              panelClass: ['ribbet-danger-snackbar']
            });
          })
      }
    })
  }
}
