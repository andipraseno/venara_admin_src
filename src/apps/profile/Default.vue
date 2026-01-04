<template>
  <div class="container py-4" v-cloak>
    <div class="card shadow-lg border-0 rounded-4 overflow-hidden">
      <!-- ================= HEADER GRADIENT BAR ================= -->
      <div
        class="p-4 bg-gradient-brand text-white d-flex align-items-center justify-content-between flex-wrap gap-2"
      >
        <div>
          <h4 class="mb-1 fw-semibold">
            <i
              class="bi me-2"
              :class="activeTab === 'perjanjian' ? 'bi-file-earmark-text' : 'bi-buildings'"
            ></i>

            {{ activeTab === "perjanjian" ? "Perjanjian Sewa" : "Default" }}
          </h4>

          <div class="small text-white-50">
            <span v-if="activeTab === 'perjanjian'">
              Kelola naskah perjanjian sewa — gunakan variabel dinamis agar otomatis mengikuti
              profil perusahaan
            </span>
            <span v-else> Pengaturan profil, perjanjian sewa, dan payment gateway </span>
          </div>
        </div>

        <!-- ACTION BAR (KANAN) -->
        <div class="d-flex gap-2">
          <template v-if="activeTab === 'perjanjian'">
            <button class="btn btn-outline-light" @click="loadDefault" :disabled="loading">
              <i class="bi bi-arrow-repeat me-1"></i> Reload
            </button>

            <div class="btn-group">
              <button
                type="button"
                class="btn btn-light text-primary"
                @click="openPreview"
                :disabled="!prefs.perjanjian_sewa"
              >
                <i class="bi bi-eye me-1"></i> Preview
              </button>
              <button
                type="button"
                class="btn btn-light text-dark"
                @click="doPrint"
                :disabled="!prefs.perjanjian_sewa"
              >
                <i class="bi bi-printer me-1"></i> Print
              </button>
            </div>

            <button class="btn btn-light text-danger" @click="resetToServer">
              <i class="bi bi-arrow-counterclockwise me-1"></i> Reset
            </button>
          </template>
        </div>
      </div>

      <!-- ================= BODY ================= -->
      <div class="card-body p-4">
        <!-- TABS -->
        <ul class="nav nav-tabs mb-4">
          <li class="nav-item">
            <button
              class="nav-link"
              :class="{ active: activeTab === 'profile' }"
              @click="activeTab = 'profile'"
            >
              <i class="bi bi-person me-1"></i> Profile
            </button>
          </li>
          <li class="nav-item">
            <button
              class="nav-link"
              :class="{ active: activeTab === 'perjanjian' }"
              @click="activeTab = 'perjanjian'"
            >
              <i class="bi bi-file-earmark-text me-1"></i> Perjanjian Sewa
            </button>
          </li>
          <li class="nav-item">
            <button
              class="nav-link"
              :class="{ active: activeTab === 'payment' }"
              @click="activeTab = 'payment'"
            >
              <i class="bi bi-credit-card me-1"></i> Payment Gateway
            </button>
          </li>
        </ul>

        <form @submit.prevent="submitDefault">
          <!-- ================= PROFILE ================= -->
          <div v-show="activeTab === 'profile'">
            <div class="mb-3">
              <label class="form-label fw-semibold">Maps</label>
              <textarea class="form-control" rows="4" v-model="prefs.maps" readonly />
            </div>

            <div class="mb-3">
              <label class="form-label fw-semibold">Instagram</label>
              <input type="text" class="form-control" v-model="prefs.instagram" />
            </div>

            <div class="mb-3">
              <label class="form-label fw-semibold">Court Map Title</label>
              <textarea class="form-control" rows="3" v-model="prefs.court_map_title" />
            </div>
          </div>

          <!-- ================= PERJANJIAN SEWA ================= -->
          <div v-show="activeTab === 'perjanjian'">
            <!-- INFO BAR -->
            <div class="d-flex justify-content-between flex-wrap gap-2 mb-2">
              <div class="small text-muted">
                <span v-if="lastSavedAt">Terakhir disimpan: {{ lastSavedAt }}</span>
                <span v-if="hasLocalDraft" class="ms-2">
                  <a href="#" @click.prevent="restoreDraft">Pulihkan draft lokal</a>
                </span>
              </div>

              <div class="d-flex align-items-center gap-2">
                <div class="btn-group">
                  <button
                    class="btn btn-outline-primary btn-sm dropdown-toggle"
                    data-bs-toggle="dropdown"
                  >
                    <i class="bi bi-braces"></i> Variabel
                  </button>
                  <ul class="dropdown-menu dropdown-menu-end small">
                    <li v-for="t in tokens" :key="t.key">
                      <a href="#" class="dropdown-item" @click.prevent="insertToken(t.key)">
                        {{ t.key }} — {{ t.label }}
                      </a>
                    </li>
                  </ul>
                </div>

                <div class="badge text-bg-light text-muted">
                  {{ wordCount }} kata • {{ charCount }} karakter
                </div>
              </div>
            </div>

            <!-- CKEDITOR -->
            <ckeditor
              class="editor-perjanjian"
              :editor="editor"
              v-model="prefs.perjanjian_sewa"
              :config="editorConfig"
              @ready="onEditorReady"
            />
          </div>

          <!-- ================= PAYMENT ================= -->
          <div v-show="activeTab === 'payment'">
            <h6 class="fw-semibold mb-3">Midtrans Sandbox</h6>
            <div class="row g-3 mb-4">
              <div class="col-md-6">
                <label class="form-label">Snap URL</label>
                <input class="form-control" v-model="prefs.sandbox_midtrans_snap" />
              </div>
              <div class="col-md-6">
                <label class="form-label">Is Production</label>
                <input class="form-control" v-model="prefs.sandbox_midtrans_is_production" />
              </div>
              <div class="col-md-6">
                <label class="form-label">Merchant ID</label>
                <input class="form-control" v-model="prefs.sandbox_midtrans_merchant_id" />
              </div>
              <div class="col-md-6">
                <label class="form-label">Client Key</label>
                <input class="form-control" v-model="prefs.sandbox_midtrans_client_key" />
              </div>
              <div class="col-md-12">
                <label class="form-label">Server Key</label>
                <input class="form-control" v-model="prefs.sandbox_midtrans_server_key" />
              </div>
            </div>

            <h6 class="fw-semibold mb-3">Midtrans Production</h6>
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Snap URL</label>
                <input class="form-control" v-model="prefs.production_midtrans_snap" />
              </div>
              <div class="col-md-6">
                <label class="form-label">Is Production</label>
                <input class="form-control" v-model="prefs.production_midtrans_is_production" />
              </div>
              <div class="col-md-6">
                <label class="form-label">Merchant ID</label>
                <input class="form-control" v-model="prefs.production_midtrans_merchant_id" />
              </div>
              <div class="col-md-6">
                <label class="form-label">Client Key</label>
                <input class="form-control" v-model="prefs.production_midtrans_client_key" />
              </div>
              <div class="col-md-12">
                <label class="form-label">Server Key</label>
                <input class="form-control" v-model="prefs.production_midtrans_server_key" />
              </div>
            </div>
          </div>

          <!-- ACTION -->
          <div class="mt-4 d-flex justify-content-end">
            <button type="submit" class="btn btn-dark px-4" :disabled="loading">
              <span v-if="!loading"> <i class="bi bi-save me-1"></i> Simpan </span>
              <span v-else>
                <span class="spinner-border spinner-border-sm me-2"></span>
                Loading…
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- PRINT -->
    <iframe ref="printFrame" class="d-none"></iframe>
  </div>
