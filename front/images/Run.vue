<template>
  <div class="modal" v-if="modalActive" v-bind:class="{ active: modalActive }">
    <div class="modal-overlay" v-on:click="hideModal"></div>
    <div class="modal-container">
      <div class="modal-header">
        <button class="btn btn-clear float-right" v-on:click="hideModal"></button>
        <div class="modal-title">
          <strong>Image:</strong>
          <span>{{ image.name }}</span>
        </div>
      </div>
      <div class="modal-body" style="max-height: 80vh">
        <div class="content">
          <form v-on:submit.prevent>
            <div class="form-group">
              <label class="form-label">Name</label>
              <input v-model="name" class="form-input" type="text" placeholder="[Optional] Vanity name..." />
            </div>

            <div class="divider"></div>
            <strong>Links</strong>

            <div v-if="linkableContainers.length > 0" class="input-group" style="margin-bottom: 10px">
              <select v-model="selectedContainerLink" class="form-select">
                <option v-for="(c, i) in linkableContainers" :key="i" v-bind:value="c.name">
                  {{c.label}}
                </option>
              </select>

              <button class="btn btn-md" v-on:click="addContainerLink">Add</button>

              <div v-for="(l, i) in links" :key="i">
                <div class="input-group" style="margin-bottom: 10px">
                  <span class="input-group-addon">{{l.containerName}}</span>
                  <input type="text" class="form-input" v-model="l.alias" placeholder="[Required] Link alias..." />
                  <button class="btn btn-md" v-on:click="removeContainerLink(l)">Remove</button>
                </div>
              </div>
            </div>

            <div v-if="ports.length > 0">
              <div class="divider"></div>
              <strong>Expose Ports:</strong>

              <div v-if="ports.length > 1" class="form-horizontal">
                <div class="form-group">
                  <label class="form-switch">
                    <input v-model="exposeAll" type="checkbox" />
                    <i v-on:click="toggleAllPorts" class="form-icon"></i>
                  </label>
                  <div class="input-group">
                    <button v-on:click="copyAllPorts" class="btn btn-md input-group-btn">Copy Ports</button>
                  </div>
                </div>
              </div>

              <div class="form-horizontal" v-for="(port, i) in ports" :key="i">
                <div class="form-group">
                  <label class="form-switch">
                    <input type="checkbox" v-model="port.expose" />
                    <i class="form-icon" v-on:click="port.expose = !port.expose"></i>
                  </label>
                  <div class="input-group">
                    <button class="btn btn-md input-group-btn" v-on:click="copyPort(port)">{{port.port}}/{{port.type}}</button>
                    <input type="text" class="form-input" v-model="port.hostPort" placeholder="Host Port" />
                  </div>
                </div>
              </div>
            </div>

            <div class="divider"></div>
            <strong>Custom Volumes:</strong>
            <div class="input-group" style="margin-bottom: 10px">
              <input v-model="newCustomVolume" type="text" class="form-input" placeholder="Container Path" />
              <button v-on:click="addCustomVolume" class="btn btn-md">Add</button>
            </div>

            <div v-for="(cv, i) in customVolumes" :key="i" class="input-group" style="margin-bottom: 10px">
              <span class="input-group-addon">{{cv.path}}</span>
              <input v-model="cv.hostPath" type="text" class="form-input" placeholder="Host Path..." />
              <button v-on:click="removeCustomVolume(cv)" class="btn btn-md">Remove</button>
            </div>

            <div v-if="volumes.length > 0">
              <div class="divider"></div>
              <strong>Volumes:</strong>

              <div v-for="(v, i) in volumes" :key="i" class="form-group">
                <label class="form-label">{{v.path}}</label>
                <input v-model="v.hostPath" class="form-input" type="text" placeholder="Host path mount" />
              </div>
            </div>

            <div class="divider"></div>
            <strong>Custom Environment Variables:</strong>
            <div class="input-group" style="margin-bottom: 10px">
              <input v-model="newCustomVariableName" type="text" class="form-input" placeholder="Variable name" />
              <button v-on:click="addCustomVariable" class="btn btn-md">Add</button>
            </div>

            <div v-for="(ce, i) in customEnvs" :key="i" class="input-group" style="margin-bottom: 10px">
              <span class="input-group-addon">{{ce.key}}</span>
              <input v-model="ce.value" type="text" class="form-input" />
              <button v-on:click="removeCustomVariable(ce)" class="btn btn-md">Remove</button>
            </div>

            <div v-if="envs.length > 0">
              <div class="divider"></div>
              <strong>Environment Variables:</strong>

              <div v-for="(e, i) in envs" :key="i" class="input-group" style="margin-bottom: 10px">
                <span class="input-group-addon">{{e.key}}</span>
                <input v-model="e.value" type="text" class="form-input" />
              </div>
            </div>

          </form>
        </div>

      </div>
      <div class="modal-footer">
        <button v-on:click="hideModal" class="btn btn-md">Cancel</button>
        <button v-on:click="runContainer" :disabled="!canRunContainer" class="btn btn-md">Run</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Image, Container } from '../api'
