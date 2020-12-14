<template>
  <div id="app" class="h-100">
    <div class="container-fluid h-100">
      <div class="row h-100">
        <div class="bg-white h-100 side-panel" :style="{width: (this.$store.state.optionPanelWidth + 20) + 'px!important'}">
          <local-filter v-if="this.$route.name === 'Panache'"/>
        </div>
        <div class="content-column" :style="{width: 'calc(100% - ' + (this.$store.state.optionPanelWidth + 60) + 'px)'}">
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
  created() {
    this.$store.dispatch('setCpus', Math.min(8, navigator.hardwareConcurrency));

    for (let i = 0; i < this.$store.getters.cpus; i++) {
      this.$store.dispatch('addWorker', {
          worker_id: i,
          worker: new Worker('worker.js')
      })
    }
  },
  computed: {
    //Style object to apply to wrapper to take variable values
    wrapperStyle() {
      return {
        display: 'grid',
        'grid-template-columns': `${this.optionPanelWidth}px 1fr`,
      }
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
@import './lib/style.scss';

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
  overflow: hidden;
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
  overflow-y: auto;
  overflow-x: hidden;
  float: left;
  display: block;
  padding: 0 15px;
}

.main-view {
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.2);
  margin-top: 15px;
  height: calc(100% - 30px);
}

.content-column {
  width: calc(100% - 360px);
  float: left;
  display: block;
  margin-left: 20px;
}
</style>
