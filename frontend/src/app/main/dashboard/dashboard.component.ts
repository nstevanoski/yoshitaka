import { Component, OnInit } from '@angular/core';
import { DashboardService } from 'app/main/dashboard/dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  totalIncome: number;
  totalExpenses: number;

  constructor(private _dashboardService: DashboardService) { }

  ngOnInit(): void {
    this.getData();
  }

  async getData() {
    try {
      const totalIncome = await this._dashboardService.getTotalIncome();
      this.totalIncome = totalIncome.total;

      const totalExpenses = await this._dashboardService.getTotalExpenses();
      this.totalExpenses = totalExpenses.total;
    } catch (error) {
      console.log(error);
    }
  }

}
