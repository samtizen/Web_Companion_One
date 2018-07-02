/*
 * File: storage.place-tracker.js
 * Project: js
 * File Created: Sunday, 1st July 2018 10:34:01 pm
 * Author: Sergei Papulin
 * -----
 * Last Modified: Sunday, 1st July 2018 10:34:23 pm
 * Modified By: Sergei Papulin
 * -----
 * Copyright 2018 Sergei Papulin, Zighter
 */

var storageTracker = (function() {

    var storageTracker = {};

    storageTracker.deleteAll = function() {
        localStorage.removeItem("places");
    }

    storageTracker.init = function(places) {
        localStorage.setItem("places", JSON.stringify(places));
    }

    storageTracker.save = function(places) {
        localStorage.setItem("places", JSON.stringify(places));
    }

    storageTracker.addPlace = function(place) {
        var places = localStorage.getItem("places");
        places = (places) ? JSON.parse(places) : [];
        places.push(place);
    };

    storageTracker.getPlace = function(placeId) {

        var items = localStorage.getItem("places");
        
        if (items) {
            items = JSON.parse(items);
            return _.find(items, function(item){ return item.id == placeId; });
        }

        return null;
    };

    storageTracker.updatePlace = function(place) {

        var items = localStorage.getItem("places");
        
        if (items) {
            items = JSON.parse(items);
            var indx = _.findIndex(items, { id: placeId });
            items[indx] = place;            
            localStorage.setItem("places", JSON.stringify(items));
        }
    };

    storageTracker.deletePlace = function(placeId) {
        
        var items = localStorage.getItem("places");

        if (items) {
            items = JSON.parse(items);
            var indx = _.findIndex(items, { id: placeId });
            items = _.filter(items, { id: placeId });
            localStorage.setItem("places", JSON.stringify(items));
        }
    };

    storageTracker.getAllPlaces = function() {
        var places = localStorage.getItem("places");
        return (places) ? JSON.parse(places) : [];
    };

    return storageTracker;

})();