</template>

<script>
import axios from "axios";
import Swal from "sweetalert2";
import { useAuthStore } from "@/stores/auth";

import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { Ckeditor } from "@ckeditor/ckeditor5-vue";

export default {
  name: "Default",
  components: { ckeditor: Ckeditor },

  data() {
    return {
      activeTab: "profile",
      loading: false,

      editor: ClassicEditor,
      editorConfig: {
        language: "id",
        toolbar: [
          "heading",
          "|",
          "bold",
          "italic",
          "underline",
          "link",
          "bulletedList",
          "numberedList",
          "blockQuote",
          "|",
          "undo",
          "redo",
        ],
        placeholder: "Tulis perjanjian sewa di sini… Gunakan {{NAMA_PERUSAHAAN}}, {{ALAMAT}}, dll.",
      },

      lastSavedAt: "",
      originalServerText: "",

      prefs: {
        maps: "",
        instagram: "",
        court_map_title: "",
        perjanjian_sewa: "",

        sandbox_midtrans_snap: "",
        sandbox_midtrans_is_production: "",
        sandbox_midtrans_merchant_id: "",
        sandbox_midtrans_client_key: "",
        sandbox_midtrans_server_key: "",

        production_midtrans_snap: "",
        production_midtrans_is_production: "",
        production_midtrans_merchant_id: "",
        production_midtrans_client_key: "",
        production_midtrans_server_key: "",
      },

      tokens: [
        { key: "{{NAMA_PERUSAHAAN}}", label: "Nama perusahaan" },
        { key: "{{ALAMAT}}", label: "Alamat" },
        { key: "{{TELEPON}}", label: "Telepon" },
        { key: "{{EMAIL}}", label: "Email" },
      ],
    };
  },

  computed: {
    auth() {
      return useAuthStore();
    },
    wordCount() {
      const t = (this.prefs.perjanjian_sewa || "").replace(/<[^>]*>/g, " ").trim();
      return t ? t.split(/\s+/).length : 0;
    },
    charCount() {
      return (this.prefs.perjanjian_sewa || "").replace(/<[^>]*>/g, "").length;
    },
    hasLocalDraft() {
      return !!localStorage.getItem("draft_perjanjian");
    },
    renderedPreview() {
      let html = this.prefs.perjanjian_sewa || "";
      const c = this.auth.company || {};
      const map = {
        "{{NAMA_PERUSAHAAN}}": c.nama || "",
        "{{ALAMAT}}": c.alamat || "",
        "{{TELEPON}}": c.telepon || "",
        "{{EMAIL}}": c.email || "",
      };
      Object.keys(map).forEach((k) => {
        html = html.split(k).join(map[k]);
      });
      return html;
    },
  },

  mounted() {
    this.loadDefault();
  },

  methods: {
    async loadDefault() {
      this.loading = true;
      const res = await axios.get(`${import.meta.env.VITE_API_APPS}/master/default`, {
        headers: { Token: "Bearer " + this.auth.login?.token },
      });
      Object.assign(this.prefs, res.data || {});
      this.originalServerText = this.prefs.perjanjian_sewa;
      this.loading = false;
    },

    onEditorReady(editor) {
      const root = editor.editing.view.document.getRoot();
      editor.editing.view.change((writer) => {
        writer.setStyle("min-height", "520px", root);
      });
      editor.model.document.on(
        "change:data",
        this.debounce(() => {
          localStorage.setItem("draft_perjanjian", this.prefs.perjanjian_sewa);
        }, 800)
      );
    },

    insertToken(token) {
      this.prefs.perjanjian_sewa += " " + token + " ";
    },

    restoreDraft() {
      const d = localStorage.getItem("draft_perjanjian");
      if (d) this.prefs.perjanjian_sewa = d;
    },

    resetToServer() {
      this.prefs.perjanjian_sewa = this.originalServerText;
    },

    openPreview() {
      Swal.fire({
        title: "Preview Perjanjian",
        html: `<div style="text-align:left;max-height:60vh;overflow:auto">
          ${this.renderedPreview}
        </div>`,
        width: 900,
      });
    },

    doPrint() {
      const iframe = this.$refs.printFrame;
      const doc = iframe.contentDocument;
      doc.open();
      doc.write(`<html><body>${this.renderedPreview}</body></html>`);
      doc.close();
      setTimeout(() => iframe.contentWindow.print(), 100);
    },

    debounce(fn, wait) {
      let t;
      return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(this, args), wait);
      };
    },

    async submitDefault() {
      this.loading = true;
      await axios.post(`${import.meta.env.VITE_API_APPS}/master/default_add`, this.prefs, {
        headers: { Token: "Bearer " + this.auth.login?.token },
      });
      this.lastSavedAt = new Date().toLocaleString("id-ID");
      Swal.fire("Berhasil", "Data disimpan", "success");
      this.loading = false;
    },
  },
};
</script>

<style scoped src="@/apps/profile/Default.css"></style>