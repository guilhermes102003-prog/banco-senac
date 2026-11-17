// =========================================================================
// 1. DADOS EM MEMÓRIA
// =========================================================================
// Base de dados simulada contendo clientes pré-cadastrados para teste de login.
const clientes = [
    { cpf: "111.222.333-44", senha: "123", nome: "Dennis Lopes", saldo: 5000 },
    { cpf: "222.333.444-55", senha: "123", nome: "Nicolas Silva", saldo: 1500 },
    { cpf: "333.444.555-66", senha: "123", nome: "Ana Maria", saldo: 3000 },
    { cpf: "444.555.666-77", senha: "123", nome: "Bruno Costa", saldo: 500 },
    { cpf: "555.666.777-88", senha: "123", nome: "Carla Souza", saldo: 10000 }
];

// Variável de controle para armazenar o objeto do usuário que realizou o login com sucesso.
let usuarioLogado = null;

// =========================================================================
// 2. UTILITÁRIOS DE COOKIES (Exercício 1)
// =========================================================================
// Funções auxiliares para gravar, ler e remover dados persistentes no navegador (Cookies).

// Salva um cookie com nome, valor e tempo de expiração em dias
function salvarCookie(nome, valor, dias) {
    const segundos = dias * 24 * 60 * 60; // Converte dias para segundos (max-age)
    document.cookie = `${nome}=${encodeURIComponent(valor)}; max-age=${segundos}; path=/; SameSite=Lax`;
}

// Lê o valor de um cookie específico buscando pelo nome
function lerCookie(nome) {
    const cookies = document.cookie.split(';');
    for (let item of cookies) {
        const [chave, valor] = item.trim().split('=');
        if (chave === nome) return decodeURIComponent(valor);
    }
    return null;
}

// Apaga um cookie definindo o seu tempo de vida (max-age) como zero
function apagarCookie(nome) {
    document.cookie = `${nome}=; max-age=0; path=/;`;
}

// =========================================================================
// 3. SELEÇÃO DE ELEMENTOS DO DOM
// =========================================================================
// Mapeamento dos elementos HTML que serão manipulados via JavaScript.
const secaoLogin = document.querySelector('#login-section');
const secaoCadastro = document.querySelector('#cadastro-section');
const secaoSucesso = document.querySelector('#sucesso-section');
const secaoPainel = document.querySelector('#painel-section');

const campoSaldo = document.querySelector('#saldo-valor');
const boasVindas = document.querySelector('#boas-vindas');
const loginErro = document.querySelector('#login-erro');
const formCadastro = document.querySelector('#form-cadastro');
const cadastroErro = document.querySelector('#cadastro-erro');

// Função auxiliar para exibir mensagens de erro amigáveis no formulário de cadastro
function mostrarErroCadastro(mensagem, seletorInput) {
    cadastroErro.textContent = mensagem;
    cadastroErro.style.display = 'block';
    
    const inputFoco = document.querySelector(seletorInput);
    if (inputFoco) {
        inputFoco.focus(); // Foca no campo que apresentou o erro
        inputFoco.style.borderColor = '#dc3545'; // Destaca a borda em vermelho
        
        // Remove o destaque vermelho e esconde o erro assim que o usuário voltar a digitar
        inputFoco.addEventListener('input', () => {
            inputFoco.style.borderColor = '#ddd';
            cadastroErro.style.display = 'none';
        }, { once: true });
    }
}

// =========================================================================
// 4. AUTO-SAVE DE CADASTRO COM LOCALSTORAGE E TTL (Exercício 2)
// =========================================================================
// Define o tempo de validade do rascunho em milissegundos (60 segundos para testes)
const TEMPO_VALIDADE_RASCUNHO_MS = 60 * 1000; 

