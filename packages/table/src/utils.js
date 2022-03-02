import VXETable from './v-x-e-table'
import DUtils from './tools/d-utils.umd.min'
import { ColumnInfo } from './columnInfo'
import DomTools from './tools/dom'

const lineOffsetSizes = {
    mini: 3,
    small: 2,
    medium: 1
}

export function restoreScrollLocation(_vm, scrollLeft, scrollTop) {
    return _vm.clearScroll().then(() => {
        if (scrollLeft || scrollTop) {
            // 重置最后滚动状态
            _vm.lastScrollLeft = 0
            _vm.lastScrollTop = 0
                // 还原滚动状态
            return _vm.scrollTo(scrollLeft, scrollTop)
        }
    })
}

export function toTreePathSeq(path) {
    return path.map((num, i) => i % 2 === 0 ? (Number(num) + 1) : '.').join('')
}

export function removeScrollListener(scrollElem) {
    if (scrollElem && scrollElem._onscroll) {
        scrollElem.onscroll = null
    }
}

export function restoreScrollListener(scrollElem) {
    if (scrollElem && scrollElem._onscroll) {
        scrollElem.onscroll = scrollElem._onscroll
    }
}

// 行主键 key
export function getRowkey($duitable) {
    return $duitable.rowOpts.keyField || $duitable.rowId || '_X_ROW_KEY'
}

// 行主键 value
export function getRowid($duitable, row) {
    const rowid = DUtils.get(row, getRowkey($duitable))
    return DUtils.eqNull(rowid) ? '' : encodeURIComponent(rowid)
}

function getPaddingLeftRightSize(elem) {
    if (elem) {
        const computedStyle = getComputedStyle(elem)
        const paddingLeft = DUtils.toNumber(computedStyle.paddingLeft)
        const paddingRight = DUtils.toNumber(computedStyle.paddingRight)
        return paddingLeft + paddingRight
    }
    return 0
}

function getElemenMarginWidth(elem) {
    if (elem) {
        const computedStyle = getComputedStyle(elem)
        const marginLeft = DUtils.toNumber(computedStyle.marginLeft)
        const marginRight = DUtils.toNumber(computedStyle.marginRight)
        return elem.offsetWidth + marginLeft + marginRight
    }
    return 0
}

export function handleFieldOrColumn(_vm, fieldOrColumn) {
    if (fieldOrColumn) {
        return DUtils.isString(fieldOrColumn) ? _vm.getColumnByField(fieldOrColumn) : fieldOrColumn
    }
    return null
}

function queryCellElement(cell, selector) {
    return cell.querySelector('.dui-cell' + selector)
}

export function toFilters(filters) {
    if (filters && DUtils.isArray(filters)) {
        return filters.map(({ label, value, data, resetValue, checked }) => {
            return { label, value, data, resetValue, checked: !!checked, _checked: !!checked }
        })
    }
    return filters
}

export function getColMinWidth(params) {
    const { $table, column, cell } = params
    const { showHeaderOverflow: allColumnHeaderOverflow, resizableOpts } = $table
    const { minWidth } = resizableOpts
    // 如果自定义调整宽度逻辑
    if (minWidth) {
        const customMinWidth = DUtils.isFunction(minWidth) ? minWidth(params) : minWidth
        if (customMinWidth !== 'auto') {
            return Math.max(1, DUtils.toNumber(customMinWidth))
        }
    }
    const { showHeaderOverflow, minWidth: colMinWidth } = column
    const headOverflow = DUtils.isUndefined(showHeaderOverflow) || DUtils.isNull(showHeaderOverflow) ? allColumnHeaderOverflow : showHeaderOverflow
    const showEllipsis = headOverflow === 'ellipsis'
    const showTitle = headOverflow === 'title'
    const showTooltip = headOverflow === true || headOverflow === 'tooltip'
    const hasEllipsis = showTitle || showTooltip || showEllipsis
    const minTitleWidth = DUtils.floor((DUtils.toNumber(getComputedStyle(cell).fontSize) || 14) * 1.6)
    const paddingLeftRight = getPaddingLeftRightSize(cell) + getPaddingLeftRightSize(queryCellElement(cell, ''))
    let mWidth = minTitleWidth + paddingLeftRight
        // 默认最小宽处理
    if (hasEllipsis) {
        const checkboxIconWidth = getPaddingLeftRightSize(queryCellElement(cell, '--title>.dui-cell--checkbox'))
        const requiredIconWidth = getElemenMarginWidth(queryCellElement(cell, '>.dui-cell--required-icon'))
        const editIconWidth = getElemenMarginWidth(queryCellElement(cell, '>.dui-cell--edit-icon'))
        const helpIconWidth = getElemenMarginWidth(queryCellElement(cell, '>.dui-cell-help-icon'))
        const sortIconWidth = getElemenMarginWidth(queryCellElement(cell, '>.dui-cell--sort'))
        const filterIconWidth = getElemenMarginWidth(queryCellElement(cell, '>.dui-cell--filter'))
        mWidth += checkboxIconWidth + requiredIconWidth + editIconWidth + helpIconWidth + filterIconWidth + sortIconWidth
    }
    // 如果设置最小宽
    if (colMinWidth) {
        const { tableBody } = $table.$refs
        const bodyElem = tableBody ? tableBody.$el : null
        if (bodyElem) {
            if (DomTools.isScale(colMinWidth)) {
                const bodyWidth = bodyElem.clientWidth - 1
                const meanWidth = bodyWidth / 100
                return Math.max(mWidth, Math.floor(DUtils.toInteger(colMinWidth) * meanWidth))
            } else if (DomTools.isPx(colMinWidth)) {
                return Math.max(mWidth, DUtils.toInteger(colMinWidth))
            }
        }
    }
    return mWidth
}

