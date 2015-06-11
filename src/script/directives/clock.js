/**
 * Created by shuding on 6/4/15.
 * <ds303077135@gmail.com>
 */
angular
    .module('y86')
    .directive('clockContainer', function () {
        return {
            restrict:   'E',
            transclude: true,
            template:   '<h3>CLOCK</h3>' +
                        '<div ng-transclude="true"></div>'
        }
    })
    .directive('clock', function () {
        return {
            restrict: 'E',
            scope: {
                data: '='
            },
            template: '<div>{{ data }}</div>',
            link: function($scope, elem) {
                $scope.$watch('data', function () {
                    move(elem[0])
                        .set('color', '#0B0B0B')
                        .set('background-color', '#37F3FF')
                        .duration('0s')
                        .delay('0s')
                        .then()
                            .set('color', '#37F3FF')
                            .set('background-color', '#0B0B0B')
                            .duration('.2s')
                            .delay('.1s')
                        .pop()
                        .end();
                });
            }
        }
    });
