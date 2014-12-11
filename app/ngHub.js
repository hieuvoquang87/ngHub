/* 
 * 
 * TODO: 
 * - group Request
 * - nested reply
 */
angular.module('ngHub',[]).service('ngHub',function() {
    
    var eventRegisterList = {};
    var groupList = {};
    var requestList = {};
    function Transceiver(transceiverName) {
            this.id = transceiverName;
            this.notify = function (receiverName, eventName, args) {
                fireEvent(transceiverName, receiverName, eventName, args);
            };
            this.notifyGroup = function (groupName, eventName, args) {
                fireEventForGroup(transceiverName, groupName, eventName, args);
            };
            this.on = function (eventName, listenerFcn) {
                registerEvent(transceiverName, eventName, listenerFcn);
            };
            this.belongToGroup = function (groupName) {
                registerListenerGroup(groupName, transceiverName);
                return this;
            };
            //-- Request methods
            this.request = function (receiverName, requestName, args, onResponseFcn) {
                // return DeferredResponse      
                return sendRequest(this.id, receiverName, requestName, args, onResponseFcn);
            };
            this.onRequest = function (requestName, onRequestFcn) {
                // return DeferredRequest
                return registerResponse(this.id, requestName, onRequestFcn);
            };
            this.requestGroup = function (receiverGroupName, requestName, args, onResponseFcn) {

            };
        };
        function Response() {
            this._type = 'DeferredResponse';
            this.status = 'Waiting...';// Can be omitted
            this.response = undefined;
            this.setResponse = function (response) {
                this._type = 'Response';
                this.status = 'Done!';// Can be omitted
                this.response = response;
            };
        };
        function GroupResponse() {
            this._type = 'DeferredGroupResponse';
            this.status = 'Waiting...';// Can be omitted
            this.response = new Array();
            this.setResponse = function (response) {
                this._type = 'GroupResponse';
                this.status = 'Done!';// Can be omitted
                this.response.push(response);
            };
        };
        function Request(recieverName, requestName, senderName, args, deferredResponse, onResponseFcn) {
            this._type = 'Request';
            this.name = requestName;
            this.receiver = recieverName;
            this.sender = senderName;
            this.args = args;
            this.deferredResponse = deferredResponse;
            this.onResponseFcn = onResponseFcn;
            this.reply = function (response) {
                //Response can be either Response Object 
                //or Response Fcn taking args as argument and returning Response Object
                replyToRequest(this.receiver, this.name, response);
            };
        };
    
    
    var registerEvent = function(transceiverId, eventName, listenerFcn) {
            if(!eventRegisterList[transceiverId][eventName]) {
                eventRegisterList[transceiverId][eventName] = listenerFcn;
            }
        };
    
    var registerListenerGroup = function (groupName, transceiverName) {
        TransceiverRegister:
        if(groupList[groupName]) {       
            for(var i in groupList[groupName]) {
                if(groupList[groupName][i] === transceiverName ) {
//                    console.log(transceiverName + ' already registered for '+ groupName +' group');
                    break TransceiverRegister;
                }
            }
            groupList[groupName].push(transceiverName);
        } else {
            groupList[groupName] = [];
            groupList[groupName].push(transceiverName);
        }
    };
    var fireEvent = function(senderName, receiverName, eventName, args) {
        if(eventRegisterList[receiverName]) {
            var message = {};
            message.senderName = senderName;
            message.args = args;
            eventRegisterList[receiverName][eventName](message); //execute event handler function
        } else {
//            console.log('Transceiver ' + eventRegisterList[receiverName] + ' does not exist');
        }
    };
    var fireEventForGroup = function (senderName, groupName, eventName, args) {
        if(groupList[groupName]) {
            for(var i in groupList[groupName]){
                fireEvent(senderName, groupList[groupName][i], eventName, args);
            }
        } else {
            console.log('Group '+groupName+' does not exist');
        }
    };
    
    var registerResponse = function (receiverName, requestName, onRequestFcn) {
        var requestId = requestName + '_' + receiverName;
        var deferredRequest = new Request(receiverName, requestName);
        deferredRequest._type = 'DeferredRequest';
        
        if(!requestList[requestId]) {
            requestList[requestId] = {};  
            requestList[requestId].deferredRequest = deferredRequest;
            requestList[requestId].responseFcn = onRequestFcn;
        } else {
            requestList[requestId].deferredRequest = deferredRequest;
            requestList[requestId].responseFcn = onRequestFcn;
        }
        return requestList[requestId].deferredRequest;
    };
    
    var sendRequest = function(senderName, receiverName, requestName, args, onResponseFcn) {
        var requestId = requestName + '_' + receiverName;
        var newDeferredResponse = new Response();
        var newRequest = new Request(receiverName, requestName, senderName, args, newDeferredResponse, onResponseFcn);
        try {
            if (requestList[requestId]) {
                if (requestList[requestId].pendingRequest) {
                    requestList[requestId].pendingRequest.push(newRequest);
                } else {
                    requestList[requestId].pendingRequest = new Array();
                    requestList[requestId].pendingRequest.push(newRequest);
                }
                var indexOfNewRequest = requestList[requestId].pendingRequest.length - 1;
                return requestList[requestId].pendingRequest[indexOfNewRequest].deferredResponse;
            }
        } finally {
            if(requestList[requestId]) {
                requestList[requestId].responseFcn(newRequest);
            } else {
                console.log('No Response Registered for Request: '+ requestName);
            }
            
        }
    };
    
    var replyToRequest = function (receiverName, requestName, response) {
        var requestId = requestName + '_' + receiverName;
       
        if(requestList[requestId]) {    
            if(requestList[requestId].pendingRequest) {
                for(var i = 0; i< requestList[requestId].pendingRequest.length; i++) { // Fulfill all pending Requests
                    var request = requestList[requestId].pendingRequest[i];
                    
                    var incomingResponse; 
                    if(typeof response === 'function') {
                        incomingResponse = response(request.args); // response return from response
                    } else {
                        incomingResponse = response;
                    }       
                            
                    var deferredResponse = requestList[requestId].pendingRequest[i].deferredResponse;
                    
                    deferredResponse.setResponse(incomingResponse);// Populate DeferredResponse with Response
                    requestList[requestId].pendingRequest[i].onResponseFcn(deferredResponse);
                    requestList[requestId].pendingRequest.splice(i,1);
                }
            } else {
                console.log('No Incoming Request ' + requestName +' for ' + receiverName);
            }         
        } else {
            console.log('Fail to fulfill Request!');
        }       
    };
    
    
    
    return {
        getTransceiver: function(transceiverId) {
            eventRegisterList[transceiverId] = {};
            return new Transceiver(transceiverId, this);
        },
        notify: function (receiverName, eventName, args) {
            fireEvent('ngHub', receiverName, eventName, args);
        },
        notifyGroup: function (groupName, eventName, args) {
            fireEventForGroup('ngHub', groupName, eventName, args);
        },
        broadcast: function (eventName, args) {
            for(var i in eventRegisterList) {
                var message = {};
                message.senderName = 'ngHub';
                message.args = args;
                if(eventRegisterList[i][eventName]) {
                    eventRegisterList[i][eventName](message);//execute event handler function
                }
            }
        }
    };
});

