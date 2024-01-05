import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ExpensesService } from 'app/main/expense/expense.service';

@Component({
  selector: 'app-expense-create',
  templateUrl: './expense-create.component.html',
  styleUrls: ['./expense-create.component.scss']
})
export class ExpenseCreateComponent implements OnInit {
  @Input() expense: any;
  @Input() currentPage: number = 1;
  
  form: FormGroup;

  isLoading = false;

  constructor(public activeModal: NgbActiveModal, private expensesService: ExpensesService, private _snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      name: new FormControl(''),
      amount: new FormControl(''),
    });

    if (this.expense) {
      this.form.patchValue({
        name: this.expense.name,
        amount: this.expense.amount,
      });
    }
  }

  async onSubmit() {
    try {
      this.isLoading = true;
  
      if (this.expense) {
        await this.expensesService.updateExpense(this.form.value, this.expense.id);
        await this.expensesService.list(1);
  
        this._snackBar.open('Expense has been updated!', 'Close', {
          duration: 2500,
          panelClass: ['yoshitaka-success-snackbar']
        });
      } else {
        await this.expensesService.createExpense(this.form.value);
        await this.expensesService.list(1);
  
        this._snackBar.open('Expense has been created!', 'Close', {
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
