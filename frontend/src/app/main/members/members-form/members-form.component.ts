import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MembersService } from '../members.service';
import { MemberCreateComponent } from '../member-create/member-create.component';

@Component({
  selector: 'app-members-form',
  templateUrl: './members-form.component.html',
  styleUrls: ['./members-form.component.scss']
})
export class MembersFormComponent implements OnInit {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private membersService: MembersService,
    private modalService: NgbModal,
    private router: Router
  ) {
    this.form = this.fb.group({
      search: [''],
      per_page: [100]
    });
  }

  ngOnInit(): void {
    this.form.get('search')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      ).subscribe(keyword => {
        this.membersService.onKeywordChanged?.next(keyword);
    });

    this.form.get('per_page')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      ).subscribe((sort: any) => {
        this.membersService.onPerPageChanged?.next(sort);
    });
  }

  addMemberModal() {
    this.modalService.open(MemberCreateComponent, {
      centered: true
    });
  }

  ngOnDestroy(): void {
    this.membersService.onFilterChanged?.next('');
    this.membersService.onFilterChanged?.complete();
    this.membersService.onKeywordChanged?.next('');
    this.membersService.onKeywordChanged?.complete();
    this.membersService.onPerPageChanged?.next('');
    this.membersService.onPerPageChanged?.complete();
  }
}
