<script lang="ts">
import Vue from 'vue'
import ContentArea from './ContentArea.vue'
import { AppState, getAll, getDockerResources, socket } from './api'
import { Container } from '../components/state/types'
import { setInterval } from 'timers'

export default Vue.extend({
  components: { ContentArea },
  data() {
    const state: AppState = {
      containers: [],
      images: [],
      hosts: [],
      credentials: [],
      applications: [],
      remotes: [],
      config: {
        name: '',
        conciergePort: 0,
        proxyHostname: '',
        debug: 0,
        statsBinSize: 0,
        statsRetentionDays: 0,
        dockerRegistry: '',
        registryCredentials: 0
      }
    }
    return { state }
  },
  async mounted() {
    const newState = await getAll(this.state)
    setInterval(async () => {
      const nextState = await getDockerResources(this.state)
      this.state = nextState
    }, 5000)
    this.state = newState

    socket.on('stats', (event: ConciergeEvent<ContainerEvent>) =>
      updateContainer(this.state.containers, event)
    )
  }
})

function updateContainer(
  containers: Container[],
  { event: stats }: ConciergeEvent<ContainerEvent>
) {
  const container = containers.find(c => c.Id === stats.id)
  if (!container) {
    return
  }

  container.stats.cpu = stats.cpu
  container.stats.memory = stats.memory
  container.stats.mbIn = stats.rx
  container.stats.mbOut = stats.tx
}
</script>

<template>
  <div>
    <ContentArea v-bind:state="state" />
  </div>
</template>

<style>
header {
  border-bottom: 2px solid #b2b8e5;
  padding-left: 10px;
  padding-right: 10px;
  margin-top: 5px;
  padding-top: 5px;
}

body {
  position: absolute;
  top: 0px;
  bottom: 20px;
  width: 100%;
}

.modal-container {
  min-width: 40vw;
}
</style>