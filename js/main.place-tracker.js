/*
 * File: main.place-tracker.js
 * Project: js
 * File Created: Sunday, 1st July 2018 10:27:30 pm
 * Author: Sergei Papulin
 * -----
 * Last Modified: Wednesday, 4th July 2018 6:34:46 pm
 * Modified By: Sergei Papulin
 * -----
 * Copyright 2018 Sergei Papulin, Zighter
 */

var stroller = (function($, serviceT) {
    
    var mainTracker = {},
        watchId = null,
        strollPlaces = null,
        activeInfoPopup = false,
        watchActivation = false;

    mainTracker.init = function(data) {

        // =====================================
        // DATA INIT
        // =====================================
        // Stroll from the storage
        var initialData = storageTracker.getAllPlaces();

        if (initialData && initialData.length > 0) strollPlaces = new PlaceList(initialData);
        else strollPlaces = new PlaceList(data || []);

        console.log(strollPlaces);

        // Data for receiving a new stroll
        var newStroll = null;

        // Init SAP service
        serviceT.init(function(data) {
            
            console.log(data);
            
            newStroll = data;

            // Open the consent popup to accept/reject a new stroll
            tau.openPopup("load-popup-id");

            // Switch on the screen or launch the app if so
            if (tizen.power.isScreenOn() === false) {
                watchActivation = true;
                tizen.power.turnScreenOn();
            } else {
                activateApp();
            }

            //strollPlaces = new PlaceList(data.sights || []);
        });

        // =====================================
        // UI INIT
        // =====================================
        //initMainPage();

        // =====================================
        // EVENTS
        // =====================================
        // -------------------------------------
        // SYSTEM
        // -------------------------------------
        tizen.power.setScreenStateChangeListener(function(previousState, changedState) {

            console.log('Screen state changed from ' + previousState + ' to ' + changedState);

            if (watchActivation === true) {
                console.log('Screen PLACE');
                //navigator.vibrate([1000, 1000, 2000, 2000, 1000]);
                watchActivation = false;
                activateApp();
            }

        });
        // -------------------------------------
        // PAGES
        // -------------------------------------
        // Main Page
        var $title = $("#main").find(".ui-label-name-main"),
            marqueeWidget = null;

        $("#main").on("pagebeforeshow", function() {
            if (marqueeWidget == null) {
                $title.show();
                marqueeWidget = new tau.widget.Marquee($title[0], {iteration: "infinite", speed: 60, delay: 1000, marqueeStyle: "endToEnd"});
            }
            marqueeWidget.start();
        });
        $("#main").on("pagehide", function() {
            marqueeWidget.stop();
        });
        $(".ui-start-stroll-btn").click(function() {
            startGeoLocationWatcher();
            /*setTimeout(function() {
                strollPlaces.places[0].point = {lat: 55.70510978, lng: 37.668714931};
                console.log("Location is changed.");
            }, 30000);*/
        });
        

        // Stroll Page
        $("body").on("click", "#stroll .ui-place-item", function() {
            var placeId = $(this).data("id");
            renderInfoPopupContent(strollPlaces.getById(placeId));
            tau.openPopup("#place-info-popup-id");
        });
        $("body").on("click", "#stroll .ui-close-stroll-btn", function () {
            storageTracker.save(strollPlaces.places);
            stopGeoLocationWatcher();
        });

        // -------------------------------------
        // POPUPS
        // -------------------------------------
        // Info Popup
        $("body").on("click", "#btn-info-popup-back", function() {
            
            if(activeInfoPopup === true) {
                navigator.vibrate(0);
            }

            navigator.vibrate(0);
            console.log("InfoBackButton");
            activeInfoPopup = false;
        });
        $("body").on("click", "#btn-info-popup-seen", function() {
            var itemId = $(this).data("id");
                item = strollPlaces.getById(itemId);

            if(activeInfoPopup === true) {
                navigator.vibrate(0);
            }

            if (item.seenStatus === true) {
                $(this).find(".popup-info-seen-status-icon").removeClass("seen").addClass("unseen");
                $(this).find(".ui-seen-status-label").text("Unseen");
                item.seenStatus = false;
            }
            else {
                $(this).find(".popup-info-seen-status-icon").removeClass("unseen").addClass("seen");
                $(this).find(".ui-seen-status-label").text("Seen");
                item.seenStatus = true;
            }
            renderChangedSeenStatusContent(item);
            //activeInfoPopup = false;
            console.log("InfoSeenButton");
        });

        // Consent Popup
        $("#btn-load-popup-ok").click(function() {
            strollPlaces = new PlaceList(newStroll.sights || []);
        });
        $("#btn-load-popup-cancel").click(function() {
            newStroll = null;
        });
    };

    // Launch the hidden app
    function launchHiddenApp() {

        function onSuccess () {
            setTimeout(function() {
                navigator.vibrate([1000, 1000, 2000, 2000, 1000]);
            }, 1000);
            console.log("Launched App");
        }
            
        function onError () {
            console.log("Cannot Launch App");
        }

        var currApp = tizen.application.getAppInfo();
        var appId = currApp.id;
        tizen.application.launch(appId, onSuccess, onError);
    }

    function activateApp() {
        if (document.hidden === true) {
            launchHiddenApp();
        } else {
            navigator.vibrate([1000, 1000, 2000, 2000, 1000]);
        }
    }

    // Start the position watcher
    function startGeoLocationWatcher() {
		console.log("startGeoLocationWatcher");
	    if (navigator.geolocation) {
	    	
	    	var options = {
	    		timeout: 15000,
	    		maximumAge: 0,
	    		enableHighAccuracy: true,
	    	};
	    	
	        watchId = navigator.geolocation.watchPosition(onSuccessCallback, onErrorCallback, options);
	        
	        function onSuccessCallback(position) {
	        	
	        	console.log(position);
        
                var orderedList = strollPlaces.getListOrderedByDistance(position.coords);
                
                console.log(orderedList[0].distance);

                var activePlaces = strollPlaces.getActivePlaces(position.coords);

                console.log(activePlaces);

                if( activeInfoPopup === false && activePlaces.length > 0) {
                    
                    activeInfoPopup = true;
                    renderInfoPopupContent(strollPlaces.getById(activePlaces[0].id));
                    tau.openPopup("#place-info-popup-id");
                    
                    console.log((document.hidden) ? "app hidden" : "app visible");

                    if (tizen.power.isScreenOn() === false) {
                        watchActivation = true;
                        tizen.power.turnScreenOn();
                    } else {
                        activateApp();
                    }
                }

				// Render information on the watch screen
                renderPlaceListContent(orderedList);
                renderNextPlaceContent(orderedList[0]);
	        	
	        }
	        
	        function onErrorCallback(error) {

				console.log(error);

				var message = "An unknown error occurred.";

	        	switch (error.code) {
					case error.PERMISSION_DENIED:
						message = "User denied the request for Geolocation.";
						break;
					case error.POSITION_UNAVAILABLE:
						message = "Location information is unavailable.";
						break;
					case error.TIMEOUT:
						message = "The request to get user location timed out.";
						break;
					case error.UNKNOWN_ERROR:
						message = "An unknown error occurred.";
						break;
				}

				//renderInfoPopupText(message);
				//setStopStateTracker();
	        }
	        
	    } else {
            console.log("Geolocation is not supported.");
			//renderInfoPopupText("Geolocation is not supported.");
			//setStopStateTracker();
	    }
		
	}
	// Stop the position watcher
	function stopGeoLocationWatcher() {
        console.log("stopGeoLocationWatcher");
		navigator.geolocation.clearWatch(watchId);
		watchId = null;
	}


    // =====================================
    // UI RENDER
    // =====================================
    // -------------------------------------
    // PAGES
    // -------------------------------------
    // Main Page

    // Stroll Page
    function renderNextPlaceContent(place) {
        $(".ui-stroll-name").text(place.name);
        $(".ui-stroll-distance").text(place.distance + " m");
        $(".ui-next-place-content > .ui-place-item").data("id", place.id);
    }
    function renderPlaceListContent(places) {

        var htmlList = "",
            i = 0,
            lenPlaces = places.length;

        for(i; i < lenPlaces; i++) {

            htmlList += '<li class="li-has-multiline ui-place-item" data-id="' + places[i].id + '">' +
                            '<div class="list-name-container">' +
                                '<span class="view-icon seen-status-icon ' + ((places[i].seenStatus === true) ? "seen" : "unseen") +'"></span>' +
                                '<span class="name">' + places[i].name + '</span>' +
                            '</div>' +
                            '<span class="ui-li-sub-text li-text-sub">' + places[i].distance + ' m</span>' +
                        '</li>';
        }
        
        $(".ui-ordered-place-list").html(htmlList);

    }
    function renderChangedSeenStatusContent(place) {
        var $el = $(".ui-ordered-place-list").find(".ui-place-item[data-id=" + place.id + "]").find(".seen-status-icon");
        if (place.seenStatus === true) $el.removeClass("unseen").addClass("seen");
        else $el.removeClass("seen").addClass("unseen");
    }
    // -------------------------------------
    // POPUPS
    // -------------------------------------
    // Action Popup
        
    // Detail Popup
    function renderInfoPopupContent(place) {

        if(place.seenStatus === true) {
            $("#btn-info-popup-seen").find(".popup-info-seen-status-icon").removeClass("unseen").addClass("seen");
            $("#btn-info-popup-seen").find(".ui-seen-status-label").text("Seen");
        }
        else {
            $("#btn-info-popup-seen").find(".popup-info-seen-status-icon").removeClass("seen").addClass("unseen");
            $("#btn-info-popup-seen").find(".ui-seen-status-label").text("Unseen");
        }

        $("#btn-info-popup-seen").data("id", place.id);
        $(".ui-info-popup-name").text(place.name);
        $(".ui-info-popup-description").text(place.description);
    }

    // Consent Popup

    // General Info Popup
    function renderGeneralInfoPopupText(message) {
		$("#general-info-popup-id").find(".ui-popup-content").text(message);
		tau.openPopup("#general-info-popup-id");
		
	}

    return mainTracker;

})(jQuery, serviceT);