import { ImageInspectInfo } from 'dockerode'
import { createEmitter } from '../common'

export default Vue.extend({
  props: {
    containers: { type: Array as () => Container[] }
  },
  data() {
    return {
      ...baseData,
      modalActive: false,
      loading: false
    }
  },
  methods: {
    hideModal() {
      this.modalActive = false
      this.loading = false
    },
    addCustomVolume() {
      if (!this.newCustomVolume) {
        return
      }
      this.customVolumes.push({ path: this.newCustomVolume, hostPath: '' })
      this.newCustomVolume = ''
    },
    addCustomVariable() {
      if (!this.newCustomVariableName) {
        return
      }
      this.customEnvs.push({ key: this.newCustomVariableName, value: '' })
      this.newCustomVariableName = ''
    },
    removeCustomVolume(_volume: Volume) {},
    removeCustomVariable(_env: Env) {},
    addContainerLink(_container: Container) {},
    removeContainerLink(_container: Container) {},
    runContainer() {},
    toggleAllPorts() {
      const to = !this.exposeAll
      this.exposeAll = to
      for (const port of this.ports) {
        port.expose = to
      }
    },
    copyAllPorts() {
      for (const port of this.ports) {
        port.hostPort = port.port.toString()
      }
    }
  },
  watch: {
    links: function(links: Link[]) {
      this.linkableContainers = getLinkableContainers(links, this.containers)
      this.selectedContainerLink = this.linkableContainers[0] || { name: '', label: '', image: '' }
    }
  },
  computed: {
    canRunContainer: function(): boolean {
      return true
    }
  },
  mounted() {
    emitter.on(async img => {
      this.image = img
      this.modalActive = true
      this.loading = true
      this.newCustomVariableName = ''
      this.newCustomVolume = ''
      this.name = ''
      this.exposeAll = false

      const info = await getInfo(img)

      this.links = []
      this.customVolumes = []
      this.customEnvs = []
      this.ports = getPorts(info)
      this.envs = getEnvs(info)
      this.volumes = getVolumes(info)
      this.selectedContainerLink = { name: '', label: '', image: '' }

      this.loading = false
    })
  }
})

const baseData = {
  image: {} as Image,
  exposeAll: false,
  selectedContainerLink: { name: '', label: '', image: '' },
  newCustomVolume: '',
  newCustomVariableName: '',
  name: '',
  ports: [] as Port[],
  envs: [] as Env[],
  volumes: [] as Volume[],
  links: [] as Link[],
  customVolumes: [] as Volume[],
  customEnvs: [] as Env[],
  linkableContainers: [] as Linkable[]
}

async function getInfo(img: Image) {
  const info: ImageInspectInfo = await fetch(
    `/api/images/${img.Id}/inspect/${img.concierge.hostId}`
  ).then(res => res.json())
  return info
}

type Port = { port: number; type: string; expose: boolean; hostPort: string }
type Volume = { path: string; hostPath: string }
type Env = { key: string; value: string }
type Link = { containerName: string; alias: string }
type Linkable = { name: string; image: string; label: string }
function getPorts(info: ImageInspectInfo): Port[] {
  if (!info.Config.ExposedPorts) {
    return []
  }

  const ports = Object.keys(info.Config.ExposedPorts)
    .map(port => {
      const split = port.split('/')
      return { port: split[0], type: split[1] }
    })
    .map(port => ({
      port: Number(port.port),
      type: port.type,
      expose: false,
      hostPort: ''
    }))

  return ports
}

function getEnvs(info: ImageInspectInfo): Env[] {
  const envs = info.Config.Env.map(env => {
    const split = env.split('=')
    const pair = { key: split[0], value: split.slice(1).join('=') }
    return pair
  })

  return envs
}

function getVolumes(info: ImageInspectInfo): Volume[] {
  if (!info.Config.Volumes) {
    return []
  }

  const volumes = Object.keys(info.Config.Volumes).map(path => ({
    path,
    hostPath: ''
  }))

  return volumes
}

function getLinkableContainers(links: Link[], containers: Container[]): Linkable[] {
  return containers
    .filter(c => {
      const isRunning = c.State === 'running'
      const isNotLinked = links.every(link => link.containerName !== c.Names[0])
      return isRunning && isNotLinked
    })
    .map(c => ({
      name: c.Names[0].slice(1),
      image: c.Image,
      label: `[${c.Image.slice(0, 20)}] ${c.Names[0].slice(1)}`
    }))
}

const emitter = createEmitter<Image>()
export function showModal(img: Image) {
  emitter.emit(img)
}
</script>
