/**
 * Created by shuding on 6/9/15.
 * <ds303077135@gmail.com>
 */

var Constant     = require('script/kernels/constant');
var Memory       = require('script/kernels/memory');
var Register     = require('script/kernels/register').Register;
var PIPERegister = require('script/kernels/register').PIPERegister;
var ALU          = require('script/kernels/alu');

module.exports = CPU;

function clone(obj) {
    if (null == obj || "object" != typeof obj) {
        return obj;
    }
    var constructor = obj.constructor || obj.__proto__.constructor;
    var copy        = new constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) {
            copy[attr] = obj[attr];
        }
    }
    return copy;
}

function saveHistory(cpu, cycle) {
    cpu.history[cycle] = {
        Memory:      clone(cpu.Memory),
        Register:    clone(cpu.Register),
        Input:       clone(cpu.Input),
        Output:      clone(cpu.Output),
        ALU:         clone(cpu.ALU),
        cycle:       cpu.cycle,
        instruction: cpu.instruction,
        state:       cpu.state,
        halt:        cpu.halt,
        mrmovl:      cpu.mrmovl,
        popl:        cpu.popl,
        cond:        cpu.cond,
        ret:         cpu.ret,
        use:         cpu.use,
        mispredict:  cpu.mispredict
    };
}

function timeMachine(cpu, cycle) {
    cpu.Memory      = cpu.history[cycle].Memory;
    cpu.Register    = cpu.history[cycle].Register;
    cpu.Input       = cpu.history[cycle].Input;
    cpu.Output      = cpu.history[cycle].Output;
    cpu.ALU         = cpu.history[cycle].ALU;
    cpu.instruction = cpu.history[cycle].instruction;
    cpu.cycle       = cpu.history[cycle].cycle;
    cpu.state       = cpu.history[cycle].state;
    cpu.halt        = cpu.history[cycle].halt;
    cpu.mrmovl      = cpu.history[cycle].mrmovl;
    cpu.popl        = cpu.history[cycle].popl;
    cpu.cond        = cpu.history[cycle].cond;
    cpu.ret         = cpu.history[cycle].ret;
    cpu.use         = cpu.history[cycle].use;
    cpu.mispredict  = cpu.history[cycle].mispredict;
}

function saveCPI (cpu, cycle, cpi) {
    cpu.cpi[cycle] = cpi;
}

function CPU() {
    this.Memory   = new Memory();
    this.Register = new Register();
    this.Input    = new PIPERegister();
    this.Output   = new PIPERegister();
    this.ALU      = new ALU();

    this.history = [];
    this.cpi     = [0];

    /**
     * Initialization
     */
    function init(cpu) {
        cpu.cycle       = 0;
        cpu.instruction = 0;
        cpu.state       = Constant.STAT_AOK;
        cpu.halt        = false;

        cpu.mrmovl = 0;
        cpu.popl   = 0;
        cpu.cond   = 0;
        cpu.ret    = 0;

        cpu.use        = 0;
        cpu.mispredict = 0;

        saveHistory(cpu, 0);
    }

    init(this);
}

CPU.prototype.goto = function (cycle) {
    if (cycle < this.history.length) {
        timeMachine(this, cycle);
    }
};

CPU.prototype.backword = function () {
    if (this.history[this.cycle - 1]) {
        timeMachine(this, this.cycle - 1);
    }
};

CPU.prototype.forward = function () {
    if (this.cycle + 1 < this.history.length) {
        timeMachine(this, this.cycle + 1);
        return;
    }

    var input  = this.Input;
    var output = this.Output;

    if (input.W_icode == Constant.I_HALT) {
        this.state = Constant.STAT_HLT;
    }

    if (this.state != Constant.STAT_AOK && this.state != Constant.STAT_BUB) {
        throw new Error('State error: ' + this.state);
    }

    this.writeBack();
    this.memory();
    this.execute();
    this.decode();
    this.fetch();

    this.cycle++;

    if (this.state != Constant.STAT_BUB) {
        this.instruction++;
    }

    this.nextPIPERegister();

    saveCPI(this, this.cycle, this.updateCPI());
    saveHistory(this, this.cycle);
};

CPU.prototype.updateCPI = function () {
    var lp = (this.mrmovl + this.popl) * this.use;
    var mp = this.cond * this.mispredict;
    var rp = this.ret;

    if (!this.instruction)
        lp = mp = rp = 0;
    if (!this.mrmovl && !this.popl)
        lp = 0;
    if (!this.cond)
        mp = 0;

    if (lp)
        lp /= this.instruction * (this.mrmovl + this.popl);
    if (mp)
        mp /= this.instruction * this.cond;
    if (rp)
        rp /= this.instruction;

    return lp + mp * 2 + rp * 3 + 1;
};

