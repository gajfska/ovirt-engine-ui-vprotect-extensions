import React from 'react'
import {
  withRouter,
  Link
} from 'react-router-dom'
import PropTypes from 'prop-types'
import {policiesService} from '../../../services/policies-service'
// import {hypervisorsService} from '../../../services/hypervisors-service'
import {InputText} from 'primereact/inputtext'
import {ToggleButton} from 'primereact/togglebutton'
// import {Slider} from 'primereact/slider'
import {Dropdown} from 'primereact/dropdown'
// import {Chips} from 'primereact/chips'
import {Button} from 'primereact/button'
// import {ListBox} from 'primereact/listbox'
// import {Accordion, AccordionTab} from 'primereact/accordion'
// import {virtualMachinesService} from '../../../services/virtual-machines.service'
// import {backupDestinationsService} from '../../../services/backup-destinations-service'
import {schedulesService} from '../../../services/schedules-service'
import {alertService} from '../../../services/alert-service'
import {InputConvert} from '../../../compoenents/input/InputConvert'
import {Card} from 'primereact/card'
import {InputTime} from '../../../compoenents/input/InputTime'
import {VirtualMachineSchedule} from '../../../model/VirtualMachineSchedule'
import {Interval} from '../../../model/Interval'
import {InputDays} from '../../../compoenents/input/InputDays'
import {ListBox} from 'primereact/listbox'
import {dayOfWeekOccurrences} from '../../../model/Occurrences'

class Schedule extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      model: new VirtualMachineSchedule(),
      activeIndex: [0]
    }

    if (this.props.match.params.guid !== 'create') {
      schedulesService.getSchedule(this.props.match.params.guid).then(result => {
        this.setState({
          ...this.state,
          model: result
        })
      })
    }

    policiesService.getPolicies('vm-backup').then(result => {
      this.setState({
        ...this.state,
        policies: result
      })
    })
  }

  save = async () => {
    if (this.state.model.guid) {
      await policiesService.updatePolicy('vm-backup', this.state.model.guid, this.state.model)
      await policiesService.updateRule('vm-backup', this.state.model.rules[0].guid, this.state.model.rules[0])
      alertService.info('Policy updated')
    } else {
      const policy = await policiesService.createPolicy('vm-backup', this.state.model)
      await policiesService.createRule('vm-backup', {
        ...this.state.model.rules[0],
        policy: {
          guid: policy.guid
        }
      })
      alertService.info('Policy created')
    }
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevState.model.executionType.name !== this.state.model.executionType.name) {
      this.onExecutionTypeChange()
    }
  }

  onExecutionTypeChange () {
    this.setState({
      ...this.state,
      model: this.state.model.executionType.name === 'TIME' ? {
        ...this.state.model,
        hour: 36000000,
        startWindowLength: 21600000,
        interval: null
      } : {
        ...this.state.model,
        hour: null,
        startWindowLength: null,
        interval: new Interval()
      }
    })
  }

  render () {
    return (
      <Card>
        <div>
          <h3>Name</h3>
          <InputText value={this.state.model.name} onChange={(e) => {
            this.setState({
              ...this.state,
              model: {
                ...this.model,
                name: e.target.value
              }
            })
          }} />
        </div>
        <div>
          <h3>Active</h3>
          <ToggleButton value={this.state.model.active} onChange={(e) => {
            this.setState({
              ...this.state,
              model: {
                ...this.model,
                active: e.target
              }
            })
          }} />
        </div>
        <div>
          <h3>Backup type</h3>
          <Dropdown value={this.state.model.backupType}
            optionLabel='description'
            dataKey='name'
            options={schedulesService.backupTypes} onChange={(e) => {
            this.setState({
              ...this.state,
              model: {
                ...this.state.model,
                backupType: e.value
              }
            })
          }} />
        </div>
        <div>
          <h3>Schedule execution type</h3>
          <Dropdown value={this.state.model.executionType}
            optionLabel='description'
            dataKey='name'
            options={schedulesService.executionTypes} onChange={(e) => {
            this.setState({
              ...this.state,
              model: {
                ...this.state.model,
                executionType: e.value
              }
            })
          }} />
        </div>
        {!this.state.model.interval && <div>
          <div>
            <h3>Start Window Length [min]</h3>
            <InputConvert value={this.state.model.startWindowLength}
              factor={1000 * 60}
              onChange={(e) => {
              this.setState({
                ...this.state,
                model: {
                  ...this.state.model,
                  startWindowLength: e
                }
              })
            }} />
          </div>
          <div>
            <h3>Choose time of day for backup</h3>
            <InputTime value={this.state.model.hour}
              onChange={(e) => {
              this.setState({
                ...this.state,
                model: {
                  ...this.state.model,
                  hour: e
                }
              })
            }}
            />
          </div>
        </div>}
        {this.state.model.interval && <div>
          <div>
            <h3>Frequency [min]</h3>
            <InputConvert value={this.state.model.interval.frequency}
              factor={1000 * 60}
              onChange={(e) => {
                this.setState({
                  ...this.state,
                  model: {
                    ...this.state.model,
                    interval: {
                      ...this.state.model.interval,
                      frequency: e
                    }
                  }
                })
              }} />
          </div>
          <div>
            <h3>Choose time of interval start</h3>
            <InputTime value={this.state.model.interval.startHour}
              onChange={(e) => {
               this.setState({
                 ...this.state,
                 model: {
                   ...this.state.model,
                   interval: {
                     ...this.state.model.interval,
                     startHour: e
                   }
                 }
               })
              }}
            />
          </div>
          <div>
            <h3>Choose time of interval end</h3>
            <InputTime value={this.state.model.interval.endHour}
              onChange={(e) => {
               this.setState({
                 ...this.state,
                 model: {
                   ...this.state.model,
                   interval: {
                     ...this.state.model.interval,
                     endHour: e
                   }
                 }
               })
              }}
            />
          </div>
        </div>}
        <div>
          <h3>Choose days (required)</h3>
          <InputDays
            value={this.state.model.daysOfWeek}
            hour={this.state.model.hour}
            onChange={(e) => {
             this.setState({
               ...this.state,
               model: {
                 ...this.state.model,
                 daysOfWeek: e
               }
             })
            }} />
        </div>
        <div>
          <h3>Selected day of week occurrence (optional)</h3>
          <ListBox multiple
            optionLabel='name'
            dataKey='name'
            value={this.state.model.dayOfWeekOccurrences}
            options={dayOfWeekOccurrences}
            className={'col'}
            onChange={(e) => {
             this.setState({
               ...this.state,
               model: {
                 ...this.state.model,
                 dayOfWeekOccurrences: e.value
               }
             })
            }} />
        </div>
        <div className={'d-flex justify-content-between'}>
          <div>
            <Link to={`/schedules`}>
              <Button label='Back' />
            </Link>
          </div>
          <div>
            <Button label='Save' className='p-button-success' onClick={this.save} />
          </div>
        </div>
      </Card>
    )
  }
}

Schedule.propTypes = {
  match: PropTypes.object.isRequired
}

export default withRouter(Schedule)
