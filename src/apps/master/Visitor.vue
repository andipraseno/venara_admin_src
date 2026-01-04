<template>
  <div class="container-fluid" v-cloak>
    <!-- Judul dan Breadcrumb -->
    <div class="mb-3">
      <h3 class="mb-1">
        <i class="bi bi-book"></i>
        Daftar Visitor
      </h3>

      <nav aria-label="breadcrumb">
        <ol class="breadcrumb mb-0">
          <li class="breadcrumb-item"><a href="#">Home</a></li>
          <li class="breadcrumb-item"><a href="#">Master</a></li>
          <li class="breadcrumb-item active" aria-current="page">Visitor</li>
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

    <!-- Table Card -->
    <div class="card soft-card">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table
            id="tableMain"
            class="table table-hover table-striped align-middle mb-0 display nowrap"
            style="width: 100%"
          >
            <thead class="table-light">
              <tr>
                <th class="d-none"></th>
                <th>Nama</th>
                <th class="text-center">Handphone</th>
                <th class="text-center">Email</th>
                <th class="text-center">Group</th>
                <th class="text-center">Status</th>
                <th class="text-center" style="width: 250px"></th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
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
              <label for="filterNama">Nama</label>
            </div>

            <div class="form-floating mb-3">
              <input
                type="text"
                v-model.trim="filter.handphone"
                id="filterHandphone"
                class="form-control"
                placeholder="Handphone"
              />
              <label for="filterHandphone">Handphone</label>
            </div>

            <div class="form-floating mb-3">
              <input
                type="text"
                v-model.trim="filter.email"
                id="filterEmail"
                class="form-control"
                placeholder="Email"
              />
              <label for="filterEmail">Email</label>
            </div>

            <div class="form-floating mb-3">
              <select class="form-select" v-model="filter.group_id" id="filterGroup">
                <option value="">Semua Group</option>
                <option v-for="s in groupList" :key="s.id" :value="s.id">{{ s.nama }}</option>
              </select>
              <label for="filterGroup">Group</label>
            </div>

            <div class="form-floating mb-3">
              <select v-model="filter.status" id="filterStatus" class="form-select">
                <option :value="1">Aktif</option>
                <option :value="0">Tidak Aktif</option>
              </select>
              <label for="filterStatus">Status</label>
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
            <h5 class="modal-title"><i class="bi bi-plus-circle me-2"></i>Tambah Visitor</h5>
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
                placeholder="Nama"
              />
              <label for="nama">Nama</label>
              <div class="invalid-feedback" v-if="errors.nama">{{ errors.nama[0] }}</div>
            </div>

            <div class="form-floating mb-3">
              <input
                type="text"
                v-model.trim="form.handphone"
                id="handphone"
                class="form-control"
                :class="{ 'is-invalid': errors.handphone }"
                placeholder="Handphone"
              />
              <label for="handphone">Handphone</label>
              <div class="invalid-feedback" v-if="errors.handphone">{{ errors.handphone[0] }}</div>
            </div>

            <div class="form-floating mb-3">
              <input
                type="text"
                v-model.trim="form.email"
                id="email"
                class="form-control"
                :class="{ 'is-invalid': errors.email }"
                placeholder="Email"
              />
              <label for="email">Email</label>
              <div class="invalid-feedback" v-if="errors.email">{{ errors.email[0] }}</div>
            </div>

            <div class="form-floating mb-3">
              <select class="form-select" v-model="form.group_id" id="group">
                <option value="">Pilih Group</option>
                <option v-for="s in groupList" :key="s.id" :value="s.id">{{ s.nama }}</option>
              </select>
              <label for="group">Group</label>
            </div>

            <div class="form-floating mb-3">
              <select v-model="form.status" id="status" class="form-select">
                <option :value="1">Aktif</option>
                <option :value="0">Tidak Aktif</option>
              </select>
              <label for="status">Status</label>
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
            <h5 class="modal-title"><i class="bi bi-pencil-square me-2"></i>Edit Visitor</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>

          <div class="modal-body">
            <div class="form-floating mb-3">
              <input type="text" v-model="form.id" id="editId" class="form-control" readonly />
              <label for="editId">Id</label>
            </div>

            <div class="form-floating mb-3">
              <input
                type="text"
                v-model.trim="form.nama"
                id="editNama"
                class="form-control"
                :class="{ 'is-invalid': errors.nama }"
                placeholder="Nama"
              />
              <label for="editNama">Nama</label>
              <div class="invalid-feedback" v-if="errors.nama">{{ errors.nama[0] }}</div>
            </div>

            <div class="form-floating mb-3">
              <input
                type="text"
                v-model.trim="form.handphone"
                id="editHandphone"
                class="form-control"
                :class="{ 'is-invalid': errors.handphone }"
                placeholder="Handphone"
              />
              <label for="editHandphone">Handphone</label>
              <div class="invalid-feedback" v-if="errors.handphone">{{ errors.handphone[0] }}</div>
            </div>

            <div class="form-floating mb-3">
              <input
                type="text"
                v-model.trim="form.email"
                id="editEmail"
                class="form-control"
                :class="{ 'is-invalid': errors.email }"
                placeholder="Email"
              />
              <label for="editEmail">Email</label>
              <div class="invalid-feedback" v-if="errors.email">{{ errors.email[0] }}</div>
            </div>

            <div class="form-floating mb-3">
              <select class="form-select" v-model="form.group_id" id="editGroup">
                <option value="">Pilih Group</option>
                <option v-for="s in groupList" :key="s.id" :value="s.id">{{ s.nama }}</option>
              </select>
              <label for="editGroup">Group</label>
            </div>

            <div class="form-floating mb-3">
              <select v-model="form.status" id="editStatus" class="form-select">
                <option :value="1">Aktif</option>
                <option :value="0">Tidak Aktif</option>
              </select>
              <label for="editStatus">Status</label>
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

    <!-- Modal Rekening -->
    <div
      class="modal fade"
      id="rekeningModal"
      tabindex="-1"
      aria-labelledby="rekeningModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <form @submit.prevent="submitRekening" class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title"><i class="bi bi-credit-card-2-front"></i> Rekening</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>

          <div class="modal-body">
            <div class="form-floating mb-3">
              <input type="text" v-model="form.id" id="rekeningId" class="form-control" readonly />
              <label for="rekeningId">Id</label>
            </div>

            <div class="form-floating mb-3">
              <input
                type="text"
                v-model="form.nama"
                id="rekeningNama"
                class="form-control"
                readonly
              />
              <label for="rekeningNama">Nama</label>
            </div>

            <div class="form-floating mb-3">
              <input
                type="text"
                v-model.trim="form.bank"
                id="rekeningBank"
                class="form-control"
                :class="{ 'is-invalid': errors.bank }"
                placeholder="Bank"
              />
              <label for="rekeningBank">Bank</label>
              <div class="invalid-feedback" v-if="errors.bank">{{ errors.bank[0] }}</div>
            </div>

            <div class="form-floating mb-3">
              <input
                type="text"
                v-model.trim="form.no_rekening"
                id="rekeningNoRekening"
                class="form-control"
                :class="{ 'is-invalid': errors.no_rekening }"
                placeholder="No. Rekening"
              />
              <label for="rekeningNoRekening">No. Rekening</label>
              <div class="invalid-feedback" v-if="errors.no_rekening">
                {{ errors.no_rekening[0] }}
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-light" data-bs-dismiss="modal">Batal</button>
            <button type="submit" class="btn btn-primary">Update</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from "vue";
