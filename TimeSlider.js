/**
 * This class implements a OpenLayers Time selector that is displayed as
 * a slider.
 */
OpenLayers.Control.TimeSlider = OpenLayers.Class(OpenLayers.Control, {

    availableTimes : [],

    visibleLayers : [],

    currentTime : null,

    /**
     * Method: setMap
     *
     * Properties:
     * map - {<OpenLayers.Map>}
     */
    setMap: function(map) {
        OpenLayers.Control.prototype.setMap.apply(this, arguments);

        this.map.events.on({
            "addlayer": this.layerChange,
            "removelayer": this.layerChange,
            "changelayer": this.layerChange,
            scope: this
        });

        this.layerChange();
    },

    layerChange : function () {

        this.visibleLayers = [];
        for( var i = 0; i < this.map.layers.length; i++ ){
            var layer = this.map.layers[i];
            if(layer.getVisibility()){
                this.visibleLayers.push(layer);
            }
        }

    },

    draw : function () {


    },

    redraw : function () {

        var container = this._outerDivContainer();
        container = jQuery(container);
        container.empty();

        var layers = this.map.layers;
        for( var i = 0; i < layers.length; i++){
            var html = this._layerSelectorHtml(layers[i]);
            container.append(html);
        }

    },

    _outerDivContainer : function () {

        if( this.div == null ){
            this.div = document.createElement("div");
        }

        return this.div;


    },

    _layerSelectorHtml : function (layer) {

        var html = '<div>';
        html += '<lable>' + layer.name + '</label>';
        html += '<ul>';

        if (layer.dimensions !== undefined && layer.dimensions.time !== undefined) {

            var times = layer.dimensions.time.values;

            for (var i = 0; i < times.length; i++) {
                html += '<li>' + times[i] + '</li>';
            }

        }

        html += '</ul></div>';

        return html;
    },

    mergeTime : function (times1, times2) {

        // clone the first, just to make the function a bit cleaner
        var merged = jQuery.extend({}, times1);

        for( var i = 0; i < times2.length; i++){
            if(jQuery.inArray(times2[i], merged)){
                merged.push(times2[i]);
            }
        }

        return merged;
    },

    CLASSNAME : "OpenLayers.Control.TimeSlider"
});