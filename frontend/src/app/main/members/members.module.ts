import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { CoreCommonModule } from '@core/common.module';
import { CoreDirectivesModule } from '@core/directives/directives';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CorePipesModule } from '@core/pipes/pipes.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { CoreSidebarModule } from '@core/components';
import { CardSnippetModule } from '@core/components/card-snippet/card-snippet.module';
import { ContentHeaderModule } from 'app/layout/components/content-header/content-header.module';
import { MembersComponent } from './members.component';
import { MembersFormComponent } from './members-form/members-form.component';
import { MembersService } from './members.service';

const routes: Routes = [
  {
    path: '',
    component: MembersComponent,
    resolve: {
      datatables: MembersService
    },
    data: { animation: 'datatables' }
  },
  {
    path: 'invoice',
    loadChildren: () => import('../invoice/invoice.module').then(m => m.InvoiceModule)
  },
];


@NgModule({
  declarations: [
    MembersComponent,
    MembersFormComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    CoreCommonModule,
    CoreDirectivesModule,
    NgxDatatableModule,
    FormsModule,
    ReactiveFormsModule,
    CorePipesModule,
    NgbModule,
    NgSelectModule,
    CoreSidebarModule,
    CardSnippetModule,
    ContentHeaderModule
  ],
  providers: [
    MembersService
  ],
  exports: [
    MembersComponent
  ]
})
export class MembersModule { }
