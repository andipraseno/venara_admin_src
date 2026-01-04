<template>
  <div class="container-fluid" v-cloak>
    <!-- Title & Breadcrumb -->
    <div class="mb-3">
      <h3 class="mb-1">
        <i class="bi bi-book"></i>
        Daftar Olahraga
      </h3>

      <nav aria-label="breadcrumb">
        <ol class="breadcrumb mb-0 small">
          <li class="breadcrumb-item"><a href="#">Home</a></li>
          <li class="breadcrumb-item"><a href="#">Master</a></li>
          <li class="breadcrumb-item active" aria-current="page">Olahraga</li>
        </ol>
      </nav>
    </div>

    <!-- Toolbar -->
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
      <div class="d-flex gap-2">
        <button class="btn btn-primary" @click="openAdd">
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

      <!-- Quick filter -->
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
              <th class="text-center" style="width: 160px">Urutan</th>
              <th class="text-center" style="width: 140px">Status</th>
              <th class="text-center" style="width: 140px">Aksi</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
    </div>

    <!-- Modal Form (Tambah + Edit) -->
    <div
      class="modal fade"
      id="formModal"
      tabindex="-1"
      aria-labelledby="formModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <form @submit.prevent="submitForm" class="modal-content" autocomplete="off">
          <div class="modal-header">
            <h5 class="modal-title">
              <i :class="isEdit ? 'bi bi-pencil-square me-2' : 'bi bi-plus-circle me-2'"></i>
              {{ isEdit ? "Edit Olahraga" : "Tambah Olahraga" }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>

          <div class="modal-body">
            <!-- nama -->
            <div class="form-floating mb-3">
              <input
                type="text"
                v-model.trim="form.nama"
                id="nama"
                class="form-control"
                :class="{ 'is-invalid': errors.nama }"
                placeholder="Nama"
                required
              />
              <label for="nama" class="form-label">Nama</label>
              <div class="invalid-feedback" v-if="errors.nama">{{ errors.nama[0] }}</div>
            </div>

            <!-- urutan -->
            <div class="form-floating mb-3">
              <cleave
                v-model="form.urutan"
                :options="cleaveNumberOpts"
                id="urutan"
                class="form-control"
                :class="{ 'is-invalid': errors.urutan }"
                inputmode="numeric"
                placeholder="Urutan"
              />
              <label for="urutan" class="form-label">Urutan</label>
              <div class="invalid-feedback" v-if="errors.urutan">{{ errors.urutan[0] }}</div>
            </div>

            <!-- status -->
            <div class="form-floating mb-1">
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
              <i :class="isEdit ? 'bi bi-check2 me-1' : 'bi bi-save2 me-1'"></i>
              {{ isEdit ? "Update" : "Simpan" }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Filter Modal (tetap terpisah) -->
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
  </div>
</template>

<script>
import { nextTick } from "vue";
import $ from "jquery";
import "datatables.net";
import "datatables.net-responsive";
import axios from "axios";
// Cleave diasumsikan sudah diregistrasi global di main.js

// helper: parse Cleave formatted number "1.234,56" -> 1234.56
function parseCleaveNumber(str) {
  if (str === null || str === undefined) return 0;
  let s = String(str).trim();
  if (!s) return 0;

  const hasComma = s.includes(",");
  const hasDot = s.includes(".");

  if (hasComma && hasDot) {
    s = s.replace(/\./g, "").replace(",", ".");
  } else if (hasComma && !hasDot) {
    s = s.replace(",", ".");
  } else if (!hasComma && hasDot) {
    const parts = s.split(".");
    if (parts.length > 2) {
      const dec = parts.pop();
      s = parts.join("") + "." + dec;
    }
  }
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

export default {
  name: "OlahragaList",

  data() {
    return {
      table: null,
      isLoading: false,

      filter: { nama: "", status: 1 },

      form: { id: "", nama: "", urutan: "", status: 1 },

      isEdit: false,

      errors: {},

      cleaveNumberOpts: {
        numeral: true,
        numeralDecimalScale: 2,
        numeralPositiveOnly: true,
        numeralThousandsGroupStyle: "thousand",
        delimiter: ".",
        numeralDecimalMark: ",",
      },

      // Modal API refs & handlers
      formModalEl: null,
      formModalInstance: null,
      onShownHandler: null,
      onHiddenHandler: null,
    };
  },

  methods: {
    // DataTable init
    initDataTable() {
      const vm = this;
      const rootUrl = import.meta.env.VITE_API_APPS;
      const url = rootUrl + "/master/olahraga";
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
          headers: { Token: token.Token },
          data(d) {
            d.nama = vm.filter.nama;
            d.status = vm.filter.status;
          },
        },
        columns: [
          { data: "nama" },
          { data: "urutan", className: "text-center", width: "160px" },
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
            width: "140px",
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

      // hooks untuk overlay loading
      $("#tableTipeAbsen").on("preXhr.dt", () => {
        this.isLoading = true;
      });
      $("#tableTipeAbsen").on("xhr.dt", () => {
        this.isLoading = false;
      });
    },

    // filter actions
    applyFilter() {
      if (this.table) this.table.ajax.reload();
    },
    resetFilter() {
      this.filter.nama = "";
      this.filter.status = 1;
      if (this.table) this.table.ajax.reload();
    },

    // form actions
    openAdd() {
      this.isEdit = false;
      this.resetForm();
      nextTick(() => {
        if (this.formModalInstance) this.formModalInstance.show();
        else $("#formModal").modal?.("show"); // fallback (tidak efektif di BS5)
      });
    },

    openEdit(id) {
      const rootUrl = import.meta.env.VITE_API_APPS;
      const url = `${rootUrl}/master/olahraga_show/${id}`;
      const token = {
        headers: {
          Token: "Bearer " + localStorage.getItem("actasysToken"),
        },
      };

      axios
        .get(url, token)
        .then((res) => {
          const d = res.data || {};
          this.form.id = id;
          this.form.nama = d.nama || "";
          this.form.urutan = d.urutan ?? "";
          this.form.status = d.status ?? 1;
          this.isEdit = true;
          nextTick(() => {
            if (this.formModalInstance) this.formModalInstance.show();
          });
        })
        .catch(() => alert("Gagal mengambil data. Silakan coba lagi."));
    },

    submitForm() {
      // merged submit for add & edit
      Object.keys(this.errors).forEach((k) => delete this.errors[k]);

      const rootUrl = import.meta.env.VITE_API_APPS;
      const url = rootUrl + "/master/olahraga_add";
      const payload = {
        id: this.isEdit ? this.form.id : "",
        nama: this.form.nama,
        urutan: parseCleaveNumber(this.form.urutan),
        status: this.form.status,
        by: localStorage.getItem("user_nama"),
      };
      const token = {
        headers: {
          Token: "Bearer " + localStorage.getItem("actasysToken"),
        },
      };

      axios
        .post(url, payload, token)
        .then(() => {
          if (this.formModalInstance) this.formModalInstance.hide();
          this.resetForm();
          if (this.table) this.table.ajax.reload(null, false);
        })
        .catch((error) => {
          if (error.response && error.response.status === 400) {
            const resp = error.response.data || {};
            Object.keys(resp).forEach((k) => {
              this.errors[k] = resp[k];
            });
          } else {
            alert("Terjadi kesalahan. Coba lagi nanti.");
          }
        });
    },

    resetForm() {
      this.form.id = "";
      this.form.nama = "";
      this.form.urutan = "";
      this.form.status = 1;
      Object.keys(this.errors).forEach((k) => delete this.errors[k]);
    },
  },

  mounted() {
    this.initDataTable();

    // setup Bootstrap Modal API (BS5)
    this.formModalEl = document.getElementById("formModal");
    if (this.formModalEl && window.bootstrap && window.bootstrap.Modal) {
      this.formModalInstance = window.bootstrap.Modal.getOrCreateInstance(this.formModalEl);

      this.onShownHandler = () => {
        Object.keys(this.errors).forEach((k) => delete this.errors[k]);
        nextTick(() => document.getElementById("nama")?.focus());
      };

      this.onHiddenHandler = () => {
        this.resetForm();
      };

      this.formModalEl.addEventListener("shown.bs.modal", this.onShownHandler);
      this.formModalEl.addEventListener("hidden.bs.modal", this.onHiddenHandler);
    } else {
      console.warn(
        "Bootstrap Modal API tidak tersedia. Pastikan main.js men-assign window.bootstrap = bootstrap"
      );
    }

    // delegate edit button click from DataTable
    $("#tableTipeAbsen").on("click", ".btn-edit", (e) => {
      const id = $(e.currentTarget).data("id");
      this.openEdit(id);
    });
  },

  unmounted() {
    // destroy datatable and event listeners
    try {
      if (this.table) {
        $(this.table.table().node()).off();
        this.table.destroy(true);
      }
    } catch (e) {}

    if (this.formModalEl && this.onShownHandler && this.onHiddenHandler) {
      this.formModalEl.removeEventListener("shown.bs.modal", this.onShownHandler);
      this.formModalEl.removeEventListener("hidden.bs.modal", this.onHiddenHandler);
    }
    $("#tableTipeAbsen").off("click", ".btn-edit");
  },
};
</script>

<style scoped src="@/apps/master/olahraga.css"></style>