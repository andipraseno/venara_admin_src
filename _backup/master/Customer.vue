<template>
  <div class="container-fluid">
    <Navbar />

    <!-- Judul dan Breadcrumb -->
    <div class="mb-3 mt-3">
      <h3 class="mb-1">
        <i class="bi bi-book"></i>
        Customer
      </h3>

      <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><a href="#">Home</a></li>
          <li class="breadcrumb-item"><a href="#">Master</a></li>
          <li class="breadcrumb-item active" aria-current="page">Customer</li>
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
            <th>Handphone</th>
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

            <!-- Contact Person -->
            <div class="form-floating mb-3">
              <input
                type="text"
                v-model="form.contact_person"
                id="contact_person"
                class="form-control"
                :class="{ 'is-invalid': errors.contact_person }"
              />
              <label for="contact_person" class="form-label">Contact Person</label>
              <div class="invalid-feedback" v-if="errors.contact_person">
                {{ errors.contact_person[0] }}
              </div>
            </div>

            <!-- Bidang Usaha -->
            <div class="form-floating mb-3">
              <input
                type="text"
                v-model="form.bidang_usaha"
                id="bidang_usaha"
                class="form-control"
                :class="{ 'is-invalid': errors.bidang_usaha }"
              />
              <label for="bidang_usaha" class="form-label">Bidang Usaha</label>
              <div class="invalid-feedback" v-if="errors.bidang_usaha">
                {{ errors.bidang_usaha[0] }}
              </div>
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

            <!-- Handphone -->
            <div class="form-floating mb-3">
              <input
                type="text"
                v-model="form.handphone"
                id="handphone"
                class="form-control"
                :class="{ 'is-invalid': errors.handphone }"
              />
              <label for="handphone" class="form-label">Handphone</label>
              <div class="invalid-feedback" v-if="errors.handphone">{{ errors.handphone[0] }}</div>
            </div>

            <!-- Email -->
            <div class="form-floating mb-3">
              <input
                type="text"
                v-model="form.email"
                id="email"
                class="form-control"
                :class="{ 'is-invalid': errors.email }"
              />
              <label for="email" class="form-label">Email</label>
              <div class="invalid-feedback" v-if="errors.email">{{ errors.email[0] }}</div>
            </div>

            <!-- Website -->
            <div class="form-floating mb-3">
              <input
                type="text"
                v-model="form.website"
                id="website"
                class="form-control"
                :class="{ 'is-invalid': errors.website }"
              />
              <label for="website" class="form-label">Website</label>
              <div class="invalid-feedback" v-if="errors.website">{{ errors.website[0] }}</div>
            </div>

            <!-- Tipe Pajak -->
            <div class="form-floating mb-3">
              <select class="form-select" v-model="form.group_id" id="formTipePajak">
                <option value="">Pilih Tipe Pajak</option>
                <option value="1">PKP</option>
                <option value="2">Non PKP</option>
              </select>

              <label for="formTipePajak" class="form-label">Tipe Pajak</label>
            </div>

            <!-- NPWP -->
            <div class="form-floating mb-3">
              <input
                type="text"
                v-model="form.npwp"
                id="npwp"
                class="form-control"
                :class="{ 'is-invalid': errors.npwp }"
              />
              <label for="npwp" class="form-label">NPWP</label>
              <div class="invalid-feedback" v-if="errors.npwp">{{ errors.npwp[0] }}</div>
            </div>

            <!-- Group -->
            <div class="form-floating mb-3">
              <select class="form-select" v-model="form.group_id" id="formGroup">
                <option value="">Pilih Group</option>
                <option v-for="s in groupList" :key="s.id" :value="s.id">
                  {{ s.nama }}
                </option>
              </select>
              <label for="formGroup" class="form-label">Group</label>
            </div>

            <!-- Tipe -->
            <div class="form-floating mb-3">
              <select v-model.number="form.tipe" id="tipe" class="form-select">
                <option :value="1">Non Member</option>
                <option :value="2">Member</option>
              </select>
              <label for="tipe" class="form-label">Tipe</label>
            </div>

            <!-- Catatan -->
            <div class="form-floating mb-3">
              <input
                type="text"
                v-model="form.catatan"
                id="catatan"
                class="form-control"
                :class="{ 'is-invalid': errors.catatan }"
              />
              <label for="catatan" class="form-label">Catatan</label>
              <div class="invalid-feedback" v-if="errors.catatan">{{ errors.catatan[0] }}</div>
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
              <select class="form-select" v-model="filter.group_id" id="filterGroup">
                <option value="">Pilih Group</option>

                <option v-for="s in groupList" :key="s.id" :value="s.id">
                  {{ s.nama }}
                </option>
              </select>

              <label for="filterGroup" class="form-label">Group</label>
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
  name: "CustomerPage",

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
        group_id: "",
        status: 1,
      },

      form: {
        id: "",
        nama: "",
        contact_person: "",
        bidang_usaha: "",
        alamat: "",
        telepon: "",
        handphone: "",
        email: "",
        website: "",
        npwp: "",
        catatan: "",
        group_id: "",
        tipe: 1,
        status: 1,
      },

      errors: {},
      groupList: [],

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

    this.loadGroupList();
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

    // load combo group
    async loadGroupList() {
      try {
        const url = `${this.baseUrl}/lampiran/group_customer_combo`;
        const res = await axios.get(url, this.tokenHeaders);
        this.groupList = res.data || [];
      } catch (e) {
        console.error("loadGroupList", e);
        alert("Gagal memuat daftar group. Silakan coba lagi.");
      }
    },

    // Search global DataTables
    doSearch() {
      if (this.table) this.table.search(this.searchText).draw();
    },

    // init datatable
    initDataTable() {
      const url = `${this.baseUrl}/master/customer`;

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
            d.group_id = this.filter.group_id;
          },
        },
        columns: [
          { data: "id", visible: false },
          { data: "nama" },
          { data: "alamat" },
          { data: "telepon" },
          { data: "handphone" },
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

      const url = `${this.baseUrl}/master/customer_show/${id}`;
      try {
        const resp = await axios.get(url, this.tokenHeaders);
        const data = resp.data || {};
        this.form.id = id;
        this.form.nama = data.nama ?? "";
        this.form.contact_person = data.contact_person ?? "";
        this.form.bidang_usaha = data.bidang_usaha ?? "";
        this.form.alamat = data.alamat ?? "";
        this.form.telepon = data.telepon ?? "";
        this.form.fax = data.fax ?? "";
        this.form.handphone = data.handphone ?? "";
        this.form.email = data.email ?? "";
        this.form.website = data.website ?? "";
        this.form.tipe_pajak = data.tipe_pajak ?? "";
        this.form.npwp = data.npwp ?? "";
        this.form.catatan = data.catatan ?? "";
        this.form.group_id = data.group_id ?? "";
        this.form.tipe = data.tipe ?? 1;
        this.form.status = typeof data.status !== "undefined" ? data.status : 1;

        this.showFormModal();
      } catch (err) {
        console.error("openEditModal", err);
        alert("Gagal mengambil data. Silakan coba lagi.");
      }
    },

    async submitForm() {
      this.errors = {};

      const url = `${this.baseUrl}/master/customer_add`;
      const payload = {
        id: this.isEditMode ? this.form.id : "",
        nama: this.form.nama,
        contact_person: this.form.contact_person,
        bidang_usaha: this.form.bidang_usaha,
        alamat: this.form.alamat,
        telepon: this.form.telepon,
        handphone: this.form.handphone,
        email: this.form.email,
        website: this.form.website,
        tipe_pajak: this.form.tipe_pajak,
        npwp: this.form.npwp,
        group_id: this.form.group_id,
        tipe: this.form.tipe,
        catatan: this.form.catatan,
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
        contact_person: "",
        bidang_usaha: "",
        alamat: "",
        telepon: "",
        handphone: "",
        email: "",
        website: "",
        npwp: "",
        catatan: "",
        tipe_pajak: "",
        group_id: "",
        tipe: 1,
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
        group_id: "",
        status: 1,
      };
      if (this.table) this.table.ajax.reload();
    },
  },
};
</script>

<style scoped src="@/apps/master/customer.css"></style>
