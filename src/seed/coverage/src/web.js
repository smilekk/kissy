function BranchData() {
    this.position = -1;
    this.nodeLength = -1;
    this.src = null;
    this.evalFalse = 0;
    this.evalTrue = 0;

    this.init = function(position, nodeLength, src) {
        this.position = position;
        this.nodeLength = nodeLength;
        this.src = src;
        return this;
    }

    this.ranCondition = function(result) {
        if (result)
            this.evalTrue++;
        else
            this.evalFalse++;
    };

    this.pathsCovered = function() {
        var paths = 0;
        if (this.evalTrue > 0)
          paths++;
        if (this.evalFalse > 0)
          paths++;
        return paths;
    };

    this.covered = function() {
        return this.evalTrue > 0 && this.evalFalse > 0;
    };

    this.toJSON = function() {
        return '{"position":' + this.position
            + ',"nodeLength":' + this.nodeLength
            + ',"src":' + jscoverage_quote(this.src)
            + ',"evalFalse":' + this.evalFalse
            + ',"evalTrue":' + this.evalTrue + '}';
    };

    this.message = function() {
        if (this.evalTrue === 0 && this.evalFalse === 0)
            return 'Condition never evaluated         :\t' + this.src;
        else if (this.evalTrue === 0)
            return 'Condition never evaluated to true :\t' + this.src;
        else if (this.evalFalse === 0)
            return 'Condition never evaluated to false:\t' + this.src;
        else
            return 'Condition covered';
    };
}

