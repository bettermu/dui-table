/* eslint-disable */

import DUtils from './tools/d-utils.umd.min'
import UtilTools from './tools/utils'
import DomTools from './tools/dom'
import { convertToRows, getColMinWidth } from './utils'

const cellType = 'header'

export default {
    name: 'DuiTableHeader',
    props: {
        tableData: Array,
        tableColumn: Array,
        tableGroupColumn: Array,
        fixedColumn: Array,
        size: String,
        fixedType: String
    },
    data() {
        return {
            headerColumn: []
        }
    },
    watch: {
        tableColumn() {
            this.uploadColumn()
        }
    },
    created() {
        this.uploadColumn()
    },

    mounted() {
        const { $parent: $duitable, $el, $refs, fixedType } = this
        const { elemStore } = $duitable
        const prefix = `${fixedType || 'main'}-header-`
        elemStore[`${prefix}wrapper`] = $el
        elemStore[`${prefix}table`] = $refs.table
        elemStore[`${prefix}colgroup`] = $refs.colgroup
        elemStore[`${prefix}list`] = $refs.thead
        elemStore[`${prefix}xSpace`] = $refs.xSpace
        elemStore[`${prefix}repair`] = $refs.repair
    },

    destroyed() {
        const { $parent: $duitable, fixedType } = this
        const { elemStore } = $duitable
        const prefix = `${fixedType || 'main'}-header-`
        elemStore[`${prefix}wrapper`] = null
        elemStore[`${prefix}table`] = null
        elemStore[`${prefix}colgroup`] = null
        elemStore[`${prefix}list`] = null
        elemStore[`${prefix}xSpace`] = null
        elemStore[`${prefix}repair`] = null
    },

    render(h) {
        const { _e, $parent: $duitable, fixedType, headerColumn, fixedColumn } = this
        const { $listeners: tableListeners, tId, isGroup, resizable, border, columnKey, headerRowClassName, headerCellClassName, headerRowStyle, headerCellStyle, showHeaderOverflow: allColumnHeaderOverflow, headerAlign: allHeaderAlign, align: allAlign, highlightCurrentColumn, currentColumn, scrollXLoad, overflowX, scrollbarWidth, sortOpts, mouseConfig, columnOpts } = $duitable
        let { tableColumn } = this
        let headerGroups = headerColumn
            // 如果是使用优化模式
        if (!isGroup) {
            if (fixedType) {
                if (scrollXLoad || allColumnHeaderOverflow) {
                    tableColumn = fixedColumn
                }
            }
            headerGroups = [tableColumn]
        }
        return h('div', {
            class: ["dui-table--header-wrapper", fixedType ? `fixed-${fixedType}--wrapper` : 'body--wrapper'],
            attrs: {
                xid: tId
            }
        }, [
            fixedType ? _e() : h('div', {
                class: 'dui-body--x-space',
                ref: 'xSpace'
            }),
            h('table', {
                class: "dui-table--header",
                attrs: {
                    xid: tId,
                    cellspacing: 0,
                    cellpadding: 0,
                    border: 0
                },
                ref: "table"

            }, [
                /**
                 * 列宽
                 */
                h('colgroup', {
                    ref: 'colgroup'
                }, tableColumn.map((column, $columnIndex) => {
                    return h('col', {
                        attrs: {
                            name: column.id
                        },
                        key: $columnIndex
                    })
                }).concat(scrollbarWidth ? [
                    h('col', {
                        attrs: {
                            name: 'col_gutter'
                        }
                    })
                ] : [])),

                /**
                 * 头部
                 */
                h('thead', {
                    ref: 'thead'
                }, headerGroups.map((cols, $rowIndex) => {
                    return h('tr', {
                        class: ['dui-header--row', headerRowClassName ? DUtils.isFunction(headerRowClassName) ? headerRowClassName({ $table: $duitable, $rowIndex, fixed: fixedType, type: cellType }) : headerRowClassName : ''],
                        style: headerRowStyle ? (DUtils.isFunction(headerRowStyle) ? headerRowStyle({ $table: $duitable, $rowIndex, fixed: fixedType, type: cellType }) : headerRowStyle) : null
                    }, cols.map((column, $columnIndex) => {
                        const { type, showHeaderOverflow, headerAlign, align, headerClassName } = column
                        // const { enabled } = tooltipOpts
                        const isColGroup = column.children && column.children.length
                        const fixedHiddenColumn = fixedType ? column.fixed !== fixedType && !isColGroup : column.fixed && overflowX
                        const headOverflow = DUtils.isUndefined(showHeaderOverflow) || DUtils.isNull(showHeaderOverflow) ? allColumnHeaderOverflow : showHeaderOverflow
                        const headAlign = headerAlign || align || allHeaderAlign || allAlign
                        let showEllipsis = headOverflow === 'ellipsis'
                        const showTitle = headOverflow === 'title'
                        const showTooltip = headOverflow === true || headOverflow === 'tooltip'
                        let hasEllipsis = showTitle || showTooltip || showEllipsis
                        const thOns = {}
                        const hasFilter = column.filters && column.filters.some(item => item.checked)
                        const columnIndex = $duitable.getColumnIndex(column)
                        const _columnIndex = $duitable.getVTColumnIndex(column)
                        const params = { $table: $duitable, $rowIndex, column, columnIndex, $columnIndex, _columnIndex, fixed: fixedType, type: cellType, isHidden: fixedHiddenColumn, hasFilter }
                            // 虚拟滚动不支持动态高度
                        if (scrollXLoad && !hasEllipsis) {
                            showEllipsis = hasEllipsis = true
                        }
                        if (columnOpts.isCurrent || highlightCurrentColumn || tableListeners['header-cell-click'] || sortOpts.trigger === 'cell') {
                            thOns.click = evnt => $duitable.triggerHeaderCellClickEvent(evnt, params)
                        }
                        if (tableListeners['header-cell-dblclick']) {
                            thOns.dblclick = evnt => $duitable.triggerHeaderCellDblclickEvent(evnt, params)
                        }
                        // 按下事件处理
                        if (mouseConfig) {
                            thOns.mousedown = evnt => $duitable.triggerHeaderCellMousedownEvent(evnt, params)
                        }
                        return h('th', {
                            class: ['dui-header--column', column.id, {
                                [`col--${headAlign}`]: headAlign,
                                [`col--${type}`]: type,
                                'col--last': $columnIndex === cols.length - 1,
                                'col--fixed': column.fixed,
                                'col--group': isColGroup,
                                'col--ellipsis': hasEllipsis,
                                'fixed--hidden': fixedHiddenColumn,
                                'is--sortable': column.sortable,
                                'col--filter': !!column.filters,
                                'is--filter-active': hasFilter,
                                'col--current': currentColumn === column
                            }, UtilTools.getClass(headerClassName, params), UtilTools.getClass(headerCellClassName, params)],
                            attrs: {
                                colid: column.id,
                                colspan: column.colSpan > 1 ? column.colSpan : null,
                                rowspan: column.rowSpan > 1 ? column.rowSpan : null
                            },
                            style: headerCellStyle ? (DUtils.isFunction(headerCellStyle) ? headerCellStyle(params) : headerCellStyle) : null,
                            on: thOns,
                            key: columnKey || columnOpts.useKey || isColGroup ? column.id : $columnIndex
                        }, [
                            h('div', {
                                class: ['dui-cell', {
                                    'c--title': showTitle,
                                    'c--tooltip': showTooltip,
                                    'c--ellipsis': showEllipsis
                                }]
                            }, column.renderHeader(h, params)),
                            /**
                             * 列宽拖动
                             */
                            !fixedHiddenColumn && !isColGroup && (DUtils.isBoolean(column.resizable) ? column.resizable : (columnOpts.resizable || resizable)) ? h('div', {
                                class: ['dui-resizable', {
                                    'is--line': !border || border === 'none'
                                }],
                                on: {
                                    mousedown: evnt => this.resizeMousedown(evnt, params)
                                }
                            }) : null
                        ])
                    }).concat(scrollbarWidth ? [
                        h('th', {
                            class: 'dui-header--gutter col--gutter'
                        })
                    ] : []))
                }))
            ]),
            /**
             * 其他
             */
            h('div', {
                class: 'dui-table--header-border-line',
                ref: 'repair'
            })
        ])
    },

    methods: {
        uploadColumn() {
            const { $parent: $duitable } = this
            this.headerColumn = $duitable.isGroup ? convertToRows(this.tableGroupColumn) : []
        },

        resizeMousedown(evnt, params) {
            const { column } = params
            const { $parent: $duitable, $el, fixedType } = this
            const { tableBody, leftContainer, rightContainer, resizeBar: resizeBarElem } = $duitable.$refs
            const { target: dragBtnElem, clientX: dragClientX } = evnt
            const cell = params.cell = dragBtnElem.parentNode
            let dragLeft = 0
            const tableBodyElem = tableBody.$el
            const pos = DomTools.getOffsetPos(dragBtnElem, $el)
            const dragBtnWidth = dragBtnElem.clientWidth
            const dragBtnOffsetWidth = Math.floor(dragBtnWidth / 2)
            const minInterval = getColMinWidth(params) - dragBtnOffsetWidth // 列之间的最小间距
            let dragMinLeft = pos.left - cell.clientWidth + dragBtnWidth + minInterval
            let dragPosLeft = pos.left + dragBtnOffsetWidth
            const domMousemove = document.onmousemove
            const domMouseup = document.onmouseup
            const isLeftFixed = fixedType === 'left'
            const isRightFixed = fixedType === 'right'

            // 计算左右侧固定列偏移量
            let fixedOffsetWidth = 0
            if (isLeftFixed || isRightFixed) {
                const siblingProp = isLeftFixed ? 'nextElementSibling' : 'previousElementSibling'
                let tempCellElem = cell[siblingProp]
                while (tempCellElem) {
                    if (DomTools.hasClass(tempCellElem, 'fixed--hidden')) {
                        break
                    } else if (!DomTools.hasClass(tempCellElem, 'col--group')) {
                        fixedOffsetWidth += tempCellElem.offsetWidth
                    }
                    tempCellElem = tempCellElem[siblingProp]
                }
                if (isRightFixed && rightContainer) {
                    dragPosLeft = rightContainer.offsetLeft + fixedOffsetWidth
                }
            }

            // 处理拖动事件
            const updateEvent = function(evnt) {
                evnt.stopPropagation()
                evnt.preventDefault()
                const offsetX = evnt.clientX - dragClientX
                let left = dragPosLeft + offsetX
                const scrollLeft = fixedType ? 0 : tableBodyElem.scrollLeft
                if (isLeftFixed) {
                    // 左固定列（不允许超过右侧固定列、不允许超过右边距）
                    left = Math.min(left, (rightContainer ? rightContainer.offsetLeft : tableBodyElem.clientWidth) - fixedOffsetWidth - minInterval)
                } else if (isRightFixed) {
                    // 右侧固定列（不允许超过左侧固定列、不允许超过左边距）
                    dragMinLeft = (leftContainer ? leftContainer.clientWidth : 0) + fixedOffsetWidth + minInterval
                    left = Math.min(left, dragPosLeft + cell.clientWidth - minInterval)
                } else {
                    dragMinLeft = Math.max(tableBodyElem.scrollLeft, dragMinLeft)
                        // left = Math.min(left, tableBodyElem.clientWidth + tableBodyElem.scrollLeft - 40)
                }
                dragLeft = Math.max(left, dragMinLeft)
                resizeBarElem.style.left = `${dragLeft - scrollLeft}px`
            }

            $duitable._isResize = true
            DomTools.addClass($duitable.$el, 'drag--resize')
            resizeBarElem.style.display = 'block'
            document.onmousemove = updateEvent
            document.onmouseup = function(evnt) {
                document.onmousemove = domMousemove
                document.onmouseup = domMouseup
                column.resizeWidth = column.renderWidth + (isRightFixed ? dragPosLeft - dragLeft : dragLeft - dragPosLeft)
                resizeBarElem.style.display = 'none'
                $duitable._isResize = false
                $duitable._lastResizeTime = Date.now()
                $duitable.analyColumnWidth()
                $duitable.recalculate(true).then(() => {
                    $duitable.saveCustomResizable()
                    $duitable.updateCellAreas()
                    $duitable.emitEvent('resizable-change', params, evnt)
                })
                DomTools.removeClass($duitable.$el, 'drag--resize')
            }
            updateEvent(evnt)
            $duitable.closeMenu()
        }
    },




}