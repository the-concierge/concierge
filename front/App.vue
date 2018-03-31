<script lang="ts">
import Vue from 'vue'
import ContentArea from './ContentArea.vue'
import { setInterval } from 'timers'
import * as api from './api'
import { onRefresh } from './common'

export default Vue.extend({
  components: { ContentArea },
  data() {
    const state: api.AppState = {
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
    const newState = await api.getAll(this.state)
    setInterval(async () => {
      const nextState = await api.getDockerResources(this.state)
      this.state = nextState
    }, 5000)
    this.state = newState

    api.socket.on('stats', (event: ContainerEvt) => updateContainer(this.state.containers, event))

    api.socket.on('build-status', (event: RemoteEvt) => {
      updateRemotes(this.state.remotes, event)
    })

    onRefresh(async res => {
      switch (res) {
        case 'containers':
          this.state.containers = await api.getContainers(this.state.containers)
          return

        case 'hosts':
          this.state.hosts = await api.getHosts(this.state.hosts)
          return

        case 'applications':
          this.state.applications = await api.getApplications(this.state.applications)
          return

        case 'images':
          this.state.images = await api.getImages(this.state.images)
          return

        case 'credentials':
          this.state.credentials = await api.getCredentials(this.state.credentials)
          return
      }
    })
  }
})

type ContainerEvt = ConciergeEvent<ContainerEvent>

function updateContainer(containers: api.Container[], { event: stats }: ContainerEvt) {
  const container = containers.find(c => c.Id === stats.id)
  if (!container) {
    return
  }

  container.stats.cpu = stats.cpu
  container.stats.memory = stats.memory
  container.stats.mbIn = stats.rx
  container.stats.mbOut = stats.tx
}

type RemoteEvt = ConciergeEvent<BuildStatusEvent>
function updateRemotes(remotes: api.Remote[], { event }: RemoteEvt) {
  const existing = remotes.find(
    remote => remote.applicationId === event.applicationId && remote.remote === event.remote
  )

  if (existing) {
    const imageId = event.imageId || existing.imageId
    existing.imageId = imageId
    existing.sha = event.sha
    existing.state = event.state

    return remotes
  }

  remotes.push({
    id: 0,
    ...event,
    imageId: event.imageId || ''
  })
  return remotes
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