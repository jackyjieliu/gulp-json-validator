var backslash = require('backslash');
module.exports = {
  validate: validate,
  parse: parse
};

function validate(jsonString, allowDuplicatedKey) {
  var error;
  if (typeof jsonString !== 'string') {
    error = 'Input must be a string';
  } else {
    try {
      _findValue(jsonString, 0, allowDuplicatedKey);
    } catch(e) {
      error = e.message;
    }
  }
  return error;
}

function parse(jsonString, allowDuplicatedKey) {
  if (typeof jsonString !== 'string') {
    throw new Error('Input must be a string');
  }
  var value = _findValue(jsonString, 0, allowDuplicatedKey);
  return value.value;
}


function _findSeparator(str, startInd) {
  var len = str.length;
  var sepStartInd = startInd;
  var sepEndInd;
  for (var i = startInd; i < len; i++) {
    var ch = str[i];
    if (ch === ',') {
      sepEndInd = i;
      break;
    } else if ( ch === ']' || ch === '}') {
      sepEndInd = i - 1;
      break;
    } else if (!_isWhiteSpace(ch)) {
      throw _syntaxError(str, i, 'expecting end of expression or separator');
    }
  }

  var value;
  if (sepEndInd === undefined) {
    sepEndInd = len;
    value = str[sepEndInd];
  } else {
    value = str[sepEndInd];
    sepEndInd++;
  }
  return {
    start: sepStartInd,
    end: sepEndInd,
    value: value
  };
}

function _findSemiColonSeparator(str, startInd) {
  var len = str.length;
  var semiColStartInd = startInd;
  var semiColEndInd;
  for (var i = startInd; i < len; i++) {
    var ch = str[i];
    if (ch === ':') {
      semiColEndInd = i;
      break;
    } else if (!_isWhiteSpace(ch)) {
      throw _syntaxError(str, i, 'expecting \':\'');
    }
  }
  if (semiColEndInd === undefined) {
    throw _syntaxError(str, i, 'expecting \':\'');
  }
  semiColEndInd++;
  return {
    start: semiColStartInd,
    end: semiColEndInd
  };
}

function _findValue(str, startInd, allowDuplicatedKey) {
  var len = str.length;
  var valueStartInd;
  var valueEndInd;
  var isArray = false;
  var isObject = false;
  var isString = false;
  var isNumber = false;
  var dotFound = false;
  var value;

  for (var i = startInd; i < len; i++) {

    var ch = str[i];
    if (valueStartInd === undefined) {
      if (!_isWhiteSpace(ch)) {
        if (ch === '[') {
          isArray = true;
        } else if (ch === '{') {
          isObject = true;
        } else if (ch === '"') {
          isString = true;
        } else if (_isTrueFromIndex(str, i)) {
          valueStartInd = i;
          i = i + 3;
          valueEndInd = i;
          value = true;
          break;
        } else if (_isFalseFromIndex(str, i)) {
          valueStartInd = i;
          i = i + 4;
          valueEndInd = i;
          value = false;
          break;
        } else if (_isNullFromIndex(str, i)) {
          valueStartInd = i;
          i = i + 3;
          valueEndInd = i;
          value = null;
          break;
        } else if (_isNumber(ch)) {
          isNumber = true;
        } else {
          throw _syntaxError(str, i, '');
        }
        valueStartInd = i;
      }
    } else {
      if (isArray) {
        var arr = _findArray(str, i);
        valueEndInd = arr.end;
        value = arr.value;
        break;
      } else if (isObject) {
        var obj = _findObject(str, i, allowDuplicatedKey);
        valueEndInd = obj.end;
        value = obj.value;
        break;
      } else if (isString && ch === '"' && _hasEvenNumberOfBackSlash(str, i - 1)) {
        valueEndInd = i;
        value = backslash(str.substring(valueStartInd + 1, valueEndInd));
        break;
      } else if (isNumber) {
        if (_isNumber(ch)) {
          continue;
        } else if (ch === '.' && !dotFound) {
          dotFound = true;
        } else if (_isWhiteSpace(ch) || ch === ',' || ch === ']' || ch === '}') {
          value = parseFloat(str.substring(valueStartInd, valueEndInd), 10);
          valueEndInd = i - 1;
          break;
        } else {
          throw _syntaxError(str, i, 'expecting number');
        }
      }
    }
  }

  if (valueEndInd === undefined) {
    if (isNumber) {
      value = parseFloat(str.substring(valueStartInd, i), 10);
      valueEndInd = i - 1;
    } else {
      throw _syntaxError(str, i, 'unclosed statement');
    }
  }
  valueEndInd++;
  return {
    value: value,
    start: valueStartInd,
    end: valueEndInd
  };
}

