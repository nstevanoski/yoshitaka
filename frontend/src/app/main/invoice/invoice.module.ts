import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { Ng2FlatpickrModule } from 'ng2-flatpickr';

import { CoreCommonModule } from '@core/common.module';
import { CoreDirectivesModule } from '@core/directives/directives';
import { CorePipesModule } from '@core/pipes/pipes.module';
import { CoreSidebarModule } from '@core/components';

import { InvoicePreviewComponent } from './invoice-preview/invoice-preview.component';
import { InvoicePreviewService } from './invoice-preview/invoice-preview.service';
import { InvoicesService } from './invoice-list/invoice-list.service';
import { InvoicesComponent } from './invoice-list/invoice-list.component';
import { CardSnippetModule } from '@core/components/card-snippet/card-snippet.module';
import { InvoicesFormComponent } from './invoice-list/forms/invoice-form/invoice-form.component';
import { InvoiceAddComponent } from './invoice-add/invoice-add.component';

const routes: Routes = [
  {
    path: ':member_id',
    component: InvoicesComponent,
    data: { animation: 'InvoicesComponent' }
  },
  {
    path: 'preview/:id',
    component: InvoicePreviewComponent,
    resolve: {
      data: InvoicePreviewService
    },
    data: { animation: 'InvoicePreviewComponent' }
  },
  {
    path: 'add/:member_id',
    component: InvoiceAddComponent,
    data: { animation: 'InvoiceAddComponent' }
  }
];

@NgModule({
  declarations: [
    InvoicePreviewComponent,
    InvoicesComponent,
    InvoicesFormComponent,
    InvoiceAddComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    CoreCommonModule,
    CoreDirectivesModule,
    Ng2FlatpickrModule,
    NgxDatatableModule,
    FormsModule,
    CorePipesModule,
    NgbModule,
    NgSelectModule,
    CardSnippetModule,
    CoreSidebarModule
  ],
  providers: [InvoicePreviewService, InvoicesService]
})
export class InvoiceModule { }
