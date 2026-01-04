<template>
  <div class="container-fluid" v-cloak>
    <!-- Judul dan Breadcrumb -->
    <div class="mb-3">
      <h3 class="mb-1">
        <i class="bi bi-book"></i>
        Daftar Lapangan
      </h3>

      <nav aria-label="breadcrumb">
        <ol class="breadcrumb mb-0 small">
          <li class="breadcrumb-item"><a href="#">Home</a></li>
          <li class="breadcrumb-item"><a href="#">Master</a></li>
          <li class="breadcrumb-item active" aria-current="page">Lapangan</li>
        </ol>
      </nav>
    </div>

    <!-- Toolbar -->
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
      <div class="d-flex gap-2">
        <button class="btn btn-primary shadow-sm" @click="openTambah">
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

    <!-- DataTable -->
    <div class="table-wrap rounded-3 border bg-white shadow-sm">
      <div class="table-responsive">
        <table
          id="tableMain"
          class="table table-hover align-middle mb-0 display nowrap"
          style="width: 100%"
        >
          <thead class="table-light sticky-thead">
            <tr>
              <th style="width: 1%"></th>
              <th>Nama</th>
              <th>Court Image</th>
              <th class="text-center" style="width: 140px">Urutan</th>
              <th class="text-center" style="width: 140px">Status</th>
              <th class="text-center" style="width: 260px">Aksi</th>
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
        <form @submit.prevent="submitTambah" class="modal-content" autocomplete="off">
          <div class="modal-header">
            <h5 class="modal-title"><i class="bi bi-plus-circle me-2"></i>Tambah Lapangan</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>

          <div class="modal-body">
            <div class="form-floating mb-3">
              <input
                type="text"
                v-model="form.nama"
                id="nama"
                class="form-control"
                :class="{ 'is-invalid': errors.nama }"
                placeholder="Nama"
              />
              <label for="nama" class="form-label">Nama</label>
              <div class="invalid-feedback" v-if="errors.nama">{{ errors.nama[0] }}</div>
            </div>

            <div class="form-floating mb-3">
              <input
                type="text"
                v-model="form.court_map_title"
                id="court_map_title"
                class="form-control"
                :class="{ 'is-invalid': errors.court_map_title }"
                placeholder="Court Map Title"
              />
              <label for="court_map_title" class="form-label">Court Map Title</label>
              <div class="invalid-feedback" v-if="errors.court_map_title">
                {{ errors.court_map_title[0] }}
              </div>
            </div>

            <div class="form-floating mb-3">
              <input
                type="text"
                v-model="form.court_image"
                id="court_image"
                class="form-control"
                :class="{ 'is-invalid': errors.court_image }"
                placeholder="Court Image"
              />
              <label for="court_image" class="form-label">Court Image</label>
              <div class="invalid-feedback" v-if="errors.court_image">
                {{ errors.court_image[0] }}
              </div>
            </div>

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

            <div class="form-floating mb-3">
              <cleave
                v-model="form.harga_regular"
                :options="cleaveNumberOpts"
                id="harga_regular"
                class="form-control"
                :class="{ 'is-invalid': errors.harga_regular }"
                inputmode="numeric"
                placeholder="Harga Regular"
              />
              <label for="harga_regular" class="form-label">Harga Regular</label>
              <div class="invalid-feedback" v-if="errors.harga_regular">
                {{ errors.harga_regular[0] }}
              </div>
            </div>

            <div class="form-floating mb-3">
              <cleave
                v-model="form.harga_member"
                :options="cleaveNumberOpts"
                id="harga_member"
                class="form-control"
                :class="{ 'is-invalid': errors.harga_member }"
                inputmode="numeric"
                placeholder="Harga Member"
              />
              <label for="harga_member" class="form-label">Harga Member</label>
              <div class="invalid-feedback" v-if="errors.harga_member">
                {{ errors.harga_member[0] }}
              </div>
            </div>

            <div class="form-floating mb-3">
              <select class="form-select" v-model="form.olahraga_id">
                <option value="">Pilih Olahraga</option>
                <option v-for="s in olahragaList" :key="s.id" :value="s.id">{{ s.nama }}</option>
              </select>
              <label class="form-label">Olahraga</label>
            </div>

            <div class="form-floating">
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
                v-model="filter.nama"
                id="filterNama"
                class="form-control"
                placeholder="Nama"
              />
              <label for="filterNama" class="form-label">Nama</label>
            </div>

            <div class="form-floating mb-3">
              <select class="form-select" v-model="filter.olahraga_id">
                <option value="">Pilih Olahraga</option>
                <option v-for="s in olahragaList" :key="s.id" :value="s.id">{{ s.nama }}</option>
              </select>
              <label class="form-label">Olahraga</label>
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
        <form @submit.prevent="submitEdit" class="modal-content" autocomplete="off">
          <div class="modal-header">
            <h5 class="modal-title"><i class="bi bi-pencil-square me-2"></i>Edit Lapangan</h5>
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
              />
              <label for="editNama" class="form-label">Nama</label>
              <div class="invalid-feedback" v-if="errors.nama">{{ errors.nama[0] }}</div>
            </div>

            <div class="form-floating mb-3">
              <input
                type="text"
                v-model="form.court_map_title"
                id="editCourtMapTitle"
                class="form-control"
                :class="{ 'is-invalid': errors.court_map_title }"
                placeholder="Court Map Title"
              />
              <label for="editCourtMapTitle" class="form-label">Court Map Title</label>
              <div class="invalid-feedback" v-if="errors.court_map_title">
                {{ errors.court_map_title[0] }}
              </div>
            </div>

            <div class="form-floating mb-3">
              <input
                type="text"
                v-model="form.court_image"
                id="editCourtImage"
                class="form-control"
                :class="{ 'is-invalid': errors.court_image }"
                placeholder="Court Image"
              />
              <label for="editCourtImage" class="form-label">Court Image</label>
              <div class="invalid-feedback" v-if="errors.court_image">
                {{ errors.court_image[0] }}
              </div>
            </div>

            <div class="form-floating mb-3">
              <cleave
                v-model="form.urutan"
                :options="cleaveNumberOpts"
                id="editUrutan"
                class="form-control"
                :class="{ 'is-invalid': errors.urutan }"
                inputmode="numeric"
                placeholder="Urutan"
              />
              <label for="editUrutan" class="form-label">Urutan</label>
              <div class="invalid-feedback" v-if="errors.urutan">{{ errors.urutan[0] }}</div>
            </div>

            <div class="form-floating mb-3">
              <cleave
                v-model="form.harga_regular"
                :options="cleaveNumberOpts"
                id="editHargaRegular"
                class="form-control"
                :class="{ 'is-invalid': errors.harga_regular }"
                inputmode="numeric"
                placeholder="Harga Regular"
              />
              <label for="editHargaRegular" class="form-label">Harga Regular</label>
              <div class="invalid-feedback" v-if="errors.harga_regular">
                {{ errors.harga_regular[0] }}
              </div>
            </div>

            <div class="form-floating mb-3">
              <cleave
                v-model="form.harga_member"
                :options="cleaveNumberOpts"
                id="editHargaMember"
                class="form-control"
                :class="{ 'is-invalid': errors.harga_member }"
                inputmode="numeric"
                placeholder="Harga Member"
              />
              <label for="editHargaMember" class="form-label">Harga Member</label>
              <div class="invalid-feedback" v-if="errors.harga_member">
                {{ errors.harga_member[0] }}
              </div>
            </div>

            <div class="form-floating mb-3">
              <select class="form-select" v-model="form.olahraga_id">
                <option value="">Pilih Olahraga</option>
                <option v-for="s in olahragaList" :key="s.id" :value="s.id">{{ s.nama }}</option>
              </select>
              <label class="form-label">Olahraga</label>
            </div>

            <div class="form-floating">
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

    <!-- Modal Hari -->
    <div
      class="modal fade"
      id="hariModal"
      tabindex="-1"
      aria-labelledby="hariModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <form @submit.prevent="submitHari" class="modal-content" autocomplete="off">
          <div class="modal-header">
            <h5 class="modal-title"><i class="bi bi-award me-2"></i>Harga Khusus</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>

          <div class="modal-body">
            <div class="form-floating mb-3">
              <input
                type="text"
                v-model="form.nama"
                id="editNamaHari"
                class="form-control"
                :class="{ 'is-invalid': errors.nama }"
                readonly
              />
              <label for="editNamaHari" class="form-label">Nama</label>
            </div>

            <div class="row">
              <div class="col-md-6">
                <div class="form-floating mb-3">
                  <cleave
                    v-model="form.harga_regular"
                    :options="cleaveNumberOpts"
                    id="harga_regular_read"
                    class="form-control"
                    readonly
                  />
                  <label for="harga_regular_read" class="form-label">Harga Regular</label>
                </div>
              </div>

              <div class="col-md-6">
                <div class="form-floating mb-3">
                  <cleave
                    v-model="form.harga_member"
                    :options="cleaveNumberOpts"
                    id="harga_member_read"
                    class="form-control"
                    readonly
                  />
                  <label for="harga_member_read" class="form-label">Harga Member</label>
                </div>
              </div>
            </div>

            <div class="row g-2 text-muted small mb-1">
              <div class="col-4">Hari</div>
              <div class="col-8">Harga</div>
            </div>

            <div class="mb-2" v-for="(h, idx) in hariList" :key="h.kode || h.id || idx">
              <div class="row g-2 align-items-center">
                <div class="col-4">
                  <input
                    type="text"
                    class="form-control-plaintext"
                    :value="h.nama_hari || h.hari || h.nama"
                    readonly
                  />
                </div>

                <div class="col-8">
                  <div class="input-group">
                    <span class="input-group-text">Rp</span>

                    <cleave
                      v-model="h.harga"
                      :options="cleaveNumberOpts"
                      class="form-control"
                      inputmode="numeric"
                      placeholder="0"
                    />

                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      @click="openSesiModal(h, idx)"
                      title="Atur sesi (modal)"
                    >
                      <i class="bi bi-clock"></i>
                      <span class="d-none d-sm-inline ms-1">Sesi</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <span class="text-warning"
              ><i>* harga perhari ini hanya berlaku untuk pengunjung regular</i></span
            >
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-light border" data-bs-dismiss="modal">
              Batal
            </button>
            <button type="submit" class="btn btn-primary">Update</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Sesi -->
    <div
      class="modal fade"
      id="sesiModal"
      tabindex="-1"
      aria-labelledby="sesiModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="sesiModalLabel">
              <i class="bi bi-clock me-2"></i> Atur Sesi — {{ sesiHariNama }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>

          <div class="modal-body">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <strong class="small">Daftar Sesi</strong>
              <button
                type="button"
                class="btn btn-sm btn-outline-primary"
                @click="addSesiRowInModal"
              >
                <i class="bi bi-plus-circle me-1"></i>Tambah
              </button>
            </div>

            <div v-if="sesiList.length === 0" class="text-muted small mb-2">
              Belum ada sesi. Klik <b>Tambah</b>.
            </div>

            <div
              class="row g-2 align-items-end mb-2"
              v-for="(s, sidx) in sesiList"
              :key="s.id || sidx"
            >
              <div class="col-12 col-md-5">
                <label class="form-label small mb-1">Pilih</label>
                <select class="form-select form-select-sm" v-model="s.sesi_id">
                  <option :value="null">-- pilih --</option>
                  <option v-for="opt in sesiCombo" :key="opt.id" :value="opt.id">
                    {{ opt.nama }}
                  </option>
                </select>
              </div>

              <div class="col-12 col-md-5">
                <label class="form-label small mb-1">Harga</label>
                <div class="input-group input-group-sm">
                  <span class="input-group-text">Rp</span>
                  <cleave
                    v-model="s.harga"
                    :options="cleaveNumberOpts"
                    class="form-control"
                    inputmode="numeric"
                  />
                </div>
              </div>

              <div class="col-12 col-md-2 d-grid">
                <button
                  type="button"
                  class="btn btn-sm btn-outline-danger"
                  @click="removeSesiRowInModal(sidx)"
                >
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-light border" data-bs-dismiss="modal">
              Batal
            </button>
            <button type="button" class="btn btn-primary" @click="saveSesiModal">Update</button>
          </div>
        </div>
      </div>
    </div>
    <!-- /Modal Sesi -->
  </div>
</template>

<script>
import { nextTick } from "vue";
import $ from "jquery";
import "datatables.net";
import "datatables.net-responsive";
import axios from "axios";

/** helper angka dari Cleave ke float murni */
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
  name: "LapanganList",

  data() {
    return {
      appsUrl: import.meta.env.VITE_API_APPS,

      table: null,

      filter: {
        nama: "",
        olahraga_id: "",
        status: 1,
      },

      form: {
        id: "",
        nama: "",
        court_map_title: "",
        court_image: "",
        harga_regular: "",
        harga_member: "",
        urutan: 1,
        olahraga_id: "",
        status: 1,
      },

      cleaveNumberOpts: {
        numeral: true,
        numeralDecimalScale: 2,
        numeralPositiveOnly: true,
        numeralThousandsGroupStyle: "thousand",
        delimiter: ".",
        numeralDecimalMark: ",",
      },

      errors: {},
      olahragaList: [],
      hariList: [],

      // sesi
      sesiCombo: [],
      sesiHariIndex: -1,
      sesiHariNama: "",
      sesiList: [],

      // modal elements & instances
      tambahModalEl: null,
      tambahModalInstance: null,
      editModalEl: null,
      editModalInstance: null,
      hariModalEl: null,
      hariModalInstance: null,
      sesiModalEl: null,
      sesiModalInstance: null,
      filterModalEl: null,
      filterModalInstance: null,
    };
  },

  methods: {
    /* ---------- API loaders ---------- */
    loadOlahragaList() {
      const url = this.appsUrl + "/master/olahraga_combo";
      const token = { headers: { Token: "Bearer " + localStorage.getItem("actasysToken") } };

      axios
        .get(url, token)
        .then((res) => {
          this.olahragaList = res.data || [];
        })
        .catch(() => {
          this.olahragaList = [];
        });
    },

    loadSesiCombo() {
      const url = this.appsUrl + "/master/sesi_combo";
      const token = { headers: { Token: "Bearer " + localStorage.getItem("actasysToken") } };

      axios
        .get(url, token)
        .then((res) => {
          this.sesiCombo = Array.isArray(res.data) ? res.data : [];
        })
        .catch(() => {
          this.sesiCombo = [];
        });
    },

    /* ---------- DataTable ---------- */
    initDataTable() {
      const vm = this;
      const url = this.appsUrl + "/master/lapangan";
      const token = { Token: "Bearer " + localStorage.getItem("actasysToken") };

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
          headers: token,
          data(d) {
            d.nama = vm.filter.nama;
            d.status = vm.filter.status;
            d.olahraga_id = vm.filter.olahraga_id;
          },
        },
        columns: [
          { data: "urutan", visible: false },
          { data: "nama" },
          { data: "court_image" },
          { data: "urutan", className: "text-center", width: "150px" },
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
            width: "250px",
            orderable: false,
            render(row) {
              let btn = `<button class="btn btn-sm btn-warning btn-edit me-1" data-id="${row.id}"><i class="bi bi-pencil-square"></i> Edit</button>`;
              btn += `<button class="btn btn-sm btn-primary btn-hari" data-id="${row.id}"> <i class="bi bi-award"></i> Harga Khusus</button>`;
              return btn;
            },
          },
        ],
        language: {
          paginate: { previous: "&laquo;", next: "&raquo;" },
          info: "Menampilkan _START_ - _END_ dari _TOTAL_ data",
        },
      });
    },

    /* ---------- Filters ---------- */
    applyFilter() {
      if (this.table) this.table.ajax.reload();
    },
    resetFilter() {
      this.filter.nama = "";
      this.filter.olahraga_id = "";
      this.filter.status = 1;
      if (this.table) this.table.ajax.reload();
    },

    /* ---------- Form reset ---------- */
    resetForm() {
      this.form.id = "";
      this.form.nama = "";
      this.form.court_map_title = "";
      this.form.court_image = "";
      this.form.harga_regular = "";
      this.form.harga_member = "";
      this.form.urutan = 1;
      this.form.olahraga_id = "";
      this.form.status = 1;

      Object.keys(this.errors).forEach((k) => delete this.errors[k]);
      this.hariList = [];
      this.sesiHariIndex = -1;
      this.sesiHariNama = "";
      this.sesiList = [];
    },

    /* ---------- Tambah ---------- */
    openTambah() {
      this.resetForm();
      nextTick(() => {
        if (this.tambahModalInstance) this.tambahModalInstance.show();
      });
    },

    submitTambah() {
      Object.keys(this.errors).forEach((k) => delete this.errors[k]);

      const url = this.appsUrl + "/master/lapangan_add";

      const payload = {
        id: "",
        nama: this.form.nama,
        court_map_title: this.form.court_map_title,
        court_image: this.form.court_image,
        harga_regular: parseCleaveNumber(this.form.harga_regular),
        harga_member: parseCleaveNumber(this.form.harga_member),
        urutan: parseCleaveNumber(this.form.urutan),
        olahraga_id: this.form.olahraga_id,
        status: this.form.status,
        by: localStorage.getItem("user_nama"),
      };

      const token = { headers: { Token: "Bearer " + localStorage.getItem("actasysToken") } };

      axios
        .post(url, payload, token)
        .then(() => {
          if (this.tambahModalInstance) this.tambahModalInstance.hide();
          this.resetForm();
          if (this.table) this.table.ajax.reload();
        })
        .catch((err) => {
          if (err.response && err.response.status === 400) {
            Object.assign(this.errors, err.response.data || {});
          } else {
            alert("Terjadi kesalahan. Coba lagi nanti.");
          }
        });
    },

    /* ---------- Edit ---------- */
    openEditModal(id) {
      const url = this.appsUrl + `/master/lapangan_show/${id}`;
      const token = { headers: { Token: "Bearer " + localStorage.getItem("actasysToken") } };

      axios
        .get(url, token)
        .then((res) => {
          const d = res.data || {};
          this.form.id = id;
          this.form.nama = d.nama ?? "";
          this.form.court_map_title = d.court_map_title ?? "";
          this.form.court_image = d.court_image ?? "";
          this.form.harga_regular = d.harga_regular ?? "";
          this.form.harga_member = d.harga_member ?? "";
          this.form.urutan = d.urutan ?? 1;
          this.form.olahraga_id = d.olahraga_id ?? "";
          this.form.status = d.status ?? 1;

          nextTick(() => {
            if (this.editModalInstance) this.editModalInstance.show();
          });
        })
        .catch(() => {
          alert("Gagal mengambil data. Silakan coba lagi.");
        });
    },

    submitEdit() {
      Object.keys(this.errors).forEach((k) => delete this.errors[k]);

      const url = this.appsUrl + "/master/lapangan_add";

      const payload = {
        id: this.form.id,
        nama: this.form.nama,
        court_map_title: this.form.court_map_title,
        court_image: this.form.court_image,
        harga_regular: parseCleaveNumber(this.form.harga_regular),
        harga_member: parseCleaveNumber(this.form.harga_member),
        urutan: parseCleaveNumber(this.form.urutan),
        olahraga_id: this.form.olahraga_id,
        status: this.form.status,
        by: localStorage.getItem("user_nama"),
      };

      const token = { headers: { Token: "Bearer " + localStorage.getItem("actasysToken") } };

      axios
        .post(url, payload, token)
        .then(() => {
          if (this.editModalInstance) this.editModalInstance.hide();
          this.resetForm();
          if (this.table) this.table.ajax.reload();
        })
        .catch((err) => {
          if (err.response && err.response.status === 400) {
            Object.assign(this.errors, err.response.data || {});
          } else {
            alert("Terjadi kesalahan. Coba lagi nanti.");
          }
        });
    },

    /* ---------- Hari modal ---------- */
    openHariModal(id) {
      const urlLap = this.appsUrl + `/master/lapangan_show/${id}`;
      const token = { headers: { Token: "Bearer " + localStorage.getItem("actasysToken") } };

      axios
        .get(urlLap, token)
        .then((res) => {
          const d = res.data || {};
          this.form.id = id;
          this.form.nama = d.nama ?? "";
          this.form.harga_regular = d.harga_regular ?? "";
          this.form.harga_member = d.harga_member ?? "";

          const urlHari = appsUrl + "/master/lapangan_show_hari/" + this.form.id;
          return axios.get(urlHari, token);
        })
        .then((r2) => {
          this.hariList = (r2.data || []).map((x) => ({
            ...x,
            sesi: Array.isArray(x.sesi) ? x.sesi : [],
            harga: x.harga ?? "",
          }));
          if (!this.sesiCombo.length) this.loadSesiCombo();
          nextTick(() => {
            if (this.hariModalInstance) this.hariModalInstance.show();
          });
        })
        .catch(() => {
          alert("Gagal mengambil data. Silakan coba lagi.");
        });
    },

    submitHari() {
      // normalisasi harga hari & validasi sesi (tanpa jam)
      for (const h of this.hariList) {
        h.harga = parseCleaveNumber(h.harga);
        if (!Array.isArray(h.sesi)) continue;

        for (const s of h.sesi) {
          if (!s.sesi_id) {
            alert(`Ada sesi yang belum dipilih pada hari "${h.nama_hari || h.hari || h.nama}".`);
            return;
          }
          if (s.harga !== "" && s.harga !== null && s.harga !== undefined) {
            s.harga = parseCleaveNumber(s.harga);
          }
          if (typeof s.nama === "string") s.nama = s.nama.trim();
        }
      }

      const url = this.appsUrl + "/master/lapangan_hari_save";
      const payload = { lapangan_id: this.form.id, hari_list: this.hariList };
      const token = { headers: { Token: "Bearer " + localStorage.getItem("actasysToken") } };

      axios
        .post(url, payload, token)
        .then(() => {
          if (this.hariModalInstance) this.hariModalInstance.hide();
          this.resetForm();
        })
        .catch(() => {
          alert("Terjadi kesalahan. Coba lagi nanti.");
        });
    },

    /* ---------- Sesi modal ---------- */
    openSesiModal(day, index) {
      this.sesiHariIndex = index;
      this.sesiHariNama = day.nama_hari || day.hari || day.nama || "Hari";

      if (!this.sesiCombo.length) this.loadSesiCombo();

      const appsUrl = import.meta.env.VITE_API_APPS;
      const urlSesi = `${appsUrl}/master/lapangan_show_sesi/${this.form.id}/${day.id}`;
      const token = { headers: { Token: "Bearer " + localStorage.getItem("actasysToken") } };

      axios
        .get(urlSesi, token)
        .then((r2) => {
          const rows = Array.isArray(r2.data) ? r2.data : [];
          this.sesiList = rows.map((x) => ({
            id: x.id ?? null,
            sesi_id: x.sesi_id ?? x.id ?? null,
            harga: x.harga ?? "",
          }));
          nextTick(() => {
            if (this.sesiModalInstance) this.sesiModalInstance.show();
          });
        })
        .catch(() => {
          alert("Gagal memuat daftar sesi. Silakan coba lagi.");
        });
    },

    addSesiRowInModal() {
      this.sesiList.push({ sesi_id: null, harga: "" });
    },
    removeSesiRowInModal(idx) {
      this.sesiList.splice(idx, 1);
    },

    saveSesiModal() {
      // validasi & normalisasi
      for (const s of this.sesiList) {
        if (!s.sesi_id) {
          alert("Ada baris sesi yang belum dipilih.");
          return;
        }
        if (s.harga !== "" && s.harga !== null && s.harga !== undefined) {
          s.harga = parseCleaveNumber(s.harga);
        }
        if (typeof s.nama === "string") s.nama = s.nama.trim();
      }

      if (this.sesiHariIndex >= 0 && this.sesiHariIndex < this.hariList.length) {
        const appsUrl = import.meta.env.VITE_API_APPS;
        const url = appsUrl + "/master/lapangan_sesi_save";
        const payload = {
          lapangan_id: this.form.id,
          hari_id: this.hariList[this.sesiHariIndex].id,
          sesi_list: this.sesiList,
        };
        const token = { headers: { Token: "Bearer " + localStorage.getItem("actasysToken") } };

        axios
          .post(url, payload, token)
          .then(() => {
            if (this.hariModalInstance) this.hariModalInstance.hide();
            if (this.sesiModalInstance) this.sesiModalInstance.hide();
            this.resetForm();
          })
          .catch(() => {
            alert("Terjadi kesalahan. Coba lagi nanti.");
          });
      }
    },
  },

  mounted() {
    this.loadOlahragaList();
    this.loadSesiCombo();
    this.initDataTable();

    // prepare modal instances
    if (typeof window !== "undefined" && window.bootstrap && window.bootstrap.Modal) {
      this.tambahModalEl = document.getElementById("tambahModal");
      this.editModalEl = document.getElementById("editModal");
      this.hariModalEl = document.getElementById("hariModal");
      this.sesiModalEl = document.getElementById("sesiModal");
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
          Object.keys(this.errors).forEach((k) => delete this.errors[k]);
          this.resetForm();
        });
      }

      if (this.hariModalEl) {
        this.hariModalInstance = window.bootstrap.Modal.getOrCreateInstance(this.hariModalEl);
        this.hariModalEl.addEventListener("hidden.bs.modal", () => {
          Object.keys(this.errors).forEach((k) => delete this.errors[k]);
        });
      }

      if (this.sesiModalEl) {
        this.sesiModalInstance = window.bootstrap.Modal.getOrCreateInstance(this.sesiModalEl);
        this.sesiModalEl.addEventListener("hidden.bs.modal", () => {
          this.sesiHariIndex = -1;
          this.sesiHariNama = "";
          this.sesiList = [];
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

    // DataTable delegated events (jQuery)
    const vm = this;
    $("#tableMain").on("click", ".btn-edit", (e) => {
      const id = $(e.currentTarget).data("id");
      vm.openEditModal(id);
    });

    $("#tableMain").on("click", ".btn-hari", (e) => {
      const id = $(e.currentTarget).data("id");
      vm.openHariModal(id);
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
    safeReplace(this.hariModalEl);
    safeReplace(this.sesiModalEl);
    safeReplace(this.filterModalEl);

    $("#tableMain").off("click", ".btn-edit");
    $("#tableMain").off("click", ".btn-hari");
  },
};
</script>

<style scoped src="@/apps/master/lapangan.css"></style>
