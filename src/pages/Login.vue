<template>
  <div class="login-background d-flex align-items-center justify-content-center">
    <Loader :show="loadingInit" title="Tunggu sebentar…" subtitle="Sedang memproses" />

    <div class="login-card card shadow-lg">
      <div class="card-body p-4 p-md-5">
        <div class="text-center mb-4">
          <div class="login-avatar mb-3">
            <img src="/images/profile.png" alt="Logo" style="height: 80px" />
          </div>

          <h5 class="mb-0 fw-bold">
            {{ profile.nama || "Silakan Login" }}
          </h5>

          <small class="text-muted">
            {{ software.nama || "Gunakan nama dan password Anda" }}
          </small>
        </div>

        <!-- Form Login -->
        <form @submit.prevent="submitLogin" novalidate>
          <div class="mb-3">
            <div class="input-group">
              <span class="input-group-text">
                <i class="bi bi-person-fill"></i>
              </span>

              <input
                type="text"
                class="form-control"
                placeholder="Masukkan nama"
                v-model.trim="form.nama"
                :disabled="loadingInit"
                :class="{ 'is-invalid': errors.nama }"
                required
              />

              <div v-if="errors.nama" class="invalid-feedback">
                {{ errors.nama }}
              </div>
            </div>
          </div>

          <div class="mb-3">
            <div class="input-group">
              <span class="input-group-text">
                <i class="bi bi-lock-fill"></i>
              </span>

              <input
                :type="showPassword ? 'text' : 'password'"
                class="form-control"
                placeholder="Masukkan password"
                v-model.trim="form.password"
                :disabled="loadingInit"
                :class="{ 'is-invalid': errors.password }"
                required
              />

              <button
                type="button"
                class="btn btn-outline-secondary"
                @click="toggleShowPassword"
                :disabled="loadingInit"
              >
                <i class="bi" :class="showPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
              </button>

              <div v-if="errors.password" class="invalid-feedback">
                {{ errors.password }}
              </div>
            </div>
          </div>

          <button
            type="submit"
            class="btn btn-dark w-100 d-flex justify-content-center align-items-center"
            :disabled="loadingInit"
          >
            <span v-if="!loading">
              <i class="bi bi-box-arrow-in-right me-2"></i>
              Login
            </span>

            <span v-else class="d-flex align-items-center">
              <span
                class="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              Memproses...
            </span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Loader from "../components/Loader.vue";
import { useAuthStore } from "@/stores/auth";

export default {
  name: "App",

  components: {
    Loader,
  },

  data() {
    return {
      rootUrl: import.meta.env.VITE_API_ACTASYS,
      softwareId: import.meta.env.VITE_SOFTWARE_ID,
      profileId: import.meta.env.VITE_HOLDING_ID,

      loadingInit: true, // untuk overlay Loader
      loading: false, // untuk tombol login
      showPassword: false,

      errors: {},

      form: {
        nama: "",
        password: "",
        remember: false,
      },
    };
  },

  computed: {
    // instance store Pinia
    auth() {
      return useAuthStore();
    },

    // ambil dari Pinia, bukan dari data()
    software() {
      return this.auth.software || {};
    },

    profile() {
      return this.auth.profile || {};
    },
  },

  mounted() {
    this.initPage();
  },

  methods: {
    async loadSoftware() {
      try {
        // kalau sudah ada di store, tidak usah call API lagi
        if (this.software && Object.keys(this.software).length) return;

        const { data } = await axios.get(`${this.rootUrl}/loader/software/${this.softwareId}`);

        const payload = data?.data || {};

        // simpan ke Pinia
        this.auth.setSoftware(payload);
      } catch (err) {
        console.error("loadSoftware error", err);
        this.$toastr?.error?.("Gagal memuat data software");
      }
    },

    async loadProfile() {
      try {
        // kalau sudah ada di store, tidak usah call API lagi
        if (this.profile && Object.keys(this.profile).length) return;

        const { data } = await axios.get(`${this.rootUrl}/loader/profile/${this.profileId}`);

        const payload = data?.data || {};

        // simpan ke Pinia
        this.auth.setProfile(payload);
      } catch (err) {
        console.error("loadProfile error", err);
        this.$toastr?.error?.("Gagal memuat data perusahaan");
      }
    },

    async initPage() {
      try {
        await this.loadSoftware();
        await this.loadProfile();
      } catch (err) {
        console.error("initPage error", err);
        this.$toastr?.error?.("Gagal inisialisasi aplikasi");
      } finally {
        this.loadingInit = false;

        await this.$nextTick();

        const input = this.$el.querySelector("input");
        input?.focus();

        const profileName = this.profile?.nama || "Login";
        const softwareName = this.software?.nama || "";
        document.title = softwareName ? `${profileName} - ${softwareName}` : profileName;
      }
    },

    toggleShowPassword() {
      this.showPassword = !this.showPassword;
    },

    async submitLogin() {
      // clear error
      this.errors = { nama: "", password: "" };

      // Validasi sederhana + pesan spesifik
      if (!this.form.nama && this.form.password) {
        this.errors.nama = "Nama harus diisi.";
        this.errors.password = "";
        return;
      }

      if (!this.form.password && this.form.nama) {
        this.errors.nama = "";
        this.errors.password = "Password harus diisi.";
        return;
      }

      if (!this.form.nama || !this.form.password) {
        this.errors.nama = "Nama harus diisi.";
        this.errors.password = "Password harus diisi.";
        this.$toastr.info("Mohon lengkapi masukan anda.");
        return;
      }

      try {
        this.loading = true;

        const { data } = await axios.post(`${this.rootUrl}/loader/login`, {
          software_id: this.softwareId,
          profile_id: this.profileId,
          nama: this.form.nama,
          password: this.form.password,
        });

        // kalau API kirim token, simpan di Pinia
        const { token, level_id, level_namaa, user_id, user_nama, user_handphone, tab, module } =
          data.data || {};

        const now = Date.now();

        const dataToStore = {
          token,
          level_id,
          level_namaa,
          user_id,
          user_nama,
          user_handphone,
          tab,
          module,
          saved_at: now,
        };

        // simpan ke Pinia (dipersist otomatis oleh pinia-plugin-persistedstate)
        this.auth.setLogin(dataToStore);

        this.$router.push({ name: "Home" });
      } catch (err) {
        const apiErrors = err?.response?.data?.data;

        if (apiErrors) {
          this.errors.nama = apiErrors.nama ? apiErrors.nama[0] : "";
          this.errors.password = apiErrors.password ? apiErrors.password[0] : "";

          this.$toastr.error("Mohon periksa masukan anda!");
          return;
        }

        const msg = err?.response?.data?.message || "Terjadi kesalahan.";
        this.$toastr.error(msg);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped src="@/pages/login.css"></style>
