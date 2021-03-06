/* eslint-disable */
import DUtils from './tools/d-utils.umd.min'
import GlobalConfig from './v-x-e-table/src/conf'
import VXEtable from './v-x-e-table'
import UtilTools, { isEnableConf } from './tools/utils'
import { getOffsetSize, calcTreeLine, mergeBodyMethod, removeScrollListener, restoreScrollListener, getRowid } from './utils'
import DomTools from './tools/dom'

const renderType = 'body'

// 滚动、拖动过程中不需要触发
function isOperateMouse($duitable) {
    return $duitable._isResize || ($duitable.lastScrollTime && Date.now() < $duitable.lastScrollTime + $duitable.delayHover)
}

function renderLine(h, _vm, $duitable, params) {
    const { row, column } = params
    const { treeOpts, treeConfig, fullAllDataRowIdData } = $duitable
    const { slots, treeNode } = column
    const rowid = getRowid($duitable, row)
    const rest = fullAllDataRowIdData[rowid]
    let rLevel = 0
    let rIndex = 0
    let items = []
    if (rest) {
        rLevel = rest.level
        rIndex = rest._index
        items = rest.items
    }
    if (slots && slots.line) {
        return $duitable.callSlot(slots.line, params, h)
    }
    if (treeConfig && treeNode && treeOpts.line) {
        return [
            h('div', {
                class: 'dui-tree--line-wrapper'
            }, [
                h('div', {
                    class: 'dui-tree--line',
                    style: {
                        height: `${calcTreeLine(params, items, rIndex)}px`,
                        left: `${(rLevel * treeOpts.indent) + (rLevel ? 2 - getOffsetSize($duitable) : 0) + 16}px`
                    }
                })
            ])
        ]
    }
    return []
}

/**
 * 渲染列
 */
