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
if (! _$jscoverage['/lang/escape.js']) {
  _$jscoverage['/lang/escape.js'] = {};
  _$jscoverage['/lang/escape.js'].lineData = [];
  _$jscoverage['/lang/escape.js'].lineData[7] = 0;
  _$jscoverage['/lang/escape.js'].lineData[11] = 0;
  _$jscoverage['/lang/escape.js'].lineData[12] = 0;
  _$jscoverage['/lang/escape.js'].lineData[36] = 0;
  _$jscoverage['/lang/escape.js'].lineData[37] = 0;
  _$jscoverage['/lang/escape.js'].lineData[38] = 0;
  _$jscoverage['/lang/escape.js'].lineData[42] = 0;
  _$jscoverage['/lang/escape.js'].lineData[43] = 0;
  _$jscoverage['/lang/escape.js'].lineData[45] = 0;
  _$jscoverage['/lang/escape.js'].lineData[48] = 0;
  _$jscoverage['/lang/escape.js'].lineData[49] = 0;
  _$jscoverage['/lang/escape.js'].lineData[50] = 0;
  _$jscoverage['/lang/escape.js'].lineData[52] = 0;
  _$jscoverage['/lang/escape.js'].lineData[53] = 0;
  _$jscoverage['/lang/escape.js'].lineData[54] = 0;
  _$jscoverage['/lang/escape.js'].lineData[56] = 0;
  _$jscoverage['/lang/escape.js'].lineData[57] = 0;
  _$jscoverage['/lang/escape.js'].lineData[58] = 0;
  _$jscoverage['/lang/escape.js'].lineData[61] = 0;
  _$jscoverage['/lang/escape.js'].lineData[62] = 0;
  _$jscoverage['/lang/escape.js'].lineData[63] = 0;
  _$jscoverage['/lang/escape.js'].lineData[65] = 0;
  _$jscoverage['/lang/escape.js'].lineData[66] = 0;
  _$jscoverage['/lang/escape.js'].lineData[67] = 0;
  _$jscoverage['/lang/escape.js'].lineData[69] = 0;
  _$jscoverage['/lang/escape.js'].lineData[70] = 0;
  _$jscoverage['/lang/escape.js'].lineData[71] = 0;
  _$jscoverage['/lang/escape.js'].lineData[74] = 0;
  _$jscoverage['/lang/escape.js'].lineData[83] = 0;
  _$jscoverage['/lang/escape.js'].lineData[94] = 0;
  _$jscoverage['/lang/escape.js'].lineData[103] = 0;
  _$jscoverage['/lang/escape.js'].lineData[104] = 0;
  _$jscoverage['/lang/escape.js'].lineData[121] = 0;
  _$jscoverage['/lang/escape.js'].lineData[122] = 0;
  _$jscoverage['/lang/escape.js'].lineData[133] = 0;
  _$jscoverage['/lang/escape.js'].lineData[145] = 0;
  _$jscoverage['/lang/escape.js'].lineData[146] = 0;
  _$jscoverage['/lang/escape.js'].lineData[168] = 0;
  _$jscoverage['/lang/escape.js'].lineData[169] = 0;
  _$jscoverage['/lang/escape.js'].lineData[170] = 0;
  _$jscoverage['/lang/escape.js'].lineData[171] = 0;
  _$jscoverage['/lang/escape.js'].lineData[173] = 0;
  _$jscoverage['/lang/escape.js'].lineData[175] = 0;
  _$jscoverage['/lang/escape.js'].lineData[177] = 0;
  _$jscoverage['/lang/escape.js'].lineData[178] = 0;
  _$jscoverage['/lang/escape.js'].lineData[181] = 0;
  _$jscoverage['/lang/escape.js'].lineData[182] = 0;
  _$jscoverage['/lang/escape.js'].lineData[183] = 0;
  _$jscoverage['/lang/escape.js'].lineData[184] = 0;
  _$jscoverage['/lang/escape.js'].lineData[186] = 0;
  _$jscoverage['/lang/escape.js'].lineData[187] = 0;
  _$jscoverage['/lang/escape.js'].lineData[189] = 0;
  _$jscoverage['/lang/escape.js'].lineData[190] = 0;
  _$jscoverage['/lang/escape.js'].lineData[191] = 0;
  _$jscoverage['/lang/escape.js'].lineData[192] = 0;
  _$jscoverage['/lang/escape.js'].lineData[193] = 0;
  _$jscoverage['/lang/escape.js'].lineData[194] = 0;
  _$jscoverage['/lang/escape.js'].lineData[196] = 0;
  _$jscoverage['/lang/escape.js'].lineData[203] = 0;
  _$jscoverage['/lang/escape.js'].lineData[204] = 0;
  _$jscoverage['/lang/escape.js'].lineData[223] = 0;
  _$jscoverage['/lang/escape.js'].lineData[224] = 0;
  _$jscoverage['/lang/escape.js'].lineData[226] = 0;
  _$jscoverage['/lang/escape.js'].lineData[227] = 0;
  _$jscoverage['/lang/escape.js'].lineData[228] = 0;
  _$jscoverage['/lang/escape.js'].lineData[235] = 0;
  _$jscoverage['/lang/escape.js'].lineData[236] = 0;
  _$jscoverage['/lang/escape.js'].lineData[237] = 0;
  _$jscoverage['/lang/escape.js'].lineData[238] = 0;
  _$jscoverage['/lang/escape.js'].lineData[239] = 0;
  _$jscoverage['/lang/escape.js'].lineData[242] = 0;
  _$jscoverage['/lang/escape.js'].lineData[243] = 0;
  _$jscoverage['/lang/escape.js'].lineData[244] = 0;
  _$jscoverage['/lang/escape.js'].lineData[245] = 0;
  _$jscoverage['/lang/escape.js'].lineData[247] = 0;
  _$jscoverage['/lang/escape.js'].lineData[248] = 0;
  _$jscoverage['/lang/escape.js'].lineData[250] = 0;
  _$jscoverage['/lang/escape.js'].lineData[251] = 0;
  _$jscoverage['/lang/escape.js'].lineData[254] = 0;
  _$jscoverage['/lang/escape.js'].lineData[255] = 0;
  _$jscoverage['/lang/escape.js'].lineData[256] = 0;
  _$jscoverage['/lang/escape.js'].lineData[258] = 0;
  _$jscoverage['/lang/escape.js'].lineData[261] = 0;
  _$jscoverage['/lang/escape.js'].lineData[264] = 0;
  _$jscoverage['/lang/escape.js'].lineData[268] = 0;
  _$jscoverage['/lang/escape.js'].lineData[269] = 0;
}
if (! _$jscoverage['/lang/escape.js'].functionData) {
  _$jscoverage['/lang/escape.js'].functionData = [];
  _$jscoverage['/lang/escape.js'].functionData[0] = 0;
  _$jscoverage['/lang/escape.js'].functionData[1] = 0;
  _$jscoverage['/lang/escape.js'].functionData[2] = 0;
  _$jscoverage['/lang/escape.js'].functionData[3] = 0;
  _$jscoverage['/lang/escape.js'].functionData[4] = 0;
  _$jscoverage['/lang/escape.js'].functionData[5] = 0;
  _$jscoverage['/lang/escape.js'].functionData[6] = 0;
  _$jscoverage['/lang/escape.js'].functionData[7] = 0;
  _$jscoverage['/lang/escape.js'].functionData[8] = 0;
  _$jscoverage['/lang/escape.js'].functionData[9] = 0;
  _$jscoverage['/lang/escape.js'].functionData[10] = 0;
  _$jscoverage['/lang/escape.js'].functionData[11] = 0;
  _$jscoverage['/lang/escape.js'].functionData[12] = 0;
  _$jscoverage['/lang/escape.js'].functionData[13] = 0;
  _$jscoverage['/lang/escape.js'].functionData[14] = 0;
  _$jscoverage['/lang/escape.js'].functionData[15] = 0;
  _$jscoverage['/lang/escape.js'].functionData[16] = 0;
  _$jscoverage['/lang/escape.js'].functionData[17] = 0;
}
if (! _$jscoverage['/lang/escape.js'].branchData) {
  _$jscoverage['/lang/escape.js'].branchData = {};
  _$jscoverage['/lang/escape.js'].branchData['45'] = [];
  _$jscoverage['/lang/escape.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['45'][2] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['45'][3] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['45'][4] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['45'][5] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['49'] = [];
  _$jscoverage['/lang/escape.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['62'] = [];
  _$jscoverage['/lang/escape.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['146'] = [];
  _$jscoverage['/lang/escape.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['168'] = [];
  _$jscoverage['/lang/escape.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['169'] = [];
  _$jscoverage['/lang/escape.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['170'] = [];
  _$jscoverage['/lang/escape.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['181'] = [];
  _$jscoverage['/lang/escape.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['183'] = [];
  _$jscoverage['/lang/escape.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['187'] = [];
  _$jscoverage['/lang/escape.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['189'] = [];
  _$jscoverage['/lang/escape.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['191'] = [];
  _$jscoverage['/lang/escape.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['193'] = [];
  _$jscoverage['/lang/escape.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['223'] = [];
  _$jscoverage['/lang/escape.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['223'][2] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['226'] = [];
  _$jscoverage['/lang/escape.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['227'] = [];
  _$jscoverage['/lang/escape.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['235'] = [];
  _$jscoverage['/lang/escape.js'].branchData['235'][1] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['237'] = [];
  _$jscoverage['/lang/escape.js'].branchData['237'][1] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['250'] = [];
  _$jscoverage['/lang/escape.js'].branchData['250'][1] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['254'] = [];
  _$jscoverage['/lang/escape.js'].branchData['254'][1] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['255'] = [];
  _$jscoverage['/lang/escape.js'].branchData['255'][1] = new BranchData();
}
_$jscoverage['/lang/escape.js'].branchData['255'][1].init(25, 19, 'S.isArray(ret[key])');
function visit152_255_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['255'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['254'][1].init(779, 10, 'key in ret');
function visit151_254_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['254'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['250'][1].init(438, 21, 'S.endsWith(key, \'[]\')');
function visit150_250_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['250'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['237'][1].init(69, 14, 'eqIndex === -1');
function visit149_237_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['237'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['235'][1].init(384, 7, 'i < len');
function visit148_235_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['235'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['227'][1].init(156, 8, 'eq || EQ');
function visit147_227_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['226'][1].init(127, 10, 'sep || SEP');
function visit146_226_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['223'][2].init(17, 23, 'typeof str !== \'string\'');
function visit145_223_2(result) {
  _$jscoverage['/lang/escape.js'].branchData['223'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['223'][1].init(17, 47, 'typeof str !== \'string\' || !(str = S.trim(str))');
function visit144_223_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['193'][1].init(117, 15, 'v !== undefined');
function visit143_193_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['191'][1].init(65, 20, 'isValidParamValue(v)');
function visit142_191_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['189'][1].init(97, 7, 'i < len');
function visit141_189_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['187'][1].init(386, 28, 'S.isArray(val) && val.length');
function visit140_187_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['183'][1].init(60, 17, 'val !== undefined');
function visit139_183_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['181'][1].init(136, 22, 'isValidParamValue(val)');
function visit138_181_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['170'][1].init(74, 28, 'serializeArray === undefined');
function visit137_170_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['169'][1].init(48, 8, 'eq || EQ');
function visit136_169_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['168'][1].init(19, 10, 'sep || SEP');
function visit135_168_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['146'][1].init(24, 42, 'htmlEntities[m] || String.fromCharCode(+n)');
function visit134_146_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['62'][1].init(13, 11, 'unEscapeReg');
function visit133_62_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['49'][1].init(13, 9, 'escapeReg');
function visit132_49_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['45'][5].init(166, 16, 't !== \'function\'');
function visit131_45_5(result) {
  _$jscoverage['/lang/escape.js'].branchData['45'][5].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['45'][4].init(148, 14, 't !== \'object\'');
function visit130_45_4(result) {
  _$jscoverage['/lang/escape.js'].branchData['45'][4].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['45'][3].init(148, 34, 't !== \'object\' && t !== \'function\'');
function visit129_45_3(result) {
  _$jscoverage['/lang/escape.js'].branchData['45'][3].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['45'][2].init(132, 11, 'val == null');
function visit128_45_2(result) {
  _$jscoverage['/lang/escape.js'].branchData['45'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['45'][1].init(132, 51, 'val == null || (t !== \'object\' && t !== \'function\')');
function visit127_45_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].lineData[7]++;
(function(S, undefined) {
  _$jscoverage['/lang/escape.js'].functionData[0]++;
  _$jscoverage['/lang/escape.js'].lineData[11]++;
  var logger = S.getLogger('s/lang');
  _$jscoverage['/lang/escape.js'].lineData[12]++;
  var SEP = '&', EMPTY = '', EQ = '=', TRUE = true, HEX_BASE = 16, htmlEntities = {
  '&amp;': '&', 
  '&gt;': '>', 
  '&lt;': '<', 
  '&#x60;': '`', 
  '&#x2F;': '/', 
  '&quot;': '"', 
  '&#x27;': "'"}, reverseEntities = {}, escapeReg, unEscapeReg, escapeRegExp = /[\-#$\^*()+\[\]{}|\\,.?\s]/g;
  _$jscoverage['/lang/escape.js'].lineData[36]++;
  (function() {
  _$jscoverage['/lang/escape.js'].functionData[1]++;
  _$jscoverage['/lang/escape.js'].lineData[37]++;
  for (var k in htmlEntities) {
    _$jscoverage['/lang/escape.js'].lineData[38]++;
    reverseEntities[htmlEntities[k]] = k;
  }
})();
  _$jscoverage['/lang/escape.js'].lineData[42]++;
  function isValidParamValue(val) {
    _$jscoverage['/lang/escape.js'].functionData[2]++;
    _$jscoverage['/lang/escape.js'].lineData[43]++;
    var t = typeof val;
    _$jscoverage['/lang/escape.js'].lineData[45]++;
    return visit127_45_1(visit128_45_2(val == null) || (visit129_45_3(visit130_45_4(t !== 'object') && visit131_45_5(t !== 'function'))));
  }
  _$jscoverage['/lang/escape.js'].lineData[48]++;
  function getEscapeReg() {
    _$jscoverage['/lang/escape.js'].functionData[3]++;
    _$jscoverage['/lang/escape.js'].lineData[49]++;
    if (visit132_49_1(escapeReg)) {
      _$jscoverage['/lang/escape.js'].lineData[50]++;
      return escapeReg;
    }
    _$jscoverage['/lang/escape.js'].lineData[52]++;
    var str = EMPTY;
    _$jscoverage['/lang/escape.js'].lineData[53]++;
    S.each(htmlEntities, function(entity) {
  _$jscoverage['/lang/escape.js'].functionData[4]++;
  _$jscoverage['/lang/escape.js'].lineData[54]++;
  str += entity + '|';
});
    _$jscoverage['/lang/escape.js'].lineData[56]++;
    str = str.slice(0, -1);
    _$jscoverage['/lang/escape.js'].lineData[57]++;
    escapeReg = new RegExp(str, 'g');
    _$jscoverage['/lang/escape.js'].lineData[58]++;
    return escapeReg;
  }
  _$jscoverage['/lang/escape.js'].lineData[61]++;
  function getUnEscapeReg() {
    _$jscoverage['/lang/escape.js'].functionData[5]++;
    _$jscoverage['/lang/escape.js'].lineData[62]++;
    if (visit133_62_1(unEscapeReg)) {
      _$jscoverage['/lang/escape.js'].lineData[63]++;
      return unEscapeReg;
    }
    _$jscoverage['/lang/escape.js'].lineData[65]++;
    var str = EMPTY;
    _$jscoverage['/lang/escape.js'].lineData[66]++;
    S.each(reverseEntities, function(entity) {
  _$jscoverage['/lang/escape.js'].functionData[6]++;
  _$jscoverage['/lang/escape.js'].lineData[67]++;
  str += entity + '|';
});
    _$jscoverage['/lang/escape.js'].lineData[69]++;
    str += '&#(\\d{1,5});';
    _$jscoverage['/lang/escape.js'].lineData[70]++;
    unEscapeReg = new RegExp(str, 'g');
    _$jscoverage['/lang/escape.js'].lineData[71]++;
    return unEscapeReg;
  }
  _$jscoverage['/lang/escape.js'].lineData[74]++;
  S.mix(S, {
  urlEncode: function(s) {
  _$jscoverage['/lang/escape.js'].functionData[7]++;
  _$jscoverage['/lang/escape.js'].lineData[83]++;
  return encodeURIComponent(String(s));
}, 
  urlDecode: function(s) {
  _$jscoverage['/lang/escape.js'].functionData[8]++;
  _$jscoverage['/lang/escape.js'].lineData[94]++;
  return decodeURIComponent(s.replace(/\+/g, ' '));
}, 
  fromUnicode: function(str) {
  _$jscoverage['/lang/escape.js'].functionData[9]++;
  _$jscoverage['/lang/escape.js'].lineData[103]++;
  return str.replace(/\\u([a-f\d]{4})/ig, function(m, u) {
  _$jscoverage['/lang/escape.js'].functionData[10]++;
  _$jscoverage['/lang/escape.js'].lineData[104]++;
  return String.fromCharCode(parseInt(u, HEX_BASE));
});
}, 
  escapeHtml: function(str) {
  _$jscoverage['/lang/escape.js'].functionData[11]++;
  _$jscoverage['/lang/escape.js'].lineData[121]++;
  return (str + '').replace(getEscapeReg(), function(m) {
  _$jscoverage['/lang/escape.js'].functionData[12]++;
  _$jscoverage['/lang/escape.js'].lineData[122]++;
  return reverseEntities[m];
});
}, 
  escapeRegExp: function(str) {
  _$jscoverage['/lang/escape.js'].functionData[13]++;
  _$jscoverage['/lang/escape.js'].lineData[133]++;
  return str.replace(escapeRegExp, '\\$&');
}, 
  unEscapeHtml: function(str) {
  _$jscoverage['/lang/escape.js'].functionData[14]++;
  _$jscoverage['/lang/escape.js'].lineData[145]++;
  return str.replace(getUnEscapeReg(), function(m, n) {
  _$jscoverage['/lang/escape.js'].functionData[15]++;
  _$jscoverage['/lang/escape.js'].lineData[146]++;
  return visit134_146_1(htmlEntities[m] || String.fromCharCode(+n));
});
}, 
  param: function(o, sep, eq, serializeArray) {
  _$jscoverage['/lang/escape.js'].functionData[16]++;
  _$jscoverage['/lang/escape.js'].lineData[168]++;
  sep = visit135_168_1(sep || SEP);
  _$jscoverage['/lang/escape.js'].lineData[169]++;
  eq = visit136_169_1(eq || EQ);
  _$jscoverage['/lang/escape.js'].lineData[170]++;
  if (visit137_170_1(serializeArray === undefined)) {
    _$jscoverage['/lang/escape.js'].lineData[171]++;
    serializeArray = TRUE;
  }
  _$jscoverage['/lang/escape.js'].lineData[173]++;
  var buf = [], key, i, v, len, val, encode = S.urlEncode;
  _$jscoverage['/lang/escape.js'].lineData[175]++;
  for (key in o) {
    _$jscoverage['/lang/escape.js'].lineData[177]++;
    val = o[key];
    _$jscoverage['/lang/escape.js'].lineData[178]++;
    key = encode(key);
    _$jscoverage['/lang/escape.js'].lineData[181]++;
    if (visit138_181_1(isValidParamValue(val))) {
      _$jscoverage['/lang/escape.js'].lineData[182]++;
      buf.push(key);
      _$jscoverage['/lang/escape.js'].lineData[183]++;
      if (visit139_183_1(val !== undefined)) {
        _$jscoverage['/lang/escape.js'].lineData[184]++;
        buf.push(eq, encode(val + EMPTY));
      }
      _$jscoverage['/lang/escape.js'].lineData[186]++;
      buf.push(sep);
    } else {
      _$jscoverage['/lang/escape.js'].lineData[187]++;
      if (visit140_187_1(S.isArray(val) && val.length)) {
        _$jscoverage['/lang/escape.js'].lineData[189]++;
        for (i = 0 , len = val.length; visit141_189_1(i < len); ++i) {
          _$jscoverage['/lang/escape.js'].lineData[190]++;
          v = val[i];
          _$jscoverage['/lang/escape.js'].lineData[191]++;
          if (visit142_191_1(isValidParamValue(v))) {
            _$jscoverage['/lang/escape.js'].lineData[192]++;
            buf.push(key, (serializeArray ? encode('[]') : EMPTY));
            _$jscoverage['/lang/escape.js'].lineData[193]++;
            if (visit143_193_1(v !== undefined)) {
              _$jscoverage['/lang/escape.js'].lineData[194]++;
              buf.push(eq, encode(v + EMPTY));
            }
            _$jscoverage['/lang/escape.js'].lineData[196]++;
            buf.push(sep);
          }
        }
      }
    }
  }
  _$jscoverage['/lang/escape.js'].lineData[203]++;
  buf.pop();
  _$jscoverage['/lang/escape.js'].lineData[204]++;
  return buf.join(EMPTY);
}, 
  unparam: function(str, sep, eq) {
  _$jscoverage['/lang/escape.js'].functionData[17]++;
  _$jscoverage['/lang/escape.js'].lineData[223]++;
  if (visit144_223_1(visit145_223_2(typeof str !== 'string') || !(str = S.trim(str)))) {
    _$jscoverage['/lang/escape.js'].lineData[224]++;
    return {};
  }
  _$jscoverage['/lang/escape.js'].lineData[226]++;
  sep = visit146_226_1(sep || SEP);
  _$jscoverage['/lang/escape.js'].lineData[227]++;
  eq = visit147_227_1(eq || EQ);
  _$jscoverage['/lang/escape.js'].lineData[228]++;
  var ret = {}, eqIndex, decode = S.urlDecode, pairs = str.split(sep), key, val, i = 0, len = pairs.length;
  _$jscoverage['/lang/escape.js'].lineData[235]++;
  for (; visit148_235_1(i < len); ++i) {
    _$jscoverage['/lang/escape.js'].lineData[236]++;
    eqIndex = pairs[i].indexOf(eq);
    _$jscoverage['/lang/escape.js'].lineData[237]++;
    if (visit149_237_1(eqIndex === -1)) {
      _$jscoverage['/lang/escape.js'].lineData[238]++;
      key = decode(pairs[i]);
      _$jscoverage['/lang/escape.js'].lineData[239]++;
      val = undefined;
    } else {
      _$jscoverage['/lang/escape.js'].lineData[242]++;
      key = decode(pairs[i].substring(0, eqIndex));
      _$jscoverage['/lang/escape.js'].lineData[243]++;
      val = pairs[i].substring(eqIndex + 1);
      _$jscoverage['/lang/escape.js'].lineData[244]++;
      try {
        _$jscoverage['/lang/escape.js'].lineData[245]++;
        val = decode(val);
      }      catch (e) {
  _$jscoverage['/lang/escape.js'].lineData[247]++;
  logger.error('decodeURIComponent error : ' + val);
  _$jscoverage['/lang/escape.js'].lineData[248]++;
  logger.error(e);
}
      _$jscoverage['/lang/escape.js'].lineData[250]++;
      if (visit150_250_1(S.endsWith(key, '[]'))) {
        _$jscoverage['/lang/escape.js'].lineData[251]++;
        key = key.substring(0, key.length - 2);
      }
    }
    _$jscoverage['/lang/escape.js'].lineData[254]++;
    if (visit151_254_1(key in ret)) {
      _$jscoverage['/lang/escape.js'].lineData[255]++;
      if (visit152_255_1(S.isArray(ret[key]))) {
        _$jscoverage['/lang/escape.js'].lineData[256]++;
        ret[key].push(val);
      } else {
        _$jscoverage['/lang/escape.js'].lineData[258]++;
        ret[key] = [ret[key], val];
      }
    } else {
      _$jscoverage['/lang/escape.js'].lineData[261]++;
      ret[key] = val;
    }
  }
  _$jscoverage['/lang/escape.js'].lineData[264]++;
  return ret;
}});
  _$jscoverage['/lang/escape.js'].lineData[268]++;
  S.escapeHTML = S.escapeHtml;
  _$jscoverage['/lang/escape.js'].lineData[269]++;
  S.unEscapeHTML = S.unEscapeHtml;
})(KISSY);
