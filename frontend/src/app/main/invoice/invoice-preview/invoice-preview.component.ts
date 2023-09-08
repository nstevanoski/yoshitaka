import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CoreSidebarService } from '@core/components/core-sidebar/core-sidebar.service';
import { InvoicePreviewService } from './invoice-preview.service';
import { Member } from 'app/main/models/member.model';


@Component({
  selector: 'app-invoice-preview',
  templateUrl: './invoice-preview.component.html',
  styleUrls: ['./invoice-preview.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class InvoicePreviewComponent implements OnInit, OnDestroy {
  // public
  public apiData;
  public member: Member;
  public urlLastValue;
  public url = this.router.url;
  public sidebarToggleRef = false;
  public paymentSidebarToggle = false;
  public paymentDetails = {
    bankName: 'Stopanska Banka AD - Skopje',
    country: 'Macedonia',
    iban: 'STB95476213874685',
    swiftCode: 'ST91905'
  };
  

  // private
  private _unsubscribeAll: Subject<any>;

  /**
   * Constructor
   *
   * @param {Router} router
   * @param {InvoicePreviewService} _invoicePreviewService
   * @param {CoreSidebarService} _coreSidebarService
   */
  constructor(
    private router: Router,
    private _invoicePreviewService: InvoicePreviewService,
    private _coreSidebarService: CoreSidebarService
  ) {
    this._unsubscribeAll = new Subject();
    this.urlLastValue = this.url.substr(this.url.lastIndexOf('/') + 1);
  }

  // Public Methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Toggle the sidebar
   *
   * @param name
   */
  toggleSidebar(name): void {
    this._coreSidebarService.getSidebarRegistry(name).toggleOpen();
  }

  // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------
  /**
   * On init
   */
  ngOnInit(): void {
    this._invoicePreviewService.onInvoicPreviewChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(response => {
      this.apiData = response.invoice;

      if (this.apiData.memberId) {
        this._invoicePreviewService.getMember(this.apiData.memberId)
          .then((res: any) => {
            this.member = res.member;
          })
      }
    });
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
