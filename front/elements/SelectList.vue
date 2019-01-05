<template>
  <div class="form-group">
    <label class="form-label">
      <slot></slot>
    </label>
    <select
      class="form-select"
      v-bind:value="value"
      v-on:change="$emit('input', $event.target.value)"
    >
      <option v-for="(opt, i) in options" :key="i" v-bind:value="opt.id">{{opt.label}}</option>
    </select>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

interface Option {
  id: number
  label: string
}

export default Vue.extend({
  props: {
    value: [String, Number],
    options: { type: Array as () => Option[] }
  }
})
</script>

