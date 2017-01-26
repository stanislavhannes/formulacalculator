var MathValue = (function () {
    var parent = null;
    var value = null;

    this.getParent = function () {
        return parent;
    }
    this.setParent = function (newParent) {
        parent = newParent;
    }
    this.getValue = function () {
        return value;
    }
    this.setValue = function (newValue) {
        value = newValue;
    }
    this.calculate = function () {
        if (!value) {

            throw "Missing value!";

        }
        return value;
    }
});