// Evento disparado sempre que o usuário digita algo no formulário de cadastro (Auto-save)
formCadastro.addEventListener('input', () => {
    const rascunho = {
        dados: {
            nome: document.querySelector('#cad-nome').value,
            cpf: document.querySelector('#cad-cpf').value,
            email: document.querySelector('#cad-email').value,
            celular: document.querySelector('#cad-celular').value,
            cep: document.querySelector('#cad-cep').value,
            endereco: document.querySelector('#cad-endereco').value,
            cidade: document.querySelector('#cad-cidade').value,
            estado: document.querySelector('#cad-estado').value
        },
        timestamp: Date.now() // Armazena o momento exato em que o rascunho foi salvo
    };
    // Salva os dados convertidos em JSON no LocalStorage do navegador
    localStorage.setItem('senac_rascunho_cadastro', JSON.stringify(rascunho));
});

// Função para restaurar o rascunho salvo, verificando se ele já expirou (TTL)
function restaurarRascunho() {
    const dadosSalvos = localStorage.getItem('senac_rascunho_cadastro');
    if (!dadosSalvos) return;

    const rascunho = JSON.parse(dadosSalvos);
    const tempoDecorrido = Date.now() - rascunho.timestamp;

    // Se o tempo decorrido for maior que o permitido, descarta o rascunho
    if (tempoDecorrido > TEMPO_VALIDADE_RASCUNHO_MS) {
        console.warn('Rascunho expirado por limite de tempo.');
        localStorage.removeItem('senac_rascunho_cadastro');
        return;
    }

    // Preenche os campos do formulário com os dados salvos anteriormente
    const d = rascunho.dados;
    document.querySelector('#cad-nome').value = d.nome || '';
    document.querySelector('#cad-cpf').value = d.cpf || '';
    document.querySelector('#cad-email').value = d.email || '';
    document.querySelector('#cad-celular').value = d.celular || '';
    document.querySelector('#cad-cep').value = d.cep || '';
    document.querySelector('#cad-endereco').value = d.endereco || '';
    document.querySelector('#cad-cidade').value = d.cidade || '';
    document.querySelector('#cad-estado').value = d.estado || '';
}

// Botão para limpar/descartar manualmente o rascunho salvo no LocalStorage
document.querySelector('#link-limpar-rascunho').addEventListener('click', (e) => {
    e.preventDefault();
    if (confirm('Deseja descartar todos os dados preenchidos deste rascunho?')) {
        localStorage.removeItem('senac_rascunho_cadastro');
        formCadastro.reset();
    }
});

// =========================================================================
// 5. NAVEGAÇÃO ENTRE TELAS
// =========================================================================
// Controla a visibilidade das seções (SPA - Single Page Application simples)

document.querySelector('#link-ir-cadastro').addEventListener('click', (e) => {
    e.preventDefault();
    restaurarRascunho(); // Tenta restaurar rascunho ao abrir a tela de cadastro
    secaoLogin.style.display = 'none';
    secaoCadastro.style.display = 'block';
});

document.querySelector('#link-voltar-login').addEventListener('click', (e) => {
    e.preventDefault();
    secaoCadastro.style.display = 'none';
    secaoLogin.style.display = 'block';
});

document.querySelector('#btn-voltar-inicio').addEventListener('click', () => {
    location.reload(); // Recarrega a página para reiniciar o fluxo
});

document.querySelector('#btn-sair').addEventListener('click', () => {
    location.reload(); // Encerra a sessão e recarrega
});

// =========================================================================
// 6. EVENTOS DE LOGIN (COM GRAVAÇÃO DE COOKIES)
// =========================================================================
// Valida as credenciais digitadas comparando com o array estático de clientes
document.querySelector('#btn-login').addEventListener('click', () => {
    const cpfDigitado = document.querySelector('#input-cpf').value.trim();
    const senhaDigitada = document.querySelector('#input-senha').value.trim();

    const clienteEncontrado = clientes.find(c => c.cpf === cpfDigitado && c.senha === senhaDigitada);

    if (clienteEncontrado) {
        usuarioLogado = clienteEncontrado;
        loginErro.style.display = 'none';

        // Coleta dados para gravar nos cookies (lembrar usuário e último acesso)
        const primeiroNome = clienteEncontrado.nome.split(' ')[0];
        const agora = new Date().toLocaleString('pt-BR');

        salvarCookie('senac_cpf', clienteEncontrado.cpf, 30);
        salvarCookie('senac_nome', primeiroNome, 30);
        salvarCookie('senac_ultimo_acesso', agora, 30);

        // Altera a visualização para o painel logado
        secaoLogin.style.display = 'none';
        secaoPainel.style.display = 'block';

        campoSaldo.textContent = `R$ ${usuarioLogado.saldo.toFixed(2)}`;
        boasVindas.textContent = `Olá, ${usuarioLogado.nome}`;
    } else {
        loginErro.style.display = 'block'; // Mostra mensagem de erro de login
    }
});

