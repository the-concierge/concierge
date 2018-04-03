<template>
  <a v-bind:class="className" v-on:click="nav" style="cursor: pointer">
    <slot></slot>
  </a>
</template>

<script lang="ts">
import Vue from 'vue'
import { navigate } from './common'

export default Vue.extend({
  props: ['url', 'className'],
  methods: {
    nav() {
      navigate(this.url)
    }
  }
})
</script>
