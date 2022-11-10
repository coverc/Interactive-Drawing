var gl;
var delay = 100;
var canvas;
var program;
var thetaLoc;
var colorLoc;
var redButton, blueButton, greenButton, yellowButton, purpleButton;
var lineButton, triButton;
var text;
var col = [];
var DrawingLines = false;
var DrawingTriangles = false;
var vBufferLine, vBufferTri, cBufferLine, cBufferTri;
var scalematrix, translationmatrix;
var xwl, ywl, xwt, ywt;
var posXLine, posYLine, posXTri, posYTri;
var xn, yn;
var worldmax = 100;
var worldmin = -100;
var verticesLine = [];
var pointcounterLines = 0;
var lineOffset = 0;
var triOffset = 0;
var matvecworldtoNDCTri, matvecworldtoNDCLine;
var buffereventsLine = false;
var buffereventsTri = false;
var pointoffsetcolorline = 0;
var pointoffsetcolortri = 0;
var vcolorsTri = [];
var vcolorsLines = [];
var pointcounterTri = 0;
var verticesTri = [];

//window.addEventListener("mousemove", test);


/*function test() {

    var e = window.event;
    posX = e.clientX;
    posY = e.clientY;

    deviceToWorld(posX, 512 - posY);

}*/

function draw() {

//    var e = window.event;
//    posX = e.clientX;
//    posY = e.clientY;
    if (DrawingLines == true) {
        var e = window.event;
        posXLine = e.clientX;
        posYLine = e.clientY;
        pointcounterLines += 1;
        deviceToWorldLine(posXLine, 512 - posYLine);
        verticesLine.push(xwl, ywl);
        vcolorsLines.push(col);

        //console.log(xw, yw);
        if (DrawingLines == true && pointcounterLines%2 == 0) {
            //console.log("Entering Draw");
            gl.bindBuffer(gl.ARRAY_BUFFER, vBufferLine);
            gl.bufferSubData(gl.ARRAY_BUFFER, lineOffset, flatten(verticesLine));
            var vPosition = gl.getAttribLocation( program, "vPosition");
            gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(vPosition);
            lineOffset += 32;

            //filling color buffer
            gl.bindBuffer(gl.ARRAY_BUFFER, cBufferLine);
            gl.bufferSubData(gl.ARRAY_BUFFER, pointoffsetcolorline, flatten(vcolorsLines));
            pointoffsetcolorline += 64;
            var vColor = gl.getAttribLocation( program, "vColor");
            gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(vColor);
            var worldtondcvec = vec4(xwl, ywl, 0.0, 1.0);
            var NDCtranslate1 = translate2d(worldmin, worldmin);
            var NDCscale1 = scale2d((2.0/(worldmax-worldmin)), (2.0/(worldmax-worldmin)));
            var NDCtranslate2 = translate2d(1,1);

            matvecworldtoNDCLine = mult(NDCtranslate2, mult(NDCscale1,NDCtranslate1));
            gl.uniformMatrix4fv(worldToNDCmat4, false, flatten(matvecworldtoNDCLine));
            buffereventsLine=true;
            //pointcounterLines = 0;
            //console.log("Exiting Draw");
        }
    }
    if (DrawingTriangles == true) {
        var f = window.event;
        posXTri = f.clientX;
        posYTri = f.clientY;
        pointcounterTri += 1;
        deviceToWorldTri(posXTri, 512 - posYTri);
        verticesTri.push(xwt, ywt);
        vcolorsTri.push(col);

        if (DrawingTriangles == true && pointcounterTri%3 == 0) {
            gl.bindBuffer(gl.ARRAY_BUFFER, vBufferTri);
            gl.bufferSubData(gl.ARRAY_BUFFER, lineOffset, flatten(verticesTri));
            var vPosition = gl.getAttribLocation( program, "vPosition");
            gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(vPosition);
            triOffset += 32;

            gl.bindBuffer(gl.ARRAY_BUFFER, cBufferTri);
            gl.bufferSubData(gl.ARRAY_BUFFER, pointoffsetcolortri, flatten(vcolorsTri));
            pointoffsetcolortri += 48;
            var vColor = gl.getAttribLocation( program, "vColor");
            gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(vColor);
            var worldtondcvec = vec4(xwt, ywt, 0.0, 1.0);
            var NDCtranslate1 = translate2d(worldmin, worldmin);
            var NDCscale1 = scale2d((2.0/(worldmax-worldmin)), (2.0/(worldmax-worldmin)));
            var NDCtranslate2 = translate2d(1,1);

            matvecworldtoNDCTri = mult(NDCtranslate2, mult(NDCscale1,NDCtranslate1));
            gl.uniformMatrix4fv(worldToNDCmat4, false, flatten(matvecworldtoNDCTri));
            buffereventsTri=true;
        }
    }
}
window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    canvas.addEventListener("mousedown", draw);

    lineButton = document.getElementById("DrawLine");
    triButton = document.getElementById("DrawTri");
    redButton = document.getElementById("DrawRed");
    blueButton = document.getElementById("DrawBlue");
    greenButton = document.getElementById("DrawGreen");
    purpleButton = document.getElementById("DrawPurple");
    yellowButton = document.getElementById("DrawYellow");
    text = document.getElementById("textarea");
    lineButton.addEventListener("click", drawLines);
    triButton.addEventListener("click", drawTriangles);
    redButton.addEventListener("click", drawRed);
    blueButton.addEventListener("click", drawBlue);
    greenButton.addEventListener("click", drawGreen);
    purpleButton.addEventListener("click", drawPurple);
    yellowButton.addEventListener("click", drawYellow);



    gl = WebGLUtils.setupWebGL( canvas );

    if ( !gl ) {
    		alert( "WebGL isn't available" );
    }

    gl.viewport( 0, 0, canvas.width, canvas.height );

    gl.clearColor( 0.5, 0.5, 0.5, 1.0 );

    program = initShaders( gl, "vertex-shader", "fragment-shader" );

    gl.useProgram( program );

