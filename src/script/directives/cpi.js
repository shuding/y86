/**
 * Created by shuding on 6/11/15.
 * <ds303077135@gmail.com>
 */
angular.module('y86').directive('cpiContainer', function () {
    return {
        restrict:   'E',
        scope:      true,
        transclude: true,
        template:   '<h6>CPI Curve</h6><div><input id="cpi-input" type="range" min="0" max="{{ parser.CPU.cpi.length - 1 }}" value="0" step="1" ng-model="getterAndSetterCycle"><canvas id="graph" width="1000" height="50"></div>',
        link: function ($scope, elem) {
            var canvas = elem.find('canvas')[0];
            var context = canvas.getContext('2d');
            var lastPoint = [[0, 0], [0, 0]];
            context.strokeStyle = '#37F3FF';
            context.lineWidth = 2;

            function draw(dataset) {
                // Clear
                context.fillStyle = 'black';
                context.fillRect(0, 0, 1000, 50);

                if (!dataset || dataset.length < 2)
                    return;

                var eachPadding = 1000 / (dataset.length - 1);
                var maxY = .1;

                dataset.forEach(function (y) {
                    maxY = Math.max(maxY, y - 1);
                });

                context.beginPath();
                context.moveTo(0, 49);

                // Render dataset
                dataset.forEach(function (y, x) {
                    var px = x * eachPadding;
                    var py = (1 - (y - 1) / maxY) * 48 + 1;
                    context.fillStyle = '#30F4FE';
                    context.fillRect(px - 1, py - 3, 2, 5);

                    if (x > 1) {
                        context.quadraticCurveTo(lastPoint[1][0], lastPoint[1][1], (px + lastPoint[1][0]) / 2, (py + lastPoint[1][1]) / 2);
                    }

                    lastPoint[0] = lastPoint[1];
                    lastPoint[1] = [px, py];
                });

                context.quadraticCurveTo(lastPoint[0][0], lastPoint[0][1], lastPoint[1][0], lastPoint[1][1]);

                context.stroke();
                context.closePath();
            }

            $scope.$watch('parser.CPU.cpi.length', function () {
                if ($scope.parser)
                    draw($scope.parser.CPU.cpi);
            });

            $scope.$watch('parser.CPU.cycle', function (value) {
                $scope.getterAndSetterCycle = value;
            });

            $scope.$watch('getterAndSetterCycle', function (value) {
                if ($scope.parser)
                    $scope.parser.CPU.goto(value);
            });

            elem.find('#cpi-input');
        }
    }
});
