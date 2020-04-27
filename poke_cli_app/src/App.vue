<template>
  <div>
    <global-filter class="filterTab"/>
    <main-tab-bar class="mainTabBar"/>
  </div>
</template>

<script>
import GlobalFilter from './components/GlobalFilter.vue'
import MainTabBar from './components/MainTabBar.vue'

export default {
  name: 'App',
  components: {
    GlobalFilter,
    MainTabBar
  }
};
</script>

<style>

.filterTab {
  width: 17rem;
  float: left;
}

.mainTabBar {
  background-color: #F8F8FF;
  height: 49rem;
  margin-left: 18rem;
  width: 100% - 15rem;
}
</style>
