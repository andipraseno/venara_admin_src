<template>
  <div class="container-fluid">
    <Navbar />

    <!-- Judul dan Breadcrumb -->
    <div class="mb-3 mt-3">
      <h3 class="mb-1">
        <i class="bi bi-book"></i>
        Barang
      </h3>

      <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><a href="#">Home</a></li>
          <li class="breadcrumb-item"><a href="#">Master</a></li>
          <li class="breadcrumb-item active" aria-current="page">Barang</li>
        </ol>
      </nav>
    </div>

    <!-- Kiri: Tambah + Filter  |  Kanan: Search -->
    <div class="d-flex justify-content-between align-items-center mb-3">
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
            <th>SKU</th>
            <th>Kategori</th>
            <th>Availability</th>
            <th>Brand</th>
            <th>Satuan</th>
            <th>Grade</th>
            <th>Series</th>
            <th>Valuta</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody></tbody>
      </table>
    </div>

    <!-- -------------------------------------------- -->
    <!-- FORM MODAL INSERT / EDIT -->
    <!-- -------------------------------------------- -->
    <div
      class="modal fade"
      id="formModal"
      tabindex="-1"
      aria-labelledby="formModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-xl">
        <form @submit.prevent="submitForm" class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="formModalLabel">
              <i :class="isEditMode ? 'bi bi-pencil-square me-2' : 'bi bi-plus-circle me-2'"></i>
              {{ isEditMode ? "Edit Data" : "Tambah Data" }}
            </h5>

            <button class="btn-close" type="button" @click="hideFormModal"></button>
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
              <label for="nama">Nama</label>
              <div class="invalid-feedback" v-if="errors.nama">
                {{ errors.nama[0] }}
              </div>
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
              <label for="kode">Kode</label>
              <div class="invalid-feedback" v-if="errors.kode">
                {{ errors.kode[0] }}
              </div>
            </div>

            <!-- GRID -->
            <div class="row g-3">
              <!-- Kiri: atribut utama -->
              <div class="col-md-6">
                <div class="form-floating mb-3">
                  <select class="form-select" v-model="form.kategori_id" id="formKategori">
                    <option value="">Pilih Kategori</option>
                    <option v-for="s in kategoriList" :key="s.id" :value="s.id">
                      {{ s.nama }}
                    </option>
                  </select>
                  <label for="formKategori">Kategori</label>
                </div>

                <div class="form-floating mb-3">
                  <select class="form-select" v-model="form.availability_id" id="formAvailability">
                    <option value="">Pilih Availability</option>
                    <option v-for="s in availabilityList" :key="s.id" :value="s.id">
                      {{ s.nama }}
                    </option>
                  </select>
                  <label for="formAvailability">Availability</label>
                </div>

                <div class="form-floating mb-3">
                  <select class="form-select" v-model="form.brand_id" id="formBrand">
                    <option value="">Pilih Brand</option>
                    <option v-for="s in brandList" :key="s.id" :value="s.id">
                      {{ s.nama }}
                    </option>
                  </select>
                  <label for="formBrand">Brand</label>
                </div>

                <div class="form-floating mb-3">
                  <select class="form-select" v-model="form.satuan_id" id="formSatuan">
                    <option value="">Pilih Satuan</option>
                    <option v-for="s in satuanList" :key="s.id" :value="s.id">
                      {{ s.nama }}
                    </option>
                  </select>
                  <label for="formSatuan">Satuan</label>
                </div>

                <div class="form-floating mb-3">
                  <select class="form-select" v-model="form.grade_id" id="formGrade">
                    <option value="">Pilih Grade</option>
                    <option v-for="s in gradeList" :key="s.id" :value="s.id">
                      {{ s.nama }}
                    </option>
                  </select>
                  <label for="formGrade">Grade</label>
                </div>

                <div class="form-floating mb-3">
                  <select class="form-select" v-model="form.series_id" id="formSeries">
                    <option value="">Pilih Series</option>
                    <option v-for="s in seriesList" :key="s.id" :value="s.id">
                      {{ s.nama }}
                    </option>
                  </select>
                  <label for="formSeries">Series</label>
                </div>

                <div class="form-floating mb-3">
                  <select class="form-select" v-model="form.status" id="formStatus">
                    <option :value="1">Aktif</option>
                    <option :value="0">Tidak Aktif</option>
                  </select>
                  <label for="formStatus">Status</label>
                </div>
              </div>

              <!-- Kanan: valuta + harga -->
              <div class="col-md-6">
                <!-- Valuta -->
                <div class="form-floating mb-2">
                  <select class="form-select" v-model="form.valuta_id" id="formValuta">
                    <option value="">Pilih Valuta</option>
                    <option v-for="s in valutaList" :key="s.id" :value="s.id">
                      {{ s.nama }}
                    </option>
                  </select>
                  <label for="formValuta">Valuta</label>
                </div>
                <small class="form-text text-muted" style="font-style: italic">
                  harga selain Rupiah akan di konversi ke Rupiah berdasarkan Kurs terbaru yang
                  diinput!
                </small>

                <!-- Harga Retail + Konversi -->
                <div class="row mt-3">
                  <div class="col-md-6">
                    <div class="form-floating mb-3">
                      <Cleave
                        v-model="form.harga_retail"
                        :options="cleaveHarga"
                        class="form-control"
                        id="hargaRetail"
                        :class="{ 'is-invalid': errors.harga_retail }"
                        placeholder="0"
                      />
                      <label for="hargaRetail">Harga Retail</label>
                      <div class="invalid-feedback" v-if="errors.harga_retail">
                        {{ errors.harga_retail[0] }}
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-floating mb-3">
                      <input
                        type="text"
                        class="form-control"
                        id="hargaRetailKonversi"
                        :value="formatHargaDisplay(form.harga_retail_konversi)"
                        readonly
                      />
                      <label for="hargaRetailKonversi">Harga Retail (Konversi Rupiah)</label>
                    </div>
                  </div>
                </div>

                <!-- Harga Grosir + Konversi -->
                <div class="row">
                  <div class="col-md-6">
                    <div class="form-floating mb-3">
                      <Cleave
                        v-model="form.harga_grosir"
                        :options="cleaveHarga"
                        class="form-control"
                        id="hargaGrosir"
                        :class="{ 'is-invalid': errors.harga_grosir }"
                        placeholder="0"
                      />
                      <label for="hargaGrosir">Harga Grosir</label>
                      <div class="invalid-feedback" v-if="errors.harga_grosir">
                        {{ errors.harga_grosir[0] }}
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-floating mb-3">
                      <input
                        type="text"
                        class="form-control"
                        id="hargaGrosirKonversi"
                        :value="formatHargaDisplay(form.harga_grosir_konversi)"
                        readonly
                      />
                      <label for="hargaGrosirKonversi">Harga Grosir (Konversi Rupiah)</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- end row -->
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

    <!-- -------------------------------------------- -->
    <!-- FILTER MODAL (MULTI SELECT CHECKLIST) -->
    <!-- -------------------------------------------- -->
    <div
      class="modal fade"
      id="filterModal"
      tabindex="-1"
      aria-labelledby="filterModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-lg">
        <form @submit.prevent="doSearch" class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="formModalLabel">
              <i class="bi bi-funnel me-1"></i>
              Filter Data
            </h5>

            <button class="btn-close" type="button" data-bs-dismiss="modal"></button>
          </div>

          <div class="modal-body">
            <!-- Nama -->
            <div class="form-floating mb-3">
              <input type="text" v-model="filter.nama" class="form-control" id="filterNama" />
              <label for="filterNama">Nama</label>
            </div>

            <!-- Kode -->
            <div class="form-floating mb-3">
              <input type="text" v-model="filter.kode" class="form-control" id="filterKode" />
              <label for="filterKode">Kode</label>
            </div>

            <div class="row g-3">
              <div class="col-md-6">
                <!-- Kategori -->
                <div class="mb-3">
                  <label class="form-label fw-semibold">Kategori</label>
                  <div class="border rounded p-2" style="max-height: 200px; overflow-y: auto">
                    <div class="form-check" v-for="s in kategoriList" :key="s.id">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        :id="`fk-${s.id}`"
                        :value="s.id"
                        v-model="filter.kategori_ids"
                      />
                      <label class="form-check-label" :for="`fk-${s.id}`">
                        {{ s.nama }}
                      </label>
                    </div>
                  </div>
                </div>

                <!-- Availability -->
                <div class="mb-3">
                  <label class="form-label fw-semibold">Availability</label>
                  <div class="border rounded p-2" style="max-height: 200px; overflow-y: auto">
                    <div class="form-check" v-for="s in availabilityList" :key="s.id">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        :id="`fav-${s.id}`"
                        :value="s.id"
                        v-model="filter.availability_ids"
                      />
                      <label class="form-check-label" :for="`fav-${s.id}`">
                        {{ s.nama }}
                      </label>
                    </div>
                  </div>
                </div>

                <!-- Brand -->
                <div class="mb-3">
                  <label class="form-label fw-semibold">Brand</label>
                  <div class="border rounded p-2" style="max-height: 200px; overflow-y: auto">
                    <div class="form-check" v-for="s in brandList" :key="s.id">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        :id="`fbr-${s.id}`"
                        :value="s.id"
                        v-model="filter.brand_ids"
                      />
                      <label class="form-check-label" :for="`fbr-${s.id}`">
                        {{ s.nama }}
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-md-6">
                <!-- Satuan -->
                <div class="mb-3">
                  <label class="form-label fw-semibold">Satuan</label>
                  <div class="border rounded p-2" style="max-height: 200px; overflow-y: auto">
                    <div class="form-check" v-for="s in satuanList" :key="s.id">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        :id="`fsat-${s.id}`"
                        :value="s.id"
                        v-model="filter.satuan_ids"
                      />
                      <label class="form-check-label" :for="`fsat-${s.id}`">
                        {{ s.nama }}
                      </label>
                    </div>
                  </div>
                </div>

                <!-- Grade -->
                <div class="mb-3">
                  <label class="form-label fw-semibold">Grade</label>
                  <div class="border rounded p-2" style="max-height: 200px; overflow-y: auto">
                    <div class="form-check" v-for="s in gradeList" :key="s.id">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        :id="`fgr-${s.id}`"
                        :value="s.id"
                        v-model="filter.grade_ids"
                      />
                      <label class="form-check-label" :for="`fgr-${s.id}`">
                        {{ s.nama }}
                      </label>
                    </div>
                  </div>
                </div>

                <!-- Series -->
                <div class="mb-3">
                  <label class="form-label fw-semibold">Series</label>
                  <div class="border rounded p-2" style="max-height: 200px; overflow-y: auto">
                    <div class="form-check" v-for="s in seriesList" :key="s.id">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        :id="`fser-${s.id}`"
                        :value="s.id"
                        v-model="filter.series_ids"
                      />
                      <label class="form-check-label" :for="`fser-${s.id}`">
                        {{ s.nama }}
                      </label>
                    </div>
                  </div>
                </div>

                <!-- Status (single select) -->
                <div class="form-floating mb-3">
                  <select class="form-select" v-model="filter.status" id="filterStatus">
                    <option :value="1">Aktif</option>
                    <option :value="0">Tidak Aktif</option>
                  </select>
                  <label for="filterStatus">Status</label>
                </div>
              </div>
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
import Navbar from "@/components/Navbar.vue";
import axios from "axios";
import { Modal } from "bootstrap";
import $ from "jquery";
import "datatables.net";
import "datatables.net-responsive";
import Cleave from "vue-cleave-component";

