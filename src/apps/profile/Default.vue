<template>
  <div class="container py-4" v-cloak>
    <div class="card shadow-lg border-0 rounded-4 overflow-hidden">
      <!-- HEADER -->
      <div
        class="p-4 bg-gradient-brand text-white d-flex align-items-center justify-content-between flex-wrap gap-2"
      >
        <div>
          <h4 class="mb-1 fw-semibold">
            <i class="bi bi-buildings"></i>
            Default
          </h4>

          <div class="small text-white-50">Pengaturan default periode dan akun transaksi</div>
        </div>
      </div>

      <!-- BODY -->
      <div class="card-body p-4">
        <div class="row g-4">
          <!-- FORM -->
          <div class="col-12 col-lg-7">
            <form @submit.prevent="submitDefault" novalidate>
              <div class="row g-3 mb-3">
                <!-- Periode Bulan -->
                <div class="col-md-6">
                  <div class="form-floating">
                    <input
                      type="number"
                      min="1"
                      max="12"
                      class="form-control"
                      v-model.number="prefs.periode_bulan"
                      placeholder="Periode Bulan"
                    />
                    <label>Periode Bulan</label>
                  </div>
                </div>

                <!-- Periode Tahun -->
                <div class="col-md-6">
                  <div class="form-floating">
                    <input
                      type="number"
                      class="form-control"
                      v-model.number="prefs.periode_tahun"
                      placeholder="Periode Tahun"
                    />
                    <label>Periode Tahun</label>
                  </div>
                </div>

                <!-- Akun Persediaan -->
                <div class="col-md-12">
                  <label class="form-label fw-semibold"> Default Akun Persediaan </label>

                  <div class="input-group">
                    <input
                      type="text"
                      class="form-control"
                      placeholder="Pilih akun persediaan"
                      :value="akunNama(prefs.akun_persediaan_id)"
                      readonly
                    />

                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      @click="openAkunModal('persediaan')"
                    >
                      <i class="bi bi-search"></i>
                    </button>
                  </div>
                </div>

                <!-- Akun PPN Keluaran -->
                <div class="col-md-12">
                  <label class="form-label fw-semibold"> Default Akun PPN Keluaran </label>

                  <div class="input-group">
                    <input
                      type="text"
                      class="form-control"
                      placeholder="Pilih akun ppn_keluaran"
                      :value="akunNama(prefs.akun_ppn_keluaran_id)"
                      readonly
                    />

                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      @click="openAkunModal('ppn_keluaran')"
                    >
                      <i class="bi bi-search"></i>
                    </button>
                  </div>
                </div>

                <!-- Akun Hutang Usaha -->
                <div class="col-md-12">
                  <label class="form-label fw-semibold"> Default Akun Hutang Usaha </label>

                  <div class="input-group">
                    <input
                      type="text"
                      class="form-control"
                      placeholder="Pilih akun hutang_usaha"
                      :value="akunNama(prefs.akun_hutang_usaha_id)"
                      readonly
                    />

                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      @click="openAkunModal('hutang_usaha')"
                    >
                      <i class="bi bi-search"></i>
                    </button>
                  </div>
                </div>

                <!-- Akun HPP -->
                <div class="col-md-12">
                  <label class="form-label fw-semibold"> Default Akun HPP </label>

                  <div class="input-group">
                    <input
                      type="text"
                      class="form-control"
                      placeholder="Pilih akun hpp"
                      :value="akunNama(prefs.akun_hpp_id)"
                      readonly
                    />

                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      @click="openAkunModal('hpp')"
                    >
                      <i class="bi bi-search"></i>
                    </button>
                  </div>
                </div>

                <!-- Akun Penjualan -->
                <div class="col-md-12">
                  <label class="form-label fw-semibold"> Default Akun Penjualan </label>

                  <div class="input-group">
                    <input
                      type="text"
                      class="form-control"
                      placeholder="Pilih akun penjualan"
                      :value="akunNama(prefs.akun_penjualan_id)"
                      readonly
                    />

                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      @click="openAkunModal('penjualan')"
                    >
                      <i class="bi bi-search"></i>
                    </button>
                  </div>
                </div>

                <!-- Akun Retur Penjualan -->
                <div class="col-md-12">
                  <label class="form-label fw-semibold"> Default Akun Retur Penjualan </label>

                  <div class="input-group">
                    <input
                      type="text"
                      class="form-control"
                      placeholder="Pilih Akun Retur Penjualan"
                      :value="akunNama(prefs.akun_retur_penjualan_id)"
                      readonly
                    />

                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      @click="openAkunModal('retur_penjualan')"
                    >
                      <i class="bi bi-search"></i>
                    </button>
                  </div>
                </div>

                <!-- Akun PPN Masukan -->
                <div class="col-md-12">
                  <label class="form-label fw-semibold"> Default Akun PPN Masukan </label>

                  <div class="input-group">
                    <input
                      type="text"
                      class="form-control"
                      placeholder="Pilih Akun PPN Masukan"
                      :value="akunNama(prefs.akun_ppn_masukan_id)"
                      readonly
                    />

                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      @click="openAkunModal('ppn_masukan')"
                    >
                      <i class="bi bi-search"></i>
                    </button>
                  </div>
                </div>

                <!-- Akun Piutang Usaha -->
                <div class="col-md-12">
                  <label class="form-label fw-semibold"> Default Akun Piutang Usaha </label>

                  <div class="input-group">
                    <input
                      type="text"
                      class="form-control"
                      placeholder="Pilih Akun Piutang Usaha"
                      :value="akunNama(prefs.akun_piutang_usaha_id)"
                      readonly
                    />

                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      @click="openAkunModal('piutang_usaha')"
                    >
                      <i class="bi bi-search"></i>
                    </button>
                  </div>
                </div>

                <!-- Akun Kas -->
                <div class="col-md-12">
                  <label class="form-label fw-semibold"> Default Akun Kas </label>

                  <div class="input-group">
                    <input
                      type="text"
                      class="form-control"
                      placeholder="Pilih Akun Kas"
                      :value="akunNama(prefs.akun_kas_id)"
                      readonly
                    />

                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      @click="openAkunModal('kas')"
                    >
                      <i class="bi bi-search"></i>
                    </button>
                  </div>
                </div>

                <!-- Akun Bank -->
                <div class="col-md-12">
                  <label class="form-label fw-semibold"> Default Akun Bank </label>

                  <div class="input-group">
                    <input
                      type="text"
                      class="form-control"
                      placeholder="Pilih Akun Bank"
                      :value="akunNama(prefs.akun_bank_id)"
                      readonly
                    />

                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      @click="openAkunModal('bank')"
                    >
                      <i class="bi bi-search"></i>
                    </button>
                  </div>
                </div>
              </div>

              <button type="submit" class="btn btn-dark px-4" :disabled="loading">
                <span v-if="!loading"> <i class="bi bi-floppy me-1"></i> Simpan </span>
                <span v-else>
                  <span class="spinner-border spinner-border-sm me-2"></span>
                  Loading…
                </span>
              </button>
            </form>
          </div>

          <!-- INFO -->
          <div class="col-12 col-lg-5">
            <div class="card border-0 shadow-sm rounded-3">
              <div class="card-body">
                <h6 class="fw-semibold mb-3"><i class="bi bi-info-circle me-1"></i> Ringkasan</h6>

                <ul class="list-unstyled small mb-0">
                  <li class="mb-2">
                    <strong>Periode:</strong>
                    {{ prefs.periode_bulan }}/{{ prefs.periode_tahun }}
                  </li>

                  <li class="mb-2">
                    <strong>Akun Persediaan:</strong>
                    {{ akunNama(prefs.akun_persediaan_id) || "-" }}
                  </li>

                  <li class="mb-2">
                    <strong>Akun PPN Keluaran:</strong>
                    {{ akunNama(prefs.akun_ppn_keluaran_id) || "-" }}
                  </li>

                  <li class="mb-2">
                    <strong>Akun Hutang Usaha:</strong>
                    {{ akunNama(prefs.akun_hutang_usaha_id) || "-" }}
                  </li>

                  <li class="mb-2">
                    <strong>Akun HPP:</strong>
                    {{ akunNama(prefs.akun_hpp_id) || "-" }}
                  </li>

                  <li class="mb-2">
                    <strong>Akun Penjualan:</strong>
                    {{ akunNama(prefs.akun_penjualan_id) || "-" }}
                  </li>

                  <li class="mb-2">
                    <strong>Akun Retur:</strong>
                    {{ akunNama(prefs.akun_retur_penjualan_id) || "-" }}
                  </li>

                  <li class="mb-2">
                    <strong>Akun PPN Masukan:</strong>
                    {{ akunNama(prefs.akun_ppn_masukan_id) || "-" }}
                  </li>

                  <li class="mb-2">
                    <strong>Akun Piutang Usaha:</strong>
                    {{ akunNama(prefs.akun_piutang_usaha_id) || "-" }}
                  </li>

                  <li class="mb-2">
                    <strong>Akun Kas:</strong>
                    {{ akunNama(prefs.akun_kas_id) || "-" }}
                  </li>

                  <li class="mb-2">
                    <strong>Akun Bank:</strong>
                    {{ akunNama(prefs.akun_bank_id) || "-" }}
                  </li>
                </ul>
              </div>
            </div>

            <div class="alert alert-info mt-3 small mb-0">
              <i class="bi bi-info-circle-fill me-2"></i>
              Default ini akan digunakan sebagai default saat transaksi dibuat.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL AKUN -->
    <AkunSearchModal ref="akunModal" :akunList="akunList" @select="onSelectAkun" />
  </div>
