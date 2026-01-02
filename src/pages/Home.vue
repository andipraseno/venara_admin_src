<template>
  <div class="home-shell">
    <Navbar />

    <!-- Konten utama -->
    <main class="app-main">
      <div class="card profile-card shadow-lg" v-cloak>
        <!-- Header dengan background image -->
        <div class="card-header header-bg text-white text-center py-4">
          <div class="header-overlay"></div>
          <div class="header-content d-flex flex-column align-items-center">
            <img src="/images/profile.png" alt="Logo Perusahaan" class="img-logo mb-3" />

            <h3 class="mb-1 fw-bold text-uppercase">
              {{ profile.nama || "Nama Perusahaan" }}
            </h3>

            <p class="mb-3 small opacity-75 d-flex align-items-center gap-2">
              <i class="bi bi-geo-alt-fill"></i>
              <span>{{ profile.alamat || "Alamat perusahaan belum tersedia" }}</span>
            </p>

            <h5 class="mb-0 fw-bold text-uppercase">
              {{ selamat() + " " + login.user_nama }}
            </h5>
          </div>
        </div>

        <!-- Body -->
        <div class="card-body p-4">
          <div class="row g-4">
            <!-- Telepon -->
            <div class="col-md-6 d-flex align-items-start gap-3">
              <div class="icon-pill text-primary">
                <i class="bi bi-telephone-fill"></i>
              </div>
              <div class="flex-grow-1">
                <div class="label">Telepon</div>
                <div class="value">{{ profile.telepon || "-" }}</div>
              </div>
            </div>

            <!-- Handphone -->
            <div class="col-md-6 d-flex align-items-start gap-3">
              <div class="icon-pill text-success">
                <i class="bi bi-phone-fill"></i>
              </div>
              <div class="flex-grow-1">
                <div class="label">Handphone</div>
                <div class="value">
                  {{ format_handphone(profile.handphone) || "-" }}
                </div>
              </div>
            </div>

            <!-- Email -->
            <div class="col-md-6 d-flex align-items-start gap-3">
              <div class="icon-pill text-danger">
                <i class="bi bi-envelope-fill"></i>
              </div>
              <div class="flex-grow-1">
                <div class="label">Email</div>
                <div class="value">
                  <template v-if="profile.email">
                    <a
                      :href="`mailto:${profile.email}`"
                      class="link-dark text-decoration-underline"
                    >
                      {{ profile.email }}
                    </a>
                  </template>
                  <span v-else>-</span>
                </div>
              </div>
            </div>

            <!-- Website -->
            <div class="col-md-6 d-flex align-items-start gap-3">
              <div class="icon-pill text-warning">
                <i class="bi bi-globe"></i>
              </div>
              <div class="flex-grow-1">
                <div class="label">Website</div>
                <div class="value">
                  <template v-if="profile.website">
                    <a
                      :href="to_raw_url(profile.website)"
                      target="_blank"
                      rel="noopener"
                      class="link-dark text-decoration-underline"
                    >
                      {{ to_display_url(profile.website) }}
                    </a>
                  </template>
                  <span v-else>-</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick actions -->
          <div class="mt-4 d-flex flex-wrap gap-2">
            <button
              class="btn btn-sm btn-outline-secondary"
              v-if="profile.alamat"
              @click="open_map(profile.alamat)"
            >
              <i class="bi bi-map"></i> Petunjuk Arah
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import Navbar from "@/components/Navbar.vue";
import selamat from "@/helpers/greetings.js";
import { useAuthStore } from "@/stores/auth";

export default {
  name: "Home",

  components: {
    Navbar,
  },

  computed: {
    auth() {
      return useAuthStore();
    },
    profile() {
      return this.auth.profile || {};
    },
    login() {
      return this.auth.login || {};
    },
  },

  methods: {
    selamat,

    to_raw_url(website) {
      const raw = String(website || "").trim();
      if (!raw) return "";
      return raw.startsWith("http") ? raw : `https://${raw}`;
    },

    to_display_url(website) {
      try {
        const u = new URL(this.to_raw_url(website));
        return u.host + (u.pathname !== "/" ? u.pathname : "");
      } catch {
        return website || "-";
      }
    },

    format_handphone(no) {
      const raw = String(no || "").replace(/\D/g, "");
      if (!raw) return "";
      const parts = [];
      for (let i = 0; i < raw.length; i += 4) {
        parts.push(raw.slice(i, i + 4));
      }
      return parts.join(" ");
    },

    open_map(alamat) {
      const q = encodeURIComponent(alamat || "");
      window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, "_blank");
    },
  },
};
</script>

<style scoped src="@/pages/home.css"></style>
