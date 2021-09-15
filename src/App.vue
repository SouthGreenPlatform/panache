<template>
  <div id="app" class="h-100">
    <div class="container-fluid h-100">
      <div class="row h-100">
        <div class="bg-white h-100 side-panel">
          <local-filter v-if="viewIsPanache"/>
        </div>
        <div class="content-column">
          <!-- Router view to display -->
          <!-- The router will determine which kind of filtershould be displayed -->
          <router-view class='bg-white main-view' id='TheRouterView'/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import LocalFilter from '@/components/LocalFilter.vue';
import {mapState, mapGetters} from 'vuex';

export default {
  name: 'App',
  components: {
    LocalFilter,
  },
  computed: {
    //Style object to apply to wrapper to take variable values
    wrapperStyle() {
      return {
        display: 'grid',
        'grid-template-columns': `${this.optionPanelWidth}px 1fr`,
      }
    },
    viewIsPanache() {
      return (this.$route.name === 'Panache')
    },
    ...mapState({
      optionPanelWidth: 'optionPanelWidth',
    }),
    ...mapGetters({
      displayWindowWidth: 'displayWindowWidth',
    })
  },
}

</script>
<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');

#app {
  font-family: 'Roboto', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  //text-align: center;
  color: #2c3e50;
  background-color: #F8F8FF;
}

body, html {
  background-color: #F8F8FF;
  height: 100% !important;
}

.whiteBlock {
  background-color: white;
  border-radius: 50px;
}

.whiteBgLeft {
  background-color: white;
  grid-column: 1;
}

.optionPanelStyle {
  grid-column: 1;
  text-align: center;
}

.mainDisplayStyle {
  grid-column: 2;
  text-align: center;
  align-self: start;
}

.side-panel {
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.2);
  overflow-y: scroll;
  overflow-x: hidden;
  float: left;
  display: block;
  width: 320px;
  padding: 0 15px;
}

.main-view {
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.2);
  margin-top: 15px;
  margin-bottom: 15px;
}

.content-column {
  width: calc(100% - 360px);
  float: left;
  display: block;
  margin-left: 20px;
}

#TheRouterView {
  height: calc(100% - 30px);
}
</style>
