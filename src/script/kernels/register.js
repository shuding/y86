/**
 * Created by shuding on 6/9/15.
 * <ds303077135@gmail.com>
 */

var Constant = require('script/kernels/constant');
var Utils    = require('script/kernels/utils');

module.exports = {
    Register:     Register,
    PIPERegister: PIPERegister
};

function Register() {
    /**
     * Initialization: set all registers to 0
     */
    function init(register) {
        Constant.REGISTERS.forEach(function (name) {
            register[Constant[name]] = 0;
        });
    }

    init(this);
}

Register.prototype.get = function (name) {
    if (!Utils.checkNumber(name)) {
        if (typeof this[Constant[name]] === 'undefined') {
            throw new Error('Register error undefined name: ' + name);
        }
        return this[Constant[name]];
    }
    return this[name];
};

Register.prototype.set = function (name, value) {
    if (!Utils.checkNumber(name)) {
        if (typeof Constant[name] !== 'undefined' && name !== 'R_NONE') {
            this[Constant[name]] = value;
        } else {
            return false;
        }
    }
    if (!(0 <= name && name < 8))
        return false;
    this[name] = value;
    return true;
};

function PIPERegister() {
    var defaults = {
        // Fetch
        F_predPC:  0,
        F_carryPC: -1,
        F_stat:    Constant.STAT_AOK,

        // Decode
        D_icode:   Constant.I_NOP,
        D_ifun:    0,
        D_rA:      Constant.R_NONE,
        D_rB:      Constant.R_NONE,
        D_valC:    0,
        D_valP:    0,
        D_carryPC: -1,
        D_stat:    Constant.STAT_BUB,

        // Execute
        E_icode:   Constant.I_NOP,
        E_ifun:    0,
        E_valC:    0,
        E_valA:    0,
        E_valB:    0,
        E_dstE:    Constant.R_NONE,
        E_dstM:    Constant.R_NONE,
        E_srcA:    Constant.R_NONE,
        E_srcB:    Constant.R_NONE,
        E_carryPC: -1,
        E_stat:    Constant.STAT_BUB,

        // Memory
        M_icode:   Constant.I_NOP,
        M_valE:    0,
        M_valA:    0,
        M_dstE:    Constant.R_NONE,
        M_dstM:    Constant.R_NONE,
        M_stat:    Constant.STAT_BUB,
        M_carryPC: -1,
        M_Cnd:     false,

        // Write Back
        W_icode: Constant.I_NOP,
        W_valE:  0,
        W_valM:  0,
        W_dstE:  Constant.R_NONE,
        W_dstM:  Constant.R_NONE,
        W_stat:  Constant.STAT_BUB
    };

    function init(register) {
        for (var name in defaults) {
            if (defaults.hasOwnProperty(name)) {
                register[name] = defaults[name];
            }
        }
    }

    init(this);
}

PIPERegister.prototype.get = function (name) {
    if (typeof this[name] === 'undefined') {
        throw new Error('Register error undefined name: ' + name);
    }
    return this[name];
};

PIPERegister.prototype.set = function (name, value) {
    if (typeof name == 'object') {
        for (var key in name) {
            if (name.hasOwnProperty(key)) {
                if (Utils.checkNumber(name[key])) {
                    this[key] = name[key];
                }
            }
        }
    } else {
        if (!Utils.checkNumber(value)) {
            return false;
        }
        this[name] = value;
    }
    return true;
};
