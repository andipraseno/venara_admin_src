<template>
  <div class="container-fluid" v-cloak>
    <!-- Header -->
    <div class="mb-4">
      <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div>
          <h3 class="mb-1 fw-bold">
            <i class="bi bi-calendar-week"></i>
            SCAN TICKET
          </h3>

          <nav aria-label="breadcrumb">
            <ol class="breadcrumb mb-0 small">
              <li class="breadcrumb-item">
                <a href="#">Jadwal</a>
              </li>
              <li class="breadcrumb-item active" aria-current="page">Scan Ticket</li>
            </ol>
          </nav>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-primary" v-if="!isScanning" @click="prepareScanner">
            <i class="bi bi-play-fill me-1"></i>Mulai
          </button>
          <button class="btn btn-outline-danger" v-else @click="stopScanner">
            <i class="bi bi-stop-fill me-1"></i>Stop
          </button>
          <button class="btn btn-outline-secondary" @click="resetState">
            <i class="bi bi-arrow-counterclockwise me-1"></i>Reset
          </button>
        </div>
      </div>
    </div>

    <!-- Panel Scanner -->
    <div class="card border-0 shadow-sm rounded-3 overflow-hidden">
      <div class="card-header bg-gradient-scan text-white">
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-qr-code-scan fs-5"></i>
            <span class="fw-semibold">Pemindaian</span>
            <span
              class="badge rounded-pill"
              :class="isScanning ? 'text-bg-success' : 'text-bg-secondary'"
            >
              {{ isScanning ? "Aktif" : "Nonaktif" }}
            </span>
          </div>

          <!-- Controls -->
          <div class="d-flex align-items-center gap-2">
            <div class="btn-group" role="group" aria-label="Kamera">
              <button
                v-for="(camera, idx) in cameras"
                :key="camera.deviceId || idx"
                class="btn btn-sm"
                :class="idx === selectedCamera ? 'btn-primary' : 'btn-outline-primary'"
                @click="switchTo(idx)"
                :disabled="isSwitching"
                :title="camera.label || 'Camera ' + (idx + 1)"
              >
                <i class="bi bi-camera-video"></i>
                <span class="d-none d-sm-inline ms-1">{{ idx + 1 }}</span>
              </button>
            </div>

            <button
              class="btn btn-sm"
              :class="torchOn ? 'btn-warning' : 'btn-outline-warning'"
              @click="toggleTorch"
              :disabled="!torchSupported || !isScanning"
              :title="torchSupported ? 'Senter' : 'Senter tidak didukung'"
            >
              <i class="bi" :class="torchOn ? 'bi-lightbulb-fill' : 'bi-lightbulb'"></i>
              <span class="d-none d-sm-inline ms-1">Senter</span>
            </button>

            <button
              class="btn btn-sm btn-outline-dark"
              @click="flipPreview"
              :disabled="!isScanning"
              title="Mirror pratinjau (front camera)"
            >
              <i class="bi bi-arrows-collapse"></i>
              <span class="d-none d-sm-inline ms-1">Mirror</span>
            </button>
          </div>
        </div>
      </div>

      <div class="card-body">
        <!-- Area video -->
        <div class="scanner-container mb-3" :class="{ mirror: isMirrored }">
          <video id="preview" playsinline muted></video>

          <!-- Overlay -->
          <div class="scan-frame">
            <div class="corner tl"></div>
            <div class="corner tr"></div>
            <div class="corner bl"></div>
            <div class="corner br"></div>
            <div class="scan-laser" v-if="isScanning"></div>
          </div>

          <!-- Hint -->
          <div class="scan-hint small">
            Arahkan QR ke kotak — jarak ±20–30 cm.
            <span v-if="!isHttps">Gunakan HTTPS agar kamera bisa diakses.</span>
          </div>
        </div>

        <!-- Info status -->
        <div class="d-flex flex-wrap gap-2 align-items-center">
          <span class="badge text-bg-info"
            ><i class="bi bi-info-circle me-1"></i>{{ statusText }}</span
          >
          <span v-if="errorMessage" class="badge text-bg-danger">
            <i class="bi bi-exclamation-triangle me-1"></i>{{ errorMessage }}
          </span>
        </div>
      </div>
    </div>

    <!-- Hasil -->
    <div class="row g-3 mt-3">
      <div class="col-12 col-lg-7">
        <div class="card border-0 shadow-sm rounded-3">
          <div class="card-header bg-light fw-semibold">Hasil Pemindaian</div>
          <div class="card-body">
            <div v-if="!scannedResult" class="text-muted text-center py-3">
              <i class="bi bi-qr-code display-5 d-block mb-2"></i>
              Belum ada QR yang dipindai.
            </div>

            <div v-else>
              <div class="mb-3">
                <div class="small text-muted">Payload</div>
                <div class="p-2 bg-body-tertiary rounded border">{{ scannedResult }}</div>
              </div>

              <div v-if="loadingTicket" class="text-center py-3">
                <div class="spinner-border" role="status" aria-hidden="true"></div>
                <div class="mt-2 small text-muted">Mengambil data ticket…</div>
              </div>

              <div v-else>
                <div v-if="success" class="alert alert-success d-flex align-items-start">
                  <i class="bi bi-check-circle-fill me-2"></i>
                  <div>
                    <div class="fw-semibold">Valid</div>
                    <div>{{ message }}</div>
                  </div>
                </div>

                <div v-else class="alert alert-danger d-flex align-items-start">
                  <i class="bi bi-x-octagon-fill me-2"></i>
                  <div>
                    <div class="fw-semibold">Tidak Valid</div>
                    <div>{{ message || "Ticket tidak ditemukan/expired." }}</div>
                  </div>
                </div>

                <!-- Detail ticket -->
                <div v-if="success" class="row g-3">
                  <div class="col-12 col-md-6">
                    <div class="card h-100 border-0 shadow-xs">
                      <div class="card-body">
                        <div class="text-muted small mb-1">Lapangan</div>
                        <div class="fw-semibold mb-2">{{ lapangan_nama || "-" }}</div>

                        <div class="text-muted small mb-1">Tanggal</div>
                        <div class="fw-semibold mb-2">{{ tanggal || "-" }}</div>

                        <div class="text-muted small mb-1">Sesi</div>
                        <div class="fw-semibold">
                          {{ session_list || "-" }}
                          <span class="badge text-bg-primary ms-1">{{ total_sesi }} jam</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="col-12 col-md-6">
                    <div class="card h-100 border-0 shadow-xs">
                      <div class="card-body">
                        <div class="text-muted small mb-1">Pemesan</div>
                        <div class="fw-semibold">{{ nama || "-" }}</div>

                        <div class="text-muted small mb-1">Kontak</div>
                        <div class="d-flex align-items-center flex-wrap gap-2">
                          <span class="text-muted">{{ handphone || "-" }}</span>
                          <div class="vr d-none d-sm-block"></div>
                          <a
                            v-if="handphone"
                            :href="`tel:${cleanPhone(handphone)}`"
                            class="btn btn-sm btn-outline-secondary"
                          >
                            <i class="bi bi-telephone"></i>
                          </a>
                          <a
                            v-if="handphone"
                            :href="`https://wa.me/${waPhone(handphone)}`"
                            target="_blank"
                            rel="noopener"
                            class="btn btn-sm btn-outline-success"
                          >
                            <i class="bi bi-whatsapp"></i>
                          </a>
                          <button
                            v-if="handphone"
                            class="btn btn-sm btn-outline-dark"
                            @click="copyPhone(handphone)"
                          >
                            <i class="bi bi-clipboard"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- /detail -->
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tips & Keamanan -->
      <div class="col-12 col-lg-5">
        <div class="card border-0 shadow-sm rounded-3">
          <div class="card-header bg-light fw-semibold">Tips Pemindaian</div>
          <div class="card-body small text-muted">
            <ul class="mb-0 ps-3">
              <li>Pastikan pencahayaan cukup atau aktifkan <strong>Senter</strong>.</li>
              <li>Stabilkan perangkat selama 1–2 detik.</li>
              <li>Jika ada beberapa kamera, coba kamera belakang.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <!-- /row -->
  </div>
