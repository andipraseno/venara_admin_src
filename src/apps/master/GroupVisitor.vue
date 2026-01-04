<template>
  <div class="container-fluid" v-cloak>
    <!-- Judul dan Breadcrumb -->
    <div class="mb-3">
      <h3 class="mb-1">
        <i class="bi bi-book"></i>
        Daftar Group Visitor
      </h3>

      <nav aria-label="breadcrumb">
        <ol class="breadcrumb mb-0">
          <li class="breadcrumb-item"><a href="#">Home</a></li>
          <li class="breadcrumb-item"><a href="#">Master</a></li>
          <li class="breadcrumb-item active" aria-current="page">Group Visitor</li>
        </ol>
      </nav>
    </div>

    <!-- Toolbar -->
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
      <div class="d-flex gap-2">
        <button class="btn btn-primary shadow-sm" @click="openTambah">
          <i class="bi bi-plus-circle me-1"></i> Tambah
        </button>

        <button class="btn btn-outline-secondary" @click="openFilter">
          <i class="bi bi-funnel me-1"></i> Filter
        </button>
      </div>

      <!-- Quick filter -->
      <div class="d-flex align-items-center gap-2">
        <div class="input-group input-group-sm" style="min-width: 260px">
          <span class="input-group-text"><i class="bi bi-search"></i></span>

          <input
            type="text"
            class="form-control"
            placeholder="Cari nama…"
            v-model.trim="quickSearch"
            @input="onQuickSearch"
            @keyup.enter="applyFilter"
          />

          <button class="btn btn-outline-secondary" @click="applyFilter">Cari</button>

          <button class="btn btn-sm btn-outline-dark" @click="resetFilter">
            <i class="bi bi-arrow-counterclockwise me-1"></i>Reset
          </button>
        </div>
      </div>
    </div>

    <!-- Card Tabel -->
    <div class="card soft-card">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table
            id="tableTipeAbsen"
            class="table table-hover table-striped align-middle mb-0 display nowrap"
            style="width: 100%"
          >
            <thead class="table-light">
              <tr>
                <th class="text-nowrap">Nama</th>
                <th class="text-center text-nowrap">Status</th>
                <th class="text-center text-nowrap" style="width: 150px">Aksi</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Tambah -->
    <div
      class="modal fade"
      id="tambahModal"
      tabindex="-1"
      aria-labelledby="tambahModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <form @submit.prevent="submitTambah" class="modal-content" autocomplete="off">
          <div class="modal-header">
            <h5 class="modal-title"><i class="bi bi-plus-circle me-2"></i>Tambah Group Visitor</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>

          <div class="modal-body">
            <div class="form-floating mb-3">
              <input
                type="text"
                v-model.trim="form.nama"
                id="nama"
                class="form-control"
                :class="{ 'is-invalid': errors.nama }"
                placeholder="Nama group"
                required
                maxlength="100"
              />
              <label for="nama" class="form-label">Nama</label>
              <div class="form-text">Maks. 100 karakter.</div>
              <div class="invalid-feedback" v-if="errors.nama">{{ errors.nama[0] }}</div>
            </div>

            <div class="form-floating mb-3">
              <select v-model="form.status" id="status" class="form-select">
                <option :value="1">Aktif</option>
                <option :value="0">Tidak Aktif</option>
              </select>
              <label for="status" class="form-label">Status</label>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-light" data-bs-dismiss="modal">Batal</button>
            <button type="submit" class="btn btn-primary" :disabled="submitting">
              <span
                v-if="submitting"
                class="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Filter -->
    <div
      class="modal fade"
      id="filterModal"
      tabindex="-1"
      aria-labelledby="filterModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <form @submit.prevent="applyFilter" class="modal-content">
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

            <div class="form-floating mb-3">
              <select v-model="filter.status" id="filterStatus" class="form-select">
                <option :value="''">Semua</option>
                <option :value="1">Aktif</option>
                <option :value="0">Tidak Aktif</option>
              </select>
              <label for="filterStatus" class="form-label">Status</label>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-light" @click="resetFilter">Reset</button>
            <button type="submit" class="btn btn-primary" data-bs-dismiss="modal">Terapkan</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Edit -->
    <div
      class="modal fade"
      id="editModal"
      tabindex="-1"
      aria-labelledby="editModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <form @submit.prevent="submitEdit" class="modal-content" autocomplete="off">
          <div class="modal-header">
            <h5 class="modal-title"><i class="bi bi-pencil-square me-2"></i>Edit Group Visitor</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>

          <div class="modal-body">
            <div class="form-floating mb-3">
              <input
                type="text"
                v-model.trim="form.nama"
                id="editNama"
                class="form-control"
                :class="{ 'is-invalid': errors.nama }"
                placeholder="Nama group"
                required
                maxlength="100"
              />
              <label for="editNama" class="form-label">Nama</label>
              <div class="form-text">Maks. 100 karakter.</div>
              <div class="invalid-feedback" v-if="errors.nama">{{ errors.nama[0] }}</div>
            </div>

            <div class="form-floating mb-3">
              <select v-model="form.status" id="editStatus" class="form-select">
                <option :value="1">Aktif</option>
                <option :value="0">Tidak Aktif</option>
              </select>
              <label for="editStatus" class="form-label">Status</label>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-light" data-bs-dismiss="modal">Batal</button>
            <button type="submit" class="btn btn-primary" :disabled="submitting">
              <span
                v-if="submitting"
                class="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              Update
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Toast -->
    <div class="position-fixed top-0 end-0 p-3" style="z-index: 1080">
      <div
        ref="toast"
        class="toast align-items-center text-bg-success border-0"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        <div class="d-flex">
          <div class="toast-body">{{ toastMessage }}</div>
          <button
            type="button"
            class="btn-close btn-close-white me-2 m-auto"
            @click="hideToast"
          ></button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { nextTick } from "vue";
