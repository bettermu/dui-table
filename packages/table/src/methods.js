/* eslint-disable */
import VXETable from './v-x-e-table'
import GlobalConfig from './v-x-e-table/src/conf'
import DUtils from './tools/d-utils.umd.min'
import UtilTools, { eqEmptyValue, isEnableConf, getFuncText } from './tools/utils'
import DomTools, { browse, getPaddingTopBottomSize, setScrollTop, setScrollLeft } from './tools/dom'
import { warnLog, errLog } from './tools/log'
const { setCellValue, hasChildrenList, getColumnList } = UtilTools
const { calcHeight, hasClass, addClass, removeClass, getEventTargetNode, isNodeElement } = DomTools


export default {
  //
  handleColumn(collectColumn) {
    this.collectColumn = collectColumn
    const tableFullColumn = getColumnList(collectColumn)
    this.tableFullColumn = tableFullColumn
    this.cacheColumnMap()
    this.restoreCustomStorage()
    this.parseColumns().then(() => {
      if (this.scrollXLoad) {
        this.loadScrollXData(true)
      }
    })
    this.clearMergeCells()
    this.clearMergeFooterItems()
    this.handleTableData(true)
    if (process.env.VUE_APP_VXE_TABLE_ENV === 'development') {
      if ((this.scrollXLoad || this.scrollYLoad) && this.expandColumn) {
        warnLog('vxe.error.scrollErrProp', ['column.type=expand'])
      }
    }
    return this.$nextTick().then(() => {
      if (this.$toolbar) {
        this.$toolbar.syncUpdate({ collectColumn, $table: this })
      }
      return this.recalculate()
    })
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

  /**
 * 获取父容器元素
 */
  getParentElem() {
    const { $el, $xegrid } = this
    return $xegrid ? $xegrid.$el.parentNode : $el.parentNode
  },
  /**
   * 获取父容器的高度
   */
  getParentHeight() {
    const { $el, $xegrid, height } = this
    const parentElem = $el.parentNode
    const parentPaddingSize = height === 'auto' ? getPaddingTopBottomSize(parentElem) : 0
    return Math.floor($xegrid ? $xegrid.getParentHeight() : DUtils.toNumber(getComputedStyle(parentElem).height) - parentPaddingSize)
  },

  /**
   * 处理数据加载默认行为
   * 默认执行一次，除非被重置
   */
  handleLoadDefaults() {
    if (this.checkboxConfig) {
      this.handleDefaultSelectionChecked()
    }
    if (this.radioConfig) {
      this.handleDefaultRadioChecked()
    }
    if (this.expandConfig) {
      this.handleDefaultRowExpand()
    }
    if (this.treeConfig) {
      this.handleDefaultTreeExpand()
    }
    if (this.mergeCells) {
      this.handleDefaultMergeCells()
    }
    if (this.mergeFooterItems) {
      this.handleDefaultMergeFooterItems()
    }
    this.$nextTick(() => setTimeout(this.recalculate))
  },
  /**
   * 处理初始化的默认行为
   * 只会执行一次
   */
  handleInitDefaults() {
    const { sortConfig } = this
    if (sortConfig) {
      this.handleDefaultSort()
    }
  },

  /**
   * 处理默认勾选
   */
  handleDefaultSelectionChecked() {
    const { fullDataRowIdData, checkboxOpts } = this
    const { checkAll, checkRowKeys } = checkboxOpts
    if (checkAll) {
      this.setAllCheckboxRow(true)
    } else if (checkRowKeys) {
      const defSelection = []
      checkRowKeys.forEach(rowid => {
        if (fullDataRowIdData[rowid]) {
          defSelection.push(fullDataRowIdData[rowid].row)
        }
      })
      this.setCheckboxRow(defSelection, true)
    }
  },

  /**
   * 处理单选框默认勾选
   */
  handleDefaultRadioChecked() {
    const { radioOpts, fullDataRowIdData } = this
    const { checkRowKey: rowid, reserve } = radioOpts
    if (rowid) {
      if (fullDataRowIdData[rowid]) {
        this.setRadioRow(fullDataRowIdData[rowid].row)
      }
      if (reserve) {
        const rowkey = getRowkey(this)
        this.radioReserveRow = { [rowkey]: rowid }
      }
    }
  },

  /**
   * 处理默认展开行
   */
  handleDefaultRowExpand() {
    const { expandOpts, fullDataRowIdData } = this
    const { expandAll, expandRowKeys } = expandOpts
    if (expandAll) {
      this.setAllRowExpand(true)
    } else if (expandRowKeys) {
      const defExpandeds = []
      expandRowKeys.forEach(rowid => {
        if (fullDataRowIdData[rowid]) {
          defExpandeds.push(fullDataRowIdData[rowid].row)
        }
      })
      this.setRowExpand(defExpandeds, true)
    }
  },

  /**
   * 处理默认展开树节点
   */
  handleDefaultTreeExpand() {
    const { treeConfig, treeOpts, tableFullData } = this
    if (treeConfig) {
      const { expandAll, expandRowKeys } = treeOpts
      if (expandAll) {
        this.setAllTreeExpand(true)
      } else if (expandRowKeys) {
        const defExpandeds = []
        const rowkey = getRowkey(this)
        expandRowKeys.forEach(rowid => {
          const matchObj = DUtils.findTree(tableFullData, item => rowid === DUtils.get(item, rowkey), treeOpts)
          if (matchObj) {
            defExpandeds.push(matchObj.item)
          }
        })
        this.setTreeExpand(defExpandeds, true)
      }
    }
  },

  /**
   * 更新列状态
   * 如果组件值 v-model 发生 change 时，调用改函数用于更新某一列编辑状态
   * 如果单元格配置了校验规则，则会进行校验
   */
  updateStatus(scope, cellValue) {
    const customVal = !DUtils.isUndefined(cellValue)
    return this.$nextTick().then(() => {
      const { $refs, editRules, validStore } = this
      if (scope && $refs.tableBody && editRules) {
        const { row, column } = scope
        const type = 'change'
        if (this.hasCellRules(type, row, column)) {
          const cell = this.getCell(row, column)
          if (cell) {
            return this.validCellRules(type, row, column, cellValue)
              .then(() => {
                if (customVal && validStore.visible) {
                  setCellValue(row, column, cellValue)
                }
                this.clearValidate()
              })
              .catch(({ rule }) => {
                if (customVal) {
                  setCellValue(row, column, cellValue)
                }
                this.showValidTooltip({ rule, row, column, cell })
              })
          }
        }
      }
    })
  },
  handleDefaultMergeCells() {
    this.setMergeCells(this.mergeCells)
  },
  /**
   * 获取所有被合并的单元格
   */
  getMergeCells() {
    return this.mergeList.slice(0)
  },
  /**
   * 清除所有单元格合并
   */
  clearMergeCells() {
    this.mergeList = []
    return this.$nextTick()
  },
  handleDefaultMergeFooterItems() {
    this.setMergeFooterItems(this.mergeFooterItems)
  },

  /**
   * 计算单元格列宽，动态分配可用剩余空间
   * 支持 width=? width=?px width=?% min-width=? min-width=?px min-width=?%
   */
  recalculate(refull) {
    const { $refs } = this
    const { tableBody, tableHeader, tableFooter } = $refs
    const bodyElem = tableBody ? tableBody.$el : null
    const headerElem = tableHeader ? tableHeader.$el : null
    const footerElem = tableFooter ? tableFooter.$el : null
    if (bodyElem) {
      this.autoCellWidth(headerElem, bodyElem, footerElem)
      if (refull === true) {
        // 初始化时需要在列计算之后再执行优化运算，达到最优显示效果
        return this.computeScrollLoad().then(() => {
          this.autoCellWidth(headerElem, bodyElem, footerElem)
          return this.computeScrollLoad()
        })
      }
    }
    return this.computeScrollLoad()
  },

  /**
   * 列宽算法
   * 支持 px、%、固定 混合分配
   * 支持动态列表调整分配
   * 支持自动分配偏移量
   * @param {Element} headerElem
   * @param {Element} bodyElem
   * @param {Element} footerElem
   * @param {Number} bodyWidth
   */
  autoCellWidth(headerElem, bodyElem, footerElem) {
    let tableWidth = 0
    const minCellWidth = 40 // 列宽最少限制 40px
    const bodyWidth = bodyElem.clientWidth - 1
    let remainWidth = bodyWidth
    let meanWidth = remainWidth / 100
    const { fit, columnStore } = this
    const { resizeList, pxMinList, pxList, scaleList, scaleMinList, autoList } = columnStore
    // 最小宽
    pxMinList.forEach(column => {
      const minWidth = parseInt(column.minWidth)
      tableWidth += minWidth
      column.renderWidth = minWidth
    })
    // 最小百分比
    scaleMinList.forEach(column => {
      const scaleWidth = Math.floor(parseInt(column.minWidth) * meanWidth)
      tableWidth += scaleWidth
      column.renderWidth = scaleWidth
    })
    // 固定百分比
    scaleList.forEach(column => {
      const scaleWidth = Math.floor(parseInt(column.width) * meanWidth)
      tableWidth += scaleWidth
      column.renderWidth = scaleWidth
    })
    // 固定宽
    pxList.forEach(column => {
      const width = parseInt(column.width)
      tableWidth += width
      column.renderWidth = width
    })
    // 调整了列宽
    resizeList.forEach(column => {
      const width = parseInt(column.resizeWidth)
      tableWidth += width
      column.renderWidth = width
    })
    remainWidth -= tableWidth
    meanWidth = remainWidth > 0 ? Math.floor(remainWidth / (scaleMinList.length + pxMinList.length + autoList.length)) : 0
    if (fit) {
      if (remainWidth > 0) {
        scaleMinList.concat(pxMinList).forEach(column => {
          tableWidth += meanWidth
          column.renderWidth += meanWidth
        })
      }
    } else {
      meanWidth = minCellWidth
    }
    // 自适应
    autoList.forEach(column => {
      const width = Math.max(meanWidth, minCellWidth)
      column.renderWidth = width
      tableWidth += width
    })
    if (fit) {
      /**
       * 偏移量算法
       * 如果所有列足够放的情况下，从最后动态列开始分配
       */
      const dynamicList = scaleList.concat(scaleMinList).concat(pxMinList).concat(autoList)
      let dynamicSize = dynamicList.length - 1
      if (dynamicSize > 0) {
        let odiffer = bodyWidth - tableWidth
        if (odiffer > 0) {
          while (odiffer > 0 && dynamicSize >= 0) {
            odiffer--
            dynamicList[dynamicSize--].renderWidth++
          }
          tableWidth = bodyWidth
        }
      }
    }
    const tableHeight = bodyElem.offsetHeight
    const overflowY = bodyElem.scrollHeight > bodyElem.clientHeight
    this.scrollbarWidth = overflowY ? bodyElem.offsetWidth - bodyElem.clientWidth : 0
    this.overflowY = overflowY
    this.tableWidth = tableWidth
    this.tableHeight = tableHeight
    if (headerElem) {
      this.headerHeight = headerElem.clientHeight
      this.$nextTick(() => {
        // 检测是否同步滚动
        if (headerElem && bodyElem && headerElem.scrollLeft !== bodyElem.scrollLeft) {
          headerElem.scrollLeft = bodyElem.scrollLeft
        }
      })
    } else {
      this.headerHeight = 0
    }
    if (footerElem) {
      const footerHeight = footerElem.offsetHeight
      this.scrollbarHeight = Math.max(footerHeight - footerElem.clientHeight, 0)
      this.overflowX = tableWidth > footerElem.clientWidth
      this.footerHeight = footerHeight
    } else {
      this.footerHeight = 0
      this.scrollbarHeight = Math.max(tableHeight - bodyElem.clientHeight, 0)
      this.overflowX = tableWidth > bodyWidth
    }
    this.updateHeight()
    this.parentHeight = Math.max(this.headerHeight + this.footerHeight + 20, this.getParentHeight())
    if (this.overflowX) {
      this.checkScrolling()
    }
  },

  updateHeight() {
    this.customHeight = calcHeight(this, 'height')
    this.customMaxHeight = calcHeight(this, 'maxHeight')
  },
  updateStyle() {
    let {
      $refs,
      isGroup,
      fullColumnIdData,
      tableColumn,
      customHeight,
      customMaxHeight,
      border,
      headerHeight,
      showFooter,
      showOverflow: allColumnOverflow,
      showHeaderOverflow: allColumnHeaderOverflow,
      showFooterOverflow: allColumnFooterOverflow,
      footerHeight,
      tableHeight,
      tableWidth,
      scrollbarHeight,
      scrollbarWidth,
      scrollXLoad,
      scrollYLoad,
      cellOffsetWidth,
      columnStore,
      elemStore,
      editStore,
      currentRow,
      mouseConfig,
      keyboardConfig,
      keyboardOpts,
      spanMethod,
      mergeList,
      mergeFooterList,
      footerSpanMethod,
      isAllOverflow,
      visibleColumn
    } = this
    const containerList = ['main', 'left', 'right']
    const emptyPlaceholderElem = $refs.emptyPlaceholder
    const bodyWrapperElem = elemStore['main-body-wrapper']
    if (emptyPlaceholderElem) {
      emptyPlaceholderElem.style.top = `${headerHeight}px`
      emptyPlaceholderElem.style.height = bodyWrapperElem ? `${bodyWrapperElem.offsetHeight - scrollbarHeight}px` : ''
    }
    if (customHeight > 0) {
      if (showFooter) {
        customHeight += scrollbarHeight
      }
    }
    containerList.forEach((name, index) => {
      const fixedType = index > 0 ? name : ''
      const layoutList = ['header', 'body', 'footer']
      const fixedColumn = columnStore[`${fixedType}List`]
      const fixedWrapperElem = $refs[`${fixedType}Container`]
      layoutList.forEach(layout => {
        const wrapperElem = elemStore[`${name}-${layout}-wrapper`]
        const tableElem = elemStore[`${name}-${layout}-table`]
        if (layout === 'header') {
          // 表头体样式处理
          // 横向滚动渲染
          let tWidth = tableWidth

          // 如果是使用优化模式
          let isOptimize = false
          if (!isGroup) {
            if (fixedType) {
              if (scrollXLoad || allColumnHeaderOverflow) {
                isOptimize = true
              }
            }
          }
          if (isOptimize) {
            tableColumn = fixedColumn
          }
          if (isOptimize || scrollXLoad) {
            tWidth = tableColumn.reduce((previous, column) => previous + column.renderWidth, 0)
          }

          if (tableElem) {
            tableElem.style.width = tWidth ? `${tWidth + scrollbarWidth}px` : ''
            // 修复 IE 中高度无法自适应问题
            if (browse.msie) {
              DUtils.arrayEach(tableElem.querySelectorAll('.vxe-resizable'), resizeElem => {
                resizeElem.style.height = `${resizeElem.parentNode.offsetHeight}px`
              })
            }
          }

          const repairElem = elemStore[`${name}-${layout}-repair`]
          if (repairElem) {
            repairElem.style.width = `${tableWidth}px`
          }

          const listElem = elemStore[`${name}-${layout}-list`]
          if (isGroup && listElem) {
            DUtils.arrayEach(listElem.querySelectorAll('.col--group'), thElem => {
              const colNode = this.getColumnNode(thElem)
              if (colNode) {
                const column = colNode.item
                const { showHeaderOverflow } = column
                const cellOverflow = DUtils.isBoolean(showHeaderOverflow) ? showHeaderOverflow : allColumnHeaderOverflow
                const showEllipsis = cellOverflow === 'ellipsis'
                const showTitle = cellOverflow === 'title'
                const showTooltip = cellOverflow === true || cellOverflow === 'tooltip'
                const hasEllipsis = showTitle || showTooltip || showEllipsis
                let childWidth = 0
                let countChild = 0
                if (hasEllipsis) {
                  DUtils.eachTree(column.children, item => {
                    if (!item.children || !column.children.length) {
                      countChild++
                    }
                    childWidth += item.renderWidth
                  })
                }
                thElem.style.width = hasEllipsis ? `${childWidth - countChild - (border ? 2 : 0)}px` : ''
              }
            })
          }
        } else if (layout === 'body') {
          const emptyBlockElem = elemStore[`${name}-${layout}-emptyBlock`]
          if (isNodeElement(wrapperElem)) {
            if (customMaxHeight) {
              wrapperElem.style.maxHeight = `${fixedType ? customMaxHeight - headerHeight - (showFooter ? 0 : scrollbarHeight) : customMaxHeight - headerHeight}px`
            } else {
              if (customHeight > 0) {
                wrapperElem.style.height = `${fixedType ? (customHeight > 0 ? customHeight - headerHeight - footerHeight : tableHeight) - (showFooter ? 0 : scrollbarHeight) : customHeight - headerHeight - footerHeight}px`
              } else {
                wrapperElem.style.height = ''
              }
            }
          }

          // 如果是固定列
          if (fixedWrapperElem) {
            const isRightFixed = fixedType === 'right'
            const fixedColumn = columnStore[`${fixedType}List`]
            if (isNodeElement(wrapperElem)) {
              wrapperElem.style.top = `${headerHeight}px`
            }
            fixedWrapperElem.style.height = `${(customHeight > 0 ? customHeight - headerHeight - footerHeight : tableHeight) + headerHeight + footerHeight - scrollbarHeight * (showFooter ? 2 : 1)}px`
            fixedWrapperElem.style.width = `${fixedColumn.reduce((previous, column) => previous + column.renderWidth, isRightFixed ? scrollbarWidth : 0)}px`
          }

          let tWidth = tableWidth

          // 如果是使用优化模式
          if (fixedType) {
            if (scrollXLoad || scrollYLoad || (allColumnOverflow ? isAllOverflow : allColumnOverflow)) {
              if (!mergeList.length && !spanMethod && !(keyboardConfig && keyboardOpts.isMerge)) {
                tableColumn = fixedColumn
              } else {
                tableColumn = visibleColumn
              }
            } else {
              tableColumn = visibleColumn
            }
          }
          tWidth = tableColumn.reduce((previous, column) => previous + column.renderWidth, 0)

          if (tableElem) {
            tableElem.style.width = tWidth ? `${tWidth}px` : ''
            // 兼容性处理
            tableElem.style.paddingRight = scrollbarWidth && fixedType && (browse['-moz'] || browse.safari) ? `${scrollbarWidth}px` : ''
          }
          if (emptyBlockElem) {
            emptyBlockElem.style.width = tWidth ? `${tWidth}px` : ''
          }
        } else if (layout === 'footer') {
          let tWidth = tableWidth

          // 如果是使用优化模式
          if (fixedType) {
            if (scrollXLoad || allColumnFooterOverflow) {
              if (!mergeFooterList.length || !footerSpanMethod) {
                tableColumn = fixedColumn
              } else {
                tableColumn = visibleColumn
              }
            } else {
              tableColumn = visibleColumn
            }
          }
          tWidth = tableColumn.reduce((previous, column) => previous + column.renderWidth, 0)

          if (isNodeElement(wrapperElem)) {
            // 如果是固定列
            if (fixedWrapperElem) {
              wrapperElem.style.top = `${customHeight > 0 ? customHeight - footerHeight : tableHeight + headerHeight}px`
            }
            wrapperElem.style.marginTop = `${-scrollbarHeight}px`
          }
          if (tableElem) {
            tableElem.style.width = tWidth ? `${tWidth + scrollbarWidth}px` : ''
          }
        }
        const colgroupElem = elemStore[`${name}-${layout}-colgroup`]
        if (colgroupElem) {
          DUtils.arrayEach(colgroupElem.children, colElem => {
            const colid = colElem.getAttribute('name')
            if (colid === 'col_gutter') {
              colElem.style.width = `${scrollbarWidth}px`
            }
            if (fullColumnIdData[colid]) {
              const column = fullColumnIdData[colid].column
              const { showHeaderOverflow, showFooterOverflow, showOverflow } = column
              let cellOverflow
              colElem.style.width = `${column.renderWidth}px`
              if (layout === 'header') {
                cellOverflow = DUtils.isUndefined(showHeaderOverflow) || DUtils.isNull(showHeaderOverflow) ? allColumnHeaderOverflow : showHeaderOverflow
              } else if (layout === 'footer') {
                cellOverflow = DUtils.isUndefined(showFooterOverflow) || DUtils.isNull(showFooterOverflow) ? allColumnFooterOverflow : showFooterOverflow
              } else {
                cellOverflow = DUtils.isUndefined(showOverflow) || DUtils.isNull(showOverflow) ? allColumnOverflow : showOverflow
              }
              const showEllipsis = cellOverflow === 'ellipsis'
              const showTitle = cellOverflow === 'title'
              const showTooltip = cellOverflow === true || cellOverflow === 'tooltip'
              let hasEllipsis = showTitle || showTooltip || showEllipsis
              const listElem = elemStore[`${name}-${layout}-list`]
              // 滚动的渲染不支持动态行高
              if (layout === 'header' || layout === 'footer') {
                if (scrollXLoad && !hasEllipsis) {
                  hasEllipsis = true
                }
              } else {
                if ((scrollXLoad || scrollYLoad) && !hasEllipsis) {
                  hasEllipsis = true
                }
              }
              if (listElem) {
                DUtils.arrayEach(listElem.querySelectorAll(`.${column.id}`), elem => {
                  const colspan = parseInt(elem.getAttribute('colspan') || 1)
                  const cellElem = elem.querySelector('.vxe-cell')
                  let colWidth = column.renderWidth
                  if (cellElem) {
                    if (colspan > 1) {
                      const columnIndex = this.getColumnIndex(column)
                      for (let index = 1; index < colspan; index++) {
                        const nextColumn = this.getColumns(columnIndex + index)
                        if (nextColumn) {
                          colWidth += nextColumn.renderWidth
                        }
                      }
                    }
                    cellElem.style.width = hasEllipsis ? `${colWidth - (cellOffsetWidth * colspan)}px` : ''
                  }
                })
              }
            }
          })
        }
      })
    })
    if (currentRow) {
      this.setCurrentRow(currentRow)
    }
    if (mouseConfig && mouseConfig.selected && editStore.selected.row && editStore.selected.column) {
      this.addColSdCls()
    }
    return this.$nextTick()
  },

  // 计算可视渲染相关数据
  computeScrollLoad() {
    return this.$nextTick().then(() => {
      const { sYOpts, sXOpts, scrollXLoad, scrollYLoad, scrollXStore, scrollYStore } = this
      // 计算 X 逻辑
      if (scrollXLoad) {
        const { visibleSize: visibleXSize } = computeVirtualX(this)
        const offsetXSize = sXOpts.oSize ? DUtils.toNumber(sXOpts.oSize) : browse.msie ? 10 : (browse.edge ? 5 : 0)
        scrollXStore.offsetSize = offsetXSize
        scrollXStore.visibleSize = visibleXSize
        scrollXStore.endIndex = Math.max(scrollXStore.startIndex + scrollXStore.visibleSize + offsetXSize, scrollXStore.endIndex)
        this.updateScrollXData()
      } else {
        this.updateScrollXSpace()
      }
      // 计算 Y 逻辑
      const { rowHeight, visibleSize: visibleYSize } = computeVirtualY(this)
      scrollYStore.rowHeight = rowHeight
      if (scrollYLoad) {
        const offsetYSize = sYOpts.oSize ? DUtils.toNumber(sYOpts.oSize) : browse.msie ? 20 : (browse.edge ? 10 : 0)
        scrollYStore.offsetSize = offsetYSize
        scrollYStore.visibleSize = visibleYSize
        scrollYStore.endIndex = Math.max(scrollYStore.startIndex + visibleYSize + offsetYSize, scrollYStore.endIndex)
        this.updateScrollYData()
      } else {
        this.updateScrollYSpace()
      }
      this.rowHeight = rowHeight
      this.$nextTick(this.updateStyle)
    })
  },

  /**
   * 更新数据列的 Map
   * 牺牲数据组装的耗时，用来换取使用过程中的流畅
   */
  cacheColumnMap() {
    const { tableFullColumn, collectColumn, fullColumnMap, showOverflow } = this
    const fullColumnIdData = this.fullColumnIdData = {}
    const fullColumnFieldData = this.fullColumnFieldData = {}
    const isGroup = collectColumn.some(hasChildrenList)
    let isAllOverflow = !!showOverflow
    let expandColumn
    let treeNodeColumn
    let checkboxColumn
    let radioColumn
    let hasFixed
    const handleFunc = (column, index, items, path, parent) => {
      const { id: colid, property, fixed, type, treeNode } = column
      const rest = { column, colid, index, items, parent }
      if (property) {
        if (process.env.VUE_APP_VXE_TABLE_ENV === 'development') {
          if (fullColumnFieldData[property]) {
            warnLog('vxe.error.colRepet', ['field', property])
          }
        }
        fullColumnFieldData[property] = rest
      }
      if (!hasFixed && fixed) {
        hasFixed = fixed
      }
      if (treeNode) {
        if (process.env.VUE_APP_VXE_TABLE_ENV === 'development') {
          if (treeNodeColumn) {
            warnLog('vxe.error.colRepet', ['tree-node', treeNode])
          }
        }
        if (!treeNodeColumn) {
          treeNodeColumn = column
        }
      } else if (type === 'expand') {
        if (process.env.VUE_APP_VXE_TABLE_ENV === 'development') {
          if (expandColumn) {
            warnLog('vxe.error.colRepet', ['type', type])
          }
        }
        if (!expandColumn) {
          expandColumn = column
        }
      }
      if (process.env.VUE_APP_VXE_TABLE_ENV === 'development') {
        if (type === 'checkbox') {
          if (checkboxColumn) {
            warnLog('vxe.error.colRepet', ['type', type])
          }
          if (!checkboxColumn) {
            checkboxColumn = column
          }
        } else if (type === 'radio') {
          if (radioColumn) {
            warnLog('vxe.error.colRepet', ['type', type])
          }
          if (!radioColumn) {
            radioColumn = column
          }
        }
      }
      if (process.env.VUE_APP_VXE_TABLE_ENV === 'development') {
        if (this.showOverflow && column.showOverflow === false) {
          warnLog('vxe.error.errConflicts', [`table.show-overflow=${this.showOverflow}`, `column.show-overflow=${column.showOverflow}`])
        }
        if (this.showHeaderOverflow && column.showHeaderOverflow === false) {
          warnLog('vxe.error.errConflicts', [`table.show-header-overflow=${this.showHeaderOverflow}`, `column.show-header-overflow=${column.showHeaderOverflow}`])
        }
        if (this.showFooterOverflow && column.showFooterOverflow === false) {
          warnLog('vxe.error.errConflicts', [`table.show-footer-overflow=${this.showFooterOverflow}`, `column.show-footer-overflow=${column.showFooterOverflow}`])
        }
      }
      if (isAllOverflow && column.showOverflow === false) {
        isAllOverflow = false
      }
      if (fullColumnIdData[colid]) {
        errLog('vxe.error.colRepet', ['colId', colid])
      }
      fullColumnIdData[colid] = rest
      fullColumnMap.set(column, rest)
    }
    fullColumnMap.clear()
    if (isGroup) {
      DUtils.eachTree(collectColumn, (column, index, items, path, parent, nodes) => {
        column.level = nodes.length
        handleFunc(column, index, items, path, parent)
      })
    } else {
      tableFullColumn.forEach(handleFunc)
    }

    if (process.env.VUE_APP_VXE_TABLE_ENV === 'development') {
      if (expandColumn && this.mouseOpts.area) {
        errLog('vxe.error.errConflicts', ['mouse-config.area', 'column.type=expand'])
      }
    }

    this.isGroup = isGroup
    this.treeNodeColumn = treeNodeColumn
    this.expandColumn = expandColumn
    this.isAllOverflow = isAllOverflow
  },

  /**
   * 还原自定义列操作状态
   */
  restoreCustomStorage() {
    const { id, collectColumn, customConfig, customOpts } = this
    const { storage } = customOpts
    const isAllStorage = customOpts.storage === true
    const isResizable = isAllStorage || (storage && storage.resizable)
    const isVisible = isAllStorage || (storage && storage.visible)
    if (customConfig && (isResizable || isVisible)) {
      const customMap = {}
      if (!id) {
        errLog('vxe.error.reqProp', ['id'])
        return
      }
      if (isResizable) {
        const columnWidthStorage = getCustomStorageMap(resizableStorageKey)[id]
        if (columnWidthStorage) {
          DUtils.each(columnWidthStorage, (resizeWidth, field) => {
            customMap[field] = { field, resizeWidth }
          })
        }
      }
      if (isVisible) {
        const columnVisibleStorage = getCustomStorageMap(visibleStorageKey)[id]
        if (columnVisibleStorage) {
          const colVisibles = columnVisibleStorage.split('|')
          const colHides = colVisibles[0] ? colVisibles[0].split(',') : []
          const colShows = colVisibles[1] ? colVisibles[1].split(',') : []
          colHides.forEach(field => {
            if (customMap[field]) {
              customMap[field].visible = false
            } else {
              customMap[field] = { field, visible: false }
            }
          })
          colShows.forEach(field => {
            if (customMap[field]) {
              customMap[field].visible = true
            } else {
              customMap[field] = { field, visible: true }
            }
          })
        }
      }
      const keyMap = {}
      DUtils.eachTree(collectColumn, column => {
        const colKey = column.getKey()
        if (colKey) {
          keyMap[colKey] = column
        }
      })
      DUtils.each(customMap, ({ visible, resizeWidth }, field) => {
        const column = keyMap[field]
        if (column) {
          if (DUtils.isNumber(resizeWidth)) {
            column.resizeWidth = resizeWidth
          }
          if (DUtils.isBoolean(visible)) {
            column.visible = visible
          }
        }
      })
    }
  },

  /**
   * 刷新列信息
   * 将固定的列左边、右边分别靠边
   */
  parseColumns() {
    const leftList = []
    const centerList = []
    const rightList = []
    const { collectColumn, tableFullColumn, isGroup, columnStore, sXOpts, scrollXStore } = this
    // 如果是分组表头，如果子列全部被隐藏，则根列也隐藏
    if (isGroup) {
      const leftGroupList = []
      const centerGroupList = []
      const rightGroupList = []
      DUtils.eachTree(collectColumn, (column, index, items, path, parent) => {
        const isColGroup = hasChildrenList(column)
        // 如果是分组，必须按组设置固定列，不允许给子列设置固定
        if (parent && parent.fixed) {
          column.fixed = parent.fixed
        }
        if (parent && column.fixed !== parent.fixed) {
          errLog('vxe.error.groupFixed')
        }
        if (isColGroup) {
          column.visible = !!DUtils.findTree(column.children, subColumn => hasChildrenList(subColumn) ? null : subColumn.visible)
        } else if (column.visible) {
          if (column.fixed === 'left') {
            leftList.push(column)
          } else if (column.fixed === 'right') {
            rightList.push(column)
          } else {
            centerList.push(column)
          }
        }
      })
      collectColumn.forEach((column) => {
        if (column.visible) {
          if (column.fixed === 'left') {
            leftGroupList.push(column)
          } else if (column.fixed === 'right') {
            rightGroupList.push(column)
          } else {
            centerGroupList.push(column)
          }
        }
      })
      this.tableGroupColumn = leftGroupList.concat(centerGroupList).concat(rightGroupList)
    } else {
      // 重新分配列
      tableFullColumn.forEach((column) => {
        if (column.visible) {
          if (column.fixed === 'left') {
            leftList.push(column)
          } else if (column.fixed === 'right') {
            rightList.push(column)
          } else {
            centerList.push(column)
          }
        }
      })
    }
    const visibleColumn = leftList.concat(centerList).concat(rightList)
    let scrollXLoad = sXOpts.enabled && sXOpts.gt > -1 && sXOpts.gt < tableFullColumn.length
    this.hasFixedColumn = leftList.length > 0 || rightList.length > 0
    Object.assign(columnStore, { leftList, centerList, rightList })
    if (scrollXLoad && isGroup) {
      scrollXLoad = false
      if (process.env.VUE_APP_VXE_TABLE_ENV === 'development') {
        warnLog('vxe.error.scrollXNotGroup')
      }
    }
    if (scrollXLoad) {
      if (process.env.VUE_APP_VXE_TABLE_ENV === 'development') {
        if (this.showHeader && !this.showHeaderOverflow) {
          warnLog('vxe.error.reqProp', ['show-header-overflow'])
        }
        if (this.showFooter && !this.showFooterOverflow) {
          warnLog('vxe.error.reqProp', ['show-footer-overflow'])
        }
        if (this.spanMethod) {
          warnLog('vxe.error.scrollErrProp', ['span-method'])
        }
        if (this.footerSpanMethod) {
          warnLog('vxe.error.scrollErrProp', ['footer-span-method'])
        }
      }
      const { visibleSize } = computeVirtualX(this)
      scrollXStore.startIndex = 0
      scrollXStore.endIndex = visibleSize
      scrollXStore.visibleSize = visibleSize
    }
    // 如果列被显示/隐藏，则清除合并状态
    // 如果列被设置为固定，则清除合并状态
    if (visibleColumn.length !== this.visibleColumn.length || !this.visibleColumn.every((column, index) => column === visibleColumn[index])) {
      this.clearMergeCells()
      this.clearMergeFooterItems()
    }
    this.scrollXLoad = scrollXLoad
    this.visibleColumn = visibleColumn
    this.handleTableColumn()
    return this.updateFooter().then(() => {
      return this.recalculate()
    }).then(() => {
      this.updateCellAreas()
      return this.recalculate()
    })
  },
  handleTableColumn() {
    const { scrollXLoad, visibleColumn, scrollXStore } = this
    this.tableColumn = scrollXLoad ? visibleColumn.slice(scrollXStore.startIndex, scrollXStore.endIndex) : visibleColumn.slice(0)
  },
  /**
   * 更新表尾合计
   */
  updateFooter() {
    const { showFooter, visibleColumn, footerMethod } = this
    if (showFooter && footerMethod) {
      this.footerTableData = visibleColumn.length ? footerMethod({ columns: visibleColumn, data: this.afterFullData, $table: this, $grid: this.$xegrid }) : []
    }
    return this.$nextTick()
  },

  /**
   * 清除所有表尾合并
   */
  clearMergeFooterItems() {
    this.mergeFooterList = []
    return this.$nextTick()
  },

  /**
   * 指定列宽的列进行拆分
   */
  analyColumnWidth() {
    const { columnOpts } = this
    const { width: defaultWidth, minWidth: defaultMinWidth } = columnOpts
    const resizeList = []
    const pxList = []
    const pxMinList = []
    const scaleList = []
    const scaleMinList = []
    const autoList = []
    this.tableFullColumn.forEach(column => {
      if (defaultWidth && !column.width) {
        column.width = defaultWidth
      }
      if (defaultMinWidth && !column.minWidth) {
        column.minWidth = defaultMinWidth
      }
      if (column.visible) {
        if (column.resizeWidth) {
          resizeList.push(column)
        } else if (DomTools.isPx(column.width)) {
          pxList.push(column)
        } else if (DomTools.isScale(column.width)) {
          scaleList.push(column)
        } else if (DomTools.isPx(column.minWidth)) {
          pxMinList.push(column)
        } else if (DomTools.isScale(column.minWidth)) {
          scaleMinList.push(column)
        } else {
          autoList.push(column)
        }
      }
    })
    Object.assign(this.columnStore, { resizeList, pxList, pxMinList, scaleList, scaleMinList, autoList })
  },

  /**
   * 表格键盘事件
   */
  keydownEvent(evnt) {
    const { filterStore, ctxMenuStore, editStore, keyboardConfig, mouseConfig, mouseOpts, keyboardOpts } = this
    const { actived } = editStore
    const { keyCode } = evnt
    const isEsc = keyCode === 27
    if (isEsc) {
      this.preventEvent(evnt, 'event.keydown', null, () => {
        this.emitEvent('keydown-start', {}, evnt)
        if (keyboardConfig && mouseConfig && mouseOpts.area && this.handleKeyboardEvent) {
          this.handleKeyboardEvent(evnt)
        } else if (actived.row || filterStore.visible || ctxMenuStore.visible) {
          evnt.stopPropagation()
          // 如果按下了 Esc 键，关闭快捷菜单、筛选
          this.closeFilter()
          this.closeMenu()
          if (keyboardConfig && keyboardOpts.isEsc) {
            // 如果是激活编辑状态，则取消编辑
            if (actived.row) {
              const params = actived.args
              this.clearActived(evnt)
              // 如果配置了选中功能，则为选中状态
              if (mouseConfig && mouseOpts.selected) {
                this.$nextTick(() => this.handleSelected(params, evnt))
              }
            }
          }
        }
        this.emitEvent('keydown', {}, evnt)
        this.emitEvent('keydown-end', {}, evnt)
      })
    }
  },

  // 更新横向 X 可视渲染上下剩余空间大小
  updateScrollXSpace () {
    const { $refs, elemStore, visibleColumn, scrollXStore, scrollXLoad, tableWidth, scrollbarWidth } = this
    const { tableHeader, tableBody, tableFooter } = $refs
    console.log(tableHeader)
    const tableBodyElem = tableBody ? tableBody.$el : null
    if (tableBodyElem) {
      const tableHeaderElem = tableHeader ? tableHeader.$el : null
      const tableFooterElem = tableFooter ? tableFooter.$el : null
      const headerElem = tableHeaderElem ? tableHeaderElem.querySelector('.vxe-table--header') : null
      const bodyElem = tableBodyElem.querySelector('.vxe-table--body')
      const footerElem = tableFooterElem ? tableFooterElem.querySelector('.vxe-table--footer') : null
      const leftSpaceWidth = visibleColumn.slice(0, scrollXStore.startIndex).reduce((previous, column) => previous + column.renderWidth, 0)
      let marginLeft = ''
      if (scrollXLoad) {
        marginLeft = `${leftSpaceWidth}px`
      }
      if (headerElem) {
        headerElem.style.marginLeft = marginLeft
      }
      bodyElem.style.marginLeft = marginLeft
      if (footerElem) {
        footerElem.style.marginLeft = marginLeft
      }
      const containerList = ['main']
      containerList.forEach(name => {
        const layoutList = ['header', 'body', 'footer']
        layoutList.forEach(layout => {
          const xSpaceElem = elemStore[`${name}-${layout}-xSpace`]
          if (xSpaceElem) {
            xSpaceElem.style.width = scrollXLoad ? `${tableWidth + (layout === 'header' ? scrollbarWidth : 0)}px` : ''
          }
        })
      })
      this.$nextTick(this.updateStyle)
    }
  },
}