//thetaLoc = gl.getUniformLocation( program, "theta" );

    colorLoc = gl.getUniformLocation(program, "vertColor");

    worldToNDCmat4 = gl.getUniformLocation(program, "worldToNDC");

    vBufferLine = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBufferLine);
    gl.bufferData(gl.ARRAY_BUFFER, 30000 * 4 * 4 * 4, gl.STATIC_DRAW);

    vBufferTri = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBufferTri);
    gl.bufferData(gl.ARRAY_BUFFER, 30000 * 4 * 4 * 4, gl.STATIC_DRAW);

    cBufferLine = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBufferLine);
    gl.bufferData(gl.ARRAY_BUFFER, 30000 * 4 * 4 * 4, gl.STATIC_DRAW);

    cBufferTri = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBufferTri);
    gl.bufferData(gl.ARRAY_BUFFER, 30000 * 4 * 4 * 4, gl.STATIC_DRAW);

    render();
}

function deviceToWorldLine (X, Y) {

    var devtoworldvec = vec4(X, Y, 1.0, 0.0);
    var translate1 = translate2d(-512, -512);
    var scale1 = scale2d(1/512, 1/512);
    var scale2 = scale2d(200, 200);
    var translate2 = translate2d(-100, -100);

    var multvecdevtoworld = mult(translate2, mult(scale2, scale1));
    xwl = dotProd(multvecdevtoworld[0], devtoworldvec);
    ywl = dotProd(multvecdevtoworld[1], devtoworldvec);

    //console.log(xw, yw);
    //worldToNDC(xw, yw);
}

function deviceToWorldTri (X, Y) {

    var devtoworldvec = vec4(X, Y, 1.0, 0.0);
    var translate1 = translate2d(-512, -512);
    var scale1 = scale2d(1/512, 1/512);
    var scale2 = scale2d(200, 200);
    var translate2 = translate2d(-100, -100);

    var multvecdevtoworld = mult(translate2, mult(scale2, scale1));
    xwt = dotProd(multvecdevtoworld[0], devtoworldvec);
    ywt = dotProd(multvecdevtoworld[1], devtoworldvec);

    //console.log(xw, yw);
    //worldToNDC(xw, yw);
}

