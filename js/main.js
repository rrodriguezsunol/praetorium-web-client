/* global Handlebars */

jQuery(document).ready(function init() {
    "use strict";
    
    function fillTemplate(dataArray, jQuerySelector, templateId, templateWrappingName) {
        /*
        Note: we wrap the data array into an object with an attribute of the specified name
        to improve readability in the HTML template (otherwise we would need to use "this" 
        keyword in template).
        */
        var listWrapper = {};
        listWrapper[templateWrappingName] = dataArray;
        
        var htmlElement = jQuery(jQuerySelector);
        var templateScript = jQuery(templateId).html();
        var template = Handlebars.compile(templateScript);
        htmlElement.append(template(listWrapper));
    }

    jQuery.getJSON("rosters", function (rosters) {
        fillTemplate(rosters, "#rosters", "#rosters-template", "rosters");
    });
    
    // Events
    jQuery("#new-roster-button").click(function () {
    });
});