<template>
  <div class="container-fluid">
    <Navbar />

    <!-- Breadcrumb & Header -->
    <div class="mb-3 mt-3">
      <h3 class="mb-1">
        <i class="bi bi-gear-wide-connected"></i>
        Module
      </h3>

      <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><a href="#">Home</a></li>
          <li class="breadcrumb-item"><a href="#">System</a></li>
          <li class="breadcrumb-item active" aria-current="page">Module</li>
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
        id="tableMesinAbsensi"
        class="table table-bordered table-hover display nowrap"
        style="width: 100%"
      >
        <thead class="table-light">
          <tr>
            <th></th>
            <th></th>
            <th>Nama</th>
            <th>Link</th>
            <th>Tab</th>
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
            <!-- nama -->
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

            <!-- link -->
            <div class="form-floating mb-3">
              <input
                type="text"
                v-model="form.link"
                id="link"
                class="form-control"
                :class="{ 'is-invalid': errors.link }"
              />
              <label for="link" class="form-label">Link</label>
              <div class="invalid-feedback" v-if="errors.link">{{ errors.link[0] }}</div>
            </div>

            <!-- urutan -->
            <div class="form-floating mb-3">
              <input
                type="number"
                v-model.number="form.urutan"
                id="urutan"
                class="form-control"
                :class="{ 'is-invalid': errors.urutan }"
              />
              <label for="urutan" class="form-label">Urutan</label>
              <div class="invalid-feedback" v-if="errors.urutan">{{ errors.urutan[0] }}</div>
            </div>

            <!-- software -->
            <div class="form-floating mb-3">
              <select
                class="form-select"
                v-model="form.software_id"
                id="software_id"
                @change="loadTabList('form')"
              >
                <option value="">Pilih Software</option>
                <option v-for="s in softwareList" :key="s.id" :value="s.id">
                  {{ s.nama }}
                </option>
              </select>
              <label for="software_id" class="form-label">Software</label>
            </div>

            <!-- tab -->
            <div class="form-floating mb-3">
              <select
                class="form-select"
                v-model="form.tab_id"
                id="tab_id"
                :disabled="!tabListForm.length"
              >
                <option value="">Pilih Tab</option>
                <option v-for="t in tabListForm" :key="t.id" :value="t.id">
                  {{ t.nama }}
                </option>
              </select>
              <label for="tab_id" class="form-label">Tab</label>
            </div>

            <!-- status -->
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
              <select
                class="form-select"
                v-model="filter.software_id"
                id="filterSoftware"
                @change="loadTabList('filter')"
              >
                <option value="">Pilih Software</option>
                <option v-for="s in softwareList" :key="s.id" :value="s.id">
                  {{ s.nama }}
                </option>
              </select>
              <label for="filterSoftware" class="form-label">Software</label>
            </div>

            <div class="form-floating mb-3">
              <select
                class="form-select"
                v-model="filter.tab_id"
                id="filterTab"
                :disabled="!tabListFilter.length"
              >
                <option value="">Pilih Tab</option>
                <option v-for="t in tabListFilter" :key="t.id" :value="t.id">
                  {{ t.nama }}
                </option>
              </select>
              <label for="filterTab" class="form-label">Tab</label>
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
  name: "ModulePage",

  components: {
    Navbar,
  },

  data() {
    return {
      baseUrl: import.meta.env.VITE_API_APPS,
      token: "",
      tokenHeaders: "",
      tokenList: "",

      table: null,

      isEditMode: false,

      searchText: "",

      form: {
        id: "",
        nama: "",
        link: "",
        urutan: 1,
        software_id: "",
        tab_id: "",
        status: 1,
      },

      filter: {
        nama: "",
        software_id: "",
        tab_id: "",
        status: 1,
      },

      softwareList: [],
      tabListForm: [],
      tabListFilter: [],

      errors: {},

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

    this.loadSoftwareList();
    this.initDataTable();

    // delegated click untuk tombol edit di dalam DataTables
    this.dtEditClickHandler = (e) => {
      const id = $(e.currentTarget).data("id");
      if (id) this.openEditModal(id);
    };
    $("#tableMesinAbsensi").on("click", ".btn-edit", this.dtEditClickHandler);

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
      };
      formEl.addEventListener("hidden.bs.modal", this.formHiddenHandler);
    }
  },

  beforeUnmount() {
    if (this.dtEditClickHandler) {
      $("#tableMesinAbsensi").off("click", ".btn-edit", this.dtEditClickHandler);
      this.dtEditClickHandler = null;
    }

    const formEl = document.getElementById("formModal");
    if (formEl && this.formShownHandler) {
      formEl.removeEventListener("shown.bs.modal", this.formShownHandler);
      this.formShownHandler = null;
    }
    if (formEl && this.formHiddenHandler) {
      formEl.removeEventListener("hidden.bs.modal", this.formHiddenHandler);
      this.formHiddenHandler = null;
    }

    if ($.fn.dataTable && $.fn.dataTable.isDataTable("#tableMesinAbsensi")) {
      try {
        $("#tableMesinAbsensi").DataTable().destroy(true);
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

    async loadSoftwareList() {
      try {
        const url = `${this.baseUrl}/apps/software_combo`;
        const res = await axios.get(url, this.tokenHeaders);
        this.softwareList = res.data || [];
      } catch (e) {
        console.error("loadSoftwareList", e);
      }
    },

    async loadTabList(mode = "form") {
      const software_id = mode === "form" ? this.form.software_id : this.filter.software_id;

      if (!software_id) {
        if (mode === "form") {
          this.tabListForm = [];
          this.form.tab_id = "";
        } else {
          this.tabListFilter = [];
          this.filter.tab_id = "";
        }
        return;
      }

      try {
        const url = `${this.baseUrl}/apps/tab_combo/${software_id}`;
        const res = await axios.get(url, this.tokenHeaders);
        const data = res.data || [];

        if (mode === "form") {
          this.tabListForm = data;
          this.form.tab_id = "";
        } else {
          this.tabListFilter = data;
          this.filter.tab_id = "";
        }
      } catch (e) {
        console.error("loadTabList", e);
      }
    },

    // Search global DataTables
    doSearch() {
      if (this.table) this.table.search(this.searchText).draw();
    },

    initDataTable() {
      const url = `${this.baseUrl}/apps/module`;

      if ($.fn.dataTable && $.fn.dataTable.isDataTable("#tableMesinAbsensi")) {
        $("#tableMesinAbsensi").DataTable().destroy();
        $("#tableMesinAbsensi").empty();
      }

      this.table = $("#tableMesinAbsensi").DataTable({
        dom: 't<"d-flex justify-content-between align-items-center mt-3"ip>',
        processing: true,
        serverSide: true,
        responsive: true,
        pageLength: 25,
        order: [
          [0, "asc"],
          [1, "asc"],
        ],
        ajax: {
          url,
          type: "GET",
          headers: this.tokenList,
          data: (d) => {
            d.nama = this.filter.nama;
            d.software_id = this.filter.software_id;
            d.tab_id = this.filter.tab_id;
            d.status = this.filter.status;
          },
        },
        columns: [
          { data: "tab_urutan", visible: false },
          {
            data: "urutan",
            visible: false,
            width: "120px",
          },
          { data: "nama" },
          { data: "link" },
          { data: "tab_nama" },
          {
            data: "status",
            className: "text-center",
            width: "120px",
            render: (data) => (data == 1 ? "Aktif" : "Tidak Aktif"),
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

      try {
        const url = `${this.baseUrl}/apps/module_show/${id}`;
        const res = await axios.get(url, this.tokenHeaders);
        const data = res.data || {};

        this.form.id = data.id ?? "";
        this.form.nama = data.nama ?? "";
        this.form.link = data.link ?? "";
        this.form.urutan = data.urutan ?? 1;
        this.form.software_id = data.software_id ?? "";
        this.form.tab_id = "";
        this.form.status = typeof data.status !== "undefined" ? data.status : 1;

        await this.loadTabList("form");
        this.form.tab_id = data.tab_id ?? "";

        this.showFormModal();
      } catch (e) {
        console.error("openEditModal", e);
        alert("Gagal mengambil data. Silakan coba lagi.");
      }
    },

    async submitForm() {
      this.errors = {};

      const url = `${this.baseUrl}/apps/module_add`;
      const payload = {
        ...this.form,
        id: this.isEditMode ? this.form.id : "",
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
        link: "",
        urutan: 1,
        software_id: "",
        tab_id: "",
        status: 1,
      };
      this.errors = {};
      this.tabListForm = [];
      this.isEditMode = false;
    },

    doSearch() {
      if (this.table) this.table.ajax.reload();
    },

    resetFilter() {
      this.filter = {
        nama: "",
        software_id: "",
        tab_id: "",
        status: 1,
      };
      this.tabListFilter = [];
      if (this.table) this.table.ajax.reload();
    },
  },
};
</script>

<style scoped src="@/apps/system/module.css"></style>
