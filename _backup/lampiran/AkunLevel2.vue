<template>
  <div class="container-fluid">
    <Navbar />

    <!-- Judul dan Breadcrumb -->
    <div class="mb-3 mt-3">
      <h3 class="mb-1">
        <i class="bi bi-paperclip"></i>
        Akun Level 2
      </h3>

      <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><a href="#">Home</a></li>
          <li class="breadcrumb-item"><a href="#">System</a></li>
          <li class="breadcrumb-item active" aria-current="page">Akun Level 2</li>
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

            <!-- Level1 -->
            <div class="form-floating mb-3">
              <select class="form-select" v-model="form.level1_id" id="formLevel1">
                <option value="">Pilih Level 1</option>
                <option v-for="s in level1List" :key="s.id" :value="s.id">
                  {{ s.nama }}
                </option>
              </select>
              <label for="formLevel1" class="form-label">Level1</label>
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
              <select class="form-select" v-model="filter.level1_id" id="filterLevel1">
                <option value="">Pilih Level 1</option>

                <option v-for="s in level1List" :key="s.id" :value="s.id">
                  {{ s.nama }}
                </option>
              </select>

              <label for="filterLevel1" class="form-label">Level 1</label>
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
        level1_id: "",
        status: 1,
      },

      form: {
        id: "",
        nama: "",
        level1_id: "",
        status: 1,
      },

      errors: {},
      level1List: [],

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

    this.loadLevel1List();
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

    // load combo level1
    async loadLevel1List() {
      try {
        const url = `${this.baseUrl}/lampiran/akun_level_1_combo`;
        const res = await axios.get(url, this.tokenHeaders);
        this.level1List = res.data || [];
      } catch (e) {
        console.error("loadLevel1List", e);
        alert("Gagal memuat daftar level1. Silakan coba lagi.");
      }
    },

    // Search global DataTables
    doSearch() {
      if (this.table) this.table.search(this.searchText).draw();
    },

    // init datatable
    initDataTable() {
      const url = `${this.baseUrl}/lampiran/akun_level_2`;

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
            d.level1_id = this.filter.level1_id;
          },
        },
        columns: [
          { data: "id", visible: false },
          { data: "nama" },
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
            orderable: false,
            width: "120px",
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

      const url = `${this.baseUrl}/lampiran/akun_level_2_show/${id}`;
      try {
        const resp = await axios.get(url, this.tokenHeaders);
        const data = resp.data || {};
        this.form.id = id;
        this.form.nama = data.nama ?? "";
        this.form.level1_id = data.level1_id ?? "";
        this.form.status = typeof data.status !== "undefined" ? data.status : 1;

        this.showFormModal();
      } catch (err) {
        console.error("openEditModal", err);
        alert("Gagal mengambil data. Silakan coba lagi.");
      }
    },

    async submitForm() {
      this.errors = {};

      const url = `${this.baseUrl}/lampiran/akun_level_2_add`;
      const payload = {
        id: this.isEditMode ? this.form.id : "",
        nama: this.form.nama,
        level1_id: this.form.level1_id,
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
        level1_id: "",
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
        level1_id: "",
        status: 1,
      };
      if (this.table) this.table.ajax.reload();
    },
  },
};
</script>

<style scoped src="@/apps/lampiran/akunlevel2.css"></style>
