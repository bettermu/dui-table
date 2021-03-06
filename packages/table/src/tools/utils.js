/* eslint-disable */
import DUtils from '../tools/d-utils.umd.min'
import GlobalConfig from '../v-x-e-table/src/conf'
import { warnLog, errLog } from './log'

let zindexIndex = 0
let lastZindex = 1

export function isEnableConf(conf) {
    return conf && conf.enabled !== false
}

/**
 * 判断值为：'' | null | undefined 时都属于空值
 */
export function eqEmptyValue(cellValue) {
    return cellValue === '' || DUtils.eqNull(cellValue)
}

export function getFuncText(content) {
    return DUtils.isFunction(content) ? content() : (GlobalConfig.translate ? GlobalConfig.translate(content) : content)
}

// 获取所有的列，排除分组
export function getColumnList(columns) {
    const result = []
    columns.forEach(column => {
        result.push(...(column.children && column.children.length ? getColumnList(column.children) : [column]))
    })
    return result
}

export const UtilTools = {
    nextZIndex() {
        lastZindex = GlobalConfig.zIndex + zindexIndex++
            return lastZindex
    },
    getLastZIndex() {
        return lastZindex
    },
    getColumnList,
    getClass(property, params) {
        return property ? DUtils.isFunction(property) ? property(params) : property : ''
    },
    formatText(value, placeholder) {
        return '' + (value === '' || value === null || value === undefined ? (placeholder ? GlobalConfig.emptyCell : '') : value)
    },
    getCellValue(row, column) {
        return DUtils.get(row, column.property)
    },
    setCellValue(row, column, value) {
        return DUtils.set(row, column.property, value)
    },
    // 组装列配置
    assemColumn(_vm) {
        const { $el, $duitable, $duicolumn, columnConfig } = _vm
        const groupConfig = $duicolumn ? $duicolumn.columnConfig : null
        columnConfig.slots = _vm.$scopedSlots
        if (groupConfig) {
            if (process.env.VUE_APP_VXE_TABLE_ENV === 'development') {
                if ($duicolumn.$options._componentTag === 'vxe-table-column') {
                    errLog('vxe.error.groupTag', [`<vxe-table-colgroup title=${$duicolumn.title} ...>`, `<vxe-table-column title=${$duicolumn.title} ...>`])
                } else if ($duicolumn.$options._componentTag === 'vxe-column') {
                    warnLog('vxe.error.groupTag', [`<vxe-colgroup title=${$duicolumn.title} ...>`, `<vxe-column title=${$duicolumn.title} ...>`])
                }
            }
            if (!groupConfig.children) {
                groupConfig.children = []
            }
            groupConfig.children.splice([].indexOf.call($duicolumn.$el.children, $el), 0, columnConfig)
        } else {
            $duitable.staticColumns.splice([].indexOf.call($duitable.$refs.hideColumn.children, $el), 0, columnConfig)
        }
    },
    // 销毁列
    destroyColumn(_vm) {
        const { $duitable, columnConfig } = _vm
        const matchObj = DUtils.findTree($duitable.staticColumns, column => column === columnConfig)
        if (matchObj) {
            matchObj.items.splice(matchObj.index, 1)
        }
    },
    hasChildrenList(item) {
        return item && item.children && item.children.length > 0
    },
    parseFile(file) {
        const name = file.name
        const tIndex = DUtils.lastIndexOf(name, '.')
        const type = name.substring(tIndex + 1, name.length)
        const filename = name.substring(0, tIndex)
        return { filename, type }
    },
    isNumVal(num) {
        return !isNaN(parseFloat('' + num))
    },
}



export default UtilTools