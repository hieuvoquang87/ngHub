angular.module('myApp').directive('secondElement', function(){
    return {
        restrict: 'A',
        scope: {}, //use isolated scope to ensure separation of each element
        template: "<div id='Elem12' style='background-color: lightskyblue; margin: 10px; height: 220px; width: 350px'>Element 1-2 | {{objectForRequest}}<br>\n\
                        Belong to group: row1 | column2    \n\
                        <button ng-click='changeRowColor()'>Change Row Color</button>\n\
                        <button ng-click='changeColumnColor()'>Change Column Color</button>\n\
                        <br>{{message}}<br>\n\
                        <button ng-click='reply()'>Click to reply</button> {{chainResponse.status}}<br>{{chainResponse.response}}\n\
                    </div>",
        controller: 'secondElementController'
    };
}).controller('secondElementController',['$scope', 'ngHub', function($scope, ngHub){
    
    var elemTrans = ngHub.getTransceiver('Elem12').belongToGroup('row1').belongToGroup('column2');;
    var isBlue = true;
    
    $scope.objectForRequest = {name:'Elem2', value:'1-2' };
    
    elemTrans.on('changeColor', function(){
        var firstElem = document.getElementById('Elem12');
        isBlue = !isBlue;
        //Modify DOM for demo
        if(isBlue) {
            firstElem.style.backgroundColor = 'lightskyblue';
        } else {
            firstElem.style.backgroundColor = 'red';
        }  
    });
    elemTrans.on('messageSent', function(message){
        $scope.message = message;
    });
    $scope.changeRowColor = function() {
        elemTrans.notifyGroup('row1','changeColor');
    };
    $scope.changeColumnColor = function() {
        elemTrans.notifyGroup('column2','changeColor');
    };
    
    var stackItems = []; 
    var request;
    request = elemTrans.onRequest('autoChainItems', function(request){
        $scope.chainResponse = elemTrans.request('Elem13','autoChainItems', 'arg', function(response) {
            for(var i in response.response) {
                stackItems.push(response.response[i]);
            }  
        });
        request.reply(function (arg) {
            
            stackItems.push($scope.objectForRequest);
                return stackItems;
            }); 
        stackItems = new Array();
    }); 
    request = elemTrans.onRequest('chainItems', function(request){
        $scope.chainResponse = elemTrans.request('Elem13','chainItems', 'arg', function(response) {
            for(var i in response.response) {
                stackItems.push(response.response[i]);
            }  
        });
        
    });
    
    $scope.reply = function() {
        request.reply(function (arg) {
            
            stackItems.push($scope.objectForRequest);
            
                return stackItems;
            });
    };
}]);


