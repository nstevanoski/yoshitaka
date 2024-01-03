import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { CoreSidebarService } from '@core/components/core-sidebar/core-sidebar.service';
import { Member } from 'app/main/models/member.model';
import { InvoicePreviewService } from '../invoice-preview/invoice-preview.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-invoice-edit',
  templateUrl: './invoice-edit.component.html',
  styleUrls: ['./invoice-edit.component.scss']
})
export class InvoiceEditComponent implements OnInit {
  form: FormGroup;

  public member: Member;
  public invoice: any;

  public paymentDetails = {
    bankName: 'Stopanska Banka AD - Skopje',
    country: 'Macedonia',
    iban: 'STB95476213874685',
    swiftCode: 'ST91905'
  };

  constructor(
    private router: Router,
    private _invoicePreviewService: InvoicePreviewService,
    private _coreSidebarService: CoreSidebarService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      amount: this.fb.control(''),
      paid: this.fb.control(''),
      memberId: this.fb.control(''),
      paymentStatus: this.fb.control(''),
      paymentDate: this.fb.control('')
    });

    this._invoicePreviewService.getApiData(this.route.snapshot.params.invoice_id)
      .then((res: any) => {
        this.invoice = res.invoice;
        this.member = res.member;

        this.form.patchValue({
          amount: this.invoice.amount,
          paid: this.invoice.paid
        })
      })
  }

  onSubmit() {
    this.form.get('paymentStatus').setValue(this.form.value.amount === this.form.value.paid ? 'paid' : 'unpaid');
    this.form.get('paymentDate').setValue(new Date());
    this.form.get('memberId').setValue(this.member.id);

    if (this.form.value.amount < this.form.value.paid) {
      this._snackBar.open('Please enter lower paid value', 'Close', {
        duration: 2500,
        panelClass: ['yoshitaka-danger-snackbar']
      });
      return;
    }

    this._invoicePreviewService.updateInvoice(this.form.value, this.invoice.id)
      .then(() => {
        this.router.navigate(['/members/invoice/preview', this.invoice.id]);

        this._snackBar.open('Invoice has been updated!', 'Close', {
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
}
