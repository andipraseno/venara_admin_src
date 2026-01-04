<template>
  <div class="container-fluid">
    <!-- Header -->
    <div class="report-header card soft-card no-print mb-3">
      <div class="card-body d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div>
          <h3 class="mb-1 d-flex align-items-center gap-2">
            <i class="bi bi-clipboard2-data"></i> Laporan Harian
          </h3>
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb mb-0">
              <li class="breadcrumb-item"><a href="#">Home</a></li>
              <li class="breadcrumb-item"><a href="#">Laporan</a></li>
              <li class="breadcrumb-item active" aria-current="page">Laporan Harian</li>
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
        <h4 class="mb-0 fw-bold">LAPORAN HARIAN</h4>
        <div class="small">Tanggal: {{ filter.tanggal }}</div>
        <hr class="my-2" />
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

    <!-- Grid -->
    <div v-if="listData.length === 0" class="text-center text-muted py-5">
      <i class="bi bi-inboxes" style="font-size: 2rem"></i>
      <div class="mt-2">Tidak ada data</div>
    </div>

    <div v-else class="card">
      <div class="table-responsive">
        <table class="table table-sm table-bordered table-striped align-middle report-table mb-0">
          <thead class="table-light sticky-header">
            <tr>
              <th style="white-space: nowrap">no_order</th>
              <th style="white-space: nowrap">tgl_order</th>
              <th style="white-space: nowrap">nama</th>
              <th style="white-space: nowrap">handphone</th>
              <th style="white-space: nowrap">tipe_paid</th>
              <th style="white-space: nowrap">tipe_note</th>
              <th class="text-end" style="white-space: nowrap">grand_total</th>
              <th style="white-space: nowrap">created_at</th>
              <th style="white-space: nowrap">updated_at</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in sortedRows" :key="i">
              <td>{{ row.no_order }}</td>
              <td>{{ toIndoDate(row.tgl_order) }}</td>
              <td>{{ row.nama }}</td>
              <td>{{ row.handphone }}</td>
              <td>{{ paidLabel(row.tipe_paid) }}</td>
              <td>{{ row.tipe_note }}</td>
              <td class="text-end">Rp {{ formatMoney(row.grand_total) }}</td>
              <td>{{ toIndoDateTime(row.created_at) }}</td>
              <td>{{ toIndoDateTime(row.updated_at) }}</td>
            </tr>
          </tbody>
          <tfoot class="table-secondary fw-semibold">
            <tr>
              <td colspan="6" class="text-end">Total</td>
              <td class="text-end">Rp {{ formatMoney(totalGrand) }}</td>
              <td></td>
              <td></td>
            </tr>
          </tfoot>
        </table>
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
            <div class="form-floating mb-3 position-relative">
              <input
                v-model="draftFilter.tanggal"
                id="filterTanggal"
                class="form-control pe-5"
                placeholder="dd/mm/yyyy"
                @blur="onBlurNormalize('tanggal')"
              />
              <label for="filterTanggal">Tanggal</label>

              <button
                type="button"
                class="btn position-absolute end-0 top-50 translate-middle-y me-3 p-0 border-0 bg-transparent"
                @click="showCal.add1 = !showCal.add1"
              >
                <i class="bi bi-calendar-date"></i>
              </button>

              <UiCalendar
                v-if="showCal.add1"
                v-model="draftFilter.tanggal"
                @close="showCal.add1 = false"
              />
            </div>

            <!-- Select: 1 = Auto, 2 = Manual -->
            <div class="form-floating mb-3">
              <select class="form-select" id="filterMode" v-model="draftFilter.tipe_paid">
                <option value="1">Auto</option>
                <option value="2">Manual</option>
              </select>
              <label for="filterMode">Mode</label>
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

const rootUrl = import.meta.env.VITE_API_APPS;
const urlReport = "/laporan/harian";

/* ---------- helper functions (di luar komponen) ---------- */
// "01092025" -> "01/09/2025"; kalau sudah dd/mm/yyyy dibiarkan
function prettifyDMY(s) {
  if (!s) return "";
  const t = String(s).trim();
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(t)) return t;
  const m = t.match(/^(\d{2})(\d{2})(\d{4})$/);
  if (m) return `${m[1]}/${m[2]}/${m[3]}`;
  return t;
}

