<template>
  <div
    class="text"
    v-html="renderedText">
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { createRenderer } from './MarkdownRenderer';

@Component
export default class DocumentationText extends Vue {
  @Prop() public docs: readonly string[];

  private readonly renderer = createRenderer();

  get renderedText() {
    if (!this.docs || this.docs.length === 0) {
      return '';
    }
    const documentation = this.docs.join('-');
    return this.renderer.render(documentation);
  }
}
</script>

<style scoped lang="scss">
.text {
  font-size: 1.2rem;
}
</style>
