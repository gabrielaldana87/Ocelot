'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var range_tm;
var Totals = function Totals(props) {
  var array = props.functionId ? props.parse[props.functionId](props) : [1, 2],
    mapper = array.map(function (r) {
      return React.createElement(
        'p',
        { key: r },
        r
      );
    });
  return React.createElement(
    'div',
    null,
    mapper
  );
};

var TextRename = function TextRename(props) {
  var id = props.id;
  if (id === 'bp') {
    var _condition = ['overlay text-sbp', '', 'overlay text-dbp'].map(function (r) {
      return React.createElement(
        'text',
        { className: r },
        '/'
      );
    });
    return React.createElement(
      'div',
      null,
      _condition
    );
  }
  if (id === 'abp') {
    var _condition2 = ['overlay text-sbp_art', '', 'overlay text-dbp_art'].map(function (r) {
      return React.createElement(
        'text',
        { className: r },
        '/'
      );
    });
    return React.createElement(
      'div',
      null,
      _condition2
    );
  }
  var condition = React.createElement(
    'text',
    { className: 'overlay text-' + id },
    '-'
  );
  return React.createElement(
    'div',
    null,
    condition
  );
};

var Time = function Time() {
  return React.createElement(
    'text',
    { id: 'T'.concat(range_tm) },
    d4.timeFormat("%a %m/%d")(range_tm)
  );
};

var Arrow = function Arrow(props) {
  return React.createElement(
    'div',
    { className: 'pill floating info title-row', style: { width: '32%' } },
    React.createElement(
      'span',
      { className: 'Select-arrow-zone', style: props.value.style },
      React.createElement('span', { className: 'Select-arrow' })
    )
  );
};

var IntervalLabel = function IntervalLabel() {
  return React.createElement(
    'div',
    { className: 'pill floating info title-row', style: { width: '33%' } },
    '24 HOUR'
  );
};

var setTimeRange = function (_React$Component) {
  _inherits(setTimeRange, _React$Component);

  function setTimeRange(props) {
    _classCallCheck(this, setTimeRange);

    var _this = _possibleConstructorReturn(this, (setTimeRange.__proto__ || Object.getPrototypeOf(setTimeRange)).call(this, props));

    _this.state = {
      time: null
    };
    return _this;
  }

  _createClass(setTimeRange, [{
    key: 'render',
    value: function render() {
      return React.createElement(Time, null);
    }
  }]);

  return setTimeRange;
}(React.Component);

var createArrowButton = function (_React$Component2) {
  _inherits(createArrowButton, _React$Component2);

  function createArrowButton(props) {
    _classCallCheck(this, createArrowButton);

    var _this2 = _possibleConstructorReturn(this, (createArrowButton.__proto__ || Object.getPrototypeOf(createArrowButton)).call(this, props));

    _this2.renderArrows = function (arrowValues) {
      return arrowValues.map(function (value, i) {
        return React.createElement(Arrow, {
          onClick: value.formula,
          value: value
        });
      });
    };

    _this2.state = {
      interval: null
    };
    return _this2;
  }

  _createClass(createArrowButton, [{
    key: 'render',
    value: function render() {
      return React.createElement(
        'div',
        null,
        React.createElement(IntervalLabel, null),
        React.createElement(
          'div',
          null,
          this.renderArrows(this.props.arrows)
        )
      );
    }
  }]);

  return createArrowButton;
}(React.Component);

var AppendTextIds = function (_React$Component3) {
  _inherits(AppendTextIds, _React$Component3);

  function AppendTextIds(props) {
    _classCallCheck(this, AppendTextIds);

    var _this3 = _possibleConstructorReturn(this, (AppendTextIds.__proto__ || Object.getPrototypeOf(AppendTextIds)).call(this, props));

    _this3.componentDidMount = function () {
      _this3.setState({
        containerId: ReactDOM.findDOMNode(_this3).parentNode.getAttribute('id')
      });
    };

    _this3.state = {
      containerId: '',
      className: ''
    };
    return _this3;
  }

  _createClass(AppendTextIds, [{
    key: 'render',
    value: function render() {
      return React.createElement(
        'div',
        { ref: this.renameIdentifier },
        React.createElement(TextRename, { id: this.state.containerId })
      );
    }
  }]);

  return AppendTextIds;
}(React.Component);