CPU.prototype.fetch = function () {
    if (this.halt) {
        return;
    }

    var input  = this.Input;
    var output = this.Output;

    var next;

    if (input.M_icode == Constant.I_JXX && !input.M_Cnd) {
        next = input.M_valA;
    } else if (input.W_icode == Constant.I_RET) {
        next = input.W_valM;
    } else {
        next = input.F_predPC;
    }

    var insruction = this.Memory.readByte(next++);
    output.D_icode = insruction >> 4;
    output.D_ifun  = insruction & 15;

    if ([Constant.I_NOP, Constant.I_HALT, Constant.I_RRMOVL, Constant.I_IRMOVL, Constant.I_RMMOVL, Constant.I_MRMOVL, Constant.I_OPL, Constant.I_JXX, Constant.I_CALL, Constant.I_RET, Constant.I_PUSHL, Constant.I_POPL, Constant.I_LEAVE, Constant.I_IADDL].indexOf(output.D_icode) == -1) {
        output.F_stat = output.D_stat = Constant.STAT_INS;
        return;
    } else if (output.D_icode == Constant.I_HALT) {
        output.F_stat = output.D_stat = Constant.STAT_HLT;
        return;
    } else {
        output.F_stat = output.D_stat = Constant.STAT_AOK;
    }

    if ([Constant.I_RRMOVL, Constant.I_OPL, Constant.I_IRMOVL, Constant.I_MRMOVL, Constant.I_RMMOVL, Constant.I_PUSHL, Constant.I_POPL, Constant.I_IADDL].indexOf(output.D_icode) != -1) {
        var regByte = this.Memory.readByte(next++);
        output.D_rA = regByte >> 4;
        output.D_rB = regByte & 15;
    } else {
        output.D_rA = output.D_rB = Constant.R_NONE;
    }

    if ([Constant.I_IRMOVL, Constant.I_RMMOVL, Constant.I_MRMOVL, Constant.I_JXX, Constant.I_CALL, Constant.I_IADDL].indexOf(output.D_icode) != -1) {
        output.D_valC = this.Memory.readInt(next);
        next += 4;
    }

    output.F_predPC = next;
    if ([Constant.I_JXX, Constant.I_CALL].indexOf(output.D_icode) != -1) {
        output.F_predPC = output.D_valC;
    }
    output.D_valP = next;
};

CPU.prototype.decode = function () {

    var input  = this.Input;
    var output = this.Output;

    output.E_icode = input.D_icode;
    output.E_ifun  = input.D_ifun;
    output.E_valC  = input.D_valC;
    output.E_stat  = input.D_stat;

    if ([Constant.I_RRMOVL, Constant.I_RMMOVL, Constant.I_OPL, Constant.I_PUSHL].indexOf(input.D_icode) != -1) {
        output.E_srcA = input.D_rA;
    } else if ([Constant.I_POPL, Constant.I_RET].indexOf(input.D_icode) != -1) {
        output.E_srcA = Constant.R_ESP;
    } else if (input.D_icode == Constant.I_LEAVE) {
        output.E_srcA = Constant.R_EBP;
    } else {
        output.E_srcA = Constant.R_NONE;
    }

    if ([Constant.I_OPL, Constant.I_RMMOVL, Constant.I_MRMOVL, Constant.I_IADDL].indexOf(input.D_icode) != -1) {
        output.E_srcB = input.D_rB;
    } else if ([Constant.I_PUSHL, Constant.I_POPL, Constant.I_CALL, Constant.I_RET].indexOf(input.D_icode) != -1) {
        output.E_srcB = Constant.R_ESP;
    } else if (input.D_icode == Constant.I_LEAVE) {
        output.E_srcB = Constant.R_EBP;
    } else {
        output.E_srcB = Constant.R_NONE;
    }

    if ([Constant.I_RRMOVL, Constant.I_IRMOVL, Constant.I_OPL, Constant.I_IADDL].indexOf(input.D_icode) != -1) {
        output.E_dstE = input.D_rB;
    } else if ([Constant.I_PUSHL, Constant.I_POPL, Constant.I_CALL, Constant.I_RET, Constant.I_LEAVE].indexOf(input.D_icode) != -1) {
        output.E_dstE = Constant.R_ESP;
    } else {
        output.E_dstE = Constant.R_NONE;
    }

    if ([Constant.I_MRMOVL, Constant.I_POPL].indexOf(input.D_icode) != -1) {
        output.E_dstM = input.D_rA;
    } else if (input.D_icode == Constant.I_LEAVE) {
        output.E_dstM = Constant.R_EBP;
    } else {
        output.E_dstM = Constant.R_NONE;
    }

    if ([Constant.I_CALL, Constant.I_JXX].indexOf(input.D_icode) != -1) {
        output.E_valA = input.D_valP;
    } else if (output.E_srcA == output.M_dstE) {
        output.E_valA = output.M_valE;
    } else if (output.E_srcA == input.M_dstM) {
        output.E_valA = output.W_valM;
    } else if (output.E_srcA == input.M_dstE) {
        output.E_valA = input.M_valE;
    } else if (output.E_srcA == input.W_dstM) {
        output.E_valA = input.W_valM;
    } else if (output.E_srcA == input.W_dstE) {
        output.E_valA = input.W_valE;
    } else {
        output.E_valA = this.Register.get(output.E_srcA);
    }

    if (output.E_srcB == output.M_dstE) {
        output.E_valB = output.M_valE;
    } else if (output.E_srcB == input.M_dstM) {
        output.E_valB = output.W_valM;
    } else if (output.E_srcB == input.M_dstE) {
        output.E_valB = input.M_valE;
    } else if (output.E_srcB == input.W_dstM) {
        output.E_valB = input.W_valM;
    } else if (output.E_srcB == input.W_dstE) {
        output.E_valB = input.W_valE;
    } else {
        output.E_valB = this.Register.get(output.E_srcB);
    }

};

