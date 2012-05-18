/**
 * This class implements a OpenLayers Time selector that is displayed as
 * a slider.
 */
OpenLayers.Control.TimeSlider = OpenLayers.Class(OpenLayers.Control, {

    availableTimes : {},

    // secondary attribute updated automatically from availableTimes
    sortedTimes : [],

    visibleLayers : [],

    currentTime : null,

    slider : null,

    //ids for html elements used by the slider
    sliderId : 'timeslider-slider',
    nextButtonId : 'timeslider-next',
    previousButtonId : 'timeslider-previous',
    sliderCurrentId : 'timeslider-current',

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

        console.log("layerChange()");
        this.visibleLayers = [];
        for( var i = 0; i < this.map.layers.length; i++ ){
            var layer = this.map.layers[i];
            if(layer.getVisibility()){
                this.visibleLayers.push(layer);
            }
        }

        this.updateAvailableTimes();
        this.redraw();

    },

    updateAvailableTimes : function () {

        var newTimes = {};
        for( var i = 0; i < this.visibleLayers.length; i++ ){

            var layerTimes = this.timesForLayer(this.visibleLayers[i]);
            for( var j = 0; j < layerTimes.length; j++ ){
                var time = jQuery.trim(layerTimes[j]);

                if( time in newTimes ){
                    newTimes[time] = newTimes[time] + 1;
                } else {
                    newTimes[time] = 1;
                }
            }
        }

        this.availableTimes = newTimes;
        this.sortedTimes = this.sortTimes(this.availableTimes);
    },

    /**
     * Returned the array of times for a layer
     */
    timesForLayer : function (layer) {

        var times = [];
        if (layer.dimensions !== undefined && layer.dimensions.time !== undefined) {
            times = layer.dimensions.time.values;
        }
        return times;
    },

    redraw : function () {

        var container = this._outerDivContainer();
        container = jQuery(container);
        container.empty();

        if(this.sortedTimes.length > 0){
            var html = this.timesliderHtml();
            container.append(html);

            var outerThis = this;
            this.slider = jQuery('#' + this.sliderId).slider({
                min: 0,
                max : this.sortedTimes.length - 1,
                change : function (event, slider) { outerThis.timesliderValueChange(event, slider); }
            }
            );

            jQuery('#' + this.previousButtonId ).on('click', function () { outerThis.timesliderPrevious(); } );
            jQuery('#' + this.nextButtonId).on('click', function () { outerThis.timesliderNext(); } );

        }


    },

    timesliderNext : function () {
        var val = this.slider.slider("value");
        if( val < this.sortedTimes.length - 1 ){
            this.slider.slider("value", val + 1);
        } else {
            this.slider.slider("value", 0);
        }
    },

    timesliderPrevious : function () {
        var val = this.slider.slider("value");
        if( val > 0 ){
            this.slider.slider("value", val - 1);
        } else {
            this.slider.slider("value", this.sortedTimes.length - 1);
        }
    },

    timesliderValueChange : function (event, slider) {

        var value = this.sortedTimes[slider.value];
        jQuery('#' + this.sliderCurrentId).val(value);

    },

    _outerDivContainer : function () {

        if( this.div == null ){
            this.div = document.createElement("div");
        }

        return this.div;

    },

    timesliderHtml : function () {
        var html = '<div id="' + this.sliderId + '">';
        html += '</div>';
        html += '<button id="' + this.previousButtonId + '">Previous</button>';
        html += '<input type="text" id="' + this.sliderCurrentId + '" />';
        html += '<button id="' + this.nextButtonId + '">Next</button>';
        return html;
    },


    /**
     * Sort a dictionary/hash of times as stored in the availableTime
     */
    sortTimes : function ( availableTimes ) {

        var times = [];
        for( var time in availableTimes){
            times.push(time);
        }

        times.sort();
        return times;
    },

    mergeTime : function (times1, times2) {

        // clone the first, just to make the function a bit cleaner
        var merged = jQuery.extend([], times1);

        for( var i = 0; i < times2.length; i++){
            if(-1 == jQuery.inArray(times2[i], merged)){
                merged.push(times2[i]);
            }
        }

        return merged;
    },

    CLASSNAME : "OpenLayers.Control.TimeSlider"
});