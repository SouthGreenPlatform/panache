<template>
  <div id="app">
    <global-filter v-if="this.$route.name === 'Global'" class="filterTab"/>
    <local-filter v-if="this.$route.name === 'Local'" class="filterTab"/>
    <sample-filter v-if="this.$route.name === 'PCA'" class="filterTab"/>
    <b-navbar class="grey-back border-bottom mx-2" toggleable="lg" type="dark" v-if="this.$route.name !== 'Organism'">
        <b-navbar-nav class="ml">
            <b-nav-form>
                <b-form-input size="sm" class="ml-sm-2" placeholder="Search"></b-form-input>
                <b-button size="sm" class="my-2 my-sm-0" type="submit">Search</b-button>
            </b-nav-form>
        </b-navbar-nav>
        <b-navbar-brand class="text-dark mx-auto">Title</b-navbar-brand>
    </b-navbar>
    <div id="nav" v-if="this.$route.name !== 'Organism'">
      <router-link to="/">Organism</router-link> |
      <router-link to="/pca">Sample diversity</router-link> |
      <router-link to="/global">Global diversity</router-link> |
      <router-link :to="{ name: 'Local', params: { user: user } }">Local diversity</router-link>
    </div>
    <router-view/>
  </div>
</template>

<script>

import GlobalFilter from '@/components/GlobalFilter.vue';
import LocalFilter from '@/components/LocalFilter.vue';
import SampleFilter from '@/components/SampleFilter.vue';

export default {
  name: 'App',
  components: {
    GlobalFilter,
    LocalFilter,
    SampleFilter
  },
  data () {
    return {
      user: 'Sam',
      route: 'global',
      routePath: this.$route.name
    }
  },
  methods: {
  },
  computed: {
    getRoute: function(){
      return console.log(this.routePath);
    }
  }
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

.filterTab {
  float: left;
  width: 20rem;
  background-color: white;
  height: 49rem;
  padding: 20px;
  text-align: left;
}

.grey-back {
  background-color: #F8F8FF;
}
</style>
