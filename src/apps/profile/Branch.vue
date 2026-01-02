<template>
  <div class="container-fluid" v-cloak>
    <Navbar />

    <!-- Judul + Breadcrumb -->
    <div class="mb-3 mt-3">
      <h3 class="mb-1">
        <i class="bi bi-buildings"></i>
        Branch
      </h3>

      <nav aria-label="breadcrumb">
        <ol class="breadcrumb mb-0 small">
          <li class="breadcrumb-item"><a href="#">Home</a></li>
          <li class="breadcrumb-item"><a href="#">Profile</a></li>
          <li class="breadcrumb-item active" aria-current="page">Branch</li>
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

    <!-- Tabel -->
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
          id="tblMain"
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

            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
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
  name: "BranchPage",

  components: {
    Navbar,
  },

  data() {
    return {
      baseUrl: import.meta.env.VITE_API_ACTASYS,
      token: "",
      tokenHeaders: "",
      tokenList: "",

      userNama: "",

      table: null,
      isEditMode: false,
      isLoading: false,

      form: {
        id: "",
        nama: "",
        kode: "",
        holding_id: import.meta.env.VITE_HOLDING_ID,
        company_id: "",
        status: 1,
      },

      filter: {
        nama: "",
        holding_id: import.meta.env.VITE_HOLDING_ID,
        company_id: "",
        status: 1,
      },

      errors: {},

      companyList: [],

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

    // hanya supaya konsisten pattern dengan modul lain kalau perlu nanti
    isEdit() {
      return this.isEditMode;
    },
  },

  mounted() {
    this.token = this.loginStore.token;
    this.tokenHeaders = { headers: { Token: "Bearer " + this.token } };
    this.tokenList = { Token: "Bearer " + this.token };

    this.loadCompanyList("");
    this.initDataTable();

    // delegated click handler untuk tombol edit dari DataTables
    this.dtEditClickHandler = (e) => {
      const id = $(e.currentTarget).data("id");
      if (id) this.openEditModal(id);
    };
    $("#tblMain").on("click.branch", ".btn-edit", this.dtEditClickHandler);

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
    $("#tblMain").off("click.branch", ".btn-edit");
    this.dtEditClickHandler = null;

    // destroy DataTable instance
    try {
      if (this.table && $.fn.dataTable && $.fn.dataTable.isDataTable("#tblMain")) {
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
    // load company, bisa difilter per holding
    async loadCompanyList() {
      try {
        const url = `${this.baseUrl}/profile/company_combo/${this.form.holding_id}`;
        const res = await axios.get(url, this.tokenHeaders);
        this.companyList = res.data || [];
      } catch (e) {
        console.error("loadCompanyList", e);
      }
    },

    // ---------- DataTable init ----------
    initDataTable() {
      const url = `${this.baseUrl}/profile/branch`;

      this.table = $("#tblMain").DataTable({
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
      $("#tblMain").on("preXhr.dt", () => {
        this.isLoading = true;
      });
      $("#tblMain").on("xhr.dt", () => {
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
        const url = `${this.baseUrl}/profile/branch_show/${id}`;
        const res = await axios.get(url, this.tokenHeaders);
        const data = res.data || {};

        this.form.id = id;
        this.form.nama = data.nama ?? "";
        this.form.kode = data.kode ?? "";
        this.form.holding_id = data.holding_id ?? "";
        this.form.company_id = data.company_id ?? "";
        this.form.status = typeof data.status !== "undefined" ? data.status : 1;

        this.formModalInstance?.show();
      } catch (e) {
        console.error("openEditModal", e);
        alert("Gagal mengambil data. Silakan coba lagi.");
      }
    },

    async submitForm() {
      this.errors = {};

      const url = `${this.baseUrl}/profile/branch_add`;
      const payload = {
        id: this.isEditMode ? this.form.id : "",
        nama: this.form.nama,
        kode: this.form.kode,
        company_id: this.form.company_id,
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
        nama: "",
        kode: "",
        company_id: "",
        Branch_id: "",
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
        Branch_id: "",
        status: 1,
      };

      // reload combo tanpa filter
      this.loadCompanyList("");
      this.loadBranchList("");

      if (this.table) this.table.ajax.reload();
    },

    // dipanggil saat dropdown holding di form berubah
    onCompanyChange() {
      const companyId = this.form.company_id;
      this.form.Branch_id = "";
      this.loadBranchList(companyId);
    },

    onFilterCompanyChange() {
      const companyId = this.filter.company_id;
      this.filter.Branch_id = "";
      this.loadBranchList(companyId);
    },
  },
};
</script>

<style scoped src="@/apps/profile/branch.css"></style>
