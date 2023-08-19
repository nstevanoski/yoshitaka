import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss']
})
export class ConfirmationDialogComponent {
  @Input('info') info;
  isLoading = false;
  
  constructor(public activeModal: NgbActiveModal) { }

  close() {
    this.activeModal.close(false);
  }

  accept() {
    this.activeModal.close(true)
  }
}
