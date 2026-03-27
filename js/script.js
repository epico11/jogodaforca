// =========== importações do firebase ===========

import { auth, provider, db, storage } from "./firebase.js";
import { palavrass } from "./palavras.js";

import {
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    deleteUser, 
    reauthenticateWithPopup
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

import {
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    increment,
    collection,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

// ============== váriáveis globais ==============

// let palavras1 = [
//     'BOLA', 'PÉ-DE-CABRA', 'FITA ADESIVA',

//     'COELHO', 'PEIXE ESPADA', 'MACACO PREGO',

//     'AÇAÍ', 'TORTA DE MAÇÃ', 'BOLO DE MILHO',

//     'SAIR', 'ANDAR', 'COZINHAR',

//     'POLICIAL', 'MÉDICO', 'JUIZ',

//     'MAGRO', 'ALTO', 'BONITO',
// ] // palavras disponíveis para o jogo armazenadas em palavras1=[]

let palavrasDisponiveis = [...palavrass];
// let palavrasDisponiveis = [];

const copiaPalavras = palavrass.slice();

let palavraSecreta = "";
let palavraOculta = [];
let erros = 0;
const maxErros = 6;

//>>>>>>>>>>>>>>>>>>>>>>>>>>
let usuarioAtual = null;
let cadastroInicialObrigatorio = false;
let modoEdicaoUsername = false;
let pontosAcumuladosUsuario = 0;
let palavrasAcertadasUsuario = 0;
let palavrasErradasUsuario = 0;
let melhorSequenciaUsuario = 0;
let sequenciaAtualUsuario = 0;

let modoOrdenacaoRanking = "pontos";

const palavraDiv = document.getElementById("palavra");
const tecladoDiv = document.getElementById("teclado");
const mensagem = document.getElementById("mensagem");
const canvas = document.getElementById("forca");
const ctx = canvas.getContext("2d");

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
const spanLoginGoogle = document.getElementById("spanLoginGoogle");
const spanLogoutGoogle = document.getElementById("spanLogoutGoogle");
const nomeJogador = document.getElementById("nomeJogador");
const editNick = document.getElementById("editNick");
const excluirContaa = document.getElementById("excluirContaa");
const modalNickEdit = document.getElementById("modalNickEdit");
const inputNick = document.getElementById("inputNick");
const salvarNick = document.getElementById("salvarNick");
const cabecalhoEditNick = document.getElementById("cabecalhoEditNick");

const rankingLista = document.getElementById("rankingLista");
const btnRankPontos = document.getElementById("btnRankPontos");
const btnRankSequencia = document.getElementById("btnRankSequencia");
const btnRankAcertos = document.getElementById("btnRankAcertos");
const closeRanking = document.getElementById("closeRanking");
const fundoRanking = document.getElementById("fundoRanking");
const rankingBtnMenu = document.getElementById("ranking");


//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
const conteudoPontos = document.getElementById("conteudoPontos");
const textoEntrarComGoogle = document.getElementById("textoEntrarComGoogle");

const sequencia = document.getElementById("sequencia");

const toastRodada = document.getElementById("toastRodada");
let timeoutToastRodada;


// para quando conter a letra selecionada na palavra
const clickLetraTrue = new Audio("./audios/tecladow.mp3");
// clickLetraTrue.play();

// para quando não conter a letra selecionada na palavra
const clickLetraFalse = new Audio("./audios/tecladog.mp3");
// clickLetraFalse.play();

// para o usuário não conseguir acertar a palavra
const gameOver = new Audio("./audios/gameover.mp3");
// gameOver.play();

// para quando não conter a letra selecionada na palavra
const movimentoRanking = new Audio("./audios/movimento.mp3");
// movimentoRanking.play();

function iniciarJogo() {
    if (palavrasDisponiveis.length === 0) {
        mensagem.textContent = "🏁 Todas as palavras já foram usadas! Reinicie o jogo para começar tudo de novo.";
        tecladoDiv.innerHTML = "";
        palavraDiv.textContent = "";
        return;
    }

    const indice = Math.floor(Math.random() * palavrasDisponiveis.length);
    palavraSecreta = palavrasDisponiveis[indice];

    // Remove a palavra sorteada da lista
    let palavraAtr = palavrasDisponiveis.splice(indice, 1)[0];
    document.getElementById("palavraAtribuida").value = palavraAtr;

    palavraOculta = palavraSecreta.split("").map(caractere => {
        if (caractere === " ") return " ";   // mantém espaço
        if (caractere === "-") return "-";   // mantém hífen
        return "_"; // esconde só letras
    });
    // palavraOculta = palavraSecreta.split("").map(() => "_");


    erros = 0;
    
    //   mensagem.textContent = "";
    mensagem.textContent = `Palavras restantes: ${palavrasDisponiveis.length}` + "/490";
    //   mensagem.textContent = "🏁 Todas as palavras já foram usadas!";
    tecladoDiv.innerHTML = "";
    atualizarPalavra();
    desenharForca();
    criarTeclado();
    dicaTipoPalavra();
}

function dicaTipoPalavra(){
    let palavraDaVez = document.getElementById("palavraAtribuida").value;
    let indicePalavraDaVez = copiaPalavras.indexOf(palavraDaVez);
    // document.getElementById("indiceP").value = indicePalavraDaVez;
    if(indicePalavraDaVez <= 69){
        document.getElementById("tipoP").value = "OBJETO 💡";
    }else if(indicePalavraDaVez >= 70 && indicePalavraDaVez <= 139){
        document.getElementById("tipoP").value = "ANIMAL 💡";
    }else if(indicePalavraDaVez >= 140 && indicePalavraDaVez <= 209){
        document.getElementById("tipoP").value = "ALIMENTO 💡";
    }else if(indicePalavraDaVez >= 210 && indicePalavraDaVez <= 279){
        document.getElementById("tipoP").value = "VERBO 💡";
    }else if(indicePalavraDaVez >= 280 && indicePalavraDaVez <= 349){
        document.getElementById("tipoP").value = "PROFISSÃO 💡";
    }else if(indicePalavraDaVez >= 350 && indicePalavraDaVez <= 419){
        document.getElementById("tipoP").value = "ADJETIVO 💡";
    }else if(indicePalavraDaVez >= 420 && indicePalavraDaVez <= 489){
         document.getElementById("tipoP").value = "PAÍS 💡";
    }
}

// para selecionar uma nova palavra quando solicitado
function atualizarPalavra() {
    palavraDiv.textContent = palavraOculta.join("");
}

// para criar teclado
function criarTeclado() {
    const linhas = [
        "QWERTYUIOP",
        "ASDFGHJKL",
        "ZXCVBNM"
    ];
    linhas.forEach(linha => {
        const divLinha = document.createElement("div");
        linha.split("").forEach(letra => {
            const btn = document.createElement("button");
            btn.textContent = letra;
            btn.onclick = () => verificarLetra(letra, btn);
            divLinha.appendChild(btn);
        });
        tecladoDiv.appendChild(divLinha);
    });
}

// para ignorar o acento quando for comparar as letras
function removerAcento(letra) {
    return letra.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// comparar a letra escolhida com a palavra da rodada
function verificarLetra(letra, botao) {
    botao.disabled = true;
    // 🔥 verifica ignorando acento
    if (removerAcento(palavraSecreta).includes(letra)) {
        botao.style.backgroundColor = "#2ecc71";
        clickLetraTrue.play();
        botao.style.color = "white";
        palavraSecreta.split("").forEach((l, i) => {
            // 🔥 compara versão sem acento
            if (removerAcento(l) === letra) {
                palavraOculta[i] = l; // mantém o acento original
            }
        });
    } else {
        botao.style.backgroundColor = "#e74c3c";
        clickLetraFalse.play();
        botao.style.color = "white";
        erros++;
        desenharBoneco();
    }
    atualizarPalavra();
    verificarFim();
}


//===========================

function calcularPontuacao() {
    switch (erros) {
        case 0: return 100;
        case 1: return 50;
        case 2: return 40;
        case 3: return 30;
        case 4: return 20;
        case 5: return 10;
        default: return 0;
    }
}

// TOASTTTTTTTTTTTTTTTTTTTTT
function mostrarToastRodada(palavraAcertada, errosRodada, pontosRodada) {
    if (!toastRodada) return;

    const usuarioLogado = !!auth.currentUser;
    const textoPalavra = `Você acertou "${palavraAcertada}"`;

    if (usuarioLogado) {
        toastRodada.innerHTML = `
            <div class="toastTitulo">${textoPalavra}</div>
            <div class="toastInfo">Chutes errados: ${errosRodada} | +${pontosRodada} xp</div>
        `;
    } else {
        toastRodada.innerHTML = `
            <div class="toastTitulo">${textoPalavra}</div>
        `;
    }

    clearTimeout(timeoutToastRodada);

    toastRodada.classList.add("mostrar");

    timeoutToastRodada = setTimeout(() => {
        toastRodada.classList.remove("mostrar");
    }, 3000);
}

//===========================

async function verificarFim() {
    if (!palavraOculta.includes("_")) {
        const pontos = calcularPontuacao();

        await salvarVitoriaNoBanco(pontos);

        mostrarToastRodada(palavraSecreta, erros, pontos);

        desativarTeclado();

        setTimeout(() => {
            iniciarJogo();
        }, 1200);

    } else if (erros === maxErros) {
        gameOverOpen();
        reposta.textContent = "A palavra era: " + palavraSecreta;

        await salvarDerrotaNoBanco();

        desativarTeclado();
    }
}

// async function verificarFim() {
//     if (!palavraOculta.includes("_")) {
//         const pontos = calcularPontuacao();

//         // alert(pontos);
//         winOpen();
//         repostaWin.textContent = "Você acertou: " + palavraSecreta;

//         await salvarVitoriaNoBanco(pontos);

//         desativarTeclado();
//     } else if (erros === maxErros) {
//         gameOverOpen();
//         reposta.textContent = "A palavra era: " + palavraSecreta;

//         await salvarDerrotaNoBanco();

//         desativarTeclado();
//     }
// }



function desativarTeclado() {
    document.querySelectorAll("#teclado button").forEach(btn => btn.disabled = true);
}

function desenharForca() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(10, 230);
    ctx.lineTo(190, 230);
    ctx.moveTo(50, 230);
    ctx.lineTo(50, 20);
    ctx.lineTo(130, 20);
    ctx.lineTo(130, 50);
    ctx.stroke();

}

function desenharBoneco() {
    ctx.beginPath();
    ctx.strokeStyle = "white";
    switch (erros) {
        case 1: ctx.arc(130, 70, 20, 0, Math.PI * 2); break;
        case 2: ctx.moveTo(130, 90); ctx.lineTo(130, 150); break;
        case 3: ctx.moveTo(130, 100); ctx.lineTo(100, 130); break;
        case 4: ctx.moveTo(130, 100); ctx.lineTo(160, 130); break;
        case 5: ctx.moveTo(130, 150); ctx.lineTo(100, 180); break;
        case 6: ctx.moveTo(130, 150); ctx.lineTo(160, 180); break;
    }
    ctx.stroke();
}

function reiniciar() {
    iniciarJogo();
}

iniciarJogo();

// function salvarProgresso() {
//   localStorage.setItem("palavrasRestantes", JSON.stringify(palavrasDisponiveis));
// }

// function carregarProgresso() {
//   const salvas = localStorage.getItem("palavrasRestantes");

//   if (salvas) {
//     palavrasDisponiveis = JSON.parse(salvas);
//   } else {
//     palavrasDisponiveis = [...palavras];
//   }
// }

// function reiniciarLista() {
//   localStorage.removeItem("palavrasRestantes");
//   palavrasDisponiveis = [...palavras];
//   iniciarJogo();
// }

function winOpen(){
    let janelaOpen = document.getElementById("winFundo");
    janelaOpen.style.display = 'flex';
}

function winClose(){
    let janelaClose= document.getElementById("winFundo");
    janelaClose.style.display = 'none';
    iniciarJogo();
}

// abre janela Game Over
function gameOverOpen(){
    gameOver.play();
    let janelaOpen = document.getElementById("gameOverFundo");
    janelaOpen.style.display = 'flex';
}

// fechar janela Game Over
function gameOverClose(){
    let janelaClose= document.getElementById("gameOverFundo");
    janelaClose.style.display = 'none';
    iniciarJogo();
}

// alterar ícone de definir cor de fundo ao clicar
const mode = document.getElementById('mode_icon');
const backBlack = document.getElementById('fundo1');
mode.addEventListener('click', () => {
    if(mode.classList.contains('fa-moon')){
        mode.classList.remove('fa-moon');
        mode.classList.add('fa-sun');
        backBlack.classList.add('fundoBlack');
        conteudoPontos.style.color = 'white';
        textoEntrarComGoogle.style.color = 'white';
        return;
    }
    mode.classList.remove('fa-sun');
    mode.classList.add('fa-moon');
    backBlack.classList.remove('fundoBlack');
    conteudoPontos.style.color = '#114d63';
    textoEntrarComGoogle.style.color = '#114d63';
});

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
function atualizarInterfaceUsuario(user) {
    if (user) {
        // nomeJogador.textContent = user.email || "Logado";
        nomeJogador.textContent = usuarioAtual?.username || "carregando...";

        spanLoginGoogle.style.display = "none";
        spanLogoutGoogle.style.display = "flex";
        editNick.style.display = "flex";
        excluirContaa.style.display = "flex";
    } else {
        nomeJogador.textContent = "Modo visitante";

        spanLoginGoogle.style.display = "flex";
        spanLogoutGoogle.style.display = "none";
        editNick.style.display = "none";
        excluirContaa.style.display = "none";
    }
}

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
async function loginComGoogle() {
    try {
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error("Erro no login com Google:", error);
        alert("Não foi possível fazer login com Google.");
    }
}
spanLoginGoogle.addEventListener("click", loginComGoogle);

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
async function logoutGoogle() {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Erro ao fazer logout:", error);
        alert("Não foi possível sair da conta.");
    }
}
spanLogoutGoogle.addEventListener("click", logoutGoogle);

// alterar ícone do menu ao clicar para abrir ou fechar
const buttonMenu = document.getElementById('menu_icon');
const menuList = document.getElementById('menu-list');

buttonMenu.onclick = () => {
    menuList.classList.toggle("ativo");
    buttonMenu.classList.toggle('fa-bars');
    buttonMenu.classList.toggle('fa-xmark');
}

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
async function openRanking() {
//   if (!auth.currentUser) {
//     alert("Você precisa estar logado para acessar o ranking.");
//     return;
//   }
    
    await carregarRanking(modoOrdenacaoRanking);
    fundoRanking.classList.add("ativoFR");

    if (menuList.classList.contains("ativo")) {
        menuList.classList.remove("ativo");
    }

    buttonMenu.classList.remove("fa-xmark");
    buttonMenu.classList.add("fa-bars");
    movimentoRanking.play();
}

function closeRankingFunc() {
    fundoRanking.classList.remove("ativoFR");
    movimentoRanking.play();
}

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
rankingBtnMenu.addEventListener("click", openRanking);
closeRanking.addEventListener("click", closeRankingFunc);

// btnRankPontos.addEventListener("click", () => carregarRanking("pontos"));
// btnRankSequencia.addEventListener("click", () => carregarRanking("sequencia"));
// btnRankAcertos.addEventListener("click", () => carregarRanking("acertos"));


function atualizarBotoesRanking(modo) {
    btnRankPontos.classList.remove("ativoRank");
    btnRankSequencia.classList.remove("ativoRank");
    btnRankAcertos.classList.remove("ativoRank");

    if (modo === "pontos") btnRankPontos.classList.add("ativoRank");
    if (modo === "sequencia") btnRankSequencia.classList.add("ativoRank");
    if (modo === "acertos") btnRankAcertos.classList.add("ativoRank");
}

btnRankPontos.addEventListener("click", () => carregarRanking("pontos"));
btnRankSequencia.addEventListener("click", () => carregarRanking("sequencia"));
btnRankAcertos.addEventListener("click", () => carregarRanking("acertos"));

// buttonMenu.addEventListener('click', () => {
//     if(buttonMenu.classList.contains('fa-bars')){
//         buttonMenu.classList.remove('fa-bars');
//         buttonMenu.classList.add('fa-xmark');
//         menuList.classList.add('open');
//         return;
//     }
//     buttonMenu.classList.remove('fa-xmark');
//     buttonMenu.classList.add('fa-bars');
//     menuList.classList.remove('open');
// });

// abrir janela das regras
function openRegras(){
    // let openJanela = document.getElementById("fundoRegras");
    // openJanela.style.display = 'flex';
    alert('O que é dito a seguir só se aplica ao usuário logado com a conta google:\n\nSobre pontuações do ranking:\n- não errou letra: 100 xp\n- errou uma letra: 50 xp\n- errou duas letras: 40 xp\n- errou três letras: 30 xp\n- errou quatro letras: 20 xp\n- errou cinco letras: 10 xp\n- errou seis letras: 0 xp\n\nA pontuação (xp) vai se acumulando conforme você for jogando, bem como o n° total de acertos e maior sequência de acertos.\n\nO ranking possui três ordenações possíveis:\n 1ª) xp > maior sequência > total palavras certas\n 2ª) maior sequência > xp > total palavras certas\n 3ª) total palavras certas > xp > maior sequência\n\nO que vem depois de ">" se refere ao critério de desempate');
    buttonMenu.classList.remove('fa-xmark');
    buttonMenu.classList.add('fa-bars');
    menuList.classList.remove('open');
    menuList.classList.toggle("ativo");
}

// fechar janela das regras
function closeRegras(){
    let closeJanela = document.getElementById("fundoRegras");
    closeJanela.style.display = 'none';
}

// sobre o game
function sobre(){
    alert("Jogo da forca simples feito com objetivo do usuário exercitar a mente, além de ter um ranking como principal diferencial para que os usuários possam competir por posições. Detalhe: é necessário fazer o login com a conta google para participar do ranking.\n\nO jogo possui os seguintes temas:\n - objetos\n - alimentos\n - verbos\n - adjetivos\n - animais\n - profissões\n - países");
    buttonMenu.classList.remove('fa-xmark');
    buttonMenu.classList.add('fa-bars');
    menuList.classList.toggle("ativo");
}

// function openEditarNick(){
//     document.getElementById("modalNickEdit").style.display = 'flex';
//     menuList.classList.toggle("ativo");
//     buttonMenu.classList.toggle('fa-bars');
//     buttonMenu.classList.toggle('fa-xmark');
// }

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
function openEditarNick() {
    if (!auth.currentUser || !usuarioAtual) {
        return;
    }

    cadastroInicialObrigatorio = false;
    modoEdicaoUsername = true;

    cabecalhoEditNick.textContent = "EDITE SEU USERNAME";
    inputNick.value = usuarioAtual.username || "";
    inputNick.maxLength = 13;

    modalNickEdit.style.display = "flex";
    inputNick.focus();
    inputNick.select();

    if (menuList.classList.contains("ativo")) {
        menuList.classList.remove("ativo");
    }

    buttonMenu.classList.remove("fa-xmark");
    buttonMenu.classList.add("fa-bars");
}


// function closeEditarNick(){
//     document.getElementById("modalNickEdit").style.display = 'none';
// }

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
function closeEditarNick() {
  if (cadastroInicialObrigatorio) {
    return;
  }

  modalNickEdit.style.display = "none";
  modoEdicaoUsername = false;
}

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log("Usuário logado:", user.uid, user.email);

        await garantirDocumentoUsuario(user);
        await carregarEstatisticasUsuario(user.uid);

        atualizarInterfaceUsuario(user);

        if (user && usuarioAtual && usuarioAtual.username === "") {
            abrirCadastroInicialUsername();
        }

        conteudoPontos.style.display = 'inline';
        textoEntrarComGoogle.style.display = 'none'; 
        sequencia.style.display = 'inline';
    } else {
        usuarioAtual = null;
        cadastroInicialObrigatorio = false;
        modalNickEdit.style.display = "none";

        pontosAcumuladosUsuario = 0;
        palavrasAcertadasUsuario = 0;
        palavrasErradasUsuario = 0;
        melhorSequenciaUsuario = 0;
        sequenciaAtualUsuario = 0;

        atualizarTelaEstatisticas();
        atualizarInterfaceUsuario(null);

        console.log("Nenhum usuário logado.");

        conteudoPontos.style.display = 'none';
        textoEntrarComGoogle.style.display = 'inline'; 
        sequencia.style.display = 'none';
    }
});

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
function criarDadosIniciaisUsuario(user) {
    return {
        uid: user.uid,
        email: user.email || "",
        username: "",
        foto: user.photoURL || "",
        pontos: 0,
        palavrasAcertadas: 0,
        palavrasErradas: 0,
        melhorSequencia: 0,
        sequenciaAtual: 0,
        criadoEm: serverTimestamp()
    };
}

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
async function garantirDocumentoUsuario(user) {
    try {
        const usuarioRef = doc(db, "usuarios", user.uid);
        const usuarioSnap = await getDoc(usuarioRef);

        if (!usuarioSnap.exists()) {
            const dadosIniciais = criarDadosIniciaisUsuario(user);
            await setDoc(usuarioRef, dadosIniciais);
            console.log("Documento do usuário criado com sucesso.");
        } else {
          console.log("Usuário já existe no Firestore.");
        }
    } catch (error) {
      console.error("Erro ao garantir documento do usuário:", error);
    }
}

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
async function buscarDadosUsuario(uid) {
    try {
        const usuarioRef = doc(db, "usuarios", uid);
        const usuarioSnap = await getDoc(usuarioRef);

        if (usuarioSnap.exists()) {
            return usuarioSnap.data();
        }

        return null;
    } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
        return null;
    }
}

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
async function buscarUsuariosRanking() {
    try {
        const usuariosRef = collection(db, "usuarios");
        const snapshot = await getDocs(usuariosRef);

        const listaUsuarios = [];

        snapshot.forEach((docItem) => {
            const dados = docItem.data();

            if (dados.username) {
                listaUsuarios.push(dados);
            }
        });
        return listaUsuarios;
    } catch (error) {
        console.error("Erro ao buscar usuários do ranking:", error);
        return [];
    }
}

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
function ordenarUsuariosRanking(lista, modo) {
    const usuarios = [...lista];

    if (modo === "pontos") {
        usuarios.sort((a, b) => {
        if ((b.pontos || 0) !== (a.pontos || 0)) {
            return (b.pontos || 0) - (a.pontos || 0);
        }

        if ((b.melhorSequencia || 0) !== (a.melhorSequencia || 0)) {
            return (b.melhorSequencia || 0) - (a.melhorSequencia || 0);
        }

        return (b.palavrasAcertadas || 0) - (a.palavrasAcertadas || 0);
        });
    }

    if (modo === "sequencia") {
        usuarios.sort((a, b) => {
        if ((b.melhorSequencia || 0) !== (a.melhorSequencia || 0)) {
            return (b.melhorSequencia || 0) - (a.melhorSequencia || 0);
        }

        if ((b.pontos || 0) !== (a.pontos || 0)) {
            return (b.pontos || 0) - (a.pontos || 0);
        }

        return (b.palavrasAcertadas || 0) - (a.palavrasAcertadas || 0);
        });
    }

    if (modo === "acertos") {
        usuarios.sort((a, b) => {
        if ((b.palavrasAcertadas || 0) !== (a.palavrasAcertadas || 0)) {
            return (b.palavrasAcertadas || 0) - (a.palavrasAcertadas || 0);
        }

        if ((b.pontos || 0) !== (a.pontos || 0)) {
            return (b.pontos || 0) - (a.pontos || 0);
        }

        return (b.melhorSequencia || 0) - (a.melhorSequencia || 0);
        });
    }

    return usuarios;
}

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
function renderizarRanking(listaUsuarios, modo) {
  rankingLista.innerHTML = "";

  if (!listaUsuarios.length) {
    rankingLista.innerHTML = `<div class="itemRanking">Nenhum jogador no ranking ainda.</div>`;
    return;
  }

  const usuariosOrdenados = ordenarUsuariosRanking(listaUsuarios, modo);

    usuariosOrdenados.slice(0, 50).forEach((usuario, index) => {
        let textoInfo = "";

        if (modo === "pontos") {
            textoInfo = `${usuario.pontos || 0} xp`;
        }

        if (modo === "sequencia") {
            textoInfo = `${usuario.melhorSequencia || 0}`;
        }

        if (modo === "acertos") {
            textoInfo = `${usuario.palavrasAcertadas || 0}`;
        }

        const fotoPerfil = usuario.foto && usuario.foto !== ""
        ? usuario.foto
        : "imgs/trollfacetriste.png";

        const classeAtual =
        usuario.uid === auth.currentUser?.uid
        ? "itemRanking jogadorAtual"
        : "itemRanking";

        rankingLista.innerHTML += `
            <div class="${classeAtual}">

                <div class="rankingLinha">

                    <div class="posicaoRanking">
                        ${index + 1}º
                    </div>

                    <img 
                        src="${fotoPerfil}" 
                        class="fotoRanking"
                    >

                    <div class="nomeRanking">
                        ${usuario.username}
                    </div>

                    <div class="valorRanking">
                        ${textoInfo}
                    </div>

                </div>

            </div>
        `;
    });
}

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
async function carregarRanking(modo = "pontos") {
    modoOrdenacaoRanking = modo;

    atualizarBotoesRanking(modoOrdenacaoRanking);

    const usuarios = await buscarUsuariosRanking();
    renderizarRanking(usuarios, modoOrdenacaoRanking);
}

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
function aplicarEstatisticasDoUsuario() {
    pontosAcumuladosUsuario = Number(usuarioAtual?.pontos || 0);
    palavrasAcertadasUsuario = Number(usuarioAtual?.palavrasAcertadas || 0);
    palavrasErradasUsuario = Number(usuarioAtual?.palavrasErradas || 0);
    melhorSequenciaUsuario = Number(usuarioAtual?.melhorSequencia || 0);
    sequenciaAtualUsuario = Number(usuarioAtual?.sequenciaAtual || 0);
}

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
function atualizarTelaEstatisticas() {
    conteudoPontos.textContent = `${pontosAcumuladosUsuario} xp`;
    sequencia.value = `Sequência: ${sequenciaAtualUsuario}`;
}

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
async function carregarEstatisticasUsuario(uid) {
    usuarioAtual = await buscarDadosUsuario(uid);

    if (!usuarioAtual) return;

    aplicarEstatisticasDoUsuario();
    atualizarTelaEstatisticas();
}

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
async function salvarVitoriaNoBanco(pontosDaRodada) {
    const user = auth.currentUser;

    if (!user) return;

    try {
        sequenciaAtualUsuario += 1;

        if (sequenciaAtualUsuario > melhorSequenciaUsuario) {
            melhorSequenciaUsuario = sequenciaAtualUsuario;
        }

        pontosAcumuladosUsuario += pontosDaRodada;
        palavrasAcertadasUsuario += 1;

        const usuarioRef = doc(db, "usuarios", user.uid);

        await updateDoc(usuarioRef, {
            pontos: increment(pontosDaRodada),
            palavrasAcertadas: increment(1),
            sequenciaAtual: sequenciaAtualUsuario,
            melhorSequencia: melhorSequenciaUsuario
        });

        atualizarTelaEstatisticas();
            if (fundoRanking.classList.contains("ativoFR")) {
            await carregarRanking(modoOrdenacaoRanking);
        }
    } catch (error) {
        console.error("Erro ao salvar vitória no banco:", error);
    }
}

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
async function salvarDerrotaNoBanco() {
    const user = auth.currentUser;

    if (!user) return;

    try {
        sequenciaAtualUsuario = 0;
        palavrasErradasUsuario += 1;

        const usuarioRef = doc(db, "usuarios", user.uid);

        await updateDoc(usuarioRef, {
            palavrasErradas: increment(1),
            sequenciaAtual: 0
        });

        atualizarTelaEstatisticas();
        if (fundoRanking.classList.contains("ativoFR")) {
            await carregarRanking(modoOrdenacaoRanking);
        }
    } catch (error) {
        console.error("Erro ao salvar derrota no banco:", error);
    }
}

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
function abrirCadastroInicialUsername() {
    cadastroInicialObrigatorio = true;
    modoEdicaoUsername = false;

    cabecalhoEditNick.textContent = "CRIE SEU USERNAME";
    inputNick.value = "";
    inputNick.maxLength = 13;

    modalNickEdit.style.display = "flex";
    inputNick.focus();
}


