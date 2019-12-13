import React from 'react'
import PropTypes from 'prop-types'
import { Filter, FormControl, Toolbar } from 'patternfly-react'
import { findIndex, find, remove } from 'lodash'

// export const mockFilterExampleFields = [
//   {
//     id: 'name',
//     title: 'Name',
//     placeholder: 'Filter by Name',
//     filterType: 'text'
//   },
//   {
//     id: 'address',
//     title: 'Address',
//     placeholder: 'Filter by Address',
//     filterType: 'text'
//   },
//   {
//     id: 'birthMonth',
//     title: 'Birth Month',
//     placeholder: 'Filter by Birth Month',
//     filterType: 'select',
//     filterValues: [
//       { title: 'January', id: 'jan' },
//       { title: 'February', id: 'feb' },
//       { title: 'March', id: 'mar' },
//       { title: 'April', id: 'apr' },
//       { title: 'May', id: 'may' },
//       { title: 'June', id: 'jun' },
//       { title: 'July', id: 'jul' },
//       { title: 'August', id: 'aug' },
//       { title: 'September', id: 'sep' },
//       { title: 'October', id: 'oct' },
//       { title: 'November', id: 'nov' },
//       { title: 'December', id: 'dec' }
//     ]
//   },
//   {
//     id: 'car',
//     title: 'Car',
//     placeholder: 'Filter by Car Make',
//     filterType: 'complex-select',
//     filterValues: [{ title: 'Subaru', id: 'subie' }, 'Toyota'],
//     filterCategoriesPlaceholder: 'Filter by Car Model',
//     filterCategories: [
//       {
//         id: 'subie',
//         title: 'Subaru',
//         filterValues: [
//           {
//             title: 'Outback',
//             id: 'out'
//           },
//           'Crosstrek',
//           'Impreza'
//         ]
//       },
//       {
//         id: 'toyota',
//         title: 'Toyota',
//         filterValues: [
//           {
//             title: 'Prius',
//             id: 'pri'
//           },
//           'Corolla',
//           'Echo'
//         ]
//       }
//     ]
//   }
// ];

