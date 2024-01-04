import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { CoreSidebarService } from '@core/components/core-sidebar/core-sidebar.service';
import { Member } from 'app/main/models/member.model';
import { InvoicePreviewService } from '../invoice-preview/invoice-preview.service';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-invoice-add',
  templateUrl: './invoice-add.component.html',
  styleUrls: ['./invoice-add.component.scss']
})
export class InvoiceAddComponent implements OnInit {
  form: FormGroup;

  public member: Member;
  isLoading = false;

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

    this._invoicePreviewService.getMember(this.route.snapshot.params.member_id)
      .then(res => {
        this.member = res.member;

        this.addServiceRow();
      });
  }

  createServiceFormGroup(): FormGroup {
    return this.fb.group({
      service_name: ['', Validators.required],
      amount: ['', Validators.required],
      has_paid: ['', Validators.required],
    });
  }

  get services(): FormArray {
    return this.form.get('services') as FormArray;
  }

  addServiceRow(): void {
    this.services.push(this.createServiceFormGroup());
  }

  async onSubmit() {
    const services = this.form.value.services;

    if (this.form.invalid) {
      this._snackBar.open('Please add services to this invoice!', 'Close', {
        duration: 2500,
        panelClass: ['yoshitaka-danger-snackbar']
      });

      return;
    }

    const hasInvalidService = services.some(service => service.has_paid > service.amount);

    if (hasInvalidService) {
      this._snackBar.open('Error: Has Paid value cannot be higher than the service amount.', 'Close', {
        duration: 2500,
        panelClass: ['yoshitaka-danger-snackbar']
      });
      return; // Stop the submission
    }

    this.isLoading = true;

    try {
      const invoiceBody = {
        memberId: Number(this.route.snapshot.params.member_id)
      }

      const invoice = await this._invoicePreviewService.createInvoice(invoiceBody);
      await this._invoicePreviewService.createUpdateInvoiceServices(services, invoice.id);

      this._snackBar.open('Invoice has been created!', 'Close', {
        duration: 2500,
        panelClass: ['yoshitaka-success-snackbar']
      });

      this.router.navigate(['/members/invoice', this.route.snapshot.params.member_id])
    } catch (error) {
      this._snackBar.open(error.error.message, 'Close', {
        duration: 2500,
        panelClass: ['yoshitaka-danger-snackbar']
      });
    } finally {
      this.isLoading = false;
    }
  }

  deleteService(index: number) {
    if (this.services.length > 1) {
      this.services.removeAt(index);
    }
  }
}