import $ from "jquery";
import "datatables.net";
import "datatables.net-responsive";
import axios from "axios";

// ---------- state ----------
const table = ref(null);

const quickSearch = ref("");
let debounceTimer = null;

const submitting = ref(false);

const filter = reactive({
  nama: "",
  handphone: "",
  email: "",
  group_id: "",
  status: 1,
});

const form = reactive({
  id: "",
  nama: "",
  handphone: "",
  email: "",
  group_id: "",
  bank: "",
  no_rekening: "",
  status: 1,
});

const groupList = ref([]);
const errors = reactive({});

// modal instances
let tambahModalEl = null;
let tambahModalInstance = null;
let editModalEl = null;
let editModalInstance = null;
let filterModalEl = null;
let filterModalInstance = null;
let rekeningModalEl = null;
let rekeningModalInstance = null;

// ---------- helpers ----------
function safeAssign(obj, src = {}) {
  Object.keys(src).forEach((k) => {
    obj[k] = src[k];
  });
}

function resetForm() {
  form.id = "";
  form.nama = "";
  form.handphone = "";
  form.email = "";
  form.group_id = "";
  form.bank = "";
  form.no_rekening = "";
  form.status = 1;
  Object.keys(errors).forEach((k) => delete errors[k]);
}

// ---------- API loaders ----------
function loadGroupList() {
  const rootUrl = import.meta.env.VITE_API_APPS;
  const url = rootUrl + "/master/group_visitor_combo";
  const token = { headers: { Token: "Bearer " + localStorage.getItem("actasysToken") } };

  axios
    .get(url, token)
    .then((res) => {
      groupList.value = res.data || [];
    })
    .catch(() => {
      groupList.value = [];
      // silently fail or show toast
    });
}