var TablePopulate = function (_React$Component4) {
  _inherits(TablePopulate, _React$Component4);

  function TablePopulate(props) {
    _classCallCheck(this, TablePopulate);

    var _this4 = _possibleConstructorReturn(this, (TablePopulate.__proto__ || Object.getPrototypeOf(TablePopulate)).call(this, props));

    _initialiseProps.call(_this4);

    _this4.state = {
      results: [],
      path: '',
      period: null,
      functionId: '',
      containerId: '',
      time: ''
    };
    return _this4;
  }

  _createClass(TablePopulate, [{
    key: 'render',
    value: function render() {
      return React.createElement(
        'div',
        { ref: this.getSummary },
        React.createElement(Totals, {
          results: this.state.results,
          id: this.state.containerId,
          parse: { first: this.parseIOs, second: this.parseVitals, third: this.parseBPs },
          functionId: this.state.functionId,
          period: this.state.period
        })
      );
    }
  }]);

  return TablePopulate;
}(React.Component);

var _initialiseProps = function _initialiseProps() {
  var _this5 = this;

  this.componentDidMount = function () {
    _this5.getSummary();
    _this5.setState({
      functionId: _this5.props.functionId,
      containerId: ReactDOM.findDOMNode(_this5).parentNode.getAttribute('id')
    });
  };

  this.getSummary = function () {
    return _this5.populateTable();
  };

  this.parseVitals = function (props) {
    var summary = [];
    if (props.results) {
      var max = d4.max(props.results.days.day, function (d) {
        return new Date(d['enddtm']);
      });
      props.results.days.day.filter(function (r) {
        var twentyfour = d4.timeHour.offset(max, -props.period);
        if (new Date(r.enddtm) > twentyfour) {
          var vital = props.id === 'spo2' ? 'SpO2' : props.id.toUpperCase(),
            min = r[vital + 'Min'] ? r[vital + 'Min'].toString() : ' ',
            _max = r[vital + 'Max'] ? r[vital + 'Max'].toString() : ' ';
          summary.push(min + ' - ' + _max);
          range_tm = new Date(r.startdtm).getTime();
        }
      });
    }
    return summary;
  };

  this.parseIOs = function (props) {
    var summary = [];
    if (props.results) {
      var max = d4.max(props.results, function (d) {
        return new Date(d['enddtm']);
      });
      props.results.filter(function (r) {
        var twentyfour = d4.timeHour.offset(max, -24); //d4.timeHour.offset(new Date(),-24);
        if (new Date(r.enddtm) > twentyfour && r.w === 24) {
          summary.push(r[props.id].toString());
        }
      });
    }
    return summary;
  };

  this.parseBPs = function (props) {
    var summary = [];
    if (props.results) {
      var max = d4.max(props.results.days.day, function (d) {
        return new Date(d['enddtm']);
      });
      props.results.days.day.filter(function (r) {
        var twentyfour = d4.timeHour.offset(max, -24);
        if (new Date(r.enddtm) > twentyfour && props.id === 'bp') {
          var sbpMin = r['SBPMin'] ? r['SBPMin'].toString() : null,
            sbpMax = r['SBPMax'] ? r['SBPMax'].toString() : null,
            dbpMin = r['DBPMin'] ? r['DBPMin'].toString() : null,
            dbpMax = r['DBPMax'] ? r['DBPMax'].toString() : null,
            min = sbpMin ? sbpMin + '/' + dbpMin : ' ',
            _max2 = sbpMax ? sbpMax + '/' + dbpMax : ' ';
          summary.push(min + ' - ' + _max2);
        }
        if (new Date(r.enddtm) > twentyfour && props.id === 'abp') {
          var _sbpMin = r['SBPMin_art'] ? r['SBPMin_art'].toString() : null,
            _sbpMax = r['SBPMax_art'] ? r['SBPMax_art'].toString() : null,
            _dbpMin = r['DBPMin_art'] ? r['DBPMin_art'].toString() : null,
            _dbpMax = r['DBPMax_art'] ? r['DBPMax_art'].toString() : null,
            _min = _sbpMin ? _sbpMin + '/' + _dbpMin : ' ',
            _max3 = _sbpMax ? _sbpMax + '/' + _dbpMax : ' ';
          summary.push(_min + ' - ' + _max3);
        }
      });
    }
    return summary;
  };

  this.populateTable = function () {
    var data = _this5.props.path;
    var period = _this5.props.period;
    _this5.setState({
      results: data,
      period: period
    });
  };
};