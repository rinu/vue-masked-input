"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _inputmaskCore = require("inputmask-core");

var _inputmaskCore2 = _interopRequireDefault(_inputmaskCore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return iter.split(''); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

exports.default = {
  name: 'MaskedInput',
  render: function render(h) {
    return h('input', {
      ref: 'input',
      attrs: {
        disabled: this.maskCore === null || this.disabled
      },
      domProps: {
        value: this.value
      },
      on: {
        keydown: this.keyDown,
        input: this.input,
        mouseup: this.mouseUp,
        focusout: this.focusOut,
        cut: this.cut,
        copy: this.copy,
        paste: this.paste
      }
    });
  },
  data: function data() {
    return {
      marginLeft: 0,
      maskCore: null,
      keyCode: null
    };
  },
  props: {
    value: {
      type: String
    },
    mask: {
      required: true,
      validator: function validator(value) {
        return !!(value && value.length >= 1 || value instanceof Object);
      }
    },
    placeholderChar: {
      type: String,
      default: '_',
      validator: function validator(value) {
        return !!(value && value.length === 1);
      }
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    mask: function mask(newValue, oldValue) {
      if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
        this.initMask();
      }
    },
    value: function value(newValue) {
      if (this.maskCore) this.maskCore.setValue(newValue); // For multiple inputs support
    }
  },
  mounted: function mounted() {
    this.initMask();
  },
  methods: {
    initMask: function initMask() {
      var _this = this;

      try {
        if (this.mask instanceof Object) {
          this.maskCore = new _inputmaskCore2.default(this.mask);
        } else {
          this.maskCore = new _inputmaskCore2.default({
            pattern: this.mask,
            value: '',
            placeholderChar: this.placeholderChar,

            /* eslint-disable quote-props */
            formatCharacters: {
              'a': {
                validate: function validate(char) {
                  return /^[A-Za-zА-Яа-я]$/.test(char);
                }
              },
              'A': {
                validate: function validate(char) {
                  return /^[A-Za-zА-Яа-я]$/.test(char);
                },
                transform: function transform(char) {
                  return char.toUpperCase();
                }
              },
              '*': {
                validate: function validate(char) {
                  return /^[\dA-Za-zА-Яа-я]$/.test(char);
                }
              },
              '#': {
                validate: function validate(char) {
                  return /^[\dA-Za-zА-Яа-я]$/.test(char);
                },
                transform: function transform(char) {
                  return char.toUpperCase();
                }
              },
              '+': {
                validate: function validate() {
                  return true;
                }
              }
            }
            /* eslint-enable */

          });
        }

        [].concat(_toConsumableArray(this.$refs.input.value)).reduce(function (memo, item) {
          return _this.maskCore.input(item);
        }, null);
        this.setNativeSelection();

        if (this.$refs.input.value === '') {
          this.$emit('input', '', '');
        } else {
          this.updateToCoreState();
        }
      } catch (e) {
        this.maskCore = null;
        this.$refs.input.value = 'Error';
        this.$emit('input', this.$refs.input.value, '');
      }
    },
    getValue: function getValue() {
      return this.maskCore ? this.maskCore.getValue() : '';
    },
    keyDown: function keyDown(e) {
      // Always
      if (this.maskCore === null) {
        e.preventDefault();
        return;
      }

      this.setNativeSelection();
      this.keyCode = e.keyCode;

      switch (e.keyCode) {
        // backspace
        case 8:
          e.preventDefault();

          if (this.maskCore.selection.start > this.marginLeft || this.maskCore.selection.start !== this.maskCore.selection.end) {
            this.maskCore.backspace();
            this.updateToCoreState();
          }

          break;
        // left arrow

        case 37:
          e.preventDefault();

          if (this.$refs.input.selectionStart === this.$refs.input.selectionEnd) {
            // this.$refs.input.selectionEnd = this.$refs.input.selectionStart - 1; @TODO
            this.$refs.input.selectionStart -= 1;
          }

          this.maskCore.selection = {
            start: this.$refs.input.selectionStart,
            end: this.$refs.input.selectionStart
          };
          this.updateToCoreState();
          break;
        // right arrow

        case 39:
          e.preventDefault();

          if (this.$refs.input.selectionStart === this.$refs.input.selectionEnd) {
            this.$refs.input.selectionEnd += 1;
          }

          this.maskCore.selection = {
            start: this.$refs.input.selectionEnd,
            end: this.$refs.input.selectionEnd
          };
          this.updateToCoreState();
          break;
        // end

        case 35:
          e.preventDefault();
          this.$refs.input.selectionStart = this.$refs.input.value.length;
          this.$refs.input.selectionEnd = this.$refs.input.value.length;
          this.maskCore.selection = {
            start: this.$refs.input.selectionEnd,
            end: this.$refs.input.selectionEnd
          };
          this.updateToCoreState();
          break;
        // home

        case 36:
          e.preventDefault();
          this.$refs.input.selectionStart = 0;
          this.$refs.input.selectionEnd = 0;
          this.maskCore.selection = {
            start: this.$refs.input.selectionStart,
            end: this.$refs.input.selectionStart
          };
          this.updateToCoreState();
          break;

        default:
          break;
      }
    },
    input: function input(e) {
      var _this2 = this;

      if (e.preventDefault) e.preventDefault();
      var text = e.target.value;
      var selection = {
        start: this.$refs.input.selectionStart,
        end: this.$refs.input.selectionEnd
      };

      if (this.keyCode === 46 && selection.start !== selection.end) {
        this.maskCore.backspace();
      } else if (text) {
        this.maskCore.setValue('');
        this.maskCore.setSelection({
          start: 0,
          end: 0
        });
        [].concat(_toConsumableArray(text)).reduce(function (memo, item) {
          return _this2.maskCore.input(item);
        }, null);

        if (this.keyCode === 46) {
          this.maskCore.setSelection(selection);
          this.$refs.input.selectionStart = this.maskCore.selection.start;
          this.$refs.input.selectionEnd = this.maskCore.selection.start;
        }
      }

      this.updateToCoreState();
    },
    cut: function cut(e) {
      e.preventDefault();

      if (this.$refs.input.selectionStart !== this.$refs.input.selectionEnd) {
        try {
          document.execCommand('copy');
        } catch (err) {} // eslint-disable-line no-empty


        this.maskCore.backspace();
        this.updateToCoreState();
      }
    },
    copy: function copy() {},
    paste: function paste(e) {
      var _this3 = this;

      e.preventDefault();
      var text = (e.clipboardData || window.clipboardData).getData('text');
      [].concat(_toConsumableArray(text)).reduce(function (memo, item) {
        return _this3.maskCore.input(item);
      }, null);
      this.updateToCoreState();
    },
    updateToCoreState: function updateToCoreState() {
      if (this.maskCore === null) {
        return;
      }

      if (this.$refs.input.value !== this.maskCore.getValue()) {
        this.$refs.input.value = this.maskCore.getValue();
        this.$emit('input', this.$refs.input.value, this.maskCore.getRawValue());
      }

      this.$refs.input.selectionStart = this.maskCore.selection.start;
      this.$refs.input.selectionEnd = this.maskCore.selection.end;
    },
    isEmpty: function isEmpty() {
      if (this.maskCore === null) return true;
      return this.maskCore.getValue() === this.maskCore.emptyValue;
    },
    focusOut: function focusOut() {
      if (this.isEmpty()) {
        this.$refs.input.value = '';
        this.maskCore.setSelection({
          start: 0,
          end: 0
        });
        this.$emit('input', '', '');
      }
    },
    setNativeSelection: function setNativeSelection() {
      this.maskCore.selection = {
        start: this.$refs.input.selectionStart,
        end: this.$refs.input.selectionEnd
      };
    },
    mouseUp: function mouseUp() {
      if (this.isEmpty() && this.$refs.input.selectionStart === this.$refs.input.selectionEnd) {
        this.maskCore.setSelection({
          start: 0,
          end: 0
        });
        this.$refs.input.selectionStart = this.maskCore.selection.start;
        this.$refs.input.selectionEnd = this.maskCore.selection.start;
        this.marginLeft = this.maskCore.selection.start;
        this.updateToCoreState();
      } else {
        this.setNativeSelection();
      }
    }
  }
};
