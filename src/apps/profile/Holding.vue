<template>
  <div class="container py-4" v-cloak>
    <div class="card shadow-lg border-0 rounded-4 overflow-hidden">
      <div
        class="p-4 bg-gradient-brand text-white d-flex align-items-center justify-content-between flex-wrap gap-2"
      >
        <div>
          <h4 class="mb-1 fw-semibold">
            <i class="bi bi-buildings"></i>
            Holding Profile
          </h4>

          <div class="small text-white-50">
            Kelola identitas perusahaan untuk ditampilkan di seluruh sistem
          </div>
        </div>

        <div class="d-flex gap-2"></div>
      </div>

      <div class="card-body p-4">
        <div class="row g-4">
          <div class="col-12 col-lg-7">
            <form @submit.prevent="submitHolding" novalidate>
              <!-- Logo -->
              <div class="mb-4">
                <label class="form-label fw-semibold">Logo</label>
                <div class="d-flex align-items-center gap-3">
                  <div class="logo-frame shadow-sm">
                    <img v-if="logoPreview" :src="logoPreview" alt="Logo preview" />

                    <div v-else class="logo-placeholder">
                      <i class="bi bi-image"></i>
                    </div>
                  </div>

                  <div class="d-flex flex-wrap gap-2">
                    <label class="btn btn-outline-primary btn-sm mb-0">
                      <i class="bi bi-upload me-1"></i> Pilih Logo
                      <input type="file" class="d-none" accept="image/*" @change="onLogoChange" />
                    </label>

                    <button
                      v-if="logoPreview"
                      type="button"
                      class="btn btn-outline-danger btn-sm"
                      @click="removeLogo"
                    >
                      <i class="bi bi-trash me-1"></i> Hapus
                    </button>

                    <div class="text-muted small w-100">
                      PNG/JPG, maks ~1MB. Disarankan 320×320 px transparan.
                    </div>
                  </div>
                </div>
              </div>

              <div class="row g-3 mb-3">
                <div class="col-md-6">
                  <div class="form-floating">
                    <input
                      type="text"
                      class="form-control"
                      id="nama"
                      v-model.trim="holding.nama"
                      :class="{ 'is-invalid': errors.nama }"
                      placeholder="Nama"
                    />

                    <label for="nama">Nama</label>

                    <div class="invalid-feedback" v-if="errors.nama">{{ errors.nama }}</div>
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="input-group form-floating">
                    <input
                      type="text"
                      class="form-control"
                      id="kode"
                      v-model.trim="holding.kode"
                      placeholder="Kode"
                    />

                    <label for="kode">Kode</label>

                    <span class="input-group-text"><i class="bi bi-hash"></i></span>
                  </div>
                </div>

                <div class="col-md-12">
                  <div class="form-floating">
                    <textarea
                      class="form-control"
                      id="alamat"
                      v-model.trim="holding.alamat"
                      style="height: 96px"
                      placeholder="Alamat"
                    ></textarea>

                    <label for="alamat">Alamat</label>
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="input-group form-floating">
                    <input
                      type="text"
                      class="form-control"
                      id="telepon"
                      v-model.trim="holding.telepon"
                      @blur="normalizePhone('telepon')"
                      placeholder="Telepon"
                    />

                    <label for="telepon">Telepon</label>

                    <span class="input-group-text"><i class="bi bi-telephone"></i></span>
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="input-group form-floating">
                    <input
                      type="text"
                      class="form-control"
                      id="handphone"
                      v-model.trim="holding.handphone"
                      @blur="normalizePhone('handphone')"
                      placeholder="HP"
                    />

                    <label for="handphone">Handphone</label>

                    <span class="input-group-text"><i class="bi bi-phone"></i></span>
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="input-group form-floating">
                    <input
                      type="email"
                      class="form-control"
                      id="email"
                      v-model.trim="holding.email"
                      @blur="validateEmail"
                      :class="{ 'is-invalid': errors.email }"
                      placeholder="Email"
                    />

                    <label for="email">Email</label>

                    <span class="input-group-text"><i class="bi bi-envelope"></i></span>

                    <div class="invalid-feedback" v-if="errors.email">{{ errors.email }}</div>
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="input-group form-floating">
                    <input
                      type="text"
                      class="form-control"
                      id="website"
                      v-model.trim="holding.website"
                      @blur="normalizeWebsite"
                      placeholder="Website"
                    />

                    <label for="website">Website</label>

                    <span class="input-group-text"><i class="bi bi-globe2"></i></span>
                  </div>

                  <div class="form-text">Contoh: <code>https://nama.com</code></div>
                </div>
              </div>

              <button type="submit" class="btn btn-dark px-4" :disabled="loading || !cekError">
                <span v-if="!loading"><i class="bi bi-floppy me-1"></i> Simpan</span>
                <span v-else
                  ><span class="spinner-border spinner-border-sm me-2"></span> Loading…</span
                >
              </button>
            </form>
          </div>

          <!-- PREVIEW -->
          <div class="col-12 col-lg-5">
            <div class="card border-0 shadow-sm rounded-3">
              <div class="card-body">
                <div class="d-flex align-items-center gap-3 mb-3">
                  <div class="logo-frame sm">
                    <img v-if="logoPreview" :src="logoPreview" alt="Logo" />
                    <div v-else class="logo-placeholder">
                      <i class="bi bi-building"></i>
                    </div>
                  </div>

                  <div>
                    <div class="h5 mb-0 fw-bold">{{ holding.nama || "Nama" }}</div>
                    <div class="text-muted">{{ holding.kode || "KODE" }}</div>
                  </div>
                </div>

                <hr class="my-3" />

                <ul class="list-unstyled mb-0 small">
                  <li class="mb-2">
                    <i class="bi bi-geo-alt me-2"></i>
                    {{ holding.alamat || "Alamat perusahaan…" }}
                  </li>

                  <li class="mb-2" v-if="holding.telepon">
                    <i class="bi bi-telephone me-2"></i>
                    <a :href="`tel:${cleanPhone(holding.telepon)}`" class="link-body-emphasis">
                      {{ prettyPhone(holding.telepon) }}
                    </a>
                  </li>

                  <li class="mb-2" v-if="holding.handphone">
                    <i class="bi bi-phone me-2"></i>
                    <a :href="`tel:${cleanPhone(holding.handphone)}`" class="link-body-emphasis">
                      {{ prettyPhone(holding.handphone) }}
                    </a>
                    <a
                      :href="`https://wa.me/${waPhone(holding.handphone)}`"
                      target="_blank"
                      class="btn btn-sm btn-outline-success ms-2"
                    >
                      <i class="bi bi-whatsapp"></i>
                    </a>
                  </li>

                  <li class="mb-2" v-if="holding.email">
                    <i class="bi bi-envelope me-2"></i>
                    <a :href="`mailto:${holding.email}`" class="link-body-emphasis">{{
                      holding.email
                    }}</a>
                  </li>

                  <li class="mb-2" v-if="holding.website">
                    <i class="bi bi-globe2 me-2"></i>
                    <a
                      :href="holding.website"
                      target="_blank"
                      rel="noopener"
                      class="link-primary"
                      >{{ holding.website }}</a
                    >
                  </li>
                </ul>
              </div>
            </div>

            <!-- Info -->
            <div class="alert alert-info mt-3 small mb-0">
              <i class="bi bi-info-circle-fill me-2"></i>Perubahan akan mempengaruhi profil sistem,
              kop dokumen, dll.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from "@/stores/auth";
