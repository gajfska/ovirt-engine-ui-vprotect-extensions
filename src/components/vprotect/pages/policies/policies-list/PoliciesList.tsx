import React, {useEffect} from 'react'
import {
    sortableHeaderCellFormatter,
    tableCellFormatter
    , Grid, Toolbar, Button, actionHeaderCellFormatter, Table, MenuItem
} from 'patternfly-react'

import {policiesService} from '../../../services/policies-service'
import {TableFilter} from '../../../compoenents/table/TableFilter'
import {
    Link,
    useParams,
    useRouteMatch
} from 'react-router-dom'
import {useDispatch, useSelector} from 'react-redux';
import {getPolicies, removePolicy, setFilteredPolicies, snapshotPolicy} from '../../../../../store/policies/actions';
import {selectFilteredPolicies, selectPolicies} from '../../../../../store/policies/selectors';
import {
    TableWithPagination,
    sortableTransform,
    sortingFormatter,
    sortingColumns
} from '../../../compoenents/table/TableWithPagination'
import {showModalAction} from '../../../../../store/modal/actions';
import {BackupModal} from '../../../compoenents/modal/BackupModal'
import {Filesize} from '../../../compoenents/convert/Filesize'

const filterFields = [
    {
        property: 'name',
        title: 'Name',
        placeholder: 'Filter by Name',
        filterType: 'text'
    }, {
        property: 'guid',
        title: 'Guid',
        placeholder: 'Filter by Guid',
        filterType: 'text'
    }, {
        property: 'backupDestination.name',
        title: 'Backup Destination',
        placeholder: 'Filter by Backup Destination',
        filterType: 'text'
    }
];

export const PoliciesList = () => {
    const dispatch = useDispatch()
    const {type} = useParams()
    let match = useRouteMatch();

    useEffect(() => {
        dispatch(getPolicies(type))
    }, [type])

    let rows = useSelector(selectPolicies);
    let filteredRows = useSelector(selectFilteredPolicies);

    const columns = {
        'vm-backup': [
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
                            <Link to={`/policies/edit/vm-backup/${rowData.guid}`}>
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
                        index: 6,
                        rowSpan: 1,
                        colSpan: 1
                    },
                    formatters: [actionHeaderCellFormatter]
                },
                cell: {
                    props: {
                        index: 6,
                        rowSpan: 1,
                        colSpan: 1
                    },
                    formatters: [
                        (value, {rowData}) => {
                            return [
                                <Table.Actions key='0'>
                                    <Table.DropdownKebab id='myKebab' pullRight>
                                        {rowData.vmCount > 0 && <MenuItem onClick={async () => {
                                            const policy = await policiesService.getPolicy('vm-backup', rowData.guid)

                                        }}>
                                          Backup
                                        </MenuItem>}
                                        <MenuItem onClick={() => {
                                            dispatch(removePolicy(type, rowData.guid))
                                        }}>
                                            Remove
                                        </MenuItem>
                                    </Table.DropdownKebab>
                                </Table.Actions>
                            ]
                        }
                    ]
                }
            }
        ],
        'snapshot': [
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
                            <Link to={`/policies/edit/snapshot/${rowData.guid}`}>
                                {value}
                            </Link>
                        </td>
                    }]
                }
            },
            {
                property: 'priority',
                header: {
                    label: 'Priority',
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
                    formatters: [tableCellFormatter]
                }
            },
            {
                property: 'ruleCount',
                header: {
                    label: 'Rule Count',
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
                header: {
                    label: 'Actions',
                    props: {
                        index: 4,
                        rowSpan: 1,
                        colSpan: 1
                    },
                    formatters: [actionHeaderCellFormatter]
                },
                cell: {
                    props: {
                        index: 4,
                        rowSpan: 1,
                        colSpan: 1
                    },
                    formatters: [
                        (value, {rowData}) => {
                            return [
                                <Table.Actions key='0'>
                                    <Table.DropdownKebab id='myKebab' pullRight>
                                        <MenuItem onClick={() => {
                                            dispatch(snapshotPolicy(type, rowData))
                                        }}>
                                          Snapshot
                                        </MenuItem>
                                        <MenuItem onClick={() => {
                                            dispatch(removePolicy(type, rowData.guid))
                                        }}>
                                            Remove
                                        </MenuItem>
                                    </Table.DropdownKebab>
                                </Table.Actions>
                            ]
                        }
                    ]
                }
            }
        ]
    }

    return (
        <div>
            <Toolbar>
                <div className={'d-flex flex-row justify-content-between'}>
                    <div>
                        <TableFilter fields={filterFields} rows={rows} change={(value) => {
                            dispatch(setFilteredPolicies(value))
                        }}/>
                    </div>
                    <div className={'form-group'}>
                        <Link to={`/policies/edit/${type}/create`}>
                            <Button className={'btn btn-default'}>Create</Button>
                        </Link>
                    </div>
                </div>
            </Toolbar>
            <div className={'pt-4'}>
                <Grid fluid>
                    {type && <TableWithPagination columns={columns[type]}
                                         sortingColumns={sortingColumns}
                                         rows={filteredRows}/>}
                </Grid>
            </div>
        </div>
    )
}

export default PoliciesList
