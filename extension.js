const St = imports.gi.St;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;

const Soup = imports.gi.Soup;
const Mainloop = imports.mainloop;
const Clutter = imports.gi.Clutter;
const Gio = imports.gi.Gio;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const GLib = imports.gi.GLib;


const NO_CONNECTION = 'Waiting for connection';
const MENU_POSITION = 'left';
const CONNECTION_REFUSED = 'Connection refused';

let _label, _icon;

class MpdbarIndicator extends PanelMenu.Button {

  constructor() {
    super(0.0, "MPDbar Indicator", false);
    let hbox = new St.BoxLayout({ style_class: 'mpdbar-panel' });

    // _icon = new St.Icon({
    //   gicon: null,
    //   style_class: 'system-status-icon'
    // });
    _icon = new St.Label({
      text: '',
      y_align: Clutter.ActorAlign.CENTER,
      style_class: 'fontawesome'
    });



    _label = new St.Label({
      text: '',
      y_align: Clutter.ActorAlign.CENTER
    });

    hbox.add_child(_icon);
    hbox.add_child(_label);


    this.actor.add_actor(hbox);

    Main.panel.addToStatusArea('mpdbar-indicator', this, 1, MENU_POSITION);

    this.paused = true;
    this.isSpotify = false;
    this.playIcon = ` `; //   PLAY;
    this.pauseIcon = ``; //   PAUSE;
    this.spotifyIcon = ``; //   SPOTIFY;



    this.destroy = () => {
      this.removeTimer();
      super.destroy();
    };

    this.update = () => {


      let now_playing_output = GLib.spawn_command_line_sync("playingnow current")[1].toString().replace("\n", "");
      // let now_playing_output = GLib.spawn_command_line_sync("/bin/bash /home/charles/.config/nowplaying/playingnow.sh")[1].toString().replace("\n", "");
      if (now_playing_output != '') {
        _label.text = now_playing_output;

        this.setIsSpotify();

        if (this.isSpotify) {
          _icon.text = this.spotifyIcon;
        } else {
          this.setPaused();
          _icon.text = (this.paused) ? this.pauseIcon : this.playIcon;
        }

      } else {
        _label.text = '';
        _icon.text = '';
      }




      // let mpc_output = GLib.spawn_command_line_sync("mpc current ")[1].toString().replace("\n", "");

      // if (mpc_output != '') {
      //   _label.text = mpc_output;
      //   _icon.text = (this.paused) ? `` : ` `;
      // } else {
      //   _label.text = '';
      //   _icon.text = '';
      // }


      //  _makeRequest();
      return true;
    }

    this.removeTimer = () => {
      if (this.timer) {
        Mainloop.source_remove(this.timer);
        this.timer = null;
      }
    }

    this.updateRefreshRate = () => {
      this.refreshRate = 3;
      this.removeTimer();
      this.timer = Mainloop.timeout_add_seconds(this.refreshRate, this.update.bind(this));
    }



    this.onClick = () => {

      this.togglePlayer();

      this.update();
    }

    this.setIsSpotify = () => {
      // let check_is_spotify = GLib.spawn_command_line_sync("cat /home/charles/.config/nowplaying/isspotify")[1].toString();
      let check_is_spotify = GLib.spawn_command_line_sync("playingnow isspotify")[1].toString();
      this.isSpotify = (check_is_spotify == '1' || check_is_spotify == 1);
    }

    this.setPaused = () => {
      let mpc_paused = GLib.spawn_command_line_sync("mpc")[1].toString();
      this.paused = (mpc_paused.indexOf('paused') > -1)
    }

    this.togglePlayer = () => {
      let toggle = GLib.spawn_command_line_sync("playingnow toggle");
      // let toggle = GLib.spawn_command_line_sync("mpc toggle");
      return toggle[0];
    }

    this.stopPlayer = () => {
      // let stopped = GLib.spawn_command_line_sync("mpc stop");
      let stopped = GLib.spawn_command_line_sync("playingnow stop");
      return stopped[0];
    }



    this.actor.connect('button-press-event', this.onClick.bind(this));

    this.update();
    this.updateRefreshRate();
  }


};

let _indicator;

const init = () => {/* Empty */ };

const enable = () => _indicator = new MpdbarIndicator;

const disable = () => _indicator.destroy();
