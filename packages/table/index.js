import Table from './src/table'

export const DuiTable = Object.assign(Table,{
  install(Vue){
    Vue.component(Table.name,Table)
  }
})

export default DuiTable