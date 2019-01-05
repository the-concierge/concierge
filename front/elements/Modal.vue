<template>
  <div v-bind:class="{ active: value }" v-if="value" class="modal">
    <div class="modal-overlay" v-on:click="onHide"></div>
    <div class="modal-container">
      <div class="modal-header">
        <button class="btn btn-clear float-right" v-on:click="onHide"></button>
        <slot name="header"></slot>
      </div>
      <div class="modal-body">
        <div class="content">
          <slot name="content"></slot>
          <slot></slot>
        </div>
      </div>
      <div class="modal-footer">
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    value: [Boolean, String],
    onHide: { type: Function as () => void }
  }
})
</script>
