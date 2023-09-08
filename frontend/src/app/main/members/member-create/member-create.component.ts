import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MembersService } from '../members.service';

@Component({
  selector: 'app-member-create',
  templateUrl: './member-create.component.html',
  styleUrls: ['./member-create.component.scss']
})
export class MemberCreateComponent implements OnInit {
  @Input() member: any;
  @Input() currentPage: number = 1;
  
  form: FormGroup;

  isLoading = false;

  constructor(public activeModal: NgbActiveModal, private membersService: MembersService, private _snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      first_name: new FormControl(''),
      last_name: new FormControl(''),
      email: new FormControl(''),
    });

    if (this.member) {
      this.form.patchValue({
        first_name: this.member.first_name,
        last_name: this.member.last_name,
        email: this.member.email
      });
    }
  }

  async onSubmit() {
    try {
      this.isLoading = true;
  
      if (this.member) {
        await this.membersService.updateMember(this.form.value, this.member.id);
        await this.membersService.list(1);
  
        this._snackBar.open('Member has been updated!', 'Close', {
          duration: 2500,
          panelClass: ['yoshitaka-success-snackbar']
        });
      } else {
        await this.membersService.createMember(this.form.value);
        await this.membersService.list(1);
  
        this._snackBar.open('Member has been created!', 'Close', {
          duration: 2500,
          panelClass: ['yoshitaka-success-snackbar']
        });
      }
  
      this.activeModal.close();
    } catch (err) {
      console.error(err);
      this._snackBar.open(err.error.message, 'Close', {
        duration: 2500,
        panelClass: ['yoshitaka-danger-snackbar']
      });
    } finally {
      this.isLoading = false;
    }
  }
}
