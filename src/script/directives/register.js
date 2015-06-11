/**
 * Created by shuding on 6/4/15.
 * <ds303077135@gmail.com>
 */
angular
    .module('y86')
    .directive('registerContainer', function () {
        return {
            restrict:   'E',
            transclude: true,
            template:   '<h3>REGISTERS</h3>' +
                        '<div ng-transclude="true"></div>'
        }
    }).directive('register', function () {
        return {
            restrict: 'E',
            scope:    {
                regName: '=',
                regData: '='
            },
            template: '<div class="register-name">%{{regName}}</div>' +
                      '<div class="register-data">0x{{regData}}</div>',
            link: function($scope, elem) {
                $scope.$watch('regData', function () {
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