function countTreeExpand(prevRow, params) {
    let count = 1
    if (!prevRow) {
        return count
    }
    const { $table } = params
    const rowChildren = prevRow[$table.treeOpts.children]
    if ($table.isTreeExpandByRow(prevRow)) {
        for (let index = 0; index < rowChildren.length; index++) {
            count += countTreeExpand(rowChildren[index], params)
        }
    }
    return count
}

export function getOffsetSize($duitable) {
    return lineOffsetSizes[$duitable.vSize] || 0
}

export function calcTreeLine(params, items, rIndex) {
    const { $table } = params
    let expandSize = 1
    if (rIndex) {
        expandSize = countTreeExpand(items[rIndex - 1], params)
    }
    return $table.rowHeight * expandSize - (rIndex ? 1 : (12 - getOffsetSize($table)))
}

export function mergeBodyMethod(mergeList, _rowIndex, _columnIndex) {
    for (let mIndex = 0; mIndex < mergeList.length; mIndex++) {
        const { row: mergeRowIndex, col: mergeColIndex, rowspan: mergeRowspan, colspan: mergeColspan } = mergeList[mIndex]
        if (mergeColIndex > -1 && mergeRowIndex > -1 && mergeRowspan && mergeColspan) {
            if (mergeRowIndex === _rowIndex && mergeColIndex === _columnIndex) {
                return { rowspan: mergeRowspan, colspan: mergeColspan }
            }
            if (_rowIndex >= mergeRowIndex && _rowIndex < mergeRowIndex + mergeRowspan && _columnIndex >= mergeColIndex && _columnIndex < mergeColIndex + mergeColspan) {
                return { rowspan: 0, colspan: 0 }
            }
        }
    }
}

export function clearTableDefaultStatus(_vm) {
    _vm.initStatus = false
    _vm.clearSort()
    _vm.clearCurrentRow()
    _vm.clearCurrentColumn()
    _vm.clearRadioRow()
    _vm.clearRadioReserve()
    _vm.clearCheckboxRow()
    _vm.clearCheckboxReserve()
    _vm.clearRowExpand()
    _vm.clearTreeExpand()
    _vm.clearTreeExpandReserve()
    if (_vm.clearActived && VXETable._edit) {
        _vm.clearActived()
    }
    if (_vm.clearSelected && (_vm.keyboardConfig || _vm.mouseConfig)) {
        _vm.clearSelected()
    }
    if (_vm.clearCellAreas && _vm.mouseConfig) {
        _vm.clearCellAreas()
        _vm.clearCopyCellArea()
    }
    return _vm.clearScroll()
}

export function clearTableAllStatus(_vm) {
    if (_vm.clearFilter && VXETable._filter) {
        _vm.clearFilter()
    }
    return clearTableDefaultStatus(_vm)
}

export function isColumnInfo(column) {
    return column instanceof ColumnInfo
}

export function getColumnConfig($duitable, _vm, options) {
    return isColumnInfo(_vm) ? _vm : new ColumnInfo($duitable, _vm, options)
}

const getAllColumns = (columns, parentColumn) => {
    const result = []
    columns.forEach((column) => {
        column.parentId = parentColumn ? parentColumn.id : null
        if (column.visible) {
            if (column.children && column.children.length && column.children.some(column => column.visible)) {
                result.push(column)
                result.push(...getAllColumns(column.children, column))
            } else {
                result.push(column)
            }
        }
    })
    return result
}

export const convertToRows = (originColumns) => {
    let maxLevel = 1
    const traverse = (column, parent) => {
        if (parent) {
            column.level = parent.level + 1
            if (maxLevel < column.level) {
                maxLevel = column.level
            }
        }
        if (column.children && column.children.length && column.children.some(column => column.visible)) {
            let colSpan = 0
            column.children.forEach((subColumn) => {
                if (subColumn.visible) {
                    traverse(subColumn, column)
                    colSpan += subColumn.colSpan
                }
            })
            column.colSpan = colSpan
        } else {
            column.colSpan = 1
        }
    }

    originColumns.forEach((column) => {
        column.level = 1
        traverse(column)
    })

    const rows = []
    for (let i = 0; i < maxLevel; i++) {
        rows.push([])
    }

    const allColumns = getAllColumns(originColumns)

    allColumns.forEach((column) => {
        if (column.children && column.children.length && column.children.some(column => column.visible)) {
            column.rowSpan = 1
        } else {
            column.rowSpan = maxLevel - column.level + 1
        }
        rows[column.level - 1].push(column)
    })

    return rows
}