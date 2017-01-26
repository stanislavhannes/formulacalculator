var MathMin = (function () {
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
    }

    this.calculate = function () {

        if (!param) {
            throw "function min miss a parameter!";
        }

        for (var x = 0; x < param.length; x++) {
            if (param[x] == null) {
                throw "one parameter is empty!"
            }
            result[x] = param[x].calculate();
        }

        return Math.min.apply(null, result);
    }

});