//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
async function salvarUsername() {
    const user = auth.currentUser;

    if (!user) {
        alert("Você precisa estar logado.");
        return;
    }

    const username = inputNick.value.trim();

    if (username.length < 4 || username.length > 13) {
        alert("O username deve ter no mínimo 4 e no máximo 10 caracteres.");
        inputNick.focus();
        return;
    }

    try {
        const usuarioRef = doc(db, "usuarios", user.uid);

        await updateDoc(usuarioRef, {
        username: username
        });

        await carregarEstatisticasUsuario(user.uid);

        nomeJogador.textContent = usuarioAtual.username || "visitante";
        modalNickEdit.style.display = "none";
        cadastroInicialObrigatorio = false;
        modoEdicaoUsername = false;

        console.log("Username salvo com sucesso.");
    } catch (error) {
        console.error("Erro ao salvar username:", error);
        alert("Não foi possível salvar o username.");
    }
}

// salvar com enter
inputNick.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        salvarUsername();
    }
});

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
async function excluirConta() {
    const user = auth.currentUser;

    if (!user) {
        alert("Você precisa estar logado para excluir a conta.");
        return;
    }

    if (menuList.classList.contains("ativo")) {
        menuList.classList.remove("ativo");
    }

    buttonMenu.classList.remove("fa-xmark");
    buttonMenu.classList.add("fa-bars");

    const confirmarExclusao = confirm("Tem certeza que deseja excluir sua conta? Essa ação não poderá ser desfeita.");
    alert("Faça o login novamente para confirmar a exclusão!");

    if (!confirmarExclusao) {
        return;
    }

    const uid = user.uid;

    try {
        // reautentica primeiro
        await reauthenticateWithPopup(user, provider);

        // apaga do Firestore ENQUANTO ainda está autenticado
        const usuarioRef = doc(db, "usuarios", uid);
        await deleteDoc(usuarioRef);

        // agora apaga do Auth
        await deleteUser(user);

        // limpa estado local
        usuarioAtual = null;
        cadastroInicialObrigatorio = false;
        modoEdicaoUsername = false;

        pontosAcumuladosUsuario = 0;
        palavrasAcertadasUsuario = 0;
        palavrasErradasUsuario = 0;
        melhorSequenciaUsuario = 0;
        sequenciaAtualUsuario = 0;

        atualizarTelaEstatisticas();
        atualizarInterfaceUsuario(null);
        modalNickEdit.style.display = "none";

        alert("Conta excluída com sucesso.");
    } catch (error) {
        console.error("Erro ao excluir conta:", error);

        if (error.code === "auth/requires-recent-login") {
            alert("Por segurança, faça login novamente e tente excluir sua conta de novo.");
        } else if (error.code === "auth/popup-closed-by-user") {
            alert("A confirmação de login foi fechada antes da conclusão.");
        } else {
            alert("Não foi possível excluir a conta.");
        }
    }
}
excluirContaa.addEventListener("click", excluirConta);

// para torná-las globais novamente, pois as tags <scripts> presentes no final do body no html faz com que essas funções deixem de ser globais, o que torna inviável usar o onclick lá no html
window.winClose = winClose;
window.gameOverClose = gameOverClose;
window.winOpen = winOpen;
window.gameOverOpen = gameOverOpen;
window.openEditarNick = openEditarNick;
window.closeEditarNick = closeEditarNick;
window.salvarUsername = salvarUsername;
window.sobre = sobre;
window.openRegras = openRegras;
window.closeRegras = closeRegras;