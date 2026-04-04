// =======================
// VARIÁVEIS DO JOGO
// =======================
let numeroSecreto;
let tentativasRestantes;
let lista = [];
let pontuacao = 0;

// =======================
// ÁUDIO 8-BIT
// =======================
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

let audioLiberado = false;
let mutado = false;
let volume = 0.3;

function liberarAudio() {
    if (!audioLiberado) {
        audioCtx.resume();
        audioLiberado = true;
    }
}

function tocarBeep(freq, duracao, tipo = "square") {
    if (mutado || !audioLiberado) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = tipo;
    osc.frequency.value = freq;
    gain.gain.value = volume;

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();

    setTimeout(() => {
        osc.stop();
    }, duracao);
}

// =======================
// SONS
// =======================
function somClique() {
    tocarBeep(600, 80);
}

function somAcerto() {
    tocarBeep(500, 100);
    setTimeout(() => tocarBeep(700, 100), 100);
    setTimeout(() => tocarBeep(900, 150), 200);
}

function somErro() {
    tocarBeep(400, 120);
    setTimeout(() => tocarBeep(250, 150), 120);
}

function somDerrota() {
    tocarBeep(300, 200);
    setTimeout(() => tocarBeep(200, 200), 200);
    setTimeout(() => tocarBeep(100, 300), 400);
}

// =======================
// CONTROLE DE SOM
// =======================
function alternarMute() {
    mutado = !mutado;

    const btn = document.getElementById("btnMute");
    if (btn) {
        btn.textContent = mutado ? "🔇" : "🔊";
    }
}

function alterarVolume(valor) {
    volume = valor;
}

// =======================
// INICIAR JOGO
// =======================
function iniciarJogo() {
    numeroSecreto = Math.floor(Math.random() * 100) + 1;
    tentativasRestantes = 10;
    lista = [];
    pontuacao = 100;

    document.getElementById("mensagem").textContent = "";
    document.getElementById("listaPalpites").innerHTML = "";

    atualizarTentativas();
    atualizarBarra();
}

// =======================
// ATUALIZAÇÕES
// =======================
function atualizarTentativas() {
    document.getElementById("tentativas").textContent =
        `🎮 Tentativas restantes: ${tentativasRestantes}`;
}

function atualizarBarra() {
    const barra = document.getElementById("barra");
    const porcentagem = (tentativasRestantes / 10) * 100;
    if (barra) barra.style.width = porcentagem + "%";
}

function atualizarHistorico(valor) {
    lista.push(valor);

    const listaHTML = document.getElementById("listaPalpites");
    listaHTML.innerHTML = "";

    lista.forEach(p => {
        const li = document.createElement("li");
        li.textContent = p;
        listaHTML.appendChild(li);
    });
}

// =======================
// GAMEPLAY
// =======================
function chutar() {
    liberarAudio();
    somClique();

    const input = document.getElementById("palpite");
    const valor = parseInt(input.value);

    if (isNaN(valor) || valor < 1 || valor > 100) {
        mostrarMensagem("⚠️ Número inválido!", "erro");
        return;
    }

    tentativasRestantes--;
    pontuacao -= 10;

    atualizarHistorico(valor);
    atualizarBarra();

    // 🎉 ACERTO COM ANIMAÇÃO + RESET AUTOMÁTICO
    if (valor === numeroSecreto) {
        somAcerto();
        mostrarMensagem(`🎉 Acertou! Pontos: ${pontuacao}`, "acerto");
        salvarRanking(pontuacao);

        input.value = "";

        const container = document.querySelector(".game-container");
        container.classList.add("win");

        setTimeout(() => {
            container.classList.remove("win");
            document.getElementById("mensagem").textContent = "";
            iniciarJogo();
        }, 2000);

        return;
    }

    // 💀 DERROTA
    if (tentativasRestantes === 0) {
        somDerrota();
        mostrarMensagem(`💀 Perdeu! Era ${numeroSecreto}`, "erro");
        aplicarShake();
        atualizarTentativas();
        return;
    }

    // 🔄 CONTINUA JOGO
    if (valor < numeroSecreto) {
        mostrarMensagem("📈 É MAIOR!", "dica");
    } else {
        mostrarMensagem("📉 É MENOR!", "dica");
    }

    somErro();
    aplicarShake();
    atualizarTentativas();
    input.value = "";
}

// =======================
// UI
// =======================
function mostrarMensagem(msg, tipo) {
    const el = document.getElementById("mensagem");
    el.textContent = msg;
    el.className = `mensagem ${tipo}`;
}

function aplicarShake() {
    const container = document.querySelector(".game-container");
    container.classList.add("shake");

    setTimeout(() => {
        container.classList.remove("shake");
    }, 300);
}

// =======================
// RANKING
// =======================
function salvarRanking(pontos) {
    let ranking = JSON.parse(localStorage.getItem("ranking")) || [];

    ranking.push(pontos);
    ranking.sort((a, b) => b - a);
    ranking = ranking.slice(0, 5);

    localStorage.setItem("ranking", JSON.stringify(ranking));
    mostrarRanking();
}

function mostrarRanking() {
    let ranking = JSON.parse(localStorage.getItem("ranking")) || [];
    const lista = document.getElementById("ranking");

    if (!lista) return;

    lista.innerHTML = "";

    ranking.forEach((p, i) => {
        const li = document.createElement("li");
        li.textContent = `#${i + 1} - ${p} pts`;
        lista.appendChild(li);
    });
}

// =======================
// RESET
// =======================
function reiniciarJogo() {
    iniciarJogo();
}

// =======================
// INICIALIZAÇÃO
// =======================
iniciarJogo();
mostrarRanking();