// TODO
// - request API key for OSM
// - add contributors : map icons, Fuse.js
// - use sprites for icons
// - icon is reloaded when making a layer visible again
// - layers control : add All on/off toggle ?
// - improve Fuse.js to consider accents ...


var setupIcons = function() {

    var icons = {};
    for (var cat in categories) {
        var icon = categories[cat].icon;
        var url = "images/" + icon;
 
        var icon = L.icon({
            iconUrl: url,
            iconSize: [32, 32],
            iconAnchor: [16, 37],
            popupAnchor: [0, -28]
        });
        icons[cat] = icon;
    }
    
    return icons;
};

var map;


  
    
    // Information pane
    L.control.infoPane('infopane', {position: 'bottomright'}).addTo(map);
    
    // Add fuse search control
    var options = {
        position: 'center',
        title: 'Chercher',
        placeholder: 'ex: rezÃ©, cinÃ©ma, biblio',
        maxResultLength: 15,
        threshold: 0.5,
        showInvisibleFeatures: true,
        showResultFct: function(feature, container) {
            props = feature.properties;
            var name = L.DomUtil.create('b', null, container);
            name.innerHTML = props.nom_comple;

            container.appendChild(L.DomUtil.create('br', null, container));

            var cat = props.libtype ? props.libtype : props.libcategor,
                info = '' + cat + ', ' + props.commune;
            container.appendChild(document.createTextNode(info));
        }
    };
    var fuseSearchCtrl = L.control.fuseSearch(options);
    map.addControl(fuseSearchCtrl);

    layerCtrl.addTo(map);

    var icons = setupIcons();

    // Load the data
    jQuery.getJSON("data/lieux_culture_nantes.json", function(data) {
        displayFeatures(data.features, layers, icons);
        var props = ['nom_comple', 'libcategor', 'commune'];
        fuseSearchCtrl.indexFeatures(data.features, props);
    });
    

function displayFeatures(features, layers, icons) {

    var popup = L.DomUtil.create('div', 'tiny-popup', map.getContainer());
                    
    for (var id in features) {
        var feat = features[id];
        var cat = feat.properties.categorie;
        var site = L.geoJson(feat, {
            pointToLayer: function(feature, latLng) {
                var icon = icons[cat];
                var marker = L.marker(latLng, {
                    icon: icon,
                    keyboard: false,
                    riseOnHover: true
                });
                if (! L.touch) {
                    marker.on('mouseover', function(e) {
                        var nom = e.target.feature.properties.nom_comple;
                        var pos = map.latLngToContainerPoint(e.latlng);
                        popup.innerHTML = nom;
                        L.DomUtil.setPosition(popup, pos);
                        L.DomUtil.addClass(popup, 'visible');

                    }).on('mouseout', function(e) {
                        L.DomUtil.removeClass(popup, 'visible');
                    });
                }
                return marker;
            },
            onEachFeature: bindPopup
        });
        var layer = layers[cat];
        if (layer !== undefined) {
            layer.addLayer(site);
        }
    }
    return layers;
}
 
function bindPopup(feature, layer) {
    // Keep track of the layer(marker)
    feature.layer = layer;
    
    var props = feature.properties;
    if (props) {
        var desc = '<span id="feature-popup">';
        desc += '<strong>' + props.nom_comple + '</strong><br/>';

        var cat = props.libtype ? props.libtype : props.libcategor;
        if (cat !== null) {
            desc += '<em>' + cat + '</em></br>';
        }
        
        var url = props.web;
        if (url !== null) {
            desc += '<a href="http://' + url + '" target=_blank>Site web</a></br>';
        }
         
        var address = '' + props.adresse + ' ' + props.code_posta + ' ' + props.commune;
        desc += address + '<br/>';

        if (props.telephone) {
            desc += 'Tel: ' + props.telephone + '<br/>';
        }
        
        desc += '</span>';
        layer.bindPopup(desc);
    }
}