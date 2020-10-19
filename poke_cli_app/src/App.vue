<template>
  <div id="app">
    <!-- On affiche le filtre qui correspond au nom du component qui est affiché via le routing vie le v-if -->
    <global-filter v-if="this.$route.name === 'Circos'" :style="filterTabStyle"/>
    <local-filter v-if="this.$route.name === 'Panache'" :style="filterTabStyle"/>
    <sample-filter v-if="this.$route.name === 'PCA'" :style="filterTabStyle"/>
    <b-navbar class="grey-back border-bottom mx-2" toggleable="lg" type="dark" v-if="this.$route.name !== 'Organism'">
        <b-navbar-nav class="ml">
            <b-nav-form>
                <b-form-input size="sm" class="ml-sm-2" placeholder="Search"></b-form-input>
                <b-button size="sm" class="my-2 my-sm-0" type="submit">Search</b-button>
            </b-nav-form>
        </b-navbar-nav>
        <b-navbar-brand class="text-dark mx-auto">Title</b-navbar-brand>
    </b-navbar>
    <!-- Système de routing mis en place dans router/index.js -->
    <div id="nav" v-if="this.$route.name !== 'Organism'">
      <router-link to="/">Organism</router-link> |
      <router-link to="/pca">Sample diversity</router-link> |
      <router-link to="/global">Global diversity</router-link> |
      <router-link to="/panache">Local diversity</router-link>
    </div>
    <router-view/>
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
    //Style object to apply on upper div for a correct display
    filterTabStyle() {
      return {
        'float': 'left',
        'width': this.optionPanelWidth,
        'background-color': 'white',
        'height': `${49}rem`,
        'padding': `${20}px`,
        'text-align': 'left',
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
  padding: 30px;

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

.grey-back {
  background-color: #F8F8FF;
}

</style>
