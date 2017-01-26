var MathVariable = (function () {
    var parent = null;
    var name = null;
    var sign = null;


    this.setSign = function (operator) {
        sign = operator;
    }
    this.getParent = function () {
        return parent;
    }
    this.setParent = function (newParent) {
        parent = newParent;
    }
    this.getName = function () {
        return name;
    }
    this.setName = function (newName) {
        name = newName;
    }
    this.calculate = function () {
        if (!name) {
            throw "Variable missing name!";
        }
        if (!window.variablesHash[name]) {
            throw "Variable " + "\"" + name + "\"" + " does not exists!";
        }

        if (sign == null) {
            return window.variablesHash[name].value;
        }
        else {
            var varVal = String(window.variablesHash[name].value);
            varVal = varVal.charAt(0);

            if ((sign == "+" || sign == "-") && (varVal == "+" || varVal == "-")) {
                if ((sign == "+" && varVal == "+") || (sign == "-" && varVal == "-")) {
                    varVal = String(window.variablesHash[name].value);
                    varVal = varVal.substr(1);
                    return "+".concat(varVal);
                }
                else if ((sign == "+" && varVal == "-") || (sign == "-" && varVal == "+")) {
                    varVal = String(window.variablesHash[name].value);
                    varVal = varVal.substr(1);
                    return "-".concat(varVal);
                }
            }
            else {
                return sign.concat(window.variablesHash[name].value);
            }
        }
    }
});
