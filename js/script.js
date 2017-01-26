
var TOK_STROKE = 1, TOK_DOT = 2, TOK_NUMBER = 3, TOK_EOF = 4, TOK_BRACKET = 5, TOK_FUNC = 6, TOK_VAR = 7, TOK_COMMA = 8;
var formula;
var pos;
var root, current;
var rootArray, currentArray;
var variablesArray, variablesHash;
//Globale Variablen

$(document).ready(function () {     //führt aus sobald alles geladen ist
    $('#inputField').keypress(function (event) {    //wenn Entertaste gedrückt wird...
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            $("#btn_calc").click();   //...wird eine Klick Funktion auf btn_calc ausgeführt -> btn_calc = Button zum berechnen
        }
    });

    $("#btn_calc").click(function () {  //wenn btn_calc gedrückt wird...
        $("#alert_overlay, .alert_container").hide();       //...versteckt er die Container für die Fehlerausgabe
        readToken();            //führt Funktion readToken aus, die die Berechnung startet
    });

   $("#functions").popover({       //Pop-up Menü für die Erklärung der Funktionen
        title : '<div style="text-align:center">How to use functions</div>',
        trigger: 'hover',
        content:
            function(ele) { return $('#functions-content').html(); }
    });

    $("#variables").popover({       //Pop-up Menü für die Bedienung der Variablen
        title : '<div style="text-align:center">How to define variables</div>',
        trigger:'hover',
        content :
            function(ele) { return $('#variables-content').html(); }
    });

});

