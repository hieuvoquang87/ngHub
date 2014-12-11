'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'myApp.view1',
  'myApp.view2',
  'myApp.version',
  'ngHub'
])
        .config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/view1'});
}])
    .controller('appController', ['$scope','ngHub' ,function($scope, ngHub){
        $scope.elemId = '';
        $scope.groupName = '';
        $scope.message = {};
        
        $scope.globalState = {
            view1: {name:'view1', value:'view1 state 1234'},
            view2: {name:'view2', value:'view2 state 4321'}
        };
        
        $scope.broadcastChangeColor = function() {
            ngHub.broadcast('changeColor');
        };
        
        var appTransceiver = ngHub.getTransceiver('appTrans');
        $scope.changeColor = function() {
            var elemId = 'Elem'+$scope.elemId;
            appTransceiver.notify(elemId,'changeColor');
            $scope.elemId = '';
        };
        $scope.changeRowColor = function() {
            var groupName = $scope.groupName;
            appTransceiver.notifyGroup(groupName,'changeColor');
            $scope.groupName = '';
        };
        $scope.sendMessage = function() {
            var elemId = 'Elem'+$scope.message.sender;
            var content = $scope.message.content;
            appTransceiver.notify(elemId,'messageSent',content);
            $scope.message = {};
        };
        
        $scope.requestItem = function() {
            $scope.requestedItem = appTransceiver.request('view1','itemFromView1', 12345, function(response){
                var a = response.response;
   
            });
        };
        $scope.count = 0;
        $scope.time = 0;
        $scope.chainRequestItem = function() {                
            $scope.chainResponse = appTransceiver.request('Elem11', 'chainItems', 1111, function (response) {
                var a = response.response;

            });
        };
        $scope.autoChainRequestItem = function() {
            var startTime = new Date().getTime();
                    for (var i = 0; i < 10000; i++) {
                        $scope.count++;
                        $scope.chainResponse = new Array();
                        $scope.chainResponse = appTransceiver.request('Elem11', 'autoChainItems', 1111, function (response) {
                            var a = response.response;

                        });
                    }
            $scope.count = $scope.count * 6;        
            var endTime = new Date().getTime();
            $scope.time = (endTime - startTime)/1000;
            
        };
        
        appTransceiver.onRequest('viewState', function(request){
            request.reply(function(args) {
                return $scope.globalState[args];
            });
        });
    }]);
