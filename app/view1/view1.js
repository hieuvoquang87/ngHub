'use strict';

angular.module('myApp.view1', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl'
  });
}])

.controller('View1Ctrl', ['ngHub','$scope',function(ngHub, $scope) {
        var view1Trans = ngHub.getTransceiver('view1');
        //request view state
        $scope.viewState = view1Trans.request('appTrans','viewState','view1', function(response){
            var a = 1;
        });
        
        $scope.itemView1 = {value: 111, name: 'abc'};
        
        var responseFcn = function () {
            return {value: 12345};
        };
        
        //reply to request
        var request = view1Trans.onRequest('itemFromView1', function(r) {
         // var a = 1;
          //request = r;
            //request.reply($scope.itemView1);
        });
        
        $scope.reply = function () {
            request.reply(function (arg) {
                return $scope.itemView1;
            });
        };
        $scope.$on('$destroy', function(){
            console.log('view 1 destroyed!');
        });
}]);