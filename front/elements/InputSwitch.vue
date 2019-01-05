<template>
  <div class="form-group">
    <label class="form-switch">
      <input
        class="form-input"
        type="checkbox"
        v-bind:checked="value"
        v-on:change="$emit('input', !!$event.target.checked)"
        :placeholder="placeholder"
      >
      <i class="form-icon"></i>
      <slot></slot>
    </label>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: ['placeholder', 'value']
})
</script>

