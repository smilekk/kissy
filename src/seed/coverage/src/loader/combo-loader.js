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
if (! _$jscoverage['/loader/combo-loader.js']) {
  _$jscoverage['/loader/combo-loader.js'] = {};
  _$jscoverage['/loader/combo-loader.js'].lineData = [];
  _$jscoverage['/loader/combo-loader.js'].lineData[6] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[8] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[10] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[11] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[15] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[16] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[17] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[21] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[22] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[23] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[26] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[27] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[29] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[30] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[31] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[33] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[36] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[37] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[41] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[42] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[43] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[44] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[45] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[46] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[47] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[48] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[53] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[57] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[58] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[68] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[77] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[78] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[84] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[85] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[86] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[88] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[91] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[92] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[93] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[94] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[95] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[99] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[100] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[103] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[106] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[108] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[109] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[110] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[111] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[117] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[118] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[119] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[120] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[121] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[123] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[125] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[126] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[127] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[130] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[137] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[138] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[139] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[141] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[143] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[144] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[150] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[151] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[157] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[158] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[159] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[160] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[161] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[164] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[165] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[172] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[173] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[174] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[176] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[179] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[180] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[181] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[182] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[183] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[184] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[187] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[188] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[193] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[194] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[195] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[196] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[197] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[198] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[199] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[202] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[205] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[210] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[216] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[218] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[220] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[223] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[224] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[225] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[226] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[229] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[230] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[231] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[233] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[237] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[238] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[239] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[242] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[243] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[245] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[252] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[253] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[254] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[255] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[258] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[259] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[262] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[263] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[266] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[267] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[270] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[281] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[289] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[292] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[294] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[295] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[296] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[297] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[299] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[300] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[301] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[302] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[303] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[305] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[306] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[307] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[308] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[309] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[312] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[313] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[315] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[317] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[320] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[323] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[330] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[339] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[340] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[341] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[342] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[343] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[344] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[345] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[346] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[347] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[348] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[349] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[350] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[352] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[354] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[357] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[359] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[360] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[361] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[362] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[365] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[366] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[369] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[372] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[375] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[376] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[377] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[378] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[379] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[381] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[382] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[385] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[388] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[395] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[402] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[404] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[406] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[409] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[410] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[411] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[412] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[413] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[414] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[415] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[416] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[418] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[425] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[426] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[427] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[430] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[432] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[439] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[440] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[441] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[442] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[443] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[444] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[449] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[452] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[453] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[454] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[456] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[458] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[459] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[460] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[461] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[462] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[463] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[466] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[467] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[471] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[475] = 0;
}
if (! _$jscoverage['/loader/combo-loader.js'].functionData) {
  _$jscoverage['/loader/combo-loader.js'].functionData = [];
  _$jscoverage['/loader/combo-loader.js'].functionData[0] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[1] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[2] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[3] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[4] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[5] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[6] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[7] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[8] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[9] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[10] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[11] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[12] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[13] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[14] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[15] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[16] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[17] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[18] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[19] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[20] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[21] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[22] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[23] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[24] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[25] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[26] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[27] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[28] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[29] = 0;
}
if (! _$jscoverage['/loader/combo-loader.js'].branchData) {
  _$jscoverage['/loader/combo-loader.js'].branchData = {};
  _$jscoverage['/loader/combo-loader.js'].branchData['8'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['8'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['11'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['11'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['16'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['16'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['27'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['41'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['43'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['45'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['91'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['91'][2] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['91'][3] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['91'][4] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['93'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['94'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['99'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['99'][2] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['108'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['108'][2] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['117'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['117'][2] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['117'][3] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['121'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['137'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['157'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['159'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['164'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['183'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['187'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['197'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['198'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['225'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['225'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['254'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['254'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['262'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['262'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['289'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['289'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['292'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['292'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['294'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['294'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['296'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['296'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['302'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['302'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['305'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['305'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['306'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['306'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['307'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['307'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['339'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['339'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['354'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['354'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['354'][2] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['361'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['361'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['375'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['375'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['376'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['376'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['381'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['381'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['381'][2] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['381'][3] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['381'][4] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['416'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['416'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['439'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['439'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['443'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['443'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['456'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['456'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['456'][2] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['457'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['457'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['466'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['466'][1] = new BranchData();
}
_$jscoverage['/loader/combo-loader.js'].branchData['466'][1].init(2583, 23, 'currentComboUrls.length');
function visit365_466_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['466'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['457'][1].init(68, 72, 'l + currentComboUrls.join(comboSep).length + suffixLength > maxUrlLength');
function visit364_457_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['457'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['456'][2].init(778, 36, 'currentComboUrls.length > maxFileNum');
function visit363_456_2(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['456'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['456'][1].init(778, 142, 'currentComboUrls.length > maxFileNum || (l + currentComboUrls.join(comboSep).length + suffixLength > maxUrlLength)');
function visit362_456_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['456'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['443'][1].init(195, 25, '!currentMod.canBeCombined');
function visit361_443_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['443'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['439'][1].init(1281, 15, 'i < mods.length');
function visit360_439_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['439'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['416'][1].init(226, 15, 'tags.length > 1');
function visit359_416_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['416'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['381'][4].init(53, 20, 'mods.tags[0] === tag');
function visit358_381_4(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['381'][4].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['381'][3].init(27, 22, 'mods.tags.length === 1');
function visit357_381_3(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['381'][3].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['381'][2].init(27, 46, 'mods.tags.length === 1 && mods.tags[0] === tag');
function visit356_381_2(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['381'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['381'][1].init(25, 49, '!(mods.tags.length === 1 && mods.tags[0] === tag)');
function visit355_381_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['381'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['376'][1].init(1790, 32, '!(mods = typedCombos[comboName])');
function visit354_376_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['376'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['375'][1].init(1747, 21, 'comboMods[type] || {}');
function visit353_375_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['375'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['361'][1].init(29, 41, 'groupPrefixUri.isSameOriginAs(packageUri)');
function visit352_361_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['361'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['354'][2].init(744, 82, 'packageInfo.isCombine() && S.startsWith(fullpath, packagePath)');
function visit351_354_2(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['354'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['354'][1].init(724, 112, '(mod.canBeCombined = packageInfo.isCombine() && S.startsWith(fullpath, packagePath)) && group');
function visit350_354_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['354'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['339'][1].init(338, 5, 'i < l');
function visit349_339_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['339'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['307'][1].init(29, 21, 'modStatus !== LOADING');
function visit348_307_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['307'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['306'][1].init(25, 27, '!waitingModules.contains(m)');
function visit347_306_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['306'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['305'][1].init(362, 20, 'modStatus !== LOADED');
function visit346_305_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['305'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['302'][1].init(262, 28, 'modStatus >= READY_TO_ATTACH');
function visit345_302_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['302'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['296'][1].init(54, 8, 'cache[m]');
function visit344_296_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['296'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['294'][1].init(369, 19, 'i < modNames.length');
function visit343_294_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['294'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['292'][1].init(331, 11, 'cache || {}');
function visit342_292_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['292'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['289'][1].init(229, 9, 'ret || {}');
function visit341_289_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['289'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['262'][1].init(150, 12, '!mod.factory');
function visit340_262_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['262'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['254'][1].init(25, 9, '\'@DEBUG@\'');
function visit339_254_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['254'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['225'][1].init(25, 9, '\'@DEBUG@\'');
function visit338_225_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['225'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['198'][1].init(17, 19, 'str1[i] !== str2[i]');
function visit337_198_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['197'][1].init(143, 5, 'i < l');
function visit336_197_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['187'][1].init(199, 9, 'ms.length');
function visit335_187_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['183'][1].init(21, 19, 'm.status === LOADED');
function visit334_183_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['164'][1].init(373, 2, 're');
function visit333_164_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['159'][1].init(50, 35, 'script.readyState === \'interactive\'');
function visit332_159_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['157'][1].init(182, 6, 'i >= 0');
function visit331_157_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['137'][1].init(74, 5, 'oldIE');
function visit330_137_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['121'][1].init(132, 5, 'oldIE');
function visit329_121_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['117'][3].init(391, 13, 'argsLen === 1');
function visit328_117_3(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['117'][3].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['117'][2].init(361, 26, 'typeof name === \'function\'');
function visit327_117_2(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['117'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['117'][1].init(361, 43, 'typeof name === \'function\' || argsLen === 1');
function visit326_117_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['108'][2].init(57, 13, 'argsLen === 3');
function visit325_108_2(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['108'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['108'][1].init(57, 35, 'argsLen === 3 && S.isArray(factory)');
function visit324_108_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['99'][2].init(80, 30, 'config.requires && !config.cjs');
function visit323_99_2(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['99'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['99'][1].init(70, 40, 'config && config.requires && !config.cjs');
function visit322_99_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['94'][1].init(26, 12, 'config || {}');
function visit321_94_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['93'][1].init(78, 15, 'requires.length');
function visit320_93_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['91'][4].init(148, 18, 'factory.length > 1');
function visit319_91_4(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['91'][4].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['91'][3].init(115, 29, 'typeof factory === \'function\'');
function visit318_91_3(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['91'][3].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['91'][2].init(115, 51, 'typeof factory === \'function\' && factory.length > 1');
function visit317_91_2(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['91'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['91'][1].init(104, 62, '!config && typeof factory === \'function\' && factory.length > 1');
function visit316_91_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['45'][1].init(147, 5, 'oldIE');
function visit315_45_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['43'][1].init(55, 23, 'mod.getType() === \'css\'');
function visit314_43_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['41'][1].init(816, 11, '!rs.combine');
function visit313_41_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['27'][1].init(67, 17, 'mod && currentMod');
function visit312_27_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['16'][1].init(17, 10, '!(--count)');
function visit311_16_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['16'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['11'][1].init(21, 17, 'rss && rss.length');
function visit310_11_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['11'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['8'][1].init(43, 16, 'S.UA.ieMode < 10');
function visit309_8_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['8'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].lineData[6]++;
(function(S, undefined) {
  _$jscoverage['/loader/combo-loader.js'].functionData[0]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[8]++;
  var oldIE = visit309_8_1(S.UA.ieMode < 10);
  _$jscoverage['/loader/combo-loader.js'].lineData[10]++;
  function loadScripts(runtime, rss, callback, charset, timeout) {
    _$jscoverage['/loader/combo-loader.js'].functionData[1]++;
    _$jscoverage['/loader/combo-loader.js'].lineData[11]++;
    var count = visit310_11_1(rss && rss.length), errorList = [], successList = [];
    _$jscoverage['/loader/combo-loader.js'].lineData[15]++;
    function complete() {
      _$jscoverage['/loader/combo-loader.js'].functionData[2]++;
      _$jscoverage['/loader/combo-loader.js'].lineData[16]++;
      if (visit311_16_1(!(--count))) {
        _$jscoverage['/loader/combo-loader.js'].lineData[17]++;
        callback(successList, errorList);
      }
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[21]++;
    S.each(rss, function(rs) {
  _$jscoverage['/loader/combo-loader.js'].functionData[3]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[22]++;
  var mod;
  _$jscoverage['/loader/combo-loader.js'].lineData[23]++;
  var config = {
  timeout: timeout, 
  success: function() {
  _$jscoverage['/loader/combo-loader.js'].functionData[4]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[26]++;
  successList.push(rs);
  _$jscoverage['/loader/combo-loader.js'].lineData[27]++;
  if (visit312_27_1(mod && currentMod)) {
    _$jscoverage['/loader/combo-loader.js'].lineData[29]++;
    logger.debug('standard browser get mod name after load : ' + mod.name);
    _$jscoverage['/loader/combo-loader.js'].lineData[30]++;
    Utils.registerModule(runtime, mod.name, currentMod.factory, currentMod.config);
    _$jscoverage['/loader/combo-loader.js'].lineData[31]++;
    currentMod = undefined;
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[33]++;
  complete();
}, 
  error: function() {
  _$jscoverage['/loader/combo-loader.js'].functionData[5]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[36]++;
  errorList.push(rs);
  _$jscoverage['/loader/combo-loader.js'].lineData[37]++;
  complete();
}, 
  charset: charset};
  _$jscoverage['/loader/combo-loader.js'].lineData[41]++;
  if (visit313_41_1(!rs.combine)) {
    _$jscoverage['/loader/combo-loader.js'].lineData[42]++;
    mod = rs.mods[0];
    _$jscoverage['/loader/combo-loader.js'].lineData[43]++;
    if (visit314_43_1(mod.getType() === 'css')) {
      _$jscoverage['/loader/combo-loader.js'].lineData[44]++;
      mod = undefined;
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[45]++;
      if (visit315_45_1(oldIE)) {
        _$jscoverage['/loader/combo-loader.js'].lineData[46]++;
        startLoadModName = mod.name;
        _$jscoverage['/loader/combo-loader.js'].lineData[47]++;
        startLoadModTime = S.now();
        _$jscoverage['/loader/combo-loader.js'].lineData[48]++;
        config.attrs = {
  'data-mod-name': mod.name};
      }
    }
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[53]++;
  S.Config.loadModsFn(rs, config);
});
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[57]++;
  var logger = S.getLogger('s/loader');
  _$jscoverage['/loader/combo-loader.js'].lineData[58]++;
  var Loader = S.Loader, Status = Loader.Status, Utils = Loader.Utils, getHash = Utils.getHash, LOADING = Status.LOADING, LOADED = Status.LOADED, READY_TO_ATTACH = Status.READY_TO_ATTACH, ERROR = Status.ERROR, groupTag = S.now();
  _$jscoverage['/loader/combo-loader.js'].lineData[68]++;
  ComboLoader.groupTag = groupTag;
  _$jscoverage['/loader/combo-loader.js'].lineData[77]++;
  function ComboLoader(runtime, waitingModules) {
    _$jscoverage['/loader/combo-loader.js'].functionData[6]++;
    _$jscoverage['/loader/combo-loader.js'].lineData[78]++;
    S.mix(this, {
  runtime: runtime, 
  waitingModules: waitingModules});
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[84]++;
  var currentMod;
  _$jscoverage['/loader/combo-loader.js'].lineData[85]++;
  var startLoadModName;
  _$jscoverage['/loader/combo-loader.js'].lineData[86]++;
  var startLoadModTime;
  _$jscoverage['/loader/combo-loader.js'].lineData[88]++;
  function checkKISSYRequire(config, factory) {
    _$jscoverage['/loader/combo-loader.js'].functionData[7]++;
    _$jscoverage['/loader/combo-loader.js'].lineData[91]++;
    if (visit316_91_1(!config && visit317_91_2(visit318_91_3(typeof factory === 'function') && visit319_91_4(factory.length > 1)))) {
      _$jscoverage['/loader/combo-loader.js'].lineData[92]++;
      var requires = Utils.getRequiresFromFn(factory);
      _$jscoverage['/loader/combo-loader.js'].lineData[93]++;
      if (visit320_93_1(requires.length)) {
        _$jscoverage['/loader/combo-loader.js'].lineData[94]++;
        config = visit321_94_1(config || {});
        _$jscoverage['/loader/combo-loader.js'].lineData[95]++;
        config.requires = requires;
      }
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[99]++;
      if (visit322_99_1(config && visit323_99_2(config.requires && !config.cjs))) {
        _$jscoverage['/loader/combo-loader.js'].lineData[100]++;
        config.cjs = 0;
      }
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[103]++;
    return config;
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[106]++;
  ComboLoader.add = function(name, factory, config, runtime, argsLen) {
  _$jscoverage['/loader/combo-loader.js'].functionData[8]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[108]++;
  if (visit324_108_1(visit325_108_2(argsLen === 3) && S.isArray(factory))) {
    _$jscoverage['/loader/combo-loader.js'].lineData[109]++;
    var tmp = factory;
    _$jscoverage['/loader/combo-loader.js'].lineData[110]++;
    factory = config;
    _$jscoverage['/loader/combo-loader.js'].lineData[111]++;
    config = {
  requires: tmp, 
  cjs: 1};
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[117]++;
  if (visit326_117_1(visit327_117_2(typeof name === 'function') || visit328_117_3(argsLen === 1))) {
    _$jscoverage['/loader/combo-loader.js'].lineData[118]++;
    config = factory;
    _$jscoverage['/loader/combo-loader.js'].lineData[119]++;
    factory = name;
    _$jscoverage['/loader/combo-loader.js'].lineData[120]++;
    config = checkKISSYRequire(config, factory);
    _$jscoverage['/loader/combo-loader.js'].lineData[121]++;
    if (visit329_121_1(oldIE)) {
      _$jscoverage['/loader/combo-loader.js'].lineData[123]++;
      name = findModuleNameByInteractive();
      _$jscoverage['/loader/combo-loader.js'].lineData[125]++;
      Utils.registerModule(runtime, name, factory, config);
      _$jscoverage['/loader/combo-loader.js'].lineData[126]++;
      startLoadModName = null;
      _$jscoverage['/loader/combo-loader.js'].lineData[127]++;
      startLoadModTime = 0;
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[130]++;
      currentMod = {
  factory: factory, 
  config: config};
    }
  } else {
    _$jscoverage['/loader/combo-loader.js'].lineData[137]++;
    if (visit330_137_1(oldIE)) {
      _$jscoverage['/loader/combo-loader.js'].lineData[138]++;
      startLoadModName = null;
      _$jscoverage['/loader/combo-loader.js'].lineData[139]++;
      startLoadModTime = 0;
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[141]++;
      currentMod = undefined;
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[143]++;
    config = checkKISSYRequire(config, factory);
    _$jscoverage['/loader/combo-loader.js'].lineData[144]++;
    Utils.registerModule(runtime, name, factory, config);
  }
};
  _$jscoverage['/loader/combo-loader.js'].lineData[150]++;
  function findModuleNameByInteractive() {
    _$jscoverage['/loader/combo-loader.js'].functionData[9]++;
    _$jscoverage['/loader/combo-loader.js'].lineData[151]++;
    var scripts = S.Env.host.document.getElementsByTagName('script'), re, i, name, script;
    _$jscoverage['/loader/combo-loader.js'].lineData[157]++;
    for (i = scripts.length - 1; visit331_157_1(i >= 0); i--) {
      _$jscoverage['/loader/combo-loader.js'].lineData[158]++;
      script = scripts[i];
      _$jscoverage['/loader/combo-loader.js'].lineData[159]++;
      if (visit332_159_1(script.readyState === 'interactive')) {
        _$jscoverage['/loader/combo-loader.js'].lineData[160]++;
        re = script;
        _$jscoverage['/loader/combo-loader.js'].lineData[161]++;
        break;
      }
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[164]++;
    if (visit333_164_1(re)) {
      _$jscoverage['/loader/combo-loader.js'].lineData[165]++;
      name = re.getAttribute('data-mod-name');
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[172]++;
      logger.debug('can not find interactive script,time diff : ' + (S.now() - startLoadModTime));
      _$jscoverage['/loader/combo-loader.js'].lineData[173]++;
      logger.debug('old_ie get mod name from cache : ' + startLoadModName);
      _$jscoverage['/loader/combo-loader.js'].lineData[174]++;
      name = startLoadModName;
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[176]++;
    return name;
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[179]++;
  function debugRemoteModules(rss) {
    _$jscoverage['/loader/combo-loader.js'].functionData[10]++;
    _$jscoverage['/loader/combo-loader.js'].lineData[180]++;
    S.each(rss, function(rs) {
  _$jscoverage['/loader/combo-loader.js'].functionData[11]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[181]++;
  var ms = [];
  _$jscoverage['/loader/combo-loader.js'].lineData[182]++;
  S.each(rs.mods, function(m) {
  _$jscoverage['/loader/combo-loader.js'].functionData[12]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[183]++;
  if (visit334_183_1(m.status === LOADED)) {
    _$jscoverage['/loader/combo-loader.js'].lineData[184]++;
    ms.push(m.name);
  }
});
  _$jscoverage['/loader/combo-loader.js'].lineData[187]++;
  if (visit335_187_1(ms.length)) {
    _$jscoverage['/loader/combo-loader.js'].lineData[188]++;
    logger.info('load remote modules: "' + ms.join(', ') + '" from: "' + rs.fullpath + '"');
  }
});
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[193]++;
  function getCommonPrefix(str1, str2) {
    _$jscoverage['/loader/combo-loader.js'].functionData[13]++;
    _$jscoverage['/loader/combo-loader.js'].lineData[194]++;
    str1 = str1.split(/\//);
    _$jscoverage['/loader/combo-loader.js'].lineData[195]++;
    str2 = str2.split(/\//);
    _$jscoverage['/loader/combo-loader.js'].lineData[196]++;
    var l = Math.min(str1.length, str2.length);
    _$jscoverage['/loader/combo-loader.js'].lineData[197]++;
    for (var i = 0; visit336_197_1(i < l); i++) {
      _$jscoverage['/loader/combo-loader.js'].lineData[198]++;
      if (visit337_198_1(str1[i] !== str2[i])) {
        _$jscoverage['/loader/combo-loader.js'].lineData[199]++;
        break;
      }
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[202]++;
    return str1.slice(0, i).join('/') + '/';
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[205]++;
  S.augment(ComboLoader, {
  use: function(normalizedModNames) {
  _$jscoverage['/loader/combo-loader.js'].functionData[14]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[210]++;
  var self = this, allModNames, comboUrls, timeout = S.Config.timeout, runtime = self.runtime;
  _$jscoverage['/loader/combo-loader.js'].lineData[216]++;
  allModNames = S.keys(self.calculate(normalizedModNames));
  _$jscoverage['/loader/combo-loader.js'].lineData[218]++;
  Utils.createModulesInfo(runtime, allModNames);
  _$jscoverage['/loader/combo-loader.js'].lineData[220]++;
  comboUrls = self.getComboUrls(allModNames);
  _$jscoverage['/loader/combo-loader.js'].lineData[223]++;
  S.each(comboUrls.css, function(cssOne) {
  _$jscoverage['/loader/combo-loader.js'].functionData[15]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[224]++;
  loadScripts(runtime, cssOne, function(success, error) {
  _$jscoverage['/loader/combo-loader.js'].functionData[16]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[225]++;
  if (visit338_225_1('@DEBUG@')) {
    _$jscoverage['/loader/combo-loader.js'].lineData[226]++;
    debugRemoteModules(success);
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[229]++;
  S.each(success, function(one) {
  _$jscoverage['/loader/combo-loader.js'].functionData[17]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[230]++;
  S.each(one.mods, function(mod) {
  _$jscoverage['/loader/combo-loader.js'].functionData[18]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[231]++;
  Utils.registerModule(runtime, mod.name, S.noop);
  _$jscoverage['/loader/combo-loader.js'].lineData[233]++;
  mod.notifyAll();
});
});
  _$jscoverage['/loader/combo-loader.js'].lineData[237]++;
  S.each(error, function(one) {
  _$jscoverage['/loader/combo-loader.js'].functionData[19]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[238]++;
  S.each(one.mods, function(mod) {
  _$jscoverage['/loader/combo-loader.js'].functionData[20]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[239]++;
  var msg = mod.name + ' is not loaded! can not find module in path : ' + one.fullpath;
  _$jscoverage['/loader/combo-loader.js'].lineData[242]++;
  S.log(msg, 'error');
  _$jscoverage['/loader/combo-loader.js'].lineData[243]++;
  mod.status = ERROR;
  _$jscoverage['/loader/combo-loader.js'].lineData[245]++;
  mod.notifyAll();
});
});
}, cssOne.charset, timeout);
});
  _$jscoverage['/loader/combo-loader.js'].lineData[252]++;
  S.each(comboUrls.js, function(jsOne) {
  _$jscoverage['/loader/combo-loader.js'].functionData[21]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[253]++;
  loadScripts(runtime, jsOne, function(success) {
  _$jscoverage['/loader/combo-loader.js'].functionData[22]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[254]++;
  if (visit339_254_1('@DEBUG@')) {
    _$jscoverage['/loader/combo-loader.js'].lineData[255]++;
    debugRemoteModules(success);
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[258]++;
  S.each(jsOne, function(one) {
  _$jscoverage['/loader/combo-loader.js'].functionData[23]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[259]++;
  S.each(one.mods, function(mod) {
  _$jscoverage['/loader/combo-loader.js'].functionData[24]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[262]++;
  if (visit340_262_1(!mod.factory)) {
    _$jscoverage['/loader/combo-loader.js'].lineData[263]++;
    var msg = mod.name + ' is not loaded! can not find module in path : ' + one.fullpath;
    _$jscoverage['/loader/combo-loader.js'].lineData[266]++;
    S.log(msg, 'error');
    _$jscoverage['/loader/combo-loader.js'].lineData[267]++;
    mod.status = ERROR;
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[270]++;
  mod.notifyAll();
});
});
}, jsOne.charset, timeout);
});
}, 
  calculate: function(modNames, cache, ret) {
  _$jscoverage['/loader/combo-loader.js'].functionData[25]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[281]++;
  var i, m, mod, modStatus, self = this, waitingModules = self.waitingModules, runtime = self.runtime;
  _$jscoverage['/loader/combo-loader.js'].lineData[289]++;
  ret = visit341_289_1(ret || {});
  _$jscoverage['/loader/combo-loader.js'].lineData[292]++;
  cache = visit342_292_1(cache || {});
  _$jscoverage['/loader/combo-loader.js'].lineData[294]++;
  for (i = 0; visit343_294_1(i < modNames.length); i++) {
    _$jscoverage['/loader/combo-loader.js'].lineData[295]++;
    m = modNames[i];
    _$jscoverage['/loader/combo-loader.js'].lineData[296]++;
    if (visit344_296_1(cache[m])) {
      _$jscoverage['/loader/combo-loader.js'].lineData[297]++;
      continue;
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[299]++;
    cache[m] = 1;
    _$jscoverage['/loader/combo-loader.js'].lineData[300]++;
    mod = Utils.createModuleInfo(runtime, m);
    _$jscoverage['/loader/combo-loader.js'].lineData[301]++;
    modStatus = mod.status;
    _$jscoverage['/loader/combo-loader.js'].lineData[302]++;
    if (visit345_302_1(modStatus >= READY_TO_ATTACH)) {
      _$jscoverage['/loader/combo-loader.js'].lineData[303]++;
      continue;
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[305]++;
    if (visit346_305_1(modStatus !== LOADED)) {
      _$jscoverage['/loader/combo-loader.js'].lineData[306]++;
      if (visit347_306_1(!waitingModules.contains(m))) {
        _$jscoverage['/loader/combo-loader.js'].lineData[307]++;
        if (visit348_307_1(modStatus !== LOADING)) {
          _$jscoverage['/loader/combo-loader.js'].lineData[308]++;
          mod.status = LOADING;
          _$jscoverage['/loader/combo-loader.js'].lineData[309]++;
          ret[m] = 1;
        }
        _$jscoverage['/loader/combo-loader.js'].lineData[312]++;
        mod.wait(function(mod) {
  _$jscoverage['/loader/combo-loader.js'].functionData[26]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[313]++;
  waitingModules.remove(mod.name);
  _$jscoverage['/loader/combo-loader.js'].lineData[315]++;
  waitingModules.notifyAll();
});
        _$jscoverage['/loader/combo-loader.js'].lineData[317]++;
        waitingModules.add(m);
      }
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[320]++;
    self.calculate(mod.getNormalizedRequires(), cache, ret);
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[323]++;
  return ret;
}, 
  getComboMods: function(modNames, comboPrefixes) {
  _$jscoverage['/loader/combo-loader.js'].functionData[27]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[330]++;
  var comboMods = {}, packageUri, runtime = this.runtime, i = 0, l = modNames.length, modName, mod, packageInfo, type, typedCombos, mods, tag, charset, packagePath, packageName, group, fullpath;
  _$jscoverage['/loader/combo-loader.js'].lineData[339]++;
  for (; visit349_339_1(i < l); ++i) {
    _$jscoverage['/loader/combo-loader.js'].lineData[340]++;
    modName = modNames[i];
    _$jscoverage['/loader/combo-loader.js'].lineData[341]++;
    mod = Utils.createModuleInfo(runtime, modName);
    _$jscoverage['/loader/combo-loader.js'].lineData[342]++;
    type = mod.getType();
    _$jscoverage['/loader/combo-loader.js'].lineData[343]++;
    fullpath = mod.getFullPath();
    _$jscoverage['/loader/combo-loader.js'].lineData[344]++;
    packageInfo = mod.getPackage();
    _$jscoverage['/loader/combo-loader.js'].lineData[345]++;
    packageName = packageInfo.name;
    _$jscoverage['/loader/combo-loader.js'].lineData[346]++;
    charset = packageInfo.getCharset();
    _$jscoverage['/loader/combo-loader.js'].lineData[347]++;
    tag = packageInfo.getTag();
    _$jscoverage['/loader/combo-loader.js'].lineData[348]++;
    group = packageInfo.getGroup();
    _$jscoverage['/loader/combo-loader.js'].lineData[349]++;
    packagePath = packageInfo.getPrefixUriForCombo();
    _$jscoverage['/loader/combo-loader.js'].lineData[350]++;
    packageUri = packageInfo.getPackageUri();
    _$jscoverage['/loader/combo-loader.js'].lineData[352]++;
    var comboName = packageName;
    _$jscoverage['/loader/combo-loader.js'].lineData[354]++;
    if (visit350_354_1((mod.canBeCombined = visit351_354_2(packageInfo.isCombine() && S.startsWith(fullpath, packagePath))) && group)) {
      _$jscoverage['/loader/combo-loader.js'].lineData[357]++;
      comboName = group + '_' + charset + '_' + groupTag;
      _$jscoverage['/loader/combo-loader.js'].lineData[359]++;
      var groupPrefixUri;
      _$jscoverage['/loader/combo-loader.js'].lineData[360]++;
      if ((groupPrefixUri = comboPrefixes[comboName])) {
        _$jscoverage['/loader/combo-loader.js'].lineData[361]++;
        if (visit352_361_1(groupPrefixUri.isSameOriginAs(packageUri))) {
          _$jscoverage['/loader/combo-loader.js'].lineData[362]++;
          groupPrefixUri.setPath(getCommonPrefix(groupPrefixUri.getPath(), packageUri.getPath()));
        } else {
          _$jscoverage['/loader/combo-loader.js'].lineData[365]++;
          comboName = packageName;
          _$jscoverage['/loader/combo-loader.js'].lineData[366]++;
          comboPrefixes[packageName] = packageUri;
        }
      } else {
        _$jscoverage['/loader/combo-loader.js'].lineData[369]++;
        comboPrefixes[comboName] = packageUri.clone();
      }
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[372]++;
      comboPrefixes[packageName] = packageUri;
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[375]++;
    typedCombos = comboMods[type] = visit353_375_1(comboMods[type] || {});
    _$jscoverage['/loader/combo-loader.js'].lineData[376]++;
    if (visit354_376_1(!(mods = typedCombos[comboName]))) {
      _$jscoverage['/loader/combo-loader.js'].lineData[377]++;
      mods = typedCombos[comboName] = [];
      _$jscoverage['/loader/combo-loader.js'].lineData[378]++;
      mods.charset = charset;
      _$jscoverage['/loader/combo-loader.js'].lineData[379]++;
      mods.tags = [tag];
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[381]++;
      if (visit355_381_1(!(visit356_381_2(visit357_381_3(mods.tags.length === 1) && visit358_381_4(mods.tags[0] === tag))))) {
        _$jscoverage['/loader/combo-loader.js'].lineData[382]++;
        mods.tags.push(tag);
      }
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[385]++;
    mods.push(mod);
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[388]++;
  return comboMods;
}, 
  getComboUrls: function(modNames) {
  _$jscoverage['/loader/combo-loader.js'].functionData[28]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[395]++;
  var runtime = this.runtime, Config = runtime.Config, comboPrefix = Config.comboPrefix, comboSep = Config.comboSep, maxFileNum = Config.comboMaxFileNum, maxUrlLength = Config.comboMaxUrlLength;
  _$jscoverage['/loader/combo-loader.js'].lineData[402]++;
  var comboPrefixes = {};
  _$jscoverage['/loader/combo-loader.js'].lineData[404]++;
  var comboMods = this.getComboMods(modNames, comboPrefixes);
  _$jscoverage['/loader/combo-loader.js'].lineData[406]++;
  var comboRes = {};
  _$jscoverage['/loader/combo-loader.js'].lineData[409]++;
  for (var type in comboMods) {
    _$jscoverage['/loader/combo-loader.js'].lineData[410]++;
    comboRes[type] = {};
    _$jscoverage['/loader/combo-loader.js'].lineData[411]++;
    for (var comboName in comboMods[type]) {
      _$jscoverage['/loader/combo-loader.js'].lineData[412]++;
      var currentComboUrls = [];
      _$jscoverage['/loader/combo-loader.js'].lineData[413]++;
      var currentComboMods = [];
      _$jscoverage['/loader/combo-loader.js'].lineData[414]++;
      var mods = comboMods[type][comboName];
      _$jscoverage['/loader/combo-loader.js'].lineData[415]++;
      var tags = mods.tags;
      _$jscoverage['/loader/combo-loader.js'].lineData[416]++;
      var tag = visit359_416_1(tags.length > 1) ? getHash(tags.join('')) : tags[0];
      _$jscoverage['/loader/combo-loader.js'].lineData[418]++;
      var suffix = (tag ? '?t=' + encodeURIComponent(tag) + '.' + type : ''), suffixLength = suffix.length, basePrefix = comboPrefixes[comboName].toString(), baseLen = basePrefix.length, prefix = basePrefix + comboPrefix, res = comboRes[type][comboName] = [];
      _$jscoverage['/loader/combo-loader.js'].lineData[425]++;
      var l = prefix.length;
      _$jscoverage['/loader/combo-loader.js'].lineData[426]++;
      res.charset = mods.charset;
      _$jscoverage['/loader/combo-loader.js'].lineData[427]++;
      res.mods = [];
      _$jscoverage['/loader/combo-loader.js'].lineData[430]++;
      var pushComboUrl = function() {
  _$jscoverage['/loader/combo-loader.js'].functionData[29]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[432]++;
  res.push({
  combine: 1, 
  fullpath: prefix + currentComboUrls.join(comboSep) + suffix, 
  mods: currentComboMods});
};
      _$jscoverage['/loader/combo-loader.js'].lineData[439]++;
      for (var i = 0; visit360_439_1(i < mods.length); i++) {
        _$jscoverage['/loader/combo-loader.js'].lineData[440]++;
        var currentMod = mods[i];
        _$jscoverage['/loader/combo-loader.js'].lineData[441]++;
        res.mods.push(currentMod);
        _$jscoverage['/loader/combo-loader.js'].lineData[442]++;
        var fullpath = currentMod.getFullPath();
        _$jscoverage['/loader/combo-loader.js'].lineData[443]++;
        if (visit361_443_1(!currentMod.canBeCombined)) {
          _$jscoverage['/loader/combo-loader.js'].lineData[444]++;
          res.push({
  combine: 0, 
  fullpath: fullpath, 
  mods: [currentMod]});
          _$jscoverage['/loader/combo-loader.js'].lineData[449]++;
          continue;
        }
        _$jscoverage['/loader/combo-loader.js'].lineData[452]++;
        var path = fullpath.slice(baseLen).replace(/\?.*$/, '');
        _$jscoverage['/loader/combo-loader.js'].lineData[453]++;
        currentComboUrls.push(path);
        _$jscoverage['/loader/combo-loader.js'].lineData[454]++;
        currentComboMods.push(currentMod);
        _$jscoverage['/loader/combo-loader.js'].lineData[456]++;
        if (visit362_456_1(visit363_456_2(currentComboUrls.length > maxFileNum) || (visit364_457_1(l + currentComboUrls.join(comboSep).length + suffixLength > maxUrlLength)))) {
          _$jscoverage['/loader/combo-loader.js'].lineData[458]++;
          currentComboUrls.pop();
          _$jscoverage['/loader/combo-loader.js'].lineData[459]++;
          currentComboMods.pop();
          _$jscoverage['/loader/combo-loader.js'].lineData[460]++;
          pushComboUrl();
          _$jscoverage['/loader/combo-loader.js'].lineData[461]++;
          currentComboUrls = [];
          _$jscoverage['/loader/combo-loader.js'].lineData[462]++;
          currentComboMods = [];
          _$jscoverage['/loader/combo-loader.js'].lineData[463]++;
          i--;
        }
      }
      _$jscoverage['/loader/combo-loader.js'].lineData[466]++;
      if (visit365_466_1(currentComboUrls.length)) {
        _$jscoverage['/loader/combo-loader.js'].lineData[467]++;
        pushComboUrl();
      }
    }
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[471]++;
  return comboRes;
}});
  _$jscoverage['/loader/combo-loader.js'].lineData[475]++;
  Loader.ComboLoader = ComboLoader;
})(KISSY);
