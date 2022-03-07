import Vue from 'vue'
import App from './App.vue'
import { DuiTable, DuiTableColumn } from '../packages/all'

import '@vislab/DUI/dist/css/dark-blue.min.css'

import '../styles/table.scss'

Vue.config.productionTip = false

Vue.use(DuiTable)
Vue.use(DuiTableColumn)

new Vue({
    render: h => h(App),
}).$mount('#app')