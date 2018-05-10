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
    getPin: function(args) {
        return this.get(args.name).pin;
    },
    on: function(args) {
        GPIO.write(this.getPin(args.name), Cfg.get('relay.config.stateOn'));
        print('Chanel', args.name, 'set to ON');
    },
    off: function(args) {
        GPIO.write(this.getPin(args.name), Cfg.get('relay.config.stateOff'));
        print('Chanel', args.name, 'set to OFF');
    },
    getState: function(args) {
        return GPIO.read(this.getPin(args.name));
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
        }
    }
}

function registerRPCs() {
    RPC.addHandler('Relay.on', Chanels.on);
    RPC.addHandler('Relay.off', Chanels.off);
    RPC.addHandler('Relay.get', Chanels.getState);
}

print("Initializing relays...");
init();
print("Registering relay on RPC");
registerRPCs();
print("Relay initialization done.");
