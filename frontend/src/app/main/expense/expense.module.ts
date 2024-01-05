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
import { ExpenseComponent } from './expense.component';
import { ExpensesService } from 'app/main/expense/expense.service';
import { ExpenseCreateComponent } from './expense-create/expense-create.component';
import { ExpenseFormComponent } from './expense-form/expense-form.component';

const routes: Routes = [
  {
    path: '',
    component: ExpenseComponent,
    resolve: {
      datatables: ExpensesService
    },
    data: { animation: 'datatables' }
  }
];

@NgModule({
  declarations: [
    ExpenseComponent,
    ExpenseCreateComponent,
    ExpenseFormComponent
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
    ExpensesService
  ]
})
export class ExpenseModule { }
