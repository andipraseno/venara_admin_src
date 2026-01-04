<template>
  <div class="container-fluid" v-cloak>
    <!-- Header + Breadcrumb -->
    <div class="mb-4">
      <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div>
          <h3 class="mb-1 fw-bold"><i class="bi bi-award"></i> Reschedule</h3>

          <nav aria-label="breadcrumb">
            <ol class="breadcrumb mb-0 small">
              <li class="breadcrumb-item"><a href="#">Home</a></li>
              <li class="breadcrumb-item"><a href="#">Transaction</a></li>
              <li class="breadcrumb-item active" aria-current="page">Reschedule</li>
            </ol>
          </nav>
        </div>

        <!-- Toolbar -->
        <div class="d-flex align-items-center gap-2">
          <button
            class="btn btn-outline-secondary"
            data-bs-toggle="modal"
            data-bs-target="#filterModal"
            @click="openFilterModal"
          >
            <i class="bi bi-funnel me-1"></i><span class="d-none d-sm-inline">Filter</span>
          </button>
          <button class="btn btn-outline-primary" @click="fetchJadwal" :disabled="isLoading">
            <i class="bi bi-arrow-repeat me-1" :class="{ spin: isLoading }"></i>
            <span class="d-none d-sm-inline">Refresh</span>
          </button>
          <button class="btn btn-outline-dark" @click="printPage">
            <i class="bi bi-printer me-1"></i><span class="d-none d-sm-inline">Print</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Loading skeleton -->
    <div v-if="isLoading" class="d-grid gap-3">
      <div v-for="n in 3" :key="'skel-' + n" class="card shadow-sm border-0 rounded-3">
        <div class="card-header bg-body skeleton-line"></div>
        <div class="card-body">
          <div class="skeleton-line mb-2"></div>
          <div class="skeleton-line w-75 mb-2"></div>
          <div class="skeleton-line w-50"></div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="groupedJadwal.length === 0" class="text-center text-muted py-5">
      <i class="bi bi-inbox display-5 d-block mb-2"></i>
      Tidak ada data. Coba ubah filter.
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
          <span class="badge bg-dark-subtle text-dark">{{ group.items.length }} entri</span>
        </div>

        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light sticky-thead">
              <tr>
                <th style="white-space: nowrap">Sesi</th>
                <th>Nama</th>
                <th>Handphone</th>
                <th class="text-center" style="width: 160px">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, i) in group.items" :key="`row-${gi}-${i}`" class="row-hover-soft">
                <td>
                  <div class="d-flex flex-column">
                    <span class="badge rounded-pill text-bg-primary px-3 py-2 mb-1">
                      <i class="bi bi-clock me-1"></i>{{ item.sesi_nama || "-" }}
                    </span>
                    <span class="badge rounded-pill" :class="statusBadge(item.status_sesi)">
                      {{ statusLabel(item.status_sesi) }}
                    </span>
                  </div>
                </td>
                <td class="fw-semibold">{{ item.nama || "-" }}</td>
                <td>
                  <div class="d-flex align-items-center flex-wrap gap-2">
                    <span class="text-muted small">{{ item.handphone || "-" }}</span>
                    <div class="vr d-none d-sm-block"></div>
                    <a
                      v-if="item.handphone"
                      :href="`tel:${cleanPhone(item.handphone)}`"
                      class="btn btn-sm btn-outline-secondary"
                      title="Telepon"
                    >
                      <i class="bi bi-telephone"></i>
                    </a>
                    <a
                      v-if="item.handphone"
                      :href="`https://wa.me/${waPhone(item.handphone)}`"
                      target="_blank"
                      rel="noopener"
                      class="btn btn-sm btn-outline-success"
                      title="WhatsApp"
                    >
                      <i class="bi bi-whatsapp"></i>
                    </a>
                    <button
                      v-if="item.handphone"
                      class="btn btn-sm btn-outline-dark"
                      @click="copyPhone(item.handphone)"
                      title="Copy"
                    >
                      <i class="bi bi-clipboard"></i>
                    </button>
                  </div>
                </td>
                <td class="text-center">
                  <button class="btn btn-sm btn-danger" @click="openReschedule(item)">
                    <i class="bi bi-arrow-counterclockwise me-1"></i>Reschedule
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <!-- /card -->
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

    <!-- Modal Reschedule -->
    <div
      class="modal fade"
      id="rescheduleModal"
      tabindex="-1"
      aria-labelledby="rescheduleLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-lg">
        <form @submit.prevent="submitReschedule" class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="rescheduleLabel">
              <i class="bi bi-arrow-counterclockwise me-2"></i>Reschedule
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>

          <div class="modal-body">
            <div class="row g-3">
              <div class="col-md-6">
                <div class="form-floating mb-3">
                  <input type="text" v-model="form.id" id="rId" class="form-control" readonly />
                  <label for="rId">Id</label>
                </div>
                <div class="form-floating mb-3">
                  <input type="text" v-model="form.nama" id="rNama" class="form-control" readonly />
                  <label for="rNama">Nama</label>
                </div>
                <div class="form-floating mb-3">
                  <input
                    type="text"
                    v-model="form.handphone"
                    id="rHp"
                    class="form-control"
                    readonly
                  />
                  <label for="rHp">Handphone</label>
                </div>
              </div>

              <div class="col-md-6">
                <div class="form-floating mb-3">
                  <input
                    type="text"
                    v-model="form.lapangan"
                    id="rLap"
                    class="form-control"
                    readonly
                  />
                  <label for="rLap">Lapangan</label>
                </div>
                <div class="form-floating mb-3">
                  <input
                    type="text"
                    v-model="form.sesi_sebelum"
                    id="rSesiLama"
                    class="form-control"
                    readonly
                  />
                  <label for="rSesiLama">Sesi (sebelum)</label>
                </div>

                <!-- Tanggal baru -->
                <div class="form-floating mb-3 position-relative">
                  <Cleave
                    v-model="form.tanggal_baru"
                    :options="cleaveTanggal"
                    id="rTanggalBaru"
                    class="form-control pe-5"
                    placeholder="dd/mm/yyyy"
                  />
                  <label for="rTanggalBaru">Tanggal baru</label>
                  <button
                    type="button"
                    class="btn position-absolute end-0 top-50 translate-middle-y me-2 p-0 border-0 bg-transparent"
                    @click="showCal.edit = !showCal.edit"
                    aria-label="Buka kalender"
                  >
                    <i class="bi bi-calendar-date"></i>
                  </button>
                  <UiCalendar
                    v-if="showCal.edit"
                    v-model="form.tanggal_baru"
                    @close="showCal.edit = false"
                  />
                </div>

                <!-- Sesi baru -->
                <div class="form-floating">
                  <input
                    type="text"
                    v-model.trim="form.sesi_baru"
                    id="rSesiBaru"
                    class="form-control"
                    :class="{ 'is-invalid': errors.sesi_baru }"
                    placeholder="cth: Sesi 3 (13:00-14:00)"
                  />
                  <label for="rSesiBaru">Sesi baru</label>
                  <div class="invalid-feedback" v-if="errors.sesi_baru">
                    {{ errors.sesi_baru[0] }}
                  </div>
                  <!-- NOTE: jika ada API combo sesi, ganti input jadi <select> -->
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              <span v-if="!saving"><i class="bi bi-check2 me-1"></i>Simpan</span>
              <span v-else>
                <span class="spinner-border spinner-border-sm me-2"></span>Menyimpan…
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Swal from "sweetalert2";
import UiCalendar from "../../components/Calendar.vue";
import Cleave from "vue-cleave-component";

