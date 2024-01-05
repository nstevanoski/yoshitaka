import { CoreMenu } from '@core/types'

export const menu: CoreMenu[] = [
  {
    id: 'office',
    type: 'section',
    title: 'General',
    translate: 'MENU.OFFICE.SECTION',
    icon: 'package',
    children: [
      {
        id: 'dashboard',
        title: 'Dashboard',
        translate: 'MENU.OFFICE.DASHBOARD',
        type: 'item',
        icon: 'home',
        url: 'dashboard'
      },
      {
        id: 'members',
        title: 'Members',
        translate: 'MENU.OFFICE.MEMBERS',
        type: 'item',
        icon: 'users',
        url: 'members'
      },
      {
        id: 'expenses',
        title: 'Expenses',
        translate: 'MENU.OFFICE.EXPENSES',
        type: 'item',
        icon: 'dollar-sign',
        url: 'expenses'
      },
      // {
      //   id: 'settings',
      //   title: 'Settings',
      //   type: 'item',
      //   icon: 'settings',
      //   url: 'settings'
      // },
    ]
  },
]
