import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
    ActivatedRoute,
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot,
} from '@angular/router';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { take } from 'rxjs/operators';
import { Invoice } from '../models/invoice.model';

@Injectable({
  providedIn: 'root',
})
export class InvoicesService implements Resolve<any> {
  onInvoicesShowError: Subject<boolean> | undefined;
  onInvoicesLoading: Subject<boolean> | undefined;
  onInvoicesChanged: BehaviorSubject<any>;
  onSelectedInvoicesChanged: BehaviorSubject<any>;
  onInvoicesTotal: BehaviorSubject<number>;
  onKeywordChanged: Subject<string> | undefined;
  onFilterChanged: Subject<string> | undefined;
  onSortChanged: Subject<string> | undefined;
  onPerPageChanged: Subject<string> | undefined;
  onInvoiceTypeChanged: Subject<string> | undefined;

  invoices: any[];
  selectedInvoices: number[] = [];
  invoiceId: number | undefined;
  filterBy: string | undefined;
  sortBy: any;
  perPage: string | undefined;
  invoice_type: string | undefined;
  keyword: string | undefined;
  memberId: number;

  constructor(private http: HttpClient, private route: ActivatedRoute) {
    this.invoices = [];
    this.onInvoicesChanged = new BehaviorSubject<any>(null);
    this.onSelectedInvoicesChanged = new BehaviorSubject([]);
    this.onInvoicesTotal = new BehaviorSubject<number>(0);
  }

  /**
   * Resolver
   */
  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> | Promise<any> | any {
    return new Promise<void>((resolve, reject) => {
      this.onInvoicesLoading = new Subject();
      this.onInvoicesShowError = new Subject();
      this.onKeywordChanged = new Subject();
      this.onFilterChanged = new Subject();
      this.onSortChanged = new Subject();
      this.onPerPageChanged = new Subject();
      this.onInvoiceTypeChanged = new Subject();

      Promise.all([]).then(() => {
        this.selectedInvoices = [];

        if (!this.keyword && !this.filterBy && !this.perPage && !this.sortBy) {
          this.list(1, this.memberId);
        }

        this.onKeywordChanged?.subscribe((keyword: string) => {
          this.keyword = keyword;
          if (this.keyword) {
            this.list(1, this.memberId);
          }
          if (this.keyword == '') {
            this.list(1, this.memberId);
          }
        });

        this.onFilterChanged?.subscribe((filter) => {
          this.filterBy = filter;
          if (this.filterBy) {
            this.list(1, this.memberId);
          }
        });

        this.onSortChanged?.subscribe((sort) => {
          this.sortBy = sort;
          if (this.sortBy) {
            this.list(1, this.memberId);
          }
        });

        this.onPerPageChanged?.subscribe((perPage) => {
          this.perPage = perPage;
          if (this.perPage) {
            this.list(1, this.memberId);
          }
        });

        resolve();
      }, reject);
    });
  }

  /**
   * Get Invoices
   */
  list(currentPage?: number, memberId?: number): Promise<any[]> {
    this.onInvoicesLoading?.next(true);

    return new Promise((resolve, reject) => {
      let requestUri: string | undefined;
      requestUri = `${environment.apiUrl}/api/members/invoices/${memberId}?page=${currentPage}&size=${this.perPage ? this.perPage : 10}`;

      if (this.keyword) {
        requestUri = `${requestUri}&search=${this.keyword}`;
      }

      if (this.filterBy) {
        requestUri = `${requestUri}&order=${this.filterBy}`;
      }

      if (this.sortBy) {
        if (this.sortBy.column.prop == 'updated_at' || this.sortBy.column.prop == 'status') {
          requestUri = `${requestUri}&sort_column=${this.sortBy.column.prop}&sort_direction=${this.sortBy.newValue}`;
        }

        if (this.sortBy.column.prop == 'full_name') {
          requestUri = `${requestUri}&sort_column=name&sort_direction=${this.sortBy.newValue}`;
        }
      }

      this.http
        .get(`${requestUri}`)
        .pipe(take(1))
        .subscribe((response: any) => {
          if (response.error || response.total < 1) {
            this.invoices = [];
          } else {
            this.invoices = response.invoices;
            this.invoices = this.invoices?.map((invoice: any) => {
              return invoice;
            });
          }

          this.onInvoicesChanged.next(this.invoices);
          this.onSelectedInvoicesChanged.next([]);
          this.onInvoicesTotal.next(response.total);
          this.onInvoicesLoading?.next(false);
          this.onInvoicesShowError?.next(false);
          resolve(this.invoices);
        }, reject);
    });
  }

