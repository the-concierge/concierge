<script lang="ts">
import Vue from 'vue'
import { Image } from '../components/state/types'
import { common } from 'analysis'

export { Images as default }

const Images = Vue.extend({
  props: ['images'],
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
      console.log('Remove', image.Id)
    },
    clearFilter() {
      this.imageFilter = ''
    },
    filterImages(filter: string) {
      return this.images.filter((img: Image) => img.name.indexOf(filter) > -1)
    },
    pullImage() {
      console.log('TODO')
    }
  }
})
</script>

<template>
  <div>
    <div class="container">
      <div class="columns">
        <div class="col-2">
          <input class="form-input" type="text" placeholder="Filter for images..." v-model="imageFilter" />
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
      <tbody v-for="i in filterImages(imageFilter)" v-bind:key="i.Id">
        <tr>
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

    <!-- <ko-run-image></ko-run-image> -->

    <!-- <ko-pull-image></ko-pull-image> -->

  </div>
</template>


