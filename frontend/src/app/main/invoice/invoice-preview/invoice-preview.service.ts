import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Member } from 'app/main/models/member.model';
import { environment } from 'environments/environment';

import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class InvoicePreviewService implements Resolve<any> {
  apiData: any;
  member: Member;
  onInvoicPreviewChanged: BehaviorSubject<any>;

  /**
   * Constructor
   *
   * @param {HttpClient} _httpClient
   */
  constructor(private http: HttpClient) {
    // Set the defaults
    this.onInvoicPreviewChanged = new BehaviorSubject({});
  }

  /**
   * Resolver
   *
   * @param {ActivatedRouteSnapshot} route
   * @param {RouterStateSnapshot} state
   * @returns {Observable<any> | Promise<any> | any}
   */
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    let currentId = Number(route.paramMap.get('id'));
    return new Promise<void>((resolve, reject) => {
      Promise.all([this.getApiData(currentId)]).then(() => {
        resolve();
      }, reject);
    });
  }

  /**
   * Get API Data
   */
  getApiData(id: number): Promise<any[]> {
    const url = `${environment.apiUrl}/api/members/invoices/preview/${id}`;

    return new Promise((resolve, reject) => {
      this.http.get(url).subscribe((response: any) => {
        this.apiData = response;
        this.onInvoicPreviewChanged.next(this.apiData);
        resolve(this.apiData);
      }, reject);
    });
  }

  getMember(id: number): Promise<any> {
    const url = `${environment.apiUrl}/api/members/${id}`;

    return this.http.get(url).toPromise();
  }

  createInvoice(form: any): Promise<any> {
    const url = `${environment.apiUrl}/api/members/invoices`;

    return this.http.post(url, form).toPromise();
  }

  updateInvoice(form: any, id: number): Promise<any> {
    const url = `${environment.apiUrl}/api/members/invoices/preview/${id}`;

    return this.http.put(url, form).toPromise();
  }
}
