<template>
  <div class="container-fluid">
    <Navbar />

    <!-- Judul dan Breadcrumb -->
    <div class="mb-3 mt-3">
      <h3 class="mb-1">
        <i class="bi bi-card-checklist"></i>
        General Journal Voucher
      </h3>

      <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><a href="#">Home</a></li>
          <li class="breadcrumb-item"><a href="#">Finance</a></li>
          <li class="breadcrumb-item active" aria-current="page">General Journal Voucher</li>
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
          v-model="filter.no_transaksi"
          placeholder="Cari No. Transaksi"
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
            <th>Nomor</th>
            <th>Tanggal</th>
            <th>No. Ref.</th>
            <th>Balance</th>
            <th>Memo</th>
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
            <!-- No. Transaksi -->
            <div class="form-floating mb-3">
              <input
                type="text"
                v-model="form.no_transaksi"
                id="no_transaksi"
                class="form-control"
                :class="{ 'is-invalid': errors.no_transaksi }"
                readonly
              />
              <label for="no_transaksi" class="form-label">No. Transaksi</label>
              <div class="invalid-feedback" v-if="errors.no_transaksi">
                {{ errors.no_transaksi[0] }}
              </div>
            </div>

            <div class="form-floating mb-3 position-relative">
              <Cleave
                v-model="form.tgl_transaksi"
                :options="cleaveTanggal"
                id="filterTglFinance"
                class="form-control pe-5"
                placeholder="dd/mm/yyyy"
              />
              <label for="filterTglFinance">Tgl. Transaksi</label>

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
                v-model="form.tgl_transaksi"
                @close="showCal.add = false"
              />
            </div>

            <!-- No. Ref. -->
            <div class="form-floating mb-3">
              <input
                type="text"
                v-model="form.no_ref"
                id="no_ref"
                class="form-control"
                :class="{ 'is-invalid': errors.no_ref }"
              />
              <label for="no_ref" class="form-label">No. Ref.</label>
              <div class="invalid-feedback" v-if="errors.no_ref">{{ errors.no_ref[0] }}</div>
            </div>

            <!-- Memo -->
            <div class="form-floating mb-3">
              <input
                type="text"
                v-model="form.memo"
                id="memo"
                class="form-control"
                :class="{ 'is-invalid': errors.memo }"
              />
              <label for="memo" class="form-label">Memo</label>
              <div class="invalid-feedback" v-if="errors.memo">{{ errors.memo[0] }}</div>
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
              <input
                type="text"
                v-model="filter.no_transaksi"
                id="filterNoTransaksi"
                class="form-control"
              />
              <label for="filterNoTransaksi" class="form-label">No. Transaksi</label>
            </div>

            <div class="row">
              <!-- Tanggal Dari -->
              <div class="col-md-6">
                <div class="form-floating mb-3 position-relative">
                  <Cleave
                    v-model="filter.tgl_dari"
                    :options="cleaveTanggal"
                    class="form-control pe-5"
                    placeholder="dd/mm/yyyy"
                  />
                  <label>Tanggal Dari</label>

                  <button
                    type="button"
                    class="btn position-absolute end-0 top-50 translate-middle-y me-2 p-0 border-0 bg-transparent"
                    @click="showCalFilter.dari = !showCalFilter.dari"
                  >
                    <i class="bi bi-calendar-date"></i>
                  </button>

                  <UiCalendar
                    v-if="showCalFilter.dari"
                    v-model="filter.tgl_dari"
                    @close="showCalFilter.dari = false"
                  />
                </div>
              </div>

              <!-- Tanggal Sampai -->
              <div class="col-md-6">
                <div class="form-floating mb-3 position-relative">
                  <Cleave
                    v-model="filter.tgl_sampai"
                    :options="cleaveTanggal"
                    class="form-control pe-5"
                    placeholder="dd/mm/yyyy"
                  />
                  <label>Tanggal Sampai</label>

                  <button
                    type="button"
                    class="btn position-absolute end-0 top-50 translate-middle-y me-2 p-0 border-0 bg-transparent"
                    @click="showCalFilter.sampai = !showCalFilter.sampai"
                  >
                    <i class="bi bi-calendar-date"></i>
                  </button>

                  <UiCalendar
                    v-if="showCalFilter.sampai"
                    v-model="filter.tgl_sampai"
                    @close="showCalFilter.sampai = false"
                  />
                </div>
              </div>
            </div>

            <div class="form-floating mb-3">
              <select v-model.number="filter.status" id="filterStatus" class="form-select">
                <option :value="0">Pending</option>
                <option :value="1">Receive</option>
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
      showCal: {
        add: false,
        edit: false,
      },

      showCalFilter: {
        dari: false,
        sampai: false,
      },

      baseUrl: import.meta.env.VITE_API_ACTASYS,
      token: "",
      tokenHeaders: "",
      tokenList: "",

      searchText: "",

      table: null,
      isEditMode: false,

      filter: {
        no_transaksi: "",
        tgl_dari: this.todayIndo(),
        tgl_sampai: this.todayIndo(),
        status: 0,
      },

      form: {
        id: "",
        no_transaksi: "< Auto Number >",
        tgl_transaksi: this.todayIndo(),
        no_ref: "",
        memo: "",
        status: 1,
      },

      errors: {},

      dtEditClickHandler: null,
      formShownHandler: null,
      formHiddenHandler: null,

      cleaveTanggal: {
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

    this.initDataTable();

    // delegasi click tombol edit di dalam datatable
    $("#tableMain").on("click", ".btn-edit-router", (e) => {
      const id = $(e.currentTarget).data("id");

      if (id) {
        this.$router.push({
          name: "GeneralJournalVoucherDetail",
          params: { id },
        });
      }
    });

    // event modal form
    const formEl = document.getElementById("formModal");
    if (formEl) {
      this.formShownHandler = async () => {
        this.errors = {};
        await this.$nextTick();
        const el = document.getElementById("no_transaksi");
        if (el) el.focus();
      };
      formEl.addEventListener("shown.bs.modal", this.formShownHandler);

      this.formHiddenHandler = () => {
        this.resetForm();
        this.isEditMode = false;
      };
      formEl.addEventListener("hidden.bs.modal", this.formHiddenHandler);
    }

    // autofocus filter no_transaksi saat filterModal dibuka
    const filterEl = document.getElementById("filterModal");
    if (filterEl) {
      filterEl.addEventListener("shown.bs.modal", async () => {
        await this.$nextTick();
        const el = document.getElementById("filterNoTransaksi");
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

    // Search global DataTables
    doSearch() {
      if (this.table) this.table.search(this.filter.no_transaksi).draw();
    },

    // init datatable
    initDataTable() {
      const url = `${this.baseUrl}/finance/general_journal_voucher`;

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
            d.no_transaksi = this.filter.no_transaksi;
            d.tgl_dari = this.dateIndoToUS(this.filter.tgl_dari);
            d.tgl_sampai = this.dateIndoToUS(this.filter.tgl_sampai);
            d.status = this.filter.status;
          },
        },
        columns: [
          { data: "id", visible: false },
          { data: "no_transaksi", className: "text-center" },
          {
            data: "tgl_transaksi",
            className: "text-center",
            width: "200px",
            render: (data) => {
              return this.dateUSToIndo(data);
            },
          },
          {
            data: "no_ref",
            width: "200px",
          },
          { data: "balance" },
          { data: "memo" },
          {
            data: "status",
            className: "text-center",
            width: "150px",
            render(data) {
              return data == 1 ? "Received" : "Pending";
            },
          },
          {
            data: null,
            className: "text-center",
            width: "230px",
            orderable: false,
            render(row) {
              return `
                      <button 
                        class="btn btn-sm btn-warning btn-edit-router"
                        data-id="${row.id}"
                      >
                        <i class="bi bi-pencil-square me-1"></i>Edit
                      </button>
                    `;
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

      const url = `${this.baseUrl}/finance/general_journal_voucher_show/${id}`;
      try {
        const resp = await axios.get(url, this.tokenHeaders);
        const data = resp.data || {};
        this.form.id = id;
        this.form.no_transaksi = data.no_transaksi ?? "";
        this.form.no_ref = data.no_ref ?? "";
        this.form.tgl_transaksi = this.dateUSToIndo(data.tgl_transaksi) ?? "";
        this.form.memo = data.memo ?? "";
        this.form.status = typeof data.status !== "undefined" ? data.status : 1;

        this.showFormModal();
      } catch (err) {
        console.error("openEditModal", err);
        alert("Gagal mengambil data. Silakan coba lagi.");
      }
    },

    async submitForm() {
      this.errors = {};

      const url = `${this.baseUrl}/finance/general_journal_voucher_add`;

      const payload = {
        id: this.isEditMode ? this.form.id : "",
        no_transaksi: this.form.no_transaksi,
        no_ref: this.form.no_ref,
        tgl_transaksi: this.dateIndoToUS(this.form.tgl_transaksi),
        memo: this.form.memo,
        status: this.form.status,
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
        no_transaksi: "< Auto Number >",
        tgl_transaksi: this.todayIndo(),
        no_ref: "",
        memo: "",
        status: 1,
      };
      this.errors = {};
    },

    doSearch() {
      if (this.table) this.table.ajax.reload();
    },

    resetFilter() {
      this.filter = {
        no_transaksi: "",
        tgl_dari: this.todayIndo(),
        tgl_sampai: this.todayIndo(),
        status: 0,
      };
      if (this.table) this.table.ajax.reload();
    },
  },
};
</script>

<style scoped src="@/apps/finance/generaljournalvoucher.css"></style>
