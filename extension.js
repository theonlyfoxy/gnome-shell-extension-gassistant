const St = imports.gi.St;
const Main = imports.ui.main;
const Lang = imports.lang;
const Clutter = imports.gi.Clutter;
const PanelMenu = imports.ui.panelMenu;
const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;
const PopupMenu = imports.ui.popupMenu;
const Util = imports.misc.util;

const GoogleAssistantIndicator = new Lang.Class({
  Name: 'GoogleAssistantIndicator',
  Extends: PanelMenu.Button,

  _init: function() {
    this.parent(0.0, "Transfer Wise Indicator", false);
    this.buttonText = new St.Label({
      text: _("..."),
      y_align: Clutter.ActorAlign.CENTER
    });
    this.actor.add_actor(this.buttonText);
		let popupitem1 = new PopupMenu.PopupMenuItem("Say 'Ok Google' to activate");
		let popupitem2 = new PopupMenu.PopupMenuItem("Restart Google Assistant");
    let popupitem3 = new PopupMenu.PopupMenuItem("Kill Google Assistant");
		popupitem2.connect('activate', Lang.bind(this, this._run_assistant));
    popupitem3.connect('activate', Lang.bind(this, this._kill_assistant));
		this.menu.addMenuItem(popupitem1);
    this.menu.addMenuItem(popupitem2);
    this.menu.addMenuItem(popupitem3);
    this._run_assistant();
		let file = Gio.file_new_for_path("/tmp/assistant.msg");
  	this._monitor = file.monitor(Gio.FileMonitorEvent.CREATED, null);
  	this._monitor.connect('changed', Lang.bind(this, this._refresh));
	},
	_refresh: function() {
	  let txt = String(GLib.file_get_contents("/tmp/assistant.msg")[1]);
	  global.log("Assistant Status: "+txt);
	  this.buttonText.set_text(txt);
	},
  _execute_assistant: function(signal) {
    Util.spawn(["python3", ".local/share/gnome-shell/extensions/GAssistant@samuelmathieson.net/google-assistant.py", signal]);
  },
	_run_assistant: function() {
    this._execute_assistant("run");
	},
  _kill_assistant: function() {
    this._execute_assistant("kill");
	},
  stop: function() {
    this._kill_assistant();
    this.menu.removeAll();
  }
});

let gaMenu;

function init() {
}

function enable() {
	gaMenu = new GoogleAssistantIndicator;
	Main.panel.addToStatusArea('ga-indicator', gaMenu);
}

function disable() {
	gaMenu.stop();
  gaMenu.destroy();
}
