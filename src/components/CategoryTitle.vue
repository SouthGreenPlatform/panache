<template>
  <div class="row">
    <div class="col-12">
      <h6 class="mt-3">{{ title }}</h6>
    </div>
  </div>
</template>

<script>

export default {
  props: {
    title: {
      type: String,
      default: "Default title",
      require: true,
    },
  },
}

</script>
