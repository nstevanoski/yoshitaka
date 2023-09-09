import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

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
  isLoading: boolean = false;

  emailMessage = `Hi,
                                        
I hope this message finds you well. We wanted to bring to your attention an important matter regarding your invoice for the Yoshitaka Karate Club.
  
We kindly request your prompt attention to settle the outstanding invoice, as it is essential for the continued smooth operation of our club. Your timely payment will ensure that we can continue providing you with the high-quality karate training and services that you have come to expect.
  
Best regards,
Nikola`;

  constructor(private _coreSidebarService: CoreSidebarService, private fb: FormBuilder, private _invoicePreviewService: InvoicePreviewService, private _snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      email: this.fb.control(this.member.email),
      subject: this.fb.control('Payment request'),
      message: this.fb.control(this.emailMessage)
    })
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
    this.isLoading = true;

    this._invoicePreviewService.sendEmail(this.form.value)
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
