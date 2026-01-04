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

import GroupSupplier from "../apps/lampiran/GroupSupplier.vue";
import GroupCustomer from "../apps/lampiran/GroupCustomer.vue";
import KategoriGudang from "../apps/lampiran/KategoriGudang.vue";
import AkunLevel1 from "../apps/lampiran/AkunLevel1.vue";
import AkunLevel2 from "../apps/lampiran/AkunLevel2.vue";
import AkunLevel3 from "../apps/lampiran/AkunLevel3.vue";
import SatuanBarang from "../apps/lampiran/SatuanBarang.vue";
import KategoriBarang from "../apps/lampiran/KategoriBarang.vue";
import GradeBarang from "../apps/lampiran/GradeBarang.vue";
import AvailabilityBarang from "../apps/lampiran/AvailabilityBarang.vue";
import SeriesBarang from "../apps/lampiran/SeriesBarang.vue";
import BrandBarang from "../apps/lampiran/BrandBarang.vue";
import SubBrandBarang1 from "../apps/lampiran/SubBrandBarang1.vue";
import SubBrandBarang2 from "../apps/lampiran/SubBrandBarang2.vue";
import SubBrandBarang3 from "../apps/lampiran/SubBrandBarang3.vue";

import Akun from "../apps/master/Akun.vue";
import Gudang from "../apps/master/Gudang.vue";
import Ekspedisi from "../apps/master/Ekspedisi.vue";
import Supplier from "../apps/master/Supplier.vue";
import Customer from "../apps/master/Customer.vue";
import Karyawan from "../apps/master/Karyawan.vue";
import Barang from "../apps/master/Barang.vue";
import Valuta from "../apps/master/Valuta.vue";
import Payment from "../apps/master/Payment.vue";

import TransferStokKirim from "../apps/inventory/TransferStokKirim.vue";
import TransferStokKirimDetail from "../apps/inventory/TransferStokKirimDetail.vue";
import TransferStokTerima from "../apps/inventory/TransferStokTerima.vue";
import TransferStokTerimaDetail from "../apps/inventory/TransferStokTerimaDetail.vue";
import Waste from "../apps/inventory/Waste.vue";
import WasteDetail from "../apps/inventory/WasteDetail.vue";
import Overzak from "../apps/inventory/Overzak.vue";
import OverzakDetail from "../apps/inventory/OverzakDetail.vue";
import StokOpname from "../apps/inventory/StokOpname.vue";
import StokOpnameDetail from "../apps/inventory/StokOpnameDetail.vue";
import StokOpnameApproval from "../apps/inventory/StokOpnameApproval.vue";
import StokOpnameApprovalDetail from "../apps/inventory/StokOpnameApprovalDetail.vue";
import OpeningBalance from "../apps/inventory/OpeningBalance.vue";
import OpeningBalanceDetail from "../apps/inventory/OpeningBalanceDetail.vue";

import CashBankVoucher from "../apps/finance/CashBankVoucher.vue";
import CashBankVoucherDetail from "../apps/finance/CashBankVoucherDetail.vue";
import GeneralJournalVoucher from "../apps/finance/GeneralJournalVoucher.vue";
import GeneralJournalVoucherDetail from "../apps/finance/GeneralJournalVoucherDetail.vue";

import PurchaseOrder from "../apps/beli/Pesan.vue";
import PurchaseOrderDetail from "../apps/beli/PesanDetail.vue";
import PurchaseReceive from "../apps/beli/Receive.vue";
import PurchaseReceiveDetail from "../apps/beli/ReceiveDetail.vue";
import PurchaseRetur from "../apps/beli/Retur.vue";
import PurchaseReturDetail from "../apps/beli/ReturDetail.vue";

