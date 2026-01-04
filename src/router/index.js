// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import pinia from "@/stores"; // ✅ pakai instance Pinia dari src/stores/index.js
import { useAuthStore } from "@/stores/auth";

import Login from "../pages/Login.vue";
import Home from "../pages/Home.vue";

import Software from "../apps/system/Software.vue";
import Tab from "../apps/system/Tab.vue";
import Module from "../apps/system/Module.vue";

import Holding from "../apps/profile/Holding.vue";
import Company from "../apps/profile/Company.vue";
import Branch from "../apps/profile/Branch.vue";
import Default from "../apps/profile/Default.vue";
import Access from "../apps/profile/Access.vue";

import Karyawan from "../apps/master/Karyawan.vue";
import Sesi from "../apps/master/Sesi.vue";
import Olahraga from "../apps/master/Olahraga.vue";
import Lapangan from "../apps/master/Lapangan.vue";
import GroupVisitor from "../apps/master/GroupVisitor.vue";
import Visitor from "../apps/master/Visitor.vue";

import JadwalHarian from "../apps/transaction/JadwalHarian.vue";
import ScanTicket from "../apps/transaction/ScanTicket.vue";
import Payment from "../apps/transaction/Payment.vue";
import Reschedule from "../apps/transaction/Reschedule.vue";
import Refund from "../apps/transaction/Refund.vue";
import Blocking from "../apps/transaction/Blocking.vue";
import Faq from "../apps/transaction/Faq.vue";
import UpdateData from "../apps/transaction/UpdateData.vue";

import LaporanHarian from "../apps/laporan/Harian.vue";
import LaporanPemakaian from "../apps/laporan/Pemakaian.vue";

const routes = [
  { path: "/", name: "Login", component: Login },
  { path: "/login", name: "LoginPage", component: Login },
  { path: "/home", name: "Home", component: Home },

  { path: "/system/software", name: "Software", component: Software },
  { path: "/system/tab", name: "Tab", component: Tab },
  { path: "/system/module", name: "Module", component: Module },

  { path: "/profile/holding", name: "Holding", component: Holding },
  { path: "/profile/company", name: "Company", component: Company },
  { path: "/profile/branch", name: "Branch", component: Branch },
  { path: "/profile/default", name: "Default", component: Default },
  { path: "/profile/access", name: "Access", component: Access },

  { path: "/master/karyawan", name: "Karyawan", component: Karyawan },
  { path: "/master/sesi", name: "Sesi", component: Sesi },
  { path: "/master/olahraga", name: "Olahraga", component: Olahraga },
  { path: "/master/lapangan", name: "Lapangan", component: Lapangan },
  { path: "/master/group_visitor", name: "GroupVisitor", component: GroupVisitor },
  { path: "/master/visitor", name: "Visitor", component: Visitor },

  { path: "/transaction/jadwal_harian", name: "JadwalHarian", component: JadwalHarian },
  { path: "/transaction/scan_ticket", name: "ScanTicket", component: ScanTicket },
  { path: "/transaction/payment", name: "Payment", component: Payment },
  { path: "/transaction/reschedule", name: "Reschedule", component: Reschedule },
  { path: "/transaction/refund", name: "Refund", component: Refund },
  { path: "/transaction/blocking", name: "Blocking", component: Blocking },
  { path: "/transaction/faq", name: "Faq", component: Faq },
  { path: "/transaction/update_data", name: "UpdateData", component: UpdateData },

  { path: "/laporan/harian", name: "LaporanHarian", component: LaporanHarian },
  { path: "/laporan/pemakaian", name: "LaporanPemakaian", component: LaporanPemakaian },

  {
    path: "/:pathMatch(.*)*",
    redirect: "/login",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// ==========================================
// 🔥 PINIA ROUTE GUARD
// ==========================================
router.beforeEach((to, from, next) => {
  const auth = useAuthStore(pinia); // ✅ pakai instance pinia dari src/stores
  const isLoggedIn = !!(auth.login && auth.login.token);

  const publicPages = ["/", "/login"];
  const authRequired = !publicPages.includes(to.path);

  // belum login tapi mau masuk halaman protected
  if (authRequired && !isLoggedIn) {
    return next("/login");
  }

  // sudah login tapi masih mengakses "/" atau "/login" → lempar ke /home
  if (!authRequired && isLoggedIn && (to.path === "/" || to.path === "/login")) {
    return next("/home");
  }

  next();
});

export default router;
