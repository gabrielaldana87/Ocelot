var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ThemeContext = React.createContext('light'),
  ThemeConsumer = ThemeContext.Consumer,
  LanguageContext = React.createContext('en'),
  LanguageConsumer = LanguageContext.Consumer;

var AppProviders = function AppProviders(props) {
  return React.createElement(
    'div',
    null,
    React.createElement(GenerateButton, {
      path: props.path,
      colorRenderer: props.colorRenderer,
      onValueClick: props.onValueClick
    })
  );
};

var App = function (_React$Component) {
  _inherits(App, _React$Component);

  function App(props) {
    _classCallCheck(this, App);

    var _this = _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this, props));

    _this.state = {
      path: _this.props.path,
      colorRenderer: _this.props.colorRenderer,
      onValueClick: _this.props.onValueClick
    };

    _this.onChange = function (evt) {
      console.log(evt);
    };

    return _this;
  }

  _createClass(App, [{
    key: 'render',
    value: function render() {
      return React.createElement(AppProviders, {
        path: this.props.path,
        colorRenderer: this.state.colorRenderer,
        onChange: this.onChange,
        onValueClick: this.state.onValueClick
      });
    }
  }]);

  return App;
}(React.Component);