// src/stores/auth.js
import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    software: {}, // data software
    profile: {}, // data profile
    login: null, // hasil login: token, tab, module, dll
  }),

  actions: {
    setSoftware(payload) {
      this.software = payload || {};
    },
    setProfile(payload) {
      this.profile = payload || {};
    },
    setLogin(payload) {
      this.login = payload || null;
    },
    logout() {
      this.software = {};
      this.profile = {};
      this.login = null;
    },
  },

  // 🔒 simpan otomatis ke localStorage
  persist: {
    key: "actasys-auth",
    storage: window.localStorage,
  },
});
