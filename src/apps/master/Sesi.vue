<template>
  <div class="container-fluid" v-cloak>
    <!-- Title & Breadcrumb -->
    <div class="mb-3">
      <h3 class="mb-1">
        <i class="bi bi-book"></i>
        Daftar Sesi
      </h3>

      <nav aria-label="breadcrumb">
        <ol class="breadcrumb mb-0 small">
          <li class="breadcrumb-item"><a href="#">Home</a></li>
          <li class="breadcrumb-item"><a href="#">Master</a></li>
          <li class="breadcrumb-item active" aria-current="page">Sesi</li>
        </ol>
      </nav>
    </div>

    <!-- Toolbar -->
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
      <div class="d-flex gap-2">
        <button class="btn btn-primary" @click="openTambah">
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

      <!-- Quick filter kanan -->
      <div class="d-flex align-items-center gap-2">
        <div class="input-group input-group-sm" style="min-width: 260px">
          <span class="input-group-text"><i class="bi bi-search"></i></span>

          <input
            type="text"
            class="form-control"
            placeholder="Cari nama…"
            v-model.trim="filter.nama"
            @keyup.enter="applyFilter"
          />

          <button class="btn btn-outline-secondary" @click="applyFilter">Cari</button>

          <button class="btn btn-sm btn-outline-dark" @click="resetFilter">
            <i class="bi bi-arrow-counterclockwise me-1"></i>Reset
          </button>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="position-relative">
      <!-- loading overlay -->
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
          id="tableTipeAbsen"
          class="table table-hover align-middle mb-0 display nowrap"
          style="width: 100%"
        >
          <thead class="table-light sticky-thead">
            <tr>
              <th>Nama</th>
              <th class="text-center" style="width: 140px">Status</th>
              <th class="text-center" style="width: 150px">Aksi</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
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
        <form @submit.prevent="submitTambah" class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title"><i class="bi bi-plus-circle me-2"></i>Tambah Sesi</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
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
                placeholder="Nama"
                required
              />
              <label for="nama" class="form-label">Nama</label>
              <div class="invalid-feedback" v-if="errors.nama">
                {{ errors.nama[0] }}
              </div>
            </div>

            <!-- jam dari -->
            <div class="form-floating mb-3">
              <input
                type="text"
                v-model="form.jam_dari"
                id="jam_dari"
                class="form-control"
                :class="{ 'is-invalid': errors.jam_dari }"
                placeholder="HH:MM"
                inputmode="numeric"
              />
              <label for="jam_dari" class="form-label">Jam Dari (HH:MM)</label>
              <div class="invalid-feedback" v-if="errors.jam_dari">
                {{ errors.jam_dari[0] }}
              </div>
            </div>

            <!-- jam sampai -->
            <div class="form-floating mb-1">
              <input
                type="text"
                v-model="form.jam_sampai"
                id="jam_sampai"
                class="form-control"
                :class="{ 'is-invalid': errors.jam_sampai }"
                placeholder="HH:MM"
                inputmode="numeric"
              />
              <label for="jam_sampai" class="form-label">Jam Sampai (HH:MM)</label>
              <div class="invalid-feedback" v-if="errors.jam_sampai">
                {{ errors.jam_sampai[0] }}
              </div>
            </div>

            <!-- status -->
            <div class="form-floating mt-3">
              <select v-model="form.status" id="status" class="form-select">
                <option value="1">Aktif</option>
                <option value="0">Tidak Aktif</option>
              </select>
              <label for="status" class="form-label">Status</label>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-light border" data-bs-dismiss="modal">
              Batal
            </button>
            <button type="submit" class="btn btn-primary">
              <i class="bi bi-save2 me-1"></i>Simpan
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

            <div class="form-floating">
              <select v-model="filter.status" id="filterStatus" class="form-select">
                <option value="1">Aktif</option>
                <option value="0">Tidak Aktif</option>
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

    <!-- Modal Edit -->
    <div
      class="modal fade"
      id="editModal"
      tabindex="-1"
      aria-labelledby="editModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <form @submit.prevent="submitEdit" class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title"><i class="bi bi-pencil-square me-2"></i>Edit Sesi</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>

          <div class="modal-body">
            <div class="form-floating mb-3">
              <input
                type="text"
                v-model="form.nama"
                id="editNama"
                class="form-control"
                :class="{ 'is-invalid': errors.nama }"
                placeholder="Nama"
                required
              />
              <label for="editNama" class="form-label">Nama</label>
              <div class="invalid-feedback" v-if="errors.nama">
                {{ errors.nama[0] }}
              </div>
            </div>

            <div class="form-floating mb-3">
              <input
                type="text"
                v-model="form.jam_dari"
                id="editJamDari"
                class="form-control"
                :class="{ 'is-invalid': errors.jam_dari }"
                placeholder="HH:MM"
                inputmode="numeric"
              />
              <label for="editJamDari" class="form-label">Jam Dari (HH:MM)</label>
              <div class="invalid-feedback" v-if="errors.jam_dari">
                {{ errors.jam_dari[0] }}
              </div>
            </div>

            <div class="form-floating mb-1">
              <input
                type="text"
                v-model="form.jam_sampai"
                id="editJamSampai"
                class="form-control"
                :class="{ 'is-invalid': errors.jam_sampai }"
                placeholder="HH:MM"
                inputmode="numeric"
              />
              <label for="editJamSampai" class="form-label">Jam Sampai (HH:MM)</label>
              <div class="invalid-feedback" v-if="errors.jam_sampai">
                {{ errors.jam_sampai[0] }}
              </div>
            </div>

            <div class="form-floating mt-3">
              <select v-model="form.status" id="editStatus" class="form-select">
                <option value="1">Aktif</option>
                <option value="0">Tidak Aktif</option>
              </select>
              <label for="editStatus" class="form-label">Status</label>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-light border" data-bs-dismiss="modal">
              Batal
            </button>
            <button type="submit" class="btn btn-primary">
              <i class="bi bi-check2 me-1"></i>Update
            </button>
          </div>
        </form>
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