  /**
   * Toggle selected invoice by id
   */
  toggleSelectedInvoice(id: number): void {
    // First, check if we already have that invoice as selected...
    if (this.selectedInvoices.length > 0) {
      const index = this.selectedInvoices.indexOf(id);

      if (index !== -1) {
        this.selectedInvoices.splice(index, 1);

        // Trigger the next event
        this.onSelectedInvoicesChanged.next(this.selectedInvoices);

        // Return
        return;
      }
    }

    // If we don't have it, push as selected
    this.selectedInvoices.push(Number(id));

    // Trigger the next event
    this.onSelectedInvoicesChanged.next(this.selectedInvoices);
  }

  /**
   * Toggle select all
   */
  toggleSelectAll(): void {
    if (this.selectedInvoices.length > 0) {
      this.deselectInvoices();
    } else {
      this.selectInvoices();
    }
  }

  /**
   * Select Invoices
   *
   */
  selectInvoices(filterParameter?: string, filterValue?: string): void {
    this.selectedInvoices = [];

    // If there is no filter, select all Invoices
    if (filterParameter === undefined || filterValue === undefined) {
      this.selectedInvoices = [];
      this.invoices.map((invoice: any) => {
        return this.selectedInvoices.push(invoice.id as number);
      });
    }

    // Trigger the next event
    this.onSelectedInvoicesChanged.next(this.selectedInvoices);
  }

  /**
   * Deselect Invoices
   */
  deselectInvoices(): void {
    this.selectedInvoices = [];

    // Trigger the next event
    this.onSelectedInvoicesChanged.next(this.selectedInvoices);
  }

  /**
   * Delete invoice
   */
  async deleteInvoice(invoice: any): Promise<void> {
    const invoiceIndex = this.invoices.indexOf(invoice);
    this.invoices.splice(invoiceIndex, 1);

    await this.deleteInvoicePost(invoice.id);
  }

  /**
   * Delete invoice endpoints
   */
  deleteInvoicePost(invoiceId: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http
        .delete<any>(`${environment.apiUrl}/api/members/invoices/preview/${invoiceId}`)
        .toPromise()
        .then(async (response: any) => {
          await this.list(1, this.memberId);
        }, reject);
    });
  }

  /**
   * Delete Selected invoices
   */
  async deleteSelectedInvoices(): Promise<void> {
    this.selectedInvoices.forEach((invoiceId: any) => {
      this.deleteInvoicePost(invoiceId);
    });
    // await this.deleteBulkInvoicesPost();
    this.deselectInvoices();
  }

  /**
   * Delete Bulk Invoices
   */
  //  deleteBulkInvoicesPost(): Promise<any> {
  //   const formData = {Invoice_ids: this.selectedInvoices.join()};
  //   return new Promise((resolve, reject) => {
  //     this.http.post<any>(`${environment.baseUrl}stores/${this.storeId}/Invoices/bulk`, formData)
  //       .toPromise()
  //       .then(async (response: any) => {
  //         await this.list(this.storeId);
  //       }, reject);
  //   });
  // }

  getAllInvoices(): Promise<any> {
    return this.http.get<any>(`${environment.apiUrl}/invoices`).toPromise();
  }

  createInvoice(form: any): Promise<any> {
    return this.http.post<any>(`${environment.apiUrl}/invoices`, form).toPromise();
  }

  updateInvoice(form: any, id:number): Promise<any> {
    const payload = {
      ...form,
      _method: 'put'
    }
    
    return this.http.post<any>(`${environment.apiUrl}/invoices/${id}`, payload).toPromise();
  }

  updateInvoiceStatus(data: any, status: string, method?: string): Promise<any> {
    let payload: any = {
      status: status,
      name: data.name
    }

    if (method) {
      payload = {
        _method: method,
        status: status,
        name: data.name
      }
    }

    return this.http.post<any>(`${environment.apiUrl}/invoices/${data.id}`, payload).toPromise();
  }
}
