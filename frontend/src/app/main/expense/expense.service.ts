import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot,
} from '@angular/router';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { take } from 'rxjs/operators';
import { Expense } from '../models/expense.model';

@Injectable({
  providedIn: 'root',
})
export class ExpensesService implements Resolve<any> {
  onExpensesShowError: Subject<boolean> | undefined;
  onExpensesLoading: Subject<boolean> | undefined;
  onExpensesChanged: BehaviorSubject<any>;
  onSelectedExpensesChanged: BehaviorSubject<any>;
  onExpensesTotal: BehaviorSubject<number>;
  onKeywordChanged: Subject<string> | undefined;
  onFilterChanged: Subject<string> | undefined;
  onSortChanged: Subject<string> | undefined;
  onPerPageChanged: Subject<string> | undefined;
  onExpenseTypeChanged: Subject<string> | undefined;

  expenses: any[];
  selectedExpenses: number[] = [];
  expenseId: number | undefined;
  filterBy: string | undefined;
  sortBy: any;
  perPage: string | undefined;
  keyword: string | undefined;

  constructor(private http: HttpClient) {
    this.expenses = [];
    this.onExpensesChanged = new BehaviorSubject<any>(null);
    this.onSelectedExpensesChanged = new BehaviorSubject([]);
    this.onExpensesTotal = new BehaviorSubject<number>(0);
  }

  /**
   * Resolver
   */
  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> | Promise<any> | any {
    return new Promise<void>((resolve, reject) => {
      this.onExpensesLoading = new Subject();
      this.onExpensesShowError = new Subject();
      this.onKeywordChanged = new Subject();
      this.onFilterChanged = new Subject();
      this.onSortChanged = new Subject();
      this.onPerPageChanged = new Subject();
      this.onExpenseTypeChanged = new Subject();

      Promise.all([]).then(() => {
        this.selectedExpenses = [];

        if (!this.keyword && !this.filterBy && !this.perPage && !this.sortBy) {
          this.list(1);
        }

        this.onKeywordChanged?.subscribe((keyword: string) => {
          this.keyword = keyword;
          if (this.keyword) {
            this.list(1);
          }
          if (this.keyword == '') {
            this.list(1);
          }
        });

        this.onFilterChanged?.subscribe((filter) => {
          this.filterBy = filter;
          if (this.filterBy) {
            this.list(1);
          }
        });

        this.onSortChanged?.subscribe((sort) => {
          this.sortBy = sort;
          if (this.sortBy) {
            this.list(1);
          }
        });

        this.onPerPageChanged?.subscribe((perPage) => {
          this.perPage = perPage;
          if (this.perPage) {
            this.list(1);
          }
        });

        resolve();
      }, reject);
    });
  }

  /**
   * Get Expenses
   */
  list(currentPage?: number): Promise<any[]> {
    this.onExpensesLoading?.next(true);

    return new Promise((resolve, reject) => {
      let requestUri: string | undefined;
      requestUri = `${environment.apiUrl}/api/expenses?page=${currentPage}&size=${this.perPage ? this.perPage : 100}`;

      if (this.keyword) {
        requestUri = `${requestUri}&keyword=${this.keyword}`;
      }

      this.http
        .get(`${requestUri}`)
        .pipe(take(1))
        .subscribe((response: any) => {
          if (response.error || response.total < 1) {
            this.expenses = [];
          } else {
            this.expenses = response.data.expenses;
            this.expenses = this.expenses?.map((expense: any) => {
              return expense;
            });
          }

          this.onExpensesChanged.next(this.expenses);
          this.onSelectedExpensesChanged.next([]);
          this.onExpensesTotal.next(response.total);
          this.onExpensesLoading?.next(false);
          this.onExpensesShowError?.next(false);
          resolve(this.expenses);
        }, reject);
    });
  }

  toggleSelectedExpense(id: number): void {
    // First, check if we already have that Expense as selected...
    if (this.selectedExpenses.length > 0) {
      const index = this.selectedExpenses.indexOf(id);

      if (index !== -1) {
        this.selectedExpenses.splice(index, 1);

        // Trigger the next event
        this.onSelectedExpensesChanged.next(this.selectedExpenses);

        // Return
        return;
      }
    }

    // If we don't have it, push as selected
    this.selectedExpenses.push(Number(id));

    // Trigger the next event
    this.onSelectedExpensesChanged.next(this.selectedExpenses);
  }

  toggleSelectAll(): void {
    if (this.selectedExpenses.length > 0) {
      this.deselectExpenses();
    } else {
      this.selectExpenses();
    }
  }

  selectExpenses(filterParameter?: string, filterValue?: string): void {
    this.selectedExpenses = [];

    if (filterParameter === undefined || filterValue === undefined) {
      this.selectedExpenses = [];
      this.expenses.map((expense: any) => {
        return this.selectedExpenses.push(expense.id as number);
      });
    }

    this.onSelectedExpensesChanged.next(this.selectedExpenses);
  }

  deselectExpenses(): void {
    this.selectedExpenses = [];

    this.onSelectedExpensesChanged.next(this.selectedExpenses);
  }

  async deleteExpense(expense: any): Promise<void> {
    const expenseIndex = this.expenses.indexOf(expense);
    this.expenses.splice(expenseIndex, 1);

    await this.deleteExpensePost(expense.id);
  }

  deleteExpensePost(expenseId: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http
        .delete<any>(`${environment.apiUrl}/api/expenses/${expenseId}`)
        .toPromise()
        .then(async (response: any) => {
          await this.list(1);
        }, reject);
    });
  }

  async deleteSelectedExpenses(): Promise<void> {
    this.selectedExpenses.forEach((expenseId: any) => {
      this.deleteExpensePost(expenseId);
    });
    this.deselectExpenses();
  }

  getAllExpenses(): Promise<Expense[]> {
    return this.http.get<any>(`${environment.apiUrl}/api/expenses`).toPromise();
  }

  getExpenseById(id: number): Promise<Expense[]> {
    return this.http.get<any>(`${environment.apiUrl}/api/expenses/${id}`).toPromise();
  }

  createExpense(form: any): Promise<Expense> {
    return this.http.post<Expense>(`${environment.apiUrl}/api/expenses`, form).toPromise();
  }

  updateExpense(form: any, id: number): Promise<Expense> {
    return this.http.put<Expense>(`${environment.apiUrl}/api/expenses/${id}`, form).toPromise();
  }
}