//function worldToNDC (X2, Y2) {
//
//    var worldtondcvec = vec4(X2, Y2, 1.0, 0.0);
//    var NDCtranslate1 = translate2d(worldmin, worldmin);
//    var NDCscale1 = scale2d((2.0/(worldmax-worldmin)), (2.0/(worldmax-worldmin)));
//    var NDCtranslate2 = translate2d(1,1);
//
//    matvecworldtoNDC = mult(NDCtranslate2, mult(NDCscale1,NDCtranslate1));
//    xn = dotProd(matvecworldtoNDC[0], worldtondcvec);
//    yn = dotProd(matvecworldtoNDC[1], worldtondcvec);
//
//    console.log(xn, yn);
//}


function render() {

    gl.clear( gl.COLOR_BUFFER_BIT );

    if (DrawingTriangles == true && buffereventsTri == true) {
        gl.bindBuffer(gl.ARRAY_BUFFER, vBufferTri);
        gl.bindBuffer(gl.ARRAY_BUFFER, cBufferTri);
        gl.drawArrays(gl.TRIANGLES, 0, 50000);
        }

    if (DrawingLines == true && buffereventsLine == true) {
        gl.bindBuffer(gl.ARRAY_BUFFER, vBufferLine);
        gl.bindBuffer(gl.ARRAY_BUFFER, cBufferLine);
        gl.drawArrays(gl.LINES, 0, 50000);
    }

//    if (DrawingTriangles == true && buffereventsTri == true) {
//        gl.bindBuffer(gl.ARRAY_BUFFER, vBufferTri);
//        gl.bindBuffer(gl.ARRAY_BUFFER, cBufferTri);
//        gl.drawArrays(gl.TRIANGLES, 0, 50000);
//    }




    setTimeout(
            function (){requestAnimFrame(render);}, delay
        );
}

function drawLines() {
    text.innerHTML = "Now Drawing Lines";
    DrawingLines = true;
    DrawingTriangles = false;
//    gl.clear(vBufferTri);
//    gl.clear(cBufferTri);
}

function drawTriangles() {
    text.innerHTML = "Now Drawing Triangles";
    DrawingLines = false;
    DrawingTriangles = true;
//    gl.clear(vBufferLine);
//    gl.clear(cBufferLine);
}

function drawRed() {
    text.innerHTML = "Now Drawing RED Primitives";
    vcolorsTri = [];
    col = [1.0, 0 ,0, 1.0];

}

function drawBlue() {
    text.innerHTML = "Now Drawing BLUE Primitives";
    vcolorsTri = [];
    col = [0, 0, 1.0, 1.0];
}

function drawGreen() {
    text.innerHTML = "Now Drawing GREEN Primitives";
    vcolorsTri = [];
    col = [0, 1.0, 0, 1.0];
}

function drawPurple() {
    text.innerHTML = "Now Drawing PURPLE Primitives";
    vcolorsTri = [];
    col = [1.0, 0, 1.0, 1.0];
}

function drawYellow() {
    text.innerHTML = "Now Drawing YELLOW Primitives";
    vcolorsTri = [];
    col = [1.0, 1.0, 0, 1.0];
}

function translate2d(tx, ty){

    translationmatrix = mat4(vec4(1, 0, tx, 0),
                            vec4(0, 1, ty, 0),
                            vec4(0, 0, 1, 0),
                            vec4(0, 0, 0, 1))
    return translationmatrix;
}

function scale2d(sx, sy) {

    scalematrix = mat4(vec4(sx, 0, 0, 0),
                    vec4(0, sy, 0, 0),
                    vec4(0, 0, 1, 0),
                    vec4(0, 0, 0, 1))
    return scalematrix;
}

function dotProd(v1, v2) {

     prod = ((v1[0] * v2[0]) + (v1[1] * v2[1]) + (v1[2] * v2[2]) + (v1[3] * v2[3]));

    return prod;
}