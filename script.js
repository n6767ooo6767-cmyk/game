const canvas = document.getElementById("graph");
const ctx = canvas.getContext("2d");

const formulaInput = document.getElementById("formula");
const drawButton = document.getElementById("draw");
const errorBox = document.getElementById("error");

const guessInput = document.getElementById("guess");
const guessButton = document.getElementById("guessButton");
const guessResult = document.getElementById("guessResult");

let currentFormula = "sin(x)";


function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();

    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    drawGraph(currentFormula);
}


function normalizeFormula(formula) {
    return formula
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/\^/g, "**")
        .replace(/π/g, "Math.PI")
        .replace(/pi/g, "Math.PI")
        .replace(/\bsin\b/g, "Math.sin")
        .replace(/\bcos\b/g, "Math.cos")
        .replace(/\btan\b/g, "Math.tan")
        .replace(/\bsqrt\b/g, "Math.sqrt")
        .replace(/\blog\b/g, "Math.log")
        .replace(/\bln\b/g, "Math.log")
        .replace(/\babs\b/g, "Math.abs")
        .replace(/\bexp\b/g, "Math.exp");
}


function createFunction(formula) {
    const normalized = normalizeFormula(formula);

    if (!normalized) {
        throw new Error("Введите формулу.");
    }

    // Ограничиваем доступные символы.
    if (!/^[0-9a-zA-Z_+\-*/().,<>!=&|?:%*]+$/.test(normalized)) {
        throw new Error("В формуле есть недопустимые символы.");
    }

    return new Function(
        "x",
        `"use strict"; return (${normalized});`
    );
}


function drawGraph(formula) {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    ctx.clearRect(0, 0, width, height);

    drawGrid(width, height);

    let fn;

    try {
        fn = createFunction(formula);
        errorBox.textContent = "";
    } catch (error) {
        errorBox.textContent = error.message;
        return;
    }

    const scaleX = width / 20;
    const scaleY = height / 12;

    const centerX = width / 2;
    const centerY = height / 2;

    drawAxes(width, height, centerX, centerY);

    ctx.beginPath();

    let drawing = false;

    for (let px = 0; px <= width; px++) {
        const x = (px - centerX) / scaleX;

        let y;

        try {
            y = Number(fn(x));
        } catch {
            drawing = false;
            continue;
        }

        if (!Number.isFinite(y) || Math.abs(y) > 100) {
            drawing = false;
            continue;
        }

        const py = centerY - y * scaleY;

        if (!drawing) {
            ctx.moveTo(px, py);
            drawing = true;
        } else {
            ctx.lineTo(px, py);
        }
    }

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.stroke();
}


function drawGrid(width, height) {
    const centerX = width / 2;
    const centerY = height / 2;

    ctx.strokeStyle = "#252525";
    ctx.lineWidth = 1;

    const stepX = width / 20;
    const stepY = height / 12;

    for (let x = centerX % stepX; x < width; x += stepX) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }

    for (let y = centerY % stepY; y < height; y += stepY) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
}


function drawAxes(width, height, centerX, centerY) {
    ctx.strokeStyle = "#777";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();
}


drawButton.addEventListener("click", () => {
    const formula = formulaInput.value.trim();

    if (!formula) {
        errorBox.textContent = "Введите формулу.";
        return;
    }

    currentFormula = formula;
    drawGraph(currentFormula);
});


formulaInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        drawButton.click();
    }
});


guessButton.addEventListener("click", () => {
    const guess = guessInput.value.trim();

    if (!guess) {
        guessResult.textContent = "Сначала напиши свою догадку.";
        return;
    }

    guessResult.textContent =
        `Твоя догадка: ${guess}`;
});


guessInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        guessButton.click();
    }
});


window.addEventListener("resize", resizeCanvas);

resizeCanvas();
