// src/main.js
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import pinia from "./stores"; // ⬅️ instance Pinia (sudah di-setup di src/stores/index.js)
import "@/main.css";

// ===== BOOTSTRAP =====
// CSS
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

// JS (bundle sudah termasuk Popper.js)
import "bootstrap/dist/js/bootstrap.bundle.min.js";

// Import namespace Bootstrap agar bisa dipakai via `bootstrap.Modal`
import * as bootstrap from "bootstrap";
window.bootstrap = bootstrap;

// ===== JQUERY + DATATABLES =====
import $ from "jquery";
window.$ = window.jQuery = $;

import "datatables.net";
import "datatables.net-responsive";
import "datatables.net-dt/css/dataTables.dataTables.min.css";
import "datatables.net-responsive-dt/css/responsive.dataTables.css";

// ===== AXIOS =====
import axios from "axios";
window.axios = axios; // optional: buat axios global

// ===== TOASTR =====
import "toastr/build/toastr.min.css";
import toastr from "toastr";
window.toastr = toastr;

// ===== SWEETALERT2 =====
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
window.Swal = Swal;

// ===== CLEAVE (vue wrapper) =====
import Cleave from "vue-cleave-component";

// ===== CKEDITOR 5 (VUE) =====
import { CkeditorPlugin } from "@ckeditor/ckeditor5-vue";

// ===== INIT APP =====
const app = createApp(App);

// register global components (Cleave tersedia sebagai <cleave />)
app.component("cleave", Cleave);

// Toastr default config
toastr.options = {
  closeButton: true,
  progressBar: true,
  positionClass: "toast-top-right",
  timeOut: "2500",
};

// inject ke global Vue instance (bisa dipakai via this.$toastr / this.$swal / this.$axios)
app.config.globalProperties.$toastr = toastr;
app.config.globalProperties.$swal = Swal;
app.config.globalProperties.$axios = axios;
app.config.globalProperties.$jQuery = $;

// pasang plugin-plugin Vue
app.use(CkeditorPlugin);
app.use(pinia); // ⬅️ pasang Pinia dulu
app.use(router); // ⬅️ lalu router

// Title dari .env (Vite)
document.title = import.meta.env.VITE_SOFTWARE_NAME;

// Mount
app.mount("#app");
