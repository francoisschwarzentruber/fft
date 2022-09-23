const size = 8;
const signal = [1, 0, 0, 0, 0, 1, 0, 0].map((n) => ({ a: n, b: 0 }));
let mouse = 0;
const SCALE = 128;
const SCALECOMPLEX = 0.5;
const CIRCUITSCALE = 0.5;
const BUTTERFLIESSCALE = 0.7;
const COLORBUTTERFLY = "pink";
const LINEWIDTHWIRE = 0.01;
const LINEWIDTHBUTTERFLY = 0.01;

const colors = ["rgb(128, 192, 255)", "cyan", "green", "rgb(0, 192, 0)", "yellow", "orange", "rgb(255, 64, 0)", "rgb(255, 0, 192)", ,];


function straightLines(ctx, x1, x2, ytop, n) {
    ctx.strokeStyle = "white";
    for (let w = ytop; w < ytop + n; w++) {
        ctx.beginPath();
        ctx.lineWidth = LINEWIDTHWIRE;
        ctx.moveTo(x1, w);
        ctx.lineTo(x2, w);
        ctx.stroke();
    }

}


function messupLines(ctx, x1, x2, ytop, n) {
    for (let i = 0; i < 2 * n; i++) {
        const i2 = ytop + i
        const j = ytop + ((i % 2 == 0) ? i / 2 : n + Math.floor(i / 2));
        ctx.beginPath();
        ctx.lineWidth = LINEWIDTHWIRE;
        ctx.moveTo(x1, i2);
        ctx.bezierCurveTo(x1 + 0.5, i2, x2 - 0.5, j, x2, j);
        ctx.stroke();
    }
}


function line(ctx, x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}




function butterfly(ctx, x, y1, y2) {
    ctx.lineWidth = LINEWIDTHBUTTERFLY;
    line(ctx, x, y1, x + 0.25, y2);
    line(ctx, x, y2, x + 0.25, y1);
}

function butterflies(ctx, x, ytop, n) {
    for (let y = ytop; y < ytop + n; y++) {
        butterfly(ctx, x + CIRCUITSCALE * BUTTERFLIESSCALE * (y - ytop), y, y + n);

        let angle = (y - ytop) * Math.PI / n;
        let r = 0.3;
        let omega = { a: r * Math.cos(angle), b: r * Math.sin(angle), color: COLORBUTTERFLY };

        drawComplexArrow(ctx, x + CIRCUITSCALE * BUTTERFLIESSCALE * (y - ytop + 0.4), y  + 0.3, omega)
        drawComplexArrow(ctx, x + CIRCUITSCALE * BUTTERFLIESSCALE * (y - ytop + 0.4), y + n - 0.3, oppositeC(omega))
    }
}




function addC({ a: a1, b: b1 }, { a: a2, b: b2 }) { return { a: a1 + a2, b: b1 + b2 } };
function multC({ a: a1, b: b1 }, { a: a2, b: b2, color: color }) { return { a: a1 * a2 - b1 * b2, b: a1 * b2 + a2 * b1, color: color } };
function oppositeC({ a: a1, b: b1, color: color }) { return { a: -a1, b: -b1, color: color } };


function add(complexArray1, complexArray2) { return complexArray1.concat(complexArray2) };
function mult(complex1, complexArray2) { return complexArray2.map(c => multC(complex1, c)) };
function opposite(complexArray) { return complexArray.map(oppositeC) };



function arrow(ctx, x, y, angle, S = 0.1, A = 0.4) {
    ctx.beginPath();
    ctx.moveTo(x - S * Math.cos(angle - A), y - S * Math.sin(angle - A));
    ctx.lineTo(x, y);
    ctx.lineTo(x - S * Math.cos(angle + A), y - S * Math.sin(angle + A));
    ctx.stroke();
}



