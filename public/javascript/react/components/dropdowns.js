'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Contributors = function (_React$Component) {
  _inherits(Contributors, _React$Component);

  function Contributors() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, Contributors);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Contributors.__proto__ || Object.getPrototypeOf(Contributors)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
      displayName: 'Contributors',
      selectValue: null,
      propTypes: {
        label: PropTypes.string
      }
    }, _this.getInitialState = function () {
      _this.setState({
        selectValue: _this.props.selectValue
      });
    }, _this.onChange = function (value) {
      var actionChange = _this.props.onChange;
      actionChange(value);
      _this.setState({
        selectValue: value
      });
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(Contributors, [{
    key: 'render',
    value: function render() {
      var valueClicked = this.props.onValueClick;
      var multiSelect = this.props.multi;
      return React.createElement(
        'div',
        { className: this.props.parentEl, style: this.props.divStyle, ref: this.getInitialState },
        React.createElement(Select, {
          multi: multiSelect,
          clearable: this.props.clearable,
          value: this.state.selectValue,
          onChange: this.onChange,
          onValueClick: valueClicked,
          valueKey: this.props.valueKey,
          labelKey: this.props.valueKey
          //loadOptions={this.getMedications}
          , options: this.props.path
        }),
        React.createElement('div', { className: this.props.siblingEl })
      );
    }
  }]);

  return Contributors;
}(React.Component);