/* global Handlebars */

jQuery(document).ready(function init() {
    "use strict";
    
    var dialogElement = jQuery("#new-roster-dialog");
    // It's important we initialize the jQuery-ui dialog before newRosterDialog object so #create-roster-button selector can be used.
    dialogElement.dialog({
        modal: true,
        width: 500,
        height: 300,
        autoOpen: false,
        buttons: [
            {
                id: "create-roster-button",
                text: "Create",
                click: function () {
                    newRosterDialog.close();
//                    jQuery("#new-roster-form").trigger("submit");
                    window.open("");
                }
            }
        ]
    });
    
    var newRosterDialog = {
        mainElement: dialogElement,
        form: jQuery("#new-roster-form"),
        createButton: jQuery("#create-roster-button"),
        gameSystemField: jQuery("#game-system"),
        raceField: jQuery("#race-field"),
        rosterNameField: jQuery("#roster-name-field"),
        footer: jQuery("#new-roster-footer"),
        setCreateRosterButtonEnabled: function (enabled) {
            // don't use attr() because the disabled attribute hasn't got "name=value"
            this.createButton.prop("disabled", !enabled);
            
            if (enabled) {
                this.createButton.addClass("ui-state-default");
                this.createButton.removeClass("ui-state-disabled");
            } else {
                this.createButton.addClass("ui-state-disabled");
                this.createButton.removeClass("ui-state-default");
            }
        },
        open: function () {
            this.dialogMethodHelper("open");
        },
        close: function () {
            this.dialogMethodHelper("close");
        },
        dialogMethodHelper: function (method) {
            this.mainElement.dialog(method);
        },
        reset: function () {
            this.hideFooter();
            this.setCreateRosterButtonEnabled(false);
            this.form.trigger("reset");
        },
        getGameSystemFieldValue: function () {
            return this.gameSystemField.val();
        },
        getRaceFieldValue: function () {
            return this.raceField.val();
        },
        hideFooter: function () {
            this.footer.hide();
        },
        showRaceErrorMessage: function (message) {
            jQuery("#race-error-message").text(message);
            this.footer.show();
        }
    };

    var dataListValidator = {
        availableElements: [],
        isValid: function (value) {
            return this.availableElements.indexOf(value) !== -1;
        }
    };
    
    var gameSystemValidator = Object.create(dataListValidator);
    
    var raceValidator = Object.create(dataListValidator);
    raceValidator.isPartialNameValid = function (partialRaceName) {
        return this.availableElements.filter(function (race) {
            return race.toLowerCase().startsWith(partialRaceName.toLowerCase());
        }).length > 0;
    };
    
    var template = {
        templateId: "",
        compiledTemplate: undefined
    };
    
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

    function enableCreateButtonListener() {
        var isRosterNameValid = newRosterDialog.rosterNameField.val().trim().length > 0;
        var isRaceValid = raceValidator.isValid(newRosterDialog.getRaceFieldValue());
        var isGameSystemValid = gameSystemValidator.isValid(newRosterDialog.getGameSystemFieldValue());
        
        // ToDo: validate rosterName against list of available roster names
        newRosterDialog.setCreateRosterButtonEnabled(isGameSystemValid && isRosterNameValid && isRaceValid);
    }
    
    jQuery.getJSON("rosters", function generateRosterList(rosters) {
        fillTemplate(rosters, "#rosters", "#rosters-template", "rosters");
    });
    
    jQuery.getJSON("races", function generateRacesOptions(races) {
        raceValidator.availableElements = races;
        fillTemplate(races, "#races", "#races-template", "races");
    });
    
    var availableGameSystems;
    jQuery.getJSON("game_systems", function generateGameSystemOptions(gameSystems) {
        availableGameSystems = gameSystems;
        gameSystemValidator.availableElements = gameSystems.map(function (currentGameSystem) {
            return currentGameSystem.name;
        });
        fillTemplate(gameSystems, "#game-systems", "#game-systems-template", "gameSystems");
    });
    
    // Events
    jQuery("#new-roster-button").click(function showNewRosterDialog() {
        newRosterDialog.reset();
        newRosterDialog.open();
    });

    var createButtonEnablers = [newRosterDialog.gameSystemField, newRosterDialog.raceField, newRosterDialog.rosterNameField];
    createButtonEnablers.forEach(function (createButtonEnabler) {
        createButtonEnabler.on("input", enableCreateButtonListener);
    });
    
    newRosterDialog.raceField.on("input", function raceNamePartialValidator() {
        var raceValue = newRosterDialog.getRaceFieldValue();
        var isPartialNameValid = raceValidator.isPartialNameValid(raceValue);
        
        if (isPartialNameValid) {
            newRosterDialog.hideFooter();
        } else {
            newRosterDialog.showRaceErrorMessage("No race found that starts with '" + raceValue + "'");
        }
    });
    
//    newRosterDialog.gameSystemField.on("input", function () {
//        availableGameSystems
//    });
});