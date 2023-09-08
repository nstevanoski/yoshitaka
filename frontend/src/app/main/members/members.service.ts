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
import { Member } from '../models/member.model';

@Injectable({
  providedIn: 'root',
})
export class MembersService implements Resolve<any> {
  onMembersShowError: Subject<boolean> | undefined;
  onMembersLoading: Subject<boolean> | undefined;
  onMembersChanged: BehaviorSubject<any>;
  onSelectedMembersChanged: BehaviorSubject<any>;
  onMembersTotal: BehaviorSubject<number>;
  onKeywordChanged: Subject<string> | undefined;
  onFilterChanged: Subject<string> | undefined;
  onSortChanged: Subject<string> | undefined;
  onPerPageChanged: Subject<string> | undefined;
  onMemberTypeChanged: Subject<string> | undefined;

  members: any[];
  selectedMembers: number[] = [];
  memberId: number | undefined;
  filterBy: string | undefined;
  sortBy: any;
  perPage: string | undefined;
  keyword: string | undefined;

  constructor(private http: HttpClient) {
    this.members = [];
    this.onMembersChanged = new BehaviorSubject<any>(null);
    this.onSelectedMembersChanged = new BehaviorSubject([]);
    this.onMembersTotal = new BehaviorSubject<number>(0);
  }

  /**
   * Resolver
   */
  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> | Promise<any> | any {
    return new Promise<void>((resolve, reject) => {
      this.onMembersLoading = new Subject();
      this.onMembersShowError = new Subject();
      this.onKeywordChanged = new Subject();
      this.onFilterChanged = new Subject();
      this.onSortChanged = new Subject();
      this.onPerPageChanged = new Subject();
      this.onMemberTypeChanged = new Subject();

      Promise.all([]).then(() => {
        this.selectedMembers = [];

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
   * Get Members
   */
  list(currentPage?: number): Promise<any[]> {
    this.onMembersLoading?.next(true);

    return new Promise((resolve, reject) => {
      let requestUri: string | undefined;
      requestUri = `${environment.apiUrl}/api/members?page=${currentPage}&size=${this.perPage ? this.perPage : 100}`;

      if (this.keyword) {
        requestUri = `${requestUri}&keyword=${this.keyword}`;
      }

      this.http
        .get(`${requestUri}`)
        .pipe(take(1))
        .subscribe((response: any) => {
          if (response.error || response.total < 1) {
            this.members = [];
          } else {
            this.members = response.data.members;
            this.members = this.members?.map((member: any) => {
              return member;
            });
          }

          this.onMembersChanged.next(this.members);
          this.onSelectedMembersChanged.next([]);
          this.onMembersTotal.next(response.total);
          this.onMembersLoading?.next(false);
          this.onMembersShowError?.next(false);
          resolve(this.members);
        }, reject);
    });
  }

  toggleSelectedMember(id: number): void {
    // First, check if we already have that Member as selected...
    if (this.selectedMembers.length > 0) {
      const index = this.selectedMembers.indexOf(id);

      if (index !== -1) {
        this.selectedMembers.splice(index, 1);

        // Trigger the next event
        this.onSelectedMembersChanged.next(this.selectedMembers);

        // Return
        return;
      }
    }

    // If we don't have it, push as selected
    this.selectedMembers.push(Number(id));

    // Trigger the next event
    this.onSelectedMembersChanged.next(this.selectedMembers);
  }

  toggleSelectAll(): void {
    if (this.selectedMembers.length > 0) {
      this.deselectMembers();
    } else {
      this.selectMembers();
    }
  }

  selectMembers(filterParameter?: string, filterValue?: string): void {
    this.selectedMembers = [];

    if (filterParameter === undefined || filterValue === undefined) {
      this.selectedMembers = [];
      this.members.map((member: any) => {
        return this.selectedMembers.push(member.id as number);
      });
    }

    this.onSelectedMembersChanged.next(this.selectedMembers);
  }

  deselectMembers(): void {
    this.selectedMembers = [];

    this.onSelectedMembersChanged.next(this.selectedMembers);
  }

  async deleteMember(member: any): Promise<void> {
    const memberIndex = this.members.indexOf(member);
    this.members.splice(memberIndex, 1);

    await this.deleteMemberPost(member.id);
  }

  deleteMemberPost(memberId: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http
        .delete<any>(`${environment.apiUrl}/api/members/${memberId}`)
        .toPromise()
        .then(async (response: any) => {
          await this.list(1);
        }, reject);
    });
  }

  async deleteSelectedMembers(): Promise<void> {
    this.selectedMembers.forEach((memberId: any) => {
      this.deleteMemberPost(memberId);
    });
    this.deselectMembers();
  }

  getAllMembers(): Promise<Member[]> {
    return this.http.get<any>(`${environment.apiUrl}/api/members`).toPromise();
  }

  createMember(form: any): Promise<Member> {
    return this.http.post<Member>(`${environment.apiUrl}/api/members`, form).toPromise();
  }

  updateMember(form: any, id: number): Promise<Member> {
    return this.http.put<Member>(`${environment.apiUrl}/api/members/${id}`, form).toPromise();
  }
}
