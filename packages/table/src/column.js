import Cell from "./cell"
import { assemColumn } from "./utils";

export default {
  name: "DuiTableColumn",

  provide () {
    return {
      $duicolumn: this,
    }
  },
  inject: {
    $duitable: {
      default: null
    },
    $duicolumn: {
      default: null
    }
  },

  props: {
    // 渲染类型 seq,radio,checkbox,expand,html
    type: String,
    // 列字段名
    field: String,
    // 列标题
    title: String,
  },

  created(){
    this.columnConfig = this.createColumn(this.$duitable, this)
    //console.log(this.columnConfig)
  },

  mounted(){
    assemColumn(this)
  },

  render(h) {
    return h('div', this.$slots.default)
  },

  methods: Cell
};







