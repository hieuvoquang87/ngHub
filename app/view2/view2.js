'use strict';

angular.module('myApp.view2', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view2', {
    templateUrl: 'view2/view2.html',
    controller: 'View2Ctrl'
  });
}])

.controller('View2Ctrl', ['$scope','ngHub',function($scope, ngHub) {
        var view2Trans = ngHub.getTransceiver('view1');
        //request view state
        $scope.viewState = view2Trans.request('appTrans','viewState','view2', function(response){
            var a = 1;
        });
        
        $scope.$on('$destroy', function(){
            console.log('view 2 destroyed!');
        });
}]);