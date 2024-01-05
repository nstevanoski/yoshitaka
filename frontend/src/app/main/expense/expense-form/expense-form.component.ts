import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ExpenseCreateComponent } from 'app/main/expense/expense-create/expense-create.component';
import { ExpensesService } from 'app/main/expense/expense.service';

@Component({
  selector: 'app-expense-form',
  templateUrl: './expense-form.component.html',
  styleUrls: ['./expense-form.component.scss']
})
export class ExpenseFormComponent implements OnInit {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private expensesService: ExpensesService,
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
        this.expensesService.onKeywordChanged?.next(keyword);
    });

    this.form.get('per_page')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      ).subscribe((sort: any) => {
        this.expensesService.onPerPageChanged?.next(sort);
    });
  }

  addExpenseModal() {
    this.modalService.open(ExpenseCreateComponent, {
      centered: true
    });
  }

  ngOnDestroy(): void {
    this.expensesService.onFilterChanged?.next('');
    this.expensesService.onFilterChanged?.complete();
    this.expensesService.onKeywordChanged?.next('');
    this.expensesService.onKeywordChanged?.complete();
    this.expensesService.onPerPageChanged?.next('');
    this.expensesService.onPerPageChanged?.complete();
  }
}
