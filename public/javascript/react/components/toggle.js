'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Toggle = function (_React$Component) {
  _inherits(Toggle, _React$Component);

  function Toggle(props) {
    _classCallCheck(this, Toggle);

    var _this = _possibleConstructorReturn(this, (Toggle.__proto__ || Object.getPrototypeOf(Toggle)).call(this, props));

    _this.state = {
      checked: props.defaultChecked ? props.defaultChecked : props.checked
    };
    _this.displayName = "Toggle";
    _this.onToggle = _this.onToggle.bind(_this);

    return _this;
  }

  _createClass(Toggle, [{
    key: "componentWillReceiveProps",
    value: function componentWillReceiveProps(nextProps) {
      this.setState({
        checked: nextProps.checked !== this.state.checked ? nextProps.checked : this.state.checked
      });
    }
  }, {
    key: "onToggle",
    value: function onToggle(evt) {
      this.props.onChange(!this.state.checked); // backward compatibility
      this.props.onToggle(!this.state.checked, evt);
      this.setState({ checked: !this.state.checked });
    }
  }, {
    key: "onChange",
    value: function onChange() {
      console.log(this);
    }
  }, {
    key: "render",
    value: function render() {
      var _props = this.props,
        id = _props.id,
        _props$name = _props.name,
        name = _props$name === undefined ? "toggle" : _props$name,
        label = _props.label,
        labelRight = _props.labelRight,
        className = _props.className,
        _props$checked = _props.checked,
        checked = _props$checked === undefined ? false : _props$checked,
        defaultChecked = _props.defaultChecked,
        _props$mode = _props.mode,
        mode = _props$mode === undefined ? "toggle" : _props$mode,
        _props$theme = _props.theme,
        theme = _props$theme === undefined ? "round" : _props$theme,
        disabled = _props.disabled,
        others = _objectWithoutProperties(_props, ["id", "name", "label", "labelRight", "className", "checked", "defaultChecked", "mode", "theme", "disabled"]);

      // backward compatibility


      var bcTheme = {
        round: "rsbc-switch-button-flat-round",
        square: "rsbc-switch-button-flat-square",
        "rsbc-switch-button-flat-round": "rsbc-switch-button-flat-round",
        "rsbc-switch-button-flat-square": "rsbc-switch-button-flat-square"
      };

      // backward compatibility
      var bcMode = {
        toggle: "switch",
        "switch": "switch",
        select: "select"
      };

      var classes = [className, "rsbc-switch-button", "rsbc-mode-" + bcMode[mode], bcTheme[theme], disabled ? " disabled" : ""];

      return React.createElement(
        "div",
        Object.assign({}, others, { className: classes.join(" ").trim() }),
        label ? React.createElement(
          "label",
          { className: "tag-source", htmlFor: id ? id : name },
          label
        ) : null,
        React.createElement("input", { onChange: this.onToggle,
          checked: this.state.checked,
          disabled: disabled,
          id: id ? id : name,
          name: name,
          type: "checkbox",
          value: "1" }),
        React.createElement("label", { htmlFor: id ? id : name }),
        labelRight ? React.createElement(
          "label",
          { className: "tag-right", htmlFor: id ? id : name },
          labelRight
        ) : null
      );
    }
  }]);

  return Toggle;
}(React.Component);

Toggle.defaultProps = {
  onChange: function onChange() {}, // backward compatibility
  onToggle: function onToggle() {}
};