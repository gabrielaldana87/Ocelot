var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var divStyle = {
  display: 'inline-block'
};

var RemoveFilter = function RemoveFilter(_ref) {
  var fromChildToParent = _ref.fromChildToParent;

  return React.createElement(
    "div",
    { className: "nest", style: divStyle },
    React.createElement(
      "div",
      { className: "Remove-value", onClick: function onClick() {
        return fromChildToParent(42);
      } },
      React.createElement(
        "span",
        { className: "Remove-value-icon", "aria-hidden": "true" },
        "\xD7"
      ),
      React.createElement(
        "a",
        { className: "Select-value-label", style: { color: 'grey' } },
        "remove filters",
        React.createElement(
          "span",
          { className: "Select-aria-only" },
          "\xA0"
        )
      )
    )
  );
};

var GenerateButton = function (_React$Component) {
  _inherits(GenerateButton, _React$Component);

  function GenerateButton(props) {
    _classCallCheck(this, GenerateButton);

    var _this = _possibleConstructorReturn(this, (GenerateButton.__proto__ || Object.getPrototypeOf(GenerateButton)).call(this, props));

    _this.toggleClass = function (index) {
      var tmp = _this.state.paths;
      tmp[index].isActive = !tmp[index].isActive;
      if (tmp.filter(function (o) {
          return o.isActive === true;
        }).length === 0) return tmp[index].isActive = !tmp[index].isActive;
      _this.setState({
        paths: tmp
      });
    };

    _this.filterClass = function (index) {
      var tmp = _this.state.paths;
      for (var i = 0; i < tmp.length; i++) {
        tmp[i].isActive = false;
      }
      tmp[index].isActive = !tmp[index].isActive;
      _this.setState({
        paths: tmp,
        showComponent: true
      });
      return tmp[index].isActive;
    };

    _this.mapArray = function (value) {
      console.log(value);
    };

    _this.getOptionLabel = function (option) {
      return React.createElement(
        "text",
        null,
        option
      );
    };

    _this.onRemoveClick = function (completion, value, status, i) {
      _this.toggleClass(i);
      completion(value, status);
    };

    _this.onClick = function (completion, value, status, i) {
      _this.filterClass(i);
      completion(value, status);
    };

    _this.receiveChildValue = function (completion, status) {
      var tmp = _this.state.paths;
      for (var i = 0; i < tmp.length; i++) {
        tmp[i].isActive = true;
      }
      _this.setState({
        paths: tmp,
        showComponent: false
      });
      completion('remove filter', status);
    };

    _this.state = {
      results: [],
      clearable: true,
      showComponent: false,
      paths: _this.props.path.map(function (r) {
        return {
          value: r,
          isActive: true,
          backgroundColor: _this.props.colorRenderer(r)
        };
      })
    };
    return _this;
  }

  _createClass(GenerateButton, [{
    key: "getInitialState",
    value: function getInitialState() {
      return {
        multi: true,
        value: this.mapArray()
      };
    }
  }, {
    key: "renderValue",
    value: function renderValue(valueArray) {
      var _this2 = this;

      var valueClicked = this.props.onValueClick,
        removeRender = this.props.removeRenderer,
        paths = this.state.paths,
        clickValue = this.onClick,
        valueCap = function valueCap(value) {
          return value.toUpperCase();
        };
      return valueArray.map(function (value, i) {
        var btn_class = _this2.state.paths[i].isActive ? "is-active" : "not-active",
          removeActive = function removeActive() {
            return _this2.onRemoveClick(removeRender, value, paths[i].isActive, i);
          },
          removeValue = _this2.props.removeX ? false : removeActive,
          v_replace = value.replace('/', '-').replace(/\s+/g, '');
        return React.createElement(
          "div",
          { className: "nest " + v_replace + " " + btn_class, style: divStyle },
          React.createElement(
            Select.Value,
            {
              disabled: _this2.props.disabled || value.clearableValue === false,
              isActive: true,
              id: _this2._instancePrefix + "-value-" + i,
              index: i,
              instancePrefix: _this2._instancePrefix,
              key: "value-" + i + "-" + value[_this2.props.valueKey],
              onRemove: removeValue,
              onClick: function onClick() {
                return clickValue(valueClicked, value, true, i);
              },
              placeholder: _this2.props.placeholder,
              value: value,
              values: valueArray
            },
            value,
            React.createElement(
              "span",
              { className: "Select-aria-only" },
              "\xA0"
            )
          )
        );
      });
    }
  }, {
    key: "render",
    value: function render() {
      var _this3 = this;

      var animate = this.props.onValueClick;
      return React.createElement(
        "div",
        { className: "Select has-value is-clearable is-searchable Select--multi" },
        React.createElement(
          "div",
          { className: "Select-multi-value-wrapper", id: this._instancePrefix + "-value"
          },
          this.renderValue(this.props.path),
          this.state.showComponent ? React.createElement(RemoveFilter, { fromChildToParent: function fromChildToParent() {
            return _this3.receiveChildValue(animate, false);
          } }) : null
        )
      );
    }
  }]);

  return GenerateButton;
}(React.Component);