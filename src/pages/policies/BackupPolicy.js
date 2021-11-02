import React from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { InputText } from 'primereact/inputtext';
import { ToggleButton } from 'primereact/togglebutton';
import { Slider } from 'primereact/slider';
import { Dropdown } from 'primereact/dropdown';
import { Chips } from 'primereact/chips';
import { Button } from 'primereact/button';
import { ListBox } from 'primereact/listbox';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { policiesService } from '../../services/policies-service';
import { hypervisorsService } from '../../services/hypervisors-service';
import { virtualMachinesService } from '../../services/virtual-machines-service';
import { backupDestinationsService } from '../../services/backup-destinations-service';
import { schedulesService } from '../../services/schedules-service';
import { alertService } from '../../services/alert-service';
import { VirtualMachineBackupPolicy } from '../../model/VirtualMachineBackupPolicy';
import { createBrowserHistory } from 'history';
import { BackButton } from '../../utils/backButton';

const history = createBrowserHistory();

class BackupPolicy extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      model: new VirtualMachineBackupPolicy(),
      activeIndex: [0],
    };

    if (this.props.match.params.guid !== 'create') {
      policiesService
        .getPolicy('vm-backup', this.props.match.params.guid)
        .then((result) => {
          this.setState({
            ...this.state,
            model: result,
          });
        });
    }

    hypervisorsService.getAllHypervisorClusters().then((result) => {
      this.setState({
        ...this.state,
        hypervisorClusters: result,
      });
    });

    virtualMachinesService.getVirtualMachines().then((result) => {
      this.setState({
        ...this.state,
        virtualMachines: result,
      });
    });

    backupDestinationsService.getAllBackupDestinations().then((result) => {
      this.setState({
        ...this.state,
        backupDestinations: result,
      });
    });

    schedulesService.getAllTypeSchedules('VM_BACKUP').then((result) => {
      this.setState({
        ...this.state,
        schedules: result,
      });
    });
  }

  handle = (name) => {
    return (e) => {
      this.setState({
        ...this.state,
        model: {
          ...this.state.model,
          [name]:
            e.target && e.target.nodeName === 'INPUT'
              ? e.target.value
              : e.value,
        },
      });
    };
  };

  save = async () => {
    if (this.state.model.guid) {
      await policiesService.updatePolicy(
        'vm-backup',
        this.state.model.guid,
        this.state.model,
      );
      await policiesService.updateRule(
        'vm-backup',
        this.state.model.rules[0].guid,
        this.state.model.rules[0],
      );
      alertService.info('Policy updated');
    } else {
      const policy = await policiesService.createPolicy(
        'vm-backup',
        this.state.model,
      );
      await policiesService.createRule('vm-backup', {
        ...this.state.model.rules[0],
        policy: {
          guid: policy.guid,
        },
      });
      alertService.info('Policy created');
    }
    history.back();
  };

  render() {
    return (
      <div className={'form'}>
        <Accordion
          multiple
          activeIndex={this.state.activeIndex}
          onTabChange={(e) => this.setState({ activeIndex: e.index })}
        >
          <AccordionTab header="General">
            <div>
              <h5>Name</h5>
              <InputText
                value={this.state.model.name}
                onChange={this.handle('name')}
              />
            </div>
            <div className={'pt-2'}>
              <h5>Scheduled backups enabled</h5>
              <ToggleButton
                checked={this.state.model.active}
                onChange={(e) => {
                  this.setState({
                    ...this.state,
                    model: {
                      ...this.state.model,
                      active: e.value,
                    },
                  });
                }}
              />
            </div>
            <div className={'pt-2'}>
              <h5>Auto remove non-present Virtual Environments</h5>
              <ToggleButton
                checked={this.state.model.autoRemoveNonPresent}
                onChange={(e) => {
                  this.setState({
                    ...this.state,
                    model: {
                      ...this.state.model,
                      autoRemoveNonPresent: e.value,
                    },
                  });
                }}
              />
            </div>
            <div className={'pt-2'}>
              <h5>Priority</h5>
              <InputText
                value={this.state.model.priority}
                type="number"
                onChange={this.handle('priority')}
              />
            </div>
          </AccordionTab>
          <AccordionTab header="Auto-assigment">
            <h5>Auto-assign Mode</h5>
            <Dropdown
              value={this.state.model.autoAssignSettings.mode}
              optionLabel="description"
              dataKey="name"
              options={policiesService.assignModes}
              onChange={(e) => {
                this.setState({
                  ...this.state,
                  model: {
                    ...this.state.model,
                    autoAssignSettings: {
                      ...this.state.model.autoAssignSettings,
                      mode: e.value,
                    },
                  },
                });
              }}
            />

            <div className={'mt-3'}>
              <h5>Include rules</h5>
              <div className={'d-flex'}>
                <div className={'col'}>
                  <h6>Include TAG based rules</h6>
                  <Chips
                    value={this.state.model.autoAssignSettings.includeTags}
                    separator=","
                    className="w-100"
                    onChange={(e) => {
                      this.setState({
                        ...this.state,
                        model: {
                          ...this.state.model,
                          autoAssignSettings: {
                            ...this.state.model.autoAssignSettings,
                            includeTags: e.value,
                          },
                        },
                      });
                    }}
                  />
                  <div>
                    <small>Comma separated</small>
                  </div>
                </div>
                <div className={'col'}>
                  <h6>Include Regex based rules</h6>
                  <Chips
                    value={this.state.model.autoAssignSettings.includeRegExps}
                    separator=","
                    className="w-100"
                    onChange={(e) => {
                      this.setState({
                        ...this.state,
                        model: {
                          ...this.state.model,
                          autoAssignSettings: {
                            ...this.state.model.autoAssignSettings,
                            includeRegExps: e.value,
                          },
                        },
                      });
                    }}
                  />
                  <div>
                    <small>Comma separated</small>
                  </div>
                </div>
              </div>
            </div>
            <div className={'mt-3'}>
              <h5>Exclude rules</h5>
              <div className={'d-flex'}>
                <div className={'col'}>
                  <h6>Exclude TAG based rules</h6>
                  <Chips
                    value={this.state.model.autoAssignSettings.excludeTags}
                    separator=","
                    className="w-100"
                    onChange={(e) => {
                      this.setState({
                        ...this.state,
                        model: {
                          ...this.state.model,
                          autoAssignSettings: {
                            ...this.state.model.autoAssignSettings,
                            excludeTags: e.value,
                          },
                        },
                      });
                    }}
                  />
                  <div>
                    <small>Comma separated</small>
                  </div>
                </div>
                <div className={'col'}>
                  <h6>Exclude Regex based rules</h6>
                  <Chips
                    value={this.state.model.autoAssignSettings.excludeRegExps}
                    separator=","
                    className="w-100"
                    onChange={(e) => {
                      this.setState({
                        ...this.state,
                        model: {
                          ...this.state.model,
                          autoAssignSettings: {
                            ...this.state.model.autoAssignSettings,
                            excludeRegExps: e.value,
                          },
                        },
                      });
                    }}
                  />
                  <div>
                    <small>Comma separated</small>
                  </div>
                </div>
              </div>
            </div>

            <div className={'mt-2'}>
              <h5>
                Auto-assign Virtual Environments only if they belong to the
                following clusters (optional)
              </h5>
              <ListBox
                multiple
                optionLabel="name"
                dataKey="guid"
                value={this.state.model.autoAssignSettings.hvClusters}
                options={this.state.hypervisorClusters}
                className={'w-100'}
                onChange={(e) => {
                  this.setState({
                    ...this.state,
                    model: {
                      ...this.state.model,
                      autoAssignSettings: {
                        ...this.state.model.autoAssignSettings,
                        hvClusters: e.value,
                      },
                    },
                  });
                }}
              />
            </div>
          </AccordionTab>
          <AccordionTab header="Virtual Environments">
            <div>
              <h5>Choose Virtual Environments</h5>
              <ListBox
                multiple
                filter
                dataKey="guid"
                optionLabel="name"
                value={this.state.model.vms}
                className={'w-100'}
                options={this.state.virtualMachines}
                onChange={(e) => {
                  this.setState({
                    ...this.state,
                    model: {
                      ...this.state.model,
                      vms: e.value,
                    },
                  });
                }}
              />
            </div>
          </AccordionTab>
          <AccordionTab header="Rule">
            <div>
              <h5>Select Backup Destination</h5>
              <Dropdown
                value={this.state.model.rules[0].backupDestinations[0]}
                optionLabel="name"
                dataKey="guid"
                options={this.state.backupDestinations}
                onChange={(e) => {
                  this.setState({
                    ...this.state,
                    model: {
                      ...this.state.model,
                      rules: [
                        {
                          ...this.state.model.rules[0],
                          backupDestinations: [e.value],
                        },
                      ],
                    },
                  });
                }}
              />
            </div>
            <div className={'mt-3'}>
              <h5>Choose schedules</h5>
              <ListBox
                multiple
                optionLabel="name"
                dataKey="guid"
                value={this.state.model.rules[0].schedules}
                className={'w-100'}
                options={this.state.schedules}
                onChange={(e) => {
                  this.setState({
                    ...this.state,
                    model: {
                      ...this.state.model,
                      rules: [
                        {
                          ...this.state.model.rules[0],
                          schedules: e.value,
                        },
                      ],
                    },
                  });
                }}
              />
            </div>
          </AccordionTab>
          <AccordionTab header="Other">
            <div>
              <h5>
                Fail rest of the backup tasks if more than X % of EXPORT tasks
                already failed
              </h5>
              <ToggleButton
                checked={
                  !!this.state.model.failRemainingBackupTasksExportThreshold
                }
                onChange={(e) => {
                  this.setState({
                    ...this.state,
                    model: {
                      ...this.state.model,
                      failRemainingBackupTasksExportThreshold: e.value
                        ? 50
                        : null,
                    },
                  });
                }}
              />
              {!!this.state.model.failRemainingBackupTasksExportThreshold && (
                <div>
                  <h3>Percent of already failed EXPORT tasks</h3>
                  <InputText
                    value={
                      this.state.model.failRemainingBackupTasksExportThreshold
                    }
                    type="number"
                    onChange={this.handle(
                      'failRemainingBackupTasksExportThreshold',
                    )}
                  />
                </div>
              )}
            </div>
            <div className={'mt-3'}>
              <h5>
                Fail rest of the backup tasks if more than X % of STORE tasks
                already failed
              </h5>
              <ToggleButton
                checked={
                  !!this.state.model.failRemainingBackupTasksStoreThreshold
                }
                onChange={(e) => {
                  this.setState({
                    ...this.state,
                    model: {
                      ...this.state.model,
                      failRemainingBackupTasksStoreThreshold: e.value
                        ? 50
                        : null,
                    },
                  });
                }}
              />
              {!!this.state.model.failRemainingBackupTasksStoreThreshold && (
                <div>
                  <h3>Percent of already failed STORE tasks</h3>
                  <InputText
                    value={
                      this.state.model.failRemainingBackupTasksStoreThreshold
                    }
                    type="number"
                    onChange={this.handle(
                      'failRemainingBackupTasksStoreThreshold',
                    )}
                  />
                </div>
              )}
            </div>
          </AccordionTab>
        </Accordion>
        <div className="d-flex justify-content-between mt-3">
          <div>
            <BackButton />
          </div>
          <div>
            <Button
              label="Save"
              className="p-button-success"
              onClick={this.save}
            />
          </div>
        </div>
      </div>
    );
  }
}

BackupPolicy.propTypes = {
  match: PropTypes.object.isRequired,
};

export default withRouter(BackupPolicy);