function linearrow(ctx, x1, y1, x2, y2) {
    line(ctx, x1, y1, x2, y2);
    const d = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);

    if (d > 0.1)
        arrow(ctx, x2, y2, Math.atan2(y2 - y1, x2 - x1), Math.min(0.15, d / 2));
}


function drawComplexArrow(ctx, x, y, complex) {
    linearrow(ctx, x, y, x + complex.a * SCALECOMPLEX, y - complex.b * SCALECOMPLEX);
}



function drawComplex(ctx, x, y, complexArray) {
    ctx.beginPath();
    const rpoint = 0.05;
    const r = SCALECOMPLEX;
    ctx.fillStyle = "white"
    ctx.arc(x, y, rpoint, 0, 2 * Math.PI);
    ctx.fill();

    ctx.lineWidth = 0.05;

    for (let i = 0; i < complexArray.length; i++) {
        if (complexArray[i].a != 0 || complexArray[i].b != 0) {
            ctx.strokeStyle = complexArray[i].color
            drawComplexArrow(ctx, x, y, complexArray[i]);
            x = x + complexArray[i].a * r;
            y = y - complexArray[i].b * r;
        }

    }
    ctx.lineWidth = 0.05;

}

/*
function drawComplex(ctx, x, y, { a: a, b: b, color: color }) {
    ctx.beginPath();
    const rpoint = 0.1;
    const r = 0.4
    ctx.fillStyle = "white"
    ctx.arc(x, y, rpoint, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = color ? color : "green"

    ctx.lineWidth = 0.2;
    line(ctx, x, y, x + a * r, y + b * r);
    ctx.lineWidth = 0.1;
}*/




function fftcircuit(ctx, x, ytop, n, signal, signalLabels) {
    if (n == 1)
        return { x: x, result: signal };

    ctx.strokeStyle = "white";

    straightLines(ctx, x, x + 2 * CIRCUITSCALE, ytop, n);
    for (let w = 0; w < signalLabels.length; w++) {
        ctx.fillStyle = "black"
        ctx.fillRect(x - 0.4 * CIRCUITSCALE, ytop + w - 0.1 - 0.3, 0.3, 0.3)
        ctx.fillStyle = "white"
        ctx.fillText(signalLabels[w], x - 0.4 * CIRCUITSCALE, ytop + w - 0.1);
    }

    for (let w = 0; w < signal.length; w++)
        drawComplex(ctx, x + 1 * CIRCUITSCALE, ytop + w, signal[w])


    ctx.strokeStyle = "white";
    if (n > 2) {
        messupLines(ctx, x + 2 * CIRCUITSCALE, x + 4 * CIRCUITSCALE, ytop, n / 2);
        x += 2 * CIRCUITSCALE;
    }



    function even(s) {
        const result = [];
        for (let i = 0; i < s.length; i += 2)
            result.push(s[i]);
        return result;
    }


    function odd(s) {
        const result = [];
        for (let i = 1; i < s.length; i += 2)
            result.push(s[i]);
        return result;
    }


    const { x: x1, result: result1 } = fftcircuit(ctx, x + 2 * CIRCUITSCALE, ytop, n / 2, even(signal), even(signalLabels));
    const { x: x2, result: result2 } = fftcircuit(ctx, x + 2 * CIRCUITSCALE, ytop + n / 2, n / 2, odd(signal), odd(signalLabels));

    const butterfliesxleft = (n <= 2) ? x2 + 0.5 * CIRCUITSCALE : x2 + 2 * CIRCUITSCALE;
    const xfinal = butterfliesxleft + (n / 2) * BUTTERFLIESSCALE * CIRCUITSCALE + 1.7 * CIRCUITSCALE;

    straightLines(ctx, x2, xfinal, ytop, n);
    ctx.strokeStyle = COLORBUTTERFLY;

    for (let y = 0; y < (2 * size / n); y += (2 * size / n))
        butterflies(ctx, butterfliesxleft + y ** CIRCUITSCALE, ytop + y, n / 2);

    let angle = Math.PI * 2 / n;
    let omega = { a: Math.cos(angle), b: Math.sin(angle) };
    let omegacurrent = { a: 1, b: 0 };
    const result = new Array(n);

    for (let y = 0; y < n / 2; y++) {
        result[y] = add(result1[y], mult(omegacurrent, result2[y]));
        result[y + n / 2] = add(result1[y], opposite(mult(omegacurrent, result2[y])));
        omegacurrent = multC(omegacurrent, omega);
    }

    for (let w = 0; w < signal.length; w++)
        drawComplex(ctx, xfinal, ytop + w, result[w])

    ctx.beginPath();
    ctx.lineWidth = 0.02;
    ctx.strokeStyle = "grey";
    ctx.fillStyle = "rgba(128, 128, 128, 0.2)";
    const margin = n / size;
    const MARGINETRA = 0.3;
    const MARGINMIN = 0.3;
    const rect = { x: x + 2.3 * CIRCUITSCALE, y: ytop - MARGINMIN - MARGINETRA * margin, w: xfinal - x - 3.8 * CIRCUITSCALE, h: n - 1 + 2 * MARGINMIN + MARGINETRA * 2 * margin }
    ctx.rect(rect.x, rect.y, rect.w, rect.h);
    ctx.stroke();
    ctx.lineWidth = 0.05;

    /*
    function isPointInRect(p, r) {
        if (p.x < r.x)
            return false;

        if (p.x > r.x + r.w)
            return false;

        if (p.y < r.y)
            return false;

        if (p.y > r.y + r.h)
            return false;

        return true;
    }*/


    /*    if (!isPointInRect(mouse, rect))
            ctx.fill();
    */
    return { x: xfinal, result: result };
}


