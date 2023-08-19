import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlobalLoaderService } from './services/global-loader.service';
import { FrogLoaderComponent } from './components/frog-loader/frog-loader.component';
import { AuthenticationModule } from './authentication/authentication.module';
import { AuthGuardService } from './services/auth-guard.service';
import { AuthService } from './services/auth.service';



@NgModule({
  declarations: [FrogLoaderComponent],
  exports: [FrogLoaderComponent],
  imports: [
    CommonModule,
    AuthenticationModule
  ],
  providers: [GlobalLoaderService]
})
export class SharedModule { }
