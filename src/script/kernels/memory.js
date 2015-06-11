/**
 * Created by shuding on 6/9/15.
 * <ds303077135@gmail.com>
 */

var Utils = require('script/kernels/utils');

module.exports = Memory;

function Memory() {
    this.data = [];

    this.fillTo = function (address) {
        for (var i = this.data.length; i <= address; ++i) {
            this.data[i] = [0, 0, 0, 0];
        }
    };
    this.get    = function (address) {
        var index  = Math.floor(address / 4);
        var offset = address % 4;
        if (typeof this.data[index] == 'undefined') {
            this.fillTo(index);
        }
        return this.data[index][offset];
    };
    this.set    = function (address, byte) {
        var index  = Math.floor(address / 4);
        var offset = address % 4;
        if (typeof this.data[index] == 'undefined') {
            this.fillTo(index);
        }
        this.data[index][offset] = byte;
    };
}

Memory.prototype.writeByte = function (address, byte) {
    if (!Utils.checkByte(byte)) {
        throw new Error('Byte error in `Memory writeByte`');
    }
    this.set(address, byte);
};

Memory.prototype.readByte = function (address) {
    return this.get(address);
};

Memory.prototype.writeInt = function (address, int) {
    if (!Utils.checkNumber(int)) {
        throw new Error('Int error in `Memory writeInt`');
    }
    for (var i = 0; i < 4; ++i) {
        this.set(address + i, int & 255);
        int >>= 8;
    }
};

Memory.prototype.readInt = function (address) {
    return this.get(address + 0) +
           this.get(address + 1) * 256 +
           this.get(address + 2) * 65536 +
           this.get(address + 3) * 16777216;
};
