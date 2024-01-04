import { AfterContentInit, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CoreSidebarService } from '@core/components/core-sidebar/core-sidebar.service';
import { InvoicePreviewService } from './invoice-preview.service';
import { Member } from 'app/main/models/member.model';

import jspdf from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-invoice-preview',
  templateUrl: './invoice-preview.component.html',
  styleUrls: ['./invoice-preview.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class InvoicePreviewComponent implements OnInit, OnDestroy, AfterContentInit {
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

  public paymentStatus: 'PAID' | 'UNPAID';
  public services: any;
  public pdfFile: any;

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
      this.member = response.member;

      this.paymentStatus = response.status;
      this.services = this.apiData.services;
    });
  }

  ngAfterContentInit(): void {
    setTimeout(() => {
      this.convertToPDF();
    }, 2000);
  }

  convertToPDF() {
    var data: any = document.querySelector('.printRef');
  
    html2canvas(data).then(canvas => {
      var imgWidth = 208;
      var imgHeight = canvas.height * imgWidth / canvas.width;
  
      const contentDataURL = canvas.toDataURL('image/png');
      let pdf = new jspdf('p', 'mm', 'a4'); // A4 size page of PDF
      pdf.addImage(contentDataURL, 'PNG', 0, 0, imgWidth, imgHeight);
  
      var blobPDF: any = new Blob([pdf.output('blob')], { type: 'application/pdf' });
  
      // Create a File object with the blob and set the file name
      var pdfFile = new File([blobPDF], 'invoice.pdf', { type: 'application/pdf' });
  
      this.pdfFile = pdfFile;
    });
  }

  getTotalAmount(invoice: any) {
    let sum: number = 0;

    invoice.services.forEach((service) => {
      sum += service.amount;
    });

    return sum;
  }

  getTotalPaid(invoice: any) {
    let sum: number = 0;

    invoice.services.forEach((service) => {
      sum += service.has_paid;
    });

    return sum;
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
