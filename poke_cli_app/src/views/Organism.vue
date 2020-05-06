<template>
  <div>
    <organism-menu class="whiteBlock mx-auto shadow-lg pt-5 mt-5" />
  </div>
</template>

<script>

import OrganismMenu from '@/components/OrganismMenu.vue';

export default {
  name: 'organism',
  components: {
    OrganismMenu
  },
  data () {
    return {
    }
  },
  methods: {
  }
}

</script>

<style lang="scss">

.grey-back {
  background-color: #F8F8FF;
}

.whiteBlock {
  background-color: white;
  width: 70rem;
  height: 40rem;
  border-radius: 50px;
}
</style>
