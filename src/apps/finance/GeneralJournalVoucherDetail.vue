<template>
  <div class="container-fluid">
    <Navbar />

    <!-- ================= HEADER PAGE ================= -->
    <div class="mb-3 mt-3">
      <h3 class="mb-1">
        <i class="bi bi-card-checklist"></i>
        General Journal Voucher
      </h3>

      <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
          <li class="breadcrumb-item">Home</li>
          <li class="breadcrumb-item">Finance</li>
          <li class="breadcrumb-item">
            <router-link :to="{ name: 'GeneralJournalVoucher' }"> General Journal Voucher </router-link>
          </li>
          <li class="breadcrumb-item active">Detail</li>
        </ol>
      </nav>
    </div>

    <!-- ================= MAIN CONTENT ================= -->
    <div class="row g-3">
      <!-- ===== KIRI : HEADER ===== -->
      <div class="col-lg-4">
        <div class="card shadow-sm sticky-top" style="top: 90px">
          <div class="card-header bg-light fw-semibold">
            <i class="bi bi-boxes me-1"></i>
            Header Transaksi
          </div>

          <div class="card-body">
            <div class="mb-3">
              <label class="form-label">No. Transaksi</label>
              <input type="text" class="form-control" v-model="form.no_transaksi" readonly />
            </div>

            <div class="form-floating mb-3 position-relative">
              <Cleave
                v-model="form.tgl_transaksi"
                :options="cleaveTanggal"
                class="form-control pe-5"
                placeholder="dd/mm/yyyy"
              />
              <label>Tgl. Transaksi</label>

              <button
                class="btn position-absolute end-0 top-50 translate-middle-y me-2 p-0 border-0 bg-transparent"
                @click="showCal.add = !showCal.add"
              >
                <i class="bi bi-calendar-date"></i>
              </button>

              <UiCalendar
                v-if="showCal.add"
                v-model="form.tgl_transaksi"
                @close="showCal.add = false"
              />
            </div>

            <div class="mb-3">
              <label class="form-label">Memo</label>
              <textarea class="form-control" rows="3" v-model="form.memo"></textarea>
            </div>

            <button class="btn btn-primary" @click="submitForm">
              <i class="bi bi-save me-1"></i>
              Simpan
            </button>
          </div>
        </div>
      </div>

      <!-- ===== KANAN : DETAIL ===== -->
      <div class="col-lg-8">
        <div class="card shadow-sm">
          <div class="card-header d-flex justify-content-between">
            <strong>
              <i class="bi bi-box-seam me-1"></i>
              Detail Akun
            </strong>

            <button class="btn btn-sm btn-primary" @click="addItem">
              <i class="bi bi-plus-circle me-1"></i>
              Tambah
            </button>
          </div>

          <div class="table-responsive">
            <table class="table table-bordered align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th>Akun</th>
                  <th width="120" class="text-end">Debit</th>
                  <th width="150" class="text-end">Credit</th>
                  <th width="170" class="text-end">Balance</th>
                  <th width="250"></th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="(item, index) in items" :key="index">
                  <td>
                    <select class="form-select" v-model="item.akun_id">
                      <option value="">Pilih Akun</option>
                      <option v-for="b in akunList" :key="b.id" :value="b.id">
                        {{ b.nama }}
                      </option>
                    </select>
                  </td>

                  <td>
                    <Cleave
                      v-model="item.debit_view"
                      :options="cleaveNumber"
                      class="form-control text-end"
                    />
                  </td>

                  <td>
                    <Cleave
                      v-model="item.credit_view"
                      :options="cleaveNumber"
                      class="form-control text-end"
                    />
                  </td>

                  <td class="text-end fw-semibold">
                    {{ formatRupiah(item.debit - item.credit) }}
                  </td>

                  <td class="text-center">
                    <button class="btn btn-sm btn-primary me-1 mb-1" @click="saveItem(item, index)">
                      <i class="bi bi-save me-1"></i>
                      {{ item.id ? "Update" : "Simpan" }}
                    </button>

                    <button
                      v-if="item.id"
                      class="btn btn-sm btn-danger me-1 mb-1"
                      @click="deleteItem(item.id, index)"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>

                <tr v-if="items.length === 0">
                  <td colspan="5" class="text-center text-muted">Belum ada akun</td>
                </tr>
              </tbody>

              <tfoot>
                <tr class="table-light">
                  <th colspan="3" class="text-end">Grand Total</th>
                  <th class="text-end fs-5">
                    {{ formatRupiah(grandTotal) }}
                  </th>
                  <th></th>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <!-- ================= MODAL RFID ================= -->
      <div class="modal fade" id="modalScanRfid" tabindex="-1">
        <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div class="modal-content shadow">
            <div class="modal-header bg-success text-white">
              <h5 class="modal-title"><i class="bi bi-upc-scan me-1"></i> Scan RFID</h5>
              <button class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>

            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label">Scan RFID</label>
                <input
                  ref="rfidInput"
                  type="text"
                  class="form-control form-control-lg"
                  v-model="rfidValue"
                  placeholder="Scan lalu ENTER"
                  @keydown.enter.prevent="submitRfid"
                />
              </div>

              <table id="tableRfid" class="table table-bordered table-striped w-100">
                <thead>
                  <tr>
                    <th width="50">No</th>
                    <th>RFID</th>
                    <th width="80">Aksi</th>
                  </tr>
                </thead>
                <tbody></tbody>
              </table>
            </div>

            <div class="modal-footer justify-content-between">
              <strong>Total : {{ scannedRfids.length }}</strong>

              <div>
                <button class="btn btn-secondary me-2" data-bs-dismiss="modal">
                  <i class="bi bi-x-circle me-1"></i> Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Navbar from "@/components/Navbar.vue";