</template>

<script>
import axios from "axios";
import Swal from "sweetalert2";
import { useAuthStore } from "@/stores/auth";
import AkunSearchModal from "@/components/AkunSearchModal.vue";

export default {
  name: "Default",

  components: {
    AkunSearchModal,
  },

  data() {
    return {
      baseUrl: import.meta.env.VITE_API_ACTASYS,
      token: "",
      headers: "",
      loading: false,

      akunTarget: "",

      prefs: {
        periode_bulan: new Date().getMonth() + 1,
        periode_tahun: new Date().getFullYear(),
        akun_persediaan_id: "",
        akun_ppn_keluaran_id: "",
        akun_hutang_usaha_id: "",
        akun_hpp_id: "",
        akun_penjualan_id: "",
        akun_retur_penjualan_id: "",
        akun_ppn_masukan_id: "",
        akun_piutang_usaha_id: "",
        akun_kas_id: "",
        akun_bank_id: "",
      },

      akunList: [],
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
    this.headers = { headers: { Token: "Bearer " + this.token } };

    this.loadAkun();
    this.loadDefault();
  },

  methods: {
    async loadAkun() {
      const res = await axios.get(`${this.baseUrl}/master/akun_combo`, this.headers);
      this.akunList = res.data || [];
    },

    async loadDefault() {
      const res = await axios.get(`${this.baseUrl}/profile/default`, this.headers);
      if (res.data) Object.assign(this.prefs, res.data);
    },

    // 🔴 KODE SUDAH DIHILANGKAN
    akunNama(id) {
      const a = this.akunList.find((x) => x.id === id);
      return a ? a.nama : "";
    },

    openAkunModal(target) {
      this.akunTarget = target;
      this.$refs.akunModal.show();
    },

    onSelectAkun(akun) {
      if (this.akunTarget === "persediaan") {
        this.prefs.akun_persediaan_id = akun.id;
      }

      if (this.akunTarget === "ppn_keluaran") {
        this.prefs.akun_ppn_keluaran_id = akun.id;
      }

      if (this.akunTarget === "hutang_usaha") {
        this.prefs.akun_hutang_usaha_id = akun.id;
      }

      if (this.akunTarget === "hpp") {
        this.prefs.akun_hpp_id = akun.id;
      }

      if (this.akunTarget === "penjualan") {
        this.prefs.akun_penjualan_id = akun.id;
      }

      if (this.akunTarget === "retur_penjualan") {
        this.prefs.akun_retur_penjualan_id = akun.id;
      }

      if (this.akunTarget === "ppn_masukan") {
        this.prefs.akun_ppn_masukan_id = akun.id;
      }

      if (this.akunTarget === "piutang_usaha") {
        this.prefs.akun_piutang_usaha_id = akun.id;
      }

      if (this.akunTarget === "kas") {
        this.prefs.akun_kas_id = akun.id;
      }

      if (this.akunTarget === "bank") {
        this.prefs.akun_bank_id = akun.id;
      }
    },

    async submitDefault() {
      const confirm = await Swal.fire({
        title: "Simpan data?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Ya, simpan",
        cancelButtonText: "Batal",
      });
      if (!confirm.isConfirmed) return;

      this.loading = true;
      try {
        await axios.post(`${this.baseUrl}/profile/default_add`, this.prefs, this.headers);
        Swal.fire("Berhasil", "Default disimpan", "success");
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped src="@/apps/profile/Default.css"></style>