// ---------- DataTable ----------
function initDataTable() {
  const vmFilter = filter;
  const rootUrl = import.meta.env.VITE_API_APPS;
  const url = rootUrl + "/master/visitor";
  const token = { Token: "Bearer " + localStorage.getItem("actasysToken") };

  table.value = $("#tableMain").DataTable({
    dom: 't<"d-flex justify-content-between align-items-center p-3"ip>',
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
        d.nama = quickSearch.value || vmFilter.nama;
        d.handphone = vmFilter.handphone;
        d.email = vmFilter.email;
        d.status = vmFilter.status;
        d.group_id = vmFilter.group_id;
      },
    },
    columns: [
      { data: "id", visible: false },
      { data: "nama", className: "fw-semibold" },
      { data: "handphone", className: "text-center" },
      { data: "email", className: "text-center" },
      { data: "group_nama", className: "text-center" },
      {
        data: "status",
        className: "text-center",
        width: "150px",
        render(data) {
          const ok = Number(data) === 1;
          const badge = ok ? "success" : "secondary";
          const text = ok ? "Aktif" : "Tidak Aktif";
          return `<span class="badge rounded-pill text-bg-${badge} px-3 py-2">${text}</span>`;
        },
      },
      {
        data: null,
        className: "text-center",
        orderable: false,
        width: "250px",
        render(data) {
          return `<div class="btn-group btn-group-sm" role="group">
                    <button class="btn btn-warning btn-edit" data-id="${data.id}">
                      <i class="bi bi-pencil-square"></i> Edit
                    </button>
                    <button class="btn btn-outline-primary btn-rekening" data-id="${data.id}">
                      <i class="bi bi-credit-card-2-front"></i> Rekening
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
                    <div class="spinner-border" role="status"></div>
                    <div class="small mt-2 text-muted">Memuat…</div>
                  </div>`,
    },
  });
}

// ---------- lifecycle ----------
onMounted(() => {
  loadGroupList();
  initDataTable();

  // prepare bootstrap modal instances (require window.bootstrap assigned in main.js)
  if (typeof window !== "undefined" && window.bootstrap && window.bootstrap.Modal) {
    tambahModalEl = document.getElementById("tambahModal");
    editModalEl = document.getElementById("editModal");
    filterModalEl = document.getElementById("filterModal");
    rekeningModalEl = document.getElementById("rekeningModal");

    if (tambahModalEl) {
      tambahModalInstance = window.bootstrap.Modal.getOrCreateInstance(tambahModalEl);
      tambahModalEl.addEventListener("shown.bs.modal", () => {
        Object.keys(errors).forEach((k) => delete errors[k]);
        nextTick(() => document.getElementById("nama")?.focus());
      });
    }
    if (editModalEl) {
      editModalInstance = window.bootstrap.Modal.getOrCreateInstance(editModalEl);
      editModalEl.addEventListener("hidden.bs.modal", () => resetForm());
    }
    if (filterModalEl) {
      filterModalInstance = window.bootstrap.Modal.getOrCreateInstance(filterModalEl);
    }
    if (rekeningModalEl) {
      rekeningModalInstance = window.bootstrap.Modal.getOrCreateInstance(rekeningModalEl);
      rekeningModalEl.addEventListener("hidden.bs.modal", () => {
        // reset rekening-related fields but keep main form maybe
        form.bank = "";
        form.no_rekening = "";
        Object.keys(errors).forEach((k) => delete errors[k]);
      });
    }
  } else {
    console.warn(
      "Bootstrap Modal API tidak tersedia — pastikan main.js men-assign window.bootstrap = bootstrap"
    );
  }

  // delegated events from DataTable (jQuery)
  $("#tableMain").on("click", ".btn-edit", (e) => {
    const id = $(e.currentTarget).data("id");
    openEditModal(id);
  });

  $("#tableMain").on("click", ".btn-rekening", (e) => {
    const id = $(e.currentTarget).data("id");
    openRekeningModal(id);
  });

  // DataTables global error handler
  $.fn.dataTable.ext.errMode = (settings, helpPage, message) => {
    console.error(message);
    alert("Gagal memuat data tabel.");
  };
});

onUnmounted(() => {
  try {
    if (table.value) {
      $(table.value.table().node()).off();
      table.value.destroy(true);
    }
  } catch (e) {}

  // replace modal elements to remove listeners (safe cleanup)
  const safeReplace = (el) => {
    if (!el || !el.parentNode) return;
    try {
      const clone = el.cloneNode(true);
      el.parentNode.replaceChild(clone, el);
    } catch (e) {}
  };
  safeReplace(tambahModalEl);
  safeReplace(editModalEl);
  safeReplace(filterModalEl);
  safeReplace(rekeningModalEl);

  $("#tableMain").off("click", ".btn-edit");
  $("#tableMain").off("click", ".btn-rekening");
});

// ---------- UI actions ----------
function onQuickSearch() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    table.value?.ajax.reload();
  }, 300);
}

