<template>
  <div class="form-group">
    <label class="form-label">
      <slot></slot>
    </label>
    <input
      class="form-input"
      type="text"
      v-bind:value="value"
      v-on:input="$emit('input', $event.target.value)"
      :placeholder="placeholder"
    >
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: ['placeholder', 'value']
})
</script>