BranchData.fromJson = function(jsonString) {
    var json = eval('(' + jsonString + ')');
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

BranchData.fromJsonObject = function(json) {
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

function buildBranchMessage(conditions) {
    var message = 'The following was not covered:';
    for (var i = 0; i < conditions.length; i++) {
        if (conditions[i] !== undefined && conditions[i] !== null && !conditions[i].covered())
          message += '\n- '+ conditions[i].message();
    }
    return message;
};

function convertBranchDataConditionArrayToJSON(branchDataConditionArray) {
    var array = [];
    var length = branchDataConditionArray.length;
    for (var condition = 0; condition < length; condition++) {
        var branchDataObject = branchDataConditionArray[condition];
        if (branchDataObject === undefined || branchDataObject === null) {
            value = 'null';
        } else {
            value = branchDataObject.toJSON();
        }
        array.push(value);
    }
    return '[' + array.join(',') + ']';
}

function convertBranchDataLinesToJSON(branchData) {
    if (branchData === undefined) {
        return '{}'
    }
    var json = '';
    for (var line in branchData) {
        if (json !== '')
            json += ','
        json += '"' + line + '":' + convertBranchDataConditionArrayToJSON(branchData[line]);
    }
    return '{' + json + '}';
}

function convertBranchDataLinesFromJSON(jsonObject) {
    if (jsonObject === undefined) {
        return {};
    }
    for (var line in jsonObject) {
        var branchDataJSON = jsonObject[line];
        if (branchDataJSON !== null) {
            for (var conditionIndex = 0; conditionIndex < branchDataJSON.length; conditionIndex ++) {
                var condition = branchDataJSON[conditionIndex];
                if (condition !== null) {
                    branchDataJSON[conditionIndex] = BranchData.fromJsonObject(condition);
                }
            }
        }
    }
    return jsonObject;
}
function jscoverage_quote(s) {
    return '"' + s.replace(/[\u0000-\u001f"\\\u007f-\uffff]/g, function (c) {
        switch (c) {
            case '\b':
                return '\\b';
            case '\f':
                return '\\f';
            case '\n':
                return '\\n';
            case '\r':
                return '\\r';
            case '\t':
                return '\\t';
            // IE doesn't support this
            /*
             case '\v':
             return '\\v';
             */
            case '"':
                return '\\"';
            case '\\':
                return '\\\\';
            default:
                return '\\u' + jscoverage_pad(c.charCodeAt(0).toString(16));
        }
    }) + '"';
}

function getArrayJSON(coverage) {
    var array = [];
    if (coverage === undefined)
        return array;

    var length = coverage.length;
    for (var line = 0; line < length; line++) {
        var value = coverage[line];
        if (value === undefined || value === null) {
            value = 'null';
        }
        array.push(value);
    }
    return array;
}

function jscoverage_serializeCoverageToJSON() {
    var json = [];
    for (var file in _$jscoverage) {
        var lineArray = getArrayJSON(_$jscoverage[file].lineData);
        var fnArray = getArrayJSON(_$jscoverage[file].functionData);

        json.push(jscoverage_quote(file) + ':{"lineData":[' + lineArray.join(',') + '],"functionData":[' + fnArray.join(',') + '],"branchData":' + convertBranchDataLinesToJSON(_$jscoverage[file].branchData) + '}');
    }
    return '{' + json.join(',') + '}';
}


function jscoverage_pad(s) {
    return '0000'.substr(s.length) + s;
}

function jscoverage_html_escape(s) {
    return s.replace(/[<>\&\"\']/g, function (c) {
        return '&#' + c.charCodeAt(0) + ';';
    });
}
try {
  if (typeof top === 'object' && top !== null && typeof top.opener === 'object' && top.opener !== null) {
    // this is a browser window that was opened from another window

    if (! top.opener._$jscoverage) {
      top.opener._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null) {
    // this is a browser window

    try {
      if (typeof top.opener === 'object' && top.opener !== null && top.opener._$jscoverage) {
        top._$jscoverage = top.opener._$jscoverage;
      }
    }
    catch (e) {}

    if (! top._$jscoverage) {
      top._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null && top._$jscoverage) {
    this._$jscoverage = top._$jscoverage;
  }
}
catch (e) {}
if (! this._$jscoverage) {
  this._$jscoverage = {};
}
if (! _$jscoverage['/web.js']) {
  _$jscoverage['/web.js'] = {};
  _$jscoverage['/web.js'].lineData = [];
  _$jscoverage['/web.js'].lineData[6] = 0;
  _$jscoverage['/web.js'].lineData[7] = 0;
  _$jscoverage['/web.js'].lineData[8] = 0;
  _$jscoverage['/web.js'].lineData[30] = 0;
  _$jscoverage['/web.js'].lineData[32] = 0;
  _$jscoverage['/web.js'].lineData[35] = 0;
  _$jscoverage['/web.js'].lineData[37] = 0;
  _$jscoverage['/web.js'].lineData[40] = 0;
  _$jscoverage['/web.js'].lineData[48] = 0;
  _$jscoverage['/web.js'].lineData[58] = 0;
  _$jscoverage['/web.js'].lineData[59] = 0;
  _$jscoverage['/web.js'].lineData[61] = 0;
  _$jscoverage['/web.js'].lineData[62] = 0;
  _$jscoverage['/web.js'].lineData[64] = 0;
  _$jscoverage['/web.js'].lineData[65] = 0;
  _$jscoverage['/web.js'].lineData[68] = 0;
  _$jscoverage['/web.js'].lineData[69] = 0;
  _$jscoverage['/web.js'].lineData[70] = 0;
  _$jscoverage['/web.js'].lineData[73] = 0;
  _$jscoverage['/web.js'].lineData[74] = 0;
  _$jscoverage['/web.js'].lineData[75] = 0;
  _$jscoverage['/web.js'].lineData[77] = 0;
  _$jscoverage['/web.js'].lineData[78] = 0;
  _$jscoverage['/web.js'].lineData[80] = 0;
  _$jscoverage['/web.js'].lineData[88] = 0;
  _$jscoverage['/web.js'].lineData[92] = 0;
  _$jscoverage['/web.js'].lineData[93] = 0;
  _$jscoverage['/web.js'].lineData[95] = 0;
  _$jscoverage['/web.js'].lineData[96] = 0;
  _$jscoverage['/web.js'].lineData[109] = 0;
  _$jscoverage['/web.js'].lineData[110] = 0;
  _$jscoverage['/web.js'].lineData[111] = 0;
  _$jscoverage['/web.js'].lineData[113] = 0;
  _$jscoverage['/web.js'].lineData[114] = 0;
  _$jscoverage['/web.js'].lineData[115] = 0;
  _$jscoverage['/web.js'].lineData[119] = 0;
  _$jscoverage['/web.js'].lineData[121] = 0;
  _$jscoverage['/web.js'].lineData[131] = 0;
  _$jscoverage['/web.js'].lineData[132] = 0;
  _$jscoverage['/web.js'].lineData[133] = 0;
  _$jscoverage['/web.js'].lineData[134] = 0;
  _$jscoverage['/web.js'].lineData[135] = 0;
  _$jscoverage['/web.js'].lineData[136] = 0;
  _$jscoverage['/web.js'].lineData[138] = 0;
  _$jscoverage['/web.js'].lineData[139] = 0;
  _$jscoverage['/web.js'].lineData[140] = 0;
  _$jscoverage['/web.js'].lineData[141] = 0;
  _$jscoverage['/web.js'].lineData[147] = 0;
  _$jscoverage['/web.js'].lineData[148] = 0;
  _$jscoverage['/web.js'].lineData[149] = 0;
  _$jscoverage['/web.js'].lineData[152] = 0;
  _$jscoverage['/web.js'].lineData[153] = 0;
  _$jscoverage['/web.js'].lineData[155] = 0;
  _$jscoverage['/web.js'].lineData[156] = 0;
  _$jscoverage['/web.js'].lineData[157] = 0;
  _$jscoverage['/web.js'].lineData[158] = 0;
  _$jscoverage['/web.js'].lineData[160] = 0;
  _$jscoverage['/web.js'].lineData[162] = 0;
  _$jscoverage['/web.js'].lineData[163] = 0;
  _$jscoverage['/web.js'].lineData[170] = 0;
  _$jscoverage['/web.js'].lineData[173] = 0;
  _$jscoverage['/web.js'].lineData[174] = 0;
  _$jscoverage['/web.js'].lineData[175] = 0;
  _$jscoverage['/web.js'].lineData[179] = 0;
  _$jscoverage['/web.js'].lineData[182] = 0;
  _$jscoverage['/web.js'].lineData[183] = 0;
  _$jscoverage['/web.js'].lineData[184] = 0;
  _$jscoverage['/web.js'].lineData[185] = 0;
  _$jscoverage['/web.js'].lineData[188] = 0;
  _$jscoverage['/web.js'].lineData[190] = 0;
  _$jscoverage['/web.js'].lineData[191] = 0;
  _$jscoverage['/web.js'].lineData[192] = 0;
  _$jscoverage['/web.js'].lineData[193] = 0;
  _$jscoverage['/web.js'].lineData[199] = 0;
  _$jscoverage['/web.js'].lineData[203] = 0;
  _$jscoverage['/web.js'].lineData[206] = 0;
  _$jscoverage['/web.js'].lineData[207] = 0;
  _$jscoverage['/web.js'].lineData[209] = 0;
  _$jscoverage['/web.js'].lineData[213] = 0;
  _$jscoverage['/web.js'].lineData[214] = 0;
  _$jscoverage['/web.js'].lineData[215] = 0;
  _$jscoverage['/web.js'].lineData[217] = 0;
  _$jscoverage['/web.js'].lineData[218] = 0;
  _$jscoverage['/web.js'].lineData[220] = 0;
  _$jscoverage['/web.js'].lineData[223] = 0;
  _$jscoverage['/web.js'].lineData[229] = 0;
  _$jscoverage['/web.js'].lineData[230] = 0;
  _$jscoverage['/web.js'].lineData[237] = 0;
  _$jscoverage['/web.js'].lineData[239] = 0;
  _$jscoverage['/web.js'].lineData[240] = 0;
  _$jscoverage['/web.js'].lineData[241] = 0;
}
if (! _$jscoverage['/web.js'].functionData) {
  _$jscoverage['/web.js'].functionData = [];
  _$jscoverage['/web.js'].functionData[0] = 0;
  _$jscoverage['/web.js'].functionData[1] = 0;
  _$jscoverage['/web.js'].functionData[2] = 0;
  _$jscoverage['/web.js'].functionData[3] = 0;
  _$jscoverage['/web.js'].functionData[4] = 0;
  _$jscoverage['/web.js'].functionData[5] = 0;
  _$jscoverage['/web.js'].functionData[6] = 0;
  _$jscoverage['/web.js'].functionData[7] = 0;
  _$jscoverage['/web.js'].functionData[8] = 0;
  _$jscoverage['/web.js'].functionData[9] = 0;
  _$jscoverage['/web.js'].functionData[10] = 0;
  _$jscoverage['/web.js'].functionData[11] = 0;
  _$jscoverage['/web.js'].functionData[12] = 0;
  _$jscoverage['/web.js'].functionData[13] = 0;
  _$jscoverage['/web.js'].functionData[14] = 0;
  _$jscoverage['/web.js'].functionData[15] = 0;
  _$jscoverage['/web.js'].functionData[16] = 0;
  _$jscoverage['/web.js'].functionData[17] = 0;
  _$jscoverage['/web.js'].functionData[18] = 0;
}
if (! _$jscoverage['/web.js'].branchData) {
  _$jscoverage['/web.js'].branchData = {};
  _$jscoverage['/web.js'].branchData['12'] = [];
  _$jscoverage['/web.js'].branchData['12'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['24'] = [];
  _$jscoverage['/web.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['48'] = [];
  _$jscoverage['/web.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['48'][2] = new BranchData();
  _$jscoverage['/web.js'].branchData['48'][3] = new BranchData();
  _$jscoverage['/web.js'].branchData['58'] = [];
  _$jscoverage['/web.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['64'] = [];
  _$jscoverage['/web.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['77'] = [];
  _$jscoverage['/web.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['77'][2] = new BranchData();
  _$jscoverage['/web.js'].branchData['88'] = [];
  _$jscoverage['/web.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['92'] = [];
  _$jscoverage['/web.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['109'] = [];
  _$jscoverage['/web.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['113'] = [];
  _$jscoverage['/web.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['134'] = [];
  _$jscoverage['/web.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['139'] = [];
  _$jscoverage['/web.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['148'] = [];
  _$jscoverage['/web.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['152'] = [];
  _$jscoverage['/web.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['156'] = [];
  _$jscoverage['/web.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['160'] = [];
  _$jscoverage['/web.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['173'] = [];
  _$jscoverage['/web.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['173'][2] = new BranchData();
  _$jscoverage['/web.js'].branchData['182'] = [];
  _$jscoverage['/web.js'].branchData['182'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['191'] = [];
  _$jscoverage['/web.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['204'] = [];
  _$jscoverage['/web.js'].branchData['204'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['207'] = [];
  _$jscoverage['/web.js'].branchData['207'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['213'] = [];
  _$jscoverage['/web.js'].branchData['213'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['229'] = [];
  _$jscoverage['/web.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['229'][2] = new BranchData();
  _$jscoverage['/web.js'].branchData['229'][3] = new BranchData();
  _$jscoverage['/web.js'].branchData['239'] = [];
  _$jscoverage['/web.js'].branchData['239'][1] = new BranchData();
}
_$jscoverage['/web.js'].branchData['239'][1].init(7626, 5, 'UA.ie');
function visit664_239_1(result) {
  _$jscoverage['/web.js'].branchData['239'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['229'][3].init(7345, 24, 'location.search || EMPTY');
function visit663_229_3(result) {
  _$jscoverage['/web.js'].branchData['229'][3].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['229'][2].init(7345, 52, '(location.search || EMPTY).indexOf(\'ks-debug\') !== -1');
function visit662_229_2(result) {
  _$jscoverage['/web.js'].branchData['229'][2].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['229'][1].init(7332, 65, 'location && (location.search || EMPTY).indexOf(\'ks-debug\') !== -1');
function visit661_229_1(result) {
  _$jscoverage['/web.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['213'][1].init(907, 20, 'doScroll && notframe');
function visit660_213_1(result) {
  _$jscoverage['/web.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['207'][1].init(29, 25, 'win.frameElement === null');
function visit659_207_1(result) {
  _$jscoverage['/web.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['204'][1].init(40, 27, 'docElem && docElem.doScroll');
function visit658_204_1(result) {
  _$jscoverage['/web.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['191'][1].init(21, 27, 'doc.readyState === COMPLETE');
function visit657_191_1(result) {
  _$jscoverage['/web.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['182'][1].init(361, 18, 'standardEventModel');
function visit656_182_1(result) {
  _$jscoverage['/web.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['173'][2].init(125, 27, 'doc.readyState === COMPLETE');
function visit655_173_2(result) {
  _$jscoverage['/web.js'].branchData['173'][2].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['173'][1].init(117, 35, '!doc || doc.readyState === COMPLETE');
function visit654_173_1(result) {
  _$jscoverage['/web.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['160'][1].init(23, 12, 'e.stack || e');
function visit653_160_1(result) {
  _$jscoverage['/web.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['156'][1].init(223, 20, 'i < callbacks.length');
function visit652_156_1(result) {
  _$jscoverage['/web.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['152'][1].init(85, 17, 'doc && !UA.nodejs');
function visit651_152_1(result) {
  _$jscoverage['/web.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['148'][1].init(13, 8, 'domReady');
function visit650_148_1(result) {
  _$jscoverage['/web.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['139'][1].init(205, 4, 'node');
function visit649_139_1(result) {
  _$jscoverage['/web.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['134'][1].init(21, 27, '++retryCount > POLL_RETIRES');
function visit648_134_1(result) {
  _$jscoverage['/web.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['113'][1].init(27, 12, 'e.stack || e');
function visit647_113_1(result) {
  _$jscoverage['/web.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['109'][1].init(17, 8, 'domReady');
function visit646_109_1(result) {
  _$jscoverage['/web.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['92'][1].init(269, 14, 'win.execScript');
function visit645_92_1(result) {
  _$jscoverage['/web.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['88'][1].init(17, 36, 'data && RE_NOT_WHITESPACE.test(data)');
function visit644_88_1(result) {
  _$jscoverage['/web.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['77'][2].init(711, 70, '!xml.documentElement || xml.getElementsByTagName(\'parsererror\').length');
function visit643_77_2(result) {
  _$jscoverage['/web.js'].branchData['77'][2].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['77'][1].init(703, 78, '!xml || !xml.documentElement || xml.getElementsByTagName(\'parsererror\').length');
function visit642_77_1(result) {
  _$jscoverage['/web.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['64'][1].init(49, 13, 'win.DOMParser');
function visit641_64_1(result) {
  _$jscoverage['/web.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['58'][1].init(46, 20, 'data.documentElement');
function visit640_58_1(result) {
  _$jscoverage['/web.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['48'][3].init(106, 17, 'obj == obj.window');
function visit639_48_3(result) {
  _$jscoverage['/web.js'].branchData['48'][3].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['48'][2].init(91, 11, 'obj != null');
function visit638_48_2(result) {
  _$jscoverage['/web.js'].branchData['48'][2].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['48'][1].init(91, 32, 'obj != null && obj == obj.window');
function visit637_48_1(result) {
  _$jscoverage['/web.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['24'][1].init(464, 27, 'doc && doc.addEventListener');
function visit636_24_1(result) {
  _$jscoverage['/web.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['12'][1].init(87, 26, 'doc && doc.documentElement');
function visit635_12_1(result) {
  _$jscoverage['/web.js'].branchData['12'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].lineData[6]++;
(function(S, undefined) {
  _$jscoverage['/web.js'].functionData[0]++;
  _$jscoverage['/web.js'].lineData[7]++;
  var logger = S.getLogger('s/web');
  _$jscoverage['/web.js'].lineData[8]++;
  var win = S.Env.host, UA = S.UA, doc = win.document, docElem = visit635_12_1(doc && doc.documentElement), location = win.location, EMPTY = '', domReady = 0, callbacks = [], POLL_RETIRES = 500, POLL_INTERVAL = 40, RE_ID_STR = /^#?([\w-]+)$/, RE_NOT_WHITESPACE = /\S/, standardEventModel = !!(visit636_24_1(doc && doc.addEventListener)), DOM_READY_EVENT = 'DOMContentLoaded', READY_STATE_CHANGE_EVENT = 'readystatechange', LOAD_EVENT = 'load', COMPLETE = 'complete', addEventListener = standardEventModel ? function(el, type, fn) {
  _$jscoverage['/web.js'].functionData[1]++;
  _$jscoverage['/web.js'].lineData[30]++;
  el.addEventListener(type, fn, false);
} : function(el, type, fn) {
  _$jscoverage['/web.js'].functionData[2]++;
  _$jscoverage['/web.js'].lineData[32]++;
  el.attachEvent('on' + type, fn);
}, removeEventListener = standardEventModel ? function(el, type, fn) {
  _$jscoverage['/web.js'].functionData[3]++;
  _$jscoverage['/web.js'].lineData[35]++;
  el.removeEventListener(type, fn, false);
} : function(el, type, fn) {
  _$jscoverage['/web.js'].functionData[4]++;
  _$jscoverage['/web.js'].lineData[37]++;
  el.detachEvent('on' + type, fn);
};
  _$jscoverage['/web.js'].lineData[40]++;
  S.mix(S, {
  isWindow: function(obj) {
  _$jscoverage['/web.js'].functionData[5]++;
  _$jscoverage['/web.js'].lineData[48]++;
  return visit637_48_1(visit638_48_2(obj != null) && visit639_48_3(obj == obj.window));
}, 
  parseXML: function(data) {
  _$jscoverage['/web.js'].functionData[6]++;
  _$jscoverage['/web.js'].lineData[58]++;
  if (visit640_58_1(data.documentElement)) {
    _$jscoverage['/web.js'].lineData[59]++;
    return data;
  }
  _$jscoverage['/web.js'].lineData[61]++;
  var xml;
  _$jscoverage['/web.js'].lineData[62]++;
  try {
    _$jscoverage['/web.js'].lineData[64]++;
    if (visit641_64_1(win.DOMParser)) {
      _$jscoverage['/web.js'].lineData[65]++;
      xml = new DOMParser().parseFromString(data, 'text/xml');
    } else {
      _$jscoverage['/web.js'].lineData[68]++;
      xml = new ActiveXObject('Microsoft.XMLDOM');
      _$jscoverage['/web.js'].lineData[69]++;
      xml.async = false;
      _$jscoverage['/web.js'].lineData[70]++;
      xml.loadXML(data);
    }
  }  catch (e) {
  _$jscoverage['/web.js'].lineData[73]++;
  logger.error('parseXML error :');
  _$jscoverage['/web.js'].lineData[74]++;
  logger.error(e);
  _$jscoverage['/web.js'].lineData[75]++;
  xml = undefined;
}
  _$jscoverage['/web.js'].lineData[77]++;
  if (visit642_77_1(!xml || visit643_77_2(!xml.documentElement || xml.getElementsByTagName('parsererror').length))) {
    _$jscoverage['/web.js'].lineData[78]++;
    S.error('Invalid XML: ' + data);
  }
  _$jscoverage['/web.js'].lineData[80]++;
  return xml;
}, 
  globalEval: function(data) {
  _$jscoverage['/web.js'].functionData[7]++;
  _$jscoverage['/web.js'].lineData[88]++;
  if (visit644_88_1(data && RE_NOT_WHITESPACE.test(data))) {
    _$jscoverage['/web.js'].lineData[92]++;
    if (visit645_92_1(win.execScript)) {
      _$jscoverage['/web.js'].lineData[93]++;
      win.execScript(data);
    } else {
      _$jscoverage['/web.js'].lineData[95]++;
      (function(data) {
  _$jscoverage['/web.js'].functionData[8]++;
  _$jscoverage['/web.js'].lineData[96]++;
  win['eval'].call(win, data);
})(data);
    }
  }
}, 
  ready: function(fn) {
  _$jscoverage['/web.js'].functionData[9]++;
  _$jscoverage['/web.js'].lineData[109]++;
  if (visit646_109_1(domReady)) {
    _$jscoverage['/web.js'].lineData[110]++;
    try {
      _$jscoverage['/web.js'].lineData[111]++;
      fn(S);
    }    catch (e) {
  _$jscoverage['/web.js'].lineData[113]++;
  S.log(visit647_113_1(e.stack || e), 'error');
  _$jscoverage['/web.js'].lineData[114]++;
  setTimeout(function() {
  _$jscoverage['/web.js'].functionData[10]++;
  _$jscoverage['/web.js'].lineData[115]++;
  throw e;
}, 0);
}
  } else {
    _$jscoverage['/web.js'].lineData[119]++;
    callbacks.push(fn);
  }
  _$jscoverage['/web.js'].lineData[121]++;
  return this;
}, 
  available: function(id, fn) {
  _$jscoverage['/web.js'].functionData[11]++;
  _$jscoverage['/web.js'].lineData[131]++;
  id = (id + EMPTY).match(RE_ID_STR)[1];
  _$jscoverage['/web.js'].lineData[132]++;
  var retryCount = 1;
  _$jscoverage['/web.js'].lineData[133]++;
  var timer = S.later(function() {
  _$jscoverage['/web.js'].functionData[12]++;
  _$jscoverage['/web.js'].lineData[134]++;
  if (visit648_134_1(++retryCount > POLL_RETIRES)) {
    _$jscoverage['/web.js'].lineData[135]++;
    timer.cancel();
    _$jscoverage['/web.js'].lineData[136]++;
    return;
  }
  _$jscoverage['/web.js'].lineData[138]++;
  var node = doc.getElementById(id);
  _$jscoverage['/web.js'].lineData[139]++;
  if (visit649_139_1(node)) {
    _$jscoverage['/web.js'].lineData[140]++;
    fn(node);
    _$jscoverage['/web.js'].lineData[141]++;
    timer.cancel();
  }
}, POLL_INTERVAL, true);
}});
  _$jscoverage['/web.js'].lineData[147]++;
  function fireReady() {
    _$jscoverage['/web.js'].functionData[13]++;
    _$jscoverage['/web.js'].lineData[148]++;
    if (visit650_148_1(domReady)) {
      _$jscoverage['/web.js'].lineData[149]++;
      return;
    }
    _$jscoverage['/web.js'].lineData[152]++;
    if (visit651_152_1(doc && !UA.nodejs)) {
      _$jscoverage['/web.js'].lineData[153]++;
      removeEventListener(win, LOAD_EVENT, fireReady);
    }
    _$jscoverage['/web.js'].lineData[155]++;
    domReady = 1;
    _$jscoverage['/web.js'].lineData[156]++;
    for (var i = 0; visit652_156_1(i < callbacks.length); i++) {
      _$jscoverage['/web.js'].lineData[157]++;
      try {
        _$jscoverage['/web.js'].lineData[158]++;
        callbacks[i](S);
      }      catch (e) {
  _$jscoverage['/web.js'].lineData[160]++;
  S.log(visit653_160_1(e.stack || e), 'error');
  _$jscoverage['/web.js'].lineData[162]++;
  setTimeout(function() {
  _$jscoverage['/web.js'].functionData[14]++;
  _$jscoverage['/web.js'].lineData[163]++;
  throw e;
}, 0);
}
    }
  }
  _$jscoverage['/web.js'].lineData[170]++;
  function bindReady() {
    _$jscoverage['/web.js'].functionData[15]++;
    _$jscoverage['/web.js'].lineData[173]++;
    if (visit654_173_1(!doc || visit655_173_2(doc.readyState === COMPLETE))) {
      _$jscoverage['/web.js'].lineData[174]++;
      fireReady();
      _$jscoverage['/web.js'].lineData[175]++;
      return;
    }
    _$jscoverage['/web.js'].lineData[179]++;
    addEventListener(win, LOAD_EVENT, fireReady);
    _$jscoverage['/web.js'].lineData[182]++;
    if (visit656_182_1(standardEventModel)) {
      _$jscoverage['/web.js'].lineData[183]++;
      var domReady = function() {
  _$jscoverage['/web.js'].functionData[16]++;
  _$jscoverage['/web.js'].lineData[184]++;
  removeEventListener(doc, DOM_READY_EVENT, domReady);
  _$jscoverage['/web.js'].lineData[185]++;
  fireReady();
};
      _$jscoverage['/web.js'].lineData[188]++;
      addEventListener(doc, DOM_READY_EVENT, domReady);
    } else {
      _$jscoverage['/web.js'].lineData[190]++;
      var stateChange = function() {
  _$jscoverage['/web.js'].functionData[17]++;
  _$jscoverage['/web.js'].lineData[191]++;
  if (visit657_191_1(doc.readyState === COMPLETE)) {
    _$jscoverage['/web.js'].lineData[192]++;
    removeEventListener(doc, READY_STATE_CHANGE_EVENT, stateChange);
    _$jscoverage['/web.js'].lineData[193]++;
    fireReady();
  }
};
      _$jscoverage['/web.js'].lineData[199]++;
      addEventListener(doc, READY_STATE_CHANGE_EVENT, stateChange);
      _$jscoverage['/web.js'].lineData[203]++;
      var notframe, doScroll = visit658_204_1(docElem && docElem.doScroll);
      _$jscoverage['/web.js'].lineData[206]++;
      try {
        _$jscoverage['/web.js'].lineData[207]++;
        notframe = (visit659_207_1(win.frameElement === null));
      }      catch (e) {
  _$jscoverage['/web.js'].lineData[209]++;
  notframe = false;
}
      _$jscoverage['/web.js'].lineData[213]++;
      if (visit660_213_1(doScroll && notframe)) {
        _$jscoverage['/web.js'].lineData[214]++;
        var readyScroll = function() {
  _$jscoverage['/web.js'].functionData[18]++;
  _$jscoverage['/web.js'].lineData[215]++;
  try {
    _$jscoverage['/web.js'].lineData[217]++;
    doScroll('left');
    _$jscoverage['/web.js'].lineData[218]++;
    fireReady();
  }  catch (ex) {
  _$jscoverage['/web.js'].lineData[220]++;
  setTimeout(readyScroll, POLL_INTERVAL);
}
};
        _$jscoverage['/web.js'].lineData[223]++;
        readyScroll();
      }
    }
  }
  _$jscoverage['/web.js'].lineData[229]++;
  if (visit661_229_1(location && visit662_229_2((visit663_229_3(location.search || EMPTY)).indexOf('ks-debug') !== -1))) {
    _$jscoverage['/web.js'].lineData[230]++;
    S.Config.debug = true;
  }
  _$jscoverage['/web.js'].lineData[237]++;
  bindReady();
  _$jscoverage['/web.js'].lineData[239]++;
  if (visit664_239_1(UA.ie)) {
    _$jscoverage['/web.js'].lineData[240]++;
    try {
      _$jscoverage['/web.js'].lineData[241]++;
      doc.execCommand('BackgroundImageCache', false, true);
    }    catch (e) {
}
  }
})(KISSY, undefined);
