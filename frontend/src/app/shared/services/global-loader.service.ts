import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/internal/Subject';

@Injectable({
  providedIn: 'root'
})
export class GlobalLoaderService {

  public showLoader$: Subject<any> = new Subject();
  public text = '';

  constructor() {
  }

  show(text?) {
    this.text = text;
    this.showLoader$.next(true);
  }

  hide() {
    this.text = '';
    this.showLoader$.next(false);
  }
}


