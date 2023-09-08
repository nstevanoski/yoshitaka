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

const routes: Routes = [
  {
    path: 'preview/:id',
    component: InvoicePreviewComponent,
    resolve: {
      data: InvoicePreviewService
    },
    data: { path: 'user-view/:id', animation: 'InvoicePreviewComponent' }
  }
];

@NgModule({
  declarations: [],
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
    CoreSidebarModule
  ],
  providers: [InvoicePreviewService]
})
export class InvoiceModule { }
