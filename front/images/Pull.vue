<template>
  <div v-if="modalActive" v-bind:class="{ active: modalActive }" class="modal">
    <div v-on:click="hideModal" class="modal-overlay"></div>
    <div class="modal-container">
      <div class="modal-header">
        <button class="btn btn-clear float-right" v-on:click="hideModal"></button>
        <div class="modal-title">Pull Image</div>
      </div>

      <div class="modal-body">
        <div class="content">
          <div class="form-group">
            <label class="form-label">Image Name</label>
            <input v-model="imageName" class="form-input" type="text" />
          </div>

          <div class="form-group">
            <label class="form-label">Image Tag
              <sub style="float: right">(Optional) Defaults to 'latest'</sub>
            </label>
            <input v-model="tag" class="form-input" type="text" placeholder="Defaults to 'latest'" />
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button v-on:click="hideModal" class="btn btn-md">Cancel</button>
        <button v-on:click="pullImage" :disabled="!canPull" class="btn btn-md">Pull</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { createEmitter, toast } from '../common'

export default Vue.extend({
  data() {
    return {
      pulling: false,
      imageName: '',
      tag: '',
      modalActive: false
    }
  },
  computed: {
    canPull: function(): boolean {
      return this.pulling === false && this.imageName.trim() !== ''
    }
  },
  mounted() {
    emitter.on(() => {
      this.pulling = false
      this.modalActive = true
      this.tag = ''
      this.imageName = ''
    })
  },
  methods: {
    async pullImage() {
      const img = this.imageName
      const tag = this.tag || 'latest'
      this.pulling = true

      try {
        const res = await fetch(`/api/images/pull?imageName=${img}&${tag}`, { method: 'POST' })
        if (res.status < 400) {
          toast.success('Successfully begun pulling image')
          this.modalActive = false
          return
        }

        const msg = await res.json()
        toast.error(`Failled to pull image: ${msg.message}`)
      } finally {
        this.pulling = false
      }
    },
    hideModal() {
      this.modalActive = false
    }
  }
})

const emitter = createEmitter<void>()
export function showModal() {
  emitter.emit(undefined)
}
</script>
