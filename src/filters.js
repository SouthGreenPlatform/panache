import Vue from 'vue'

Vue.filter('numberFormat', (value, lang = 'fr-FR') => {
    return new Intl.NumberFormat(lang).format(value);
});