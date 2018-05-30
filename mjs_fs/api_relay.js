load('api_config.js');
load('api_string.js');
load('api_gpio.js');
load('api_rpc.js');

let Channels = {
    channels: [],
    add: function(name, pin) {
        this.channels[name] = {"name": name, "pin": pin};
        GPIO.set_mode(pin, GPIO.MODE_OUTPUT);
        print('Channel', name, "added on pin:", pin);
    },
    get: function(name) {
        return this.channels[name];
    },
    on: function(name) {
        GPIO.write(this.get(name).pin, Cfg.get('relay.config.stateOn'));
        print('Channel', name, 'set to ON');
    },
    off: function(name) {
        GPIO.write(this.get(name).pin, Cfg.get('relay.config.stateOff'));
        print('Channel', name, 'set to OFF');
    },
    getState: function(name) {
        return GPIO.read(this.get(name).pin) === Cfg.get('relay.config.stateOn') ? "ON" : "OFF";
    }
};

function init() {
    let enabledChannels = Cfg.get('relay.channels.enabled');
    if(enabledChannels === undefined) {
        print('Relay configuration is missing !');
    } else {
        let enabledChannelsArray = StringUtils.split(enabledChannels, ',');
        print('Enabled channels:', enabledChannelsArray);
        for(let idx = 0 ; idx < enabledChannelsArray.length ; idx++) {
            print("Initialiazing channel", idx);
            Channels.add(enabledChannelsArray[idx], Cfg.get('relay.channels.' + enabledChannelsArray[idx] + '.pin'));
            Channels.off(enabledChannelsArray[idx]);
            print("Channel", idx, "initialized");
        }
    }
}

function registerRPCs() {
    RPC.addHandler('Relay.on', function(args){Chanels.on(args.name); return {"result": "State changed to ON"}});
    RPC.addHandler('Relay.off', function(args){Chanels.off(args.name); return {"result": "State changed to OFF"}});
    RPC.addHandler('Relay.get', function(args){return Chanels.get(args.name)});
    RPC.addHandler('Relay.getState', function(args){return {"state": Chanels.getState(args.name)}});
}

print("Initializing relays...");
init();
print("Registering relays on RPC...");
registerRPCs();
print("Relay initialization done.");
