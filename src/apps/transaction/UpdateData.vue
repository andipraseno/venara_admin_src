<template>
  <div class="container-fluid" v-cloak>
    <!-- Header + Breadcrumb -->
    <div class="mb-4">
      <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div>
          <h3 class="mb-1 fw-bold">
            <i class="bi bi-award"></i>
            Update Data
          </h3>

          <nav aria-label="breadcrumb">
            <ol class="breadcrumb mb-0 small">
              <li class="breadcrumb-item"><a href="#">Home</a></li>
              <li class="breadcrumb-item"><a href="#">Transaction</a></li>
              <li class="breadcrumb-item active" aria-current="page">Update Data</li>
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
                <th style="white-space: nowrap" width="20%">Sesi</th>
                <th width="30%">Nama</th>
                <th width="30%">Kontak</th>
                <th width="20%" class="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, i) in group.items" :key="`row-${gi}-${i}`" class="row-hover-soft">
                <td>
                  <div class="d-flex flex-column align-items-start">
                    <span class="badge rounded-pill text-bg-primary px-3 py-2 mb-1">
                      <i class="bi bi-clock me-1"></i>{{ item.sesi_nama || "-" }}
                    </span>
                    <span class="badge rounded-pill text-bg-danger px-3">Unpaid</span>
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
                  <button class="btn btn-sm btn-primary" @click="openEditModal(item.id)">
                    <i class="bi bi-pencil me-1"></i>Update Data
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

    <!-- Modal Start Update Data -->
    <div
      class="modal fade"
      id="editModal"
      tabindex="-1"
      aria-labelledby="editModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-lg">
        <form @submit.prevent="submitEdit" class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="editModalLabel">
              <i class="bi bi-credit-card-2-back me-2"></i>Start Update Data
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>

          <div class="modal-body">
            <div class="row g-3">
              <div class="col-md-6">
                <div class="form-floating mb-3">
                  <input
                    type="text"
                    v-model="form.id"
                    id="editId"
                    class="form-control"
                    :class="{ 'is-invalid': errors.id }"
                    readonly
                  />
                  <label for="editId" class="form-label">Id</label>
                  <div class="invalid-feedback" v-if="errors.id">{{ errors.id[0] }}</div>
                </div>

                <div class="form-floating mb-3">
                  <input
                    type="text"
                    v-model.trim="form.no_order"
                    id="editNoOrder"
                    class="form-control"
                    :class="{ 'is-invalid': errors.no_order }"
                    readonly
                  />
                  <label for="editNoOrder" class="form-label">No. Order</label>
                  <div class="invalid-feedback" v-if="errors.no_order">
                    {{ errors.no_order[0] }}
                  </div>
                </div>

                <div class="form-floating mb-3">
                  <input
                    type="text"
                    v-model.trim="form.tgl_order"
                    id="editTglOrder"
                    class="form-control"
                    readonly
                  />
                  <label for="editTglOrder" class="form-label">Tgl. Order</label>
                </div>

                <div class="form-floating mb-3">
                  <input
                    type="text"
                    v-model.trim="form.grand_total"
                    id="editGrandTotal"
                    class="form-control"
                    readonly
                  />
                  <label for="editGrandTotal" class="form-label">Grand Total</label>
                </div>
              </div>

              <div class="col-md-6">
                <div class="form-floating mb-3">
                  <input
                    type="text"
                    v-model.trim="form.nama"
                    id="editNama"
                    class="form-control"
                    :class="{ 'is-invalid': errors.nama }"
                  />
                  <label for="editNama" class="form-label">Nama</label>
                  <div class="invalid-feedback" v-if="errors.nama">{{ errors.nama[0] }}</div>
                </div>

                <div class="form-floating mb-3">
                  <input
                    type="text"
                    v-model.trim="form.handphone"
                    id="editHandphone"
                    class="form-control"
                    :class="{ 'is-invalid': errors.handphone }"
                  />
                  <label for="editHandphone" class="form-label">Handphone</label>
                  <div class="invalid-feedback" v-if="errors.handphone">
                    {{ errors.handphone[0] }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              <span v-if="!saving"><i class="bi bi-check2 me-1"></i>Simpan</span>
              <span v-else>
                <span
                  class="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Menyimpan…
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

/* helper di luar component supaya bisa dipakai di data() */
const todayISOConst = new Date().toISOString().slice(0, 10); // yyyy-mm-dd
function toIndo(iso) {
  if (!iso) return "";
  const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return "";
  return `${m[3]}/${m[2]}/${m[1]}`;
}

export default {
  name: "UpdateDataPage",
  components: { UiCalendar, Cleave },

  data() {
    const todayIndo = toIndo(todayISOConst);

    return {
      showCal: { add: false },

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
        tgl_order: todayIndo,
        no_order: "",
        nama: "",
        handphone: "",
        grand_total: 0,
        tipe_note: "",
      },

      errors: {},

      cleaveTanggal: {
        date: true,
        delimiter: "/",
        datePattern: ["d", "m", "Y"],
      },

      rootUrl: "https://api.burwoodsports.club/api",
      editModalInst: null,
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
          items.sort((x, y) => {
            const sx = this.sesiOrder(x.sesi_nama);
            const sy = this.sesiOrder(y.sesi_nama);
            return sx - sy;
          });
          return { lapangan, items };
        });
    },
  },

  methods: {
    printPage() {
      window.print();
    },

    /* helpers */
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

    toDmy(d) {
      if (!d) return "";
      let s = String(d).split(" ")[0];
      const delimiter = s.includes("/") ? "/" : "-";
      const parts = s.split(delimiter);
      if (parts[0].length === 4) return `${parts[2]}/${parts[1]}/${parts[0]}`;
      return `${parts[0]}/${parts[1]}/${parts[2]}`;
    },

    formatNumber(num) {
      if (num == null || num === "") return "0";
      return new Intl.NumberFormat("id-ID").format(
        Number(String(num).replace(/[^\d\-.,]/g, "") || 0)
      );
    },

    /* API & actions */
    async loadOlahragaList() {
      const url = this.rootUrl + "/master/olahraga_combo";
      const token = { headers: { Token: "Bearer " + localStorage.getItem("actasysToken") } };

      this.isLoading = true;
      try {
        const res = await axios.get(url, token);
        this.olahragaList = Array.isArray(res.data) ? res.data : res.data?.data || [];
        if (this.olahragaList.length) {
          const firstId = String(this.olahragaList[0].id);
          this.filter.olahraga_id = firstId;
          this.draftFilter.olahraga_id = firstId;
        }
        await this.fetchJadwal();
      } catch {
        Swal.fire("Gagal!", "Gagal memuat daftar olahraga.", "error");
      } finally {
        this.isLoading = false;
      }
    },

    async fetchJadwal() {
      const url = this.rootUrl + "/jadwal/jadwal_harian";
      const payload = {
        olahraga_id: this.filter.olahraga_id,
        tanggal: this.dateIndoToUS(this.filter.tanggal),
        nama: this.filter.nama,
        handphone: this.filter.handphone,
      };
      const token = { headers: { Token: "Bearer " + localStorage.getItem("actasysToken") } };

      this.isLoading = true;
      try {
        const res = await axios.post(url, payload, token);
        this.listJadwal = Array.isArray(res.data) ? res.data : res.data?.data || [];
      } catch (err) {
        console.error("Error fetching data:", err);
        this.listJadwal = [];
        Swal.fire("Error!", "Gagal memuat data.", "error");
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
      const todayIndo = this.dateUSToIndo(this.todayUS());
      const firstId = this.olahragaList.length ? String(this.olahragaList[0].id) : null;
      const empty = { olahraga_id: firstId, tanggal: todayIndo, nama: "", handphone: "" };
      Object.assign(this.filter, empty);
      Object.assign(this.draftFilter, empty);
      this.fetchJadwal();
    },

    resetForm() {
      const todayIndo = this.dateUSToIndo(this.todayUS());
      Object.assign(this.form, {
        id: "",
        tgl_order: todayIndo,
        no_order: "",
        nama: "",
        handphone: "",
        grand_total: 0,
        tipe_note: "",
      });
      Object.keys(this.errors).forEach((k) => delete this.errors[k]);
    },

    async openEditModal(id) {
      const url = this.rootUrl + `/transaction/updatedata/${id}`;
      const token = { headers: { Token: "Bearer " + localStorage.getItem("actasysToken") } };

      try {
        Swal.fire({
          title: "Ambil data…",
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });
        const { data } = await axios.get(url, token);

        const row = (Array.isArray(data) ? data[0] : data) || {};
        this.form.id = id;
        this.form.nama = row.nama ?? "";
        this.form.no_order = row.no_order ?? "";
        this.form.tgl_order = this.toDmy(row.tgl_order) || this.form.tgl_order;
        this.form.handphone = row.handphone ?? "";
        this.form.grand_total = this.formatNumber(row.grand_total ?? 0);

        Swal.close();

        const modalEl = document.getElementById("editModal");
        if (modalEl && window.bootstrap?.Modal) {
          if (!this.editModalInst) {
            this.editModalInst = new window.bootstrap.Modal(modalEl, { backdrop: "static" });
          }
          this.editModalInst.show();
        } else {
          try {
            window.$ && window.$("#editModal").modal("show");
          } catch {
            // ignore
          }
        }
      } catch (e) {
        Swal.fire("Gagal", "Gagal mengambil data. Silakan coba lagi.", "error");
      }
    },

    async submitEdit() {
      const url = this.rootUrl + `/transaction/updatedata_save`;
      const payload = {
        id: this.form.id,
        nama: this.form.nama,
        handphone: this.form.handphone,
        by: localStorage.getItem("user_nama"),
      };
      const token = { headers: { Token: "Bearer " + localStorage.getItem("actasysToken") } };

      try {
        const ok = await Swal.fire({
          title: "Konfirmasi",
          text: `Data order #${this.form.no_order} akan diubah untuk nama atau nomor handphone?`,
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Ya, simpan",
          cancelButtonText: "Batal",
        });
        if (!ok.isConfirmed) return;

        this.saving = true;
        await axios.post(url, payload, token);

        if (this.editModalInst) {
          this.editModalInst.hide();
        } else {
          try {
            window.$ && window.$("#editModal").modal("hide");
          } catch {
            // ignore
          }
        }
        this.resetForm();
        this.fetchJadwal();
        Swal.fire("Berhasil", "Update Data berhasil.", "success");
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

    const modalEl = document.getElementById("editModal");
    if (modalEl && window.bootstrap?.Modal && !this.editModalInst) {
      this.editModalInst = new window.bootstrap.Modal(modalEl, { backdrop: "static" });
    }
  },

  beforeUnmount() {
    try {
      this.editModalInst?.dispose && this.editModalInst.dispose();
    } catch {
      // ignore
    }
  },
};
</script>

<style scoped src="@/apps/transaction/updatedata.css"></style>
