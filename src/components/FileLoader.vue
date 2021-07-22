<template>
  <div class="custom-file">
    <input
        class='custom-file-input form-control-sm'
        :disabled="isNewickTreeDisplayed"
        :id="`fileSelector_${idBonus}`"
        type='file'
        @change="checkExtensionFile"
    />
    <label class="ellipsis custom-file-label col-form-label-sm" :for="`fileSelector_${idBonus}`">
      {{fileName || labelToDisplay}}
    </label>
  </div>

<!--  <div class="wrapperFileLoader">-->

<!--    <label class="loaderLabel" :for="`fileSelector_${idBonus}`">{{labelToDisplay}}: </label>-->

<!--    <input-->
<!--      class='loaderInput'-->
<!--      :id="`fileSelector_${idBonus}`"-->
<!--      type='file'-->
<!--      @change="emitDataURL"-->
<!--    />-->

<!--  </div>-->
</template>

<script>
//import * as d3 from "d3";

import {mapState} from "vuex";

export default {
  name: 'FileLoader',
  props: {
    labelToDisplay: {
      type: String,
      default: 'File to load'
    },
    idBonus: {
      type: String,
    },
    allowedExtensions: {
      type: Array,
    }
  },
  computed: {
    ...mapState({
      isNewickTreeDisplayed: 'isNewickTreeDisplayed',
    }),
  },
  data() {
    return {
      fileName: null,
    }
  },
  methods: {
    checkExtensionFile: function(event) {
      if (event.target.files.length > 0) {
        let loadedFile = event.target.files[0];
        console.log({loadedFile});
        console.log(typeof loadedFile);
        if (typeof loadedFile !== 'undefined') {
          if (this.allowedExtensions !== undefined) {
            let fileExtension = loadedFile.name.split('.').pop();
            if (this.allowedExtensions.includes(fileExtension)) {
              this.emitDataURL(loadedFile);
            } else {
              alert("ERROR : Bad file extension.\nThe right extension is : " + this.allowedExtensions);
            }
          } else { this.emitDataURL(loadedFile) }
        }
      }
    },
    emitDataURL: function(loadedFile) {
      let nbMaxChar = 23;
      if (loadedFile.name.length > nbMaxChar) {
        this.fileName = loadedFile.name.slice(0, nbMaxChar) + "...";
      } else {
        this.fileName = loadedFile.name;
      }
      console.log(`File ${loadedFile.name} loaded from computer.`);
      console.log(loadedFile);
      this.$emit('file-loaded', loadedFile )
    },
  },
  watch: {
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.wrapperFileLoader {
  display: grid;
  grid-template-rows: repeat(2, auto);
  overflow: hidden;
}

.loaderLabel {
  grid-row: 1;
  text-align: center;
  align-self: center;
  margin-bottom: 0;
}

.loaderInput {
  grid-row: 2;
  align-self: center;
}

.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
}

</style>
