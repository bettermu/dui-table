

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
  return isColumnInfo(_vm) ? _vm : new ColumnInfo($xetable, _vm, options)
}

export {
  uniqueId,
  isFunction,
  getFuncText,
  getColumnConfig
}