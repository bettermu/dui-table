


/* eslint-disable */
import DuiTableBody from './body'
import DuiTableHeader from './header'
import { uniqueId } from './utils'
import methods from './methods'

export default {
	name: 'DuiTable',
	data(){
		return {
			tId:`${uniqueId()}`,
			tableData:[],
			// 低性能的静态列
      staticColumns: [],
		}
	},
	provide () {
    return {
      $duitable: this,
    }
  },

	watch:{
		staticColumns (value) {
      this.handleColumn(value)
    },
	},

	props:{
		// 数据
    data: Array,
	},
	computed:{
		columnData(){
			return this.columnTitleData.length? this.columnTitleData : Object.keys(this.tableData[0])
		},

		columnFieldData(){
			let arr = this.$slots.default.map((node)=>{
				if(Object.keys(this.tableData[0]).includes(node.componentOptions.propsData.field)){
					return node.componentOptions.propsData.field
				}
			})
			return arr
		},
		
		columnTitleData(){
			let arr = this.$slots.default.map((node)=>{
				if(Object.keys(this.tableData[0]).includes(node.componentOptions.propsData.field)){
					return node.componentOptions.propsData.title
				}
			})
			return arr
		}
	},
	created(){
		

		const { data } = Object.assign(this,{
			tZindex: 0,
			// 表格宽度
      tableWidth: 0,
      // 表格高度
      tableHeight: 0,
      // 表头高度
      headerHeight: 0,
      // 表尾高度
      footerHeight: 0,
			// 完整数据、条件处理后
      tableFullData: [],
      afterFullData: [],
			// 收集的列配置（带分组）
      collectColumn: [],
      // 完整所有列（不带分组）
      tableFullColumn: [],
			// 渲染所有列
      visibleColumn: [],
		})

		this.tableData = data || []
	},
	components:{
		DuiTableBody,
		DuiTableHeader
	},
	render(h){
		return h('div',{
			class:"dui-table"
		},[
			/**
       * 隐藏列
       */
      h('div', {
        class: 'vxe-table-slots',
        ref: 'hideColumn'
      }, this.$slots.default),
			h('div',{
				class:"dui-table--render-wrapper"
			},[
				h('div',{
					class: "dui-table--main-wrapper"
				},[
					h('dui-table-header', {
            ref: 'tableHeader',
            props: {
              data: this.columnData,
            }
          }),
					/**
           * 表体
           */
          h('dui-table-body', {
            ref: 'tableBody',
            props: {
							columnData: this.columnFieldData,
							data: this.tableData
            }
          }),
				])
			])
		])
	},
	methods
}