CPU.prototype.execute = function () {

    var input  = this.Input;
    var output = this.Output;
    var alu    = this.ALU;

    output.M_icode = input.E_icode;
    output.M_valA  = input.E_valA;
    output.M_dstM  = input.E_dstM;
    output.M_stat  = input.E_stat;

    if (input.E_icode == Constant.I_MRMOVL) {
        this.mrmovl++;
    }
    if (input.E_icode == Constant.I_POPL) {
        this.popl++;
    }
    if (input.E_icode == Constant.I_JXX) {
        this.cond++;
    }
    if (input.E_icode == Constant.I_RET) {
        this.ret++;
    }

    if (input.E_icode == Constant.I_HALT && input.E_stat != Constant.STAT_BUB) {
        this.halt     = true;
        output.M_stat = Constant.STAT_HLT;
    }

    // ALU-A
    if ([Constant.I_RRMOVL, Constant.I_OPL].indexOf(input.E_icode) != -1) {
        alu.config.setInA(input.E_valA);
    } else if ([Constant.I_IRMOVL, Constant.I_RMMOVL, Constant.I_MRMOVL, Constant.I_IADDL].indexOf(input.E_icode) != -1) {
        alu.config.setInA(input.E_valC);
    } else if ([Constant.I_CALL, Constant.I_PUSHL].indexOf(input.E_icode) != -1) {
        alu.config.setInA(-4);
    } else if ([Constant.I_RET, Constant.I_POPL, Constant.I_LEAVE].indexOf(input.E_icode) != -1) {
        alu.config.setInA(4);
    } else {
        alu.config.setInA(0);
    }

    // ALU-B
    if ([Constant.I_RMMOVL, Constant.I_MRMOVL, Constant.I_OPL, Constant.I_CALL, Constant.I_PUSHL, Constant.I_RET, Constant.I_POPL, Constant.I_IADDL, Constant.I_LEAVE].indexOf(input.E_icode) != -1) {
        alu.config.setInB(input.E_valB);
    } else {
        alu.config.setInB(0);
    }

    // ALU-fCode
    if (input.E_icode == Constant.I_OPL) {
        alu.config.setFCode(input.E_ifun);
    } else {
        alu.config.setFCode(0);
    }

    // ALU-Update
    if ([Constant.I_OPL, Constant.I_IADDL].indexOf(input.E_icode) != -1 && [Constant.STAT_ADR, Constant.STAT_INS, Constant.STAT_HLT].indexOf(output.W_stat) == -1 && [Constant.STAT_ADR, Constant.STAT_INS, Constant.STAT_HLT].indexOf(input.W_stat) == -1) {
        alu.config.setUpdate(1);
    } else {
        alu.config.setUpdate(0);
    }

    output.M_valE = alu.execute();
    output.M_Cnd  = alu.condition(input.E_ifun);
    output.M_valA = input.E_valA;

    if (input.E_icode == Constant.I_RRMOVL && !output.M_Cnd) {
        output.M_dstE = Constant.R_NONE;
    } else {
        output.M_dstE = input.E_dstE;
    }
};

