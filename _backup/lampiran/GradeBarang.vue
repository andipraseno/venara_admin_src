<template>
  <div class="container-fluid">
    <Navbar />

    <!-- Judul -->
    <div class="mb-3">
      <h3 class="mb-1">
        <i class="bi bi-paperclip"></i>
        Grade Barang
      </h3>
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

    <!-- TABLE (DataTables) -->
    <div class="table-responsive">
      <table
        id="tableMain"
        class="table table-bordered table-hover display nowrap"
        style="width: 100%"
      >
        <thead class="table-light">
          <tr>
            <th>Nama</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>

    <!-- ===========================================================
        FORM MODAL
    ============================================================ -->
    <div class="modal fade" id="formModal" tabindex="-1">
      <div class="modal-dialog">
        <form @submit.prevent="submitForm" class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="formModalLabel">
              <i :class="isEditMode ? 'bi bi-pencil-square me-2' : 'bi bi-plus-circle me-2'"></i>
              {{ isEditMode ? "Edit Data" : "Tambah Data" }}
            </h5>

            <button type="button" class="btn-close" @click="hideFormModal"></button>
          </div>

          <div class="modal-body">
            <div class="form-floating mb-3">
              <input
                type="text"
                class="form-control"
                v-model="form.nama"
                :class="{ 'is-invalid': errors.nama }"
              />
              <label>Nama</label>
              <div class="invalid-feedback" v-if="errors.nama">
                {{ errors.nama[0] }}
              </div>
            </div>

            <div class="form-floating mb-3">
              <select class="form-select" v-model.number="form.status">
                <option :value="1">Aktif</option>
                <option :value="0">Tidak Aktif</option>
              </select>
              <label>Status</label>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" type="button" @click="hideFormModal">Batal</button>
            <button class="btn btn-primary" type="submit">
              {{ isEditMode ? "Update" : "Simpan" }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ===========================================================
        FILTER MODAL
    ============================================================ -->
    <div class="modal fade" id="filterModal" tabindex="-1">
      <div class="modal-dialog">
        <form @submit.prevent="doSearch" class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="formModalLabel">
              <i class="bi bi-funnel me-1"></i>
              Filter Data
            </h5>

            <button class="btn-close" type="button" data-bs-dismiss="modal"></button>
          </div>

          <div class="modal-body">
            <div class="form-floating mb-3">
              <input type="text" class="form-control" v-model="filter.nama" />
              <label>Nama</label>
            </div>

            <div class="form-floating mb-3">
              <select v-model.number="filter.status" class="form-select">
                <option :value="1">Aktif</option>
                <option :value="0">Tidak Aktif</option>
              </select>
              <label>Status</label>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" type="button" @click="resetFilter">Reset</button>
            <button class="btn btn-primary" type="submit" data-bs-dismiss="modal">Terapkan</button>
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
import Cleave from "cleave.js";

export default {
  name: "Grade BarangPage",

  components: { Navbar },

  directives: {
    cleaveNumber: {
      mounted(el, binding) {
        const opt = binding.value || {};
        el._cleave = new Cleave(el, {
          numeral: true,
          numeralThousandsGroupStyle: "thousand",
          ...opt,
        });
      },
      updated(el) {
        if (el._cleave) el._cleave.setRawValue(el.value || "");
      },
      unmounted(el) {
        if (el._cleave) el._cleave.destroy();
      },
    },
  },

  data() {
    return {
      baseUrl: import.meta.env.VITE_API_ACTASYS,
      token: "",
      tokenHeaders: "",
      tokenList: "",

      table: null,

      searchText: "",

      isEditMode: false,
      errors: {},

      filter: {
        nama: "",
        status: 1,
      },

      form: {
        id: "",
        nama: "",
        status: 1,
      },

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

    this.initDataTable();

    // Delegasi klik tombol Edit
    this.dtEditClickHandler = (e) => {
      const id = $(e.currentTarget).data("id");
      if (id) this.openEditModal(id);
    };
    $("#tableMain").on("click", ".btn-edit", this.dtEditClickHandler);

    // Event modal form
    const formEl = document.getElementById("formModal");
    if (formEl) {
      this.formShownHandler = async () => {
        this.errors = {};
        await this.$nextTick();
        const firstInput = document.querySelector("#formModal input.form-control");
        if (firstInput) firstInput.focus();
      };
      formEl.addEventListener("shown.bs.modal", this.formShownHandler);

      this.formHiddenHandler = () => {
        this.resetForm();
        this.isEditMode = false;
      };
      formEl.addEventListener("hidden.bs.modal", this.formHiddenHandler);
    }
  },

  beforeUnmount() {
    // lepas handler edit
    if (this.dtEditClickHandler) {
      $("#tableMain").off("click", ".btn-edit", this.dtEditClickHandler);
      this.dtEditClickHandler = null;
    }

    // lepas event modal
    const formEl = document.getElementById("formModal");
    if (formEl && this.formShownHandler) {
      formEl.removeEventListener("shown.bs.modal", this.formShownHandler);
      this.formShownHandler = null;
    }
    if (formEl && this.formHiddenHandler) {
      formEl.removeEventListener("hidden.bs.modal", this.formHiddenHandler);
      this.formHiddenHandler = null;
    }

    // destroy datatable (pakai $.fn.dataTable)
    if ($.fn.dataTable && $.fn.dataTable.isDataTable("#tableMain")) {
      try {
        $("#tableMain").DataTable().destroy(true);
      } catch (e) {
        // ignore
      }
    }
  },

  methods: {
    getModal(id) {
      const el = document.getElementById(id);
      if (!el) return null;
      return Modal.getInstance(el) || new Modal(el, { backdrop: "static" });
    },
    showFormModal() {
      const m = this.getModal("formModal");
      if (m) m.show();
    },
    hideFormModal() {
      const m = this.getModal("formModal");
      if (m) m.hide();
    },

    initDataTable() {
      if ($.fn.dataTable && $.fn.dataTable.isDataTable("#tableMain")) {
        $("#tableMain").DataTable().destroy();
      }

      this.table = $("#tableMain").DataTable({
        dom: 't<"d-flex justify-content-between align-items-center mt-3"ip>',
        processing: true,
        serverSide: true,
        responsive: true,
        pageLength: 25,
        ajax: {
          url: `${this.baseUrl}/lampiran/grade_barang`,
          type: "GET",
          headers: this.tokenList,
          data: (d) => {
            d.nama = this.filter.nama;
            d.status = this.filter.status;
          },
        },
        columns: [
          { data: "nama" },
          {
            data: "status",
            className: "text-center",
            width: "120px",
            render(s) {
              const aktif = Number(s) === 1;
              return `<span class="badge ${aktif ? "bg-success" : "bg-secondary"}">${
                aktif ? "Aktif" : "Tidak Aktif"
              }</span>`;
            },
          },
          {
            data: null,
            orderable: false,
            className: "text-center",
            width: "120px",
            render: (row) =>
              `<button class="btn btn-warning btn-sm btn-edit" data-id="${row.id}">
                 <i class="bi bi-pencil-square me-1"></i>Edit
               </button>`,
          },
        ],
        language: {
          paginate: { previous: "&laquo;", next: "&raquo;" },
          info: "Menampilkan _START_ - _END_ dari _TOTAL_ data",
          processing: "Memuat data…",
          zeroRecords: "Tidak ada data",
        },
      });
    },

    // Search global DataTables
    doSearch() {
      if (this.table) this.table.search(this.searchText).draw();
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
        const res = await axios.get(
          `${this.baseUrl}/lampiran/grade_barang_show/${id}`,
          this.tokenHeaders
        );
        const data = res.data || {};
        this.form.id = data.id ?? "";
        this.form.nama = data.nama ?? "";
        this.form.status = typeof data.status !== "undefined" ? data.status : 1;

        this.showFormModal();
      } catch (e) {
        console.error("openEditModal", e);
        alert("Gagal mengambil data.");
      }
    },

    async submitForm() {
      this.errors = {};

      const payload = {
        ...this.form,
        id: this.isEditMode ? this.form.id : "",
        by: localStorage.getItem("user_nama"),
      };

      try {
        await axios.post(`${this.baseUrl}/lampiran/grade_barang_add`, payload, this.tokenHeaders);

        this.hideFormModal();
        if (this.table) this.table.ajax.reload(null, false);
      } catch (e) {
        if (e.response && e.response.status === 400) {
          this.errors = e.response.data || {};
        } else {
          console.error("submitForm", e);
          alert("Terjadi kesalahan.");
        }
      }
    },

    doSearch() {
      if (this.table) this.table.ajax.reload();
    },

    resetFilter() {
      this.filter = {
        nama: "",
        status: 1,
      };
      this.doSearch();
    },

    resetForm() {
      this.form = {
        id: "",
        nama: "",
        status: 1,
      };
      this.errors = {};
    },
  },
};
</script>

<style scoped src="@/apps/system/software.css"></style>
