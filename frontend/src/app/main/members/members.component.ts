import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';

import { CoreTranslationService } from '@core/services/translation.service';

import { locale as english } from 'app/main/members/i18n/en';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationDialogComponent } from 'app/ui/confirmation-dialog/confirmation-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GlobalLoaderService } from 'app/shared/services/global-loader.service';
import { MembersService } from './members.service';
import { Member } from '../models/member.model';


@Component({
  selector: 'app-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MembersComponent implements OnInit {
  // Private
  private _unsubscribeAll: Subject<any>;
  private tempData = [];

  page = 1;
  totalLength: number;

  // public
  public contentHeader: object;
  public rows: any;
  public selected = [];
  public members: any;
  public basicSelectedOption: any = 100;
  public ColumnMode = ColumnMode;
  public expanded = {};
  public editingName = {};
  public editingStatus = {};
  public editingAge = {};
  public editingSalary = {};
  public chkBoxSelected = [];
  public SelectionType = SelectionType;

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
    this.members = temp;
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
  constructor(private _datatablesService: MembersService, private _coreTranslationService: CoreTranslationService, private modalService: NgbModal, private _snackBar: MatSnackBar, private globalLoaderService: GlobalLoaderService) {
    this._unsubscribeAll = new Subject();
    this._coreTranslationService.translate(english);
  }

  // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit() {
    this._datatablesService.onMembersChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((members: Member[]) => {
        this.rows = members;
        this.tempData = this.rows;
        this.members = this.rows;
      }, error => {
        this._snackBar.open(error.error.message, 'Close', {
          duration: 2500,
          panelClass: ['kriturs-danger-snackbar']
        });      
      });

    this._datatablesService.onMembersTotal
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
      headerTitle: 'Members',
      actionButton: false,
      breadcrumb: {
        type: '',
        links: [
          {
            name: 'Members',
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

  memberHasPaid(member: Member) {
    if (member.paid) {
      return '<span class="badge badge-danger">UNPAID</span>';
    } else {
      return '<span class="badge badge-info">PAID</span>';
    }
  }

  getItems(item: number): void {
    this.page = item;
    this._datatablesService.list(item).then(() => {
      window.scrollTo({ top: 0 });
    });
  }
}
