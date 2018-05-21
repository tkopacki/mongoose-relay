load('api_config.js');
load('api_string.js');
load('api_gpio.js');
load('api_rpc.js');

let Chanels = {
    chanels: [],
    add: function(name, pin) {
        this.chanels[name] = {"name": name, "pin": pin};
        GPIO.set_mode(pin, GPIO.MODE_OUTPUT);
        print('Chanel', name, "added on pin:", pin);
    },
    get: function(name) {
        return this.chanels[name];
    },
    on: function(name) {
        GPIO.write(this.get(name).pin, Cfg.get('relay.config.stateOn'));
        print('Chanel', name, 'set to ON');
    },
    off: function(name) {
        GPIO.write(this.get(name).pin, Cfg.get('relay.config.stateOff'));
        print('Chanel', name, 'set to OFF');
    },
    getState: function(name) {
        return GPIO.read(this.get(name).pin);
    }
};

function init() {
    let enabledChanels = Cfg.get('relay.chanels.enabled');
    if(enabledChanels === undefined) {
        print('Relay configuration is missing !');
    } else {
        let enabledChanelsArray = StringUtils.split(enabledChanels, ',');
        for(let idx = 0 ; idx < enabledChanelsArray.length ; idx++) {
            Chanels.add(enabledChanelsArray[idx], Cfg.get('relay.chanels.' + enabledChanelsArray[idx] + '.pin'));
            Chanels.off(enabledChanelsArray[idx]);
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
