'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Tasks = function Tasks(props) {
  var tasks = _.sortBy(props.path.tasks.task, function (a) {
    return -new Date(a['performeddtm']);
  });
  var task = tasks.map(function (r) {
    return React.createElement(
      'div',
      null,
      React.createElement(
        'div',
        { className: 'row' },
        React.createElement(
          'div',
          { className: 'pill floating info', style: { width: '15%' } },
          React.createElement(
            'p',
            null,
            r.orderdose,
            ' ',
            r.uom
          )
        ),
        React.createElement(
          'div',
          { className: 'pill floating info', style: { width: '15%' } },
          React.createElement(
            'p',
            null,
            r.route
          )
        ),
        React.createElement(
          'div',
          { className: 'pill floating info', style: { width: '25%' } },
          React.createElement(
            'p',
            null,
            r.frequency
          )
        ),
        React.createElement(
          'div',
          { className: 'pill floating info', style: { width: '37%' } },
          React.createElement(
            'p',
            null,
            d4.timeFormat("%m/%d %X")(new Date(r.performeddtm)),
            ' '
          )
        )
      )
    );
  });

  return React.createElement(
    'div',
    null,
    task
  );
};

var DrugNames = function DrugNames(props) {
  return React.createElement(
    'div',
    null,
    React.createElement(
      'p',
      { className: 'drug drug-title' },
      'Drug Name:'
    ),
    React.createElement(
      'p',
      { className: 'drug drug-desc' },
      props.path.drugname
    ),
    React.createElement(
      'p',
      { className: 'drug drug-title' },
      'Order Status:'
    ),
    React.createElement(
      'p',
      { className: 'drug drug-desc' },
      props.path.orderstatus.toUpperCase()
    )
  );
};

var Headers = function Headers() {
  return React.createElement(
    'div',
    { className: 'row' },
    React.createElement(
      'div',
      { className: 'pill floating info title-row', style: { width: '15%' } },
      React.createElement(
        'p',
        null,
        'dosage'
      )
    ),
    React.createElement(
      'div',
      { className: 'pill floating info title-row', style: { width: '15%' } },
      React.createElement(
        'p',
        null,
        'route'
      )
    ),
    React.createElement(
      'div',
      { className: 'pill floating info title-row', style: { width: '25%' } },
      React.createElement(
        'p',
        null,
        'frequency'
      )
    ),
    React.createElement(
      'div',
      { className: 'pill floating info title-row', style: { width: '37%' } },
      React.createElement(
        'p',
        null,
        'date'
      )
    )
  );
};

var createTaskSummary = function (_React$Component) {
  _inherits(createTaskSummary, _React$Component);

  function createTaskSummary() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, createTaskSummary);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = createTaskSummary.__proto__ || Object.getPrototypeOf(createTaskSummary)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
      tasks: []
    }, _this.getInitialState = function () {
      _this.setState({
        tasks: _this.props.path
      });
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(createTaskSummary, [{
    key: 'render',
    value: function render() {
      return React.createElement(
        'div',
        { className: 'first-panel' },
        React.createElement(DrugNames, { path: this.props.path }),
        React.createElement(Headers, null),
        React.createElement(Tasks, { path: this.props.path })
      );
    }
  }]);

  return createTaskSummary;
}(React.Component);