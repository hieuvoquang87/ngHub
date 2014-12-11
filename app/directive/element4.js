angular.module('myApp').directive('fourthElement', function(){
    return {
        restrict: 'A',
        scope: {}, //use isolated scope to ensure separation of each element
        template: "<div id='Elem21' style='background-color: lightskyblue; margin: 10px; height: 230px; width: 350px'>Element 2-1 | {{objectForRequest}}<br>\n\
                        Belong to group: row2 | column1    \n\
                        <button ng-click='changeRowColor()'>Change Row Color</button>\n\
                        <button ng-click='changeColumnColor()'>Change Column Color</button>\n\
                        <div> <br>\n\
                            <button ng-click='requestItem()'>Request object from view 1</button><br>\n\
                            Display result: <input type='text' ng-model='requestedItem.response.value' name='text' />{{requestedItem.status}}\n\
                        </div> \n\
                        {{message}}<br>\n\
                        <button ng-click='reply()'>Click to reply</button> {{chainResponse.status}}<br>{{chainResponse.response}}\n\</div>",
        controller: 'fourthElementController'
    };
}).controller('fourthElementController',['$scope', 'ngHub', function($scope, ngHub){
    
    var elemTrans = ngHub.getTransceiver('Elem21').belongToGroup('row2').belongToGroup('column1');;
    var isBlue = true;
    
    $scope.objectForRequest = {name:'Elem4', value:'2-1' };
    
    elemTrans.on('changeColor', function(){
        var firstElem = document.getElementById('Elem21');
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
        elemTrans.notifyGroup('row2','changeColor');
    };
    $scope.changeColumnColor = function() {
        elemTrans.notifyGroup('column1','changeColor');
    };
    
    $scope.requestItem = function() {
            $scope.requestedItem = elemTrans.request('view1','itemFromView1', 111 , function(response) {
                
            });
        };
        
    var stackItems = [];  
    var request;
    request = elemTrans.onRequest('autoChainItems', function(request){
        $scope.chainResponse = elemTrans.request('Elem22','autoChainItems', 'arg', function(response) {
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
        $scope.chainResponse = elemTrans.request('Elem22','chainItems', 'arg', function(response) {
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