function htmlEntities(str) {    //Funktion zum konventieren der Zeichen &,<,>," in HTML
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function Output(result) {       //Funktion zur Ausgabe mit result als Übergabeparameter für das Ergebnis
    var h, text ;

    if (variablesArray) {       //wenn Variablen erkannt wurden
        if (!formula) {     //wenn fomula leer ist, kriegt es den Wert aus dem Eingabefeld
            formula = $('#inputField').val();
            htmlEntities(formula);
        }
        var VarString = "", variable;

        for (variable in variablesHash) {
            if (variablesHash[variable].value!=null){ // wenn der Wert der Variable im assoziativen Array nicht leer ist....
                VarString += " " + variable + " = " + variablesHash[variable].value;  //...füge die Werte der einzelnen Variablen hinten an die Ausgabe dran
            }
        }
        text = $("<p>" + formula + " = " + result + "   [" + VarString + " ]" + "</p>");  //Fertige zusammensetzung der Ausgabe
    }
    else {
        text = $("<p>" + formula + " = " + result + "</p>");
    }

    h = text.getHiddenDimensions();
    text.css({
        height:h,
        opacity:0
    });

    $('#output').append(text);

    text.animate({   //Animation zum einblenden
        height:h,
        opacity:1
    });

    $('#root').scrollTop($("#root")[0].scrollHeight);  //Funktion, damit die Scrolbar immer unten bleibt

}

function Token(input) {  // Scanner Funktion mit input als Übergabeparameter
    var tok={};     //Objekt tok wird erstellt
    var numbers = /^[-+]?\d+\.?\d*$/, letters = /^[a-zA-Z]+$/;  //numbers und letters zum filtern von zahlen und buchstaben werden erstellt

    if (input.length == 0) {        //wenn kein input vorhanden ist wird ein Fehler geschmissen
        throw "Input needed!";
    }

    while (pos < input.length - 1) {   // solange pos kleiner als die länge des Array ist
        pos++;  // pos wird inkrementiert

        if ((input[pos] == "+" || input[pos] == "-") && (input[pos + 1] == "+" || input[pos + 1] == "-")) {  //Funktion zum zusammenfassen der Vorzeichen
            if ((input[pos] == "+" && input[pos + 1] == "+") || (input[pos] == "-" && input[pos + 1] == "-")) {
                input.splice(pos, 2, "+");  //schneidet von pos aus 2 kommenden Arrays aus und ersetzt diese durch ein +
                pos--;                      //pos wird dekrementiert
            }
            else if ((input[pos] == "+" && input[pos + 1] == "-") || (input[pos] == "-" && input[pos + 1] == "+")) {
                input.splice(pos, 2, "-");  //''
                pos--;                      //''
            }
        }

        else {

            if (input[pos] == ";") {
                input.splice(pos, 1);  // semikolon wird aus dem Array entfernt
                formula = input.splice(0, pos);  //alle Einträge bis zum Semikolon werden in formula gespeichert
                formula = formula.join("");     //formula wird in ein string konventiert
                if(variablesArray){
                   variablesScanner(input.concat());        //Der Funktion variablesScanner wird die Eingabe nach dem Semikolon  übermittelt
                }
                pos = input.length;     //pos = länge vom Array
            }

            else {

                if (input[pos - 1] == ")" && (input[pos] == "(" || (input[pos] != ")" && input[pos] != "+" && input[pos] != "-" && input[pos] != "*" && input[pos] != "/" && input[pos]!="," && input[pos] != undefined))) {  //Abfrage zum automatischen setzen des Vorzeichen
                    if (isNaN(input[pos])){       //wenn keine Zahl sondern Buchstabe
                        throw "Separate variables and functions with an operator!";  //...dann werfe fehler
                    }
                    fDot(new MathMultiplikation);   //Funktion zum setzen des Multiplikators
                }

                if (/^[-+]?\d+\.?/.test(input[pos])) {  // wenn es eine Zahl mit einem Vorzeichen oder Punkten ist

                    if ((letters.test(input[pos - 1]) && input[pos - 1]!=undefined) || (letters.test(input[pos + 1]) && input[pos + 1]!=undefined)){  //wenn pos + 1 im Array ein Buchstabe kommt ...
                        throw "Variable must begin with a letter!";   //..werfe fehler
                    }
                    else if ((!isNaN(input[pos])) && (!isNaN(input[pos + 1]) || input[pos + 1] == "." )) {      //wenn  pos + 1 im Array eine Zahl oder Punkt kommt...
                        input.splice(pos, 2, input[pos] + input[pos + 1]);   //... füge zusammen
                        pos--;
                    }
                    else if (!isNaN(input[pos])) {
                        tok.type = TOK_NUMBER;          //fügt tok die Eigenschaft type hinzu und setzt den Wert von TOK_NUMBER
                        tok.value = input[pos];         // fügt tok die Eigenschaft value hinzu und setzt den Wert des input Array an der Position pos
                        return tok;                     // gibt den Aktuellen tok zurück
                    }
                    else {
                        throw "Invalid number!"
                    }
                }

                else if (input[pos] == "+" || input[pos] == "-") {   //wenn aktuelles Zeichen ein + oder - ist

                    if (((input[pos - 1] == "(" || input[pos - 1] == "*" || input[pos - 1] == "/" || input[pos - 1] == ",") || input[pos - 1] == undefined) && (numbers.test(input[pos + 1]) && input[pos + 1]!=undefined)) {  //Abfrage zum setzen eines Vorzeichen, wenn true...
                        input.splice(pos, 2, input[pos] + input[pos + 1]); //... dann füge Vorzeichen (pos) und Zahl (pos+1) zusammen
                        pos--;
                    }
                    else if (((input[pos - 1] == "(" || input[pos - 1] == "*" || input[pos - 1] == "/" || input[pos - 1] == ",") || input[pos - 1] == undefined) && (letters.test(input[pos + 1]) && input[pos + 1]!=undefined)) { //Abfrage zum setzen eines Vorzeichen einer Variable, wenn true...
                        tok.sign = true;            //...dann füge tok die Eigenschaft sign hinzu mit dem Wert true
                        tok.signValue = input[pos]; //fügt tok die Eigenschaft signValue mit dem Wert des Vorzeichen
                    }
                    else {
                        tok.op = input[pos];  // fügt tok die Eigenschaft op mit dem Wert des Vorzeichen hinzu
                        tok.type = TOK_STROKE; // fügt tok die Eigenschaft type mit dem Wert vom TOK_STROKE hinzu
                        return tok;             //gibt tok Objekt zurück
                    }
                }

                else if (input[pos] == "/" || input[pos] == "*") {   // wenn aktuelles Zeichen / oder * ...
                    tok.op = input[pos]; //...dann füge tok die Eigenschaft op mit dem Wert des Vorzeichen hinzu
                    tok.type = TOK_DOT;  // fügt tok die Eigenschaft type mit dem Wert vom TOK_DOT hinzu
                    return tok;         //gibt tok mit dem Operator zurück
                }

                else if (input[pos] == ",") { //wenn aktuelles Zeichen Komma...
                    tok.type = TOK_COMMA;
                    return tok;   //...dann gebe tok mit dem Wert TOK_COMMA in der Eigenschaft type zurück
                }

                else if (/\w/.test(input[pos])) {        //todo:umlaute zulassen    //wenn aktuelles Zeichen ein Word -> Zahlen mit Buchstaben

                    if (/\w/.test(input[pos + 1]) && input[pos + 1] != undefined) { // wenn als nächstes Zeichen im Array auch eine Zahl oder Buchstabe vorkommt...
                        input.splice(pos, 2, input[pos] + input[pos + 1]);  //...dan füge diese zusammen
                        pos--;
                    }

                    else if (input[pos + 1] == "(") {       // wenn als nächstes Zeichen ein ( kommt...
                        tok.type = TOK_FUNC;
                        tok.func = input[pos];    //...dann ist es eine Funktion und der name des Funktion wird in tok gespeichert
                        pos++;                  //pos inkrementiert
                        return tok;             //tok zurück geben
                    }

                    else {
                        tok.type = TOK_VAR;   // ansonsten ist es eine Variable
                        tok.value = input[pos];
                        return tok;    //tok zurück geben
                    }

                }

                else if (input[pos] == "(" || input[pos] == ")") {  //wenn aktuelles Zeichen ein ( oder )
                    if (input[pos] == "(" && (input[pos - 1] != ")" && input[pos - 1] != "(" && input[pos - 1] != "+" && input[pos - 1] != "-" && input[pos - 1] != "*" && input[pos - 1] != "/" && input[pos - 1]!="," && input[pos - 1] != undefined)) {  //Abfrage zum setzten des Muliplikator, falls kein Vorzeichen vorhanden
                        fDot(new MathMultiplikation);  //Funktion zum setzen des Multiplikators
                    }
                    tok.op = input[pos];
                    tok.type = TOK_BRACKET;
                    return tok;  //gibt tok mit dem Wert eine Klammer zurück
                }
                else throw "Ivalid input!";   // wenn kein Zeichen erkannt wurde, wird ein Fehler geschmissen

            }

        }
    }

    tok.type = TOK_EOF;  //setze  tok als TOK_EOF
    if (!formula) {   // wenn bisher noch nichts in formula steht, dann...
        formula = input.join(""); //...wandle den aktuellen input wieder als String um
    }
    return tok;   //gibt tok mit TOK_EOF als type wieder zurück
}

function readToken() {      //Interpreter Funktion
    try {       //try um die throw Befehle einzufangen
        pos = -1;       //Position des Scanners wird auf -1 gesetzt
        root = new MathFunction();      // Erstellen des Wurzelobjekts auf root;
        current = root;         //current zeigt auf root
        rootArray = [];         //Neues Array zum speichern von root, falls Klammern oder Funktionen vorkommen wird erstellt
        currentArray = [];      //Neues Array zum speichern von current, falls Klammern oder Funktionen vorkommen wird erstellt
        variablesArray = null;  //Array zum speichern der Variablennamen die der Scanner vor dem Semikolon findet
        variablesHash = {};     //Assoziatives Array bzw. Objekt zum speichern des Variablenamen, den minimalen und maximalen Wert und des aktuellen Wertes
        formula = null;         //Variable zum speichern des Strings mit der Eingabe des Users wird auf null gestzt

        var input = $('#inputField').val();     //holt sich die Eingabe und speichert diese in die Variable input ab
        input = input.replace(/\s/g, "");   // alle leerzeichen werden daraus gefiltert
        input = input.split("");        //Eingabe wird in ein Array umgewandelt
        var openBrck = 0, closeBrck = 0; //Variablen zum mitzählen der Klammern werden erstellt und auf 0 gesetzt;
        var value, token = Token(input); // Variable value und token wird erstellt. Token kriegt den wert den die Funktion Token zurück gibt


        while (token.type != TOK_EOF) {   //wird ausgeführt solange tok.type nicht den Wert TOK_EOF hat, also nicht am Ende der Eingabe ist

            if (token.type == TOK_BRACKET) {    //wenn token.type eine Klammer ist
                if (token.op == "(") {
                    openBrck++;
                    fFunc(new MathBracket());  //übergibt der Funktion ein Objekt der Klammeklasse
                }

                else if (token.op == ")") {
                    openBrck--;
                    current = currentArray.pop();   //holt sich aus dem Array den letzten Eintrag und gibt es current
                    root = rootArray.pop();         // root kriegt letzten Wert aus Array
                }
            }

            else if (token.type == TOK_FUNC) {   // wenn token eine Funktion ist

                openBrck++;

                switch (token.func) {   //switch case lösung zum Ermitteln der einzelnen Funktionen

                    case "abs":
                        fFunc(new MathAbs());
                        break;

                    case "acos":
                        fFunc(new MathAcos());
                        break;

                    case "atan":
                        fFunc(new MathAtan());
                        break;

                    case "atan2":
                        fFunc(new MathAtan2());
                        break;

                    case "ceil":
                        fFunc(new MathCeil());
                        break;

                    case "cos":
                        fFunc(new MathCos());
                        break;

                    case "exp":
                        fFunc(new MathExp());
                        break;

                    case "log":
                        fFunc(new MathLog());
                        break;

                    case "round":
                        fFunc(new MathRound());
                        break;

                    case "sin":
                        fFunc(new MathSin());
                        break;

                    case "sqrt":
                        fFunc(new MathSqrt());
                        break;

                    case "tan":
                        fFunc(new MathTan());
                        break;

                    case "min":
                        fFunc(new MathMin());
                        break;

                    case "max":
                        fFunc(new MathMax());
                        break;

                    case "pow":
                        fFunc(new MathPow());
                        break;

                    case "floor":
                        fFunc(new MathFloor());
                        break;

                    case "random":
                        fFunc(new MathRandom());
                        break;

                    default:
                        throw "Function " + "\"<strong>" + token.func + "</strong>\"" + "is not defined!" + '</br>' + "if " + "\"<strong>" + token.func + "</strong>\"" + " is a variable -> Seperate it with an operator!";  //Falls keine Funktion zutrifft wird ein Fehler geworfen
                }


            }

            else if (token.type == TOK_COMMA) {   //wenn token ein Komma ist
                if ("setParamCounter" in root) {   //wenn die Eigenschaft set ParamCounter in root vorkommt, dann ist der Komma richtig gesetzt und die Funktion braucht mehrere Parameter
                    current = root;  //current bekommt die selbe Position wie root
                    root.setParamCounter();   //die Funktion zum inkrementieren der Variable zum zählen der Parameter wird gestartet
                }
                else if ("setParam" in root) {
                    root.error();                   //falls die Funktion nur setParam haben sollte, dann ist das Komma falsch gesetzt und eine Funktion zur Fehlermeldung wird gestartet
                }
                else throw "Comma misplaced!";  // Ansonsten ist das Komma falsch positioniert und es wird ein Fehler geworfen
            }

            else if (token.type == TOK_NUMBER) {  // wenn token eine Zahl ist
                value = new MathValue();  // erstelle auf value ein neues Zahlenobjekt
                value.setValue(token.value);  // dieses kriegt den vorher vom Scanner übermittelten Wert
                fValue(value);   // Funktion zum setzen des des Objekt wird gestartet
            }

            else if (token.type == TOK_VAR) {  //wenn token eine Variable ist
                value = new MathVariable();  //erstelle ein neues Variablenobjekt
                value.setName(token.value);  //übergibt den Namen der Variable an das Objekt
                if ("sign" in token) {     //wenn Vorzeichen gesetzt...
                    value.setSign(token.signValue);  //...führe Methode zum setzen des Vorzeichen aus
                }
                fValue(value);  //führt Funktion zum setzen des Variablenobjekts aus

                if (!variablesArray) {   //wenn keine Werte im Array
                    variablesArray = [];  //erstelle ein Array
                    variablesArray.push(token.value);  //und füge die Variable hinzu
                }
                else
                    variablesArray.push(token.value);  //ansonsten füge einfach Variable hinten dran
            }

            else if (token.type == TOK_STROKE) {  //wenn token Strichoperator
                if (token.op == "+") {
                    fStroke(new MathAddition);   //führe Funktion mit neuen Additionsobjekt aus
                }

                else if (token.op == "-") {
                    fStroke(new MathSubtraktion); //führe Funktion mit neuen Subtraktionsobjekt aus
                }
            }

            else if (token.type == TOK_DOT) {
                if (token.op == "*") {
                    fDot(new MathMultiplikation)  //führe Funktion mit neuen Multiplikationsobjekt aus
                }

                else if (token.op == "/") {
                    fDot(new MathDivision);  //führe Funktion mit neuen Divisionsobjekt aus
                }
            }
            token = Token(input);   //holt sich neues Zeichen durch den Scanner
        }

        if (openBrck != closeBrck) {  //falls Klammer ungleich gesetzt sind ...
            if (openBrck < closeBrck) {//...werfe fehler
                throw "An open bracket is missing!";
            }
            else throw "A close bracket is missing!";
        }

        if (variablesArray) {  //wenn Variablen erkannt wurden
            for (var a = 0; a < variablesArray.length; a++) {
                if (variablesArray[a] in variablesHash) {  //wenn eine Variable im assoziativen Array gefunden wird, dann wird nichts unternehmen
                }
                else throw "Variable " + "\"<strong>" + variablesArray[a] + "</strong>\"" + " is not defined!"; //...ansonsten werfe Fehler
            }

            variablesRecursion(variablesArray);   //starte Funktion zum Berechnen der Variablenwerte
        }
        else
            Output(root.calculate());  //Berechnet Baum und übergibt Ergebnis der Ausgabefunktion
    }
    catch (e) {             //verarbeitet die throw Befehle aus dem try Block und gibt sie in einem Pop-up Fenster aus
        var button ='<button type="button" class="close">&times</button>';
        var text = '<h4>Error!</h4>' + e;
        $('.alert')
                    .html(text)
                    .prepend(button);

        $("#alert_overlay, .alert_container").show();

        $(".close").click(function(){
            $("#alert_overlay, .alert_container").hide();

        });
    }

}

function fValue(value) {   //Funktion zum setzen von Variablen- und Zahlenobjekte in den Termbaum
    if ("setParent" in value) {  //wenn Methode "setParent" im Aktuellen Objekt value, dann führe setParent darin aus mit current als Übergabewert
        value.setParent(current);
    }

    if ("setChild" in current) {
        current.setChild(value);
    }

    else if ("setParam" in current) {
        current.setParam(value);
    }

    else if ("setRightChild" in current) {
        current.setRightChild(value);
    }
}

function fFunc(newNode) {  //Funktion zum setzen von Funktion- und Klammerobjekten im Termbaum
    rootArray.push(root);
    currentArray.push(current);

    if ("setParent" in newNode) {
        newNode.setParent(current);
    }

    if ("setChild" in current) {
        current.setChild(newNode);
    }
    else if ("setParam" in current) {
        current.setParam(newNode);
    }
    else if ("setRightChild" in current) {
        current.setRightChild(newNode);
    }

    root = newNode;
    current = root;
}

function fStroke(newNode) { //Funktion zum setzen von Addition- und Subtraktionobjekten im Termbaum
    if ("getChild" in root) {
        if (root.getChild() != null) {
            newNode.setParent(current);
        }
    }

    if ("setChild" in root) {
        newNode.setLeftChild(root.getChild());
        if (root.getChild() != null) {
            root.getChild().setParent(newNode);
        }
        root.setChild(newNode);
    }

    else if ("setParam" in root) {
        newNode.setLeftChild(root.getParam());
        if (root.getParam() != null) {
            root.getParam().setParent(newNode);
        }
        root.setParam(newNode);
    }

    current = newNode;
}

function fDot(newNode) { //Funktion zum setzen von Multiplikation- und Divisionobjekten im Termbaum
    if ("getChild" in current) {
        if (current.getChild() != null) {
            newNode.setParent(current);
        }
    }

    if ("setChild" in current) {
        newNode.setLeftChild(current.getChild());
        if (current.getChild() != null) {
            current.getChild().setParent(newNode);
        }
        current.setChild(newNode);
    }

    else if ("setParam" in current) {
        newNode.setLeftChild(current.getParam());
        if (current.getParam() != null) {
            current.getParam().setParent(newNode);
        }
        current.setParam(newNode);
    }

    else if ("setRightChild" in current) {
        newNode.setLeftChild(current.getRightChild());
        if (current.getRightChild() != null) {
            current.getRightChild().setParent(newNode);
        }
        current.setRightChild(newNode);
    }

    current = newNode;
}

function variablesRecursion(variablesName) {        //Funktion zum Berechnen der möglichkeiten mit den Variablenwerte
    var name = variablesName.shift(), variablesNameClone;
    var min = variablesHash[name].min;
    var max = variablesHash[name].max;

    for (var val = min; val <= max; val++) {
        variablesHash[name].value = val;
        if (variablesName.length) {
            variablesNameClone = variablesName.concat();
            variablesRecursion(variablesNameClone);
        }
        else {
            Output(root.calculate());
        }
    }
}

function variablesScanner(input) {          //Funktion zum ermitteln der Variablengrenzen

    for (var a = 0; a < input.length; a++) {        //Schleife mit Abfragen zum zusamenfassen der Vorzeichen und zum zusammenfassen aller Zeichen mit Ausnahme der Zeichen <,>,; und =

        if ((input[a] == "+" || input[a] == "-") && (input[a + 1] == "+" || input[a + 1] == "-")) {
            if ((input[a] == "+" && input[a + 1] == "+") || (input[a] == "-" && input[a + 1] == "-")) {
                input.splice(a, 2, "+");
                a--;
            }
            else if ((input[a] == "+" && input[a + 1] == "-") || (input[a] == "-" && input[a + 1] == "+")) {
                input.splice(a, 2, "-");
                a--;
            }
        }

        else if ((input[a] != "<" && input[a] != ">" && input[a] != "=" && input[a] != ";") && (input[a + 1] != "<" && input[a + 1] != ">" && input[a + 1] != "=" && input[a + 1] != ";" && input[a + 1] != undefined )  ) {
                input.splice(a, 2, input[a] + input[a + 1]);
                a--;
            }
    }

    for (var b = 0; b < input.length; b++) {

        if (input[b] == ";") {  //Wenn ein Semikolon vorkommt,dann führe diese Funktion mit den Werten nach dem Semikolon aus
            variablesScanner(input.splice(b + 1))
        }

        else if (/\w/.test(input[b]) && isNaN(input[b])) {  //Wenn eine Variable erkannt wird...

            variablesHash[input[b]] = {"value":null, "min":null, "max":null};  //...erstelle ein assoziatives Array mit dem Namen der Variable und den Eigenschaften min, max und value

            if (input[b - 2] == "<" && input[b - 1] == "=" && input[b + 1] == "<" && input[b + 2] == "=") {       // wenn min <= x <= max
                if (!/^[-+]?[0-9]+$/.test(input[b - 3])) {          //überprüfung ob min eine ganze Zahl ist mit evtl. einem Vorzeichen
                    throw "Variable "+"\"<strong>" + input[b] + "</strong>\"" +" needs a valid minimum value!";
                }
                else if (!/^[-+]?[0-9]+$/.test(input[b + 3])){   //überprüfung ob max eine ganze Zahl ist mit evtl. einem Vorzeichen
                    throw "Variable "+"\"<strong>" + input[b] + "</strong>\"" +" needs a valid maximum value!";
                }
                variablesHash[input[b]].min = parseInt(input[b - 3]);
                variablesHash[input[b]].max = parseInt(input[b + 3]);

            }

            else if (input[b - 2] == "<" && input[b - 1] == "=" && input[b + 1] == "<") {                             // wenn min <= x < max
                if (!/^[-+]?[0-9]+$/.test(input[b - 3])) {
                    throw "Variable "+"\"<strong>" + input[b] + "</strong>\"" +" needs a valid minimum value!";
                }
                else if (!/^[-+]?[0-9]+$/.test(input[b + 2])){
                    throw "Variable "+"\"<strong>" + input[b] + "</strong>\"" +" needs a valid maximum value!";
                }
                variablesHash[input[b]].min = parseInt(input[b - 3]);
                variablesHash[input[b]].max = parseInt(input[b + 2]) - 1;

            }

            else if (input[b - 1] == "<" && input[b + 2] == "=" && input[b + 1] == "<") {                             // wenn min < x <= max
                if (!/^[-+]?[0-9]+$/.test(input[b - 2])) {
                    throw "Variable "+"\"<strong>" + input[b] + "</strong>\"" +" needs a valid minimum value!";
                }
                else if (!/^[-+]?[0-9]+$/.test(input[b + 3])){
                    throw "Variable "+"\"<strong>" + input[b] + "</strong>\"" +" needs a valid maximum value!";
                }
                variablesHash[input[b]].min = parseInt(input[b - 2]) + 1;
                variablesHash[input[b]].max = parseInt(input[b + 3]);

            }

            else if (input[b - 1] == "<" && input[b + 1] == "<") {                                                     //wenn min < x < max
                if (!/^[-+]?[0-9]+$/.test(input[b - 2])) {
                    throw "Variable "+"\"<strong>" + input[b] + "</strong>\"" +" needs a valid minimum value!";
                }
                else if (!/^[-+]?[0-9]+$/.test(input[b + 2])){
                    throw "Variable "+"\"<strong>" + input[b] + "</strong>\"" +" needs a valid maximum value!";
                }
                variablesHash[input[b]].min = parseInt(input[b - 2]) + 1;
                variablesHash[input[b]].max = parseInt(input[b + 2]) - 1;

            }
            else throw "Invalid input for the limitation of the variables!";

            if (variablesHash[input[b]].min > variablesHash[input[b]].max) {
                throw "Invalid limitation of the variable " + "\"<strong>" + input[b] + "</strong>\""  + " !";
            }

        }

        if (b==input.length - 1 && variablesHash==null){
            throw "Invalid input for the limitation of the variables!";
        }


    }


}