// parser fleksibel -> ISO YYYY-MM-DD
function toISO(d) {
  if (d == null) return "";
  let s = String(d).trim();

  // "ddmmyyyy"
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

function helperToIndoDate(usDate) {
  const m = String(usDate || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : usDate || "";
}

function helperToIndoDateTime(v) {
  if (!v) return "";
  const iso = typeof v === "string" && v.includes("T") ? v : String(v).replace(" ", "T");
  const d = new Date(iso);
  if (isNaN(d)) return v;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
}

export default {
  name: "LaporanHarian",
  components: { UiCalendar },

  data() {
    const t = todayIndo();
    return {
      showCal: { add1: false },
      listData: [],

      filter: {
        tanggal: t,
        tipe_paid: "1",
      },
      draftFilter: {
        tanggal: t,
        tipe_paid: "1",
      },

      // disimpan kalau nanti mau pakai masking
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
    activeChips() {
      const chips = [{ key: "tanggal", label: "Tanggal", value: this.filter.tanggal }];
      if (this.filter.tipe_paid) {
        chips.push({
          key: "tipe_paid",
          label: "Mode",
          value: this.filter.tipe_paid === "1" ? "Auto" : "Manual",
        });
      }
      return chips;
    },

    sortedRows() {
      const rows = Array.isArray(this.listData) ? [...this.listData] : [];
      return rows.sort((a, b) => {
        const ca = new Date(a.created_at || 0).getTime();
        const cb = new Date(b.created_at || 0).getTime();
        if (cb !== ca) return cb - ca;
        return String(a.no_order || "").localeCompare(String(b.no_order || ""));
      });
    },

    totalGrand() {
      return (this.listData || []).reduce((s, r) => s + Number(r.grand_total || 0), 0);
    },
  },

  methods: {
    paidLabel(v) {
      if (v == null || v === "") return "";
      const n = Number(v);
      return n === 1 ? "Auto" : n === 2 ? "Manual" : String(v);
    },

    onBlurNormalize(field) {
      const raw = String(this.draftFilter[field] ?? "").trim();
      const pretty = prettifyDMY(raw);
      if (pretty) this.draftFilter[field] = pretty;
    },

    formatMoney(n) {
      return helperFormatMoney(n);
    },

    toIndoDate(usDate) {
      return helperToIndoDate(usDate);
    },

    toIndoDateTime(v) {
      return helperToIndoDateTime(v);
    },

    async fetchData() {
      Swal.fire({
        title: "Memuat data...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const tISO = toISO(this.filter.tanggal);
      if (!tISO) {
        Swal.close();
        return Swal.fire("Validasi", "Tanggal tidak valid. Gunakan format dd/mm/yyyy.", "warning");
      }

      const payload = { tanggal: tISO };
      if (this.filter.tipe_paid) payload.tipe_paid = this.filter.tipe_paid;

      try {
        const res = await axios.post(rootUrl + urlReport, payload, {
          headers: { Token: "Bearer " + localStorage.getItem("actasysToken") },
        });

        const arr = Array.isArray(res.data) ? res.data : res.data?.data || [];
        this.listData = arr.map((r) => ({
          no_order: r.no_order ?? r.noOrder ?? r.nomor_order ?? "",
          tgl_order: r.tgl_order ?? r.tanggal_order ?? r.tgl ?? r.tanggal ?? "",
          nama: r.nama ?? r.customer_nama ?? r.pelanggan ?? "",
          handphone: r.handphone ?? r.hp ?? r.telepon ?? "",
          grand_total: Number(r.grand_total ?? r.total ?? r.grandTotal ?? 0),
          created_at: r.created_at ?? r.createdAt ?? "",
          tipe_paid: r.tipe_paid ?? r.tipePaid ?? null,
          tipe_note: r.tipe_note ?? r.tipeNote ?? "",
          updated_at: r.updated_at ?? r.updatedAt ?? "",
        }));
      } catch (err) {
        console.error("fetchData error:", err);
        this.listData = [];
        Swal.fire("Error!", "Gagal memuat data laporan.", "error");
      } finally {
        Swal.close();
      }
    },

    openFilterModal() {
      this.draftFilter.tanggal = this.filter.tanggal;
      this.draftFilter.tipe_paid = this.filter.tipe_paid;
    },

    applyFilter() {
      const tISO = toISO(this.draftFilter.tanggal);
      if (!tISO) {
        return Swal.fire("Validasi", "Tanggal tidak valid. Gunakan format dd/mm/yyyy.", "warning");
      }
      this.filter.tanggal = dateUSToIndo(tISO);
      this.filter.tipe_paid = String(this.draftFilter.tipe_paid || "");
      this.fetchData();
    },

    resetFilter() {
      const v = { tanggal: todayIndo(), tipe_paid: "1" };
      this.filter.tanggal = v.tanggal;
      this.filter.tipe_paid = v.tipe_paid;
      this.draftFilter.tanggal = v.tanggal;
      this.draftFilter.tipe_paid = v.tipe_paid;
      this.fetchData();
    },

    exportCSV() {
      const rows = [
        ["Tanggal", this.filter.tanggal],
        [],
        [
          "no_order",
          "tgl_order",
          "nama",
          "handphone",
          "tipe_paid",
          "tipe_note",
          "grand_total",
          "created_at",
          "updated_at",
        ],
      ];

      this.sortedRows.forEach((r) =>
        rows.push([
          r.no_order ?? "",
          helperToIndoDate(r.tgl_order),
          r.nama ?? "",
          r.handphone ?? "",
          this.paidLabel(r.tipe_paid),
          r.tipe_note ?? "",
          Number(r.grand_total || 0),
          helperToIndoDateTime(r.created_at),
          helperToIndoDateTime(r.updated_at),
        ])
      );

      rows.push([]);
      rows.push(["TOTAL", "", "", "", "", "", this.totalGrand, "", ""]);

      const csv = rows
        .map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","))
        .join("\r\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const fileDate = String(this.filter.tanggal).replace(/\//g, "-");
      a.href = url;
      a.download = `laporan-harian_${fileDate}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    },

    printReport() {
      window.print();
    },
  },

  mounted() {
    // sudah di-init di data(), tapi jaga-jaga kalau mau diubah
    if (!this.filter.tanggal) {
      const t = todayIndo();
      this.filter.tanggal = t;
      this.draftFilter.tanggal = t;
    }
    this.fetchData();
  },
};
</script>

<style scoped url="@/apps/laporan/harian.css"></style>
