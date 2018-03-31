<template>
  <div>
    <div class="container">
      <div class="columns">
        <div class="col-2">
          <button class="btn btn-md" v-on:click="showCreateModal">Create</button>
          <button class="btn btn-md" v-on:click="refresh">Refresh</button>
        </div>

        <div class="col-10">
        </div>
      </div>
    </div>

    <table class="table" style="table-layout: fixed">
      <thead>
        <tr>
          <th>Name</th>
          <th>Label</th>
          <th>Repository</th>
          <th>Dockerfile</th>
          <th></th>
        </tr>
      </thead>
      <tbody v-for="app in apps" v-bind:key="app.id">
        <tr class="active">
          <td v-on:click="toggleDisplay(app)" style="cursor: pointer">
            <span v-if="!app.display">▶</span>
            <span v-if="app.display">▼</span>
            <span>{{ app.name }}</span>
            <span v-if="!app.display && app.remotes.length > 0" style="color: #999; float: right">{{ app.images.length }} hidden</span>
          </td>
          <td v-on:click="toggleDisplay(app)" style="cursor: pointer"></td>
          <td v-on:click="toggleDisplay(app)" style="cursor: pointer"></td>
          <td v-on:click="toggleDisplay(app)" style="cursor: pointer"></td>
          <td>
            <button class="btn btn-md" v-on:click="showBuildModal(app)">Build</button>
            <button class="btn btn-md" v-on:click="showEditModal">Edit</button>
            <button class="btn btn-md" v-on:click="removeApplication">Remove</button>
            <button class="btn btn-md" v-on:click="showLogsModal">Logs</button>
          </td>
        </tr>

        <tr v-if="app.display">
          <td colspan="4">

            <table v-if="app.remotes.length > 0" class="table" style="table-layout: fixed">
              <thead>
                <tr>
                  <td style="padding: 3px">
                    <b>Branch</b>
                  </td>
                  <td style="padding: 3px">
                    <b>SHA</b>
                  </td>
                  <td style="padding: 3px">
                    <b>Image ID</b>
                  </td>
                  <td style="padding: 3px">
                    <b>Status</b>
                  </td>
                  <td style="padding: 3px"></td>
                </tr>
              </thead>

              <tbody v-for="(r, i) in app.remotes" v-bind:key="i">
                <tr v-if="app.display">
                  <td style="padding: 3px">{{ r.remote }}</td>
                  <td style="padding: 3px">{{r.sha.slice(0, 10) }}</td>
                  <td style="padding: 3px">{{ cleanSha(r.imageId) }}</td>
                  <td style="padding: 3px">
                    <span v-bind:class="toStatusClass(r.state)" class="label label-rounded">{{ toStatus(r.state) }}</span>
                  </td>
                  <td style="padding: 3px">
                    <button class="btn btn-sm" :disabled="r.state !== 2" v-on:click="rebuildBranch(app, r)">Re-Build</button>
                    <button class="btn btn-sm" :disabled="r.imageId.length === 0" v-on:click="runImage(r.image)">Run</button>
                    <button class="btn btn-sm" v-on:click="removeImage(r.image)">Remove Image</button>
                  </td>
                </tr>
              </tbody>
            </table>

          </td>
        </tr>

      </tbody>
    </table>

    <Create v-bind:credentials="credentials" />
    <Build />

  </div>
</template>


<script lang="ts">
import Vue from 'vue'
import { Application, Image, Remote, Credential } from './api'
import { State } from '../../src/api/applications/types'
import Create, { showModal as showCreate } from './applications/Create.vue'
import Build, { showModal as showBuild } from './applications/Build.vue'
import { toImageTag } from './applications/Build.vue'
import { toast, refresh } from './common'

interface AppVM extends Application {
  images: Image[]
  remotes: Remote[]
  display: boolean
}

export default Vue.extend({
  components: { Create, Build },
  props: {
    applications: { type: Array as () => Application[] },
    credentials: { type: Array as () => Credential[] },
    images: { type: Array as () => Image[] },
    remotes: { type: Array as () => Remote[] }
  },
  data() {
    return {
      apps: this.applications.map(app => toAppVM(app, [], this.images, this.remotes)) as AppVM[]
    }
  },
  watch: {
    applications: function(apps: Application[]) {
      this.apps = apps.map(app => toAppVM(app, this.apps, this.images, this.remotes))
    }
  },
  methods: {
    refresh() {
      return refresh.applications()
    },
    showCreateModal() {
      showCreate()
    },
    showBuildModal(app: Application) {
      showBuild(app)
    },
    showEditModal() {},
    showLogsModal() {},

    async rebuildBranch(app: AppVM, remote: Remote) {
      const tag = toImageTag(app.label, remote.remote)
      const url = `/api/applications/${app.id}/build?ref=${
        remote.remote
      }&tag=${tag}&type=branch&sha=${remote.sha}`
      const result = await fetch(url, { method: 'PUT' })
      const json = await result.json()
      if (result.status <= 400) {
        toast.success(json.message)
        return
      }

      toast.error(`Failed to queue build: ${json.message}`)
    },
    removeApplication(app: AppVM) {
      return fetch(`/api/applications/${app.id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(res => toast.primary(res.message))
    },
    toggleDisplay(app: AppVM) {
      app.display = !app.display
    },
    cleanSha(sha: string) {
      return (sha || '').replace('sha256:', '').slice(0, 10)
    },
    toStatus(state: State) {
      switch (state) {
        case State.Deleted:
          return 'deleted'
        case State.Building:
          return 'building'
        case State.Failed:
          return 'failed'
        case State.Inactive:
          return 'inactive'
        case State.Successful:
          return 'success'
        default:
          return 'waiting'
      }
    },
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
  }
})

function toAppVM(
  app: Application,
  existingApps: AppVM[],
  allImages: Image[],
  allRemotes: Remote[]
) {
  const existing = existingApps.find(a => a.id === app.id)
  const images = allImages.filter(i => i.name.indexOf(app.label) === 0)
  const remotes = allRemotes
    .filter(r => r.applicationId === app.id && r.state !== 4)
    .filter(r => r.state !== State.Inactive)

  return {
    ...app,
    display: existing ? existing.display : true,
    images,
    remotes
  }
}
</script>

