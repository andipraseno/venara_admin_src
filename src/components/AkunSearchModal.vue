<template>
  <div class="modal fade" tabindex="-1" aria-hidden="true" ref="modal">
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content rounded-4">
        <div class="modal-header">
          <h5 class="modal-title"><i class="bi bi-search me-1"></i> Cari Akun</h5>
          <button type="button" class="btn-close" @click="hide"></button>
        </div>

        <div class="modal-body">
          <!-- SEARCH -->
          <div class="mb-3">
            <input
              type="text"
              class="form-control"
              placeholder="Cari kode / nama akun..."
              v-model="search"
            />
          </div>

          <!-- TABLE -->
          <div class="table-responsive">
            <table class="table table-sm table-hover align-middle">
              <thead class="table-light">
                <tr>
                  <th style="width: 80px">Aksi</th>
                  <th>Kode</th>
                  <th>Nama Akun</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="a in filteredAkun" :key="a.id">
                  <td>
                    <button class="btn btn-sm btn-primary" @click="selectAkun(a)">Pilih</button>
                  </td>
                  <td>{{ a.kode }}</td>
                  <td>{{ a.nama }}</td>
                </tr>

                <tr v-if="filteredAkun.length === 0">
                  <td colspan="3" class="text-center text-muted">Data tidak ditemukan</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="hide">Tutup</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as bootstrap from "bootstrap";

export default {
  name: "AkunSearchModal",

  props: {
    akunList: {
      type: Array,
      required: true,
    },
  },

  data() {
    return {
      modalInstance: null,
      search: "",
    };
  },

  computed: {
    filteredAkun() {
      if (!this.search) return this.akunList;

      const s = this.search.toLowerCase();
      return this.akunList.filter(
        (a) => a.kode?.toLowerCase().includes(s) || a.nama?.toLowerCase().includes(s)
      );
    },
  },

  mounted() {
    this.modalInstance = new bootstrap.Modal(this.$refs.modal);
  },

  methods: {
    show() {
      this.search = "";
      this.modalInstance.show();
    },

    hide() {
      this.modalInstance.hide();
    },

    selectAkun(akun) {
      this.$emit("select", akun);
      this.hide();
    },
  },
};
</script>
