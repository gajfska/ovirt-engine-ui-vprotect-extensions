import {VprotectApiService} from './vprotect-api-service'

export class VprotectService {
  _hvWithIncremental = ['KVM', 'CITRIX', 'ESXI', 'HYPERV'];
  _hvmWithIncremental = ['RHV', 'NUTANIX', 'VCENTER'];

  restoreToOptions = [
    {label: 'Restore to filesystem', value: 'FS'},
    {label: 'Restore to hypervisor manager', value: 'HVM'},
    {label: 'Restore to hypervisor', value: 'HV'},
  ]

  vprotectApiService = new VprotectApiService();

  login (username, password) {
    return this.vprotectApiService.post('/session/login', {login: username, password: password});
  }

  getVirtualMachines () {
    return this.vprotectApiService.get('/virtual-machines');
  }

  getBackupDestinationsForVMs (vms) {
    return this.vprotectApiService.post('/backup-destinations/usable-for-vms', vms);
  }

  submitExportTask (task) {
    return this.vprotectApiService.post('/tasks/export', task);
  }

  getRestorableBackups (virtualMachineGuid) {
    return this.vprotectApiService.get('/backups?protected-entity=' + virtualMachineGuid + '&status=SUCCESS');
  }

  getAvailableNodesForBackup(id) {
    return this.vprotectApiService.get('/nodes?backup-to-be-restored=' + id);
  }

  getBackupTypes (vm) {
    let backupTypes = [{name: 'FULL', description: 'Full'}];
    if(this.isIncrementalAvailable(vm)){
      backupTypes.push({name: 'INCREMENTAL', description: 'Incremental'})
    }
    return backupTypes;
  }

  isIncrementalAvailable(vm) {
    return (vm.hvType != null && this._hvWithIncremental.includes(vm.hvType.name))
      || (vm.hvmType != null && this._hvmWithIncremental.includes(vm.hvmType.name));
  }

}
