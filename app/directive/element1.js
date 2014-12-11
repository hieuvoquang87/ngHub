angular.module('myApp').directive('firstElement', function(){
   
    return {
        restrict: 'A',
        scope: {}, //use isolated scope to ensure separation of each element
        template:   "<div id='Elem11' style='background-color: lightskyblue; margin: 10px; height: 230px; width: 350px'>Element 1-1 | {{objectForRequest}}<br>\n\
                        Belong to group: row1 | column1    \n\
                        <button ng-click='changeRowColor()'>Change Row Color</button>\n\
                        <button ng-click='changeColumnColor()'>Change Column Color</button>\n\
                        <form ng-submit='sendMessage()'>\n\
                            Send message to Element:<br>\n\
                            To ElemId: <input type='text' ng-model='sendingMessage.sender' name='text' /><br>\n\
                            Message: <input type='text' ng-model='sendingMessage.content' name='text' /><br>\n\
                            <input type='submit' id='submit' value='Send' />\n\
                        </form>\n\
                        {{message}}<br>\n\
                        <button ng-click='reply()'>Click to reply</button>{{chainResponse.status}}<br>{{chainResponse.response}} \n\
                    </div>",
        controller: 'firstElementController'
    };
}).controller('firstElementController',['$scope', 'ngHub', function($scope, ngHub){
    
    $scope.sendingMessage = {};
    var elemTrans = ngHub.getTransceiver('Elem11').belongToGroup('row1').belongToGroup('column1');// Register Event Name and Listener Group
    
    $scope.objectForRequest = {name:'Elem1', value:'1-1' };
    
    var isBlue = true;
    elemTrans.on('changeColor', function(){
        var firstElem = document.getElementById('Elem11');
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
        elemTrans.notifyGroup('column1','changeColor');
    };
    $scope.sendMessage = function() {
            var elemId = 'Elem'+$scope.sendingMessage.sender;
            var content = $scope.sendingMessage.content;
            elemTrans.notify(elemId,'messageSent',content);
            $scope.sendingMessage = {};
        };
    
    var stackItems = [];
    var request;
    request = elemTrans.onRequest('autoChainItems', function(request){
        $scope.chainResponse = elemTrans.request('Elem12','autoChainItems', 'arg', function(response) {
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
        $scope.chainResponse = elemTrans.request('Elem12','chainItems', 'arg', function(response) {
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
    
    $scope.$on('$destroy', function(){
        console.log('Elem1 is destroyed!');
    }); 
}]);


