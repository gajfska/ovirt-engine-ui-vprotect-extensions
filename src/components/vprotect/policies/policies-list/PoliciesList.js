import React from 'react'
import * as sort from 'sortabular'
import {
  actionHeaderCellFormatter,
  defaultSortingOrder,
  sortableHeaderCellFormatter,
  tableCellFormatter,
  Table,
  TABLE_SORT_DIRECTION, MenuItem
  , Grid, Toolbar
} from 'patternfly-react'

import {VprotectService} from '../../../../services/vprotect-service'
import {Filesize} from '../../convert/Filezize'
import {TableFilter} from '../../controls/TableFilter'
import {TableWithPagination} from '../../controls/TableWithPagination'
import {
  Link,
  useRouteMatch
} from 'react-router-dom'

export class PoliciesList extends React.Component {
  vprotectService = new VprotectService()

  constructor (props) {
    super(props)

    this.vprotectService.getPolicies().then(result => {
      this.setState({
        rows: result,
        filteredRows: result
      })
    })

    const getSortingColumns = () => this.state.sortingColumns || {}

    const sortableTransform = sort.sort({
      getSortingColumns,
      onSort: selectedColumn => {
        this.setState({
          sortingColumns: sort.byColumn({
            sortingColumns: this.state.sortingColumns,
            sortingOrder: defaultSortingOrder,
            selectedColumn
          })
        })
      },
      strategy: sort.strategies.byProperty
    })

    const sortingFormatter = sort.header({
      sortableTransform,
      getSortingColumns,
      strategy: sort.strategies.byProperty
    })

    this.state = {
      sortingColumns: {
        name: {
          direction: TABLE_SORT_DIRECTION.ASC,
          position: 0
        }
      },

      columns: [
        {
          property: 'name',
          header: {
            label: 'Name',
            props: {
              index: 0,
              rowSpan: 1,
              colSpan: 1
            },
            transforms: [sortableTransform],
            formatters: [sortingFormatter],
            customFormatters: [sortableHeaderCellFormatter]
          },
          cell: {
            props: {
              index: 0
            },
            formatters: [(value, {rowData}) => {
              return <td>
                <Link to={`${useRouteMatch().url}/${rowData.guid}`} target={'_blank'}>
                  {value}
                </Link>
              </td>
            }]
          }
        },
        {
          property: 'backupDestination',
          header: {
            label: 'Backup Destination',
            props: {
              index: 1,
              rowSpan: 1,
              colSpan: 1
            },
            transforms: [sortableTransform],
            formatters: [sortingFormatter],
            customFormatters: [sortableHeaderCellFormatter]
          },
          cell: {
            props: {
              index: 1
            },
            formatters: [value => {
              return <td>
                {value ? value.name : ''}
              </td>
            }]
          }
        },
        {
          property: 'priority',
          header: {
            label: 'Priority',
            props: {
              index: 2,
              rowSpan: 1,
              colSpan: 1
            },
            transforms: [sortableTransform],
            formatters: [sortingFormatter],
            customFormatters: [sortableHeaderCellFormatter]
          },
          cell: {
            props: {
              index: 2
            },
            formatters: [tableCellFormatter]
          }
        },
        {
          property: 'vmCount',
          header: {
            label: 'VM Count',
            props: {
              index: 3,
              rowSpan: 1,
              colSpan: 1
            },
            transforms: [sortableTransform],
            formatters: [sortingFormatter],
            customFormatters: [sortableHeaderCellFormatter]
          },
          cell: {
            props: {
              index: 3
            },
            formatters: [tableCellFormatter]
          }
        },
        {
          property: 'vmBackupPolicy',
          header: {
            label: 'Policy',
            props: {
              index: 4,
              rowSpan: 1,
              colSpan: 1
            },
            transforms: [sortableTransform],
            formatters: [sortingFormatter],
            customFormatters: [sortableHeaderCellFormatter]
          },
          cell: {
            props: {
              index: 4
            },
            formatters: [value => {
              return <td>
                {value ? value.name : ''}
              </td>
            }]
          }
        },
        {
          property: 'averageBackupSize',
          header: {
            label: 'Average Backup Size',
            props: {
              index: 5,
              rowSpan: 1,
              colSpan: 1
            },
            transforms: [sortableTransform],
            formatters: [sortingFormatter],
            customFormatters: [sortableHeaderCellFormatter]
          },
          cell: {
            props: {
              index: 5
            },
            formatters: [(value) => {
              return <td>
                <Filesize bytes={value} />
              </td>
            }]
          }
        },
        {
          header: {
            label: 'Actions',
            props: {
              index: 8,
              rowSpan: 1,
              colSpan: 1
            },
            formatters: [actionHeaderCellFormatter]
          },
          cell: {
            props: {
              index: 8,
              rowSpan: 1,
              colSpan: 1
            },
            formatters: [
              (value, {rowData}) => {
                return [
                  <Table.Actions key='0'>
                    <Table.DropdownKebab id='myKebab' pullRight>
                      <MenuItem onClick={() => {
                        this.setState(
                          {
                            selectedVirtualEnvironment: rowData,
                            showBackupModal: true
                          }
                        )
                      }}>Backup</MenuItem>
                      {rowData.lastSuccessfulBackupSize > 0 &&
                      <MenuItem onClick={() => {
                        this.setState({
                          selectedVirtualEnvironment: rowData,
                          showRestoreModal: true
                        })
                      }}>Restore</MenuItem>}
                      <MenuItem onClick={() => {
                        this.setState(
                          {
                            selectedVirtualEnvironment: rowData,
                            showBackupHistoryListModal: true
                          }
                        )
                      }}>Show Backup History</MenuItem>
                    </Table.DropdownKebab>
                  </Table.Actions>
                ]
              }
            ]
          }
        }
      ],

      rows: [],
      filteredRows: [],

      pagination: {
        page: 1,
        perPage: 10,
        perPageOptions: [10, 25, 50, 100]
      },

      pageChangeValue: 1,

      selectedVirtualEnvironment: null,
      showBackupModal: false,
      showBackupHistoryListModal: false,
      showRestoreModal: false
    }
  }

  closeModal = () => {
    this.setState({showBackupModal: false, showBackupHistoryListModal: false, showRestoreModal: false})
  }

  filterFields = [
    {
      property: 'name',
      title: 'Name',
      placeholder: 'Filter by Name',
      filterType: 'text'
    }, {
      property: 'uuid',
      title: 'Uuid',
      placeholder: 'Filter by Uuid',
      filterType: 'text'
    }, {
      property: 'hypervisor.name',
      title: 'Hypervisor',
      placeholder: 'Filter by Hypervisor',
      filterType: 'text'
    }, {
      property: 'vmBackupPolicy.name',
      title: 'Policy',
      placeholder: 'Filter by Policy',
      filterType: 'text'
    }
  ]

  render () {
    return (
      <div>
        <Toolbar>
          <TableFilter fields={this.filterFields} rows={this.state.rows} change={(value) => {
            this.setState({filteredRows: value})
          }} />
        </Toolbar>
        <div className={'padding-top-20px'}>
          <Grid fluid>
            <TableWithPagination columns={this.state.columns}
                                 sortingColumns={this.state.sortingColumns}
                                 rows={this.state.filteredRows} />
          </Grid>
        </div>
      </div>
    )
  }
}

PoliciesList.propTypes = {
}
