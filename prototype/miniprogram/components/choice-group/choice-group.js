Component({
  properties: {
    label: { type: String, value: '' },
    value: { type: null, value: '' },
    options: { type: Array, value: [] },
    multiple: { type: Boolean, value: false },
    field: { type: String, value: '' },
    // format func not usable across component boundary; use option[displayKey] or option itself
    displayKey: { type: String, value: '' },
  },

  observers: {
    options(ops) {
      const normalized = (ops || []).map((opt) => {
        if (typeof opt === 'object' && opt !== null) {
          return { value: opt.value ?? opt, label: opt.label ?? String(opt.value ?? opt) };
        }
        return { value: opt, label: String(opt) };
      });
      this.setData({ normalizedOptions: normalized });
    },
    value(val) {
      const selected = this.data.multiple
        ? (Array.isArray(val) ? val : (val ? [val] : []))
        : val;
      this.setData({ selected });
    },
  },

  data: {
    normalizedOptions: [],
    selected: null,
  },

  methods: {
    onTap(e) {
      const tappedValue = e.currentTarget.dataset.value;
      const { multiple, normalizedOptions, selected, field } = this.data;

      if (multiple) {
        const optionValues = normalizedOptions.map((o) => o.value);
        const current = Array.isArray(selected) ? selected : (selected ? [selected] : []);
        const cleaned = current.filter((v) => optionValues.includes(v));
        const noLimit = cleaned.filter((v) => {
          const str = String(v);
          return str.includes('不限');
        });
        if (noLimit.length && !noLimit.includes(tappedValue)) {
          // deselect "不限" options if selecting a specific one
          const withoutNoLimit = cleaned.filter((v) => !noLimit.includes(v));
          this.triggerChange([...withoutNoLimit, tappedValue]);
          return;
        }
        if (String(tappedValue).includes('不限') && !cleaned.includes(tappedValue)) {
          this.triggerChange([tappedValue]);
          return;
        }
        const idx = cleaned.indexOf(tappedValue);
        if (idx >= 0) {
          const next = cleaned.filter((v) => v !== tappedValue);
          this.triggerChange(next.length ? next : []);
        } else {
          this.triggerChange([...cleaned, tappedValue]);
        }
      } else {
        this.triggerChange(tappedValue);
      }
    },

    triggerChange(newValue) {
      this.setData({ selected: newValue });
      this.triggerEvent('change', { value: newValue, field: this.data.field });
    },
  },
});
