<template>
  <div class="container-fluid" v-cloak>
    <!-- Judul dan Breadcrumb -->
    <div class="mb-3">
      <h3 class="mb-1">
        <i class="bi bi-back"></i>
        Daftar Faq
      </h3>

      <nav aria-label="breadcrumb">
        <ol class="breadcrumb mb-0">
          <li class="breadcrumb-item"><a href="#">Home</a></li>
          <li class="breadcrumb-item"><a href="#">Transaction</a></li>
          <li class="breadcrumb-item active" aria-current="page">Faq</li>
        </ol>
      </nav>
    </div>

    <!-- Toolbar -->
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
      <div class="d-flex gap-2">
        <!-- Tombol Aksi -->
        <button
          class="btn btn-primary shadow-sm"
          data-bs-toggle="modal"
          data-bs-target="#tambahModal"
        >
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
            placeholder="Cari topik…"
            v-model.trim="filter.topik"
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
                <th class="text-nowrap">Topik</th>
                <th class="text-nowrap">Pertanyaan</th>
                <th class="text-nowrap">Jawaban</th>
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
        <form @submit.prevent="submitTambah" class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title"><i class="bi bi-plus-circle me-2"></i> Tambah Faq</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>

          <div class="modal-body">
            <!-- topik -->
            <div class="form-floating mb-3">
              <input
                type="text"
                v-model.trim="form.topik"
                id="topik"
                class="form-control"
                :class="{ 'is-invalid': errors.topik }"
                placeholder="Topik group"
                required
                maxlength="100"
              />
              <label for="topik" class="form-label">Topik</label>
              <div class="form-text">Maks. 100 karakter.</div>
              <div class="invalid-feedback" v-if="errors.topik">{{ errors.topik[0] }}</div>
            </div>

            <!-- textarea pertanyaan -->
            <div class="form-floating mb-3">
              <textarea
                v-model.trim="form.pertanyaan"
                id="pertanyaan"
                class="form-control"
                :class="{ 'is-invalid': errors.pertanyaan }"
                placeholder="Pertanyaan"
                required
                maxlength="200"
              ></textarea>
              <label for="pertanyaan" class="form-label">Pertanyaan</label>
              <div class="form-text">Maks. 200 karakter.</div>
              <div class="invalid-feedback" v-if="errors.pertanyaan">
                {{ errors.pertanyaan[0] }}
              </div>
            </div>

            <!-- textarea jawaban -->
            <div class="form-floating mb-3">
              <textarea
                v-model.trim="form.jawaban"
                id="jawaban"
                class="form-control"
                :class="{ 'is-invalid': errors.jawaban }"
                placeholder="Jawaban"
                required
                maxlength="200"
              ></textarea>
              <label for="jawaban" class="form-label">Jawaban</label>
              <div class="form-text">Maks. 200 karakter.</div>
              <div class="invalid-feedback" v-if="errors.jawaban">{{ errors.jawaban[0] }}</div>
            </div>

            <!-- status -->
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
                v-model.trim="filter.topik"
                id="filterTopik"
                class="form-control"
                placeholder="Topik"
              />
              <label for="filterTopik" class="form-label">Topik</label>
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
        <form @submit.prevent="submitEdit" class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title"><i class="bi bi-pencil-square me-2"></i> Edit Faq</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>

          <div class="modal-body">
            <div class="form-floating mb-3">
              <input
                type="text"
                v-model.trim="form.topik"
                id="editTopik"
                class="form-control"
                :class="{ 'is-invalid': errors.topik }"
                placeholder="Topik group"
                required
                maxlength="100"
              />
              <label for="editTopik" class="form-label">Topik</label>
              <div class="form-text">Maks. 100 karakter.</div>
              <div class="invalid-feedback" v-if="errors.topik">{{ errors.topik[0] }}</div>
            </div>

            <div class="form-floating mb-3">
              <input
                type="text"
                v-model.trim="form.pertanyaan"
                id="editPertanyaan"
                class="form-control"
                :class="{ 'is-invalid': errors.pertanyaan }"
                placeholder="Pertanyaan group"
                required
                maxlength="200"
              />
              <label for="editPertanyaan" class="form-label">Pertanyaan</label>
              <div class="form-text">Maks. 200 karakter.</div>
              <div class="invalid-feedback" v-if="errors.pertanyaan">
                {{ errors.pertanyaan[0] }}
              </div>
            </div>

            <div class="form-floating mb-3">
              <input
                type="text"
                v-model.trim="form.jawaban"
                id="editJawaban"
                class="form-control"
                :class="{ 'is-invalid': errors.jawaban }"
                placeholder="Jawaban group"
                required
                maxlength="200"
              />
              <label for="editJawaban" class="form-label">Jawaban</label>
              <div class="form-text">Maks. 200 karakter.</div>
              <div class="invalid-feedback" v-if="errors.jawaban">{{ errors.jawaban[0] }}</div>
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
        ref="toastEl"
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
import { nextTick, onBeforeUnmount, onMounted } from "vue";
import $ from "jquery";
import "datatables.net";
import "datatables.net-responsive";
import axios from "axios";

