<script lang="ts">
import Vue from 'vue'
import { router } from './router'

export { Containers as default }

const Containers = Vue.extend({
  props: ['containers'],
  updated() {
    console.log(this.containers)
  }
})

router.override([(i: string) => i === 'containers'], () => Containers)
</script>

<template>

</template>


<style scoped>

</style>


