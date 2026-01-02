<template>
  <div class="container-fluid">
    <Navbar />

    <!-- Judul dan Breadcrumb -->
    <div class="mb-3 mt-3">
      <h3 class="mb-1">
        <i class="bi bi-book"></i>
        Gudang
      </h3>

      <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><a href="#">Home</a></li>
          <li class="breadcrumb-item"><a href="#">Master</a></li>
          <li class="breadcrumb-item active" aria-current="page">Gudang</li>
        </ol>
      </nav>
    </div>

    <!-- Kiri: Tambah + Filter  |  Kanan: Search -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <!-- Tombol kiri -->
      <div class="d-flex gap-2">
        <button class="btn btn-primary" @click="openAddModal">
          <i class="bi bi-plus-circle me-1"></i> Tambah
        </button>

        <button
          class="btn btn-outline-secondary"
          data-bs-toggle="modal"
          data-bs-target="#filterModal"
        >
          <i class="bi bi-funnel me-1"></i> Filter
        </button>
      </div>

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

    <!-- DataTable -->
    <div class="table-responsive">
      <table
        id="tableMain"
        class="table table-bordered table-hover display nowrap"
        style="width: 100%"
      >
        <thead class="table-light">
          <tr>
            <th></th>
            <th>Nama</th>
            <th>Alamat</th>
            <th>Telepon</th>
            <th>Branch</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody></tbody>
      </table>
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

            <button
              type="button"
              class="btn-close"
              aria-label="Close"
              @click="hideFormModal"
            ></button>
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
              />
              <label for="nama" class="form-label">Nama</label>
              <div class="invalid-feedback" v-if="errors.nama">{{ errors.nama[0] }}</div>
            </div>

            <!-- Alamat -->
            <div class="form-floating mb-3">
              <input
                type="text"
                v-model="form.alamat"
                id="alamat"
                class="form-control"
                :class="{ 'is-invalid': errors.alamat }"
              />
              <label for="alamat" class="form-label">Alamat</label>
              <div class="invalid-feedback" v-if="errors.alamat">{{ errors.alamat[0] }}</div>
            </div>

            <!-- Telepon -->
            <div class="form-floating mb-3">
              <input
                type="text"
                v-model="form.telepon"
                id="telepon"
                class="form-control"
                :class="{ 'is-invalid': errors.telepon }"
              />
              <label for="telepon" class="form-label">Telepon</label>
              <div class="invalid-feedback" v-if="errors.telepon">{{ errors.telepon[0] }}</div>
            </div>

            <!-- Kategori -->
            <div class="form-floating mb-3">
              <select class="form-select" v-model="form.kategori_id" id="formKategori">
                <option value="">Pilih Kategori</option>
                <option v-for="s in kategoriList" :key="s.id" :value="s.id">
                  {{ s.nama }}
                </option>
              </select>
              <label for="formKategori" class="form-label">Kategori</label>
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

            <!-- Branch (pakai branchList dari branch_combo) -->
            <div class="form-floating mb-3">
              <select class="form-select" v-model="form.branch_id" id="branchSelect">
                <option value="">Pilih Branch</option>
                <option v-for="s in branchList" :key="s.id" :value="s.id">
                  {{ s.nama }}
                </option>
              </select>
              <label for="storeSelect" class="form-label">Branch</label>
            </div>

            <!-- Status -->
            <div class="form-floating mb-3">
              <select v-model.number="form.status" id="status" class="form-select">
                <option :value="1">Aktif</option>
                <option :value="0">Tidak Aktif</option>
              </select>
              <label for="status" class="form-label">Status</label>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="hideFormModal">Batal</button>
            <button type="submit" class="btn btn-primary">
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
            <h5 class="modal-title" id="formModalLabel">
              <i class="bi bi-funnel me-1"></i>
              Filter Data
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
              <input type="text" v-model="filter.nama" id="filterNama" class="form-control" />
              <label for="filterNama" class="form-label">Nama</label>
            </div>

            <div class="form-floating mb-3">
              <select class="form-select" v-model="filter.kategori_id" id="filterKategori">
                <option value="">Pilih Kategori</option>

                <option v-for="s in kategoriList" :key="s.id" :value="s.id">
                  {{ s.nama }}
                </option>
              </select>

              <label for="filterKategori" class="form-label">Kategori</label>
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
              <select class="form-select" v-model="filter.store_id" @change="onFilterBranchChange">
                <option value="">Pilih Branch</option>
                <option v-for="s in branchList" :key="s.id" :value="s.id">
                  {{ s.nama }}
                </option>
              </select>
              <label class="form-label">Branch</label>
            </div>

            <div class="form-floating mb-3">
              <select v-model.number="filter.status" id="filterStatus" class="form-select">
                <option :value="1">Aktif</option>
                <option :value="0">Tidak Aktif</option>
              </select>
              <label for="filterStatus" class="form-label">Status</label>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="resetFilter">Reset</button>
            <button type="submit" class="btn btn-primary" data-bs-dismiss="modal">Terapkan</button>
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
  name: "TabPage",

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

      searchText: "",

      filter: {
        nama: "",
        kategori_id: "",
        holding_id: import.meta.env.VITE_HOLDING_ID,
        company_id: "",
        branch_id: "",
        status: 1,
      },

      form: {
        id: "",
        nama: "",
        alamat: "",
        telepon: "",
        kategori_id: "",
        holding_id: import.meta.env.VITE_HOLDING_ID,
        company_id: "",
        branch_id: "",
        status: 1,
      },

      errors: {},
      kategoriList: [],
      companyList: [],
      branchList: [],

      dtEditClickHandler: null,
      formShownHandler: null,
      formHiddenHandler: null,
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
  },

  mounted() {
    this.token = this.loginStore.token;
    this.tokenHeaders = { headers: { Token: "Bearer " + this.token } };
    this.tokenList = { Token: "Bearer " + this.token };

    this.loadKategoriList();
    this.loadCompanyList();
    this.loadBranchList("");
    this.initDataTable();

    // delegasi click tombol edit di dalam datatable
    this.dtEditClickHandler = (e) => {
      const id = $(e.currentTarget).data("id");
      if (id) this.openEditModal(id);
    };
    $("#tableMain").on("click", ".btn-edit", this.dtEditClickHandler);

    // event modal form
    const formEl = document.getElementById("formModal");
    if (formEl) {
      this.formShownHandler = async () => {
        this.errors = {};
        await this.$nextTick();
        const el = document.getElementById("nama");
        if (el) el.focus();
      };
      formEl.addEventListener("shown.bs.modal", this.formShownHandler);

      this.formHiddenHandler = () => {
        this.resetForm();
        this.isEditMode = false;
      };
      formEl.addEventListener("hidden.bs.modal", this.formHiddenHandler);
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
    // lepas handler datatable
    if (this.dtEditClickHandler) {
      $("#tableMain").off("click", ".btn-edit", this.dtEditClickHandler);
      this.dtEditClickHandler = null;
    }

    // lepas handler modal
    const formEl = document.getElementById("formModal");
    if (formEl && this.formShownHandler) {
      formEl.removeEventListener("shown.bs.modal", this.formShownHandler);
      this.formShownHandler = null;
    }
    if (formEl && this.formHiddenHandler) {
      formEl.removeEventListener("hidden.bs.modal", this.formHiddenHandler);
      this.formHiddenHandler = null;
    }

    // destroy datatable
    if ($.fn.dataTable && $.fn.dataTable.isDataTable("#tableMain")) {
      try {
        $("#tableMain").DataTable().destroy(true);
      } catch (e) {
        // ignore
      }
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

    // di Store, branch diambil dari branch_combo dan ditaruh ke branchList
    async loadBranchList(companyId = "") {
      try {
        const url = `${this.baseUrl}/profile/branch_combo/${companyId}`;
        const res = await axios.get(url, this.tokenHeaders);
        this.branchList = res.data || [];
      } catch (e) {
        console.error("loadBranchList", e);
      }
    },

    // load combo kategori
    async loadKategoriList() {
      try {
        const url = `${this.baseUrl}/lampiran/kategori_gudang_combo`;
        const res = await axios.get(url, this.tokenHeaders);
        this.kategoriList = res.data || [];
      } catch (e) {
        console.error("loadKategoriList", e);
        alert("Gagal memuat daftar kategori. Silakan coba lagi.");
      }
    },

    getModalInstance(id) {
      const el = document.getElementById(id);
      if (!el) return null;
      return Modal.getInstance(el) || new Modal(el, { backdrop: "static" });
    },
    showFormModal() {
      const m = this.getModalInstance("formModal");
      if (m) m.show();
    },
    hideFormModal() {
      const m = this.getModalInstance("formModal");
      if (m) m.hide();
    },

    // Search global DataTables
    doSearch() {
      if (this.table) this.table.search(this.searchText).draw();
    },

    // init datatable
    initDataTable() {
      const url = `${this.baseUrl}/master/gudang`;

      if ($.fn.dataTable && $.fn.dataTable.isDataTable("#tableMain")) {
        $("#tableMain").DataTable().destroy();
        $("#tableMain").empty();
      }

      this.table = $("#tableMain").DataTable({
        dom: 't<"d-flex justify-content-between align-items-center mt-3"ip>',
        processing: true,
        serverSide: true,
        responsive: true,
        pageLength: 25,
        order: [[0, "asc"]],
        ajax: {
          url,
          type: "GET",
          headers: this.tokenList,
          data: (d) => {
            d.nama = this.filter.nama;
            d.status = this.filter.status;
            d.kategori_id = this.filter.kategori_id;
            d.branch_id = this.filter.branch_id;
          },
        },
        columns: [
          { data: "id", visible: false },
          { data: "nama" },
          { data: "alamat" },
          { data: "telepon" },
          { data: "branch_nama" },
          {
            data: "status",
            className: "text-center",
            width: "120px",
            render(data) {
              return data == 1 ? "Aktif" : "Tidak Aktif";
            },
          },
          {
            data: null,
            className: "text-center",
            width: "120px",
            orderable: false,
            render(row) {
              return `
                <button class="btn btn-sm btn-warning btn-edit" data-id="${row.id}">
                  <i class="bi bi-pencil-square me-1"></i>Edit
                </button>`;
            },
          },
        ],
        language: {
          paginate: {
            previous: "&laquo;",
            next: "&raquo;",
          },
          info: "Menampilkan _START_ - _END_ dari _TOTAL_ data",
          processing: "Memuat data…",
          zeroRecords: "Tidak ada data",
        },
      });
    },

    openAddModal() {
      this.isEditMode = false;
      this.resetForm();
      this.showFormModal();
    },

    async openEditModal(id) {
      this.isEditMode = true;
      this.errors = {};

      const url = `${this.baseUrl}/master/gudang_show/${id}`;
      try {
        const resp = await axios.get(url, this.tokenHeaders);
        const data = resp.data || {};
        this.form.id = id;
        this.form.nama = data.nama ?? "";
        this.form.alamat = data.alamat ?? "";
        this.form.telepon = data.telepon ?? "";
        this.form.kategori_id = data.kategori_id ?? "";
        this.form.company_id = data.company_id ?? "";
        this.form.branch_id = data.branch_id ?? "";
        this.form.status = typeof data.status !== "undefined" ? data.status : 1;

        this.loadBranchList(this.form.company_id);

        this.showFormModal();
      } catch (err) {
        console.error("openEditModal", err);
        alert("Gagal mengambil data. Silakan coba lagi.");
      }
    },

    async submitForm() {
      this.errors = {};

      const url = `${this.baseUrl}/master/gudang_add`;
      const payload = {
        id: this.isEditMode ? this.form.id : "",
        nama: this.form.nama,
        alamat: this.form.alamat,
        telepon: this.form.telepon,
        kategori_id: this.form.kategori_id,
        branch_id: this.form.branch_id,
        status: this.form.status,
        by: localStorage.getItem("user_nama"),
      };

      try {
        await axios.post(url, payload, this.tokenHeaders);
        this.hideFormModal();
        this.resetForm();
        if (this.table) this.table.ajax.reload(null, false);
      } catch (error) {
        if (error.response && error.response.status === 400) {
          this.errors = error.response.data || {};
        } else {
          console.error("submitForm", error);
          alert("Terjadi kesalahan. Coba lagi nanti.");
        }
      }
    },

    resetForm() {
      this.form = {
        id: "",
        nama: "",
        alamat: "",
        telepon: "",
        kategori_id: "",
        company_id: "",
        branch_id: "",
        status: 1,
      };
      this.errors = {};
    },

    doSearch() {
      if (this.table) this.table.ajax.reload();
    },

    resetFilter() {
      this.filter = {
        nama: "",
        kategori_id: "",
        company_id: "",
        branch_id: "",
        status: 1,
      };
      if (this.table) this.table.ajax.reload();
    },

    onCompanyChange() {
      const companyId = this.form.company_id;
      this.form.branch_id = "";
      this.loadBranchList(companyId);
    },

    onFilterCompanyChange() {
      const companyId = this.filter.company_id;
      this.filter.branch_id = "";
      this.loadBranchList(companyId);
    },
  },
};
</script>

<style scoped src="@/apps/master/gudang.css"></style>
