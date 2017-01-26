var MathAbs = (function () {
    var parent = null;
    var param = null;

    this.error = function (){
        throw "function abs only takes one parameter!";
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
            throw "function abs is missing a parameter!";
        }
        return Math.abs(param.calculate());
    }
});
