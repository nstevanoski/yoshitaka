import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import 'hammerjs';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrModule } from 'ngx-toastr'; // For auth after login toast

import { CoreModule } from '@core/core.module';
import { CoreCommonModule } from '@core/common.module';
import { CoreSidebarModule, CoreThemeCustomizerModule } from '@core/components';

import { coreConfig } from 'app/app-config';

import { AppComponent } from 'app/app.component';
import { LayoutModule } from 'app/layout/layout.module';
import { SampleModule } from 'app/main/sample/sample.module';
import { ConfirmationDialogComponent } from './ui/confirmation-dialog/confirmation-dialog.component';
import { SharedModule } from './shared/shared.module';
import { AuthGuardService } from './shared/services/auth-guard.service';
import { HttpService } from './shared/services/http.service';
import { AuthService } from './shared/services/auth.service';
import { TokenInterceptorService } from './shared/services/token-interceptor.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';

const appRoutes: Routes = [
  {
    path: 'dashboard',
    loadChildren: () => import('./main/dashboard/dashboard.module').then(m => m.DashboardModule),
    canActivate: [AuthGuardService]
  },
  {
    path: 'auth',
    loadChildren: () => import('./main/pages/pages.module').then(m => m.PagesModule)
  },
  {
    path: 'members',
    loadChildren: () => import('./main/members/members.module').then(m => m.MembersModule),
    canActivate: [AuthGuardService]
  },
  {
    path: 'expenses',
    loadChildren: () => import('./main/expense/expense.module').then(m => m.ExpenseModule),
    canActivate: [AuthGuardService]
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/pages/miscellaneous/error' //Error 404 - Page not found
  }
];

@NgModule({
  declarations: [AppComponent, ConfirmationDialogComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    SharedModule,
    RouterModule.forRoot(appRoutes, {
      scrollPositionRestoration: 'enabled', // Add options right here
      relativeLinkResolution: 'legacy'
    }),
    TranslateModule.forRoot(),

    //NgBootstrap
    NgbModule,
    ToastrModule.forRoot(),

    // Core modules
    CoreModule.forRoot(coreConfig),
    CoreCommonModule,
    CoreSidebarModule,
    CoreThemeCustomizerModule,

    // App modules
    LayoutModule,
    SampleModule,

    MatSnackBarModule
  ],

  bootstrap: [AppComponent],
  providers: [
    HttpService,
    AuthService,
    AuthGuardService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptorService,
      multi: true,
    },
  ]
})
export class AppModule {}
