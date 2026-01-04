<template>
  <div class="container-fluid" v-cloak>
    <!-- Header + Breadcrumb -->
    <div class="mb-4">
      <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div>
          <h3 class="mb-1 fw-bold">
            <i class="bi bi-calendar-week"></i>
            Jadwal Harian
          </h3>

          <nav aria-label="breadcrumb">
            <ol class="breadcrumb mb-0 small">
              <li class="breadcrumb-item"><a href="#">Home</a></li>
              <li class="breadcrumb-item"><a href="#">Transaction</a></li>
              <li class="breadcrumb-item active" aria-current="page">Jadwal Harian</li>
            </ol>
          </nav>
        </div>

        <!-- Toolbar -->
        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-outline-secondary" @click="openFilterModal" type="button">
            <i class="bi bi-funnel me-1"></i><span class="d-none d-sm-inline">Filter</span>
          </button>

          <button class="btn btn-outline-primary" @click="fetchJadwal" type="button">
            <i class="bi bi-arrow-repeat me-1"></i><span class="d-none d-sm-inline">Refresh</span>
          </button>

          <button class="btn btn-outline-dark" @click="printPage" type="button">
            <i class="bi bi-printer me-1"></i><span class="d-none d-sm-inline">Print</span>
          </button>
        </div>
      </div>
    </div>

    <!-- State: Loading -->
    <div v-if="isLoading" class="row g-3">
      <div v-for="n in 3" :key="'skel-' + n" class="col-12">
        <div class="card shadow-sm border-0 rounded-3">
          <div class="card-header bg-body skeleton-line rounded-top-3"></div>
          <div class="card-body">
            <div class="skeleton-line mb-2"></div>
            <div class="skeleton-line w-75 mb-2"></div>
            <div class="skeleton-line w-50"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- State: Empty -->
    <div v-else-if="groupedJadwal.length === 0" class="text-center text-muted py-5">
      <i class="bi bi-calendar-x display-4 d-block mb-2"></i>
      <div class="fw-semibold">Tidak ada data</div>
      <div class="small">Coba ubah filter atau tanggal untuk melihat jadwal.</div>
    </div>

    <!-- List per Lapangan -->
    <div v-else class="d-grid gap-3">
      <div
        v-for="(group, gi) in groupedJadwal"
        :key="`lap-${gi}-${group.lapangan}`"
        class="card shadow-sm border-0 rounded-3 overflow-hidden"
      >
        <div
          class="card-header bg-gradient-lapangan text-white d-flex align-items-center justify-content-between"
        >
          <h5 class="mb-0 fw-bold"><i class="bi bi-geo-alt me-2"></i>{{ group.lapangan }}</h5>
          <span class="badge bg-dark-subtle text-dark">{{ group.items.length }} sesi</span>
        </div>

        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light sticky-thead">
              <tr>
                <th style="white-space: nowrap" width="30%">Sesi</th>
                <th width="40%">Nama</th>
                <th width="30%">Kontak</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, i) in group.items" :key="`row-${gi}-${i}`" class="row-hover-soft">
                <td>
                  <div class="d-flex flex-column align-items-start">
                    <span class="badge rounded-pill text-bg-primary mb-1 px-3 py-2">
                      <i class="bi bi-clock me-1"></i>{{ item.sesi_nama || "-" }}
                    </span>
                    <span :class="['badge rounded-pill px-3', statusClass(item.status_sesi)]">
                      {{ statusLabel(item.status_sesi) }}
                    </span>
                  </div>
                </td>
                <td class="fw-semibold">{{ item.nama || "-" }}</td>
                <td>
                  <div class="d-flex flex-wrap gap-2 align-items-center">
                    <span class="text-muted small">{{ item.handphone || "-" }}</span>
                    <div class="vr d-none d-sm-block"></div>

                    <a
                      v-if="item.handphone"
                      :href="`tel:${cleanPhone(item.handphone)}`"
                      class="btn btn-sm btn-outline-secondary"
                    >
                      <i class="bi bi-telephone"></i>
                    </a>

                    <a
                      v-if="item.handphone"
                      :href="`https://wa.me/${waPhone(item.handphone)}`"
                      target="_blank"
                      rel="noopener"
                      class="btn btn-sm btn-outline-success"
                    >
                      <i class="bi bi-whatsapp"></i>
                    </a>

                    <button
                      v-if="item.handphone"
                      class="btn btn-sm btn-outline-dark"
                      @click="copyPhone(item.handphone)"
                      type="button"
                    >
                      <i class="bi bi-clipboard"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
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
              <select class="form-select" v-model="draftFilter.olahraga_id">
                <option :value="null" disabled>Pilih Olahraga</option>
                <option v-for="s in olahragaList" :key="s.id" :value="String(s.id)">
                  {{ s.nama }}
                </option>
              </select>
              <label class="form-label">Olahraga</label>
            </div>

            <div class="form-floating mb-3 position-relative">
              <Cleave
                v-model="draftFilter.tanggal"
                :options="cleaveTanggal"
                id="filterTanggal"
                class="form-control pe-5"
                placeholder="dd/mm/yyyy"
              />
              <label for="filterTanggal">Tanggal</label>

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
                v-model="draftFilter.tanggal"
                @close="showCal.add = false"
              />
            </div>

            <div class="form-floating mb-3">
              <input
                type="text"
                v-model.trim="draftFilter.nama"
                id="filterNama"
                class="form-control"
              />
              <label for="filterNama" class="form-label">Nama</label>
            </div>

            <div class="form-floating mb-3">
              <input
                type="text"
                v-model.trim="draftFilter.handphone"
                id="filterHandphone"
                class="form-control"
              />
              <label for="filterHandphone" class="form-label">Handphone</label>
            </div>
          </div>

          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
              @click="resetFilter"
            >
              <i class="bi bi-arrow-counterclockwise me-1"></i>Reset
            </button>
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
import axios from "axios";
import Swal from "sweetalert2";
import UiCalendar from "../../components/Calendar.vue";
import Cleave from "vue-cleave-component";

