<template>
  <div class="container-fluid">
    <!-- Header -->
    <div class="report-header card soft-card no-print mb-3">
      <div class="card-body d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div>
          <h3 class="mb-1 d-flex align-items-center gap-2">
            <i class="bi bi-clipboard2-data"></i> Laporan Pemakaian
          </h3>
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb mb-0">
              <li class="breadcrumb-item"><a href="#">Home</a></li>
              <li class="breadcrumb-item"><a href="#">Laporan</a></li>
              <li class="breadcrumb-item active" aria-current="page">Laporan Pemakaian</li>
            </ol>
          </nav>
        </div>

        <div class="d-flex align-items-center gap-2 flex-wrap">
          <button
            class="btn btn-outline-secondary"
            data-bs-toggle="modal"
            data-bs-target="#filterModal"
            @click="openFilterModal"
          >
            <i class="bi bi-funnel me-1"></i> Filter
          </button>
          <button class="btn btn-outline-secondary" @click="fetchData">
            <i class="bi bi-arrow-clockwise me-1"></i> Refresh
          </button>
          <button class="btn btn-outline-primary" @click="exportCSV">
            <i class="bi bi-file-earmark-spreadsheet me-1"></i> Export CSV
          </button>
          <button class="btn btn-primary" @click="printReport">
            <i class="bi bi-printer me-1"></i> Cetak
          </button>
        </div>
      </div>
    </div>

    <!-- Kop cetak -->
    <div class="print-header d-none print-only">
      <div class="text-center">
        <h4 class="mb-0 fw-bold">LAPORAN PEMAKAIAN</h4>
        <div class="small">
          Tanggal: {{ filter.tanggal1 }} s/d {{ filter.tanggal2 }} · Olahraga:
          {{ olahragaNama(filter.olahraga_id) || "Seluruh Olahraga" }}
        </div>
        <hr class="my-2" />
      </div>
    </div>

    <!-- KPI -->
    <div class="row g-3 mb-3">
      <div class="col-md-3 col-6">
        <div class="card kpi-card">
          <div class="card-body">
            <div class="kpi-title">Total Lapangan</div>
            <div class="kpi-value">{{ groupedData.length }}</div>
          </div>
        </div>
      </div>
      <div class="col-md-3 col-6">
        <div class="card kpi-card">
          <div class="card-body">
            <div class="kpi-title">Total Sesi</div>
            <div class="kpi-value">{{ totalSesi.toLocaleString() }}</div>
          </div>
        </div>
      </div>
      <div class="col-md-3 col-6">
        <div class="card kpi-card">
          <div class="card-body">
            <div class="kpi-title">Total Pendapatan</div>
            <div class="kpi-value">Rp {{ formatMoney(totalHarga) }}</div>
          </div>
        </div>
      </div>
      <div class="col-md-3 col-6">
        <div class="card kpi-card">
          <div class="card-body">
            <div class="kpi-title">Rata2 Sesi/Lapangan</div>
            <div class="kpi-value">{{ avgSesiPerLap }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Chips -->
    <div v-if="activeChips.length" class="mb-3 no-print d-flex align-items-center flex-wrap gap-2">
      <span class="text-muted small me-1">Filter:</span>
      <span
        v-for="chip in activeChips"
        :key="chip.key"
        class="badge rounded-pill text-bg-light d-inline-flex align-items-center gap-1"
      >
        {{ chip.label }}: <strong>{{ chip.value }}</strong>
      </span>
    </div>

    <!-- Tabel -->
    <div v-if="groupedData.length === 0" class="text-center text-muted py-5">
      <i class="bi bi-inboxes" style="font-size: 2rem"></i>
      <div class="mt-2">Tidak ada data</div>
    </div>

    <div v-else>
      <div
        v-for="(group, gi) in groupedData"
        :key="`lap-${gi}-${group.lapangan}`"
        class="mb-4 report-section"
      >
        <div class="d-flex align-items-center justify-content-between mb-2">
          <h5 class="mb-0 section-title">
            {{ group.lapangan }}
            <small class="fw-normal ms-2">— {{ group.olahraga }}</small>
          </h5>
          <div class="text-muted small">Baris: {{ group.items.length }}</div>
        </div>

        <div class="table-responsive">
          <table class="table table-sm table-bordered table-striped align-middle report-table">
            <thead class="table-light sticky-header">
              <tr>
                <th style="white-space: nowrap; width: 160px">Tanggal</th>
                <th style="width: 140px">Total Sesi</th>
                <th style="width: 200px">Total Harga</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, i) in group.items" :key="`row-${gi}-${i}`">
                <td>{{ indoDate(item.tanggal) }}</td>
                <td class="text-end">{{ Number(item.total_sesi).toLocaleString() }}</td>
                <td class="text-end">Rp {{ formatMoney(item.total_harga) }}</td>
              </tr>
              <tr class="table-secondary fw-semibold">
                <td class="text-end">Subtotal</td>
                <td class="text-end">{{ subtotalSesi(group.items).toLocaleString() }}</td>
                <td class="text-end">Rp {{ formatMoney(subtotalHarga(group.items)) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="page-break"></div>
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
              <select class="form-select" v-model="draftFilter.olahraga_id" id="fOlahraga">
                <option value="">Seluruh Olahraga</option>
                <option v-for="s in olahragaList" :key="s.id" :value="String(s.id)">
                  {{ s.nama }}
                </option>
              </select>
              <label for="fOlahraga">Olahraga</label>
            </div>

            <div class="row">
              <div class="col-md-6">
                <div class="form-floating mb-3 position-relative">
                  <input
                    v-model="draftFilter.tanggal1"
                    id="filterTanggal1"
                    class="form-control pe-5"
                    placeholder="dd/mm/yyyy"
                    @blur="onBlurNormalize('tanggal1')"
                  />
                  <label for="filterTanggal1">Dari Tanggal</label>
                  <button
                    type="button"
                    class="btn position-absolute end-0 top-50 translate-middle-y me-3 p-0 border-0 bg-transparent"
                    @click="showCal.add1 = !showCal.add1"
                  >
                    <i class="bi bi-calendar-date"></i>
                  </button>
                  <UiCalendar
                    v-if="showCal.add1"
                    v-model="draftFilter.tanggal1"
                    @close="showCal.add1 = false"
                  />
                </div>
              </div>

              <div class="col-md-6">
                <div class="form-floating mb-3 position-relative">
                  <input
                    v-model="draftFilter.tanggal2"
                    id="filterTanggal2"
                    class="form-control pe-5"
                    placeholder="dd/mm/yyyy"
                    @blur="onBlurNormalize('tanggal2')"
                  />
                  <label for="filterTanggal2">Sampai Tanggal</label>
                  <button
                    type="button"
                    class="btn position-absolute end-0 top-50 translate-middle-y me-3 p-0 border-0 bg-transparent"
                    @click="showCal.add2 = !showCal.add2"
                  >
                    <i class="bi bi-calendar-date"></i>
                  </button>
                  <UiCalendar
                    v-if="showCal.add2"
                    v-model="draftFilter.tanggal2"
                    @close="showCal.add2 = false"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-light"
              data-bs-dismiss="modal"
              @click="resetFilter"
            >
              Reset
            </button>
            <button type="submit" class="btn btn-primary" data-bs-dismiss="modal">Terapkan</button>
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

const rootUrl = "https://api.burwoodsports.club/api";
const urlCombo = "/master/olahraga_combo";
const urlReport = "/laporan/pemakaian";

/* ===== Helper functions di luar komponen ===== */

function prettifyDMY(s) {
  if (!s) return "";
  const t = String(s).trim();
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(t)) return t;
  const m = t.match(/^(\d{2})(\d{2})(\d{4})$/);
  if (m) return `${m[1]}/${m[2]}/${m[3]}`;
  return t;
}

// Parser fleksibel -> ISO YYYY-MM-DD
function toISO(d) {
  if (d == null) return "";
  let s = String(d).trim();

  // 01092025 -> 01/09/2025
  const m8 = s.match(/^(\d{2})(\d{2})(\d{4})$/);
  if (m8) s = `${m8[1]}/${m8[2]}/${m8[3]}`;

  // sudah ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(s) && isValidDate(s)) return s;

  const m = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
  if (!m) return "";
  let dd = parseInt(m[1], 10);
  let mm = parseInt(m[2], 10);
  let yyyy = parseInt(m[3], 10);
  if (yyyy < 100) yyyy += 2000;
  if (dd < 1 || dd > 31 || mm < 1 || mm > 12) return "";

  const iso = `${String(yyyy).padStart(4, "0")}-${String(mm).padStart(2, "0")}-${String(
    dd
  ).padStart(2, "0")}`;
  return isValidDate(iso) ? iso : "";
}

function isValidDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  return iso === d.toISOString().slice(0, 10);
}

