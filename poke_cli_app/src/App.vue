<template>
  <div id="app" :style="wrapperStyle">
    <div v-if="this.$route.name !== 'Organism'" class='logoStyle'>
      <img class="logo" alt="Vue logo" src="@/assets/logo.png">
    </div>

    <!-- The router will determine which kind of filtershould be displayed -->
    <global-filter v-if="this.$route.name === 'Circos'" class='optionPanelStyle'/>
    <local-filter v-if="this.$route.name === 'Panache'" class='optionPanelStyle'/>
    <sample-filter v-if="this.$route.name === 'PCA'" class='optionPanelStyle'/>

    <!-- Title and Search bar -->
    <!-- -navbar class="grey-back border-bottom mx-2" toggleable="lg" type="dark" v-if="this.$route.name !== 'Organism'" -->
    <div class='titleStyle' v-if="this.$route.name !== 'Organism'">
      <b-navbar toggleable="lg" type="dark">
          <b-navbar-nav class="ml">
              <b-nav-form>
                  <b-form-input size="sm" class="ml-sm-2" placeholder="Search"></b-form-input>
                  <b-button size="sm" class="my-2 my-sm-0" type="submit">Search</b-button>
              </b-nav-form>
          </b-navbar-nav>
          <b-navbar-brand class="text-dark mx-auto">Title</b-navbar-brand>
      </b-navbar>
      <hr class='delimiterBar'/>
    </div>

    <!-- Navigation bar that navigates through all routes -->
    <div id="nav" v-if="this.$route.name !== 'Organism'" class='navigationBarStyle'>
      <router-link to="/">Organism</router-link> |
      <router-link to="/pca">Sample diversity</router-link> |
      <router-link to="/global">Global diversity</router-link> |
      <router-link to="/panache">Local diversity</router-link>
    </div>

    <!-- Router view to display -->
    <router-view :style="mainDisplayStyle" :class="`whiteBlock shadow-lg mt-2 ${( this.$route.name !== 'Organism' ? 'mainDisplayStyle' : 'fullScreenStyle')}`" id='TheRouterView'/>

  </div>
</template>

<script>

import GlobalFilter from '@/components/GlobalFilter.vue';
import LocalFilter from '@/components/LocalFilter.vue';
import SampleFilter from '@/components/SampleFilter.vue';

import { mapState, mapGetters } from 'vuex';

export default {
  name: 'App',
  components: {
    GlobalFilter,
    LocalFilter,
    SampleFilter,
  },
  computed: {
    //Style object to apply to wrapper to take variable values
    wrapperStyle() {
      return {
        display: 'grid',
        'grid-template-rows': 'auto auto 1fr',
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
  height: 49rem;
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

#nav {
  padding: 10px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: white;
      background-color: #007BFF;
      padding: 10px;
      border-radius: 5px;
    }
  }
}

.whiteBlock {
  background-color: white;
  border-radius: 50px;
}

.delimiterBar {
  margin: 0.1em auto;
}

.logoStyle {
  grid-row: 1;
  grid-column: 1;
  text-align: center;
  align-self: center;
}

.optionPanelStyle {
  grid-row: 2 / 4;
  grid-column: 1;
  text-align: center;
  align-self: center;
  padding: 1em;
}

.titleStyle {
  grid-row: 1;
  grid-column: 2;
  text-align: center;
  align-self: center;
}

.navigationBarStyle {
  grid-row: 2;
  grid-column: 2;
  text-align: center;
  align-self: center;
}

.mainDisplayStyle {
  grid-row: 3;
  grid-column: 2;
  text-align: center;
  align-self: start;
}

.fullScreenStyle {
  grid-row: 1 / 4;
  grid-column: 1 / 3;
  text-align: center;
  align-self: center;
}





</style>
