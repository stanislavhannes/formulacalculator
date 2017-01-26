var MathBracket = (function () {
    var child = null;
    var parent = null;


    this.getParent = function () {
        return parent;
    }
    this.setParent = function (newParent) {
        parent = newParent;
    }
    this.getChild = function () {
        return child;
    }
    this.setChild = function (newChild) {
        child = newChild;
    }
    this.calculate = function () {
        if (child) {
            return child.calculate();
        }
        else {

            throw "brackets missing a value!";
        }
    }
});
