load('api_config.js');
load('api_string.js');
load('api_gpio.js');
load('api_rpc.js');

let Chanels = {
    chanels: [],
    add: function(args) {
        this.chanels[args.name] = args;
        GPIO.set_mode(args.pin, GPIO.MODE_OUTPUT);
        print('Chanel', args.name, "added on pin:", args.pin);
    },
    get: function(args) {
        return this.chanels[args.name];
    },
    on: function(args) {
        GPIO.write(this.get(args).pin, Cfg.get('relay.config.stateOn'));
        this.chanels[args.name].state = "ON";
        print('Chanel', args.name, 'set to ON');
    },
    off: function(args) {
        GPIO.write(this.get(args).pin, Cfg.get('relay.config.stateOff'));
        this.chanels[args.name].state = "OFF";
        print('Chanel', args.name, 'set to OFF');
    },
    getState: function(args) {
        return this.get(name).state;
    }
};

function init() {
    let enabledChanels = Cfg.get('relay.chanels.enabled');
    if(enabledChanels === undefined) {
        print('Relay configuration is missing !');
    } else {
        let enabledChanelsArray = StringUtils.split(enabledChanels, ',');
        for(let idx = 0 ; idx < enabledChanelsArray.length ; idx++) {
            Chanels.add({'name': enabledChanelsArray[idx], 'pin': Cfg.get('relay.chanels.' + enabledChanelsArray[idx] + '.pin')});
            Chanels.off({'name': enabledChanelsArray[idx]});
        }
    }
}

function registerRPCs() {
    RPC.addHandler('Relay.on', Chanels.on);
    RPC.addHandler('Relay.off', Chanels.off);
    RPC.addHandler('Relay.get', Chanels.get);
    RPC.addHandler('Relay.getState', Chanels.getState);
}

print("Initializing relays...");
init();
print("Registering relays on RPC...");
registerRPCs();
print("Relay initialization done.");
