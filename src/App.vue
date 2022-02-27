<template>
  <div id="app">
    <!-- <img alt="Vue logo" src="./assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/> -->
    <dui-table :data="tableData">
      <dui-table-column field="sex" title="Sex">
        <template #header>
          <span style="color: red;">自定义头部</span>
        </template>
      </dui-table-column>
      <dui-table-column field="name" title="Name" >
        <template #default>
          <span style="color: red;">自定义头部</span>
        </template>
      </dui-table-column>
      <dui-table-column field="age" title="Age">
        <template #default>
          <span style="color: red;">自定义头部</span>
        </template>
      </dui-table-column>
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
      tableData: [
        {
          id: 10001,
          name: "Test1",
          role: "Develop",
          sex: "Man",
          age: 28,
          address: "test abc",
        },
        {
          id: 10002,
          name: "Test2",
          role: "Test",
          sex: "Women",
          age: 22,
          address: "Guangzhou",
        },
        {
          id: 10003,
          name: "Test3",
          role: "PM",
          sex: "Man",
          age: 32,
          address: "Shanghai",
        },
        {
          id: 10004,
          name: "Test4",
          role: "Designer",
          sex: "Women",
          age: 24,
          address: "Shanghai",
        },
      ],
    };
  },
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
