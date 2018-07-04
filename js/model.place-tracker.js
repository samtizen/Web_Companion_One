/*
 * File: model.place-tracker.js
 * Project: js
 * File Created: Wednesday, 20th June 2018 4:17:54 pm
 * Author: Sergei Papulin
 * -----
 * Last Modified: Wednesday, 4th July 2018 9:38:23 pm
 * Modified By: Sergei Papulin
 * -----
 * Copyright 2018 Sergei Papulin, Zighter
 */

var Place = (function() {

    function Place(place) {
        
        place = place || {};

        for (var name in Place.defaults) {
            if (place.hasOwnProperty(name)) this[name] = place[name];
            else this[name] = Place.defaults[name]
        }
    }

    Place.defaults = {
        id: null,
        type: null,
        name: null,
        description: null,
        point: {
            lat: null,
            lng: null
        },
    };

    return Place;

})();

var TrackerPlace = (function() {

    function TrackerPlace(trackerPlace) {
        
        trackerPlace = trackerPlace || {};

        Place.call(this, trackerPlace);

        for (var name in TrackerPlace.defaults) {
            if (trackerPlace.hasOwnProperty(name)) this[name] = trackerPlace[name];
            else this[name] = TrackerPlace.defaults[name]
        }
    }

    TrackerPlace.prototype = Object.create(Place.prototype);
    TrackerPlace.prototype.constructor = TrackerPlace;

    TrackerPlace.defaults = {
        distance: null,
        seenStatus: false,
        wasActivated: false,
        timestamp: new Date()
    };

    return TrackerPlace;

})();

var PlaceList = (function() {

    function PlaceList(places) {

        if (places instanceof Array) {

            this.places = [];

            var i = 0,
                lenPlaces = places.length;

            for (i; i < lenPlaces; i++) {
                if (places[i] instanceof Object) this.places.push(new TrackerPlace(places[i]));
            }
        }
        else {
            this.places = [];
        }

    }

    PlaceList.prototype.getById = function(placeId) {
        return _.findWhere(this.places, {id: String(placeId)});
    };

    PlaceList.prototype.getListOrderedByDistance = function(currentPosition, useSeenOption) {
        this.sortedPlaces = _.map(this.places, function(place, indx, places) {
            var distance = geolib.getDistance(currentPosition, {latitude: place.point.lat, longitude: place.point.lng}); 
            return {"id": place.id, "name": place.name, "distance": distance, "seenStatus": place.seenStatus };
        });
        return _.sortBy(this.sortedPlaces, "distance");
    };

    PlaceList.prototype.getActivePlaces = function(currentPosition, useSeenOption) {
        return _.filter(this.sortedPlaces || [], function(place){ return (place.distance <= 30 && place.seenStatus === false); })
        //return _.filter(this.sortedPlaces || [], function(place){ return (place.seenStatus === false); })
    };

    PlaceList.prototype.length = function() {
        return this.places.length;
    };

    return PlaceList;
    
})();