function _findKey(str, startInd) {
  var len = str.length;
  var keyStartInd;
  var keyEndInd;
  for (var i = startInd; i < len; i++) {
    var ch = str[i];
    if (keyStartInd === undefined) {
      if (!_isWhiteSpace(ch)) {
        if (ch !== '"') {
          throw _syntaxError(str, i, 'expecting String');
        }
        keyStartInd = i;
      }
    } else {
      if (ch === '"' && _hasEvenNumberOfBackSlash(str, i - 1)) {
        keyEndInd = i;
        break;
      }
    }
  }

  if (keyEndInd === undefined) {
    throw _syntaxError(str, len, 'expecting String');
  }

  var value = backslash(str.substring(keyStartInd + 1, keyEndInd));
  if (value === '') {
    throw _syntaxError(str, keyStartInd, 'empty string');
  }
  keyEndInd++;
  return {
    start: keyStartInd,
    end: keyEndInd,
    value: value
  };
}

function _findObject(str, startInd, allowDuplicatedKey) {
  var i = startInd;
  var sepValue = ',';
  var obj = {};
  while (sepValue === ',') {
    var key = _findKey(str, i);
    var semi = _findSemiColonSeparator(str, key.end);
    var value = _findValue(str, semi.end);
    var sepIndex = _findSeparator(str, value.end);

    if (!allowDuplicatedKey) {
      if(obj[key.value] !== undefined) {
        throw _syntaxError(str, key.end, 'duplicated key: ' + key.value);
      }
    }
    obj[key.value] = value.value;
    i = sepIndex.end;
    sepValue = sepIndex.value;
  }
  return {
    start: startInd,
    end: i,
    value: obj
  };
}

function _hasEvenNumberOfBackSlash(str, endInd) {
  var i = endInd;
  var count = 0;
  while(i > -1 && str[i] === '\\') {
    count++;
    i--;
  }
  return (count % 2) === 0;
}

function _findArray(str, startInd) {
  var i = startInd;
  var sepValue = ',';
  var arr = [];
  while (sepValue === ',') {
    var value = _findValue(str, i);
    var sepIndex = _findSeparator(str, value.end);
    arr.push(value.value);
    i = sepIndex.end;
    sepValue = sepIndex.value;
  }
  return {
    start: startInd,
    end: i,
    value: arr
  };
}

function _isTrueFromIndex(str, ind) {
  return (str.substr(ind, 4) === 'true');
}

function _isFalseFromIndex(str, ind) {
  return (str.substr(ind, 5) === 'false');
}

function _isNullFromIndex(str, ind) {
  return (str.substr(ind, 4) === 'null');
}

var white = new RegExp(/^\s$/);
function _isWhiteSpace(ch){
  return white.test(ch);
}

var numberReg = new RegExp(/^\d$/);
function _isNumber(ch) {
  return numberReg.test(ch);
}

function _syntaxError(str, index, reason) {
  var regionLen = 10;

  var regionStr;
  if (str.length < index + regionLen) {
    regionStr = str.substr(_normalizeNegativeNumber(str.length - regionLen), str.length);
  } else if (index - (regionLen/2) < 0) {
    regionStr = str.substr(0, regionLen);
  } else {
    regionStr = str.substr(_normalizeNegativeNumber(index - (regionLen/2)), regionLen);
  }

  var message;
  if (reason) {
    message = 'Syntax error: ' + reason + ' near ' + regionStr;
  } else {
    message = 'Syntax error near ' + regionStr;
  }
  return new Error(message);
}

function _normalizeNegativeNumber(num) {
  return (num < 0) ? 0 : num;
}