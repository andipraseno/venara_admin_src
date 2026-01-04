<template>
  <div class="container-fluid">
    <Navbar />

    <!-- Judul dan Breadcrumb -->
    <div class="mb-3 mt-3">
      <h3 class="mb-1">
        <i class="bi bi-book"></i>
        Karyawan
      </h3>

      <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><a href="#">Home</a></li>
          <li class="breadcrumb-item"><a href="#">Master</a></li>
          <li class="breadcrumb-item active" aria-current="page">Karyawan</li>
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
            <th>Nama</th>
            <th>Kode</th>
            <th>Access</th>
            <th>Jenis Kelamin</th>
            <th>Handphone</th>
            <th>Email</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody></tbody>
      </table>
    </div>

    <!-- Form Modal (Tambah + Edit) -->
    <div
      class="modal fade modal-lg"
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

            <!-- Kode -->
            <div class="form-floating mb-3">
              <input
                type="text"
                v-model="form.kode"
                id="kode"
                class="form-control"
                :class="{ 'is-invalid': errors.kode }"
              />
              <label for="kode" class="form-label">Kode</label>
              <div class="invalid-feedback" v-if="errors.kode">{{ errors.kode[0] }}</div>
            </div>

            <!-- Jenis Kelamin -->
            <div class="form-floating mb-3">
              <select v-model.number="form.jenis_kelamin" id="jenis_kelamin" class="form-select">
                <option :value="1">Pria</option>
                <option :value="2">Wanita</option>
              </select>
              <label for="jenis_kelamin" class="form-label">Jenis Kelamin</label>
            </div>

            <div class="row">
              <div class="col-md-6">
                <!-- Tempat Lahir -->
                <div class="form-floating mb-3">
                  <input
                    type="text"
                    v-model="form.tempat_lahir"
                    id="tempat_lahir"
                    class="form-control"
                    :class="{ 'is-invalid': errors.tempat_lahir }"
                  />
                  <label for="tempat_lahir" class="form-label">Tempat Lahir</label>
                  <div class="invalid-feedback" v-if="errors.tempat_lahir">
                    {{ errors.tempat_lahir[0] }}
                  </div>
                </div>
              </div>

              <div class="col-md-6">
                <div class="form-floating mb-3 position-relative">
                  <Cleave
                    v-model="form.tgl_lahir"
                    :options="cleaveTglLahir"
                    id="filterTglLahir"
                    class="form-control pe-5"
                    placeholder="dd/mm/yyyy"
                  />
                  <label for="filterTglLahir">Tgl. Lahir</label>

                  <button
                    type="button"
                    class="btn position-absolute end-0 top-50 translate-middle-y me-2 p-0 border-0 bg-transparent"
                    @click="showCal.add = !showCal.add"
                    aria-label="Buka kalender"
                  >
                    <i class="bi bi-calendar-date"></i>
                  </button>

                  <UiCalendar
                    v-if="showCal.add"
                    v-model="form.tgl_lahir"
                    @close="showCal.add = false"
                  />
                </div>
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

            <!-- No. Identitas -->
            <div class="form-floating mb-3">
              <input
                type="text"
                v-model="form.no_identitas"
                id="no_identitas"
                class="form-control"
                :class="{ 'is-invalid': errors.no_identitas }"
              />
              <label for="no_identitas" class="form-label">No. Identitas</label>
              <div class="invalid-feedback" v-if="errors.no_identitas">
                {{ errors.no_identitas[0] }}
              </div>
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

            <!-- Access -->
            <div class="form-floating mb-3">
              <select class="form-select" v-model="form.access_id" id="formAccess">
                <option value="">Pilih Access</option>
                <option v-for="s in accessList" :key="s.id" :value="s.id">
                  {{ s.nama }}
                </option>
              </select>
              <label for="formAccess" class="form-label">Access</label>
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
              <select class="form-select" v-model="filter.access_id" id="filterAccess">
                <option value="">Pilih Access</option>

                <option v-for="s in accessList" :key="s.id" :value="s.id">
                  {{ s.nama }}
                </option>
              </select>

              <label for="filterAccess" class="form-label">Access</label>
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

    <!-- ================= MODAL PASSWORD ================= -->
    <div class="modal fade" id="passwordModal" tabindex="-1">
      <div class="modal-dialog">
        <form class="modal-content" @submit.prevent="submitPassword">
          <div class="modal-header">
            <h5 class="modal-title"><i class="bi bi-key me-1"></i>Ubah Password</h5>
            <button class="btn-close" @click="hidePasswordModal"></button>
          </div>

          <div class="modal-body">
            <div class="form-floating mb-3">
              <input type="password" class="form-control" v-model="form.password" />
              <label>Password Baru</label>
            </div>

            <div class="form-floating mb-3">
              <input type="password" class="form-control" v-model="form.password2" />
              <label>Konfirmasi Password</label>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" @click="hidePasswordModal">Batal</button>
            <button class="btn btn-primary">Simpan</button>
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
import UiCalendar from "@/components/Calendar.vue";
import Cleave from "vue-cleave-component";

