<template>
  <div id="app" :style="wrapperStyle">
    <div class='whiteBgLeft'>
    </div>

    <!-- The router will determine which kind of filtershould be displayed -->
    <local-filter v-if="this.$route.name === 'Panache'" class='optionPanelStyle'/>

    <!-- Router view to display -->
    <router-view
      class='whiteBlock shadow-lg mt-2 mainDisplayStyle'
      id='TheRouterView'
    />

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
  text-align: center;
  color: #2c3e50;
  background-color: #F8F8FF;
}

body {
  background-color: #F8F8FF;
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

</style>
