/* eslint-disable */
import { ColumnInfo } from './columnInfo'

/**
  * 获取一个全局唯一标识
  *
  * @param {String} prefix 前缀
  * @return {Number}
  */
var __uniqueId = 0
function uniqueId(prefix) {
  return [prefix, ++__uniqueId].join('')
}

function isFunction(func) {
  return typeof func === 'function'
}

function getFuncText(content) {
  return isFunction(content) ? content() : content
}

function isColumnInfo(column) {
  return column instanceof ColumnInfo
}

function getColumnConfig ($duitable, _vm, options) {
  return isColumnInfo(_vm) ? _vm : new ColumnInfo($duitable, _vm, options)
}
// 组装列配置
function assemColumn(_vm){
  const { $el, $duitable, $duicolumn, columnConfig } = _vm
  $duitable.staticColumns.splice([].indexOf.call($duitable.$refs.hideColumn.children, $el), 0, columnConfig)
}

// 获取所有的列，排除分组
function getColumnList (columns) {
  const result = []
  columns.forEach(column => {
    result.push(...(column.children && column.children.length ? getColumnList(column.children) : [column]))
  })
  return result
}

const convertToRows = (originColumns) => {
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

function getColMinWidth (params) {
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
    const checkboxIconWidth = getPaddingLeftRightSize(queryCellElement(cell, '--title>.vxe-cell--checkbox'))
    const requiredIconWidth = getElemenMarginWidth(queryCellElement(cell, '>.vxe-cell--required-icon'))
    const editIconWidth = getElemenMarginWidth(queryCellElement(cell, '>.vxe-cell--edit-icon'))
    const helpIconWidth = getElemenMarginWidth(queryCellElement(cell, '>.vxe-cell-help-icon'))
    const sortIconWidth = getElemenMarginWidth(queryCellElement(cell, '>.vxe-cell--sort'))
    const filterIconWidth = getElemenMarginWidth(queryCellElement(cell, '>.vxe-cell--filter'))
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

export {
  uniqueId,
  isFunction,
  getFuncText,
  getColumnConfig,
  assemColumn,
  getColumnList,
  convertToRows,
  getColMinWidth
}