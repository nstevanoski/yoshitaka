import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { CoreSidebarService } from '@core/components/core-sidebar/core-sidebar.service';
import { Member } from 'app/main/models/member.model';
import { InvoicePreviewService } from '../invoice-preview/invoice-preview.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-invoice-add',
  templateUrl: './invoice-add.component.html',
  styleUrls: ['./invoice-add.component.scss']
})
export class InvoiceAddComponent implements OnInit {
  form: FormGroup;

  public member: Member;

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

    this._invoicePreviewService.getMember(this.route.snapshot.params.member_id)
      .then(res => {
        this.member = res.member;
      })
  }

  onSubmit() {
    this.form.get('paymentStatus').setValue(this.form.value.amount === this.form.value.paid ? 'paid' : 'unpaid');
    this.form.get('paymentDate').setValue(new Date());
    this.form.get('memberId').setValue(this.member.id);

    if (this.form.value.amount < this.form.value.paid) {
      this._snackBar.open('Please enter lower paid value', 'Close', {
        duration: 2500,
        panelClass: ['ribbet-danger-snackbar']
      });
      return;
    }

    this._invoicePreviewService.createInvoice(this.form.value)
      .then(() => {
        this.router.navigate(['/members/invoice', this.member.id])
      }).catch((err) => {
        this._snackBar.open(err.error.message, 'Close', {
          duration: 2500,
          panelClass: ['ribbet-danger-snackbar']
        });
      })
  }
}