function renderColumn(h, _vm, $duitable, seq, rowid, fixedType, rowLevel, row, rowIndex, $rowIndex, _rowIndex, column, $columnIndex, columns, items) {
    const {
        $listeners: tableListeners,
        afterFullData,
        tableData,
        height,
        columnKey,
        overflowX,
        sYOpts,
        scrollXLoad,
        scrollYLoad,
        highlightCurrentRow,
        showOverflow: allColumnOverflow,
        isAllOverflow,
        align: allAlign,
        currentColumn,
        cellClassName,
        cellStyle,
        mergeList,
        spanMethod,
        radioOpts,
        checkboxOpts,
        expandOpts,
        treeOpts,
        tooltipOpts,
        mouseConfig,
        editConfig,
        editOpts,
        editRules,
        validOpts,
        editStore,
        validStore,
        tooltipConfig,
        rowOpts,
        columnOpts
    } = $duitable
    const { type, cellRender, editRender, align, showOverflow, className, treeNode } = column
    const { actived } = editStore
    const { rHeight: scrollYRHeight } = sYOpts
    const { height: rowHeight } = rowOpts
    const showAllTip = tooltipOpts.showAll || tooltipOpts.enabled
    const columnIndex = $duitable.getColumnIndex(column)
    const _columnIndex = $duitable.getVTColumnIndex(column)
    const isEdit = isEnableConf(editRender)
    let fixedHiddenColumn = fixedType ? column.fixed !== fixedType : column.fixed && overflowX
    const cellOverflow = (DUtils.isUndefined(showOverflow) || DUtils.isNull(showOverflow)) ? allColumnOverflow : showOverflow
    let showEllipsis = cellOverflow === 'ellipsis'
    const showTitle = cellOverflow === 'title'
    const showTooltip = cellOverflow === true || cellOverflow === 'tooltip'
    let hasEllipsis = showTitle || showTooltip || showEllipsis
    let isDirty
    const tdOns = {}
    const cellAlign = align || allAlign
    const hasValidError = validStore.row === row && validStore.column === column
    const showValidTip = editRules && validOpts.showMessage && (validOpts.message === 'default' ? (height || tableData.length > 1) : validOpts.message === 'inline')
    const attrs = { colid: column.id }
    const bindMouseenter = tableListeners['cell-mouseenter']
    const bindMouseleave = tableListeners['cell-mouseleave']
    const triggerDblclick = (editRender && editConfig && editOpts.trigger === 'dblclick')
    const params = { $table: $duitable, seq, rowid, row, rowIndex, $rowIndex, _rowIndex, column, columnIndex, $columnIndex, _columnIndex, fixed: fixedType, type: renderType, isHidden: fixedHiddenColumn, level: rowLevel, visibleData: afterFullData, data: tableData, items }
        // 虚拟滚动不支持动态高度
    if ((scrollXLoad || scrollYLoad) && !hasEllipsis) {
        showEllipsis = hasEllipsis = true
    }
    // hover 进入事件
    if (showTitle || showTooltip || showAllTip || bindMouseenter || tooltipConfig) {
        tdOns.mouseenter = evnt => {
            if (isOperateMouse($duitable)) {
                return
            }
            if (showTitle) {
                DomTools.updateCellTitle(evnt.currentTarget, column)
            } else if (showTooltip || showAllTip) {
                // 如果配置了显示 tooltip
                $duitable.triggerBodyTooltipEvent(evnt, params)
            }
            if (bindMouseenter) {
                $duitable.emitEvent('cell-mouseenter', Object.assign({ cell: evnt.currentTarget }, params), evnt)
            }
        }
    }
    // hover 退出事件
    if (showTooltip || showAllTip || bindMouseleave || tooltipConfig) {
        tdOns.mouseleave = evnt => {
            if (isOperateMouse($duitable)) {
                return
            }
            if (showTooltip || showAllTip) {
                $duitable.handleTargetLeaveEvent(evnt)
            }
            if (bindMouseleave) {
                $duitable.emitEvent('cell-mouseleave', Object.assign({ cell: evnt.currentTarget }, params), evnt)
            }
        }
    }
    // 按下事件处理
    if (checkboxOpts.range || mouseConfig) {
        tdOns.mousedown = evnt => {
            $duitable.triggerCellMousedownEvent(evnt, params)
        }
    }
    // 点击事件处理
    if ((rowOpts.isCurrent || highlightCurrentRow) ||
        tableListeners['cell-click'] ||
        (editRender && editConfig) ||
        (expandOpts.trigger === 'row' || (expandOpts.trigger === 'cell')) ||
        (radioOpts.trigger === 'row' || (column.type === 'radio' && radioOpts.trigger === 'cell')) ||
        (checkboxOpts.trigger === 'row' || (column.type === 'checkbox' && checkboxOpts.trigger === 'cell')) ||
        (treeOpts.trigger === 'row' || (column.treeNode && treeOpts.trigger === 'cell'))) {
        tdOns.click = evnt => {
            $duitable.triggerCellClickEvent(evnt, params)
        }
    }
    // 双击事件处理
    if (triggerDblclick || tableListeners['cell-dblclick']) {
        tdOns.dblclick = evnt => {
            $duitable.triggerCellDblclickEvent(evnt, params)
        }
    }
    // 合并行或列
    if (mergeList.length) {
        const spanRest = mergeBodyMethod(mergeList, _rowIndex, _columnIndex)
        if (spanRest) {
            const { rowspan, colspan } = spanRest
            if (!rowspan || !colspan) {
                return null
            }
            if (rowspan > 1) {
                attrs.rowspan = rowspan
            }
            if (colspan > 1) {
                attrs.colspan = colspan
            }
        }
    } else if (spanMethod) {
        // 自定义合并行或列的方法
        const { rowspan = 1, colspan = 1 } = spanMethod(params) || {}
        if (!rowspan || !colspan) {
            return null
        }
        if (rowspan > 1) {
            attrs.rowspan = rowspan
        }
        if (colspan > 1) {
            attrs.colspan = colspan
        }
    }
    // 如果被合并不可隐藏
    if (fixedHiddenColumn && mergeList) {
        if (attrs.colspan > 1 || attrs.rowspan > 1) {
            fixedHiddenColumn = false
        }
    }
    // 如果编辑列开启显示状态
    if (!fixedHiddenColumn && editConfig && (editRender || cellRender) && (editOpts.showStatus || editOpts.showUpdateStatus)) {
        isDirty = $duitable.isUpdateByRow(row, column.property)
    }
    const tdVNs = []
    if (fixedHiddenColumn && (allColumnOverflow ? isAllOverflow : allColumnOverflow)) {
        tdVNs.push(
            h('div', {
                class: ['dui-cell', {
                    'c--title': showTitle,
                    'c--tooltip': showTooltip,
                    'c--ellipsis': showEllipsis
                }],
                style: {
                    maxHeight: hasEllipsis && (scrollYRHeight || rowHeight) ? `${scrollYRHeight || rowHeight}px` : ''
                }
            })
        )
    } else {
        // 渲染单元格
        tdVNs.push(
            ...renderLine(h, _vm, $duitable, params),
            h('div', {
                class: ['dui-cell', {
                    'c--title': showTitle,
                    'c--tooltip': showTooltip,
                    'c--ellipsis': showEllipsis
                }],
                style: {
                    maxHeight: hasEllipsis && (scrollYRHeight || rowHeight) ? `${scrollYRHeight || rowHeight}px` : ''
                },
                attrs: {
                    title: showTitle ? $duitable.getCellLabel(row, column) : null
                }
            }, column.renderCell(h, params))
        )
        if (showValidTip && hasValidError) {
            tdVNs.push(
                h('div', {
                    class: 'dui-cell--valid',
                    style: validStore.rule && validStore.rule.maxWidth ? {
                        width: `${validStore.rule.maxWidth}px`
                    } : null
                }, [
                    h('span', {
                        class: 'dui-cell--valid-msg'
                    }, validStore.content)
                ])
            )
        }
    }
    return h('td', {
        class: ['dui-body--column', column.id, {
            [`col--${cellAlign}`]: cellAlign,
            [`col--${type}`]: type,
            'col--last': $columnIndex === columns.length - 1,
            'col--tree-node': treeNode,
            'col--edit': isEdit,
            'col--ellipsis': hasEllipsis,
            'fixed--hidden': fixedHiddenColumn,
            'col--dirty': isDirty,
            'col--actived': editConfig && isEdit && (actived.row === row && (actived.column === column || editOpts.mode === 'row')),
            'col--valid-error': hasValidError,
            'col--current': currentColumn === column
        }, UtilTools.getClass(className, params), UtilTools.getClass(cellClassName, params)],
        key: columnKey || columnOpts.useKey ? column.id : $columnIndex,
        attrs,
        style: Object.assign({
            height: hasEllipsis && (scrollYRHeight || rowHeight) ? `${scrollYRHeight || rowHeight}px` : ''
        }, cellStyle ? (DUtils.isFunction(cellStyle) ? cellStyle(params) : cellStyle) : null),
        on: tdOns
    }, tdVNs)
}

