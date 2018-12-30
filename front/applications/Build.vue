<script lang="ts">
import Vue from 'vue'
import { Application } from '../api'
import { toast, createEmitter } from '../common'

interface Ref {
  type: string
  ref: string
  sha: string
}

export default Vue.extend({
  data() {
    return {
      app: {} as Application,
      modalLoading: false,
      modalActive: false,
      imageTag: '',
      refType: 'branch',
      selectedBranch: { type: 'branch', ref: '', sha: '' },
      selectedTag: { type: 'tag', ref: '', sha: '' },
      buildableRefs: [] as Ref[]
    }
  },
  computed: {
    selectedRef: function(): Ref {
      return this.refType === 'branch' ? this.selectedBranch : this.selectedTag
    },
    buildableBranches: function(): Ref[] {
      return this.buildableRefs.filter(ref => ref.type === 'branch')
    },
    buildableTags: function(): Ref[] {
      return this.buildableRefs.filter(ref => ref.type === 'tag')
    },
    computedImageTag: function(): string {
      const tag = this.imageTag
      if (tag) {
        return tag
      }

      const ref = this.selectedRef.ref
      return ref ? ref : 'latest'
    },
    finalImageTag: function(): string {
      return toImageTag(this.app.label || '', this.computedImageTag)
    }
  },
  methods: {
    hideModal() {
      this.modalActive = false
    },
    async buildApplication() {
      const id = this.app.id
      const ref = this.selectedRef
      const tag = this.finalImageTag
      const sha = ref.sha
      const url = `/api/applications/${id}/build?ref=${ref.ref}&tag=${tag}&type=${ref.type}&sha=${sha}`

      toast.primary(`Attempting to queue application build...`)
      this.hideModal()

      const result = await fetch(url, { method: 'PUT' })
      const msg = await result.json()
      const success = result.status < 400

      if (success) {
        toast.success(msg.message)
        return
      }

      toast.error(`Failed to queue build: ${msg.message}`)
    }
  },
  mounted() {
    emitter.on(async app => {
      this.app = app
      this.modalActive = true
      this.modalLoading = true
      this.imageTag = ''
      this.refType = 'branch'

      const refs: Ref[] = await fetch(`/api/applications/${app.id}/refs`).then(res => res.json())

      this.buildableRefs = refs
      const firstBranch = refs.find(ref => ref.type === 'branch')
      if (firstBranch) {
        this.selectedBranch = firstBranch
      }

      const firstTag = refs.find(ref => ref.type === 'tag')
      if (firstTag) {
        this.selectedTag = firstTag
      }

      this.modalLoading = false
    })
  }
})

const emitter = createEmitter<Application>()
export function showModal(app: Application) {
  emitter.emit(app)
}

export function toImageTag(appLabel: string, ref: string) {
  return `${appLabel}:${slug(ref || 'latest')}`
}

export function slug(text: string) {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-\.]+/g, '') // Remove all non-word chars except dashes and dots
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, '') // Trim - from end of text
}
</script>

<template>
  <div class="modal" v-bind:class="{ active: modalActive }">
    <div class="modal-overlay" v-on:click="hideModal"></div>
    <div class="modal-container">
      <div class="modal-header">
        <button class="btn btn-clear float-right" v-on:click="hideModal"></button>
        <div class="modal-title">
          Build Application:
          <span>{{app.name}}</span>
        </div>
      </div>

      <div class="modal-body">
        <div class="content">
          <div class="loading" v-if="modalLoading"></div>

          <div v-if="!modalLoading">
            <p>
              Image Tag:
              <code>{{finalImageTag}}</code>
            </p>
            <form v-on:submit.prevent class="form-horizonal">
              <div class="form-group">
                <div class="col-3">Docker image tag</div>
                <div class="col-9">
                  <input
                    class="form-input"
                    type="text"
                    v-model="imageTag"
                    placeholder="E.g. latest, v1.3, alpha, beta, test... Uses your ref by default"
                  >
                </div>
              </div>

              <div class="form-group">
                <div class="col-3">
                  <label class="form-label">Ref type</label>
                </div>
                <div class="col-9">
                  <label class="form-radio">
                    <input type="radio" value="branch" v-model="refType">
                    <i class="form-icon"></i>Branch
                  </label>
                  <label class="form-radio">
                    <input type="radio" value="tag" v-model="refType">
                    <i class="form-icon"></i>Tag
                  </label>
                </div>
              </div>

              <div v-if="refType === 'branch'" class="form-group">
                <div class="col-3">
                  <label class="form-label">Branch</label>
                </div>

                <div class="col-9">
                  <select class="form-select" v-model="selectedBranch">
                    <option
                      v-for="branch in buildableBranches"
                      v-bind:key="branch.sha"
                      v-bind:value="branch"
                    >{{branch.ref}}</option>
                  </select>
                </div>
              </div>

              <div v-if="refType === 'tag'" class="form-group">
                <div class="col-3">
                  <label class="form-label">Tag</label>
                </div>

                <div class="col-9">
                  <select class="form-select" v-model="selectedTag">
                    <option
                      v-for="tag in buildableTags"
                      v-bind:key="tag.sha"
                      v-bind:value="tag"
                    >{{tag.ref}}</option>
                  </select>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-md" v-on:click="buildApplication">Build</button>
      </div>
    </div>
  </div>
</template>