const tableSelector = "#tableTipeAbsen";

export default {
  name: "FaqList",

  data() {
    return {
      dataTable: null,

      submitting: false,
      toastMessage: "Tersimpan!",

      filter: {
        topik: "",
        status: "",
      },

      form: {
        id: "",
        topik: "",
        pertanyaan: "",
        jawaban: "",
        status: 1,
      },

      errors: {},
      quickSearchTimer: null,

      rootUrl: "https://api.burwoodsports.club/api",
    };
  },

  mounted() {
    this.initDataTable();

    // modal hooks
    $(document).on("shown.bs.modal", "#tambahModal", () => {
      Object.keys(this.errors).forEach((k) => delete this.errors[k]);
      nextTick(() => {
        const el = document.getElementById("topik");
        el && el.focus();
      });
    });

    $(document).on("hidden.bs.modal", "#editModal", () => {
      this.resetForm();
    });
  },

  beforeUnmount() {
    try {
      $(tableSelector).off("click", ".btn-edit");
      $(document).off("shown.bs.modal", "#tambahModal");
      $(document).off("hidden.bs.modal", "#editModal");
      if (this.dataTable) {
        this.dataTable.destroy(true);
        this.dataTable = null;
      }
    } catch (e) {
      // ignore
    }
  },

  methods: {
    /* Toast util */
    showToast(message = "Berhasil!", variant = "success") {
      this.toastMessage = message;
      const el = this.$refs.toastEl;
      if (!el) return;
      el.classList.remove("text-bg-success", "text-bg-danger", "text-bg-warning");
      el.classList.add(`text-bg-${variant}`);
      // eslint-disable-next-line no-undef
      const toast = new bootstrap.Toast(el);
      toast.show();
    },

    hideToast() {
      const el = this.$refs.toastEl;
      if (!el) return;
      // eslint-disable-next-line no-undef
      const t = bootstrap.Toast.getInstance(el);
      t && t.hide();
    },

    /* DataTable init */
    initDataTable() {
      const url = this.rootUrl + "/transaction/faq";
      const token = { Token: "Bearer " + localStorage.getItem("actasysToken") };

      this.dataTable = $(tableSelector).DataTable({
        dom: 't<"d-flex justify-content-between align-items-center p-3"ip>',
        processing: true,
        serverSide: true,
        responsive: true,
        pageLength: 25,
        ajax: {
          url,
          type: "GET",
          headers: token,
          data: (d) => {
            d.topik = this.filter.topik;
            d.status = this.filter.status;
          },
        },
        columns: [
          { data: "topik", className: "fw-semibold" },
          { data: "pertanyaan", className: "fw-semibold" },
          { data: "jawaban", className: "fw-semibold" },
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
            render(row) {
              return `
                <div class="btn-group btn-group-sm" role="group">
                  <button class="btn btn-warning btn-edit" data-id="${row.id}">
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

      // error handler -> toast merah
      $.fn.dataTable.ext.errMode = (settings, helpPage, message) => {
        // eslint-disable-next-line no-console
        console.error(message);
        this.showToast("Gagal memuat data tabel.", "danger");
      };

      // delegate edit button click
      $(tableSelector).on("click", ".btn-edit", (e) => {
        const id = $(e.currentTarget).data("id");
        this.openEditModal(id);
      });
    },

    /* actions */
    applyFilter() {
      this.dataTable && this.dataTable.ajax.reload();
    },

    resetFilter() {
      this.filter.topik = "";
      this.filter.status = "";
      this.dataTable && this.dataTable.ajax.reload();
    },

    async submitTambah() {
      Object.keys(this.errors).forEach((k) => delete this.errors[k]);
      this.submitting = true;

      const url = this.rootUrl + "/transaction/faq_add";
      const payload = {
        id: "",
        topik: this.form.topik,
        pertanyaan: this.form.pertanyaan,
        jawaban: this.form.jawaban,
        status: this.form.status,
        by: localStorage.getItem("user_topik"),
      };
      const token = { headers: { Token: "Bearer " + localStorage.getItem("actasysToken") } };

      try {
        await axios.post(url, payload, token);
        // close modal
        // eslint-disable-next-line no-undef
        $("#tambahModal").modal("hide");
        this.resetForm();
        this.dataTable && this.dataTable.ajax.reload();
        this.showToast("Berhasil menambah FAQ.", "success");
      } catch (error) {
        if (error.response && error.response.status === 400) {
          Object.assign(this.errors, error.response.data || {});
        } else {
          this.showToast("Terjadi kesalahan. Coba lagi nanti.", "danger");
        }
      } finally {
        this.submitting = false;
      }
    },

    resetForm() {
      this.form.id = "";
      this.form.topik = "";
      this.form.pertanyaan = "";
      this.form.jawaban = "";
      this.form.status = 1;
      Object.keys(this.errors).forEach((k) => delete this.errors[k]);
    },

    async openEditModal(id) {
      const url = `${this.rootUrl}/transaction/faq_show/${id}`;
      const token = { headers: { Token: "Bearer " + localStorage.getItem("actasysToken") } };

      try {
        const { data } = await axios.get(url, token);
        this.form.id = id;
        this.form.topik = data.topik;
        this.form.pertanyaan = data.pertanyaan;
        this.form.jawaban = data.jawaban;
        this.form.status = data.status;
        // eslint-disable-next-line no-undef
        $("#editModal").modal("show");
      } catch {
        this.showToast("Gagal mengambil data. Silakan coba lagi.", "danger");
      }
    },

    async submitEdit() {
      this.submitting = true;
      Object.keys(this.errors).forEach((k) => delete this.errors[k]);

      const url = `${this.rootUrl}/transaction/faq_add`;
      const payload = {
        id: this.form.id,
        topik: this.form.topik,
        pertanyaan: this.form.pertanyaan,
        jawaban: this.form.jawaban,
        status: this.form.status,
        by: localStorage.getItem("user_topik"),
      };
      const token = { headers: { Token: "Bearer " + localStorage.getItem("actasysToken") } };

      try {
        await axios.post(url, payload, token);
        // eslint-disable-next-line no-undef
        $("#editModal").modal("hide");
        this.resetForm();
        this.dataTable && this.dataTable.ajax.reload(null, false);
        this.showToast("Berhasil memperbarui FAQ.", "success");
      } catch (error) {
        if (error.response && error.response.status === 400) {
          Object.assign(this.errors, error.response.data || {});
        } else {
          this.showToast("Terjadi kesalahan. Coba lagi nanti.", "danger");
        }
      } finally {
        this.submitting = false;
      }
    },
  },
};
</script>

<style scoped src="@/apps/transaction/faq.css"></style>