function renderRows(h, _vm, $duitable, fixedType, tableData, tableColumn) {
    const {
        stripe,
        rowKey,
        highlightHoverRow,
        rowClassName,
        rowStyle,
        editConfig,
        showOverflow: allColumnOverflow,
        treeConfig,
        treeOpts,
        editOpts,
        treeExpandeds,
        scrollYLoad,
        editStore,
        rowExpandeds,
        radioOpts,
        checkboxOpts,
        expandColumn,
        hasFixedColumn,
        fullAllDataRowIdData,
        rowOpts
    } = $duitable
    const rows = []
    tableData.forEach((row, $rowIndex) => {
        const trOn = {}
        let rowIndex = $rowIndex
        const _rowIndex = $duitable.getVTRowIndex(row)
            // 确保任何情况下 rowIndex 都精准指向真实 data 索引
        rowIndex = $duitable.getRowIndex(row)
            // 事件绑定
        if (rowOpts.isHover || highlightHoverRow) {
            trOn.mouseenter = evnt => {
                if (isOperateMouse($duitable)) {
                    return
                }
                $duitable.triggerHoverEvent(evnt, { row, rowIndex })
            }
            trOn.mouseleave = () => {
                if (isOperateMouse($duitable)) {
                    return
                }
                $duitable.clearHoverRow()
            }
        }
        const rowid = getRowid($duitable, row)
        const rest = fullAllDataRowIdData[rowid]
        const rowLevel = rest ? rest.level : 0
        const seq = rest ? rest.seq : -1
        const params = { $table: $duitable, seq, rowid, fixed: fixedType, type: renderType, level: rowLevel, row, rowIndex, $rowIndex }
        let isNewRow = false
        if (editConfig) {
            isNewRow = editStore.insertList.indexOf(row) > -1
        }
        rows.push(
                h('tr', {
                    class: ['dui-body--row', {
                        'row--stripe': stripe && ($duitable.getVTRowIndex(row) + 1) % 2 === 0,
                        'is--new': isNewRow,
                        'row--new': isNewRow && (editOpts.showStatus || editOpts.showInsertStatus),
                        'row--radio': radioOpts.highlight && $duitable.selectRow === row,
                        'row--checked': checkboxOpts.highlight && $duitable.isCheckedByCheckboxRow(row)
                    }, rowClassName ? (DUtils.isFunction(rowClassName) ? rowClassName(params) : rowClassName) : ''],
                    attrs: {
                        rowid: rowid
                    },
                    style: rowStyle ? (DUtils.isFunction(rowStyle) ? rowStyle(params) : rowStyle) : null,
                    key: (rowKey || rowOpts.useKey) || treeConfig ? rowid : $rowIndex,
                    on: trOn
                }, tableColumn.map((column, $columnIndex) => {
                    return renderColumn(h, _vm, $duitable, seq, rowid, fixedType, rowLevel, row, rowIndex, $rowIndex, _rowIndex, column, $columnIndex, tableColumn, tableData)
                }))
            )
            // 如果行被展开了
        if (expandColumn && rowExpandeds.length && rowExpandeds.indexOf(row) > -1) {
            let cellStyle
            if (treeConfig) {
                cellStyle = {
                    paddingLeft: `${(rowLevel * treeOpts.indent) + 30}px`
                }
            }
            const { showOverflow } = expandColumn
            const hasEllipsis = (DUtils.isUndefined(showOverflow) || DUtils.isNull(showOverflow)) ? allColumnOverflow : showOverflow
            const expandParams = { $table: $duitable, seq, column: expandColumn, fixed: fixedType, type: renderType, level: rowLevel, row, rowIndex, $rowIndex }
            rows.push(
                h('tr', {
                    class: 'dui-body--expanded-row',
                    key: `expand_${rowid}`,
                    style: rowStyle ? (DUtils.isFunction(rowStyle) ? rowStyle(expandParams) : rowStyle) : null,
                    on: trOn
                }, [
                    h('td', {
                        class: ['dui-body--expanded-column', {
                            'fixed--hidden': fixedType && !hasFixedColumn,
                            'col--ellipsis': hasEllipsis
                        }],
                        attrs: {
                            colspan: tableColumn.length
                        }
                    }, [
                        h('div', {
                            class: 'dui-body--expanded-cell',
                            style: cellStyle
                        }, [
                            expandColumn.renderData(h, expandParams)
                        ])
                    ])
                ])
            )
        }
        // 如果是树形表格
        if (treeConfig && !scrollYLoad && !treeOpts.transform && treeExpandeds.length) {
            const rowChildren = row[treeOpts.children]
            if (rowChildren && rowChildren.length && treeExpandeds.indexOf(row) > -1) {
                rows.push(...renderRows(h, _vm, $duitable, fixedType, rowChildren, tableColumn))
            }
        }
    })
    return rows
}