// ---------- helper date functions (di luar komponen) ----------
function dateIndoToUS(d) {
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
}

function dateUSToIndo(d) {
  if (!d) return "";
  const s = String(d).trim();
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return "";
  const [, yyyy, mm, dd] = m;
  return `${dd}/${mm}/${yyyy}`;
}

function todayUS() {
  return new Date().toISOString().split("T")[0];
}

function todayIndo() {
  return dateUSToIndo(todayUS());
}

// ---------- phone helpers (global) ----------
function helperCleanPhone(p) {
  return String(p || "").replace(/[^\d]/g, "");
}
function helperWaPhone(p) {
  const d = helperCleanPhone(p);
  if (d.startsWith("0")) return "62" + d.slice(1);
  return d;
}

// ---------- sesi helper ----------
function helperSesiOrder(s) {
  if (!s) return Number.POSITIVE_INFINITY;
  const m = String(s).match(/(\d+(?:\.\d+)?)/);
  return m ? parseFloat(m[1]) : Number.POSITIVE_INFINITY;
}

export default {
  name: "JadwalHarian",

  components: {
    UiCalendar,
    Cleave,
  },

  data() {
    const defaultTanggal = todayIndo();

    return {
      showCal: { add: false, edit: false },

      olahragaList: [],
      listJadwal: [],
      isLoading: false,

      filter: {
        olahraga_id: null,
        tanggal: defaultTanggal,
        nama: "",
        handphone: "",
      },

      draftFilter: {
        olahraga_id: null,
        tanggal: defaultTanggal,
        nama: "",
        handphone: "",
      },

      cleaveTanggal: {
        date: true,
        delimiter: "/",
        datePattern: ["d", "m", "Y"],
      },

      // modal instance
      filterModalEl: null,
      filterModalInstance: null,
    };
  },

  computed: {
    groupedJadwal() {
      const map = new Map();
      (this.listJadwal || []).forEach((it) => {
        const key = it.lapangan_nama || "Tanpa Nama";
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(it);
      });

      return Array.from(map.entries())
        .sort(([a], [b]) => String(a).localeCompare(String(b)))
        .map(([lapangan, items]) => {
          items.sort((x, y) => this.sesiOrder(x.sesi_nama) - this.sesiOrder(y.sesi_nama));
          return { lapangan, items };
        });
    },
  },

  methods: {
    // ---------- phone helpers ----------
    cleanPhone(p) {
      return helperCleanPhone(p);
    },
    waPhone(p) {
      return helperWaPhone(p);
    },
    async copyPhone(p) {
      try {
        await navigator.clipboard.writeText(helperCleanPhone(p));
        Swal.fire({
          icon: "success",
          title: "Disalin",
          text: "Nomor tersalin ke clipboard",
          timer: 1200,
          showConfirmButton: false,
        });
      } catch {
        Swal.fire("Info", "Gagal menyalin nomor.", "info");
      }
    },

    // ---------- UI helpers ----------
    printPage() {
      window.print();
    },
    statusLabel(v) {
      if (v == 0) return "Belum Dimulai";
      if (v == 1) return "Selesai";
      if (v == 2) return "Berlangsung";
      return "-";
    },
    statusClass(v) {
      if (v == 0) return "text-bg-secondary";
      if (v == 1) return "text-bg-success";
      if (v == 2) return "text-bg-warning";
      return "text-bg-light text-dark";
    },
    sesiOrder(s) {
      return helperSesiOrder(s);
    },

    // ---------- API ----------
    loadOlahragaList() {
      const rootUrl = import.meta.env.VITE_API_APPS;
      const url = rootUrl + "/master/olahraga_combo";
      const token = {
        headers: { Token: "Bearer " + localStorage.getItem("actasysToken") },
      };

      this.isLoading = true;
      axios
        .get(url, token)
        .then((response) => {
          this.olahragaList = Array.isArray(response.data)
            ? response.data
            : response.data?.data || [];

          if (this.olahragaList.length > 0) {
            const firstId = String(this.olahragaList[0].id);
            this.filter.olahraga_id = firstId;
            this.draftFilter.olahraga_id = firstId;
          }
          this.fetchJadwal();
        })
        .catch(() => {
          this.isLoading = false;
          Swal.fire("Gagal!", "Gagal memuat daftar olahraga. Silakan coba lagi.", "error");
        });
    },

    fetchJadwal() {
      const rootUrl = import.meta.env.VITE_API_APPS;
      const url = rootUrl + "/transaction/jadwal_harian";
      const payload = {
        olahraga_id: this.filter.olahraga_id,
        tanggal: dateIndoToUS(this.filter.tanggal),
        nama: this.filter.nama,
        handphone: this.filter.handphone,
      };
      const token = {
        headers: { Token: "Bearer " + localStorage.getItem("actasysToken") },
      };

      this.isLoading = true;
      axios
        .post(url, payload, token)
        .then((res) => {
          this.listJadwal = Array.isArray(res.data) ? res.data : res.data?.data || [];
        })
        .catch((err) => {
          console.error("Error fetching data:", err);
          this.listJadwal = [];
          Swal.fire("Error!", "Gagal memuat data jadwal.", "error");
        })
        .finally(() => {
          this.isLoading = false;
        });
    },

    // ---------- Filter actions ----------
    openFilterModal() {
      // copy current filter ke draft
      this.draftFilter.olahraga_id = this.filter.olahraga_id;
      this.draftFilter.tanggal = this.filter.tanggal;
      this.draftFilter.nama = this.filter.nama;
      this.draftFilter.handphone = this.filter.handphone;

      nextTick(() => {
        if (this.filterModalInstance) this.filterModalInstance.show();
      });
    },

    applyFilter() {
      this.filter.olahraga_id = this.draftFilter.olahraga_id;
      this.filter.tanggal = this.draftFilter.tanggal;
      this.filter.nama = this.draftFilter.nama;
      this.filter.handphone = this.draftFilter.handphone;
      this.fetchJadwal();
    },

    resetFilter() {
      const firstId = this.olahragaList.length > 0 ? String(this.olahragaList[0].id) : null;
      const empty = {
        olahraga_id: firstId,
        tanggal: todayIndo(),
        nama: "",
        handphone: "",
      };

      this.filter.olahraga_id = empty.olahraga_id;
      this.filter.tanggal = empty.tanggal;
      this.filter.nama = empty.nama;
      this.filter.handphone = empty.handphone;

      this.draftFilter.olahraga_id = empty.olahraga_id;
      this.draftFilter.tanggal = empty.tanggal;
      this.draftFilter.nama = empty.nama;
      this.draftFilter.handphone = empty.handphone;

      this.fetchJadwal();
    },
  },

  mounted() {
    this.loadOlahragaList();

    // prepare bootstrap modal
    if (typeof window !== "undefined" && window.bootstrap && window.bootstrap.Modal) {
      this.filterModalEl = document.getElementById("filterModal");
      if (this.filterModalEl) {
        this.filterModalInstance = window.bootstrap.Modal.getOrCreateInstance(this.filterModalEl);

        // sync draft saat modal dibuka
        this.filterModalEl.addEventListener("shown.bs.modal", () => {
          this.draftFilter.olahraga_id = this.filter.olahraga_id;
          this.draftFilter.tanggal = this.filter.tanggal;
          this.draftFilter.nama = this.filter.nama;
          this.draftFilter.handphone = this.filter.handphone;
        });
      }
    } else {
      console.warn(
        "Bootstrap Modal API tidak tersedia — pastikan main.js men-assign window.bootstrap = bootstrap"
      );
    }
  },

  unmounted() {
    // cleanup listener modal dengan cara clone node
    if (this.filterModalEl && this.filterModalEl.parentNode) {
      try {
        this.filterModalEl.parentNode.replaceChild(
          this.filterModalEl.cloneNode(true),
          this.filterModalEl
        );
      } catch (e) {
        // ignore
      }
    }
  },
};
</script>

<style scoped src="@/apps/transaction/JadwalHarian.css"></style>
