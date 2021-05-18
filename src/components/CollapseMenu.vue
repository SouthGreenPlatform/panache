<template>
  <div class="col-12 mb-1">
    <div>
      <h6 class="mt-3 floatL"><slot name="title"></slot></h6>
      <b-button class="buttonC"
                v-show="conditionShowPlus"
                :size="'md'"
                :class="visible ? null : 'collapsed'"
                :aria-expanded="visible ? 'true' : 'false'"
                variant="light"
                v-bind:aria-controls="idCollapse"
                @click="visible = !visible"
      >
        {{ visible ? "–" : '+' }}
      </b-button>
    </div>
    <slot name="outside"></slot>
    <b-collapse v-bind:id="idCollapse" v-model="visible">
      <slot name="inside"></slot>
    </b-collapse>
  </div>
</template>

<script>

export default {
  props: {
    buttonText: {
      type: String,
      default: "+",
    },
    idCollapse: {
      type: String,
      required: true,
    },
    conditionShowPlus: {
    }
  },
  data() {
    return {
      visible: false,
    }
  }
}

</script>

<style scoped>
.buttonC {
  padding: 0px !important;
  float: right;
  width: 28px;
  height: 28px;
  margin-top: 8px;
  color: #495057;
  background-color: #e9ecef;
  border: 1px solid #ced4da;
}
.floatL {
  float: left;
}
#collapse {
  margin-top: 0;
}
</style>