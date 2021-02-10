<template>
  <div class="custom-file">
    <input
        class='custom-file-input form-control-sm'
        :id="`fileSelector_${idBonus}`"
        type='file'
        @change="emitDataURL"
    />
    <label class="custom-file-label col-form-label-sm" :for="`fileSelector_${idBonus}`">
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

export default {
  name: 'FileLoader',
  props: {
    labelToDisplay: {
      type: String,
      default: 'File to load'
    },
    idBonus: {
      type: String,
    }
  },
  data() {
    return {
      fileName: null,
    }
  },
  methods: {
    //Adapted from https://developer.mozilla.org/en-US/docs/Web/API/File/Using_files_from_web_applications#Using_object_URLs
    emitDataURL: function(event) {

      if (event.target.files.length > 0) {

        let loadedFile = event.target.files[0];
        console.log({loadedFile});
        console.log(typeof loadedFile);

        if (typeof loadedFile != 'undefined') {
          this.fileName = loadedFile.name;
          console.log(`File ${loadedFile.name} loaded from computer.`);

          //Turn file into accessible data URL
          //let dataURL = window.URL.createObjectURL(loadedFile);

          //this.$emit('file-loaded', { dataURL } )

          //TODO: update file loader to work directly with file objects, not the dataURL
          //this.$store.dispatch('setIsLoading', true);
          console.log(loadedFile);
          this.$emit('file-loaded', loadedFile )
        }
      }
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

</style>
