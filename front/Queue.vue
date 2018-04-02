<template>
  <table class="table table-striped table-hover">
    <thead>
      <tr>
        <th>App</th>
        <th>Ref</th>
        <th>SHA</th>
        <th>Status</th>
      </tr>
    </thead>

    <tbody>
      <tr v-for="(item, i) in queue.progress" :key="item.sha">
        <td>{{item.app.name}}</td>
        <td>{{item.ref}}</td>
        <td>{{item.sha.slice(0, 10)}}</td>
        <td>
          <span v-bind:class="toStatusClass(item.stateId)" class="label label-rounded">{{ item.state }}</span>
        </td>
      </tr>

      <tr v-if="queue.done.length > 0">
        <td colspan="4">
          <strong>Completed Builds</strong>
        </td>
      </tr>

      <tr v-for="(item, i) in queue.done" :key="item.sha">
        <td>{{item.app.name}}</td>
        <td>{{item.ref}}</td>
        <td>{{item.sha.slice(0, 10)}}</td>
        <td>
          <span v-bind:class="toStatusClass(item.stateId)" class="label label-rounded">{{ item.state }}</span>
        </td>
      </tr>

    </tbody>
  </table>
</template>

<script lang="ts">
import Vue from 'vue'
import { refresh } from './common'
import { Queue, State } from './api'

export default Vue.extend({
  props: {
    queue: { type: Object as () => Queue }
  },
  methods: {
    toStatusClass(state: State) {
      switch (state) {
        case State.Deleted:
          return ''
        case State.Building:
          return 'label-warning'
        case State.Failed:
          return 'label-error'
        case State.Inactive:
          return 'label-secondary'
        case State.Successful:
          return 'label-success'
        default:
          return 'label-primary'
      }
    }
  },
  mounted() {
    setInterval(() => refresh.queue(), 2500)
  }
})
</script>

