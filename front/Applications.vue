<script lang="ts">
import Vue from 'vue'
import { Application, Image, Remote, Credential, State, Container } from './api'
import Run, { showModal as showRun } from './images/Run.vue'
import Edit, { showModal as showEdit } from './applications/Edit.vue'
import Create, { showModal as showCreate } from './applications/Create.vue'
import Build, { showModal as showBuild } from './applications/Build.vue'
import Logs, { showModal as showLogs } from './applications/Logs.vue'
import { toImageTag } from './applications/Build.vue'
import { toast, refresh } from './common'

interface AppVM extends Application {
  images: Image[]
  remotes: Remote[]
  display: boolean
}

export default Vue.extend({
  components: { Create, Build, Run, Edit, Logs },
  props: {
    applications: { type: Array as () => Application[] },
    credentials: { type: Array as () => Credential[] },
    images: { type: Array as () => Image[] },
    remotes: { type: Array as () => Remote[] },
    containers: { type: Array as () => Container[] }
  },
  data() {
    return {
      apps: this.applications.map(app => toAppVM(app, [], this.images, this.remotes)) as AppVM[]
    }
  },
  watch: {
    applications: function(apps: Application[]) {
      if (!this.apps) {
        this.apps = []
        return
      }

      this.apps = apps.map(app => toAppVM(app, this.apps, this.images, this.remotes))
    },
    remotes: function(remotes: Remote[]) {
      if (!this.apps) {
        this.apps = []
        return
      }

      this.apps = this.apps.map(app => toAppVM(app, this.apps, this.images, remotes))
    }
  },
  methods: {
    refresh() {
      return refresh.applications()
    },
    runImage(remote: Remote) {
      const img = this.images.find(img => img.Id === remote.imageId)
      showRun(img!)
    },
    showCreateModal() {
      showCreate()
    },
    showBuildModal(app: Application) {
      showBuild(app)
    },
    showEditModal(app: Application) {
      showEdit(app)
    },
    showLogsModal(app: Application) {
      showLogs(app)
    },

    async rebuildBranch(app: AppVM, remote: Remote) {
      const tag = toImageTag(app.label, remote.remote)
      const url = `/api/applications/${app.id}/build?ref=${remote.remote}&tag=${tag}&type=branch&sha=${remote.sha}`
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
        .then(() => refresh.applications())
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
        case State.Started:
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
        case State.Started:
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

<template>
  <div>
    <div class="container">
      <div class="columns">
        <div class="col-2">
          <button class="btn btn-md" v-on:click="showCreateModal">Create</button>
          <button class="btn btn-md" v-on:click="refresh">Refresh</button>
        </div>

        <div class="col-10"></div>
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
            <span
              v-if="!app.display && app.remotes.length > 0"
              style="color: #999; float: right"
            >{{ app.images.length }} hidden</span>
          </td>
          <td v-on:click="toggleDisplay(app)" style="cursor: pointer">{{ app.label }}</td>
          <td v-on:click="toggleDisplay(app)" style="cursor: pointer">{{ app.repository }}</td>
          <td v-on:click="toggleDisplay(app)" style="cursor: pointer">{{ app.dockerfile }}</td>
          <td>
            <button class="btn btn-md" v-on:click="showBuildModal(app)">Build</button>
            <button class="btn btn-md" v-on:click="showEditModal(app)">Edit</button>
            <button class="btn btn-md" v-on:click="removeApplication(app)">Remove</button>
            <button class="btn btn-md" v-on:click="showLogsModal(app)">Logs</button>
          </td>
        </tr>

        <tr v-if="app.display && app.remotes.length > 0">
          <td colspan="4">
            <table class="table" style="table-layout: fixed">
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
                  <td style="padding: 3px">{{ r.sha.slice(0, 10) }}</td>
                  <td style="padding: 3px">{{ cleanSha(r.imageId) }}</td>
                  <td style="padding: 3px">
                    <span
                      v-bind:class="toStatusClass(r.state)"
                      class="label label-rounded"
                    >{{ toStatus(r.state) }}</span>
                  </td>
                  <td style="padding: 3px">
                    <button class="btn btn-sm" v-on:click="rebuildBranch(app, r)">Re-Build</button>
                    <button class="btn btn-sm" :disabled="!r.imageId" v-on:click="runImage(r)">Run</button>
                    <button class="btn btn-sm" v-on:click="removeImage(r.image)">Remove Image</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>

    <Create v-bind:credentials="credentials"/>
    <Run v-bind:containers="containers"/>
    <Edit v-bind:credentials="credentials"/>
    <Build/>
    <Logs/>
  </div>
</template>