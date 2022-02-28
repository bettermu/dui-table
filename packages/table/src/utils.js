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

export {
  uniqueId,
  isFunction,
  getFuncText,
  getColumnConfig,
  assemColumn
}