/**
 * 同步滚动条
 */
let scrollProcessTimeout

function syncBodyScroll(_vm, fixedType, scrollTop, elem1, elem2) {
    if (elem1 || elem2) {
        if (elem1) {
            removeScrollListener(elem1)
            elem1.scrollTop = scrollTop
        }
        if (elem2) {
            removeScrollListener(elem2)
            elem2.scrollTop = scrollTop
        }
        clearTimeout(scrollProcessTimeout)
        scrollProcessTimeout = setTimeout(() => {
            // const { tableBody, leftBody, rightBody } = _vm.$refs
            // const bodyElem = tableBody.$el
            // const leftElem = leftBody ? leftBody.$el : null
            // const rightElem = rightBody ? rightBody.$el : null
            restoreScrollListener(elem1)
            restoreScrollListener(elem2)
                // 检查滚动条是的同步
                // let targetTop = bodyElem.scrollTop
                // if (fixedType === 'left') {
                //   if (leftElem) {
                //     targetTop = leftElem.scrollTop
                //   }
                // } else if (fixedType === 'right') {
                //   if (rightElem) {
                //     targetTop = rightElem.scrollTop
                //   }
                // }
                // setScrollTop(bodyElem, targetTop)
                // setScrollTop(leftElem, targetTop)
                // setScrollTop(rightElem, targetTop)
        }, 300)
    }
}


