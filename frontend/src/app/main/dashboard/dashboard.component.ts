import { Component, OnInit } from '@angular/core';
import { DashboardService } from 'app/main/dashboard/dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  totalIncome: number;

  constructor(private _dashboardService: DashboardService) { }

  ngOnInit(): void {
    this._dashboardService.getTotalIncome()
      .then((res) => {
        this.totalIncome = res.total;
      })
  }

}
