import '@babel/polyfill'
import 'mutationobserver-shim'

import Vue from 'vue'
import './plugins/bootstrap-vue'
import App from './App.vue'

Vue.config.productionTip = false

/*const globalDiversity = { template: '<global-graph class="graph" :tweetData=loadData />' };
const localDiversity = { template: '<local-graph class="graph" :tweetData=loadData />' };

const routes = [
  { path: '/globalDiversity', component: GlobalDiversity },
  { path: '/localDiversity', component: LocalDiversity }
];

const router = new VueRouter({
  routes
});*/

new Vue({
  render: h => h(App),
}).$mount('#app')