import axios from "axios";
import Swal from "sweetalert2";

// IMPORT HELPER
import {
  cleanPhone,
  prettyPhone,
  waPhone,
  isValidEmail,
  normalizeWebsite,
} from "@/helpers/formatters.js";

export default {
  name: "Holding",

  data() {
    return {
      baseUrl: import.meta.env.VITE_API_ACTASYS,
      token: "",
      headers: "",

      holding: {
        id: import.meta.env.VITE_HOLDING_ID,
        nama: "",
        kode: "",
        alamat: "",
        telepon: "",
        handphone: "",
        email: "",
        website: "",
      },

      errors: {
        nama: "",
        email: "",
      },

      loading: false,

      logoFile: null,
      logoPreview: "",
      originalSnapshot: null,
    };
  },

  computed: {
    // store
    auth() {
      return useAuthStore();
    },
    loginStore() {
      return this.auth.login || {};
    },
    holdingStore() {
      return this.auth.holding || {};
    },

    // function
    cekError() {
      return !!this.holding.nama && !this.errors.email;
    },
  },

  mounted() {
    this.token = this.loginStore.token;
    this.headers = { headers: { Token: "Bearer " + this.token } };

    this.loadProfile();
  },

  methods: {
    cleanPhone,
    prettyPhone,
    waPhone,

    async loadProfile() {
      try {
        this.loading = true;

        const res = await axios.get(
          `${this.baseUrl}/profile/holding_show/${this.holding.id}`,
          this.headers
        );

        const data = res.data || {};

        this.holding.nama = data.nama || "";
        this.holding.kode = data.kode || "";
        this.holding.alamat = data.alamat || "";
        this.holding.telepon = data.telepon || "";
        this.holding.handphone = data.handphone || "";
        this.holding.email = data.email || "";
        this.holding.website = data.website || "";
      } catch (error) {
        console.error(error);
        Swal.fire("Gagal!", "Gagal memuat data.", "error");
      } finally {
        this.loading = false;
      }
    },

    normalizePhone(field) {
      if (field === "telepon") {
        this.holding.telepon = cleanPhone(this.holding.telepon);
      } else if (field === "handphone") {
        this.holding.handphone = cleanPhone(this.holding.handphone);
      }
    },

    validateEmail() {
      this.errors.email = "";
      if (!this.holding.email) return;
      if (!isValidEmail(this.holding.email)) {
        this.errors.email = "Format email tidak valid";
      }
    },

    normalizeWebsite() {
      this.holding.website = normalizeWebsite(this.holding.website);
    },

    // ---- Logo handling ----
    onLogoChange(e) {
      const f = e.target.files?.[0];

      if (!f) return;

      if (f.size > 1_000_000) {
        Swal.fire("Ukuran terlalu besar", "Maksimal 1MB.", "warning");
        return;
      }

      this.logoFile = f;

      const reader = new FileReader();
      reader.onload = () => {
        this.logoPreview = reader.result;
      };
      reader.readAsDataURL(f);
    },

    removeLogo() {
      this.logoFile = null;
      this.logoPreview = "";
    },

    // ---- API ----
    async submitHolding() {
      this.validateEmail();

      if (!this.cekError) {
        Swal.fire("Periksa kembali", "Lengkapi Nama & perbaiki input yang salah.", "info");
        return;
      }

      const confirm = await Swal.fire({
        title: "Simpan data?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Ya, simpan",
        cancelButtonText: "Batal",
      });
      if (!confirm.isConfirmed) return;

      try {
        this.loading = true;

        const userNama = this.loginStore?.user_nama;

        const payload = {
          id: this.holding.id,
          holding_id: this.holding.holding_id,
          nama: this.holding.nama,
          kode: this.holding.kode,
          alamat: this.holding.alamat,
          telepon: this.holding.telepon,
          handphone: this.holding.handphone,
          email: this.holding.email,
          website: this.holding.website,
          status: 1,
          by: userNama,
        };

        await axios.post(`${this.baseUrl}/profile/holding_add`, payload, this.headers);

        Swal.fire("Berhasil!", "Data disimpan.", "success");
      } catch (error) {
        console.error(error);
        Swal.fire("Gagal!", "Gagal menyimpan data.", "error");
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped src="@/apps/profile/Holding.css"></style>