function applyFilter() {
  table.value?.ajax.reload();
}

function openFilter() {
  if (filterModalInstance) filterModalInstance.show();
}

function resetFilter() {
  filter.nama = "";
  filter.handphone = "";
  filter.email = "";
  filter.group_id = "";
  filter.status = "";
  quickSearch.value = "";
  table.value?.ajax.reload();
}

// ---------- form actions ----------
function openTambah() {
  resetForm();
  nextTick(() => {
    if (tambahModalInstance) tambahModalInstance.show();
  });
}

function submitTambah() {
  Object.keys(errors).forEach((k) => delete errors[k]);
  submitting.value = true;

  const rootUrl = import.meta.env.VITE_API_APPS;
  const url = rootUrl + "/master/visitor_add";
  const payload = {
    id: "",
    nama: form.nama,
    handphone: form.handphone,
    email: form.email,
    group_id: form.group_id,
    status: form.status,
    by: localStorage.getItem("user_nama"),
  };
  const token = { headers: { Token: "Bearer " + localStorage.getItem("actasysToken") } };

  axios
    .post(url, payload, token)
    .then(() => {
      if (tambahModalInstance) tambahModalInstance.hide();
      resetForm();
      table.value?.ajax.reload();
    })
    .catch((error) => {
      if (error.response && error.response.status === 400) {
        safeAssign(errors, error.response.data || {});
      } else {
        alert("Terjadi kesalahan. Coba lagi nanti.");
      }
    })
    .finally(() => (submitting.value = false));
}

function openEditModal(id) {
  const rootUrl = import.meta.env.VITE_API_APPS;
  const url = rootUrl + `/master/visitor_show/${id}`;
  const token = { headers: { Token: "Bearer " + localStorage.getItem("actasysToken") } };

  axios
    .get(url, token)
    .then((res) => {
      const d = res.data || {};
      form.id = id;
      form.nama = d.nama ?? "";
      form.handphone = d.handphone ?? "";
      form.email = d.email ?? "";
      form.group_id = d.group_id ?? "";
      form.status = d.status ?? 1;
      nextTick(() => {
        if (editModalInstance) editModalInstance.show();
      });
    })
    .catch(() => alert("Gagal mengambil data. Silakan coba lagi."));
}

function submitEdit() {
  submitting.value = true;
  Object.keys(errors).forEach((k) => delete errors[k]);

  const rootUrl = import.meta.env.VITE_API_APPS;
  const url = rootUrl + "/master/visitor_add";
  const payload = {
    id: form.id,
    nama: form.nama,
    handphone: form.handphone,
    email: form.email,
    group_id: form.group_id,
    status: form.status,
    by: localStorage.getItem("user_nama"),
  };
  const token = { headers: { Token: "Bearer " + localStorage.getItem("actasysToken") } };

  axios
    .post(url, payload, token)
    .then(() => {
      if (editModalInstance) editModalInstance.hide();
      resetForm();
      table.value?.ajax.reload(null, false);
    })
    .catch((error) => {
      if (error.response && error.response.status === 400)
        safeAssign(errors, error.response.data || {});
      else alert("Terjadi kesalahan. Coba lagi nanti.");
    })
    .finally(() => (submitting.value = false));
}

// rekening
function openRekeningModal(id) {
  const rootUrl = import.meta.env.VITE_API_APPS;
  const url = rootUrl + `/master/visitor_show/${id}`;
  const token = { headers: { Token: "Bearer " + localStorage.getItem("actasysToken") } };

  axios
    .get(url, token)
    .then((res) => {
      const d = res.data || {};
      form.id = id;
      form.nama = d.nama ?? "";
      form.bank = d.bank ?? "";
      form.no_rekening = d.no_rekening ?? "";
      nextTick(() => {
        if (rekeningModalInstance) rekeningModalInstance.show();
      });
    })
    .catch(() => alert("Gagal mengambil data. Silakan coba lagi."));
}

function submitRekening() {
  Object.keys(errors).forEach((k) => delete errors[k]);

  const rootUrl = import.meta.env.VITE_API_APPS;
  const url = rootUrl + "/master/visitor_rekening_add";
  const payload = {
    id: form.id,
    bank: form.bank,
    no_rekening: form.no_rekening,
    by: localStorage.getItem("user_nama"),
  };
  const token = { headers: { Token: "Bearer " + localStorage.getItem("actasysToken") } };

  axios
    .post(url, payload, token)
    .then(() => {
      if (rekeningModalInstance) rekeningModalInstance.hide();
      resetForm();
    })
    .catch((error) => {
      if (error.response && error.response.status === 400)
        safeAssign(errors, error.response.data || {});
      else alert("Terjadi kesalahan. Coba lagi nanti.");
    });
}
</script>

<style scoped src="@/apps/master/visitor.css"></style>