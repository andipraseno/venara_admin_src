<template>
  <div id="navbarApp" class="app-shell">
    <!-- ================= NAVBAR TOP ================= -->
    <nav class="app-navbar fixed-top">
      <div class="nav-inner">
        <!-- Left -->
        <div class="brand">
          <a href="#" @click.prevent="openNav('mobile')" class="brand-logo" title="Menu">
            <img
              id="logoCompany"
              ref="logoCompany"
              src="/images/profile.png"
              alt="Logo"
              width="40"
              height="40"
            />
          </a>

          <div class="brand-meta">
            <div class="profile-code">
              <span class="chip chip-soft">
                {{ profileKode || "---" }}
              </span>
            </div>
            <div class="profile-info">
              <strong class="profile-name">
                {{ profileNama || "---" }}
              </strong>
              <small class="profile-address">
                {{ profileAlamat || "---" }}
              </small>
            </div>
          </div>
        </div>

        <!-- Right -->
        <div class="actions">
          <button class="burger-menu" @click="openNav('mobile')">
            <span></span><span></span><span></span>
          </button>

          <router-link to="/home" custom v-slot="{ navigate, href }">
            <button class="btn-icon" :href="href" @click="navigate">
              <i class="bi bi-house"></i>
            </button>
          </router-link>

          <button class="btn-icon" @click="showHelp">
            <i class="bi bi-question-circle"></i>
          </button>

          <button class="btn-icon danger" @click="logout">
            <i class="bi bi-box-arrow-right"></i>
          </button>
        </div>
      </div>
      <div class="nav-accent"></div>
    </nav>

    <!-- ================= SIDENAV ================= -->
    <div id="sidenav-mobile" ref="sidenavMobile" class="sidenav">
      <div class="sidenav-header">
        <h5><i class="bi bi-menu-button-wide"></i> Menu</h5>
        <button class="closebtn" @click="closeNav">&times;</button>
      </div>

      <!-- GROUP MENU -->
      <div
        v-for="tab in tabs"
        :key="'mobile-tab-' + tab.tab_id"
        class="px-3 mt-3"
      >
        <!-- HEADER GROUP -->
        <div
          class="tab-header d-flex justify-content-between align-items-center text-white-50 small mb-1"
          @click="toggleTab(tab.tab_id)"
        >
          <div>
            <i :class="['bi', tab.tab_icon]"></i>
            {{ tab.tab_nama }}
          </div>

          <i
            class="bi"
            :class="isTabOpen(tab.tab_id) ? 'bi-chevron-up' : 'bi-chevron-down'"
          ></i>
        </div>

        <!-- ISI GROUP (DEFAULT HIDE) -->
        <div v-show="isTabOpen(tab.tab_id)">
          <router-link
            v-for="mod in modulesByTab(tab.tab_id)"
            :key="'mobile-mod-' + mod.module_id"
            :to="normalizeUrl(mod.module_link)"
            custom
            v-slot="{ navigate, href, isActive }"
          >
            <a
              :href="href"
              @click="navigate"
              class="nav-link-custom"
              :class="{ active: isActive }"
            >
              <i class="bi bi-chevron-right"></i>
              <span class="u-txt-ellipsis">{{ mod.module_nama }}</span>
            </a>
          </router-link>
        </div>
      </div>

      <div class="mb-4"></div>
    </div>
  </div>
</template>

<script>
import Swal from "sweetalert2";
import { useAuthStore } from "@/stores/auth";

export default {
  name: "Navbar",

  data() {
    return {
      outsideClickHandler: null,
      openTabs: {}, // <-- DEFAULT: SEMUA GROUP TERTUTUP
    };
  },

  computed: {
    auth() {
      return useAuthStore();
    },
    loginStore() {
      return this.auth.login || {};
    },
    profileStore() {
      return this.auth.profile || {};
    },
    softwareStore() {
      return this.auth.software || {};
    },

    tabs() {
      return this.loginStore?.tab || [];
    },
    modules() {
      return this.loginStore?.module || [];
    },

    profileKode() {
      return this.profileStore?.kode || "";
    },
    profileNama() {
      return (this.profileStore?.nama || "").toUpperCase();
    },
    profileAlamat() {
      return this.profileStore?.alamat || "";
    },
  },

  methods: {
    /* ================= GROUP MENU ================= */
    toggleTab(tabId) {
      if (this.$set) {
        this.$set(this.openTabs, tabId, !this.openTabs[tabId]);
      } else {
        this.openTabs[tabId] = !this.openTabs[tabId];
      }
    },

    isTabOpen(tabId) {
      return !!this.openTabs[tabId];
    },

    modulesByTab(tabId) {
      return this.modules.filter(m => m.module_tab_id == tabId);
    },

    /* ================= SIDENAV ================= */
    openNav() {
      this.closeNav();
      setTimeout(() => {
        document.body.classList.add("sidenav-open");
        if (this.$refs.sidenavMobile) {
          this.$refs.sidenavMobile.style.width = "290px";
        }
      }, 200);
    },

    closeNav() {
      document.body.classList.remove("sidenav-open");
      document.querySelectorAll(".sidenav").forEach(nav => {
        nav.style.width = "0";
      });
    },

    normalizeUrl(link) {
      try {
        const url = new URL(link, window.location.origin);
        const parts = url.pathname.split("/").filter(Boolean);
        return "/" + [...new Set(parts)].join("/");
      } catch {
        return link;
      }
    },

    /* ================= ACTION ================= */
    logout() {
      Swal.fire({
        title: "Yakin ingin logout?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Logout",
      }).then(res => {
        if (res.isConfirmed) {
          this.auth.logout();
          window.location.href = "/login";
        }
      });
    },

    showHelp() {
      Swal.fire("Help", "Help belum tersedia", "info");
    },

    setupOutsideClickListener() {
      this.outsideClickHandler = e => {
        if (
          !e.target.closest(".sidenav") &&
          !e.target.closest(".burger-menu")
        ) {
          this.closeNav();
        }
      };
      window.addEventListener("click", this.outsideClickHandler);
    },
  },

  mounted() {
    this.setupOutsideClickListener();
  },

  beforeUnmount() {
    window.removeEventListener("click", this.outsideClickHandler);
  },

  watch: {
    "$route.fullPath"() {
      this.closeNav();
    },
  },
};
</script>

<style scoped src="@/components/navbar.css"></style>