export default {
  name: "BarangPage",

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
      isEditMode: false,
      searchText: "",

      // FILTER: sudah multi-select (array)
      filter: {
        nama: "",
        kode: "",
        kategori_ids: [],
        availability_ids: [],
        brand_ids: [],
        satuan_ids: [],
        grade_ids: [],
        series_ids: [],
        status: 1,
      },

      form: {
        id: "",
        nama: "",
        kode: "",
        kategori_id: "",
        availability_id: "",
        brand_id: "",
        satuan_id: "",
        grade_id: "",
        series_id: "",
        valuta_id: "1",
        harga_retail: "",
        harga_grosir: "",
        harga_retail_konversi: "",
        harga_grosir_konversi: "",
        status: 1,
      },

      errors: {},
      kategoriList: [],
      availabilityList: [],
      brandList: [],
      satuanList: [],
      gradeList: [],
      seriesList: [],
      valutaList: [],

      dtEditClickHandler: null,

      // Cleave untuk harga (format Indonesia, 2 desimal)
      cleaveHarga: {
        numeral: true,
        numeralThousandsGroupStyle: "thousand",
        numeralDecimalMark: ",",
        delimiter: ".",
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

    this.loadKategoriList();
    this.loadAvailabilityList();
    this.loadBrandList();
    this.loadSatuanList();
    this.loadGradeList();
    this.loadSeriesList();
    this.loadValutaList();
    this.initDataTable();

    this.dtEditClickHandler = (e) => {
      const id = $(e.currentTarget).data("id");
      if (id) this.openEditModal(id);
    };
    $("#tableMain").on("click", ".btn-edit", this.dtEditClickHandler);
  },

  beforeUnmount() {
    if (this.dtEditClickHandler) {
      $("#tableMain").off("click", ".btn-edit", this.dtEditClickHandler);
      this.dtEditClickHandler = null;
    }
    if ($.fn.dataTable && $.fn.dataTable.isDataTable("#tableMain")) {
      try {
        $("#tableMain").DataTable().destroy(true);
      } catch (e) {
        // ignore
      }
    }
  },

  methods: {
    /* Modal utils */
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

    /* Formatter untuk konversi (2 digit, readonly) */
    formatHargaDisplay(val) {
      if (val === null || val === undefined || val === "") return "";
      const s = String(val).trim();
      // support "12.345,67", "12345,67", "12345.67"
      const normalized = s.replace(/\./g, "").replace(",", ".");
      const num = Number(normalized);
      if (Number.isNaN(num)) return s;
      return new Intl.NumberFormat("id-ID", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(num);
    },

    /* Loader lists */
    async loadValutaList() {
      try {
        const url = `${this.baseUrl}/master/valuta_combo`;
        const res = await axios.get(url, this.tokenHeaders);
        this.valutaList = res.data || [];
      } catch (e) {
        console.error("loadValutaList", e);
      }
    },

    async loadKategoriList() {
      try {
        const url = `${this.baseUrl}/lampiran/kategori_barang_combo`;
        const res = await axios.get(url, this.tokenHeaders);
        this.kategoriList = res.data || [];
      } catch (e) {
        console.error("loadKategoriList", e);
      }
    },
    async loadAvailabilityList() {
      try {
        const url = `${this.baseUrl}/lampiran/availability_barang_combo`;
        const res = await axios.get(url, this.tokenHeaders);
        this.availabilityList = res.data || [];
      } catch (e) {
        console.error("loadAvailabilityList", e);
      }
    },
    async loadBrandList() {
      try {
        const url = `${this.baseUrl}/lampiran/brand_barang_combo`;
        const res = await axios.get(url, this.tokenHeaders);
        this.brandList = res.data || [];
      } catch (e) {
        console.error("loadBrandList", e);
      }
    },
    async loadSatuanList() {
      try {
        const url = `${this.baseUrl}/lampiran/satuan_barang_combo`;
        const res = await axios.get(url, this.tokenHeaders);
        this.satuanList = res.data || [];
      } catch (e) {
        console.error("loadSatuanList", e);
      }
    },
    async loadGradeList() {
      try {
        const url = `${this.baseUrl}/lampiran/grade_barang_combo`;
        const res = await axios.get(url, this.tokenHeaders);
        this.gradeList = res.data || [];
      } catch (e) {
        console.error("loadGradeList", e);
      }
    },
    async loadSeriesList() {
      try {
        const url = `${this.baseUrl}/lampiran/series_barang_combo`;
        const res = await axios.get(url, this.tokenHeaders);
        this.seriesList = res.data || [];
      } catch (e) {
        console.error("loadSeriesList", e);
      }
    },

    /* Datatable */
    doSearch() {
      if (this.table) this.table.ajax.reload();
    },

    initDataTable() {
      const url = `${this.baseUrl}/master/barang`;

      this.table = $("#tableMain").DataTable({
        dom: 't<"d-flex justify-content-between align-items-center mt-3"ip>',
        processing: true,
        serverSide: true,
        responsive: true,
        pageLength: 25,
        ajax: {
          url,
          type: "POST",
          headers: {
            ...this.tokenList,
            "Content-Type": "application/json",
          },
          data: (d) => {
            return JSON.stringify({
              ...d,
              ...this.filter,
              searchText: this.searchText,
            });
          },
        },
        columns: [
          { data: "id", visible: false },
          { data: "nama" },
          {
            data: "kode",
            className: "text-center",
            width: "200px",
          },
          { data: "kategori_nama" },
          { data: "availability_nama" },
          { data: "brand_nama" },
          { data: "satuan_nama" },
          { data: "grade_nama" },
          { data: "series_nama" },
          { data: "valuta_nama" },
          {
            data: "status",
            className: "text-center",
            render: (d) => (d == 1 ? "Aktif" : "Tidak Aktif"),
          },
          {
            data: null,
            className: "text-center",
            orderable: false,
            render: (row) => `
              <button class="btn btn-sm btn-warning btn-edit" data-id="${row.id}">
                <i class="bi bi-pencil-square me-1"></i>Edit
              </button>
            `,
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

    /* Modal actions */
    openAddModal() {
      this.isEditMode = false;
      this.resetForm();
      this.showFormModal();
    },

    async openEditModal(id) {
      this.isEditMode = true;
      this.errors = {};

      const url = `${this.baseUrl}/master/barang_show/${id}`;
      try {
        const res = await axios.get(url, this.tokenHeaders);
        const d = res.data || {};

        this.form = {
          id,
          nama: d.nama ?? "",
          kode: d.kode ?? "",
          kategori_id: d.kategori_id ?? "",
          availability_id: d.availability_id ?? "",
          brand_id: d.brand_id ?? "",
          satuan_id: d.satuan_id ?? "",
          grade_id: d.grade_id ?? "",
          series_id: d.series_id ?? "",
          valuta_id: d.valuta_id ?? "1",
          harga_retail: d.harga_retail ?? "",
          harga_grosir: d.harga_grosir ?? "",
          harga_retail_konversi: d.harga_retail_konversi ?? "",
          harga_grosir_konversi: d.harga_grosir_konversi ?? "",
          status: typeof d.status !== "undefined" ? d.status : 1,
        };

        this.showFormModal();
      } catch (e) {
        console.error("openEditModal", e);
        alert("Gagal mengambil data. Silakan coba lagi.");
      }
    },

    async submitForm() {
      this.errors = {};
      const url = `${this.baseUrl}/master/barang_add`;

      const payload = {
        ...this.form,
        by: localStorage.getItem("user_nama"),
      };

      try {
        await axios.post(url, payload, this.tokenHeaders);
        this.hideFormModal();
        if (this.table) this.table.ajax.reload(null, false);
      } catch (e) {
        if (e.response && e.response.status === 400) {
          this.errors = e.response.data || {};
        } else {
          console.error("submitForm", e);
          alert("Terjadi kesalahan. Coba lagi nanti.");
        }
      }
    },

    resetForm() {
      this.form = {
        id: "",
        nama: "",
        kode: "",
        kategori_id: "",
        availability_id: "",
        brand_id: "",
        satuan_id: "",
        grade_id: "",
        series_id: "",
        valuta_id: "1",
        harga_retail: "",
        harga_grosir: "",
        harga_retail_konversi: "",
        harga_grosir_konversi: "",
        status: 1,
      };
      this.errors = {};
    },

    resetFilter() {
      this.filter = {
        nama: "",
        kode: "",
        kategori_ids: [],
        availability_ids: [],
        brand_ids: [],
        satuan_ids: [],
        grade_ids: [],
        series_ids: [],
        status: 1,
      };
      if (this.table) this.table.ajax.reload();
    },
  },
};
</script>

<style scoped src="@/apps/master/barang.css"></style>
