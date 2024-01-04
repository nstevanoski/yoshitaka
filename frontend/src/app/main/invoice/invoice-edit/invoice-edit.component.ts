import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { CoreSidebarService } from '@core/components/core-sidebar/core-sidebar.service';
import { Member } from 'app/main/models/member.model';
import { InvoicePreviewService } from '../invoice-preview/invoice-preview.service';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
      memberId: this.fb.control(''),
      services: this.fb.array([])
    });

    this._invoicePreviewService.getApiData(this.route.snapshot.params.invoice_id)
      .then((res: any) => {
        this.invoice = res.invoice;
        this.member = res.member;

        this.form.patchValue({
          amount: this.invoice.amount,
          paid: this.invoice.paid
        });

        this.addServiceRow(this.invoice);
      });
  }

  createServiceFormGroup(service?: any): FormGroup {
    return this.fb.group({
      id: [service ? service.id : ''],
      service_name: [service ? service.service_name : '', Validators.required],
      amount: [service ? service.amount : '', Validators.required],
      has_paid: [service ? service.has_paid : ''],
      left_to_be_paid: [service ? service.left_to_be_paid : '']
    });
  }

  get services(): FormArray {
    return this.form.get('services') as FormArray;
  }

  addServiceRow(invoice): void {
    if (invoice) {
      this.invoice.services.forEach(service => {
        this.services.push(this.createServiceFormGroup(service));
      });
    } else {
      this.services.push(this.createServiceFormGroup());
    }
  }

  onSubmit() {
    this._invoicePreviewService.createUpdateInvoiceServices(this.form.value.services, this.invoice.id)
      .then(() => {
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
