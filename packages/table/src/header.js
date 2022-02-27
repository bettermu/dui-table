
/* eslint-disable */ 
export default {
  name:'DuiTableHeader',
  props:{
    data: Array
  },

  render(h){
    return h('div',{
      class:"dui-table--header-wrapper"
    },[
      h('table',{
        class:"dui-table--header",
        attrs:{
          cellspacing: 0,
          cellpadding: 0,
          border: 0
        },
        ref:"table"
        
      },[
        /**
         * 列宽
         */
        h('colgroup', {
          ref: 'colgroup'
        }, this.data.map((column, $columnIndex) => {
          return h('col', {
            attrs: {
              name: column.id
            },
            key: $columnIndex
          })
        })),

        h('thead',{},[
          h('tr',{}, this.data.map((item)=>{
            return h('th',{},[
              h('div',{},item)
            ])
          }))
        ])
      ])
    ])
  }



  
}


