var MathAtan2 = (function () {
    var parent = null;
    var param = [];
    var result = [];
    var paramCounter = 0;


    this.getParent = function () {
        return parent;
    }

    this.setParent = function (newParent) {
        parent = newParent;
    }

    this.getParam = function () {
        return param[paramCounter];
    }

    this.setParam = function (newParam) {
        param[paramCounter] = (newParam);
    }

    this.getParamCounter = function () {
        return paramCounter;
    }

    this.setParamCounter = function () {
        paramCounter++;
        if (paramCounter > 1) {
            throw "function atan2 only takes two parameter!";
        }
    }

    this.calculate = function () {

        if (param.length<2){
            throw "function atan2 needs two parameter!";
        }

        for (var x = 0; x < param.length; x++) {
            if (param[x] == null) {
                throw "the first parameter is empty!"
            }
            result[x] = param[x].calculate();
        }

        return Math.atan2.apply(null, result);
    }

});