// =========================================================================
// 7. SUBMISSÃO DE CADASTRO (EXERCÍCIO DE REGEX + POST ASYNC/AWAIT)
// =========================================================================
formCadastro.addEventListener('submit', async (e) => {
    e.preventDefault(); // Evita o recarregamento padrão do formulário

    // Esconde qualquer erro anterior ao tentar enviar novamente
    cadastroErro.style.display = 'none';

    // Coleta os valores digitados em cada campo
    const nome = document.querySelector('#cad-nome').value.trim();
    const cpf = document.querySelector('#cad-cpf').value.trim();
    const email = document.querySelector('#cad-email').value.trim();
    const celular = document.querySelector('#cad-celular').value.trim();
    const cep = document.querySelector('#cad-cep').value.trim();
    const endereco = document.querySelector('#cad-endereco').value.trim();
    const cidade = document.querySelector('#cad-cidade').value.trim();
    const estado = document.querySelector('#cad-estado').value.trim();
    const senha = document.querySelector('#cad-senha').value.trim();
    const confirmaSenha = document.querySelector('#cad-confirma-senha').value.trim();

    // =====================================================================
    // ÁREA DE EXERCÍCIO DOS ALUNOS: ESCREVER AS EXPRESSÕES REGULARES (REGEX)
    // =====================================================================

    // 1. Validação do Nome Completo (Deve conter ao menos nome e sobrenome)
    const regexNome = /^[A-Za-zÀ-ÖØ-öø-ÿ]+(\s+[A-Za-zÀ-ÖØ-öø-ÿ]+)+$/; // TODO: Escrever a Regex para nome completo
    if (!regexNome.test(nome)) {
        mostrarErroCadastro("Por favor, insira o nome completo (Nome e Sobrenome).", '#cad-nome');
        return;
    }

    // 2. Validação do CPF (Com ou sem pontos e hífen: 000.000.000-00 ou 11 dígitos seguidos)
    const regexCpf = /^(\d{3}\.\d{3}\.\d{3}-\d{2}|\d{11})$/; // TODO: Escrever a Regex para CPF
    if (!regexCpf.test(cpf)) {
        mostrarErroCadastro("CPF inválido! Digite apenas os números ou use o formato 000.000.000-00.", '#cad-cpf');
        return;
    }

    // 3. Validação de E-mail (Formato padrão: texto@texto.texto)
    const regexEmail = /^[\w.+-]+@[\w-]+(\.[\w-]+)+$/; // TODO: Escrever a Regex para E-mail
    if (!regexEmail.test(email)) {
        mostrarErroCadastro("E-mail inválido! Verifique o endereço digitado.", '#cad-email');
        return;
    }

    // 4. Validação de Celular (Com DDD, parênteses e hífen opcionais)
    const regexCelular = /^(\(\d{2}\)|\d{2})\s?\d{5}[-\s]?\d{4}$/;
    // TODO: Escrever a Regex para Celular
    if (!regexCelular.test(celular)) {
        mostrarErroCadastro("Celular inválido! Ex: (11) 99999-9999 ou 11999999999.", '#cad-celular');
        return;
    }

    // 5. Validação de CEP (Formato exato: 00000-000)
    const regexCep = /^\d{5}-?\d{3}$/; // TODO: Escrever a Regex para CEP
    if (!regexCep.test(cep)) {
        mostrarErroCadastro("CEP inválido! Utilize o formato 00000-000.", '#cad-cep');
        return;
    }

    // 6. Validação de Senha (Mínimo 8 caracteres, com letra maiúscula, minúscula e número)
    const regexSenha = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/; // TODO: Escrever a Regex para Senha forte
    if (!regexSenha.test(senha)) {
        mostrarErroCadastro("A senha deve ter no mínimo 8 caracteres, contendo letras maiúsculas, minúsculas e números.", '#cad-senha');
        return;
    }

    // 7. Confirmação de Senha (Verifica se os dois campos de senha coincidem)
    if (senha !== confirmaSenha) {
        mostrarErroCadastro("As senhas não coincidem!", '#cad-confirma-senha');
        return;
    }

    // Se passou por todas as validações, prossegue com o envio (POST) assíncrono para a API
    const novoCliente = { nome, cpf, email, celular, cep, endereco, cidade, estado, senha };

    try {
        const resposta = await fetch('https://senac-bank-api.dennislopes.com.br/api/clientes', {
            method: 'POST',
            headers: { 'accept': '*/*', 'Content-Type': 'application/json' },
            body: JSON.stringify(novoCliente)
        });

        if (!resposta.ok) {
            throw new Error(`Erro ao registar cliente: Status ${resposta.status}`);
        }

        const dadosResposta = await resposta.json();
        console.log("Registo efetuado com sucesso na API:", dadosResposta);

        // Limpa o rascunho do LocalStorage e reseta o formulário após o sucesso
        localStorage.removeItem('senac_rascunho_cadastro');
        formCadastro.reset();

        // Altera para a tela de sucesso
        secaoCadastro.style.display = 'none';
        secaoSucesso.style.display = 'block';

    } catch (erro) {
        console.error("Erro na requisição POST:", erro.message);
        mostrarErroCadastro("Ocorreu um erro ao comunicar com o servidor. Tente novamente mais tarde.", '#cad-nome');
    }
});

