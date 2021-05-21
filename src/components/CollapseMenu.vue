<template>
  <div class="col-12 mb-1 grid">
    <div>
      <h6 class="mt-3 floatL"><slot name="title"></slot></h6>
      <b-button class="buttonC"
                v-show="conditionShowPlus"
                :size="'md'"
                :class="visible ? null : 'collapsed'"
                :aria-expanded="visible ? 'true' : 'false'"
                variant="light"
                v-bind:aria-controls="idCollapse"
                @click="switchVisible"
      >
        {{ visible ? "–" : '+' }}
      </b-button>
    </div>
    <slot name="outside"></slot>
    <b-collapse v-bind:id="idCollapse" v-model="visible">
      <slot name="inside" :visible="visible"></slot>
    </b-collapse>
  </div>
</template>

<script>

export default {
  name: "CollapseMenu",
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
      default: true,
    }
  },
  data() {
    return {
      visible: false,
    }
  },
  methods: {
    switchVisible() {
      this.visible = !this.visible;
      this.$emit("visibleStatus", this.visible);
    },
  },
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

.grid {
  display: grid;
}

</style>