import Cleave from "vue-cleave-component";
import axios from "axios";
import { useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import UiCalendar from "@/components/Calendar.vue";

export default {
  name: "General Journal VoucherDetailForm",
  components: { Navbar, Cleave, UiCalendar },

  data() {
    return {
      route: useRoute(),
      baseUrl: import.meta.env.VITE_API_ACTASYS,
      tokenHeaders: {},

      // RFID
      selectedScanItem: null,
      rfidValue: "",
      scannedRfids: [],
      rfidTable: null,

      showCal: { add: false },

      form: {
        id: "",
        no_transaksi: "< Auto Number >",
        tgl_transaksi: "",
        no_ref: "",
        memo: "",
      },

      items: [],
      akunList: [],

      cleaveTanggal: {
        date: true,
        delimiter: "/",
        datePattern: ["d", "m", "Y"],
      },

      cleaveNumber: {
        numeral: true,
        delimiter: ".",
        numeralDecimalMark: ",",
        numeralDecimalScale: 0,
      },
    };
  },

  computed: {
    grandTotal() {
      return this.items.reduce((t, i) => t + i.debit - i.credit, 0);
    },
  },

  watch: {
    items: {
      deep: true,
      handler(val) {
        val.forEach((i) => {
          i.debit = this.toNumber(i.debit_view);
          i.credit = this.toNumber(i.credit_view);
        });
      },
    },
  },

  mounted() {
    const auth = useAuthStore();
    this.tokenHeaders = {
      headers: { Token: "Bearer " + auth.login.token },
    };

    this.form.id = this.route.params.id || "";
    this.form.tgl_transaksi = this.todayIndo();

    this.loadAkun();
    this.initData();
  },

  methods: {
    toNumber(v) {
      return Number(String(v || "0").replace(/\./g, "")) || 0;
    },

    formatRupiah(v) {
      return new Intl.NumberFormat("id-ID").format(v || 0);
    },

    todayIndo() {
      const d = new Date();
      return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}/${d.getFullYear()}`;
    },

    addItem() {
      this.items.push({
        id: "",
        akun_id: "",
        debit: 0,
        debit_view: "0",
        credit: 0,
        credit_view: "0",
      });
    },

    async submitForm() {
      try {
        await this.$axios.post(
          `${this.baseUrl}/finance/general_journal_voucher_add`,
          {
            ...this.form,
            tgl_transaksi: this.form.tgl_transaksi,
          },
          this.tokenHeaders
        );

        this.$swal.fire({
          icon: "success",
          title: "Header berhasil disimpan",
          timer: 1200,
          showConfirmButton: false,
        });
      } catch {
        this.$swal.fire("Error", "Gagal menyimpan header", "error");
      }
    },

    async saveItem(item, index) {
      if (!item.akun_id || item.debit > 0 && item.credit > 0) {
        this.$swal.fire("Validasi", "Akun & salah satu nilai wajib diisi", "warning");
        return;
      }

      try {
        const res = await this.$axios.post(
          `${this.baseUrl}/finance/general_journal_voucher_detail_add`,
          {
            id: item.id || null,
            header_id: this.form.id,
            akun_id: item.akun_id,
            debit: item.debit,
            credit: item.credit,
            balance: item.debit - item.credit,
          },
          this.tokenHeaders
        );

        if (!item.id && res.data?.id) this.items[index].id = res.data.id;

        this.$swal.fire({
          icon: "success",
          title: item.id ? "Update berhasil" : "Simpan berhasil",
          timer: 1000,
          showConfirmButton: false,
        });
      } catch {
        this.$swal.fire("Error", "Gagal menyimpan detail", "error");
      }
    },

    async deleteItem(id, index) {
      const ok = await this.$swal.fire({
        title: "Hapus akun?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Hapus",
        cancelButtonText: "Batal",
      });

      if (!ok.isConfirmed) return;

      await this.$axios.post(
        `${this.baseUrl}/finance/general_journal_voucher_detail_delete`,
        { id },
        this.tokenHeaders
      );

      this.items.splice(index, 1);

      this.$swal.fire({
        icon: "success",
        title: "Dihapus",
        timer: 1000,
        showConfirmButton: false,
      });
    },

    async initData() {
      if (!this.form.id) {
        this.addItem();
        return;
      }

      const res = await axios.get(
        `${this.baseUrl}/finance/general_journal_voucher_show/${this.form.id}`,
        this.tokenHeaders
      );

      const d = res.data;
      Object.assign(this.form, d.header);

      this.items = d.detail.map((x) => ({
        id: x.id,
        akun_id: x.akun_id,
        debit: Number(x.debit),
        debit_view: String(x.debit),
        credit: Number(x.credit),
        credit_view: String(x.credit),
      }));
    },

    async loadAkun() {
      const r = await axios.get(`${this.baseUrl}/master/akun_combo`, this.tokenHeaders);
      this.akunList = r.data || [];
    },

    scanItem(item) {
      this.selectedScanItem = item;
      this.rfidValue = "";
      this.scannedRfids = [];

      if (!this.rfidTable) {
        this.$nextTick(async () => {
          this.rfidTable = $("#tableRfid").DataTable({
            paging: false,
            searching: false,
            info: false,
            ordering: false,
            columnDefs: [{ targets: "_all", className: "text-center" }],
          });

          // DELETE RFID
          $("#tableRfid").on("click", ".btn-del", async (e) => {
            const row = this.rfidTable.row($(e.target).closest("tr"));
            const rfid = row.data()[1];

            const ok = await this.$swal.fire({
              title: "Hapus RFID?",
              text: rfid,
              icon: "warning",
              showCancelButton: true,
              confirmButtonText: "Hapus",
              cancelButtonText: "Batal",
            });

            if (!ok.isConfirmed) return;

            await axios.post(
              `${this.baseUrl}/finance/general_journal_voucher_rfid_delete`,
              { rfid },
              this.tokenHeaders
            );

            this.scannedRfids = this.scannedRfids.filter((x) => x !== rfid);
            row.remove().draw();

            // re-number
            this.rfidTable.rows().every(function (i) {
              const d = this.data();
              d[0] = i + 1;
              this.data(d);
            });
          });

          // 🔥 LOAD RFID DARI API
          await this.loadRfidFromApi();
        });
      } else {
        this.rfidTable.clear().draw();
        this.loadRfidFromApi();
      }

      const modalEl = document.getElementById("modalScanRfid");
      const modal = new bootstrap.Modal(modalEl);

      modalEl.addEventListener(
        "hidden.bs.modal",
        () => {
          this.initData(); // ✅ sesuai permintaan
        },
        { once: true } // ❗ wajib supaya tidak dobel
      );

      modalEl.addEventListener(
        "shown.bs.modal",
        () => {
          this.$refs.rfidInput?.focus();
        },
        { once: true }
      );

      modal.show();
    },

    async submitRfid() {
      const rfid = this.rfidValue?.trim();
      if (!rfid) return;

      // 🔔 CEK DUPLIKAT DI MODAL
      if (this.scannedRfids.includes(rfid)) {
        this.$swal.fire({
          icon: "warning",
          title: "RFID sudah ada",
          text: `RFID ${rfid} sudah pernah discan`,
          timer: 1500,
          showConfirmButton: false,
        });

        this.rfidValue = "";
        this.$refs.rfidInput?.focus();
        return;
      }

      try {
        // ================= SIMPAN KE API RFID =================
        await axios.post(
          `${this.baseUrl}/finance/general_journal_voucher_rfid_add`,
          {
            header_id: this.form.id,
            akun_id: this.selectedScanItem.akun_id, // ⬅️ penting
            rfid: rfid,
          },
          this.tokenHeaders
        );

        // ================= JIKA BERHASIL =================
        this.scannedRfids.push(rfid);

        this.rfidTable.row
          .add([
            this.scannedRfids.length,
            rfid,
            `<button class="btn btn-sm btn-danger btn-del">
          <i class="bi bi-trash"></i>
        </button>`,
          ])
          .draw(false);

        this.rfidValue = "";
        this.$refs.rfidInput?.focus();
      } catch (err) {
        // ================= JIKA GAGAL (RFID SUDAH ADA DI DB) =================
        const msg = err.response?.data?.message || "Gagal menyimpan RFID";

        this.$swal.fire({
          icon: "error",
          title: "Gagal",
          text: msg,
        });

        this.rfidValue = "";
        this.$refs.rfidInput?.focus();
      }
    },

    async loadRfidFromApi() {
      if (!this.form.id || !this.selectedScanItem?.akun_id) return;

      try {
        const res = await axios.post(
          `${this.baseUrl}/finance/general_journal_voucher_rfid_show`,
          {
            header_id: this.form.id,
            akun_id: this.selectedScanItem.akun_id,
          },
          this.tokenHeaders
        );

        const data = res.data || [];

        // reset
        this.scannedRfids = [];
        this.rfidTable.clear();

        data.forEach((x, i) => {
          const rfid = x.rfid ?? x; // support object / string

          this.scannedRfids.push(rfid);

          this.rfidTable.row.add([
            i + 1,
            rfid,
            `<button class="btn btn-sm btn-danger btn-del">
          <i class="bi bi-trash"></i>
        </button>`,
          ]);
        });

        this.rfidTable.draw(false);
      } catch (err) {
        this.$swal.fire(
          "Error",
          err.response?.data?.message || "Gagal mengambil data RFID",
          "error"
        );
      }
    },
  },
};
</script>

<style scoped src="@/apps/finance/generaljournalvoucherdetail.css"></style>
