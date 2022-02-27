import Vue from 'vue'
import App from './App.vue'
import {DuiTable,DuiTableColumn} from '../packages/all'

import '../styles/table.css'

Vue.config.productionTip = false

Vue.use(DuiTable)
Vue.use(DuiTableColumn)

new Vue({
  render: h => h(App),
}).$mount('#app')
