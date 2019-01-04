<script lang="ts">
import Vue from 'vue'
import { createEmitter } from '../common'
import { Application, getLogFile } from '../api'

interface LogEntry extends Concierge.LogEntry {
  rows: string[]
}

interface Data {
  current: {
    file: string
    date: Date
  }
  logs: Array<{ file: string }>
  logFile: Array<LogEntry>
  loading: boolean
  modalActive: boolean
  app: Application
}

export default Vue.extend({
  data: function(): Data {
    return {
      current: {
        file: '',
        date: new Date()
      },
      logs: [],
      logFile: [],
      loading: true,
      modalActive: false,
      app: {} as any
    }
  },
  computed: {
    logFiles: function(): Array<{ name: string; date: Date }> {
      const entries = this.logs.map(({ file }) => ({
        name: file,
        date: new Date(this.getDateFromFile(file))
      }))

      entries.sort((l, r) => (l.date > r.date ? -1 : l.date.valueOf() === r.date.valueOf() ? 0 : 1))
      return entries
    }
  },
  methods: {
    formatDate: function(date: Date) {
      return date.toString().slice(0, 24)
    },
    hideModal() {
      this.modalActive = false
    },
    getDateFromFile: function(file: string) {
      return new Date(`${file.slice(0, 10)}T${file.slice(11, 19).replace(/-/g, ':')}Z`)
    },
    async getLog(file: string) {
      this.current = {
        file,
        date: this.getDateFromFile(file)
      }
      const id = this.app.id
      const json = await getLogFile(id, file)
      const parsed = json.map(this.toLogRows)

      this.logFile = parsed
    },
    toLogRows(entry: Concierge.LogEntry) {
      const rows = entry.logs.map(log => {
        if (typeof log === 'string') {
          return log
        }

        return `[${log.code}] Error: ${log.message}`
      })

      return {
        ...entry,
        rows
      }
    }
  },
  mounted() {
    emitter.on(async app => {
      this.loading = true
      this.app = app
      this.modalActive = true
      this.logFile = []
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
    <div class="modal-container" style="min-width: 90rem;max-width: 90rem">
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

            <div v-for="log in logFiles" v-bind:key="log.name">
              <p>
                {{formatDate(log.date)}}
                <em style="opacity: 0.7">({{log.name}})</em>
                <a :href="'/api/applications/'+app.id+'/logs/' + log.name">
                  <button class="btn btn-md float-right" style="margin-left: 4px">Download</button>
                </a>
                
                <button class="btn btn-md float-right" v-on:click="getLog(log.name)">View</button>
              </p>
            </div>
          </div>

          <div v-if="logFile.length > 0">
            <div class="bar bar-sm">
              <div
                class="bar-item"
                role="progressbar"
                style="width:100%;"
                aria-valuenow="100"
                aria-valuemin="0"
                aria-valuemax="100"
              ></div>
            </div>
            <div style="margin-top: 12px">
              <strong>Currently viewing</strong>
              :{{formatDate(current.date)}}
              <em style="opacity: 0.7">({{current.file}})</em>
            </div>
            <div v-for="row in logFile" v-bind:key="row.id">
              <h4 style="margin-top: 14px">
                Step {{row.id}}:
                <span style="text-transform: uppercase">{{row.step}}</span>
              </h4>
              <pre style="background-color: #efefef; overflow-x: auto; white-space: pre-wrap">{{row.rows.join('\n')}}</pre>
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