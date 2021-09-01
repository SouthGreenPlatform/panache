<template>
  <div>
    <b-button id="newickTreeDisplayButton" size="sm" class="buttonPanache" :class="isNewickTreeDisplayed ? 'newickDisplayed' : null" block variant="light" @click="displayNewickTree">{{ displayed ? "Hide newick tree" : "Display newick tree" }}</b-button>
  </div>
</template>

<script>
import {mapActions, mapState} from "vuex";
  import treeLib from '@/plugins/treelib';

  export default {
    name: "NewickTree",
    props: {
    },
    data() {
      return {
        displayed: false,
        treeWidth: 30,
        groupSave: {
          type: Array,
          default: [],
        },
      }
    },
    computed: {
      ...mapState({
        newickTreeDataString: 'newickTreeDataString',
        genomeList: 'genomeListInDisplay',
        blockOffset: 'yOffsetOfPavBlocks',
        isNewickTreeDisplayed: 'isNewickTreeDisplayed',
      }),
    },
    methods: {
      ...mapActions([
          'updateIsNewickTreeDisplayed',
      ]),
      /**
       * Function that switch the data named displayed.
       */
      updateDisplayed() {
        this.displayed = !this.displayed;
        this.updateIsNewickTreeDisplayed();
      },
      /**
       * Function that display or hide the Newick tree in function of its current state of display.
       */
      displayNewickTree() {
        this.updateDisplayed(); // Switch the data named displayed
        let groupLegendSVG = document.getElementById("genomeLegend"); // Get the genomeLegend group
        if (this.displayed) { // If the tree should be displayed (true)
          this.groupSave = [...groupLegendSVG.childNodes]; // Save the current content of genomeLegend into groupSave
          groupLegendSVG.innerHTML = ""; // Empty genomeLegend
          this.showNewickTree(this.newickTreeDataString); // Build Newick tree with the string in argument and show it
        } else { // If the tree should be hidden (false)
          groupLegendSVG.innerHTML = ""; // Empty genomeLegend
          for (let i = 0; i < this.groupSave.length; i++) {
            groupLegendSVG.appendChild(this.groupSave[i]) // Put HTML elements saved from groupSave to genomeLegend
          }
        }
      },
      /**
       * Method that use the library treeLib to parse a string and create a SVG phylogenetic tree with it.
       * @param newickTreeDataString = a sting imported from the Newick file uploaded.
       */
      showNewickTree(newickTreeDataString) {
        let t = new treeLib.Tree(); // Create a Tree object from the library treelib
        let newick = newickTreeDataString;
        newick = newick.trim(newick); // Purify string
        t.Parse(newick); // Parse the string with tree function ob the lib

        if (t.error === 0) { // If there is no error proceed to continue
          t.ComputeWeights(t.root);
          let td = new treeLib.TreeDrawer();
          let group = document.getElementById('genomeLegend');

          // Clear existing diagram or HTML elements from genomeLegend
          while (group.hasChildNodes()) {
            group.removeChild(group.lastChild);
          }

          // Update of the linear gradient width
          let newLinearGradient = this.groupSave[0].cloneNode(true);
          newLinearGradient.setAttribute('width', (this.treeWidth + 50).toString());
          group.appendChild(newLinearGradient);

          // Initialise the tree with parameters and draw it
          td.Init(t, {
            svg_id: 'genomeLegend',
            width: this.treeWidth,
            height: (14 * (this.genomeList.length - 1)),
            fontHeight: 10,
            root_length: 0.1
          });
          td.CalcCoordinates(); // Calculate coordinates of paths and texts
          td.Draw();  // Draw the tree

          // Draw the name of all the genomes on the leaves of the tree
          let n = new treeLib.NodeIterator(t.root);
          let q = n.Begin();
          while (q != null) { // Explore the nodes of the tree
            if (q.IsLeaf()) { // If the node is a leaf
              treeLib.drawText('genomeLegend', q.xy, q.label);
            }
            q = n.Next(); // Check next node
          }

          // Scale to fit window
          let bbox = group.getBBox();

          // Move drawing to center of genomeLegend
          let viewport = document.getElementById('genomeLegend');
          bbox = group.getBBox();
          if (bbox.x < 0) {
            viewport.setAttribute('transform', 'translate(' + -bbox.x + ' ' + -bbox.y + ')');
          }
        }
      },
    }
  }
</script>

<style scoped>

.buttonNT {
  color: #495057;
  background-color: #e9ecef;
  border: 1px solid #ced4da;
}

.newickDisplayed {
  box-shadow: 0 0 5px 2px rgba(255, 0, 0, 0.67);
}

.newickDisplayedPulse {
  cursor: pointer;
  -webkit-animation: pulse 1.25s infinite cubic-bezier(0.66, 0, 0, 1);
  -moz-animation: pulse 1.25s infinite cubic-bezier(0.66, 0, 0, 1);
  -ms-animation: pulse 1.25s infinite cubic-bezier(0.66, 0, 0, 1);
  animation: pulse 1.25s infinite cubic-bezier(0.66, 0, 0, 1);
}

.newickDisplayedPulse:hover {
  -webkit-animation: none;
  -moz-animation: none;
  -ms-animation: none;
  animation: none;
}

@-webkit-keyframes pulse {to {box-shadow: 0 0 0 45px rgba(232, 76, 61, 0);}}
@-moz-keyframes pulse {to {box-shadow: 0 0 0 45px rgba(232, 76, 61, 0);}}
@-ms-keyframes pulse {to {box-shadow: 0 0 0 45px rgba(232, 76, 61, 0);}}
@keyframes pulse {to {box-shadow: 0 0 0 45px rgba(232, 76, 61, 0);}}

</style>