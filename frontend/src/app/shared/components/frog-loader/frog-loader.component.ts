import {ChangeDetectionStrategy, Component} from '@angular/core';
import {GlobalLoaderService} from '../../services/global-loader.service';

@Component({
  selector: 'frog-loader',
  templateUrl: './frog-loader.component.html',
  styleUrls: ['./frog-loader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FrogLoaderComponent {

  constructor(public globalLoaderService: GlobalLoaderService) {
  }

}
