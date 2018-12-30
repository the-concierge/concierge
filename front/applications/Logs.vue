<script lang="ts">
import Vue from 'vue'
import { createEmitter } from '../common'
import { Application } from '../api'

interface Data {
  logs: Array<{ file: string }>
  loading: boolean
  modalActive: boolean
  app: Application
}

export default Vue.extend({
  data: function(): Data {
    return {
      logs: [],
      loading: true,
      modalActive: false,
      app: {} as any
    }
  },
  methods: {
    hideModal() {
      this.modalActive = false
    }
  },
  mounted() {
    emitter.on(async app => {
      this.loading = true
      this.app = app
      this.modalActive = true
      const url = `/api/applications/${app.id}/logs`
      const result = await fetch(url, { method: 'GET' })
      const logs: string[] = await result.json()
      this.logs = logs.map(file => ({ file }))
      this.loading = false
    })
  }
})

const emitter = createEmitter<Application>()
export function showModal(app: Application) {
  emitter.emit(app)
}
</script>


<template>
  <div class="modal" v-bind:class="{ active: modalActive }">
    <div class="modal-overlay" v-on:click="hideModal"></div>
    <div class="modal-container">
      <div class="modal-header">
        <button class="btn btn-clear float-right" v-on:click="hideModal"></button>
        <div class="modal-title">
          Application Build Logs:
          <span>{{app.name}}</span>
        </div>
      </div>

      <div class="modal-body">
        <div class="content">
          <div class="loading" v-if="loading"></div>

          <div v-if="!loading">
            <div v-if="logs.length === 0">This application has no build logs</div>

            <div v-for="log in logs" v-bind:key="log.file">
              <p>{{log.file}}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-md" v-on:click="hideModal">Close</button>
      </div>
    </div>
  </div>
</template>