export class TableFilter extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      currentFilterType: this.props.fields[0],
      activeFilters: [],
      currentValue: ''
    }
  }

  filteredRows = () => {
    return this.props.rows.filter(el => {
      let numberOfFilteredValuesFound = 0
      for (let i = 0; i < this.state.activeFilters.length; i++) {
        let propertyParts = this.state.activeFilters[i].property.split('.')
        let element
        if (propertyParts.length === 1) {
          element = el[propertyParts[0]]
        } else if (propertyParts.length === 2) {
          element = el[propertyParts[0]] && el[propertyParts[0]][propertyParts[1]]
        }
        numberOfFilteredValuesFound += element && element.toLowerCase().indexOf(this.state.activeFilters[i].value.toLowerCase()) > -1
      }
      return numberOfFilteredValuesFound === this.state.activeFilters.length
    })
  }

  componentDidUpdate (prevProps, prevState) {
    if ((prevState.activeFilters.length !== this.state.activeFilters.length) || prevProps.rows.length !== this.props.rows.length) { this.props.change(this.filteredRows()) }
  }

  filterAdded = (field, value) => {
    let filterText = ''
    if (field.title) {
      filterText = field.title
    } else {
      filterText = field
    }
    filterText += ': '

    if (value.filterCategory) {
      filterText +=
        (value.filterCategory.title || value.filterCategory) +
        '-' +
        (value.filterValue.title || value.filterValue)
    } else if (value.title) {
      filterText += value.title
    } else {
      filterText += value
    }

    if ((field.filterType === 'select' || field.filterType === 'complex-select') && this.filterExists(field.title)) {
      this.enforceSingleSelect(field.title)
    }

    let activeFilters = [...this.state.activeFilters, { label: filterText, property: field.property, value: value }]
    this.setState({ activeFilters: activeFilters })
  };

  selectFilterType = filterType => {
    const { currentFilterType } = this.state
    if (currentFilterType !== filterType) {
      let newCurrentValue = ''
      let newFilterCategory
      // set selected value(s) in dropdown(s) if filter exists
      if (filterType.filterType === 'select' || filterType.filterType === 'complex-select') {
        if (this.filterExists(filterType.title)) {
          const filterValue = this.getFilterValue(filterType.title)
          if (filterType.filterType === 'select') {
            newCurrentValue = filterValue
          } else {
            const categoryValues = filterValue.split('-');
            [newFilterCategory, newCurrentValue] = categoryValues
            newFilterCategory = find(filterType.filterCategories, filterCat => filterCat.title === newFilterCategory)
          }
        }
      }
      this.setState({
        currentFilterType: filterType,
        currentValue: newCurrentValue,
        filterCategory: newFilterCategory
      })
    }
  }

  filterValueSelected = filterValue => {
    const { currentFilterType, currentValue } = this.state

    if (filterValue !== currentValue) {
      this.setState({ currentValue: filterValue })
      if (filterValue) {
        this.filterAdded(currentFilterType, filterValue)
      }
    }
  }

  filterCategorySelected = category => {
    const { filterCategory } = this.state
    if (filterCategory !== category) {
      this.setState({ filterCategory: category, currentValue: '' })
    }
  }

  categoryValueSelected = value => {
    const { currentValue, currentFilterType, filterCategory } = this.state

    if (filterCategory && currentValue !== value) {
      this.setState({ currentValue: value })
      if (value) {
        let filterValue = {
          filterCategory: filterCategory,
          filterValue: value
        }
        this.filterAdded(currentFilterType, filterValue)
      }
    }
  }

  updateCurrentValue = event => {
    this.setState({ currentValue: event.target.value })
  }

  onValueKeyPress = keyEvent => {
    const { currentValue, currentFilterType } = this.state

    if (keyEvent.key === 'Enter' && currentValue && currentValue.length > 0) {
      this.setState({ currentValue: '' })
      this.filterAdded(currentFilterType, currentValue)
      keyEvent.stopPropagation()
      keyEvent.preventDefault()
    }
  }

  filterExists = fieldTitle => {
    const { activeFilters } = this.state
    const index = findIndex(activeFilters, filter => filter.label.startsWith(fieldTitle))
    return index !== -1
  };

  getFilterValue = fieldTitle => {
    const { activeFilters } = this.state
    const existingFilter = find(activeFilters, filter => filter.label.startsWith(fieldTitle))
    return existingFilter.label.substring(existingFilter.label.indexOf(': ') + 2)
  };

  enforceSingleSelect = fieldTitle => {
    const { activeFilters } = this.state
    remove(activeFilters, filter => filter.label.startsWith(fieldTitle))
  };

  removeFilter = filter => {
    const { activeFilters } = this.state

    let index = activeFilters.indexOf(filter)
    if (index > -1) {
      let updated = [
        ...activeFilters.slice(0, index),
        ...activeFilters.slice(index + 1)
      ]
      this.setState({ activeFilters: updated })
    }
  }

  clearFilters = () => {
    this.setState({ activeFilters: [] })
  }

  renderInput () {
    const { currentFilterType, currentValue, filterCategory } = this.state
    if (!currentFilterType) {
      return null
    }

    if (currentFilterType.filterType === 'select' || currentFilterType.filterType === 'complex-select') {
      // remove selected value in dropdown(s) if filter was removed
      if (currentValue !== '' && !this.filterExists(currentFilterType.title)) {
        this.setState({
          currentValue: '',
          filterCategory: currentFilterType.filterType === 'complex-select' ? '' : filterCategory
        })
      }
    }

    if (currentFilterType.filterType === 'select') {
      return (
        <Filter.ValueSelector
          filterValues={currentFilterType.filterValues}
          placeholder={currentFilterType.placeholder}
          currentValue={currentValue}
          onFilterValueSelected={this.filterValueSelected}
        />
      )
    } else if (currentFilterType.filterType === 'complex-select') {
      return (
        <Filter.CategorySelector
          filterCategories={currentFilterType.filterCategories}
          currentCategory={filterCategory}
          placeholder={currentFilterType.placeholder}
          onFilterCategorySelected={this.filterCategorySelected}
        >
          <Filter.CategoryValueSelector
            categoryValues={filterCategory && filterCategory.filterValues}
            currentValue={currentValue}
            placeholder={currentFilterType.filterCategoriesPlaceholder}
            onCategoryValueSelected={this.categoryValueSelected}
          />
        </Filter.CategorySelector>
      )
    } else {
      return (
        <FormControl
          type={currentFilterType.filterType}
          value={currentValue}
          placeholder={currentFilterType.placeholder}
          onChange={e => this.updateCurrentValue(e)}
          onKeyPress={e => this.onValueKeyPress(e)}
        />
      )
    }
  }

  render () {
    const { currentFilterType, activeFilters } = this.state

    return (
      <div>
        <div style={{ width: 300 }}>
          <Filter>
            <Filter.TypeSelector
              filterTypes={this.props.fields}
              currentFilterType={currentFilterType}
              onFilterTypeSelected={this.selectFilterType}
            />
            {this.renderInput()}
          </Filter>
        </div>
        {activeFilters &&
        activeFilters.length > 0 && (
          <Toolbar.Results>
            <Filter.ActiveLabel>{'Active Filters:'}</Filter.ActiveLabel>
            <Filter.List>
              {activeFilters.map((item, index) => {
                return (
                  <Filter.Item
                    key={index}
                    onRemove={this.removeFilter}
                    filterData={item}
                  >
                    {item.label}
                  </Filter.Item>
                )
              })}
            </Filter.List>
            <a
              href='#'
              onClick={e => {
                e.preventDefault()
                this.clearFilters()
              }}
            >
              Clear All Filters
            </a>
          </Toolbar.Results>
        )}
      </div>
    )
  }
}

TableFilter.propTypes = {
  fields: PropTypes.any.isRequired,
  change: PropTypes.func.isRequired,
  rows: PropTypes.array.isRequired
}