</template>

<script>
import { nextTick } from "vue";
import axios from "axios";
import toastr from "toastr";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";

export default {
  name: "ScanTicket",

  data() {
    return {
      // scanner state
      isScanning: false,
      isSwitching: false,
      isMirrored: false,
      showScanner: false,

      scannedResult: "",
      loadingTicket: false,
      errorMessage: "",
      statusText: "Siap untuk memindai.",

      codeReader: null,
      cameras: [],
      selectedCamera: 0,
      activeStream: null,

      torchOn: false,
      torchSupported: false,

      // hasil ticket
      success: false,
      message: "",
      nama: "",
      handphone: "",
      lapangan_nama: "",
      tanggal: "",
      session_list: "",
      total_sesi: 0,

      // zxing controls
      controlsRef: null,
    };
  },

  computed: {
    isHttps() {
      return typeof window !== "undefined" && window.location?.protocol === "https:";
    },
  },

  methods: {
    async listCameras() {
      try {
        const devices = await this.codeReader.listVideoInputDevices();
        this.cameras = devices || [];
        if (!this.cameras.length) {
          this.errorMessage = "Tidak ada kamera ditemukan";
          toastr.warning(this.errorMessage);
        }
      } catch (err) {
        this.errorMessage = "Gagal mendapatkan kamera: " + (err?.message || err);
        toastr.error(this.errorMessage);
      }
    },

    resetState() {
      this.scannedResult = "";
      this.loadingTicket = false;
      this.errorMessage = "";
      this.statusText = "Siap untuk memindai.";
      this.success = false;
      this.message = "";
      this.nama = "";
      this.handphone = "";
      this.lapangan_nama = "";
      this.tanggal = "";
      this.session_list = "";
      this.total_sesi = 0;
      this.torchOn = false;
    },

    prepareScanner() {
      this.showScanner = true;
      // beri waktu agar <video> ter-render lalu mulai
      nextTick(() => setTimeout(() => this.startScanner(), 200));
    },

    formatTanggal(tanggalString) {
      const hari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
      const d = new Date(tanggalString);
      if (isNaN(d)) return tanggalString;
      const hariText = hari[d.getDay()];
      const tgl = String(d.getDate()).padStart(2, "0");
      const bln = String(d.getMonth() + 1).padStart(2, "0");
      const thn = d.getFullYear();
      return `${hariText}, ${tgl}/${bln}/${thn}`;
    },

    async startScanner() {
      const el = document.getElementById("preview");
      if (!el) {
        this.errorMessage = "Elemen video tidak ditemukan.";
        toastr.error(this.errorMessage);
        return;
      }

      // reset state
      this.resetState();
      this.isScanning = true;
      this.statusText = "Meminta izin kamera…";

      try {
        const deviceId =
          this.cameras?.[this.selectedCamera]?.deviceId !== undefined
            ? this.cameras[this.selectedCamera].deviceId
            : undefined;

        // stop previous tracks
        this.stopTracksOnly();

        this.codeReader.decodeFromVideoDevice(
          deviceId,
          "preview",
          async (result, error, controls) => {
            // simpan controls
            if (controls && !this.controlsRef) this.controlsRef = controls;
            this.updateTorchSupport();

            if (result) {
              // haptic feedback
              if (navigator.vibrate) navigator.vibrate(60);

              this.scannedResult = result.text;
              this.statusText = "QR terbaca. Mengambil data…";
              this.loadingTicket = true;

              const rootUrl = import.meta.env.VITE_API_APPS;
              const url = rootUrl + "/jadwal/scan_ticket/" + encodeURIComponent(this.scannedResult);
              const token = {
                headers: { Token: "Bearer " + localStorage.getItem("actasysToken") },
              };

              try {
                const response = await axios.get(url, token);
                const hasil = response.data || {};
                this.success = !!hasil.success;
                this.message = hasil.message || "";

                if (hasil.data) {
                  const data = hasil.data;
                  this.nama = data.nama || "";
                  this.handphone = data.handphone || "";
                  this.lapangan_nama = data.lapangan_nama || "";
                  this.tanggal = data.tanggal ? this.formatTanggal(data.tanggal) : "";
                  this.session_list = data.session_list || "";
                  this.total_sesi = data.total_sesi || 0;
                }
              } catch (e) {
                toastr.error("Terjadi kesalahan saat mengambil data QR");
              } finally {
                this.loadingTicket = false;
                // stop setelah satu hasil
                this.stopScanner();
                this.statusText = "Selesai memindai.";
              }
              return;
            }

            if (error && !(error instanceof NotFoundException)) {
              this.errorMessage = error.message || "Kesalahan tidak diketahui saat memindai QR";
              this.statusText = "Gagal membaca. Coba lagi.";
            }
          }
        );

        // set activeStream (kalau sudah ada)
        this.activeStream = el?.srcObject || null;
        this.statusText = "Arahkan QR ke kotak.";
        toastr.info("Scanner aktif");
      } catch (err) {
        this.errorMessage = "Gagal memulai scanner: " + (err?.message || err);
        toastr.error(this.errorMessage);
        this.isScanning = false;
      }
    },

    stopTracksOnly() {
      if (this.activeStream) {
        try {
          this.activeStream.getTracks().forEach((t) => t.stop());
        } catch (_) {}
        this.activeStream = null;
      }
      const video = document.getElementById("preview");
      if (video) {
        try {
          video.srcObject = null;
        } catch (_) {}
      }
    },

    stopScanner() {
      this.isScanning = false;
      try {
        this.codeReader?.reset();
      } catch (_) {}
      this.stopTracksOnly();
      this.torchOn = false;
      this.controlsRef = null;
    },

    async switchTo(idx) {
      if (idx === this.selectedCamera) return;
      this.isSwitching = true;
      this.selectedCamera = idx;
      try {
        if (this.isScanning) {
          await nextTick();
          this.startScanner();
        }
      } finally {
        this.isSwitching = false;
      }
    },

    changeCamera() {
      // helper kompatibilitas
      this.switchTo(this.selectedCamera);
    },

    flipPreview() {
      this.isMirrored = !this.isMirrored;
    },

    updateTorchSupport() {
      try {
        const video = document.getElementById("preview");
        const track = video?.srcObject?.getVideoTracks?.()[0];
        const caps = track?.getCapabilities?.();
        this.torchSupported = !!caps && "torch" in caps;
      } catch {
        this.torchSupported = false;
      }
    },

    async toggleTorch() {
      try {
        const video = document.getElementById("preview");
        const track = video?.srcObject?.getVideoTracks?.()[0];
        if (!track || !track.getCapabilities) return;
        const caps = track.getCapabilities();
        if (!("torch" in caps)) {
          this.torchSupported = false;
          return;
        }
        await track.applyConstraints({ advanced: [{ torch: !this.torchOn }] });
        this.torchOn = !this.torchOn;
      } catch (e) {
        this.torchSupported = false;
        toastr.info("Senter tidak didukung oleh kamera ini.");
      }
    },

    /* ---------- kontak utils ---------- */
    cleanPhone(p) {
      return String(p || "").replace(/[^\d]/g, "");
    },
    waPhone(p) {
      const d = this.cleanPhone(p);
      if (d.startsWith("0")) return "62" + d.slice(1);
      return d;
    },
    async copyPhone(p) {
      try {
        await navigator.clipboard.writeText(this.cleanPhone(p));
        toastr.success("Nomor tersalin");
      } catch {
        toastr.info("Gagal menyalin nomor");
      }
    },
  },

  mounted() {
    this.codeReader = new BrowserMultiFormatReader();
    this.listCameras();
  },

  beforeUnmount() {
    this.stopScanner();
  },
};
</script>

<style scoped src="@/apps/jadwal/ScanTicket.css"></style>
