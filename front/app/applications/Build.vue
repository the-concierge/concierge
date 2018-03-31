<script lang="ts">
import Vue from 'vue'
export default Vue.extend({})

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
