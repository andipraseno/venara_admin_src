<template>
  <div id="app">
    <Navbar
      v-if="isLoggedIn"
      ref="navbarRef"
      :initial-company="companyObj"
      @go-home="handleGoHome"
      @logout="handleLogout"
      @show-help="handleShowHelp"
      @open-nav="handleOpenNav"
    />

    <!-- Ketika belum login: tampilan full tanpa navbar -->
    <main class="app-main" v-if="!isLoggedIn">
      <router-view />
    </main>

    <!-- Ketika sudah login: konten punya margin-top agar tidak ketutup navbar -->
    <main class="app-main2" v-else>
      <router-view />
    </main>
  </div>
</template>

<script>
import Navbar from "@/components/Navbar.vue";
import { useAuthStore } from "@/stores/auth";
import "@/app.css";

export default {
  name: "App",
  components: { Navbar },

  data() {
    return {
      rootUrl: import.meta.env.VITE_API_ACTASYS,
      softwareId: import.meta.env.VITE_SOFTWARE_ID,
      profileId: import.meta.env.VITE_HOLDING_ID,

      navbarOffset: 0, // sekarang belum dipakai di template, tapi kita tetap hitung
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

    // status login diambil dari Pinia (auth.login.token)
    isLoggedIn() {
      return !!(this.auth.login && this.auth.login.token);
    },

    // company untuk dikirim ke Navbar (kalau Navbar masih pakai prop)
    companyObj() {
      const c = this.auth.company || {};
      return {
        kode: c.kode || "",
        nama: c.nama || "",
        alamat: c.alamat || "",
      };
    },
  },

  mounted() {
    // ukur navbar setelah DOM siap
    this.$nextTick(() => {
      this.updateNavbarOffset();
      window.addEventListener("resize", this.updateNavbarOffset);
    });

    this.initPage();
  },

  beforeUnmount() {
    window.removeEventListener("resize", this.updateNavbarOffset);
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

    updateNavbarOffset() {
      // coba ambil element navbar dari ref dulu, lalu fallback querySelector
      let el = null;

      const navbarComp = this.$refs.navbarRef;
      if (navbarComp && navbarComp.$el) {
        el = navbarComp.$el.querySelector?.(".app-navbar") ?? navbarComp.$el;
      }
      if (!el) el = document.querySelector(".app-navbar");

      if (el) {
        const rect = el.getBoundingClientRect();
        // +8px supaya konten tidak nempel
        this.navbarOffset = Math.ceil(rect.height + 8);
      } else {
        this.navbarOffset = 64;
      }
    },

    handleGoHome() {
      this.$router.push("/home").catch(() => {});
    },

    handleLogout() {
      // reset state di Pinia
      this.auth.logout();

      // optional: bersihkan storage pinia-persisted
      // (kalau pakai key "actasys-auth" di auth store)
      localStorage.removeItem("actasys-auth");

      this.$router.push("/login").catch(() => {});
    },

    handleShowHelp() {
      if (typeof window !== "undefined" && window.Swal) {
        window.Swal.fire({
          title: "Help",
          text: "Help belum tersedia.",
          icon: "info",
          confirmButtonText: "OK",
        });
      } else {
        alert("Help belum tersedia.");
      }
    },

    handleOpenNav(id) {
      document.body.classList.toggle("sidenav-open");
      const el = document.getElementById(id === "mobile" ? "sidenav-mobile" : `sidenav-${id}`);
      if (el) {
        el.style.width = el.style.width && el.style.width !== "0px" ? "0" : "290px";
      }
    },
  },
};
</script>
