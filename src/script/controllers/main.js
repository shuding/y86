angular.module('y86', ['ngRoute']).controller('mainCtrl', ['$scope', mainCtrl]).filter("toHex", function () {
    return function (input, digest) {
        if (typeof input == 'undefined' || input === null) {
            return '';
        }
        if (input < 0) {
            input = 0xFFFFFFFF + input + 1;
        }
        var ret = input.toString(16);
        while (ret.length < digest) {
            ret = '0' + ret;
        }
        return ret;
    };
}).filter("round", function () {
    return function (input) {
        return Math.round(input * 1000) / 1000 || 0;
    };
});

function mainCtrl($scope) {
    var Constant = require('script/kernels/constant');
    var Parser   = require('script/kernels/parser');

    $scope.constantMap = {
        stat:  {
            0: 'STAT_BUB',
            1: 'STAT_AOK',
            2: 'STAT_HLT',
            3: 'STAT_ADR',
            4: 'STAT_INS',
            5: 'STAT_PIP'
        },
        icode: {
            0:   'I_HALT',
            1:   'I_NOP',
            2:   'I_RRMOVL',
            3:   'I_IRMOVL',
            4:   'I_RMMOVL',
            5:   'I_MRMOVL',
            6:   'I_OPL',
            7:   'I_JXX',
            8:   'I_CALL',
            9:   'I_RET',
            0xa: 'I_PUSHL',
            0xb: 'I_POPL',
            0xc: 'I_IADDL',
            0xd: 'I_LEAVE'
        },
        reg: {
            0: 'R_EAX',
            1: 'R_ECX',
            2: 'R_EDX',
            3: 'R_EBX',
            4: 'R_ESP',
            5: 'R_EBP',
            6: 'R_ESI',
            7: 'R_EDI',
            15: 'R_NONE'
        }
    };

    $scope.$safeApply = function () {
        if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
            $scope.$apply();
        }
    };

    $scope.state = {
        icons:  ['play', 'pause'],
        icon:   0,
        loaded: 0
    };

    $scope.registers = {
        eax: 0,
        ecx: 0,
        edx: 0,
        ebx: 0,
        esp: 0,
        ebp: 0,
        esi: 0,
        edi: 0
    };

    $scope.memory = {
        data:  [],
        block: []
    };

    $scope.conditions = {
        zf: 0,
        sf: 0,
        of: 0
    };

    $scope.clock = {
        data: 0
    };

    $scope.code = {
        current:      0,
        height:       0,
        scrollTop:    0,
        scrollHeight: 0,
        lineHeight:   14 * 1.2,
        currentTab:   0,
        tabs:         ['asum', 'List_Sum', 'Forward'],
        tabFiles:     ['test/asum.yo', 'test/List_Sum.yo', 'test/Forward.yo'],
        fileCache:    ['', '', '']
    };

    $scope.player = {
        hz: 10
    };

    // Functions

    $scope.initParser = function (parser) {
        if ($scope.parser && $scope.parser !== parser)
            delete $scope.parser;

        $scope.parser      = parser;
        $scope.code.lines  = parser.syntaxs;
        $scope.clock.data  = parser.CPU.cycle;
        $scope.memory.data = parser.CPU.Memory.data;

        // Clock Cycle
        $scope.$watch('parser.CPU.cycle', function (clock) {
            $scope.clock.data = clock;
        });

        // Registers
        $scope.$watch('parser.CPU.Register[' + Constant['R_EAX'] + ']', function (value) {
            $scope.registers['eax'] = value;
        });
        $scope.$watch('parser.CPU.Register[' + Constant['R_ECX'] + ']', function (value) {
            $scope.registers['ecx'] = value;
        });
        $scope.$watch('parser.CPU.Register[' + Constant['R_EDX'] + ']', function (value) {
            $scope.registers['edx'] = value;
        });
        $scope.$watch('parser.CPU.Register[' + Constant['R_EBX'] + ']', function (value) {
            $scope.registers['ebx'] = value;
        });
        $scope.$watch('parser.CPU.Register[' + Constant['R_ESP'] + ']', function (value) {
            $scope.registers['esp'] = value;
        });
        $scope.$watch('parser.CPU.Register[' + Constant['R_EBP'] + ']', function (value) {
            $scope.registers['ebp'] = value;
        });
        $scope.$watch('parser.CPU.Register[' + Constant['R_ESI'] + ']', function (value) {
            $scope.registers['esi'] = value;
        });
        $scope.$watch('parser.CPU.Register[' + Constant['R_EDI'] + ']', function (value) {
            $scope.registers['edi'] = value;
        });

        // PC
        $scope.$watch('parser.CPU.Input.F_predPC', function (value) {
            $scope.code.current = $scope.parser.map[value] || $scope.code.current;
        });

        // Condition Codes
        $scope.$watch('parser.CPU.ALU.data.ZF', function (value) {
            $scope.conditions.zf = value;
        });
        $scope.$watch('parser.CPU.ALU.data.SF', function (value) {
            $scope.conditions.sf = value;
        });
        $scope.$watch('parser.CPU.ALU.data.OF', function (value) {
            $scope.conditions.of = value;
        });

        $scope.$watch('code.current', function (value) {
            var cursorPos = value * $scope.code.lineHeight;
            while (cursorPos >= $scope.code.height + $scope.code.scrollTop) {
                $scope.code.scrollTop += $scope.code.height;
            }
            while (cursorPos <= $scope.code.scrollTop) {
                $scope.code.scrollTop -= $scope.code.height;
            }
            $scope.code.scrollTop = Math.min($scope.code.scrollTop, $scope.code.scrollHeight - $scope.code.height);
            $scope.code.scrollTop = Math.max($scope.code.scrollTop, 0);
        });
    };

    $scope.loadTab = function (index) {
        $scope.code.currentTab = index;
        $scope.reset();
    };

    $scope.newTab = function (files) {
        var readFile = function (index) {
            if (!files[index])
                return;
            if (files[index].name.split('.')[1] !== 'yo') {
                alert('File type is not supported!');
                return;
            }
            $scope.code.tabs.push(files[index].name.split('.')[0]);
            var reader = new FileReader();
            reader.onload = function(event) {
                $scope.code.fileCache.push(event.target.result);
                $scope.$safeApply();
                readFile(index + 1);
            };
            reader.readAsText(files[index]);
        };
        readFile(0);
    };

    $scope.prev = function () {
        if (!$scope.parser) {
            return false;
        }
        if ($scope.state.icon) {
            // Pause here
            $scope.play();
        }
        $scope.parser.CPU.backword();
    };

    $scope.next = function () {
        if (!$scope.parser) {
            return false;
        }
        try {
            $scope.parser.CPU.forward();
        } catch (err) {
            return false;
        }
        return true;
    };

    $scope.setInterval = function () {
        if (!$scope.state.icon) {
            return false;
        }
        if (!$scope.next()) {
            $scope.state.icon = 0;
            $scope.$safeApply();
            return false;
        }
        $scope.$safeApply();
        setTimeout($scope.setInterval, 1000 / $scope.player.hz);
        return true;
    };

    $scope.play = function () {
        $scope.state.icon ^= 1;

        if ($scope.state.icon) {
            if (!$scope.parser) {
                // test
                var parser = new Parser($scope.code.fileCache[$scope.code.currentTab] || ($scope.code.fileCache[$scope.code.currentTab] = xhrGETSync($scope.code.tabFiles[$scope.code.currentTab])));

                $scope.initParser(parser);
                $scope.setInterval();
            } else {
                $scope.setInterval();
            }
        }
    };

    $scope.reset = function () {
        if ($scope.state.icon) {
            // Pause here
            $scope.play();
        }

        var parser = new Parser($scope.code.fileCache[$scope.code.currentTab] || ($scope.code.fileCache[$scope.code.currentTab] = xhrGETSync($scope.code.tabFiles[$scope.code.currentTab])));

        $scope.initParser(parser);
    };

    // Initialization

    setTimeout(function () {
        $scope.reset();
        $scope.$safeApply();
    }, 0);

    move.select = function (element) {
        return element;
    };
}
