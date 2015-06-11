/**
 * Created by shuding on 6/9/15.
 * <ds303077135@gmail.com>
 */

var Constant = require('script/kernels/constant');

module.exports = ALU;

function ALU() {
    function init(alu) {
        alu.data = {
            ZF:     1,
            SF:     0,
            OF:     0,
            inA:    0,
            inB:    0,
            tVal:   0,
            fCode:  0,
            update: 0
        };

        calc(alu);
        cond(alu);

        config(alu);
        update(alu);
    }

    function calc(alu) {
        alu.calc                 = {};
        alu.calc[Constant.A_ADD] = function () {
            alu.data.tVal = (alu.data.inA + alu.data.inB) | 0;
            alu.updateAll();
        };
        alu.calc[Constant.A_AND] = function () {
            alu.data.tVal = alu.data.inA & alu.data.inB;
            alu.updateAll();
        };
        alu.calc[Constant.A_SUB] = function () {
            alu.data.tVal = (alu.data.inA - alu.data.inB) | 0;
            alu.updateAll();
        };
        alu.calc[Constant.A_XOR] = function () {
            alu.data.tVal = alu.data.inA ^ alu.data.inB;
            alu.updateAll();
        };
    }

    function cond(alu) {
        alu.cond                  = {};
        alu.cond[Constant.C_TRUE] = function () {
            return true;
        };
        alu.cond[Constant.C_L]    = function () {
            return alu.SF() ^ alu.OF();
        };
        alu.cond[Constant.C_E]    = function () {
            return alu.ZF();
        };
        alu.cond[Constant.C_NE]   = function () {
            return !alu.cond[Constant.C_E]();
        };
        alu.cond[Constant.C_LE]   = function () {
            return (alu.cond[Constant.C_L]) | alu.cond[Constant.C_E];
        };
        alu.cond[Constant.C_GE]   = function () {
            return !alu.cond[Constant.C_L];
        };
        alu.cond[Constant.C_G]    = function () {
            return !alu.cond[Constant.C_LE];
        };
    }

    function config(alu) {
        alu.config           = {};
        alu.config.setInA    = function (data) {
            alu.data.inA = data;
        };
        alu.config.setInB    = function (data) {
            alu.data.inB = data;
        };
        alu.config.setFCode  = function (data) {
            alu.data.fCode = data;
        };
        alu.config.setUpdate = function (data) {
            alu.data.update = data;
        };
    }

    function update(alu) {
        alu.updateOF                 = {};
        alu.updateOF[Constant.A_ADD] = function () {
            alu.OF((alu.data.inA < 0) == (alu.data.inB < 0) && (alu.data.tVal < 0) != (alu.data.inA < 0));
        };
        alu.updateOF[Constant.A_SUB] = function () {
            alu.OF((alu.data.inA < 0) == (alu.data.inB > 0) && (alu.data.tVal < 0) != (alu.data.inB < 0));
        };
        alu.updateOF[Constant.A_AND] = function () {
            alu.OF(0);
        };
        alu.updateOF[Constant.A_XOR] = function () {
            alu.OF(0);
        };
    }

    init(this);
}

ALU.prototype.ZF = function (flag) {
    if (typeof flag !== 'undefined') {
        this.data.ZF = (+flag);
    }
    return this.data.ZF;
};

ALU.prototype.SF = function (flag) {
    if (typeof flag !== 'undefined') {
        this.data.SF = (+flag);
    }
    return this.data.SF;
};

ALU.prototype.OF = function (flag) {
    if (typeof flag !== 'undefined') {
        this.data.OF = (+flag);
    }
    return this.data.OF;
};

ALU.prototype.updateAll = function () {
    if (!this.data.update) {
        return;
    }
    this.SF(!!(this.data.tVal >>> 31));
    this.ZF(!this.data.tVal);
    this.updateOF[this.data.fCode]();
};

ALU.prototype.execute = function () {
    this.calc[this.data.fCode]();
    return this.data.tVal;
};

ALU.prototype.condition = function (cond) {
    if (!(0 <= cond && cond < 8))
        return true;
    return this.cond[cond]();
};