import $ from "jquery";
import "datatables.net";
import "datatables.net-responsive";
import axios from "axios";

export default {
  name: "GroupVisitorList",

  data() {
    return {
      appsUrl: import.meta.env.VITE_API_APPS,

      table: null,
      quickSearch: "",
      debounceTimer: null,

      submitting: false,
      toastMessage: "Tersimpan!",

      filter: { nama: "", status: "" },
      form: { id: "", nama: "", status: 1 },
      errors: {},

      // modal elements & instances
      tambahModalEl: null,
      tambahModalInstance: null,
      editModalEl: null,
      editModalInstance: null,
      filterModalEl: null,
      filterModalInstance: null,
    };
  },

  methods: {
    /* ---------- DataTable init ---------- */
    initDataTable() {
      const vm = this;
      const url = this.appsUrl + "/master/group_visitor";
      const token = { Token: "Bearer " + localStorage.getItem("actasysToken") };

      this.table = $("#tableTipeAbsen").DataTable({
        dom: 't<"d-flex justify-content-between align-items-center p-3"ip>',
        processing: true,
        serverSide: true,
        responsive: true,
        pageLength: 25,
        ajax: {
          url,
          type: "GET",
          headers: token,
          data(d) {
            d.nama = vm.filter.nama;
            d.status = vm.filter.status;
            if (vm.quickSearch) d.nama = vm.quickSearch;
          },
        },
        columns: [
          { data: "nama", className: "fw-semibold" },
          {
            data: "status",
            className: "text-center",
            width: "150px",
            render(data) {
              const badge = Number(data) === 1 ? "success" : "secondary";
              const text = Number(data) === 1 ? "Aktif" : "Tidak Aktif";
              return `<span class="badge rounded-pill text-bg-${badge} px-3 py-2">${text}</span>`;
            },
          },
          {
            data: null,
            className: "text-center",
            orderable: false,
            width: "150px",
            render(data) {
              return `
                <div class="btn-group btn-group-sm" role="group">
                  <button class="btn btn-warning btn-edit" data-id="${data.id}">
                    <i class="bi bi-pencil-square"></i> Edit
                  </button>
                </div>`;
            },
          },
        ],
        language: {
          emptyTable: `<div class="py-5 text-center text-muted">
                  <i class="bi bi-inboxes" style="font-size:2rem"></i>
                  <div class="mt-2">Belum ada data</div>
                </div>`,
          paginate: { previous: "&laquo;", next: "&raquo;" },
          info: "Menampilkan _START_–_END_ dari _TOTAL_ data",
          processing: `<div class="py-4 text-center">
                  <div class="spinner-border" role="status" aria-hidden="true"></div>
                  <div class="small mt-2 text-muted">Memuat…</div>
                </div>`,
        },
      });
    },

    /* ---------- Filters ---------- */
    applyFilter() {
      this.table?.ajax.reload();
    },
    resetFilter() {
      this.filter.nama = "";
      this.filter.status = "";
      this.quickSearch = "";
      this.table?.ajax.reload();
    },
    openFilter() {
      if (this.filterModalInstance) this.filterModalInstance.show();
    },

    /* ---------- Quick search (debounce) ---------- */
    onQuickSearch() {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.table?.ajax.reload();
      }, 300);
    },

    /* ---------- Form actions ---------- */
    openTambah() {
      this.resetForm();
      nextTick(() => {
        if (this.tambahModalInstance) this.tambahModalInstance.show();
      });
    },

    async submitTambah() {
      Object.keys(this.errors).forEach((k) => delete this.errors[k]);
      this.submitting = true;

      const url = this.appsUrl + "/master/group_visitor_add";
      const payload = {
        id: "",
        nama: this.form.nama,
        status: this.form.status,
        by: localStorage.getItem("user_nama"),
      };
      const token = { headers: { Token: "Bearer " + localStorage.getItem("actasysToken") } };

      try {
        await axios.post(url, payload, token);
        if (this.tambahModalInstance) this.tambahModalInstance.hide();
        this.resetForm();
        this.table?.ajax.reload();
        this.showToast("Berhasil menambah group visitor.", "success");
      } catch (err) {
        if (err.response && err.response.status === 400) {
          Object.assign(this.errors, err.response.data || {});
        } else {
          this.showToast("Terjadi kesalahan. Coba lagi nanti.", "danger");
        }
      } finally {
        this.submitting = false;
      }
    },

    resetForm() {
      this.form.id = "";
      this.form.nama = "";
      this.form.status = 1;
      Object.keys(this.errors).forEach((k) => delete this.errors[k]);
    },

    openEditModal(id) {
      const url = this.appsUrl + `/master/group_visitor_show/${id}`;
      const token = { headers: { Token: "Bearer " + localStorage.getItem("actasysToken") } };

      axios
        .get(url, token)
        .then((res) => {
          const data = res.data || {};
          this.form.id = id;
          this.form.nama = data.nama ?? "";
          this.form.status = data.status ?? 1;
          nextTick(() => {
            if (this.editModalInstance) this.editModalInstance.show();
            nextTick(() => document.getElementById("editNama")?.focus());
          });
        })
        .catch(() => {
          this.showToast("Gagal mengambil data. Silakan coba lagi.", "danger");
        });
    },

    async submitEdit() {
      this.submitting = true;
      Object.keys(this.errors).forEach((k) => delete this.errors[k]);

      const url = this.appsUrl + `/master/group_visitor_add`;
      const payload = {
        id: this.form.id,
        nama: this.form.nama,
        status: this.form.status,
        by: localStorage.getItem("user_nama"),
      };
      const token = { headers: { Token: "Bearer " + localStorage.getItem("actasysToken") } };

      try {
        await axios.post(url, payload, token);
        if (this.editModalInstance) this.editModalInstance.hide();
        this.resetForm();
        this.table?.ajax.reload(null, false);
        this.showToast("Berhasil memperbarui group visitor.", "success");
      } catch (err) {
        if (err.response && err.response.status === 400) {
          Object.assign(this.errors, err.response.data || {});
        } else {
          this.showToast("Terjadi kesalahan. Coba lagi nanti.", "danger");
        }
      } finally {
        this.submitting = false;
      }
    },

    /* ---------- Toast helpers ---------- */
    showToast(message = "Berhasil!", variant = "success") {
      this.toastMessage = message;
      const el = this.$refs.toast;
      if (!el) return;
      el.classList.remove("text-bg-success", "text-bg-danger", "text-bg-warning");
      el.classList.add(`text-bg-${variant}`);
      const t = new window.bootstrap.Toast(el);
      t.show();
    },

    hideToast() {
      const el = this.$refs.toast;
      const t = window.bootstrap.Toast.getInstance(el);
      t?.hide();
    },
  },

  mounted() {
    this.initDataTable();

    // setup bootstrap modal instances
    if (typeof window !== "undefined" && window.bootstrap && window.bootstrap.Modal) {
      this.tambahModalEl = document.getElementById("tambahModal");
      this.editModalEl = document.getElementById("editModal");
      this.filterModalEl = document.getElementById("filterModal");

      if (this.tambahModalEl) {
        this.tambahModalInstance = window.bootstrap.Modal.getOrCreateInstance(this.tambahModalEl);
        this.tambahModalEl.addEventListener("shown.bs.modal", () => {
          Object.keys(this.errors).forEach((k) => delete this.errors[k]);
          nextTick(() => document.getElementById("nama")?.focus());
        });
      }

      if (this.editModalEl) {
        this.editModalInstance = window.bootstrap.Modal.getOrCreateInstance(this.editModalEl);
        this.editModalEl.addEventListener("hidden.bs.modal", () => {
          this.resetForm();
        });
      }

      if (this.filterModalEl) {
        this.filterModalInstance = window.bootstrap.Modal.getOrCreateInstance(this.filterModalEl);
      }
    } else {
      console.warn(
        "Bootstrap Modal API tidak tersedia — pastikan main.js men-assign window.bootstrap = bootstrap"
      );
    }

    // DataTable delegated events
    $("#tableTipeAbsen").on("click", ".btn-edit", (e) => {
      const id = $(e.currentTarget).data("id");
      this.openEditModal(id);
    });

    // DataTables error handler -> toast
    $.fn.dataTable.ext.errMode = (settings, helpPage, message) => {
      console.error(message);
      this.showToast("Gagal memuat data tabel.", "danger");
    };
  },

  unmounted() {
    try {
      if (this.table) {
        $(this.table.table().node()).off();
        this.table.destroy(true);
      }
    } catch (e) {}

    const safeReplace = (el) => {
      if (!el || !el.parentNode) return;
      try {
        const clone = el.cloneNode(true);
        el.parentNode.replaceChild(clone, el);
      } catch (e) {}
    };
    safeReplace(this.tambahModalEl);
    safeReplace(this.editModalEl);
    safeReplace(this.filterModalEl);

    $("#tableTipeAbsen").off("click", ".btn-edit");
  },
};
</script>

<style scoped src="@/apps/master/groupvisitor.css"></style>
