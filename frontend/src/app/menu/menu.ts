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
        id: 'members',
        title: 'Members',
        translate: 'MENU.OFFICE.MEMBERS',
        type: 'item',
        icon: 'users',
        url: 'members'
      },
      {
        id: 'settings',
        title: 'Settings',
        type: 'item',
        icon: 'settings',
        url: 'settings'
      },
    ]
  },
]