export default {
    name: 'DuiTableBody',

    props: {
        tableData: Array,
        tableColumn: Array,
        fixedColumn: Array,
        size: String,
        fixedType: String
    },

    data() {
        return {
            wheelTime: null,
            wheelYSize: 0,
            wheelYInterval: 0,
            wheelYTotal: 0
        }
    },

    mounted() {
        const { $parent: $duitable, $el, $refs, fixedType } = this
        const { elemStore } = $duitable
        const prefix = `${fixedType || 'main'}-body-`
        elemStore[`${prefix}wrapper`] = $el
        elemStore[`${prefix}table`] = $refs.table
        elemStore[`${prefix}colgroup`] = $refs.colgroup
        elemStore[`${prefix}list`] = $refs.tbody
        elemStore[`${prefix}xSpace`] = $refs.xSpace
        elemStore[`${prefix}ySpace`] = $refs.ySpace
        elemStore[`${prefix}emptyBlock`] = $refs.emptyBlock
        this.$el.onscroll = this.scrollEvent
        this.$el._onscroll = this.scrollEvent
    },

    beforeDestroy() {
        clearTimeout(this.wheelTime)
        this.$el._onscroll = null
        this.$el.onscroll = null
    },
    destroyed() {
        const { $parent: $duitable, fixedType } = this
        const { elemStore } = $duitable
        const prefix = `${fixedType || 'main'}-body-`
        elemStore[`${prefix}wrapper`] = null
        elemStore[`${prefix}table`] = null
        elemStore[`${prefix}colgroup`] = null
        elemStore[`${prefix}list`] = null
        elemStore[`${prefix}xSpace`] = null
        elemStore[`${prefix}ySpace`] = null
        elemStore[`${prefix}emptyBlock`] = null
    },

    render(h) {
        const { _e, $parent: $duitable, fixedColumn, fixedType } = this
        let { $scopedSlots, tId, tableData, tableColumn, visibleColumn, showOverflow: allColumnOverflow, keyboardConfig, keyboardOpts, mergeList, spanMethod, scrollXLoad, scrollYLoad, isAllOverflow, emptyOpts, mouseConfig, mouseOpts, sYOpts } = $duitable
        // 如果是使用优化模式
        if (fixedType) {
            if (scrollXLoad || scrollYLoad || (allColumnOverflow ? isAllOverflow : allColumnOverflow)) {
                if (!mergeList.length && !spanMethod && !(keyboardConfig && keyboardOpts.isMerge)) {
                    tableColumn = fixedColumn
                } else {
                    tableColumn = visibleColumn
                        // 检查固定列是否被合并，合并范围是否超出固定列
                        // if (mergeList.length && !isMergeLeftFixedExceeded && fixedType === 'left') {
                        //   tableColumn = fixedColumn
                        // } else if (mergeList.length && !isMergeRightFixedExceeded && fixedType === 'right') {
                        //   tableColumn = fixedColumn
                        // } else {
                        //   tableColumn = visibleColumn
                        // }
                }
            } else {
                tableColumn = visibleColumn
            }
        }
        let emptyContent
        if ($scopedSlots.empty) {
            emptyContent = $scopedSlots.empty.call(this, { $table: $duitable }, h)
        } else {
            const compConf = emptyOpts.name ? VXETable.renderer.get(emptyOpts.name) : null
            const renderEmpty = compConf ? compConf.renderEmpty : null
            if (renderEmpty) {
                emptyContent = renderEmpty.call(this, h, emptyOpts, { $table: $duitable })
            } else {
                emptyContent = $duitable.emptyText || GlobalConfig.i18n('vxe.table.emptyText')
            }
        }
        return h('div', {
            class: ['dui-table--body-wrapper', fixedType ? `fixed-${fixedType}--wrapper` : 'body--wrapper'],
            attrs: {
                xid: tId
            },
            on: scrollYLoad && sYOpts.mode === 'wheel' ? {
                wheel: this.wheelEvent
            } : {}
        }, [
            fixedType ? _e() : h('div', {
                class: 'dui-body--x-space',
                ref: 'xSpace'
            }),
            h('div', {
                class: 'dui-body--y-space',
                ref: 'ySpace'
            }),
            h('table', {
                class: 'dui-table--body',
                attrs: {
                    xid: tId,
                    cellspacing: 0,
                    cellpadding: 0,
                    border: 0
                },
                ref: 'table'
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
                })),
                /**
                 * 内容
                 */
                h('tbody', {
                    ref: 'tbody'
                }, renderRows(h, this, $duitable, fixedType, tableData, tableColumn))
            ]),
            h('div', {
                class: 'dui-table--checkbox-range'
            }),
            mouseConfig && mouseOpts.area ? h('div', {
                class: 'dui-table--cell-area'
            }, [
                h('span', {
                    class: 'dui-table--cell-main-area'
                }, mouseOpts.extension ? [
                    h('span', {
                        class: 'dui-table--cell-main-area-btn',
                        on: {
                            mousedown(evnt) {
                                $duitable.triggerCellExtendMousedownEvent(evnt, { $table: $duitable, fixed: fixedType, type: renderType })
                            }
                        }
                    })
                ] : null),
                h('span', {
                    class: 'dui-table--cell-copy-area'
                }),
                h('span', {
                    class: 'dui-table--cell-extend-area'
                }),
                h('span', {
                    class: 'dui-table--cell-multi-area'
                }),
                h('span', {
                    class: 'dui-table--cell-active-area'
                })
            ]) : null, !fixedType ? h('div', {
                class: 'dui-table--empty-block',
                ref: 'emptyBlock'
            }, [
                h('div', {
                    class: 'dui-table--empty-content'
                }, emptyContent)
            ]) : null
        ])
    },

    methods: {
        /**
         * 滚动处理
         * 如果存在列固定左侧，同步更新滚动状态
         * 如果存在列固定右侧，同步更新滚动状态
         */
        scrollEvent(evnt) {
            const { $el: scrollBodyElem, $parent: $duitable, fixedType } = this
            const { $refs, elemStore, highlightHoverRow, scrollXLoad, scrollYLoad, lastScrollTop, lastScrollLeft, rowOpts } = $duitable
            const { tableHeader, tableBody, leftBody, rightBody, tableFooter, validTip } = $refs
            const headerElem = tableHeader ? tableHeader.$el : null
            const footerElem = tableFooter ? tableFooter.$el : null
            const bodyElem = tableBody.$el
            const leftElem = leftBody ? leftBody.$el : null
            const rightElem = rightBody ? rightBody.$el : null
            const bodyYElem = elemStore['main-body-ySpace']
            const bodyXElem = elemStore['main-body-xSpace']
            const bodyHeight = scrollYLoad && bodyYElem ? bodyYElem.clientHeight : bodyElem.clientHeight
            const bodyWidth = scrollXLoad && bodyXElem ? bodyXElem.clientWidth : bodyElem.clientWidth
            let scrollTop = scrollBodyElem.scrollTop
            const scrollLeft = bodyElem.scrollLeft
            const isRollX = scrollLeft !== lastScrollLeft
            const isRollY = scrollTop !== lastScrollTop
            $duitable.lastScrollTop = scrollTop
            $duitable.lastScrollLeft = scrollLeft
            $duitable.lastScrollTime = Date.now()
            if (rowOpts.isHover || highlightHoverRow) {
                $duitable.clearHoverRow()
            }
            if (leftElem && fixedType === 'left') {
                scrollTop = leftElem.scrollTop
                syncBodyScroll($duitable, fixedType, scrollTop, bodyElem, rightElem)
            } else if (rightElem && fixedType === 'right') {
                scrollTop = rightElem.scrollTop
                syncBodyScroll($duitable, fixedType, scrollTop, bodyElem, leftElem)
            } else {
                if (isRollX) {
                    if (headerElem) {
                        headerElem.scrollLeft = bodyElem.scrollLeft
                    }
                    if (footerElem) {
                        footerElem.scrollLeft = bodyElem.scrollLeft
                    }
                }
                if (leftElem || rightElem) {
                    $duitable.checkScrolling()
                    if (isRollY) {
                        syncBodyScroll($duitable, fixedType, scrollTop, leftElem, rightElem)
                    }
                }
            }
            if (scrollXLoad && isRollX) {
                $duitable.triggerScrollXEvent(evnt)
            }
            if (scrollYLoad && isRollY) {
                $duitable.triggerScrollYEvent(evnt)
            }
            if (isRollX && validTip && validTip.visible) {
                validTip.updatePlacement()
            }
            $duitable.emitEvent('scroll', {
                type: renderType,
                fixed: fixedType,
                scrollTop,
                scrollLeft,
                scrollHeight: bodyElem.scrollHeight,
                scrollWidth: bodyElem.scrollWidth,
                bodyHeight,
                bodyWidth,
                isX: isRollX,
                isY: isRollY
            }, evnt)
        },
        handleWheel(evnt, isTopWheel, deltaTop, isRollX, isRollY) {
            const { $parent: $duitable } = this
            const { $refs, elemStore, scrollYLoad, scrollXLoad } = $duitable
            const { tableBody, leftBody, rightBody } = $refs
            const bodyElem = tableBody.$el
            const leftElem = leftBody ? leftBody.$el : null
            const rightElem = rightBody ? rightBody.$el : null
            const remainSize = this.isPrevWheelTop === isTopWheel ? Math.max(0, this.wheelYSize - this.wheelYTotal) : 0
            const bodyYElem = elemStore['main-body-ySpace']
            const bodyXElem = elemStore['main-body-xSpace']
            const bodyHeight = scrollYLoad && bodyYElem ? bodyYElem.clientHeight : bodyElem.clientHeight
            const bodyWidth = scrollXLoad && bodyXElem ? bodyXElem.clientWidth : bodyElem.clientWidth
            this.isPrevWheelTop = isTopWheel
            this.wheelYSize = Math.abs(isTopWheel ? deltaTop - remainSize : deltaTop + remainSize)
            this.wheelYInterval = 0
            this.wheelYTotal = 0
            clearTimeout(this.wheelTime)
            const handleSmooth = () => {
                let { fixedType, wheelYTotal, wheelYSize, wheelYInterval } = this
                if (wheelYTotal < wheelYSize) {
                    wheelYInterval = Math.max(5, Math.floor(wheelYInterval * 1.5))
                    wheelYTotal = wheelYTotal + wheelYInterval
                    if (wheelYTotal > wheelYSize) {
                        wheelYInterval = wheelYInterval - (wheelYTotal - wheelYSize)
                    }
                    const { scrollTop, clientHeight, scrollHeight } = bodyElem
                    const targetTop = scrollTop + (wheelYInterval * (isTopWheel ? -1 : 1))
                    bodyElem.scrollTop = targetTop
                    if (leftElem) {
                        leftElem.scrollTop = targetTop
                    }
                    if (rightElem) {
                        rightElem.scrollTop = targetTop
                    }
                    if (isTopWheel ? targetTop < scrollHeight - clientHeight : targetTop >= 0) {
                        this.wheelTime = setTimeout(handleSmooth, 10)
                    }
                    this.wheelYTotal = wheelYTotal
                    this.wheelYInterval = wheelYInterval
                    $duitable.emitEvent('scroll', {
                        type: renderType,
                        fixed: fixedType,
                        scrollTop: bodyElem.scrollTop,
                        scrollLeft: bodyElem.scrollLeft,
                        scrollHeight: bodyElem.scrollHeight,
                        scrollWidth: bodyElem.scrollWidth,
                        bodyHeight,
                        bodyWidth,
                        isX: isRollX,
                        isY: isRollY
                    }, evnt)
                }
            }
            handleSmooth()
        },
        /**
         * 滚轮处理
         */
        wheelEvent(evnt) {
            const { deltaY, deltaX } = evnt
            const { $el: scrollBodyElem, $parent: $duitable } = this
            const { $refs, highlightHoverRow, scrollYLoad, lastScrollTop, lastScrollLeft, rowOpts } = $duitable
            const { tableBody } = $refs
            const bodyElem = tableBody.$el

            const deltaTop = deltaY
            const deltaLeft = deltaX
            const isTopWheel = deltaTop < 0
                // 如果滚动位置已经是顶部或底部，则不需要触发
            if (isTopWheel ? scrollBodyElem.scrollTop <= 0 : scrollBodyElem.scrollTop >= scrollBodyElem.scrollHeight - scrollBodyElem.clientHeight) {
                return
            }

            const scrollTop = scrollBodyElem.scrollTop + deltaTop
            const scrollLeft = bodyElem.scrollLeft + deltaLeft
            const isRollX = scrollLeft !== lastScrollLeft
            const isRollY = scrollTop !== lastScrollTop

            // 用于鼠标纵向滚轮处理
            if (isRollY) {
                evnt.preventDefault()
                $duitable.lastScrollTop = scrollTop
                $duitable.lastScrollLeft = scrollLeft
                $duitable.lastScrollTime = Date.now()
                if (rowOpts.isHover || highlightHoverRow) {
                    $duitable.clearHoverRow()
                }
                this.handleWheel(evnt, isTopWheel, deltaTop, isRollX, isRollY)
                if (scrollYLoad) {
                    $duitable.triggerScrollYEvent(evnt)
                }
            }
        }
    }

}