CPU.prototype.memory = function () {

    var input  = this.Input;
    var output = this.Output;

    var rMem = false, wMem = false, mAddr = 0;

    output.W_stat  = input.M_stat;
    output.W_icode = input.M_icode;
    output.W_valE  = input.M_valE;
    output.W_dstE  = input.M_dstE;
    output.W_dstM  = input.M_dstM;

    if ([Constant.I_RMMOVL, Constant.I_PUSHL, Constant.I_CALL, Constant.I_MRMOVL].indexOf(input.M_icode) != -1) {
        mAddr = input.M_valE;
    } else if ([Constant.I_POPL, Constant.I_RET, Constant.I_LEAVE].indexOf(input.M_icode) != -1) {
        mAddr = input.M_valA;
    }

    rMem = [Constant.I_MRMOVL, Constant.I_POPL, Constant.I_RET, Constant.I_LEAVE].indexOf(input.M_icode) != -1;

    wMem = [Constant.I_RMMOVL, Constant.I_PUSHL, Constant.I_CALL].indexOf(input.M_icode) != -1;

    if (rMem) {
        output.W_valM = this.Memory.readInt(mAddr);
    }
    if (wMem) {
        this.Memory.writeInt(mAddr, input.M_valA);
    }
};

CPU.prototype.writeBack = function () {

    var input = this.Input;

    this.state = input.W_stat;
    if (input.W_icode == Constant.I_RMMOVL) {
        return;
    }

    this.Register.set(input.W_dstE, input.W_valE);
    this.Register.set(input.W_dstM, input.W_valM);
};

CPU.prototype.nextPIPERegister = function () {

    var input  = this.Input;
    var output = this.Output;

    var F_stall = (([Constant.I_MRMOVL, Constant.I_POPL, Constant.I_LEAVE].indexOf(input.E_icode) != -1) && ([output.E_srcA, output.E_srcB].indexOf(input.E_dstM) != -1)) || ([input.D_icode, input.E_icode, input.M_icode].indexOf(Constant.I_RET) != -1);

    var D_stall = ([Constant.I_MRMOVL, Constant.I_POPL, Constant.I_LEAVE].indexOf(input.E_icode) != -1) && ([output.E_srcA, output.E_srcB].indexOf(input.E_dstM) != -1);

    var D_bubble = (input.E_icode == Constant.I_JXX && !output.M_Cnd) || ((!D_stall) && ([input.D_icode, input.E_icode, input.M_icode].indexOf(Constant.I_RET) != -1));

    var E_bubble = (input.E_icode == Constant.I_JXX && !output.M_Cnd) || (([Constant.I_MRMOVL, Constant.I_POPL, Constant.I_LEAVE].indexOf(input.E_icode) != -1 && [output.E_srcA, output.E_srcB].indexOf(input.E_dstM) != -1));

    var M_bubble = [Constant.STAT_ADR, Constant.STAT_INS, Constant.STAT_HLT].indexOf(output.W_stat) != -1 || [Constant.STAT_ADR, Constant.STAT_INS, Constant.STAT_HLT].indexOf(input.W_stat) != -1;

    if (([Constant.I_MRMOVL, Constant.I_POPL].indexOf(input.E_icode) != -1) && (input.E_dstM == input.E_srcA || input.E_dstM == input.E_srcB)) {
        this.use++;
    }

    if (input.E_icode == Constant.I_JXX && !input.M_Cnd) {
        this.mispredict++;
    }

    // Copy from output
    var reg = new PIPERegister();
    for (var name in output) {
        if (output.hasOwnProperty(name)) {
            reg.set(name, output[name]);
        }
    }

    if (M_bubble) {
        reg.set({
            M_icode: Constant.I_NOP,
            M_stat:  Constant.STAT_BUB,
            M_dstE:  Constant.R_NONE,
            M_dstM:  Constant.R_NONE,
            M_Cnd:   false
        });
    }

    if (E_bubble) {
        reg.set({
            E_icode: Constant.I_NOP,
            E_ifun:  0,
            E_stat:  Constant.STAT_BUB,
            E_dstE:  Constant.R_NONE,
            E_dstM:  Constant.R_NONE,
            E_srcA:  Constant.R_NONE,
            E_srcB:  Constant.R_NONE
        });
    }

    if (D_stall) {
        reg.set({
            D_icode: input.D_icode,
            D_ifun:  input.D_ifun,
            D_rA:    input.D_rA,
            D_rB:    input.D_rB,
            D_valC:  input.D_valC,
            D_valP:  input.D_valP
        });
    }

    if (D_bubble) {
        reg.set({
            D_icode: Constant.I_NOP,
            D_ifun:  0,
            D_stat:  Constant.STAT_BUB
        });
    }

    if (F_stall) {
        reg.set('F_predPC', input.F_predPC);
    }

    this.Input = reg;
};
