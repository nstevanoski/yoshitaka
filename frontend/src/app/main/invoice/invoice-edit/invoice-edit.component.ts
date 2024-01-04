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
    const serviceFormGroup = this.fb.group({
      id: [service ? service.id : ''],
      service_name: [service ? service.service_name : '', Validators.required],
      amount: [service ? service.amount : 0, Validators.required],
      has_paid: [service ? service.has_paid : 0],
      left_to_be_paid: [{value: service ? service.left_to_be_paid : 0, disabled: true}]
    });

    return serviceFormGroup;
  }

  subscribeToAmountAndHasPaidChanges(serviceFormGroup: FormGroup): void {
    serviceFormGroup.get('amount').valueChanges.subscribe((amount) => {
      this.updateLeftToBePaid(serviceFormGroup);
    });
  
    serviceFormGroup.get('has_paid').valueChanges.subscribe((hasPaid) => {
      this.updateLeftToBePaid(serviceFormGroup);
    });
  }

  updateLeftToBePaid(serviceFormGroup: FormGroup): void {
    const amount = +serviceFormGroup.get('amount').value;
    const hasPaid = +serviceFormGroup.get('has_paid').value;
  
    const leftToBePaid = amount - hasPaid;
    serviceFormGroup.get('left_to_be_paid').setValue(leftToBePaid);
  
    // Disable the "left_to_be_paid" control
    serviceFormGroup.get('left_to_be_paid').disable();
  }

  get services(): FormArray {
    return this.form.get('services') as FormArray;
  }

  addServiceRow(invoice): void {
    const servicesFormArray = this.form.get('services') as FormArray;
    let newServiceFormGroup: any;

    if (invoice) {
      this.invoice.services.forEach(service => {
        newServiceFormGroup = this.createServiceFormGroup(service)
        this.services.push(newServiceFormGroup);
      });
    } else {
      newServiceFormGroup = this.createServiceFormGroup()
      this.services.push(newServiceFormGroup);
    }

    this.subscribeToAmountAndHasPaidChanges(newServiceFormGroup)
  }

  onSubmit() {
    const services = this.form.value.services;
    const hasInvalidService = services.some(service => service.has_paid > service.amount);

    if (hasInvalidService) {
      this._snackBar.open('Error: Has Paid value cannot be higher than the service amount.', 'Close', {
        duration: 2500,
        panelClass: ['yoshitaka-danger-snackbar']
      });
      return; // Stop the submission
    }

    this._invoicePreviewService.createUpdateInvoiceServices(services, this.invoice.id)
      .then(() => {
        this._snackBar.open('Invoice has been updated!', 'Close', {
          duration: 2500,
          panelClass: ['yoshitaka-success-snackbar']
        });

        this.router.navigate(['/members/invoice', this.member.id])
      }).catch((err) => {
        this._snackBar.open(err.error.message, 'Close', {
          duration: 2500,
          panelClass: ['yoshitaka-danger-snackbar']
        });
      })
  }
}