// =========================================================================
// 8. INICIALIZAÇÃO DA PÁGINA (LEITURA DE COOKIES)
// =========================================================================
// Verifica ao carregar a página se existem cookies salvos para reconhecer o usuário anterior
function verificarReconhecimento() {
    const cpfSalvo = lerCookie('senac_cpf');
    const nomeSalvo = lerCookie('senac_nome');
    const ultimoAcesso = lerCookie('senac_ultimo_acesso');
    const subtitulo = document.querySelector('#login-section .subtitle');

    if (cpfSalvo && nomeSalvo) {
        // Preenche automaticamente o CPF salvo
        document.querySelector('#input-cpf').value = cpfSalvo;

        // Customiza a interface de boas-vindas com base nos dados do Cookie
        subtitulo.innerHTML = `Que bom ter você de volta, <strong>${nomeSalvo}</strong>!<br>
            <small style="color: #6c757d;">Último acesso: ${ultimoAcesso || 'Primeiro acesso'}</small><br>
            <a href="#" id="link-trocar-usuario" style="font-size: 0.75rem; color: #0056b3; font-weight: bold;">
                Não é você? Trocar de conta
            </a>`;

        document.querySelector('#input-senha').focus(); // Foca direto no campo de senha

        // Permite ao usuário limpar os cookies caso queira entrar com outra conta
        document.querySelector('#link-trocar-usuario').addEventListener('click', (e) => {
            e.preventDefault();
            apagarCookie('senac_cpf');
            apagarCookie('senac_nome');
            apagarCookie('senac_ultimo_acesso');

            document.querySelector('#input-cpf').value = '';
            document.querySelector('#input-senha').value = '';
            subtitulo.textContent = 'Portal do Cliente';
            document.querySelector('#input-cpf').focus();
        });
    }
}

// Dispara a verificação de reconhecimento assim que o DOM estiver completamente carregado
window.addEventListener('DOMContentLoaded', () => {
    verificarReconhecimento();
});
