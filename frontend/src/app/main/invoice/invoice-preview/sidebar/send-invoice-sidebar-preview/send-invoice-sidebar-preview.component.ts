import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { CoreSidebarService } from '@core/components/core-sidebar/core-sidebar.service';
import { Member } from 'app/main/models/member.model';
import { InvoicePreviewService } from '../../invoice-preview.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-send-invoice-sidebar-preview',
  templateUrl: './send-invoice-sidebar-preview.component.html'
})
export class SendInvoiceSidebarPreviewComponent implements OnInit {
  form: FormGroup;
  @Input() member: Member;
  @Input() totalAmount?: number;
  @Input() services;
  isLoading: boolean = false;

  constructor(private _coreSidebarService: CoreSidebarService, private fb: FormBuilder, private _invoicePreviewService: InvoicePreviewService, private _snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      email: this.fb.control(this.member.email),
      subject: this.fb.control('Payment request'),
      message: this.fb.control('')
    });

    this.form.patchValue({
      message: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #fff; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #333; text-align: center; text-transform: uppercase;">Invoice for Yoshitaka Karate Club</h2>
          
          <p style="color: #555; line-height: 1.5;">
            Hi,
            <br><br>
            I hope this message finds you well. We wanted to bring to your attention an important matter regarding your invoice for the Yoshitaka Karate Club.
            <br><br>
            We kindly request your prompt attention to settle the outstanding invoice, as it is essential for the continued smooth operation of our club. Your timely payment will ensure that we can continue providing you with the high-quality karate training and services that you have come to expect.
            <br><br>
          </p>
          
          <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
            <thead>
              <tr>
                <th style="border: 1px solid #ddd; padding: 10px; background-color: #333; color: #fff; text-align: left;">Service Name</th>
                <th style="border: 1px solid #ddd; padding: 10px; background-color: #333; color: #fff; text-align: left;">Left Amount</th>
              </tr>
            </thead>
            <tbody>
              ${this.services.map(item => `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 10px;">${item.service_name}</td>
                  <td style="border: 1px solid #ddd; padding: 10px;">${item.amount - item.has_paid}</td>
                </tr>`).join('')}
            </tbody>
          </table>
          
          <div class="invoice-details" style="margin-top: 20px;">
            <p style="color: #333; font-weight: bold;">Total Sum: ${this.totalAmount}</p>
          </div>
        </div>
      `
    });
  }
  /**
   * Toggle the sidebar
   *
   * @param name
   */
  toggleSidebar(name): void {
    this._coreSidebarService.getSidebarRegistry(name).toggleOpen();
  }

  onSubmit() {
    let formData = new FormData();

    formData.append('email', this.form.value.email);
    formData.append('subject', this.form.value.subject);
    formData.append('message', this.form.value.message);
    // formData.append('message', this.form.value.message);

    this.isLoading = true;

    this._invoicePreviewService.sendEmail(formData)
      .then((res) => {
        this._snackBar.open(res.message, 'Close', {
          duration: 2500,
          panelClass: ['yoshitaka-success-snackbar']
        });

        this.isLoading = false;
      }).catch((err) => {
        this._snackBar.open(err.error.message, 'Close', {
          duration: 2500,
          panelClass: ['yoshitaka-danger-snackbar']
        });
        
        this.isLoading = false;
      });
  }
}