export default {
  name: "ReschedulePage",
  components: { UiCalendar, Cleave },

  data() {
    const todayISO = new Date().toISOString().slice(0, 10); // yyyy-mm-dd
    const todayIndo = `${todayISO.slice(8, 10)}/${todayISO.slice(5, 7)}/${todayISO.slice(0, 4)}`;

    return {
      showCal: { add: false, edit: false },
      olahragaList: [],
      listJadwal: [],
      isLoading: false,
      saving: false,

      filter: {
        olahraga_id: null,
        tanggal: todayIndo,
        nama: "",
        handphone: "",
      },
      draftFilter: {
        olahraga_id: null,
        tanggal: todayIndo,
        nama: "",
        handphone: "",
      },

      form: {
        id: "",
        nama: "",
        handphone: "",
        lapangan: "",
        sesi_sebelum: "",
        tanggal_baru: todayIndo,
        sesi_baru: "",
      },

      errors: {},

      cleaveTanggal: {
        date: true,
        delimiter: "/",
        datePattern: ["d", "m", "Y"],
      },

      rootUrl: "https://api.burwoodsports.club/api",
      resModalInst: null,
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
    /* UI helpers */
    printPage() {
      window.print();
    },

    sesiOrder(s) {
      if (!s) return Number.POSITIVE_INFINITY;
      const m = String(s).match(/(\d+(?:\.\d+)?)/);
      return m ? parseFloat(m[1]) : Number.POSITIVE_INFINITY;
    },

    cleanPhone(p) {
      return String(p || "").replace(/[^\d]/g, "");
    },

    waPhone(p) {
      const d = this.cleanPhone(p);
      return d.startsWith("0") ? "62" + d.slice(1) : d;
    },

    async copyPhone(p) {
      try {
        await navigator.clipboard.writeText(this.cleanPhone(p));
        Swal.fire({ icon: "success", title: "Disalin", timer: 1000, showConfirmButton: false });
      } catch {
        Swal.fire("Info", "Gagal menyalin nomor", "info");
      }
    },

    statusLabel(v) {
      if (v == 0) return "Belum Dimulai";
      if (v == 1) return "Selesai";
      if (v == 2) return "Berlangsung";
      return "-";
    },

    statusBadge(v) {
      if (v == 0) return "text-bg-secondary";
      if (v == 1) return "text-bg-success";
      if (v == 2) return "text-bg-warning";
      return "text-bg-light text-dark";
    },

    /* date helpers */
    todayUS() {
      return new Date().toISOString().split("T")[0];
    },

    dateIndoToUS(d) {
      if (!d) return "";
      if (d instanceof Date && !isNaN(d)) return d.toISOString().split("T")[0];

      const s = String(d).trim();
      const mIso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (mIso) return `${mIso[1]}-${mIso[2]}-${mIso[3]}`;

      const p = s.split(/[\/\-.]/);
      if (p.length === 3) {
        let [dd, mm, yyyy] = p;
        dd = String(dd).padStart(2, "0");
        mm = String(mm).padStart(2, "0");
        yyyy = String(yyyy).padStart(4, "0");
        if (+mm >= 1 && +mm <= 12 && +dd >= 1 && +dd <= 31) {
          return `${yyyy}-${mm}-${dd}`;
        }
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

    toDmy(d) {
      if (!d) return "";
      let s = String(d).split(" ")[0];
      const delimiter = s.includes("/") ? "/" : "-";
      const parts = s.split(delimiter);
      if (parts[0].length === 4) return `${parts[2]}/${parts[1]}/${parts[0]}`;
      return `${parts[0]}/${parts[1]}/${parts[2]}`;
    },

    /* API & actions */
    async loadOlahragaList() {
      const url = this.rootUrl + "/master/olahraga_combo";
      const token = { headers: { Token: "Bearer " + localStorage.getItem("actasysToken") } };

      this.isLoading = true;
      try {
        const res = await axios.get(url, token);
        this.olahragaList = Array.isArray(res.data) ? res.data : res.data?.data || [];
        if (this.olahragaList.length > 0) {
          const firstId = String(this.olahragaList[0].id);
          this.filter.olahraga_id = firstId;
          this.draftFilter.olahraga_id = firstId;
        }
        await this.fetchJadwal();
      } catch (e) {
        Swal.fire("Gagal!", "Gagal memuat daftar olahraga. Silakan coba lagi.", "error");
      } finally {
        this.isLoading = false;
      }
    },

    async fetchJadwal() {
      const url = this.rootUrl + "/jadwal/jadwal_harian";
      const payload = {
        olahraga_id: this.filter.olahraga_id,
        tanggal: this.toDmy(this.filter.tanggal), // API expects dd/mm/yyyy
        nama: this.filter.nama,
        handphone: this.filter.handphone,
      };
      const token = { headers: { Token: "Bearer " + localStorage.getItem("actasysToken") } };

      this.isLoading = true;
      try {
        const res = await axios.post(url, payload, token);
        this.listJadwal = Array.isArray(res.data) ? res.data : res.data?.data || [];
      } catch (err) {
        console.error(err);
        this.listJadwal = [];
        Swal.fire("Error!", "Gagal memuat data jadwal.", "error");
      } finally {
        this.isLoading = false;
      }
    },

    openFilterModal() {
      this.draftFilter.olahraga_id = this.filter.olahraga_id;
      this.draftFilter.tanggal = this.filter.tanggal;
      this.draftFilter.nama = this.filter.nama;
      this.draftFilter.handphone = this.filter.handphone;
    },

    applyFilter() {
      this.filter.olahraga_id = this.draftFilter.olahraga_id;
      this.filter.tanggal = this.draftFilter.tanggal;
      this.filter.nama = this.draftFilter.nama;
      this.filter.handphone = this.draftFilter.handphone;
      this.fetchJadwal();
    },

    resetFilter() {
      const t = this.dateUSToIndo(this.todayUS());
      const firstId = this.olahragaList.length ? String(this.olahragaList[0].id) : null;
      const empty = { olahraga_id: firstId, tanggal: t, nama: "", handphone: "" };
      Object.assign(this.filter, empty);
      Object.assign(this.draftFilter, empty);
      this.fetchJadwal();
    },

    /* Modal Reschedule */
    openReschedule(item) {
      this.form.id = item.id || "";
      this.form.nama = item.nama || "";
      this.form.handphone = item.handphone || "";
      this.form.lapangan = item.lapangan_nama || "";
      this.form.sesi_sebelum = item.sesi_nama || "";
      this.form.tanggal_baru = this.filter.tanggal || this.dateUSToIndo(this.todayUS());
      this.form.sesi_baru = "";

      // clear errors
      Object.keys(this.errors).forEach((k) => delete this.errors[k]);

      const modalEl = document.getElementById("rescheduleModal");
      if (modalEl && window.bootstrap?.Modal) {
        if (!this.resModalInst) {
          this.resModalInst = new window.bootstrap.Modal(modalEl, { backdrop: "static" });
        }
        this.resModalInst.show();
      } else {
        try {
          window.$ && window.$("#rescheduleModal").modal("show");
        } catch {
          // ignore
        }
      }
    },

    async submitReschedule() {
      const url = this.rootUrl + "/transaction/reschedule_save";
      const payload = {
        id: this.form.id,
        tanggal_baru: this.toDmy(this.form.tanggal_baru),
        sesi_baru: this.form.sesi_baru,
        by: localStorage.getItem("user_nama"),
      };
      const token = { headers: { Token: "Bearer " + localStorage.getItem("actasysToken") } };

      try {
        const ok = await Swal.fire({
          title: "Konfirmasi",
          html: `<div class="text-start">
                   <div>Reschedule <strong>#${this.form.id}</strong></div>
                   <div>Dari: <strong>${this.form.sesi_sebelum}</strong></div>
                   <div>Ke: <strong>${payload.tanggal_baru}</strong>, <strong>${
            this.form.sesi_baru || "-"
          }</strong></div>
                 </div>`,
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Ya, simpan",
          cancelButtonText: "Batal",
        });
        if (!ok.isConfirmed) return;

        this.saving = true;
        await axios.post(url, payload, token);

        if (this.resModalInst) {
          this.resModalInst.hide();
        } else {
          try {
            window.$ && window.$("#rescheduleModal").modal("hide");
          } catch {
            // ignore
          }
        }
        Swal.fire("Berhasil", "Jadwal berhasil di-reschedule.", "success");
        this.fetchJadwal();
      } catch (error) {
        if (error.response && error.response.status === 400) {
          Object.assign(this.errors, error.response.data || {});
        } else {
          Swal.fire("Error", "Terjadi kesalahan. Coba lagi nanti.", "error");
        }
      } finally {
        this.saving = false;
      }
    },
  },

  mounted() {
    this.loadOlahragaList();

    const modalEl = document.getElementById("rescheduleModal");
    if (modalEl && window.bootstrap?.Modal && !this.resModalInst) {
      this.resModalInst = new window.bootstrap.Modal(modalEl, { backdrop: "static" });
    }
  },

  beforeUnmount() {
    try {
      if (this.resModalInst?.dispose) {
        this.resModalInst.dispose();
      }
    } catch {
      // ignore
    }
  },
};
</script>

<style scoped src="@/apps/transaction/reschedule.css"></style>
