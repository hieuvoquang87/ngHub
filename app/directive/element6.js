angular.module('myApp').directive('sixthElement', function(){
    return {
        restrict: 'A',
        scope: {}, //use isolated scope to ensure separation of each element
        template: "<div id='Elem23' style='background-color: lightskyblue; margin: 10px; height: 220px; width: 350px'>Element 2-3 | {{objectForRequest}}<br>\n\
                        Belong to group: row1 | column1    \n\
                        <button ng-click='changeRowColor()'>Change Row Color</button>\n\
                        <button ng-click='changeColumnColor()'>Change Column Color</button>\n\
                        <br>{{message}}<br>\n\
                        <button ng-click='reply()'>Click to reply</button> {{chainResponse}}\n\
                    </div>",
        controller: 'sixthElementController'
    };
}).controller('sixthElementController',['$scope', 'ngHub', function($scope, ngHub){
    
    var elemTrans = ngHub.getTransceiver('Elem23').belongToGroup('row2').belongToGroup('column3');;
    
    $scope.objectForRequest = {name:'Elem6', value:'2-3' };
    
    
    var isBlue = true;
    elemTrans.on('changeColor', function(){
        var firstElem = document.getElementById('Elem23');
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
        elemTrans.notifyGroup('column3','changeColor');
    };
    
    var stackItems = [];   
    
    elemTrans.onRequest('autoChainItems', function(request){
        stackItems.push($scope.objectForRequest); 
        
        request.reply(stackItems);

        stackItems = new Array();
    }); 
    
    var request = elemTrans.onRequest('chainItems', function(request){

    });
    
    $scope.reply = function() {
        request.reply(function (arg) {
            stackItems.push($scope.objectForRequest);       
            return stackItems;
        });
    };
}]);


