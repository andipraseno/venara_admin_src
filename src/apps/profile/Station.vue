<template>
  <div class="container-fluid" v-cloak>
    <Navbar />

    <!-- Judul dan Breadcrumb -->
    <div class="mb-3 mt-3">
      <h3 class="mb-1">
        <i class="bi bi-buildings"></i>
        Station
      </h3>

      <nav aria-label="breadcrumb">
        <ol class="breadcrumb mb-0 small">
          <li class="breadcrumb-item"><a href="#">Home</a></li>
          <li class="breadcrumb-item"><a href="#">Profile</a></li>
          <li class="breadcrumb-item active" aria-current="page">Station</li>
        </ol>
      </nav>
    </div>

    <!-- Toolbar -->
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
      <div class="d-flex gap-2">
        <button class="btn btn-primary" type="button" @click="openAddModal">
          <i class="bi bi-plus-circle me-1"></i> Tambah
        </button>

        <button
          class="btn btn-outline-secondary"
          type="button"
          data-bs-toggle="modal"
          data-bs-target="#filterModal"
        >
          <i class="bi bi-funnel me-1"></i> Filter
        </button>
      </div>

      <!-- Quick filter -->
      <div class="d-flex align-items-center gap-2">
        <!-- Search kanan -->
        <div class="input-group input-group-sm" style="max-width: 260px">
          <input
            type="text"
            class="form-control"
            v-model="searchText"
            placeholder="Cari nama / kode…"
            @keyup.enter="doSearch"
          />
          <button class="btn btn-outline-secondary" @click="doSearch">
            <i class="bi bi-search"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- DataTable -->
    <div class="position-relative">
      <!-- overlay loading -->
      <div
        v-if="isLoading"
        class="loading-overlay d-flex align-items-center justify-content-center"
      >
        <div class="text-center">
          <div class="spinner-border mb-2" role="status" aria-hidden="true"></div>
          <div class="small text-muted">Memuat data…</div>
        </div>
      </div>

      <div class="table-responsive rounded-3 border">
        <table
          id="tableMain"
          class="table table-hover align-middle mb-0 display nowrap"
          style="width: 100%"
        >
          <thead class="table-light sticky-thead">
            <tr>
              <th>Nama</th>
              <th class="text-center">Kode</th>
              <th class="text-center">Status</th>
              <th class="text-center">Action</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
    </div>

    <!-- Form Modal (Tambah + Edit) -->
    <div
      class="modal fade"
      id="formModal"
      tabindex="-1"
      aria-labelledby="formModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <form @submit.prevent="submitForm" class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="formModalLabel">
              <i :class="isEditMode ? 'bi bi-pencil-square me-2' : 'bi bi-plus-circle me-2'"></i>
              {{ isEditMode ? "Edit Data" : "Tambah Data" }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>

          <div class="modal-body">
            <!-- Nama -->
            <div class="form-floating mb-3">
              <input
                type="text"
                v-model="form.nama"
                id="nama"
                class="form-control"
                :class="{ 'is-invalid': errors.nama }"
                placeholder="Nama"
              />
              <label for="nama" class="form-label">Nama</label>
              <div class="invalid-feedback" v-if="errors.nama">{{ errors.nama[0] }}</div>
            </div>

            <!-- Kode -->
            <div class="form-floating mb-3">
              <input
                type="text"
                v-model="form.kode"
                id="kode"
                class="form-control"
                :class="{ 'is-invalid': errors.kode }"
                placeholder="Kode"
              />
              <label for="kode" class="form-label">Kode</label>
              <div class="invalid-feedback" v-if="errors.kode">{{ errors.kode[0] }}</div>
            </div>

            <!-- IP Address -->
            <div class="form-floating mb-3">
              <input
                type="text"
                v-model="form.ip_address"
                id="ip_address"
                class="form-control"
                :class="{ 'is-invalid': errors.ip_address }"
                placeholder="IP Address"
              />
              <label for="ip_address" class="form-label">IP Address</label>
              <div class="invalid-feedback" v-if="errors.ip_address">
                {{ errors.ip_address[0] }}
              </div>
            </div>

            <!-- Company -->
            <div class="form-floating mb-3">
              <select
                class="form-select"
                v-model="form.company_id"
                id="companySelect"
                @change="onCompanyChange"
              >
                <option value="">Pilih Company</option>
                <option v-for="s in companyList" :key="s.id" :value="s.id">
                  {{ s.nama }}
                </option>
              </select>

              <label for="companySelect" class="form-label">Company</label>
            </div>

            <!-- Branch -->
            <div class="form-floating mb-3">
              <select
                class="form-select"
                v-model="form.branch_id"
                id="branchSelect"
                @change="onBranchChange"
              >
                <option value="">Pilih Branch</option>
                <option v-for="s in branchList" :key="s.id" :value="s.id">
                  {{ s.nama }}
                </option>
              </select>
              <label for="branchSelect" class="form-label">Branch</label>
            </div>

            <!-- Store -->
            <div class="form-floating mb-3">
              <select class="form-select" v-model="form.store_id" id="storeSelect">
                <option value="">Pilih Store</option>
                <option v-for="s in storeList" :key="s.id" :value="s.id">
                  {{ s.nama }}
                </option>
              </select>

              <label for="storeSelect" class="form-label">Store</label>
            </div>

            <!-- Status -->
            <div class="form-floating mb-1">
              <select v-model.number="form.status" id="status" class="form-select">
                <option :value="1">Aktif</option>
                <option :value="0">Tidak Aktif</option>
              </select>
              <label for="status" class="form-label">Status</label>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-light border" data-bs-dismiss="modal">
              Batal
            </button>
            <button type="submit" class="btn btn-primary">
              <i :class="isEditMode ? 'bi bi-check2 me-1' : 'bi bi-save2 me-1'"></i>
              {{ isEditMode ? "Update" : "Simpan" }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Filter Modal -->
    <div
      class="modal fade"
      id="filterModal"
      tabindex="-1"
      aria-labelledby="filterModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <form @submit.prevent="doSearch" class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="filterModalLabel">
              <i class="bi bi-funnel me-2"></i>Filter Data
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>

          <div class="modal-body">
            <div class="form-floating mb-3">
              <input
                type="text"
                v-model.trim="filter.nama"
                id="filterNama"
                class="form-control"
                placeholder="Nama"
              />
              <label for="filterNama" class="form-label">Nama</label>
            </div>

            <!-- Company Filter -->
            <div class="form-floating mb-3">
              <select
                class="form-select"
                v-model="filter.company_id"
                @change="onFilterCompanyChange"
              >
                <option value="">Pilih Company</option>
                <option v-for="s in companyList" :key="s.id" :value="s.id">
                  {{ s.nama }}
                </option>
              </select>
              <label class="form-label">Company</label>
            </div>

            <!-- Branch Filter -->
            <div class="form-floating mb-3">
              <select class="form-select" v-model="filter.branch_id" @change="onFilterBranchChange">
                <option value="">Pilih Branch</option>
                <option v-for="s in branchList" :key="s.id" :value="s.id">
                  {{ s.nama }}
                </option>
              </select>

              <label class="form-label">Branch</label>
            </div>

            <!-- Store Filter -->
            <div class="form-floating mb-3">
              <select class="form-select" v-model="filter.store_id">
                <option value="">Pilih Store</option>
                <option v-for="s in storeList" :key="s.id" :value="s.id">
                  {{ s.nama }}
                </option>
              </select>

              <label class="form-label">Store</label>
            </div>

            <!-- Status Filter -->
            <div class="form-floating mb-3">
              <select v-model.number="filter.status" id="filterStatus" class="form-select">
                <option :value="1">Aktif</option>
                <option :value="0">Tidak Aktif</option>
              </select>
              <label for="filterStatus" class="form-label">Status</label>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-light border" @click="resetFilter">Reset</button>
            <button type="submit" class="btn btn-primary" data-bs-dismiss="modal">
              <i class="bi bi-check2-circle me-1"></i>Terapkan
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from "@/stores/auth";
import Navbar from "../../components/Navbar.vue";
import axios from "axios";
import { Modal } from "bootstrap";
import $ from "jquery";
import "datatables.net";
import "datatables.net-responsive";

export default {
  name: "StationPage",

  components: {
    Navbar,
  },

  data() {
    return {
      baseUrl: import.meta.env.VITE_API_ACTASYS,
      token: "",
      tokenHeaders: "",
      tokenList: "",

      table: null,
      isEditMode: false,
      isLoading: false,

      form: {
        id: "",
        nama: "",
        holding_id: import.meta.env.VITE_HOLDING_ID,
        company_id: "",
        branch_id: "",
        store_id: "",
        kode: "",
        ip_address: "",
        status: 1,
      },

      filter: {
        nama: "",
        holding_id: import.meta.env.VITE_HOLDING_ID,
        company_id: "",
        branch_id: "",
        store_id: "",
        status: 1,
      },

      errors: {},
      companyList: [],
      branchList: [],
      storeList: [],

      dtEditClickHandler: null,
      formModalInstance: null,
    };
  },

  computed: {
    // instance store Pinia
    auth() {
      return useAuthStore();
    },
    loginStore() {
      return this.auth.login || {};
    },

    isEdit() {
      return this.isEditMode;
    },
  },

  mounted() {
    this.token = this.loginStore.token;
    this.tokenHeaders = { headers: { Token: "Bearer " + this.token } };
    this.tokenList = { Token: "Bearer " + this.token };

    this.loadCompanyList("");
    this.loadBranchList("");
    this.loadStoreList("");
    this.initDataTable();

    // delegated click handler untuk tombol edit dari DataTables
    this.dtEditClickHandler = (e) => {
      const id = $(e.currentTarget).data("id");
      if (id) this.openEditModal(id);
    };
    $("#tableMain").on("click.station", ".btn-edit", this.dtEditClickHandler);

    // Form modal
    const formEl = document.getElementById("formModal");
    if (formEl) {
      this.formModalInstance = new Modal(formEl, {
        backdrop: "static",
        keyboard: false,
      });

      formEl.addEventListener("shown.bs.modal", () => {
        this.errors = {};
        this.$nextTick(() => {
          const el = document.getElementById("nama");
          if (el) el.focus();
        });
      });

      formEl.addEventListener("hidden.bs.modal", () => {
        this.resetForm();
        this.isEditMode = false;
      });
    }

    // autofocus filter nama saat filterModal dibuka
    const filterEl = document.getElementById("filterModal");
    if (filterEl) {
      filterEl.addEventListener("shown.bs.modal", async () => {
        await this.$nextTick();
        const el = document.getElementById("filterNama");
        if (el) el.focus();
      });
    }
  },

  beforeUnmount() {
    // lepas delegated handler
    $("#tableMain").off("click.station", ".btn-edit");
    this.dtEditClickHandler = null;

    // destroy DataTable instance
    try {
      if (this.table && $.fn.dataTable && $.fn.dataTable.isDataTable("#tableMain")) {
        this.table.destroy(true);
      }
    } catch (e) {
      // ignore
    }

    // tutup modal
    try {
      this.formModalInstance?.hide();
      this.formModalInstance = null;
    } catch (e) {
      // ignore
    }
  },

  methods: {
    async loadCompanyList() {
      try {
        const url = `${this.baseUrl}/profile/company_combo/${this.form.holding_id}`;
        const res = await axios.get(url, this.tokenHeaders);
        this.companyList = res.data || [];
      } catch (e) {
        console.error("loadCompanyList", e);
      }
    },

    async loadBranchList(companyId = "") {
      try {
        const url = `${this.baseUrl}/profile/branch_combo/${companyId}`;
        const res = await axios.get(url, this.tokenHeaders);
        this.branchList = res.data || [];
      } catch (e) {
        console.error("loadBranchList", e);
      }
    },

    async loadStoreList(branchId = "") {
      try {
        const url = `${this.baseUrl}/profile/store_combo/${branchId}`;
        const res = await axios.get(url, this.tokenHeaders);
        this.storeList = res.data || [];
      } catch (e) {
        console.error("loadStoreList", e);
      }
    },

    // ---------- DataTable init ----------
    initDataTable() {
      const url = `${this.baseUrl}/profile/station`;

      this.table = $("#tableMain").DataTable({
        dom: 't<"d-flex justify-content-between align-items-center mt-3"ip>',
        processing: true,
        serverSide: true,
        responsive: true,
        pageLength: 25,
        ajax: {
          url,
          type: "GET",
          headers: this.tokenList,
          data: (d) => {
            d.nama = this.filter.nama;
            d.holding_id = this.filter.holding_id;
            d.company_id = this.filter.company_id;
            d.branch_id = this.filter.branch_id;
            d.store_id = this.filter.store_id;
            d.status = this.filter.status;
          },
        },
        columns: [
          { data: "nama" },
          {
            data: "kode",
            className: "text-center",
            width: "120px",
          },
          {
            data: "status",
            className: "text-center",
            width: "120px",
            render(data) {
              return data == 1
                ? '<span class="badge text-bg-success">Aktif</span>'
                : '<span class="badge text-bg-secondary">Tidak Aktif</span>';
            },
          },
          {
            data: null,
            className: "text-center",
            orderable: false,
            width: "120px",
            render(row) {
              return `
                <div class="btn-group btn-group-sm" role="group">
                  <button class="btn btn-warning btn-edit" data-id="${row.id}" title="Edit">
                    <i class="bi bi-pencil-square me-1"></i>Edit
                  </button>
                </div>`;
            },
          },
        ],
        language: {
          paginate: { previous: "&laquo;", next: "&raquo;" },
          info: "Menampilkan _START_ - _END_ dari _TOTAL_ data",
          zeroRecords: "Tidak ada data",
          processing: "Memuat data…",
        },
      });

      // overlay loading hooks
      $("#tableMain").on("preXhr.dt", () => {
        this.isLoading = true;
      });
      $("#tableMain").on("xhr.dt", () => {
        this.isLoading = false;
      });
    },

    // ---------- Actions ----------
    openAddModal() {
      this.isEditMode = false;
      this.resetForm();
      this.formModalInstance?.show();
    },

    async openEditModal(id) {
      this.isEditMode = true;
      this.errors = {};

      try {
        const url = `${this.baseUrl}/profile/station_show/${id}`;
        const res = await axios.get(url, this.tokenHeaders);
        const data = res.data || {};

        this.form.id = id;
        this.form.company_id = data.company_id ?? "";
        this.form.branch_id = data.branch_id ?? "";
        this.form.store_id = data.store_id ?? "";
        this.form.nama = data.nama ?? "";
        this.form.kode = data.kode ?? "";
        this.form.ip_address = data.ip_address ?? "";
        this.form.status = typeof data.status !== "undefined" ? data.status : 1;

        // load cascading combos sesuai data
        await this.loadCompanyList(this.form.holding_id);

        if (this.form.company_id) {
          await this.loadBranchList(this.form.company_id);
        }
        if (this.form.branch_id) {
          await this.loadStoreList(this.form.branch_id);
        }

        this.formModalInstance?.show();
      } catch (e) {
        console.error("openEditModal", e);
        alert("Gagal mengambil data. Silakan coba lagi.");
      }
    },

    async submitForm() {
      this.errors = {};

      const url = `${this.baseUrl}/profile/station_add`;

      const payload = {
        id: this.isEditMode ? this.form.id : "",
        company_id: this.form.company_id,
        branch_id: this.form.branch_id,
        store_id: this.form.store_id,
        nama: this.form.nama,
        kode: this.form.kode,
        ip_address: this.form.ip_address,
        status: this.form.status,
        by: localStorage.getItem("user_nama"),
      };

      try {
        await axios.post(url, payload, this.tokenHeaders);
        this.formModalInstance?.hide();
        this.resetForm();
        if (this.table) this.table.ajax.reload(null, false);
      } catch (error) {
        if (error.response && error.response.status === 400) {
          this.errors = error.response.data || {};
        } else {
          console.error("submitForm error", error);
          alert("Terjadi kesalahan. Coba lagi nanti.");
        }
      }
    },

    resetForm() {
      this.form = {
        id: "",
        company_id: "",
        branch_id: "",
        store_id: "",
        nama: "",
        kode: "",
        ip_address: "",
        status: 1,
      };
      this.errors = {};
    },

    // ---------- Filter ----------
    doSearch() {
      if (this.table) this.table.ajax.reload();
    },

    resetFilter() {
      this.filter = {
        nama: "",
        company_id: "",
        branch_id: "",
        store_id: "",
        status: 1,
      };

      // reload combo tanpa filter
      this.loadCompanyList("");
      this.loadBranchList("");
      this.loadStoreList("");

      if (this.table) this.table.ajax.reload();
    },

    onCompanyChange() {
      const companyId = this.form.company_id;
      this.form.branch_id = "";
      this.form.store_id = "";
      this.loadBranchList(companyId);
      this.storeList = [];
    },

    onBranchChange() {
      const branchId = this.form.branch_id;
      this.form.store_id = "";
      this.loadStoreList(branchId);
    },

    onFilterCompanyChange() {
      const companyId = this.filter.company_id;
      this.filter.branch_id = "";
      this.filter.store_id = "";
      this.loadBranchList(companyId);
      this.storeList = [];
    },

    onFilterBranchChange() {
      const branchId = this.filter.branch_id;
      this.filter.store_id = "";
      this.loadStoreList(branchId);
    },
  },
};
</script>

<style scoped src="@/apps/profile/station.css"></style>
