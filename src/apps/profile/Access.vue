<template>
  <div class="container-fluid">
    <Navbar />

    <!-- ================= JUDUL ================= -->
    <div class="mb-3 mt-3">
      <h3 class="mb-1">
        <i class="bi bi-buildings"></i>
        Access
      </h3>

      <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><a href="#">Home</a></li>
          <li class="breadcrumb-item"><a href="#">Profile</a></li>
          <li class="breadcrumb-item active">Access</li>
        </ol>
      </nav>
    </div>

    <!-- ================= TOOLBAR ================= -->
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
          class="form-control"
          v-model="searchText"
          placeholder="Cari nama…"
          @keyup.enter="doSearch"
        />
        <button class="btn btn-outline-secondary" @click="doSearch">
          <i class="bi bi-search"></i>
        </button>
      </div>
    </div>

    <!-- ================= DATATABLE ================= -->
    <div class="table-responsive">
      <table
        id="tblMain"
        class="table table-bordered table-hover display nowrap"
        style="width: 100%"
      >
        <thead class="table-light">
          <tr>
            <th>Nama</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>

    <!-- ================= MODAL ADD / EDIT ================= -->
    <div class="modal fade" id="tambahModal" tabindex="-1">
      <div class="modal-dialog">
        <form class="modal-content" @submit.prevent="submitForm">
          <div class="modal-header">
            <h5 class="modal-title">
              <i :class="isEditMode ? 'bi bi-pencil-square me-2' : 'bi bi-plus-circle me-2'"></i>
              {{ isEditMode ? "Edit Data" : "Tambah Data" }}
            </h5>
            <button class="btn-close" data-bs-dismiss="modal"></button>
          </div>

          <div class="modal-body">
            <div class="form-floating mb-3">
              <input
                id="nama"
                class="form-control"
                v-model="form.nama"
                :class="{ 'is-invalid': errors.nama }"
              />
              <label>Nama</label>
              <div class="invalid-feedback">{{ errors.nama?.[0] }}</div>
            </div>

            <div class="form-floating">
              <select class="form-select" v-model.number="form.status">
                <option :value="1">Aktif</option>
                <option :value="0">Tidak Aktif</option>
              </select>
              <label>Status</label>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
            <button class="btn btn-primary">Simpan</button>
          </div>
        </form>
      </div>
    </div>

    <!-- ================= MODAL FILTER ================= -->
    <div class="modal fade" id="filterModal" tabindex="-1">
      <div class="modal-dialog">
        <form class="modal-content" @submit.prevent="doSearch">
          <div class="modal-header">
            <h5 class="modal-title"><i class="bi bi-funnel me-1"></i> Filter Data</h5>
            <button class="btn-close" data-bs-dismiss="modal"></button>
          </div>

          <div class="modal-body">
            <div class="form-floating mb-3">
              <input class="form-control" v-model="filter.nama" />
              <label>Nama</label>
            </div>

            <div class="form-floating">
              <select class="form-select" v-model.number="filter.status">
                <option :value="1">Aktif</option>
                <option :value="0">Tidak Aktif</option>
              </select>
              <label>Status</label>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="resetFilter">Reset</button>
            <button class="btn btn-primary" data-bs-dismiss="modal">Terapkan</button>
          </div>
        </form>
      </div>
    </div>

    <!-- ================= MODAL OTORISASI ================= -->
    <div class="modal fade" id="otorisasiModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title"><i class="bi bi-diagram-2 me-1"></i> Otorisasi Akses</h5>
            <button class="btn-close" data-bs-dismiss="modal"></button>
          </div>

          <div class="modal-body">
            <div class="form-floating mb-3">
              <input class="form-control" v-model="otorisasi.access_nama" readonly />
              <label>Access</label>
            </div>

            <div class="row mb-3">
              <div class="col-6">
                <div class="form-floating">
                  <select class="form-select" v-model="otorisasi.software_id" @change="loadTabList">
                    <option value="">Pilih Software</option>
                    <option v-for="s in softwareList" :key="s.id" :value="s.id">
                      {{ s.nama }}
                    </option>
                  </select>
                  <label>Software</label>
                </div>
              </div>

              <div class="col-6">
                <div class="form-floating">
                  <select
                    class="form-select"
                    v-model="otorisasi.tab_id"
                    @change="fetchOtorisasi"
                    :disabled="!tabList.length"
                  >
                    <option value="">Pilih Tab</option>
                    <option v-for="t in tabList" :key="t.id" :value="t.id">
                      {{ t.nama }}
                    </option>
                  </select>
                  <label>Tab</label>
                </div>
              </div>
            </div>

            <table class="table table-bordered table-hover">
              <thead class="table-light">
                <tr>
                  <th width="80" class="text-center">Aktif</th>
                  <th>Module</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="m in otorisasi.list_otorisasi" :key="m.id">
                  <td class="text-center">
                    <input
                      type="checkbox"
                      class="form-check-input"
                      v-model="m.aktif"
                      @change="handleToggleOtorisasi(m)"
                    />
                  </td>
                  <td>{{ m.nama }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
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
  name: "AccessPage",
  components: { Navbar },

  data() {
    return {
      actasysUrl: import.meta.env.VITE_API_ACTASYS,

      token: "",
      tokenHeaders: {},
      tokenList: {},

      table: null,
      searchText: "",

      isEditMode: false,

      filter: {
        nama: "",
        status: 1,
      },

      form: {
        id: "",
        nama: "",
        status: 1,
      },

      otorisasi: {
        access_id: "",
        access_nama: "",
        company_nama: "",
        software_id: "",
        tab_id: "",
        list_otorisasi: [],
      },

      softwareList: [],
      tabList: [],
      errors: {},
    };
  },

  computed: {
    auth() {
      return useAuthStore();
    },
  },

  mounted() {
    this.token = this.auth.login?.token;
    this.tokenHeaders = { headers: { Token: "Bearer " + this.token } };
    this.tokenList = { Token: "Bearer " + this.token };

    this.loadSoftwareList();
    this.initDataTable();
  },

  methods: {
    /* ================= DATATABLE ================= */
    initDataTable() {
      this.table = $("#tblMain").DataTable({
        dom: 't<"d-flex justify-content-between align-items-center mt-3"ip>',
        processing: true,
        serverSide: true,
        responsive: true,
        pageLength: 25,

        ajax: {
          url: `${this.actasysUrl}/profile/access`,
          type: "GET",
          headers: this.tokenList,
          data: (d) => {
            d.searchText = this.searchText;
            d.nama = this.filter.nama;
            d.status = this.filter.status;
          },
        },

        columns: [
          { data: "nama" },
          {
            data: "status",
            className: "text-center",
            width: "200px",
            render: (d) => (d == 1 ? "Aktif" : "Tidak Aktif"),
          },
          {
            data: null,
            orderable: false,
            className: "text-center",
            width: "250px",
            render: (row) => `
              <button class="btn btn-sm btn-warning btn-edit" data-id="${row.id}">
                <i class="bi bi-pencil-square me-1"></i>Edit
              </button>
              <button class="btn btn-sm btn-danger btn-otorisasi ms-1" data-id="${row.id}">
                <i class="bi bi-diagram-2 me-1"></i>Otorisasi
              </button>
            `,
          },
        ],
      });

      $("#tblMain").on("click", ".btn-edit", (e) => {
        this.openEditModal($(e.currentTarget).data("id"));
      });

      $("#tblMain").on("click", ".btn-otorisasi", (e) => {
        this.openOtorisasiModal($(e.currentTarget).data("id"));
      });
    },

    doSearch() {
      this.table.ajax.reload();
    },

    resetFilter() {
      this.filter = { nama: "", status: 1 };
      this.table.ajax.reload();
    },

    /* ================= CRUD ================= */
    openAddModal() {
      this.resetForm();
      this.isEditMode = false;
      new Modal(document.getElementById("tambahModal")).show();
    },

    async openEditModal(id) {
      this.isEditMode = true;
      const res = await axios.get(
        `${this.actasysUrl}/profile/access_show/${id}`,
        this.tokenHeaders
      );

      const d = res.data;
      this.form = { id, nama: d.nama, status: d.status };

      new Modal(document.getElementById("tambahModal")).show();
    },

    async submitForm() {
      await axios.post(
        `${this.actasysUrl}/profile/access_add`,
        {
          id: this.isEditMode ? this.form.id : "",
          nama: this.form.nama,
          status: this.form.status,
        },
        this.tokenHeaders
      );

      Modal.getInstance(document.getElementById("tambahModal")).hide();
      this.table.ajax.reload();
    },

    resetForm() {
      this.form = { id: "", nama: "", status: 1 };
      this.errors = {};
    },

    /* ================= OTORISASI ================= */
    async openOtorisasiModal(id) {
      const res = await axios.get(
        `${this.actasysUrl}/profile/access_show/${id}`,
        this.tokenHeaders
      );

      this.otorisasi = {
        access_id: id,
        access_nama: res.data.nama,
        software_id: "",
        tab_id: "",
        list_otorisasi: [],
      };

      this.tabList = [];
      new Modal(document.getElementById("otorisasiModal")).show();
    },

    async fetchOtorisasi() {
      const res = await axios.get(
        `${this.actasysUrl}/profile/otorisasi_show/${this.otorisasi.access_id}/${this.otorisasi.tab_id}`,
        this.tokenHeaders
      );

      this.otorisasi.list_otorisasi = res.data.map((i) => ({
        ...i,
        aktif: i.aktif == 1,
      }));
    },

    async handleToggleOtorisasi(m) {
      const url = m.aktif ? "otorisasi_save" : "otorisasi_delete";
      await axios.post(
        `${this.actasysUrl}/profile/${url}`,
        { access_id: this.otorisasi.access_id, module_id: m.id },
        this.tokenHeaders
      );
    },

    /* ================= MASTER DATA ================= */
    async loadSoftwareList() {
      const res = await axios.get(`${this.actasysUrl}/system/software_combo`, this.tokenHeaders);
      this.softwareList = res.data || [];
    },

    async loadTabList() {
      this.tabList = [];
      this.otorisasi.tab_id = "";

      const res = await axios.get(
        `${this.actasysUrl}/system/tab_combo/${this.otorisasi.software_id}`,
        this.tokenHeaders
      );
      this.tabList = res.data || [];
    },
  },
};
</script>

<style scoped src="@/apps/profile/Access.css"></style>