// helper: validate HH:MM simple
function isValidHHMM(s) {
  if (!s) return true; // allow empty if not required
  const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(String(s).trim());
  return !!m;
}

export default {
  name: "SesiList",

  data() {
    return {
      table: null,
      isLoading: false,

      filter: { nama: "", status: 1 },

      form: { id: "", nama: "", jam_dari: "", jam_sampai: "", status: 1 },

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
    // init datatable
    initDataTable() {
      const vmFilter = this.filter;
      const rootUrl = import.meta.env.VITE_API_APPS;
      const url = rootUrl + "/master/sesi";
      const token = { Token: "Bearer " + localStorage.getItem("actasysToken") };

      this.table = $("#tableTipeAbsen").DataTable({
        dom: 't<"d-flex justify-content-between align-items-center mt-3"ip>',
        processing: true,
        serverSide: true,
        responsive: true,
        pageLength: 25,
        ajax: {
          url,
          type: "GET",
          headers: token,
          data(d) {
            d.nama = vmFilter.nama;
            d.status = vmFilter.status;
          },
        },
        columns: [
          { data: "nama" },
          {
            data: "status",
            className: "text-center",
            width: "140px",
            render(s) {
              return s == 1
                ? '<span class="badge text-bg-success">Aktif</span>'
                : '<span class="badge text-bg-secondary">Tidak Aktif</span>';
            },
          },
          {
            data: null,
            className: "text-center",
            orderable: false,
            width: "150px",
            render(row) {
              return `
                <button class="btn btn-sm btn-warning btn-edit" data-id="${row.id}">
                  <i class="bi bi-pencil-square"></i> <span class="d-none d-md-inline">Edit</span>
                </button>`;
            },
          },
        ],
        language: {
          paginate: { previous: "&laquo;", next: "&raquo;" },
          info: "Menampilkan _START_ - _END_ dari _TOTAL_ data",
          zeroRecords: "Tidak ada data",
        },
      });

      // loading overlay hooks
      $("#tableTipeAbsen").on("preXhr.dt", () => {
        this.isLoading = true;
      });
      $("#tableTipeAbsen").on("xhr.dt", () => {
        this.isLoading = false;
      });
    },

    // filters
    applyFilter() {
      if (this.table) this.table.ajax.reload();
    },
    resetFilter() {
      this.filter.nama = "";
      this.filter.status = 1;
      if (this.table) this.table.ajax.reload();
    },

    // reset form
    resetForm() {
      this.form.id = "";
      this.form.nama = "";
      this.form.jam_dari = "";
      this.form.jam_sampai = "";
      this.form.status = 1;
      Object.keys(this.errors).forEach((k) => delete this.errors[k]);
    },

    // tambah
    openTambah() {
      this.resetForm();
      nextTick(() => {
        if (this.tambahModalInstance) this.tambahModalInstance.show();
      });
    },

    submitTambah() {
      Object.keys(this.errors).forEach((k) => delete this.errors[k]);

      // basic validation for HH:MM
      if (!isValidHHMM(this.form.jam_dari)) {
        this.errors.jam_dari = ["Format jam dari harus HH:MM"];
        return;
      }
      if (!isValidHHMM(this.form.jam_sampai)) {
        this.errors.jam_sampai = ["Format jam sampai harus HH:MM"];
        return;
      }

      const rootUrl = import.meta.env.VITE_API_APPS;
      const url = rootUrl + "/master/sesi_add";
      const payload = {
        id: "",
        nama: this.form.nama,
        jam_dari: this.form.jam_dari,
        jam_sampai: this.form.jam_sampai,
        status: this.form.status,
        by: localStorage.getItem("user_nama"),
      };
      const token = { headers: { Token: "Bearer " + localStorage.getItem("actasysToken") } };

      axios
        .post(url, payload, token)
        .then(() => {
          if (this.tambahModalInstance) this.tambahModalInstance.hide();
          this.resetForm();
          if (this.table) this.table.ajax.reload(null, false);
        })
        .catch((error) => {
          if (error.response && error.response.status === 400) {
            Object.assign(this.errors, error.response.data || {});
          } else {
            alert("Terjadi kesalahan. Coba lagi nanti.");
          }
        });
    },

    // edit
    openEditModal(id) {
      const rootUrl = import.meta.env.VITE_API_APPS;
      const url = rootUrl + `/master/sesi_show/${id}`;
      const token = { headers: { Token: "Bearer " + localStorage.getItem("actasysToken") } };

      axios
        .get(url, token)
        .then((res) => {
          const d = res.data || {};
          this.form.id = id;
          this.form.nama = d.nama || "";
          this.form.jam_dari = d.jam_dari || "";
          this.form.jam_sampai = d.jam_sampai || "";
          this.form.status = d.status ?? 1;

          nextTick(() => {
            if (this.editModalInstance) this.editModalInstance.show();
            nextTick(() => document.getElementById("editNama")?.focus());
          });
        })
        .catch(() => alert("Gagal mengambil data. Silakan coba lagi."));
    },

    submitEdit() {
      Object.keys(this.errors).forEach((k) => delete this.errors[k]);

      if (!isValidHHMM(this.form.jam_dari)) {
        this.errors.jam_dari = ["Format jam dari harus HH:MM"];
        return;
      }
      if (!isValidHHMM(this.form.jam_sampai)) {
        this.errors.jam_sampai = ["Format jam sampai harus HH:MM"];
        return;
      }

      const rootUrl = import.meta.env.VITE_API_APPS;
      const url = rootUrl + `/master/sesi_add`;
      const payload = {
        id: this.form.id,
        nama: this.form.nama,
        jam_dari: this.form.jam_dari,
        jam_sampai: this.form.jam_sampai,
        status: this.form.status,
        by: localStorage.getItem("user_nama"),
      };
      const token = { headers: { Token: "Bearer " + localStorage.getItem("actasysToken") } };

      axios
        .post(url, payload, token)
        .then(() => {
          if (this.editModalInstance) this.editModalInstance.hide();
          this.resetForm();
          if (this.table) this.table.ajax.reload(null, false);
        })
        .catch((error) => {
          if (error.response && error.response.status === 400) {
            Object.assign(this.errors, error.response.data || {});
          } else {
            alert("Terjadi kesalahan. Coba lagi nanti.");
          }
        });
    },
  },

  mounted() {
    this.initDataTable();

    // prepare bootstrap modal instances if available
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
        this.tambahModalEl.addEventListener("hidden.bs.modal", () => {
          Object.keys(this.errors).forEach((k) => delete this.errors[k]);
        });
      }

      if (this.editModalEl) {
        this.editModalInstance = window.bootstrap.Modal.getOrCreateInstance(this.editModalEl);
        this.editModalEl.addEventListener("hidden.bs.modal", () => {
          this.resetForm();
          Object.keys(this.errors).forEach((k) => delete this.errors[k]);
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

<style scoped src="@/apps/master/sesi.css"></style>