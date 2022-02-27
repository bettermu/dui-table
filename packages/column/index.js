import Column from '../table/src/column'

export const DuiTableColumn = Object.assign(Column,{
  install(Vue){
    Vue.component(Column.name,Column)
  }
})

export default DuiTableColumn