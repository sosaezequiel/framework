var Log = {
    currentLogLevel: 0,
    setLogLevel: function (level) {
        console.log('Nivel de bitacora tecnica cambio de valor a: %d, previo era: %d', level, this.currentLogLevel);
        this.currentLogLevel = level;
    },
    info: function (s) {
        if (this.currentLogLevel >= 1) this.print(arguments);
    },
    warning: function (s) {
        if (this.currentLogLevel >= 2) this.print(arguments);
    },
    error: function (s) {
        if (this.currentLogLevel >= 3) this.print(arguments);
    },
    debug: function (s) {
        if (this.currentLogLevel >= 4) this.print(arguments);
    },
    print: function (args) {
       
        var r = [];
        for (var i = 0; i < args.length; i++) {
            r.push(args[i]);
        }
        var s = r.shift();

        if (r.length > 0)
            console.log(s.format.apply(s, r));
        else
            console.log(s);
        
    }
};

console.log('Nivel de bitacora tenica es: %d', Log.currentLogLevel);
Log.setLogLevel(4);
