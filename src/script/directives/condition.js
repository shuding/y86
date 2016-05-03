/**
 * Created by shuding on 6/4/15.
 * <ds303077135@gmail.com>
 */
angular
    .module('y86')
    .directive('conditionContainer', function () {
        return {
            restrict:   'E',
            transclude: true,
            template:   '<h3>CONDITIONS</h3>' +
                        '<div ng-transclude="true"></div>'
        }
    })
    .directive('condition', function () {
        return {
            restrict: 'E',
            scope: {
                condName: '=',
                condData: '='
            },
            template: '<span>{{ condName | uppercase }}={{ condData }}</span>',
            link: function($scope, elem) {
                $scope.$watch('condData', function () {
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
