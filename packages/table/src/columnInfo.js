
import { uniqueId,getFuncText } from "./utils"

export class ColumnInfo {
  constructor ($duitable,_vm,{renderHeader, renderCell, renderFooter, renderData} = {}) {


    Object.assign(this,{
      //基本属性
      type: _vm.type,
      property: _vm.field,
      field: _vm.field,
      title: _vm.title,
      width: _vm.width,
      align: _vm.align,
      headerAlign: _vm.headerAlign,
      className: _vm.className,
      headerClassName: _vm.headerClassName,
      sortable: _vm.sortable,
      sortBy: _vm.sortBy,
      sortType: _vm.sortType,
      sortMethod: _vm.sortMethod,
      cellType: _vm.cellType,
      cellRender: _vm.cellRender,
      id: _vm.colId || uniqueId('col_'),
      renderHeader: renderHeader || _vm.renderHeader,
      renderCell: renderCell || _vm.renderCell,
      renderFooter: renderFooter || _vm.renderFooter,
      renderData: renderData,
      // 单元格插槽，只对 grid 有效
      slots: _vm.slots
    })
  }

  getTitle () {
    return getFuncText(this.title || '')
  }

  getKey () {
    return this.property || (this.type ? `type=${this.type}` : null)
  }

  update (name, value) {
    // 不支持双向的属性
    if (name !== 'filters') {
      if (name === 'field') {
        // 兼容旧属性
        this.property = value
      }
      this[name] = value
    }
  }
}