import { pluginBasePath,
  vprotectVirtualMachineListPlaceToken,
  vprotectTaskConsolePlaceToken,
  primaryMenuId,
  vprotectDashboardPlaceToken
} from '../constants'
import getPluginApi from '../plugin-api'
import { msg } from '../intl-messages'

function addVprotectPlace () {
  getPluginApi().addPrimaryMenuContainer(msg.vprotectTitle(), primaryMenuId, {
    priority: 10,
    icon: 'fa-font'
  })

  getPluginApi().addSecondaryMenuPlace(primaryMenuId, msg.vprotectDashboardTitle(), vprotectDashboardPlaceToken, `${pluginBasePath}/dashboard.html`, {
    priority: 9
  })

  getPluginApi().addSecondaryMenuPlace(primaryMenuId, msg.vprotectVirtualMachinesTitle(), vprotectVirtualMachineListPlaceToken, `${pluginBasePath}/virtual-machine-list.html`, {
    priority: 10
  })

  getPluginApi().addSecondaryMenuPlace(primaryMenuId, msg.vprotectTaskConsoleTitle(), vprotectTaskConsolePlaceToken, `${pluginBasePath}/task-console.html`, {
    priority: 11
  })

  //TODO backup history page

  // getPluginApi().addSecondaryMenuPlace('', msg.vprotectBackupHistoryListTitle(), vprotectBackupHistoryListPlaceToken, `${pluginBasePath}/backup-history-list.html`, {
  //   priority: 12
  // })
}

export function addPlaces () {
  addVprotectPlace()
}