import POS from "../apps/sales/POS.vue";
import POSDetail from "../apps/sales/POSDetail.vue";

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

  { path: "/lampiran/group_supplier", name: "GroupSupplier", component: GroupSupplier },
  { path: "/lampiran/group_customer", name: "GroupCustomer", component: GroupCustomer },
  { path: "/lampiran/kategori_gudang", name: "KategoriGudang", component: KategoriGudang },
  { path: "/lampiran/akun_level_1", name: "AkunLevel1", component: AkunLevel1 },
  { path: "/lampiran/akun_level_2", name: "AkunLevel2", component: AkunLevel2 },
  { path: "/lampiran/akun_level_3", name: "AkunLevel3", component: AkunLevel3 },
  { path: "/lampiran/satuan_barang", name: "SatuanBarang", component: SatuanBarang },
  { path: "/lampiran/kategori_barang", name: "KategoriBarang", component: KategoriBarang },
  { path: "/lampiran/grade_barang", name: "GradeBarang", component: GradeBarang },
  {
    path: "/lampiran/availability_barang",
    name: "AvailabilityBarang",
    component: AvailabilityBarang,
  },
  { path: "/lampiran/series_barang", name: "SeriesBarang", component: SeriesBarang },
  { path: "/lampiran/brand_barang", name: "BrandBarang", component: BrandBarang },
  { path: "/lampiran/group_barang_1", name: "SubBrandBarang1", component: SubBrandBarang1 },
  { path: "/lampiran/group_barang_2", name: "SubBrandBarang2", component: SubBrandBarang2 },
  { path: "/lampiran/group_barang_3", name: "SubBrandBarang3", component: SubBrandBarang3 },

  { path: "/master/akun", name: "Akun", component: Akun },
  { path: "/master/gudang", name: "Gudang", component: Gudang },
  { path: "/master/ekspedisi", name: "Ekspedisi", component: Ekspedisi },
  { path: "/master/supplier", name: "Supplier", component: Supplier },
  { path: "/master/customer", name: "Customer", component: Customer },
  { path: "/master/karyawan", name: "Karyawan", component: Karyawan },
  { path: "/master/barang", name: "Barang", component: Barang },
  { path: "/master/valuta", name: "Valuta", component: Valuta },
  { path: "/master/payment", name: "Payment", component: Payment },

  {
    path: "/inventory/transfer_stok_kirim",
    name: "TransferStokKirim",
    component: TransferStokKirim,
  },
  {
    path: "/inventory/transfer_stok_kirim_detail/:id",
    name: "TransferStokKirimDetail",
    component: TransferStokKirimDetail,
  },
  {
    path: "/inventory/transfer_stok_terima",
    name: "TransferStokTerima",
    component: TransferStokTerima,
  },
  {
    path: "/inventory/transfer_stok_terima_detail/:id",
    name: "TransferStokTerimaDetail",
    component: TransferStokTerimaDetail,
  },
  { path: "/inventory/waste", name: "Waste", component: Waste },
  { path: "/inventory/waste_detail/:id", name: "WasteDetail", component: WasteDetail },
  { path: "/inventory/overzak", name: "Overzak", component: Overzak },
  { path: "/inventory/overzak_detail/:id", name: "OverzakDetail", component: OverzakDetail },
  { path: "/inventory/stok_opname", name: "StokOpname", component: StokOpname },
  {
    path: "/inventory/stok_opname_detail/:id",
    name: "StokOpnameDetail",
    component: StokOpnameDetail,
  },
  {
    path: "/inventory/stok_opname_approval",
    name: "StokOpnameApproval",
    component: StokOpnameApproval,
  },
  {
    path: "/inventory/stok_opname_approval_detail/:id",
    name: "StokOpnameApprovalDetail",
    component: StokOpnameApprovalDetail,
  },
  { path: "/inventory/opening_balance", name: "OpeningBalance", component: OpeningBalance },
  {
    path: "/inventory/opening_balance_detail",
    name: "OpeningBalanceDetail",
    component: OpeningBalanceDetail,
  },

  { path: "/finance/cash_bank_voucher", name: "CashBankVoucher", component: CashBankVoucher },
  {
    path: "/finance/cash_bank_voucher_detail/:id",
    name: "CashBankVoucherDetail",
    component: CashBankVoucherDetail,
  },
  {
    path: "/finance/general_journal_voucher",
    name: "GeneralJournalVoucher",
    component: GeneralJournalVoucher,
  },
  {
    path: "/finance/general_journal_voucher_detail/:id",
    name: "GeneralJournalVoucherDetail",
    component: GeneralJournalVoucherDetail,
  },

  { path: "/beli/pesan", name: "PurchaseOrder", component: PurchaseOrder },
  {
    path: "/beli/pesan_detail/:id",
    name: "PurchaseOrderDetail",
    component: PurchaseOrderDetail,
  },

  { path: "/sales/pos", name: "POS", component: POS },
  { path: "/sales/pos_detail/:id", name: "POSDetail", component: POSDetail },

  { path: "/beli/receive", name: "PurchaseReceive", component: PurchaseReceive },
  {
    path: "/beli/receive_detail/:id",
    name: "PurchaseReceiveDetail",
    component: PurchaseReceiveDetail,
  },

  { path: "/beli/retur", name: "PurchaseRetur", component: PurchaseRetur },
  { path: "/beli/retur_detail/:id", name: "PurchaseReturDetail", component: PurchaseReturDetail },

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
