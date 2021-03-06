ngapp.service('settingsService', function($rootScope) {
    let service = this,
        tabs = [{
            label: 'Core',
            templateUrl: 'partials/settings/core.html',
            controller: 'coreSettingsController',
            defaultGlobalSettings: { theme: 'day.css', syntaxTheme: '' }
        }];

    this.buildSettings = function(settings, global = false) {
        let defaults = {},
            defaultsPath = global ? 'defaultGlobalSettings' : 'defaultSettings';
        tabs.forEach(function(tab) {
            if (!tab[defaultsPath]) return;
            Object.deepAssign(defaults, tab[defaultsPath])
        });
        return Object.deepAssign(defaults, settings);
    };

    this.loadProfileSettings = function(profileName) {
        service.currentProfile = profileName;
        service.settingsPath = `profiles/${profileName}/settings.json`;
        let settings = fh.loadJsonFile(service.settingsPath) || {};
        service.settings = service.buildSettings(settings);
        service.saveProfileSettings();
    };

    this.loadGlobalSettings = function() {
        service.globalSettingsPath = `${fh.userPath}\\settings.json`;
        let settings = fh.loadJsonFile(service.globalSettingsPath) || {};
        service.globalSettings = service.buildSettings(settings, true);
        service.saveGlobalSettings();
    };

    this.saveProfileSettings = function() {
        fh.saveJsonFile(service.settingsPath, service.settings);
    };

    this.saveGlobalSettings = function() {
        fh.saveJsonFile(service.globalSettingsPath, service.globalSettings);
    };

    this.registerSettings = function(settingsTab) {
        tabs.push(settingsTab);
    };

    this.getTabs = function() {
        return tabs.filter(function(tab) {
            return !tab.appModes || tab.appModes.includes($rootScope.appMode);
        }).map(function(tab) {
            return {
                label: tab.label,
                templateUrl: tab.templateUrl,
                controller: tab.controller
            };
        });
    }
});
