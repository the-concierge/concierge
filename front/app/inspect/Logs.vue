<template>
  <div>
    <h3 v-if="logs.length === 0">No logs are available to display</h3>

    <!-- ko if: logs().length > 0 -->
    <div v-for="(l, i) of logs" :key="i">
      <pre style="white-space: pre-wrap; margin-bottom: 5px; display: block">{{l}}</pre>
    </div>
    <!-- /ko -->
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Container } from '../api'

export default Vue.extend({
  props: {
    container: { type: Object as () => Container }
  },
  data() {
    return {
      logs: [] as string[],
      tail: 50
    }
  },
  mounted() {
    this.getLogs()
    console.log(this.container)
  },
  methods: {
    async getLogs() {
      const result = await fetch(
        `/api/containers/${this.container.Id.slice(0, 10)}/logs/${
          this.container.concierge.hostId
        }?tail=${this.tail}`
      )
      if (result.status >= 400) {
        // state.toast.error(`Failed to retrieve container logs: ${result.statusText}`)
        return
      }

      const logs: string[] = await result.json()
      const flattenedLogs = logs
        .reduce((prev, entry) => prev.concat(entry.split('\n')), [] as string[])
        .filter(line => !!line.trim())

      this.logs = flattenedLogs
    }
  }
})
</script>
