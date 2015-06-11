/**
 * Created by shuding on 6/9/15.
 * <ds303077135@gmail.com>
 */

module.exports = Util = {};

Util.checkNumber = function (data) {
    data = +data;
    return !isNaN(data) && data === parseInt(data);
};

Util.checkByte = function (data) {
    data = +data;
    if (!Util.checkNumber(data))
        return 0;
    return 0 <= data && data < 256;
};
