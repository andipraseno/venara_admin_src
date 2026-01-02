<template>
  <div class="container-fluid">
    <!-- Breadcrumb & Header -->
    <div class="mb-3">
      <h3 class="mb-1">
        <i class="bi bi-gear-wide-connected"></i>
        User
      </h3>

      <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><a href="#">Home</a></li>
          <li class="breadcrumb-item"><a href="#">Profile</a></li>
          <li class="breadcrumb-item active" aria-current="page">User</li>
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

    <!-- Data Table -->
    <div class="table-responsive">
      <table
        id="tableData"
        ref="tableRef"
        class="table table-bordered table-hover display nowrap"
        style="width: 100%"
      >
        <thead class="table-light">
          <tr>
            <th>Nama</th>
            <th>Email</th>
            <th>Handphone</th>
            <th>Level</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>

    <!-- === Modal Tambah + Edit (digabung) === -->
    <div class="modal fade" id="userModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <form @submit.prevent="handleSubmit" class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i :class="isEditMode ? 'bi bi-pencil-square me-2' : 'bi bi-plus-circle me-2'"></i>
              {{ isEditMode ? "Edit Data" : "Tambah Data" }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>

          <div class="modal-body">
            <div>
              <div class="form-floating mb-3">
                <input
                  type="text"
                  v-model="form.nama"
                  id="nama"
                  class="form-control"
                  :class="{ 'is-invalid': errors.nama }"
                />
                <label class="form-label">Nama</label>
                <div class="invalid-feedback" v-if="errors.nama">{{ errors.nama[0] }}</div>
              </div>

              <div class="form-floating mb-3">
                <input
                  type="text"
                  v-model="form.email"
                  class="form-control"
                  :class="{ 'is-invalid': errors.email }"
                />
                <label class="form-label">Email</label>
                <div class="invalid-feedback" v-if="errors.email">{{ errors.email[0] }}</div>
              </div>

              <div class="form-floating mb-3">
                <input
                  type="text"
                  v-model="form.handphone"
                  class="form-control"
                  :class="{ 'is-invalid': errors.handphone }"
                />
                <label class="form-label">Handphone</label>
                <div class="invalid-feedback" v-if="errors.handphone">
                  {{ errors.handphone[0] }}
                </div>
              </div>

              <div class="form-floating mb-3">
                <input
                  type="password"
                  v-model="form.password"
                  class="form-control"
                  :class="{ 'is-invalid': errors.password }"
                />
                <label class="form-label">Password</label>
                <div class="invalid-feedback" v-if="errors.password">{{ errors.password[0] }}</div>
              </div>

              <div class="form-floating mb-3">
                <input
                  type="password"
                  v-model="form.password_confirmation"
                  class="form-control"
                  :class="{ 'is-invalid': errors.password_confirmation }"
                />
                <label class="form-label">Password Confirmation</label>
                <div class="invalid-feedback" v-if="errors.password_confirmation">
                  {{ errors.password_confirmation[0] }}
                </div>
              </div>

              <div class="form-floating mb-3">
                <select class="form-select" v-model="form.level_id">
                  <option value="">Pilih Access</option>
                  <option v-for="s in accessList" :key="s.id" :value="s.id">
                    {{ s.nama }}
                  </option>
                </select>
                <label class="form-label">Access</label>
              </div>

              <div class="form-floating mb-3">
                <select class="form-select" v-model.number="form.status">
                  <option :value="1">Aktif</option>
                  <option :value="0">Tidak Aktif</option>
                </select>
                <label class="form-label">Status</label>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
            <button type="submit" class="btn btn-primary">
              {{ isEdit ? "Update" : "Simpan" }}
            </button>
          </div>
        </form>
      </div>
    </div>
    <!-- === END Modal Tambah + Edit === -->

    <!-- Modal Filter -->
    <div class="modal fade" id="filterModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <form @submit.prevent="doSearch" class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="formModalLabel">
              <i class="bi bi-funnel me-1"></i>
              Filter Data
            </h5>

            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>

          <div class="modal-body">
            <div class="form-floating mb-3">
              <input type="text" v-model="filter.nama" id="filterNama" class="form-control" />
              <label class="form-label">Nama</label>
            </div>

            <div class="form-floating mb-3">
              <select class="form-select" v-model.number="filter.status">
                <option :value="1">Aktif</option>
                <option :value="0">Tidak Aktif</option>
              </select>
              <label class="form-label">Status</label>
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
import $ from "jquery";
import "datatables.net";
import "datatables.net-responsive";
import axios from "axios";
import { Modal } from "bootstrap";

const ROOT_URL = import.meta.env.VITE_API_ACTASYS;

export default {
  name: "UserList",

  data() {
    return {
      tableInstance: null,
      editId: null,
      isEdit: false,

      searchText: "",

      form: {
        id: "",
        holding_id: "",
        company_id: "",
        level_id: "",
        nama: "",
        email: "",
        handphone: "",
        password: "",
        status: 1,
        password_confirmation: "",
      },

      filter: {
        nama: "",
        holding_id: "",
        company_id: "",
        status: 1,
      },

      errors: {},
      accessList: [],
      tabListFilter: [],

      // handler untuk event modal
      userModalShownHandler: null,
      userModalHiddenHandler: null,
      filterShownHandler: null,
    };
  },

  mounted() {
    const company = JSON.parse(localStorage.getItem("actasysCompany") || "{}");
    this.form.company_id = company.id || "";
    this.form.holding_id = company.holding_id || "";
    this.filter.company_id = company.id || "";
    this.filter.holding_id = company.holding_id || "";

    this.initTable();
    this.initModalListeners();
  },

  beforeUnmount() {
    // remove delegated table handlers
    if (this.$refs.tableRef) {
      $(this.$refs.tableRef).off("click", ".btn-edit");
    }

    // remove modal listeners
    const userEl = document.getElementById("userModal");
    if (userEl && this.userModalShownHandler) {
      userEl.removeEventListener("shown.bs.modal", this.userModalShownHandler);
    }
    if (userEl && this.userModalHiddenHandler) {
      userEl.removeEventListener("hidden.bs.modal", this.userModalHiddenHandler);
    }

    const filterEl = document.getElementById("filterModal");
    if (filterEl && this.filterShownHandler) {
      filterEl.removeEventListener("shown.bs.modal", this.filterShownHandler);
    }

    // destroy datatable
    if ($.fn.DataTable.isDataTable("#tableData")) {
      try {
        $("#tableData").DataTable().destroy(true);
      } catch (e) {
        // ignore
      }
    }
  },

  methods: {
    /* ---- helpers ---- */
    getBsModalById(id) {
      const el = document.getElementById(id);
      if (!el) return null;
      return Modal.getInstance(el) || new Modal(el, { backdrop: "static" });
    },
    showModalById(id) {
      const m = this.getBsModalById(id);
      if (m) m.show();
    },
    hideModalById(id) {
      const m = this.getBsModalById(id);
      if (m) m.hide();
    },
    authHeaders() {
      return { headers: { Token: "Bearer " + localStorage.getItem("actasysToken") } };
    },

    /* ---- lists ---- */
    loadAccessList() {
      if (!this.form.company_id) {
        this.accessList = [];
        this.form.level_id = "";
        return;
      }

      axios
        .get(`${ROOT_URL}/apps/access_combo/${this.form.company_id}`, this.authHeaders())
        .then((res) => {
          this.accessList = res.data || [];
        })
        .catch((e) => {
          console.error("loadAccessList", e);
        });
    },

    // Search global DataTables
    doSearch() {
      if (this.table) this.table.search(this.searchText).draw();
    },

    /* ---- DataTable ---- */
    initTable() {
      const vm = this;
      const url = `${ROOT_URL}/apps/user`;
      const tokenHeaders = { Token: "Bearer " + localStorage.getItem("actasysToken") };

      if ($.fn.DataTable.isDataTable("#tableData")) {
        $("#tableData").DataTable().destroy();
        $("#tableData").empty();
      }

      this.tableInstance = $(this.$refs.tableRef).DataTable({
        dom: 't<"d-flex justify-content-between align-items-center mt-3"ip>',
        processing: true,
        serverSide: true,
        responsive: true,
        pageLength: 25,
        ajax: {
          url,
          type: "GET",
          headers: tokenHeaders,
          data(d) {
            d.nama = vm.filter.nama;
            d.holding_id = vm.filter.holding_id;
            d.company_id = vm.filter.company_id;
            d.status = vm.filter.status;
          },
        },
        columns: [
          { data: "nama", className: "text-start" },
          { data: "email", className: "text-start" },
          { data: "handphone", className: "text-start" },
          { data: "level_namaa", className: "text-start" },
          {
            data: "status",
            width: "120px",
            className: "text-center",
            render(data) {
              return data == 1 ? "Aktif" : "Tidak Aktif";
            },
          },
          {
            data: null,
            render(data) {
              return `<button class="btn btn-sm btn-warning btn-edit" data-id="${data.id}">
                  <i class="bi bi-pencil-square me-1"></i>Edit
                </button>`;
            },
            className: "text-center",
            orderable: false,
            width: "120px",
          },
        ],
        language: {
          paginate: { previous: "&laquo;", next: "&raquo;" },
          info: "Menampilkan _START_ - _END_ dari _TOTAL_ data",
        },
      });

      // delegated click handler
      $(this.$refs.tableRef).on("click", ".btn-edit", (e) => {
        const id = $(e.currentTarget).data("id");
        if (id) this.openEditModal(id);
      });
    },

    /* ---- modal listeners ---- */
    initModalListeners() {
      const userEl = document.getElementById("userModal");
      if (userEl) {
        this.userModalShownHandler = async () => {
          this.clearErrors();
          await this.$nextTick();
          document.getElementById("nama")?.focus();
        };
        this.userModalHiddenHandler = () => {
          this.resetForm();
          this.editId = null;
          this.isEdit = false;
        };

        userEl.addEventListener("shown.bs.modal", this.userModalShownHandler);
        userEl.addEventListener("hidden.bs.modal", this.userModalHiddenHandler);
      }

      const filterEl = document.getElementById("filterModal");
      if (filterEl) {
        this.filterShownHandler = async () => {
          await this.$nextTick();
          document.getElementById("filterNama")?.focus();
        };
        filterEl.addEventListener("shown.bs.modal", this.filterShownHandler);
      }
    },

    /* ---- common helpers ---- */
    clearErrors() {
      Object.keys(this.errors).forEach((k) => delete this.errors[k]);
    },

    resetForm() {
      this.form.id = "";
      this.form.level_id = "";
      this.form.nama = "";
      this.form.email = "";
      this.form.handphone = "";
      this.form.password = "";
      this.form.password_confirmation = "";
      this.form.status = 1;
      this.clearErrors();
      this.accessList = [];
    },

    doSearch() {
      if (this.tableInstance) this.tableInstance.ajax.reload();
    },

    resetFilter() {
      this.filter.nama = "";
      this.filter.status = 1;
      this.tabListFilter = [];
      if (this.tableInstance) this.tableInstance.ajax.reload();
    },

    /* ---- tambah & edit (gabung) ---- */
    async openAddModal() {
      this.isEdit = false;
      this.editId = null;
      this.resetForm();
      await this.loadAccessList();
      this.showModalById("userModal");
    },

    async openEditModal(id) {
      this.isEdit = true;
      this.clearErrors();

      try {
        const res = await axios.get(`${ROOT_URL}/apps/user_show/${id}`, this.authHeaders());
        const data = res.data || {};
        this.editId = id;

        this.form.id = data.id ?? "";
        this.form.nama = data.nama ?? "";
        this.form.email = data.email ?? "";
        this.form.handphone = data.handphone ?? "";
        this.form.password = data.password ?? "";
        this.form.password_confirmation = data.password ?? "";
        this.form.level_id = data.level_id ?? "";
        this.form.status = data.status ?? 1;

        await this.loadAccessList();
        this.showModalById("userModal");
      } catch (e) {
        console.error("openEditModal", e);
        alert("Gagal mengambil data. Silakan coba lagi.");
      }
    },

    async submitTambah() {
      this.clearErrors();

      const url = `${ROOT_URL}/apps/user_add`;
      const payload = {
        ...this.form,
        id: "",
        by: localStorage.getItem("user_nama"),
      };

      try {
        await axios.post(url, payload, this.authHeaders());
        this.hideModalById("userModal");
        this.resetForm();
        if (this.tableInstance) this.tableInstance.ajax.reload();
      } catch (error) {
        if (error.response?.status === 400) {
          Object.assign(this.errors, error.response.data || {});
        } else {
          console.error("submitTambah", error);
          alert("Terjadi kesalahan. Coba lagi nanti.");
        }
      }
    },

    async submitEdit() {
      this.clearErrors();

      const url = `${ROOT_URL}/apps/user_add`;
      const payload = {
        ...this.form,
        id: this.editId,
        by: localStorage.getItem("user_nama"),
      };

      try {
        await axios.post(url, payload, this.authHeaders());
        this.hideModalById("userModal");
        this.resetForm();
        if (this.tableInstance) this.tableInstance.ajax.reload();
      } catch (error) {
        if (error.response?.status === 400) {
          Object.assign(this.errors, error.response.data || {});
        } else {
          console.error("submitEdit", error);
          alert("Terjadi kesalahan. Coba lagi nanti.");
        }
      }
    },

    // fungsi submit tunggal untuk form
    async handleSubmit() {
      if (this.isEdit) {
        await this.submitEdit();
      } else {
        await this.submitTambah();
      }
    },
  },
};
</script>

<style scoped src="@/apps/system/user.css"></style>
