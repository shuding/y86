/**
 * Created by shuding on 6/9/15.
 * <ds303077135@gmail.com>
 */

module.exports = {

    REGISTERS: [
        'R_EAX',
        'R_ECX',
        'R_EDX',
        'R_EBX',
        'R_ESP',
        'R_EBP',
        'R_ESI',
        'R_EDI'
    ],

    P_LOAD:   0,
    P_STALL:  1,
    P_BUBBLE: 2,
    P_ERROR:  3,

    I_NOP:    0,
    I_HALT:   1,
    I_RRMOVL: 2,
    I_IRMOVL: 3,
    I_RMMOVL: 4,
    I_MRMOVL: 5,
    I_OPL:    6,
    I_JXX:    7,
    I_CALL:   8,
    I_RET:    9,
    I_PUSHL:  0xa,
    I_POPL:   0xb,
    I_IADDL:  0xc,
    I_LEAVE:  0xd,

    A_ADD:  0,
    A_SUB:  1,
    A_AND:  2,
    A_XOR:  3,
    A_NONE: 4,

    F_OF: 1, // OF at bit 0
    F_SF: 2, // SF at bit 1
    F_ZF: 4, // ZF at bit 2

    C_TRUE: 0,
    C_LE:   1,
    C_L:    2,
    C_E:    3,
    C_NE:   4,
    C_GE:   5,
    C_G:    6,

    STAT_BUB: 0,
    STAT_AOK: 1,
    STAT_HLT: 2,
    STAT_ADR: 3,
    STAT_INS: 4,
    STAT_PIP: 5,

    R_EAX:  0,
    R_ECX:  1,
    R_EDX:  2,
    R_EBX:  3,
    R_ESP:  4,
    R_EBP:  5,
    R_ESI:  6,
    R_EDI:  7,
    R_NONE: 0xf,

    DEF_CC: 4
};
