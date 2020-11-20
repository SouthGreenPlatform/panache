<template>
    <div class="barChart">
        <img class="logo" alt="Vue logo" src="../assets/logo.png">
        <hr class="greyBar"/>
        <h3 class="policeTitre">Choose your organism</h3>
        <div class="input-group md-form form-sm form-2 px-5">
            <input class="form-control my-0 py-1 red-border" type="text" placeholder="Search" aria-label="Search">
            <div class="input-group-append">
                <span class="input-group-text red lighten-3" id="basic-text1"><i class="fas fa-search text-grey"
                    aria-hidden="true"></i></span>
            </div>
        </div>
        <h3 class="policeTitre mt-5">Bookmarks</h3>
        <!-- Menu des organism de la première page, on définit image, titre et lien -->
        <div class="mt-5">
            <figure class="item">
                <img class="organismImage" src="../assets/helianthusAnnuus.jpg" alt="">
                <figcaption class="caption">Heliantus Annuus</figcaption>
            </figure>
            <figure class="item">
                <img class="organismImage" src="../assets/zeaMays.jpg" alt=""  @click="onImageClick">
                <figcaption class="caption">Zea Mays</figcaption>
            </figure>
            <figure class="item">
                <img class="organismImage" src="../assets/brassicaNapus.jpg" alt="">
                <figcaption class="caption">Brassica Napus</figcaption>
            </figure>
            <figure class="item">
                <img class="organismImage" src="../assets/oryzaSativia.jpg" alt="">
                <figcaption class="caption">Oryza Sativia</figcaption>
            </figure>
            <figure class="item">
                <img class="organismImage" src="../assets/capsicumAnnuum.jpg" alt="">
                <figcaption class="caption">Capsicum Annuum</figcaption>
            </figure>
        </div>
    </div>
</template>

<script>
//import * as d3 from "d3";

export default {
  name: 'OrgansimMenu',
  props: ['tweetData'],
  mounted() {
    
  },
  methods: {
    // Exemple de onClick fonction à définir pour la future version du menu
    onImageClick() {
    this.$router.push({
        name: 'PCA'
    });
    }
  },  

  computed: {
      
  }
};
</script>

<style lang="scss">
.bar{
    fill: steelblue;
}
.greyBar {
    color: grey;
    width: 20rem;
}
.logo {
    display:block;
    margin-left: auto;
    margin-right: auto;
}
.policeTitre {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-weight: bold;
  color: #002B59;
}
img.organismImage {
    height: 8rem;
    width: 10rem;
    border-radius: 20px;
    cursor: pointer;
}
.caption {
    display: block;
    margin-left: 2.5rem;
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #002B59;
}
figure.item {
    vertical-align: top;
    display: inline-block;
    text-align: center;
    width: 120px;
    margin-right: 4rem;
}
</style>