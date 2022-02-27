/* eslint-disable */

import { getColumnConfig } from "./utils"

const Cell = {

  //生成列项
  createColumn ($duitable,_vm){
    const {type,sortable} = _vm
    const renMaps = {
      renderHeader: this.renderDefaultHeader,
      renderCell: this.renderDefaultCell,
    }

    switch(type){
      case 'html':
        renMaps.renderCell = this.renderHTMLCell
        break
      default:
    }

    return getColumnConfig($duitable, _vm, renMaps)
  },

  //单元格相关
  renderHeaderTitle(h,params){},

  renderDefaultHeader(h,params){},

  renderDefaultCell(h,params){}
}

export default Cell

