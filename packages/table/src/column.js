

export default {
  name: "DuiTableColumn",

  provide () {
    return {
      $xecolumn: this,
      $xegrid: null
    }
  },
  inject: {
    $duitable: {
      default: null
    },
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
    console.log(this.$duitable)
  },

  mounted(){
    console.log(this.$slots)
  },

  render(h) {
    return h('div', this.$slots.default)
  }
};