export default {
  name: "KaryawanPage",

  components: {
    Navbar,
    UiCalendar,
    Cleave,
  },

  data() {
    return {
      defaultTglLahir: this.todayIndo(),
      showCal: { add: false, edit: false },

      actasysUrl: import.meta.env.VITE_API_ACTASYS,
      appsUrl: import.meta.env.VITE_API_APPS,
      token: "",
      tokenHeaders: "",
      tokenList: "",

      searchText: "",

      table: null,
      isEditMode: false,

      filter: {
        nama: "",
        access_id: "",
        status: 1,
      },

      form: {
        id: "",
        nama: "",
        kode: "",
        jenis_kelamin: 1,
        tempat_lahir: "",
        tgl_lahir: "",
        alamat: "",
        no_identitas: "",
        handphone: "",
        email: "",
        access_id: "",
        password: "123",
        password2: "123",
        status: 1,
      },

      errors: {},
      accessList: [],

      dtEditClickHandler: null,
      formShownHandler: null,
      formHiddenHandler: null,

      cleaveTglLahir: {
        date: true,
        delimiter: "/",
        datePattern: ["d", "m", "Y"],
      },
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

    this.loadAccessList();
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

    $("#tableMain").on("click", ".btn-password", (e) => {
      this.openPasswordModal($(e.currentTarget).data("id"));
    });
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
    // ---------- helper date functions (di luar komponen) ----------
    dateIndoToUS(d) {
      if (!d) return "";
      const s = String(d).trim();

      const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

      const parts = s.split(/[\/\-.]/);
      if (parts.length === 3) {
        let [dd, mm, yyyy] = parts;
        dd = String(dd).padStart(2, "0");
        mm = String(mm).padStart(2, "0");
        yyyy = String(yyyy).padStart(4, "0");
        if (+mm >= 1 && +mm <= 12 && +dd >= 1 && +dd <= 31) return `${yyyy}-${mm}-${dd}`;
      }

      const digits = s.replace(/\D/g, "");
      if (digits.length === 8) {
        const dd = digits.slice(0, 2);
        const mm = digits.slice(2, 4);
        const yyyy = digits.slice(4, 8);
        if (+mm >= 1 && +mm <= 12 && +dd >= 1 && +dd <= 31) return `${yyyy}-${mm}-${dd}`;
      }
      return "";
    },

    dateUSToIndo(d) {
      if (!d) return "";
      const s = String(d).trim();
      const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (!m) return "";
      const [, yyyy, mm, dd] = m;
      return `${dd}/${mm}/${yyyy}`;
    },

    todayUS() {
      return new Date().toISOString().split("T")[0];
    },

    todayIndo() {
      return this.dateUSToIndo(this.todayUS());
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

    // load combo group
    async loadAccessList() {
      try {
        const url = `${this.actasysUrl}/profile/access_combo`;
        const res = await axios.get(url, this.tokenHeaders);
        this.accessList = res.data || [];
      } catch (e) {
        console.error("loadAccessList", e);
        alert("Gagal memuat daftar group. Silakan coba lagi.");
      }
    },

    // Search global DataTables
    doSearch() {
      if (this.table) this.table.search(this.searchText).draw();
    },

    // init datatable
    initDataTable() {
      const url = `${this.appsUrl}/master/karyawan`;

      if ($.fn.dataTable && $.fn.dataTable.isDataTable("#tableMain")) {
        $("#tableMain").DataTable().destroy();
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
            d.search = this.searchText;
            d.nama = this.filter.nama;
            d.status = this.filter.status;
            d.access_id = this.filter.access_id;
          },
        },
        columns: [
          { data: "nama" },
          {
            data: "kode",
            className: "text-center",
            width: "200px",
          },
          {
            data: "access_id",
            width: "200px",
          },
          {
            data: "jenis_kelamin",
            render(data) {
              return data == 1 ? "Pria" : "Wanita";
            },
          },
          { data: "handphone" },
          { data: "email" },
          {
            data: "status",
            className: "text-center",
            width: "150px",
            render(data) {
              return data == 1 ? "Aktif" : "Tidak Aktif";
            },
          },
          {
            data: null,
            className: "text-center",
            width: "230px",
            orderable: false,
            render(row) {
              return `
                <button class="btn btn-sm btn-warning btn-edit" data-id="${row.id}">
                  <i class="bi bi-pencil-square me-1"></i>Edit
                </button>
                <button class="btn btn-sm btn-danger btn-password" data-id="${row.id}">
                  <i class="bi bi-key me-1"></i>Password
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

      const url = `${this.appsUrl}/master/karyawan_show/${id}`;
      try {
        const resp = await axios.get(url, this.tokenHeaders);
        const data = resp.data || {};
        this.form.id = id;
        this.form.nama = data.nama ?? "";
        this.form.kode = data.kode ?? "";
        this.form.jenis_kelamin = data.jenis_kelamin ?? "";
        this.form.tempat_lahir = data.tempat_lahir ?? "";
        this.form.tgl_lahir = this.dateUSToIndo(data.tgl_lahir) ?? "";
        this.form.alamat = data.alamat ?? "";
        this.form.no_identitas = data.no_identitas ?? "";
        this.form.handphone = data.handphone ?? "";
        this.form.email = data.email ?? "";
        this.form.access_id = data.access_id ?? "";
        this.form.status = typeof data.status !== "undefined" ? data.status : 1;

        this.showFormModal();
      } catch (err) {
        console.error("openEditModal", err);
        alert("Gagal mengambil data. Silakan coba lagi.");
      }
    },

    async submitForm() {
      this.errors = {};

      const url = `${this.appsUrl}/master/karyawan_add`;
      const payload = {
        id: this.isEditMode ? this.form.id : "",
        nama: this.form.nama,
        kode: this.form.kode,
        jenis_kelamin: this.form.jenis_kelamin,
        tempat_lahir: this.form.tempat_lahir,
        tgl_lahir: this.dateIndoToUS(this.form.tgl_lahir),
        alamat: this.form.alamat,
        no_identitas: this.form.no_identitas,
        handphone: this.form.handphone,
        email: this.form.email,
        access_id: this.form.access_id,
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

    /* ===== PASSWORD ===== */
    getModal(id) {
      const el = document.getElementById(id);
      return Modal.getInstance(el) || new Modal(el, { backdrop: "static" });
    },

    openPasswordModal(id) {
      this.form = {
        id,
        password: "",
        password2: "",
      };

      this.getModal("passwordModal").show();
    },

    hidePasswordModal() {
      this.getModal("passwordModal").hide();
    },

    async submitPassword() {
      if (this.form.password !== this.form.password2) {
        alert("Password tidak sama");
        return;
      }

      await axios.post(
        `${this.appsUrl}/master/karyawan_password`,
        {
          id: this.form.id,
          password: this.form.password,
          password2: this.form.password2,
        },

        this.tokenHeaders
      );

      this.hidePasswordModal();
      alert("Password berhasil diubah");
    },

    resetForm() {
      this.form = {
        id: "",
        nama: "",
        kode: "",
        jenis_kelamin: 1,
        tempat_lahir: "",
        tgl_lahir: "",
        alamat: "",
        no_identitas: "",
        handphone: "",
        email: "",
        access_id: "",
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
        access_id: "",
        status: 1,
      };
      if (this.table) this.table.ajax.reload();
    },
  },
};
</script>

<style scoped src="@/apps/master/karyawan.css"></style>
