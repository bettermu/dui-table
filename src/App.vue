<template>
  <div id="app">
    <!-- <img alt="Vue logo" src="./assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/> -->
    <dui-table
      :align="allAlign"
      :data="tableData">
      <dui-table-column type="seq" title="#" width="60"></dui-table-column>
      <dui-table-column field="name" title="Name"></dui-table-column>
      <dui-table-column field="sex" title="Sex"></dui-table-column>
      <dui-table-column field="age" title="Age"></dui-table-column>
    </dui-table>

    <dui-table
      border
      show-header-overflow
      show-overflow
      highlight-hover-row
      :align="allAlign"
      :data="tableData">
      <dui-table-column type="seq" title="序号" width="60"></dui-table-column>
      <dui-table-column field="name" title="Name"></dui-table-column>
      <dui-table-column field="sex" title="Sex"></dui-table-column>
      <dui-table-column field="age" title="Age"></dui-table-column>
      <dui-table-column field="address" title="Address"></dui-table-column>
    </dui-table>

    <dui-table
          :data="tableData">
          <dui-table-column type="seq" width="60"></dui-table-column>
          <dui-table-column type="radio" width="60"></dui-table-column>
          <dui-table-column type="checkbox" width="60"></dui-table-column>
          <dui-table-column field="name" title="Name"></dui-table-column>
          <dui-table-column field="age" title="Age" sortable></dui-table-column>
          <dui-table-column field="sex" title="Sex" :filters="[{value:'0',label:'女'},{value:'1',label:'男'}]"></dui-table-column>
          <dui-table-column field="sex2" title="Sex2" sortable :filters="[{value:'0',label:'女'},{value:'1',label:'男'}]" :filter-multiple="false"></dui-table-column>
          <dui-table-column field="address" title="Address" show-overflow></dui-table-column>
        </dui-table>

        <dui-table
          border
          ref="xTable1"
          height="300"
          :data="tableData"
          :radio-config="{highlight: true}"
          @cell-click="cellClickEvent"
          @radio-change="radioChangeEvent">
          <dui-table-column type="radio" width="60"></dui-table-column>
          <dui-table-column field="sex" title="Sex"></dui-table-column>
          <dui-table-column field="age" title="Age"></dui-table-column>
          <dui-table-column field="address" title="Address" show-overflow></dui-table-column>
        </dui-table>

        <dui-table
          :data="tableData">
          <dui-table-column type="seq" width="60"></dui-table-column>
          <dui-table-column type="radio" width="60"></dui-table-column>
          <dui-table-column type="checkbox" width="60"></dui-table-column>
          <dui-table-column field="name" title="Name"></dui-table-column>
          <dui-table-column field="age" title="Age" sortable></dui-table-column>
          <dui-table-column field="sex" title="Sex" :filters="[{value:'0',label:'女'},{value:'1',label:'男'}]"></dui-table-column>
          <dui-table-column field="sex2" title="Sex2" sortable :filters="[{value:'0',label:'女'},{value:'1',label:'男'}]" :filter-multiple="false"></dui-table-column>
          <dui-table-column field="address" title="Address" show-overflow></dui-table-column>
        </dui-table>


        
  </div>
</template>

<script>
//import HelloWorld from './components/HelloWorld.vue'

export default {
  name: "App",
  components: {
    //HelloWorld
  },
  data() {
    return {
      allAlign: null,
      tableData: [
        { id: 10001, name: 'Test1', role: 'Develop', sex: 'Man', age: 28, address: 'test abc' },
        { id: 10002, name: 'Test2', role: 'Test', sex: 'Women', age: 22, address: 'Guangzhou' },
        { id: 10003, name: 'Test3', role: 'PM', sex: 'Man', age: 32, address: 'Shanghai' },
        { id: 10004, name: 'Test4', role: 'Designer', sex: 'Women', age: 24, address: 'Shanghai' }
      ]
    };
  },
  methods:{
    cellClickEvent (data) {
      console.log('单元格点击事件', data)
    },
    radioChangeEvent ({ row }) {
      this.selectRow = row
      console.log('单选事件')
    },
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
