<template>
<div id="app">
  <!-- <img alt="Vue logo" src="./assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/> -->
  <dui-table :align="allAlign" :data="tableData">
    <dui-table-column type="seq" title="#" width="60"></dui-table-column>
    <dui-table-column field="name" title="Name"></dui-table-column>
    <dui-table-column field="sex" title="Sex"></dui-table-column>
    <dui-table-column field="age" title="Age"></dui-table-column>
  </dui-table>

  <dui-table border show-header-overflow show-overflow highlight-hover-row :align="allAlign" :data="tableData">
    <dui-table-column type="seq" title="序号" width="60"></dui-table-column>
    <dui-table-column field="name" title="Name"></dui-table-column>
    <dui-table-column field="sex" title="Sex"></dui-table-column>
    <dui-table-column field="age" title="Age"></dui-table-column>
    <dui-table-column field="address" title="Address"></dui-table-column>
  </dui-table>

  <dui-table :data="tableData" @checkbox-change="checkboxChangeEvent" @checkbox-all="checkboxAllEvent">
    <dui-table-column type="seq" width="60"></dui-table-column>
    <dui-table-column type="radio" width="60"></dui-table-column>
    <dui-table-column type="checkbox" width="60"></dui-table-column>
    <dui-table-column field="name" title="Name"></dui-table-column>
    <dui-table-column field="age" title="Age" sortable></dui-table-column>
    <dui-table-column field="sex" title="Sex" :filters="[{value:'0',label:'女'},{value:'1',label:'男'}]"></dui-table-column>
    <dui-table-column field="sex2" title="Sex2" sortable :filters="[{value:'0',label:'女'},{value:'1',label:'男'}]" :filter-multiple="false"></dui-table-column>
    <dui-table-column field="address" title="Address" show-overflow></dui-table-column>
  </dui-table>

  <div> 虚拟滚动 </div>
  <dui-table show-overflow ref="xTable1" virtualScrollable="true" height="300" :row-config="{isHover: true}" :sort-config="{trigger: 'cell'}">
    <dui-table-column type="checkbox" width="60"></dui-table-column>
    <dui-table-column type="seq" width="100"></dui-table-column>
    <dui-table-column field="name" title="Name" sortable></dui-table-column>
    <dui-table-column field="sex" title="Sex"></dui-table-column>
    <dui-table-column field="age" title="Age"></dui-table-column>
    <dui-table-column field="address" title="Address" show-overflow></dui-table-column>
  </dui-table>

  <dui-table border ref="xTable2" height="300" :data="tableData" :radio-config="{highlight: true}" @cell-click="cellClickEvent" @radio-change="radioChangeEvent">
    <dui-table-column type="radio" width="60"></dui-table-column>
    <dui-table-column field="sex" title="Sex">
      <q-button @click="buttonClick">111</q-button>
    </dui-table-column>
    <dui-table-column field="age" title="Age"></dui-table-column>
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
      tableData: [{
          id: 10001,
          name: 'Test1',
          role: 'Develop',
          sex: 'Man',
          age: 28,
          address: 'test abc'
        },
        {
          id: 10002,
          name: 'Test2',
          role: 'Test',
          sex: 'Women',
          age: 22,
          address: 'Guangzhou'
        },
        {
          id: 10003,
          name: 'Test3',
          role: 'PM',
          sex: 'Man',
          age: 32,
          address: 'Shanghai'
        },
        {
          id: 10004,
          name: 'Test4',
          role: 'Designer',
          sex: 'Women',
          age: 24,
          address: 'Shanghai'
        }
      ]
    };
  },
  mounted() {
    this.$nextTick(() => {
      const $table = this.$refs.xTable1
      this.mockList(50).then(data => {
        if ($table) {
          $table.loadData(data)
        }
      })
    })
  },
  methods: {
    cellClickEvent(data) {
      console.log('单元格点击事件', data)
    },
    checkboxAllEvent(data) {
      console.log('全选事件', data)
    },
    checkboxChangeEvent(data) {

      console.log('多选框事件', data)
    },
    buttonClick() {
      alert(111)
    },
    radioChangeEvent({
      row
    }) {
      this.selectRow = row
      console.log('单选事件')
    },

    mockList(size) {
      return new Promise(resolve => {
        const list = []
        for (let index = 0; index < size; index++) {
          list.push({
            name: `名称${index}`,
            sex: '0',
            num: 123,
            age: 18,
            num2: 234,
            rate: 3,
            address: 'shenzhen'
          })
        }
        resolve(list)
      })
    }
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
