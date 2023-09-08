import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { InvoicesService } from '../../invoice-list.service';

@Component({
  selector: 'app-invoice-form',
  templateUrl: './invoice-form.component.html',
  styleUrls: ['./invoice-form.component.scss']
})
export class InvoicesFormComponent implements OnInit, OnDestroy  {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private invoicesService: InvoicesService,
    private modalService: NgbModal
  ) {
    this.form = this.fb.group({
      search: [''],
      sort: ['desc'],
      per_page: [10]
    });
  }

  ngOnInit(): void {
    this.form.get('search')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      ).subscribe(keyword => {
        this.invoicesService.onKeywordChanged?.next(keyword);
    });

    this.form.get('sort')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      ).subscribe((sort: any) => {
        this.invoicesService.onFilterChanged?.next(sort);
    });

    this.form.get('per_page')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      ).subscribe((sort: any) => {
        this.invoicesService.onPerPageChanged?.next(sort);
    });
  }

  createInvoice() {
    // this.modalService.open(InvoiceCreateComponent, {
    //   centered: true
    // });
  }

  ngOnDestroy(): void {
    this.invoicesService.onFilterChanged?.next('');
    this.invoicesService.onFilterChanged?.complete();
    this.invoicesService.onKeywordChanged?.next('');
    this.invoicesService.onKeywordChanged?.complete();
    this.invoicesService.onPerPageChanged?.next('');
    this.invoicesService.onPerPageChanged?.complete();
  }
}
