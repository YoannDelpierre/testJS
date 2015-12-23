'use strict';

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 

  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

// our user
var user = {
  "latitude": 48.8280319,
  "longitude": 2.3289612
};

// object reference
var Reference = function(data) {
    // quick method, lots of better way
    this.city = data[0];
    this.surface = data[1];
    this.address = data[2];
    this.price = data[3];
    this.latitude = data[4];
    this.longitude = data[5];
};

// our api
var Api = function () {

  // function for processing csv
  function processData(references) {
    var items = [];

    // split references
    references = references.split('\n');
    references.shift().split(';');

    // remove first line ;)
    for(var i = 0; i < references.length; i ++) {
      items.push(new Reference(references[i].split(';')));
    }

    return items;
  }

  // xml http request
  var req = new XMLHttpRequest();
  req.open('GET', 'references.csv', false); 
  req.onreadystatechange = function() {
    if(req.readyState === 4) {
      // we split response for having it into array
      api.items = processData(req.responseText);
    }
  }

  // object api
  var api = {
    items: [],
    fetch: function() {
      req.send();
    }
  };

  return api;
};


(function () {
  var references = new Api();

  // we get datas
  references.fetch();

  // we log it first
  console.log('Display all items from csv');
  console.table(references.items);

  // now we sort our references by price
  // we clone our array
  var sortReferences = references.items.slice();

  sortReferences = sortReferences.sort(function(a, b) {
    return parseInt(a.surface, 10) < parseInt(b.surface, 10);
  })

  console.log('Display all items sort by surface desc');
  console.table(sortReferences);

  // now we filter our array, where price is upper to 650 000
  // we clone it
  
  var filterReferences = references.items.slice();
  filterReferences = filterReferences.filter(function(item) {
    return parseInt(item.price, 10) > 650000;
  })

  console.log('Display items filtered by price upper to 650000');
  console.table(filterReferences);

  // now we search our most nearest reference from our user object
  // first we caculate distance between item and use
  var nearestReferences = references.items.slice();
  nearestReferences.forEach(function(item) {
    item.distance = getDistanceFromLatLonInKm(item.latitude, item.longitude, user.latitude, user.longitude);
  });

  console.log('Display items with new key distance');
  console.table(nearestReferences);

  // now we sort and display our most nearest
  console.log('Display most nearest reference from our use');
  nearestReferences = nearestReferences.sort(function(a, b) {
    return a.distance > b.distance;
  }).shift();

  console.log('our most nearest reference is away from :', nearestReferences.distance + ' km to our user');
})();
