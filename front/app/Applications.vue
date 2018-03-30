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
          <td v-on:click="toggleDisplayImages(app)" style="cursor: pointer">
            <span v-if="!displayImages(app)">▶</span>
            <span v-if="displayImages(app)">▼</span>
            <span>{{ app.name }}</span>
            <span v-if="!displayImages(app) && app.images.length > 0" style="color: #999; float: right">{{ app.images.length }} hidden</span>
          </td>
          <td v-on:click="toggleDisplayImages(app)" style="cursor: pointer"></td>
          <td v-on:click="toggleDisplayImages(app)" style="cursor: pointer"></td>
          <td v-on:click="toggleDisplayImages(app)" style="cursor: pointer"></td>
          <td>
            <button class="btn btn-md" v-on:click="showBuildModal">Build</button>
            <button class="btn btn-md" v-on:click="showEditModal">Edit</button>
            <button class="btn btn-md" v-on:click="removeApplication">Remove</button>
            <button class="btn btn-md" v-on:click="showLogsModal">Logs</button>
          </td>
        </tr>

        <tr v-if="displayImages(app)">
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

              <tbody v-for="(r, i) in remotes" v-bind:key="i">
                <tr v-if="displayImages(app)">
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

  </div>
</template>


<script lang="ts">
import Vue from 'vue'
import { Application, Image, Remote } from './api'
import { State } from '../../src/api/applications/types'

interface AppVM extends Application {
  images: Image[]
  remotes: Remote[]
}

type MetaState = { displayImages: boolean }
type AppMeta = { [appId: string]: MetaState }

export default Vue.extend({
  props: {
    applications: { type: Array as () => Application[] },
    images: { type: Array as () => Image[] },
    remotes: { type: Array as () => Remote[] }
  },
  data() {
    return {
      meta: {} as AppMeta
    }
  },
  computed: {
    apps: function(): AppVM[] {
      return this.applications.map(app => {
        const images = this.images.filter(i => i.name.indexOf(app.label) === 0)
        const remotes = this.remotes
          .filter(r => r.applicationId === app.id && r.state !== 4)
          .filter(r => r.state !== State.Inactive)

        return {
          ...app,
          images,
          remotes
        }
      })
    }
  },
  methods: {
    refresh() {
      console.log('Refresh')
    },
    showCreateModal() {
      console.log('Show Create Modal')
    },
    async rebuildBranch(_app: AppVM, _remote: Remote) {
      console.log('Rebuild Branch')
      // const tag = buildApp.toImageTag(app.label, remote.remote)
      // const url = `/api/applications/${app.id}/build?ref=${remote.remote}&tag=${tag}&type=branch&sha=${remote.sha}`
      // const result = await fetch(url, { method: 'PUT' })
      // const json = await result.json()
      // if (result.status <= 400) {
      //   state.toast.success(json.message)
      //   return
      // }

      // state.toast.error(`Failed to queue build: ${json.message}`)
    },
    removeApplication(app: AppVM) {
      return fetch(`/api/applications/${app.id}`, { method: 'DELETE' }).then(res => res.json())
      // .then(res => state.toast.primary(res.message))
    },
    getMeta<TKey extends keyof MetaState>(app: Application, prop: TKey): MetaState[TKey] {
      if (!this.meta[app.id]) {
        this.meta[app.id] = { displayImages: false }
      }
      return this.meta[app.id][prop]
    },
    displayImages(app: Application) {
      return this.getMeta(app, 'displayImages')
    },
    toggleDisplayImages(app: Application) {
      const existing = this.getMeta(app, 'displayImages')
      this.meta[app.id].displayImages = !existing
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
</script>

