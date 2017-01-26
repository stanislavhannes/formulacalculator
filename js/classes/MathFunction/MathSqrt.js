var MathSqrt = (function () {
    var parent = null;
    var param = null;

    this.error = function (){
        throw "function sqrt only takes one parameter!";
    }
    this.getParent = function () {
        return parent;
    }
    this.setParent = function (newParent) {
        parent = newParent;
    }
    this.getParam = function () {
        return param;
    }
    this.setParam = function (newParam) {
        param = newParam;
    }
    this.calculate = function () {
        if (!param) {
            throw "function sqrt is missing a parameter!";
        }
        return Math.sqrt(param.calculate());
    }
});
