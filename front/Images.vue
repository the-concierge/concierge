<script lang="ts">
import Vue from 'vue'
import Run, { showModal as showRun } from './images/Run.vue'
import Pull, { showModal as showPull } from './images/Pull.vue'
import { Image, Container } from './api'
import { common } from 'analysis'
import { toast } from './common'

export default Vue.extend({
  components: { Run, Pull },
  props: {
    images: { type: Array as () => Image[] },
    containers: { type: Array as () => Container[] }
  },
  data() {
    return {
      imageFilter: ''
    }
  },
  methods: {
    toMb(size: number) {
      return `${common.round(size / 1024 / 1024, 2)}MB`
    },
    toDate(timestamp: number) {
      return new Date(timestamp * 1000).toUTCString()
    },
    runImage(image: Image) {
      showRun(image)
    },
    clearFilter() {
      this.imageFilter = ''
    },
    filterImages(filter: string) {
      return this.images.filter((img: Image) => img.name.indexOf(filter) > -1)
    },
    pullImage() {
      showPull()
    },
    async removeImage(image: Image) {
      const tag = image.name
      const result = await fetch(`/api/images?tag=${tag}`, {
        method: 'DELETE'
      })

      const msg = await result.json()

      if (result.status < 400) {
        toast.success(msg.message)
        return
      }

      toast.error(msg.message)
    }
  }
})
</script>

<template>
  <div>
    <div class="container">
      <div class="columns">
        <div class="col-2">
          <input
            class="form-input"
            type="text"
            placeholder="Filter for images..."
            v-model="imageFilter"
          >
        </div>

        <div class="divider-vert"></div>

        <div class="col-3">
          <button class="btn btn-md" v-on:click="clearFilter">Clear Filter</button>
          <button class="btn btn-md" v-on:click="pullImage">Pull Image</button>
        </div>

        <div class="col-7"></div>
      </div>
    </div>

    <table class="table table-striped table-hover">
      <thead>
        <tr>
          <th>Tag</th>
          <th>Id</th>
          <th>Size</th>
          <th>Created</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="i in filterImages(imageFilter)" v-bind:key="i.Id">
          <td style="padding: 3px">{{i.name}}</td>
          <td style="padding: 3px">{{i.Id.replace('sha256:', '').slice(0, 10)}}</td>
          <td style="padding: 3px">{{toMb(i.Size)}}</td>
          <td style="padding: 3px">{{toDate(i.Created)}}</td>
          <td style="padding: 3px">
            <button class="btn btn-sm" v-on:click="runImage(i)">Run</button>
            <button class="btn btn-sm" v-on:click="removeImage(i)">Remove</button>
          </td>
        </tr>
      </tbody>
    </table>

    <Run v-bind:containers="containers"/>
    <Pull/>
  </div>
</template>


