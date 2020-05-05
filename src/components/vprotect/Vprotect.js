import React from 'react'
import {VirtualMachineList} from './pages/virtual-machine-list/VirtualMachineList'
import {Dashboard} from './pages/dashboard/Dashboard'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from 'react-router-dom'
import {TaskConsole} from './pages/task-console/TaskConsole'
import Policies from './pages/policies/Policies'
import Schedules from './pages/schedules/Schedules'

export class Vprotect extends React.Component {
  constructor (props) {
    super(props)

    const href = window.location.href
    const start = href.indexOf(';')
    const path = href.substring(start + 1)

    this.state = {
      user: JSON.parse(localStorage.getItem('user')),
      path: path
    }
  }

  render () {
    return (
      <Router>
        <Redirect
          to={{
            pathname: '/' + this.state.path,
            state: {from: '/'}
          }}
        />
        <div className={'pt-4 container-fluid'}>
          <Switch>
            <Route path='/dashboard'>
              <Dashboard user={this.state.user} />
            </Route>
            <Route path='/virtual-machine-list'>
              <VirtualMachineList user={this.state.user} />
            </Route>
            <Route path='/task-console'>
              <TaskConsole user={this.state.user} />
            </Route>
            <Route path='/policies'>
              <Policies />
            </Route>
            <Route path='/schedules'>
              <Schedules />
            </Route>
          </Switch>
        </div>
      </Router>
    )
  }
}
