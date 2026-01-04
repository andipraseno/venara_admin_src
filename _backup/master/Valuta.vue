<template>
  <div class="container-fluid">
    <Navbar />

    <!-- Judul -->
    <div class="mb-3">
      <h3 class="mb-1">
        <i class="bi bi-book"></i>
        Valuta
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
            <th>Simbol</th>
            <th>Kurs</th>
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
            <!-- Nama -->
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

            <!-- Simbol -->
            <div class="form-floating mb-3">
              <input
                type="text"
                class="form-control"
                v-model="form.simbol"
                :class="{ 'is-invalid': errors.simbol }"
              />
              <label>Simbol</label>
              <div class="invalid-feedback" v-if="errors.simbol">
                {{ errors.simbol[0] }}
              </div>
            </div>

            <!-- KURS PAKAI CLEAVE -->
            <div class="form-floating mb-3">
              <Cleave
                v-model="form.kurs"
                :options="cleaveKurs"
                class="form-control"
                :class="{ 'is-invalid': errors.kurs }"
                placeholder="0"
              />
              <label>Kurs</label>
              <div class="invalid-feedback" v-if="errors.kurs">
                {{ errors.kurs[0] }}
              </div>
            </div>

            <!-- Status -->
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
        <form @submit.prevent="applyFilter" class="modal-content">
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
import Cleave from "vue-cleave-component";

export default {
  name: "ValutaPage",

  components: {
    Navbar,
    Cleave,
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
        simbol: "",
        kurs: "",
        status: 1,
      },

      dtEditClickHandler: null,
      formShownHandler: null,
      formHiddenHandler: null,

      // opsi Cleave untuk kurs (format Indonesia)
      cleaveKurs: {
        numeral: true,
        numeralThousandsGroupStyle: "thousand",
        numeralDecimalMark: ",", // koma sebagai desimal
        delimiter: ".", // titik sebagai pemisah ribuan
        numeralDecimalScale: 2,
      },
    };
  },

  computed: {
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

    // Delegasi klik tombol Edit di tabel
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
    // ---------- Modal helper ----------
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

    // ---------- Helper kurs ----------
    // untuk tampilan di tabel (Intl)
    formatKurs(val) {
      if (val === null || val === undefined || val === "") return "";
      const s = String(val).trim();
      // support input "12000,00" atau "12.000,00" atau "12000.00"
      const normalized = s.replace(/\./g, "").replace(",", ".");
      const num = Number(normalized);
      if (Number.isNaN(num)) return s;
      return new Intl.NumberFormat("id-ID", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(num);
    },

    // untuk normalisasi sebelum kirim ke backend:
    // contoh: "12.000,00" -> "12000.00"
    normalizeKurs(value) {
      /**
       * Hasil SELALU bentuk:
       *   12000.00  (dua desimal, titik sebagai decimal separator)
       */
      if (value === null || value === undefined || value === "") {
        return "0.00";
      }

      let str = String(value).trim();
      if (str === "") {
        return "0.00";
      }

      // hilangkan titik (ribuan) dan ganti koma jadi titik (desimal)
      str = str.replace(/\./g, "").replace(",", ".");

      const num = parseFloat(str);
      if (isNaN(num)) {
        return "0.00";
      }

      return num.toFixed(2); // contoh: 12000 -> "12000.00"
    },

    // untuk *isi awal* input Cleave dari data backend
    // supaya 12000 / "12000.00" → jadi "12.000,00"
    prepareKursForInput(val) {
      if (val === null || val === undefined || val === "") return "";
      const s = String(val).trim();
      const normalized = s.replace(/\./g, "").replace(",", ".");
      const num = Number(normalized);
      if (Number.isNaN(num)) return s;
      const fixed = num.toFixed(2); // "12000.00"
      // Cleave pakai koma sebagai decimalMark, jadi ubah titik jadi koma
      return fixed.replace(".", ","); // "12000,00" -> nanti Cleave format "12.000,00"
    },

    // ---------- DataTable ----------
    initDataTable() {
      if ($.fn.dataTable && $.fn.dataTable.isDataTable("#tableMain")) {
        $("#tableMain").DataTable().destroy();
      }

      const vm = this;

      this.table = $("#tableMain").DataTable({
        dom: 't<"d-flex justify-content-between align-items-center mt-3"ip>',
        processing: true,
        serverSide: true,
        responsive: true,
        pageLength: 25,
        ajax: {
          url: `${this.baseUrl}/master/valuta`,
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
            data: "simbol",
            className: "text-center",
            width: "120px",
          },
          {
            data: "kurs",
            className: "text-end",
            width: "180px",
            render(data) {
              return vm.formatKurs(data);
            },
          },
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
            width: "100px",
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

    // Search global DataTables (pakai searchText)
    doSearch() {
      if (this.table) {
        this.table.search(this.searchText).draw();
      }
    },

    applyFilter() {
      if (this.table) {
        this.table.ajax.reload();
      }
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
        const res = await axios.get(`${this.baseUrl}/master/valuta_show/${id}`, this.tokenHeaders);
        const data = res.data || {};
        this.form.id = data.id ?? "";
        this.form.nama = data.nama ?? "";
        this.form.simbol = data.simbol ?? "";
        // penting: gunakan prepareKursForInput, bukan formatKurs
        this.form.kurs = this.prepareKursForInput(data.kurs);
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
        // kirim ke backend dalam format "12000.00"
        kurs: this.normalizeKurs(this.form.kurs),
        by: localStorage.getItem("user_nama"),
      };

      try {
        await axios.post(`${this.baseUrl}/master/valuta_add`, payload, this.tokenHeaders);

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

    resetFilter() {
      this.filter = {
        nama: "",
        status: 1,
      };
      if (this.table) {
        this.table.ajax.reload();
      }
    },

    resetForm() {
      this.form = {
        id: "",
        nama: "",
        simbol: "",
        kurs: "",
        status: 1,
      };
      this.errors = {};
    },
  },
};
</script>

<style scoped src="@/apps/master/Valuta.css"></style>
