<template>
  <div id="app">
    <global-filter class="filterTab"/>
    <b-navbar class="grey-back border-bottom mx-2" toggleable="lg" type="dark">
        <b-navbar-nav class="ml">
            <b-nav-form>
                <b-form-input size="sm" class="ml-sm-2" placeholder="Search"></b-form-input>
                <b-button size="sm" class="my-2 my-sm-0" type="submit">Search</b-button>
            </b-nav-form>
        </b-navbar-nav>
        <b-navbar-brand class="text-dark mx-auto">Title</b-navbar-brand>
    </b-navbar>
    <div id="nav">
      <router-link to="/">Global diversity</router-link> |
      <router-link :to="{ name: 'Local', params: { user: user } }">Local diversity</router-link>
    </div>
    <router-view/>
  </div>
</template>

<script>

import GlobalFilter from '@/components/GlobalFilter.vue'

export default {
  name: 'App',
  components: {
    GlobalFilter
  },
  data () {
    return {
      user: 'Sam'
    }
  },
  /*beforRouterEnter (to, from, next) {
    
    getPost(to.params.id, (post) => {
      next(vm => vm.setData( post))
    })
  },
  beforeRoutingEnter (to, from, next) {
    console.log(`Updating slug from ${from} to ${to}`)
    next() //make sure you always call next()
  },*/
  methods: {
    // setData (err, user) {
    //   this.user = user;
    // }
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
