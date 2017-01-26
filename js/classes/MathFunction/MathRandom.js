var MathRandom = (function () {
    var parent = null;

    this.getParent = function () {
        return parent;
    }
    this.setParent = function (newParent) {
        parent = newParent;
    }

    this.calculate = function () {
        return Math.random();
    }
});
