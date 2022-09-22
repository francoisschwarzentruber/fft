
const size = 8;

function straightLines(ctx, x1, x2, ytop, n) {
    ctx.strokeStyle = "white";
    for (let w = ytop; w < ytop + n; w++) {
        ctx.beginPath();
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
    line(ctx, x, y1, x + 1, y2);
    line(ctx, x, y2, x + 1, y1);
}

function butterflies(ctx, x, ytop, n) {
    for (let y = ytop; y < ytop + n; y++) {
        butterfly(ctx, x + (y - ytop), y, y + n);
    }
}




function addC({ a: a1, b: b1 }, { a: a2, b: b2 }) { return { a: a1 + a2, b: b1 + b2 } };
function multC({ a: a1, b: b1 }, { a: a2, b: b2, color: color }) { return { a: a1 * a2 - b1 * b2, b: a1 * b2 + a2 * b1, color: color } };
function oppositeC({ a: a1, b: b1, color: color }) { return { a: -a1, b: -b1, color: color } };


function add(c1, c2) { return c1.concat(c2) };
function mult(c1, c2) { return c2.map(c => multC(c1, c)) };
function opposite(c) { return c.map(oppositeC) };



function arrow(ctx, x, y, angle, S = 0.2, A = 0.3) {
    ctx.beginPath();
    ctx.moveTo(x - S * Math.cos(angle - A), y - S * Math.sin(angle - A));
    ctx.lineTo(x, y);
    ctx.lineTo(x - S * Math.cos(angle + A), y - S * Math.sin(angle + A));
    ctx.stroke();
}



function linearrow(ctx, x1, y1, x2, y2) {
    line(ctx, x1, y1, x2, y2);
    arrow(ctx, x2, y2, Math.atan2(y2 - y1, x2 - x1));
}



function drawComplex(ctx, x, y, c) {
    ctx.beginPath();
    const rpoint = 0.1;
    const r = 0.5;
    ctx.fillStyle = "white"
    ctx.arc(x, y, rpoint, 0, 2 * Math.PI);
    ctx.fill();

    ctx.lineWidth = 0.15;

    for (let i = 0; i < c.length; i++) {
        if(c[i].a != 0 || c[i].b != 0) {
            ctx.lineWidth = i == 0 ? 0.15 : 0.1 - 0.05 * i / c.length;
            ctx.strokeStyle = c[i].color ? c[i].color : "green"
            linearrow(ctx, x, y, x + c[i].a * r, y - c[i].b * r);
            x = x + c[i].a * r;
            y = y - c[i].b * r;
    
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


const colors = ["lightgreen", "red", "yellow", "cyan", "orange", "purple", "green", "rgb(128, 192, 255)"];


function fftcircuit(ctx, x, ytop, n, signal) {
    if (n == 1)
        return { x: x, result: signal };

    ctx.strokeStyle = "white";

    straightLines(ctx, x, x + 2, ytop, n);

    for (let w = 0; w < signal.length; w++)
        drawComplex(ctx, x + 0.5, ytop + w, signal[w])


    ctx.strokeStyle = "white";

    messupLines(ctx, x + 2, x + 4, ytop, n / 2);

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


    const { x: x1, result: result1 } = fftcircuit(ctx, x + 4, ytop, n / 2, even(signal));
    const { x: x2, result: result2 } = fftcircuit(ctx, x + 4, ytop + n / 2, n / 2, odd(signal));


    const xfinal = x2 + n / 2 + 2;

    straightLines(ctx, x2, xfinal, ytop, n);
    ctx.strokeStyle = "pink";

    for (let y = 0; y < (2 * size / n); y += (2 * size / n))
        butterflies(ctx, x2 + y, ytop + y, n / 2);

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
        drawComplex(ctx, xfinal - 1, ytop + w, result[w])

    ctx.lineWidth = 0.02;
    ctx.strokeStyle = "lightgrey";
    ctx.fillStyle = "grey";
    const margin = n / size;
    const MARGINETRA = 0.3;
    const MARGINMIN = 0.3;
    ctx.rect(x + 1.5, ytop - MARGINMIN - MARGINETRA * margin, xfinal - x - 3.2, n - 1 + 2 * MARGINMIN + MARGINETRA * 2 * margin);
    ctx.stroke();
    ctx.lineWidth = 0.05;

    if (n <= 1)
        ctx.fill();

    return { x: xfinal, result: result };
}


function draw(ctx) {
    ctx.save();
    const s = 32;
    ctx.translate(20, 60)
    ctx.scale(s, 1.4 * s);
    ctx.lineWidth = 0.05;
    ctx.clearRect(0, 0, 640, 480);


    const signal = [1, 0, 1, 0, 0, 0, 0, 1];
    //const signal = [1, -1, 1, 1, 1, 1, 1, 0.5];
    fftcircuit(ctx, 0, 0, size, signal.map((n, i) => ([{ a: n, b: 0, color: colors[i] }])))


    ctx.restore();
}


draw(canvas.getContext("2d"));
