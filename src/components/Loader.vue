<template>
  <div v-if="show" class="init-overlay">
    <div class="init-box">
      <div class="spinner-border spinner-lg" role="status" aria-hidden="true"></div>

      <div class="mt-3 fw-semibold">
        {{ title }}
      </div>

      <div class="text-muted small">
        {{ subtitle }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Loader",

  props: {
    show: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: "Tunggu sebentar…",
    },
    subtitle: {
      type: String,
      default: "Sedang memproses",
    },
  },
};
</script>

<style scoped src="@/components/loader.css"></style>