function todayUS() {
  return new Date().toISOString().split("T")[0];
}
function dateUSToIndo(d) {
  const m = String(d || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : "";
}
function todayIndo() {
  return dateUSToIndo(todayUS());
}

function helperFormatMoney(n) {
  return Number(n || 0).toLocaleString("id-ID");
}
function helperIndoDate(usDate) {
  const m = String(usDate || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : usDate || "";
}

/* subtotal helpers */
function helperSubtotalSesi(items) {
  return (items || []).reduce((s, it) => s + Number(it.total_sesi || 0), 0);
}
function helperSubtotalHarga(items) {
  return (items || []).reduce((s, it) => s + Number(it.total_harga || 0), 0);
}

export default {
  name: "LaporanPemakaian",
  components: { UiCalendar },

  data() {
    const tIndo = todayIndo();
    return {
      showCal: { add1: false, add2: false },
      olahragaList: [],
      listData: [],

      filter: {
        olahraga_id: "",
        tanggal1: tIndo,
        tanggal2: tIndo,
      },
      draftFilter: {
        olahraga_id: "",
        tanggal1: tIndo,
        tanggal2: tIndo,
      },

      // referensi kalau nanti pakai masking
      cleaveTanggal: {
        date: true,
        delimiter: "/",
        datePattern: ["d", "m", "Y"],
        blocks: [2, 2, 4],
        numericOnly: true,
      },
    };
  },

  computed: {
    groupedData() {
      const bucket = {};
      (this.listData || []).forEach((row) => {
        const lap = row.lapangan_nama || "Tanpa Nama";
        if (!bucket[lap]) {
          bucket[lap] = {
            lapangan: lap,
            olahraga: row.olahraga_nama || "-",
            items: [],
          };
        }
        bucket[lap].items.push({
          tanggal: row.tanggal,
          total_sesi: Number(row.total_sesi || 0),
          total_harga: Number(row.total_harga || 0),
        });
      });

      const arr = Object.values(bucket).sort((a, b) => a.lapangan.localeCompare(b.lapangan));
      arr.forEach((g) =>
        g.items.sort((x, y) => String(x.tanggal).localeCompare(String(y.tanggal)))
      );
      return arr;
    },

    totalSesi() {
      return this.groupedData.reduce((sum, g) => sum + helperSubtotalSesi(g.items), 0);
    },

    totalHarga() {
      return this.groupedData.reduce((sum, g) => sum + helperSubtotalHarga(g.items), 0);
    },

    avgSesiPerLap() {
      return Math.round(this.totalSesi / (this.groupedData.length || 1));
    },

    activeChips() {
      return [
        {
          key: "tanggal",
          label: "Tanggal",
          value: `${this.filter.tanggal1} s/d ${this.filter.tanggal2}`,
        },
        {
          key: "olahraga",
          label: "Olahraga",
          value: this.olahragaNama(this.filter.olahraga_id) || "Seluruh Olahraga",
        },
      ];
    },
  },

  methods: {
    /* API */
    async loadOlahragaList() {
      Swal.fire({
        title: "Memuat data...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      try {
        const r = await axios.get(rootUrl + urlCombo, {
          headers: { Token: "Bearer " + localStorage.getItem("actasysToken") },
        });
        this.olahragaList = Array.isArray(r.data) ? r.data : r.data?.data || [];
        await this.fetchData();
      } catch (err) {
        console.error("loadOlahragaList error:", err);
        Swal.fire("Gagal!", "Gagal memuat daftar olahraga.", "error");
      } finally {
        Swal.close();
      }
    },

    async fetchData() {
      Swal.fire({
        title: "Memuat data...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const t1 = toISO(this.filter.tanggal1);
      const t2 = toISO(this.filter.tanggal2);

      if (!t1 || !t2) {
        Swal.close();
        return Swal.fire("Validasi", "Tanggal tidak valid. Gunakan format dd/mm/yyyy.", "warning");
      }

      const payload = {
        olahraga_id: this.filter.olahraga_id,
        tanggal1: t1,
        tanggal2: t2,
      };

      try {
        const res = await axios.post(rootUrl + urlReport, payload, {
          headers: { Token: "Bearer " + localStorage.getItem("actasysToken") },
        });
        this.listData = Array.isArray(res.data) ? res.data : res.data?.data || [];
      } catch (err) {
        console.error("fetchData error:", err);
        this.listData = [];
        Swal.fire("Error!", "Gagal memuat data laporan.", "error");
      } finally {
        Swal.close();
      }
    },

    /* Filter & actions */
    openFilterModal() {
      this.draftFilter.olahraga_id = this.filter.olahraga_id;
      this.draftFilter.tanggal1 = this.filter.tanggal1;
      this.draftFilter.tanggal2 = this.filter.tanggal2;
    },

    applyFilter() {
      const t1iso = toISO(this.draftFilter.tanggal1);
      const t2iso = toISO(this.draftFilter.tanggal2);
      if (!t1iso || !t2iso) {
        return Swal.fire("Validasi", "Tanggal tidak valid. Gunakan format dd/mm/yyyy.", "warning");
      }
      if (t1iso > t2iso) {
        return Swal.fire(
          "Validasi",
          "Tanggal awal tidak boleh lebih besar dari tanggal akhir.",
          "warning"
        );
      }

      this.filter.olahraga_id =
        String(this.draftFilter.olahraga_id || "") === ""
          ? ""
          : String(this.draftFilter.olahraga_id);
      this.filter.tanggal1 = dateUSToIndo(t1iso);
      this.filter.tanggal2 = dateUSToIndo(t2iso);

      this.fetchData();
    },

    resetFilter() {
      const v = { olahraga_id: "", tanggal1: todayIndo(), tanggal2: todayIndo() };
      this.filter.olahraga_id = v.olahraga_id;
      this.filter.tanggal1 = v.tanggal1;
      this.filter.tanggal2 = v.tanggal2;
      this.draftFilter.olahraga_id = v.olahraga_id;
      this.draftFilter.tanggal1 = v.tanggal1;
      this.draftFilter.tanggal2 = v.tanggal2;
      this.fetchData();
    },

    /* Aggregation helpers (dipakai di template & export) */
    subtotalSesi(items) {
      return helperSubtotalSesi(items);
    },
    subtotalHarga(items) {
      return helperSubtotalHarga(items);
    },

    /* Tanggal & format helpers */
    onBlurNormalize(field) {
      const raw = String(this.draftFilter[field] ?? "").trim();
      const pretty = prettifyDMY(raw);
      if (pretty) this.draftFilter[field] = pretty;
    },

    formatMoney(n) {
      return helperFormatMoney(n);
    },

    indoDate(usDate) {
      return helperIndoDate(usDate);
    },

    olahragaNama(id) {
      if (id === "" || id === undefined) return "";
      const f = this.olahragaList.find((o) => String(o.id) === String(id));
      return f?.nama || "";
    },

    /* Export & print */
    exportCSV() {
      const rows = [
        ["Tanggal1", this.filter.tanggal1],
        ["Tanggal2", this.filter.tanggal2],
        ["Olahraga", this.olahragaNama(this.filter.olahraga_id) || "Semua"],
        [],
        ["Lapangan", "Tanggal", "Total Sesi", "Total Harga"],
      ];

      this.groupedData.forEach((g) => {
        g.items.forEach((i) =>
          rows.push([
            g.lapangan,
            this.indoDate(i.tanggal),
            Number(i.total_sesi),
            Number(i.total_harga),
          ])
        );
        rows.push([
          g.lapangan + " (Subtotal)",
          "",
          this.subtotalSesi(g.items),
          this.subtotalHarga(g.items),
        ]);
        rows.push([]);
      });

      const csv = rows
        .map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","))
        .join("\r\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const fileDate = `${String(this.filter.tanggal1).replace(/\//g, "-")}_sd_${String(
        this.filter.tanggal2
      ).replace(/\//g, "-")}`;
      a.href = url;
      a.download = `laporan-pemakaian_${fileDate}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    },

    printReport() {
      window.print();
    },
  },

  mounted() {
    this.loadOlahragaList();
  },
};
</script>

<style scoped url="@/apps/laporan/pemakaian.css"></style>