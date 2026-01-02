<template>
  <div
    class="card shadow position-absolute datepicker-pop"
    :style="popStyle"
    ref="pop"
    tabindex="0"
    @keydown.esc.stop.prevent="emitClose"
  >
    <!-- Header -->
    <div class="d-flex align-items-center justify-content-between p-2 border-bottom">
      <button class="btn btn-sm btn-light" @click="prevMonth" type="button" aria-label="Prev month">
        ‹
      </button>
      <div class="fw-medium">{{ monthName(displayMonth) }} {{ displayYear }}</div>
      <button class="btn btn-sm btn-light" @click="nextMonth" type="button" aria-label="Next month">
        ›
      </button>
    </div>

    <!-- Weekdays -->
    <div class="px-2 pt-2 d-grid" style="grid-template-columns: repeat(7, 1fr); gap: 4px">
      <small v-for="d in weekdays" :key="d" class="text-muted text-center">{{ d }}</small>
    </div>

    <!-- Days -->
    <div class="p-2 d-grid" style="grid-template-columns: repeat(7, 1fr); gap: 4px">
      <button
        v-for="(cell, idx) in gridDays"
        :key="idx"
        type="button"
        class="btn btn-sm"
        :class="btnClass(cell)"
        @click="pick(cell)"
        :disabled="!cell.inMonth"
      >
        {{ cell.date.getDate() }}
      </button>
    </div>

    <div class="d-flex justify-content-between align-items-center px-2 pb-2">
      <button class="btn btn-link btn-sm" type="button" @click="goToday">Hari ini</button>
      <button class="btn btn-outline-secondary btn-sm" type="button" @click="emitClose">
        Tutup
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "DatepickerPop",

  props: {
    modelValue: { type: String, default: "" },
    placement: { type: String, default: "bottom-start" }, // disimpan kalau nanti mau dipakai
  },

  emits: ["update:modelValue", "close"],

  data() {
    const today = new Date();

    return {
      // hari ini
      today,
      todayY: today.getFullYear(),
      todayM: today.getMonth(),
      todayD: today.getDate(),

      // bulan/tahun yang ditampilkan
      displayYear: today.getFullYear(),
      displayMonth: today.getMonth(),
    };
  },

  computed: {
    weekdays() {
      return ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
    },

    gridDays() {
      const first = new Date(this.displayYear, this.displayMonth, 1);
      const startOffset = (first.getDay() + 6) % 7; // Senin = 0
      const start = new Date(this.displayYear, this.displayMonth, 1 - startOffset);
      const days = [];

      for (let i = 0; i < 42; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const inMonth = d.getMonth() === this.displayMonth;

        days.push({
          date: d,
          inMonth,
          isToday:
            d.getFullYear() === this.todayY &&
            d.getMonth() === this.todayM &&
            d.getDate() === this.todayD,
          isSelected: this.isSelected(d),
        });
      }

      return days;
    },

    popStyle() {
      return {
        minWidth: "18rem",
        zIndex: 1080,
      };
    },
  },

  watch: {
    // sinkron ketika v-model berubah dari luar
    modelValue(nv) {
      const p = this.parseUi(nv);
      if (p) {
        this.displayYear = p.getFullYear();
        this.displayMonth = p.getMonth();
      }
    },
  },

  created() {
    // initial display sesuai value awal
    const p = this.parseUi(this.modelValue);
    if (p) {
      this.displayYear = p.getFullYear();
      this.displayMonth = p.getMonth();
    }
  },

  mounted() {
    document.addEventListener("mousedown", this.onDocClick, true);

    this.$nextTick(() => {
      try {
        this.$refs.pop && this.$refs.pop.focus && this.$refs.pop.focus();
      } catch (e) {}
    });
  },

  beforeUnmount() {
    document.removeEventListener("mousedown", this.onDocClick, true);
  },

  methods: {
    emitClose() {
      this.$emit("close");
    },

    onDocClick(e) {
      const pop = this.$refs.pop;
      if (!pop) return;
      if (!pop.contains(e.target)) {
        this.emitClose();
      }
    },

    monthName(m) {
      return [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
      ][m];
    },

    nextMonth() {
      if (this.displayMonth === 11) {
        this.displayMonth = 0;
        this.displayYear++;
      } else {
        this.displayMonth++;
      }
    },

    prevMonth() {
      if (this.displayMonth === 0) {
        this.displayMonth = 11;
        this.displayYear--;
      } else {
        this.displayMonth--;
      }
    },

    parseUi(s) {
      if (!s) return null;
      const m = String(s)
        .trim()
        .match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
      if (!m) return null;

      const dd = +m[1];
      const mm = +m[2];
      const yyyy = +m[3];

      const d = new Date(yyyy, mm - 1, dd);
      return isNaN(d) ? null : d;
    },

    isSelected(d) {
      const picked = this.parseUi(this.modelValue);
      if (!picked) return false;

      return (
        picked.getFullYear() === d.getFullYear() &&
        picked.getMonth() === d.getMonth() &&
        picked.getDate() === d.getDate()
      );
    },

    btnClass(cell) {
      if (!cell.inMonth) return "btn-light disabled opacity-50";
      if (cell.isSelected) return "btn-primary";
      if (cell.isToday) return "btn-outline-primary";
      return "btn-outline-secondary";
    },

    formatToUi(d) {
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = d.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    },

    pick(cell) {
      if (!cell.inMonth) return;
      const d = cell.date;
      this.$emit("update:modelValue", this.formatToUi(d));
      this.emitClose();
    },

    goToday() {
      const t = new Date();
      this.displayYear = t.getFullYear();
      this.displayMonth = t.getMonth();
      this.$emit("update:modelValue", this.formatToUi(t));
      this.emitClose();
    },
  },
};
</script>

<style scoped src="@/components/Calendar.css"></style>
