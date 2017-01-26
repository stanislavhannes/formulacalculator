var MathAddition = (function () {
    var parent = null;
    var leftChild = null;
    var rightChild = null;

    this.getParent = function () {
        return parent;
    }
    this.setParent = function (newParent) {
        parent = newParent;
    }
    this.getLeftChild = function () {
        return leftChild;
    }
    this.setLeftChild = function (newLeftChild) {
        leftChild = newLeftChild;
    }
    this.getRightChild = function () {
        return rightChild;
    }
    this.setRightChild = function (newRightChild) {
        rightChild = newRightChild;
    }
    this.calculate = function () {

        if (!leftChild) {

            throw "Missing left operator for addition!";

        }
        if (!rightChild) {

            throw "Missing right operator for addition!";

        }


        return parseFloat(leftChild.calculate()) + parseFloat(rightChild.calculate());
    }
});