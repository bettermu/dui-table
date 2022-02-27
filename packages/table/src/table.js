


/* eslint-disable */
import DuiTableBody from './body'
import DuiTableHeader from './header'
export default {
	name: 'DuiTable',
	data(){
		return {
			tableData:[]
		}
	},
	provide () {
    return {
      $duitable: this,
    }
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
		this.tableData = this.data || []
		console.log(this.$slots)
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
	}

	
}

