/* eslint-disable */ 

function renderRows(h,data,columnData){
  const rows = []
  data.forEach((row,$rowIndex)=>{
    rows.push(
      h('tr',{},columnData.map((column, $columnIndex) => {
        return renderColumn(h,column,row,$rowIndex)
      }))
    )
  })
  return rows
}

function renderColumn(h,column,row,rowIndex){
  const tdVNs = []
  tdVNs.push(
    h('div',{},row[column])
  )
  return h('td',{},tdVNs)

}


export default {
  name:'DuiTableBody',

  props:{
    columnData:Array,
    data:Array
  },

  render(h){
    return h('div',{
      class:"dui-table--body-wrapper"
    },[
      h('table', {
        class: 'vxe-table--body',
        attrs: {
          cellspacing: 0,
          cellpadding: 0,
        },
        ref: 'table'
      },[
        /**
         * 列宽
         */
        h('colgroup', {
          ref: 'colgroup'
        }, this.columnData.map((column, $columnIndex) => {
          return h('col', {
            attrs: {
              name: column
            },
            key: $columnIndex
          })
        })),
        /**
         * 内容
         */
        h('tbody', {
          ref: 'tbody'
        }, renderRows(h,this.data,this.columnData))
      ])
    ])
  }
  
}


