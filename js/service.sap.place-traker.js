/* 
 * File: service.sap.place-traker.js
 * Project: js
 * File Created: Sunday, 1st July 2018 10:12:07 pm
 * Author: Sergei Papulin
 * -----
 * Last Modified: Sunday, 1st July 2018 10:35:10 pm
 * Modified By: Sergei Papulin
 * -----
 * Source: Samsung Accessory Protocol
 * -----
 * Copyright 2018 Sergei Papulin, Zighter
 */

var serviceT = (function() {
	
	var serviceT = {},
		SAAgent,
	    SASocket,
		onReceiveCallback = null;
	
	// STEP 2. Listener object for upcoming connection from Consumer
	var connectionListener = {
			
	    // STEP 3. Remote peer agent (Consumer) requests a service (Provider) connection
	    onrequest: function (peerAgent) { // peerAgent - remote device

	        console.log(peerAgent.appName);
	        
	        // Check connecting peer by appName
	        if (peerAgent.appName === "MapBox2App") {
	        	
	        	// STEP 4a. Accept a connection request
	            SAAgent.acceptServiceConnectionRequest(peerAgent);
	            console.log("Service connection request accepted.");

	        } else {
	        	// STEP 4b. Reject a connection request
	            SAAgent.rejectServiceConnectionRequest(peerAgent);
	            console.log("Service connection request rejected.");

	        }
	    },

	    // STEP 5. Connection between Provider and Consumer is established
	    onconnect: function (socket) {
	    	
	        console.log("Service connection established");

	        // Obtaining socket
	        SASocket = socket;

	        // STEP 6. Set the listener to inform when connection would get lost
	        SASocket.setSocketStatusListener(onConnectionLost);

	        function onConnectionLost(reason) {
	        	console.log(reason);
	        };
	        
	        // STEP 7. Set listener for incoming data from Consumer
	        SASocket.setDataReceiveListener(onReceive);
	        
	        // STEP 8. Receive data from Consumer 
	        function onReceive(channelId, data) {
				
	        	//console.log(JSON.parse(data));
	        	
	            if (!SAAgent.channelIds[0]) {
	                return;
	            }

	            // Compose a message to a remote peer device (Consumer)
	        	var responseData = {status: "OK", message: "The stroll was received by the watch"};
				
				// TODO: 
				onReceiveCallback(JSON.parse(data));

	            // STEP 7. Send a response to Consumer
	            SASocket.sendData(SAAgent.channelIds[0], JSON.stringify(responseData));
	            console.log(responseData);

	        };
	    },
	    
	    // Display a message in case of errors
	    onerror: function (errorCode) {
	        console.log(errorCode);
	    }
	};

	serviceT.init = function(receiveCallbackFunc) {
		
		onReceiveCallback = receiveCallbackFunc;

		// STEP 1. Requests the SAAgent specified in the Accessory Service Profile
		webapis.sa.requestSAAgent(requestOnSuccess, requestOnError);
		
		// STEP 1 -> Success
		function requestOnSuccess (agents) {
			var i = 0,
				lenAgents = agents.length;

		    for (i; i < lenAgents; i++) {
		        if (agents[i].role === "PROVIDER") {
					console.log(agents[i].name);
		            SAAgent = agents[i];
		            break;
		        }
		    }

		    // STEP 2. Set listener for upcoming connection from Consumer
		    SAAgent.setServiceConnectionListener(connectionListener);
		};

		// STEP 1 -> Failure
		function requestOnError (e) {
			console.log(e);
		};
		
	};

	serviceT.start = function() {
		
	};

	serviceT.stop = function() {

	};
	
	return serviceT;
	
})();