function draw(ctx) {

    ctx.clearRect(0, 0, 6040, 4080);


    ctx.save();
    ctx.font = "0.3px Arial"
    ctx.scale(SCALE, SCALE);
    ctx.lineWidth = 0.05;



    fftcircuit(ctx, CIRCUITSCALE, 1, size, signal.map((c, i) => ([{ a: c.a, b: c.b, color: colors[i] }])), [0, 1, 2, 3, 4, 5, 6, 7].map((i) => "a" + i))

    ctx.fillStyle = "white"

    /*
    for (let w = 0; w < size; w++)
        ctx.fillText("a" + w, 0.5, 1 + w + 0.15);
*/
    ctx.restore();
}


draw(canvas.getContext("2d"));

let mousePressed = false;
let wireChanged = undefined;

canvas.onmousedown = () => {
    wireChanged = undefined;
    if (mouse.x < 5 * CIRCUITSCALE) {
        const y = mouse.y - 1;
        const w = Math.round(y);
        if (0 <= w && w <= 7) {
            wireChanged = w;
            console.log(w)

            const ix = (mouse.x - 1) * CIRCUITSCALE;
            const iy = -(y - w);
            signal[w] = { a: ix / SCALECOMPLEX, b: iy / SCALECOMPLEX };
            draw(canvas.getContext("2d"));
        }
    }

    mousePressed = true
}
canvas.onmouseup = () => { mousePressed = false }

canvas.onclick = () => {

}
canvas.onmousemove = (evt) => {
    const rect = evt.target.getBoundingClientRect();
    mouse = { x: (evt.clientX - rect.left) / SCALE, y: (evt.clientY - rect.top) / SCALE };

    if (mousePressed) {
        if (wireChanged != undefined) {

            const y = mouse.y - 1;
            const ix = (mouse.x - 1) * CIRCUITSCALE;
            const iy = -(y - wireChanged);
            signal[wireChanged] = { a: ix / SCALECOMPLEX, b: iy / (SCALECOMPLEX) };
            draw(canvas.getContext("2d"));

        }
    }
    draw(canvas.getContext("2d"));
}