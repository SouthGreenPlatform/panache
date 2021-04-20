<template>
  <div class="col-12 mb-1">
    <b-button
        block
        :class="visible ? null : 'collapsed'"
        :aria-expanded="visible ? 'true' : 'false'"
        aria-controls="collapse-4"
        @click="visible = !visible"
    >
      Optional upload
    </b-button>
    <b-collapse id="collapse-4" v-model="visible" class="mt-2">
      <slot></slot>
    </b-collapse>
  </div>
</template>

<script>

export default {
  data() {
    return {
      visible: false,
    }
  }
}

</script>

<style scoped>

</style>