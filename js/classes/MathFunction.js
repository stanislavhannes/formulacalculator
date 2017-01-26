var MathFunction = (function () {
    var child = null;

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
            return null;
        }
    }
});
