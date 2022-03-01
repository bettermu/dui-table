/* eslint-disable */
import VXETable from './v-x-e-table'
import GlobalConfig from './v-x-e-table/src/conf'
import DUtils from './tools/d-utils.umd.min'

import { getColumnList } from "./utils"

export default {
    //
    handleColumn(collectColumn) {
        this.collectColumn = collectColumn
        const tableFullColumn = getColumnList(collectColumn)
        this.tableFullColumn = tableFullColumn
        console.log(this.tableFullColumn)
    },

    // 加载表格数据
    loadTableData(datas) {
        let fullData = datas ? datas.slice(0) : []
            // 全量数据
        this.tableFullData = fullData

        this.handleTableData(true)

        return this.$nextTick()

    },

    handleTableData(force) {
        const { scrollYLoad, scrollYStore, fullDataRowIdData, afterFullData } = this
        let fullList = afterFullData

        // 是否进行数据处理
        if (force) {
            // 更新数据，处理筛选和排序
            this.updateAfterFullData()
                // 如果为虚拟树，将树结构拍平
                //fullList = this.handleVirtualTreeToList()
        }

        const tableData = scrollYLoad ? fullList.slice(scrollYStore.startIndex, scrollYStore.endIndex) : fullList.slice(0)

        tableData.forEach((row, $index) => {
            const rowid = getRowid(this, row)
            const rest = fullDataRowIdData[rowid]
            if (rest) {
                rest.$index = $index
            }
        })
        this.tableData = tableData
        console.log(this.tableData)

        //返回一个promise
        return this.$nextTick()
    },

    /**
     * 获取处理后全量的表格数据
     * 如果存在筛选条件，继续处理
     */

    updateAfterFullData() {
        const { tableFullColumn, tableFullData, filterOpts, sortOpts, treeConfig, treeOpts, tableFullTreeData } = this
        let tableData = []

        this.updateAfterDataIndex()
    },

    /**
     * 预编译
     * 对渲染中的数据提前解析序号及索引。牺牲提前编译耗时换取渲染中额外损耗，使运行时更加流畅
     */
    updateAfterDataIndex() {
        const { treeConfig, afterFullData, fullDataRowIdData, fullAllDataRowIdData, afterTreeFullData, treeOpts } = this

        if (treeConfig) {

        } else {
            afterFullData.forEach((row, index) => {
                const rowid = getRowid(this, row)
                const allrest = fullAllDataRowIdData[rowid]
                const seq = index + 1
                if (allrest) {
                    allrest.seq = seq
                    allrest._index = index
                } else {
                    const rest = { row, rowid, seq, index: -1, $index: -1, _index: index, items: [], parent: null, level: 0 }
                    fullAllDataRowIdData[rowid] = rest
                    fullDataRowIdData[rowid] = rest
                }
            })
        }
    },






    preventEvent(evnt, type, args, next, end) {
        const evntList = VXETable.interceptor.get(type)
        let rest
        if (!evntList.some(func => func(Object.assign({ $grid: this.$xegrid, $table: this, $event: evnt }, args)) === false)) {
            if (next) {
                rest = next()
            }
        }
        if (end) {
            end()
        }
        return rest
    },
}