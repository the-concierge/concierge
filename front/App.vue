<script lang="ts">
import Vue from 'vue'
import ContentArea from './ContentArea.vue'
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
      queue: { done: [], progress: [] },
      monitors: [],
      config: {
        name: '',
        conciergePort: 0,
        proxyHostname: '',
        debug: 0,
        statsBinSize: 0,
        statsRetentionDays: 0,
        dockerRegistry: '',
        registryCredentials: 0,
        maxConcurrentBuilds: 2,
        gitPollingIntervalSecs: 5
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

    api.socket.on('build', (event: ConciergeEvent<string>) => {
      updateMonitors(this.state.monitors, event)
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

        case 'config':
          this.state.config = await api.getConfig()
          return

        case 'queue':
          this.state.queue = await api.getQueue()
          return
      }
    })
  }
})

type ContainerEvt = ConciergeEvent<ContainerEvent>
type RemoteEvt = ConciergeEvent<BuildStatusEvent>
type MonitorEvt = ConciergeEvent<string>

function updateMonitors(monitors: api.Monitor[], event: MonitorEvt) {
  const monitor = monitors.find(mon => mon.id === event.name)
  if (!monitor) {
    monitors.push({ id: event.name, logs: [event.event] })
    return monitors
  }

  monitor.logs.push(event.event)
  return monitors
}

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
    <ContentArea v-bind:state="state"/>
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