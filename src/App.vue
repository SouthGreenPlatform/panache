<template>
  <div id="app" class="h-100">
    <div class="container-fluid h-100">
      <div class="row h-100">
        <div class="col-2 bg-white h-100 sidepanel">
          <local-filter v-if="this.$route.name === 'Panache'"/>
        </div>
        <div class="col-10">
          <!-- Router view to display -->
          <!-- The router will determine which kind of filtershould be displayed -->
          <router-view
              class='whiteBlock shadow-lg mt-2 mainDisplayStyle'
              id='TheRouterView'
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import LocalFilter from '@/components/LocalFilter.vue';

import { mapState, mapGetters } from 'vuex';

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
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  //text-align: center;
  color: #2c3e50;
  background-color: #F8F8FF;
}

body, html {
  background-color: #F8F8FF;
  height: 100%!important;
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

.sidepanel {
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.2);
  overflow-y: auto;
  overflow-x: hidden;
}

</style>
