class SistemaEnergia {
    constructor() {
        this.dispositivos = {
            sala: { nome: 'Sala', consumo: 0, status: false, limite: 200, consumoBase: 120 },
            quarto: { nome: 'Quarto', consumo: 0, status: false, limite: 150, consumoBase: 80 },
            cozinha: { nome: 'Cozinha', consumo: 0, status: false, limite: 600, consumoBase: 400 },
            banheiro: { nome: 'Banheiro', consumo: 0, status: false, limite: 100, consumoBase: 60 },
            quarto2: { nome: 'Quarto 2', consumo: 0, status: false, limite: 150, consumoBase: 80 },
            garagem: { nome: 'Garagem', consumo: 0, status: false, limite: 100, consumoBase: 50 }
        };
        
        this.consumoTotal = 0;
        this.statusEnergia = 'Normal';
        this.custoPorW = 0.00065;
        this.historicoConsumo = {};
        
        this.esp32IP = '';
        this.esp32Porta = 81;
        this.backendURL = '';
        this.socket = null;
        this.conectadoESP32 = false;
        
        for (let comodo in this.dispositivos) {
            this.historicoConsumo[comodo] = [];
        }
    }
    
    controlarDispositivo(comodo, acao) {
        if (this.conectadoESP32) {
            this.enviarComandoESP32(comodo, acao);
        } else {
            const dispositivo = this.dispositivos[comodo];
            
            if (acao === 'on') {
                dispositivo.status = true;
                dispositivo.consumo = dispositivo.consumoBase + Math.floor(Math.random() * 50);
            } else {
                dispositivo.status = false;
                dispositivo.consumo = 0;
            }
            
            this.atualizarInterface();
            this.atualizarGrafico();
            this.registrarHistorico(comodo);
            
            if (acao === 'on') {
                this.adicionarMensagemAssistente(`${dispositivo.nome} foi ligado(a). Consumo atual: ${dispositivo.consumo}W.`);
            } else {
                this.adicionarMensagemAssistente(`${dispositivo.nome} foi desligado(a).`);
            }
        }
    }
    
    controlarTodos(acao) {
        for (let comodo in this.dispositivos) {
            this.controlarDispositivo(comodo, acao);
        }
        
        if (acao === 'off') {
            this.adicionarMensagemAssistente("Todos os dispositivos foram desligados.");
        } else {
            this.adicionarMensagemAssistente("Todos os dispositivos foram ligados.");
        }
    }
    
    atualizarInterface() {
        this.consumoTotal = 0;
        for (let comodo in this.dispositivos) {
            this.consumoTotal += this.dispositivos[comodo].consumo;
        }
        
        this.statusEnergia = this.consumoTotal > 1000 ? 'Crítico' : 'Normal';
        
        const custoEstimado = this.consumoTotal * this.custoPorW * 24 * 30;
        
        document.getElementById('consumo-total').textContent = `${this.consumoTotal}W`;
        document.getElementById('status-energia').textContent = this.statusEnergia;
        document.getElementById('custo-estimado').textContent = `R$${custoEstimado.toFixed(2).replace('.', ',')}`;
        
        const statusElement = document.getElementById('status-energia');
        statusElement.style.color = this.statusEnergia === 'Crítico' ? '#ff5252' : '#4CAF50';
        
        for (let comodo in this.dispositivos) {
            const dispositivo = this.dispositivos[comodo];
            const elemento = document.getElementById(comodo);
            
            elemento.querySelector('.consumo').textContent = dispositivo.consumo;
            elemento.querySelector('.status').textContent = dispositivo.status ? 'Ligado' : 'Desligado';
            
            elemento.classList.remove('energia-baixa', 'energia-media', 'energia-alta');
            
            if (dispositivo.consumo < 100) {
                elemento.classList.add('energia-baixa');
            } else if (dispositivo.consumo < 300) {
                elemento.classList.add('energia-media');
            } else {
                elemento.classList.add('energia-alta');
            }
            
            if (dispositivo.consumo > dispositivo.limite) {
                elemento.style.border = '2px solid #ff5252';
            } else {
                elemento.style.border = 'none';
            }
        }
    }
    
    atualizarGrafico() {
        const grafico = document.getElementById('grafico');
        grafico.innerHTML = '';
        
        for (let comodo in this.dispositivos) {
            const dispositivo = this.dispositivos[comodo];
            const barra = document.createElement('div');
            barra.className = 'barra';
            
            const altura = Math.min(250, (dispositivo.consumo / 700) * 250);
            barra.style.height = `${altura}px`;
            
            if (dispositivo.consumo < 100) {
                barra.style.background = 'linear-gradient(to top, #4CAF50, #8BC34A)';
            } else if (dispositivo.consumo < 300) {
                barra.style.background = 'linear-gradient(to top, #FFC107, #FFEB3B)';
            } else {
                barra.style.background = 'linear-gradient(to top, #f44336, #ff9800)';
            }
            
            barra.setAttribute('data-consumo', `${dispositivo.consumo}W`);
            barra.setAttribute('data-comodo', dispositivo.nome);
            
            grafico.appendChild(barra);
        }
    }
    
    registrarHistorico(comodo) {
        const dispositivo = this.dispositivos[comodo];
        const timestamp = new Date().toISOString();
        
        this.historicoConsumo[comodo].push({
            timestamp: timestamp,
            consumo: dispositivo.consumo,
            status: dispositivo.status
        });
        
        if (this.historicoConsumo[comodo].length > 10) {
            this.historicoConsumo[comodo].shift();
        }
    }
    
    gerarRelatorio(tipo = 'todos') {
        let relatorio = '';
        const data = new Date().toLocaleString('pt-BR');
        
        if (tipo === 'todos') {
            relatorio = `
                <h3>Relatório Geral de Consumo de Energia</h3>
                <p><strong>Data:</strong> ${data}</p>
                <p><strong>Consumo Total:</strong> ${this.consumoTotal}W</p>
                <p><strong>Status da Energia:</strong> ${this.statusEnergia}</p>
                <p><strong>Custo Estimado (mensal):</strong> R$${(this.consumoTotal * this.custoPorW * 24 * 30).toFixed(2).replace('.', ',')}</p>
                <p><strong>Status ESP32:</strong> ${this.conectadoESP32 ? 'Conectado' : 'Desconectado'}</p>
                <hr>
                <h4>Detalhes por Cômodo:</h4>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <th style="border: 1px solid #ddd; padding: 8px;">Cômodo</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Consumo (W)</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Status</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Limite (W)</th>
                    </tr>
            `;
            
            for (let comodo in this.dispositivos) {
                const dispositivo = this.dispositivos[comodo];
                relatorio += `
                    <tr>
                        <td style="border: 1px solid #ddd; padding: 8px;">${dispositivo.nome}</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">${dispositivo.consumo}</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">${dispositivo.status ? 'Ligado' : 'Desligado'}</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">${dispositivo.limite}</td>
                    </tr>
                `;
            }
            
            relatorio += '</table>';
        } else {
            const dispositivo = this.dispositivos[tipo];
            relatorio = `
                <h3>Relatório do ${dispositivo.nome}</h3>
                <p><strong>Data:</strong> ${data}</p>
                <p><strong>Consumo Atual:</strong> ${dispositivo.consumo}W</p>
                <p><strong>Status:</strong> ${dispositivo.status ? 'Ligado' : 'Desligado'}</p>
                <p><strong>Limite de Consumo:</strong> ${dispositivo.limite}W</p>
                <p><strong>Consumo acima do limite:</strong> ${dispositivo.consumo > dispositivo.limite ? 'Sim' : 'Não'}</p>
                <p><strong>Custo Estimado (mensal):</strong> R$${(dispositivo.consumo * this.custoPorW * 24 * 30).toFixed(2).replace('.', ',')}</p>
                <p><strong>Fonte de Dados:</strong> ${this.conectadoESP32 ? 'ESP32' : 'Simulação'}</p>
                <hr>
                <h4>Histórico Recente:</h4>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <th style="border: 1px solid #ddd; padding: 8px;">Data/Hora</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Consumo (W)</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Status</th>
                    </tr>
            `;
            
            for (let registro of this.historicoConsumo[tipo]) {
                const dataHora = new Date(registro.timestamp).toLocaleString('pt-BR');
                relatorio += `
                    <tr>
                        <td style="border: 1px solid #ddd; padding: 8px;">${dataHora}</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">${registro.consumo}</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">${registro.status ? 'Ligado' : 'Desligado'}</td>
                    </tr>
                `;
            }
            
            relatorio += '</table>';
        }
        
        return relatorio;
    }
    
    gerarRelatorioTexto(tipo = 'todos') {
        let relatorio = '';
        const data = new Date().toLocaleString('pt-BR');
        
        if (tipo === 'todos') {
            relatorio = `RELATÓRIO GERAL DE CONSUMO DE ENERGIA\n\n`;
            relatorio += `Data: ${data}\n`;
            relatorio += `Consumo Total: ${this.consumoTotal}W\n`;
            relatorio += `Status da Energia: ${this.statusEnergia}\n`;
            relatorio += `Custo Estimado (mensal): R$${(this.consumoTotal * this.custoPorW * 24 * 30).toFixed(2).replace('.', ',')}\n`;
            relatorio += `Status ESP32: ${this.conectadoESP32 ? 'Conectado' : 'Desconectado'}\n\n`;
            relatorio += `DETALHES POR CÔMODO:\n\n`;
            
            for (let comodo in this.dispositivos) {
                const dispositivo = this.dispositivos[comodo];
                relatorio += `${dispositivo.nome}:\n`;
                relatorio += `  Consumo: ${dispositivo.consumo}W\n`;
                relatorio += `  Status: ${dispositivo.status ? 'Ligado' : 'Desligado'}\n`;
                relatorio += `  Limite: ${dispositivo.limite}W\n\n`;
            }
        } else {
            const dispositivo = this.dispositivos[tipo];
            relatorio = `RELATÓRIO DO ${dispositivo.nome.toUpperCase()}\n\n`;
            relatorio += `Data: ${data}\n`;
            relatorio += `Consumo Atual: ${dispositivo.consumo}W\n`;
            relatorio += `Status: ${dispositivo.status ? 'Ligado' : 'Desligado'}\n`;
            relatorio += `Limite de Consumo: ${dispositivo.limite}W\n`;
            relatorio += `Consumo acima do limite: ${dispositivo.consumo > dispositivo.limite ? 'Sim' : 'Não'}\n`;
            relatorio += `Custo Estimado (mensal): R$${(dispositivo.consumo * this.custoPorW * 24 * 30).toFixed(2).replace('.', ',')}\n`;
            relatorio += `Fonte de Dados: ${this.conectadoESP32 ? 'ESP32' : 'Simulação'}\n\n`;
            relatorio += `HISTÓRICO RECENTE:\n\n`;
            
            for (let registro of this.historicoConsumo[tipo]) {
                const dataHora = new Date(registro.timestamp).toLocaleString('pt-BR');
                relatorio += `${dataHora} - ${registro.consumo}W - ${registro.status ? 'Ligado' : 'Desligado'}\n`;
            }
        }
        
        return relatorio;
    }
    
    conectarESP32(ip, porta, backendURL) {
        this.esp32IP = ip;
        this.esp32Porta = porta;
        this.backendURL = backendURL;
        
        try {
            if (backendURL) {
                this.conectarViaBackend();
            } else {
                this.socket = new WebSocket(`ws://${ip}:${porta}`);
                
                this.socket.onopen = () => {
                    this.conectadoESP32 = true;
                    this.atualizarStatusESP32();
                    this.adicionarMensagemAssistente(`Conectado ao ESP32 (${ip}:${porta})`);
                    
                    this.socket.send(JSON.stringify({comando: "getStatus"}));
                };
                
                this.socket.onmessage = (event) => {
                    const dados = JSON.parse(event.data);
                    this.processarDadosESP32(dados);
                };
                
                this.socket.onerror = (error) => {
                    this.conectadoESP32 = false;
                    this.atualizarStatusESP32();
                    this.adicionarMensagemAssistente("Erro ao conectar com o ESP32.");
                };
                
                this.socket.onclose = () => {
                    this.conectadoESP32 = false;
                    this.atualizarStatusESP32();
                    this.adicionarMensagemAssistente("Conexão com ESP32 encerrada.");
                };
            }
            
        } catch (error) {
            console.error("Erro na conexão:", error);
            this.conectadoESP32 = false;
            this.atualizarStatusESP32();
        }
    }
    
    conectarViaBackend() {
        this.conectadoESP32 = true;
        this.atualizarStatusESP32();
        this.adicionarMensagemAssistente(`Conectado via backend (${this.backendURL})`);
        
        this.simularDadosESP32();
    }
    
    simularDadosESP32() {
        setInterval(() => {
            if (this.conectadoESP32) {
                for (let comodo in this.dispositivos) {
                    if (this.dispositivos[comodo].status) {
                        const variacao = Math.floor(Math.random() * 20) - 10;
                        this.dispositivos[comodo].consumo = Math.max(0, this.dispositivos[comodo].consumo + variacao);
                    }
                }
                this.atualizarInterface();
                this.atualizarGrafico();
            }
        }, 3000);
    }
    
    desconectarESP32() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        this.conectadoESP32 = false;
        this.atualizarStatusESP32();
        this.adicionarMensagemAssistente("Desconectado do ESP32.");
    }
    
    atualizarStatusESP32() {
        const indicator = document.getElementById('esp32-indicator');
        const statusText = document.getElementById('esp32-status-text');
        const connectionStatus = document.getElementById('esp32-connection-status');
        
        if (this.conectadoESP32) {
            indicator.classList.remove('status-disconnected');
            indicator.classList.add('status-connected');
            statusText.textContent = `ESP32: Conectado (${this.backendURL || this.esp32IP + ':' + this.esp32Porta})`;
            if (connectionStatus) {
                connectionStatus.textContent = `Conectado a ${this.backendURL || this.esp32IP + ':' + this.esp32Porta}`;
            }
        } else {
            indicator.classList.remove('status-connected');
            indicator.classList.add('status-disconnected');
            statusText.textContent = 'ESP32: Desconectado';
            if (connectionStatus) {
                connectionStatus.textContent = 'Não conectado';
            }
        }
    }
    
    enviarComandoESP32(comodo, acao) {
        if (this.conectadoESP32) {
            if (this.backendURL) {
                fetch(`${this.backendURL}/control`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        comodo: comodo,
                        acao: acao
                    })
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Resposta do backend:', data);
                })
                .catch(error => {
                    console.error('Erro ao enviar comando:', error);
                });
            } else if (this.socket) {
                const comando = {
                    tipo: "controle",
                    comodo: comodo,
                    acao: acao
                };
                this.socket.send(JSON.stringify(comando));
            }
        }
    }
    
    processarDadosESP32(dados) {
        if (dados.tipo === "sensores") {
            for (let comodo in dados.valores) {
                if (this.dispositivos[comodo]) {
                    this.dispositivos[comodo].consumo = dados.valores[comodo].consumo;
                    this.dispositivos[comodo].status = dados.valores[comodo].status;
                    this.registrarHistorico(comodo);
                }
            }
            this.atualizarInterface();
            this.atualizarGrafico();
        }
    }
    
    adicionarMensagemAssistente(mensagem) {
        const chatMessages = document.getElementById('chatbot-messages');
        const messageElement = document.createElement('div');
        messageElement.className = 'message bot-message';
        messageElement.textContent = mensagem;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

const sistemaEnergia = new SistemaEnergia();

function controlarDispositivo(comodo, acao) {
    sistemaEnergia.controlarDispositivo(comodo, acao);
}

function controlarTodos(acao) {
    sistemaEnergia.controlarTodos(acao);
}

function abrirModalRelatorio(tipo) {
    const modal = document.getElementById('relatorio-modal');
    const titulo = document.getElementById('relatorio-titulo');
    const conteudo = document.getElementById('relatorio-conteudo');
    
    if (tipo === 'todos') {
        titulo.textContent = 'Relatório Geral de Consumo';
    } else {
        const nomeComodo = sistemaEnergia.dispositivos[tipo].nome;
        titulo.textContent = `Relatório do ${nomeComodo}`;
    }
    
    conteudo.innerHTML = sistemaEnergia.gerarRelatorio(tipo);
    modal.style.display = 'flex';
}

function fecharModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function imprimirRelatorio() {
    window.print();
}

function baixarRelatorio() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Configurações do PDF
    doc.setFont('helvetica');
    doc.setFontSize(12);
    
    // Obter o tipo de relatório atual
    const titulo = document.getElementById('relatorio-titulo').textContent;
    const tipo = titulo.includes('Geral') ? 'todos' : titulo.toLowerCase().replace('relatório do ', '');
    
    // Adicionar título
    doc.setFontSize(18);
    doc.text(titulo, 105, 20, { align: 'center' });
    
    // Adicionar data
    doc.setFontSize(12);
    const data = new Date().toLocaleString('pt-BR');
    doc.text(`Data: ${data}`, 20, 35);
    
    // Gerar conteúdo do relatório
    const relatorioTexto = sistemaEnergia.gerarRelatorioTexto(tipo);
    const linhas = relatorioTexto.split('\n');
    
    let y = 50;
    linhas.forEach(linha => {
        if (y > 270) {
            doc.addPage();
            y = 20;
        }
        doc.text(linha, 20, y);
        y += 7;
    });
    
    // Salvar o PDF
    const nomeArquivo = `relatorio-${tipo}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(nomeArquivo);
    
    sistemaEnergia.adicionarMensagemAssistente(`Relatório ${nomeArquivo} baixado com sucesso!`);
}

function abrirModalEmail() {
    document.getElementById('email-modal').style.display = 'flex';
}

function enviarEmail() {
    const destinatario = document.getElementById('email-destinatario').value;
    const assunto = document.getElementById('email-assunto').value;
    const mensagem = document.getElementById('email-mensagem').value;
    const tipo = document.getElementById('email-tipo').value;
    const responseDiv = document.getElementById('email-response');
    
    // Validar formulário
    if (!destinatario) {
        responseDiv.innerHTML = '<div class="error-message">Por favor, informe o email do destinatário.</div>';
        return;
    }
    
    if (!assunto) {
        responseDiv.innerHTML = '<div class="error-message">Por favor, informe o assunto do email.</div>';
        return;
    }
    
    // Gerar relatório em texto
    const relatorioTexto = sistemaEnergia.gerarRelatorioTexto(tipo);
    
    // Mostrar indicador de carregamento
    const botaoEnviar = event.target;
    const textoOriginal = botaoEnviar.innerHTML;
    botaoEnviar.innerHTML = '<span class="loading"></span> Enviando...';
    botaoEnviar.disabled = true;
    
    // Limpar mensagens anteriores
    responseDiv.innerHTML = '';
    
    // Preparar dados para envio
    const formData = new FormData();
    formData.append('destinatario', destinatario);
    formData.append('assunto', assunto);
    formData.append('mensagem', mensagem);
    formData.append('relatorio', relatorioTexto);
    formData.append('tipo', tipo);
    formData.append('remetente', 'site@fixa.tech');
    
    // Enviar dados para o PHP
    fetch('enviar_email.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            responseDiv.innerHTML = '<div class="success-message">Email enviado com sucesso para ' + destinatario + '!</div>';
            sistemaEnergia.adicionarMensagemAssistente(`Email enviado para ${destinatario} com sucesso!`);
            
            // Limpar formulário após 3 segundos
            setTimeout(() => {
                document.getElementById('email-destinatario').value = '';
                document.getElementById('email-mensagem').value = '';
                fecharModal('email-modal');
            }, 3000);
        } else {
            responseDiv.innerHTML = '<div class="error-message">Erro ao enviar email: ' + data.message + '</div>';
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        responseDiv.innerHTML = '<div class="error-message">Erro ao enviar email. Tente novamente mais tarde.</div>';
    })
    .finally(() => {
        // Restaurar botão
        botaoEnviar.innerHTML = textoOriginal;
        botaoEnviar.disabled = false;
    });
}

function abrirModalESP32() {
    document.getElementById('esp32-modal').style.display = 'flex';
    
    if (sistemaEnergia.esp32IP) {
        document.getElementById('esp32-ip').value = sistemaEnergia.esp32IP;
    }
    document.getElementById('esp32-porta').value = sistemaEnergia.esp32Porta;
    if (sistemaEnergia.backendURL) {
        document.getElementById('backend-url').value = sistemaEnergia.backendURL;
    }
}

function conectarESP32() {
    const ip = document.getElementById('esp32-ip').value;
    const porta = document.getElementById('esp32-porta').value;
    const backendURL = document.getElementById('backend-url').value;
    
    if (!ip && !backendURL) {
        alert('Por favor, informe o endereço IP do ESP32 ou a URL do backend.');
        return;
    }
    
    sistemaEnergia.conectarESP32(ip, porta, backendURL);
    fecharModal('esp32-modal');
}

function desconectarESP32() {
    sistemaEnergia.desconectarESP32();
}

function toggleChatbot() {
    const chatbot = document.getElementById('chatbot-container');
    const toggle = document.getElementById('chatbot-toggle');
    
    if (chatbot.style.display === 'none') {
        chatbot.style.display = 'flex';
        toggle.style.display = 'none';
    } else {
        chatbot.style.display = 'none';
        toggle.style.display = 'flex';
    }
}

function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (message === '') return;
    
    const chatMessages = document.getElementById('chatbot-messages');
    const userMessageElement = document.createElement('div');
    userMessageElement.className = 'message user-message';
    userMessageElement.textContent = message;
    chatMessages.appendChild(userMessageElement);
    
    const response = processUserMessage(message);
    
    setTimeout(() => {
        const botMessageElement = document.createElement('div');
        botMessageElement.className = 'message bot-message';
        botMessageElement.textContent = response;
        chatMessages.appendChild(botMessageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 500);
    
    input.value = '';
}

function handleChatKeypress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

function processUserMessage(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('oi') || lowerMessage.includes('olá') || lowerMessage.includes('bom dia') || lowerMessage.includes('boa tarde') || lowerMessage.includes('boa noite')) {
        return "Olá! Como posso ajudar você com o consumo de energia hoje?";
    }
    
    if (lowerMessage.includes('dica') || lowerMessage.includes('economia') || lowerMessage.includes('economizar')) {
        const dicas = [
            "Desligue aparelhos em standby. Eles consomem energia mesmo quando não estão em uso.",
            "Substitua lâmpadas incandescentes por LED. Elas consomem até 80% menos energia.",
            "Use o ar condicionado com temperatura adequada (23-24°C) e mantenha portas e janelas fechadas.",
            "Evite abrir a geladeira com frequência. Verifique se a borracha de vedação está em bom estado.",
            "Tome banhos mais curtos e use chuveiros com a chave na posição 'verão' sempre que possível."
        ];
        return dicas[Math.floor(Math.random() * dicas.length)];
    }
    
    if (lowerMessage.includes('consumo total') || lowerMessage.includes('consumo geral')) {
        return `O consumo total atual é de ${sistemaEnergia.consumoTotal}W. O status da energia é ${sistemaEnergia.statusEnergia}.`;
    }
    
    if (lowerMessage.includes('esp32') || lowerMessage.includes('conexão') || lowerMessage.includes('hardware')) {
        if (sistemaEnergia.conectadoESP32) {
            return `O ESP32 está conectado em ${sistemaEnergia.backendURL || sistemaEnergia.esp32IP + ':' + sistemaEnergia.esp32Porta}. Os dados de consumo são reais.`;
        } else {
            return "O ESP32 não está conectado. O sistema está operando em modo de simulação. Você pode configurar a conexão no botão 'Configurar ESP32'.";
        }
    }
    
    for (let comodo in sistemaEnergia.dispositivos) {
        if (lowerMessage.includes(comodo)) {
            const dispositivo = sistemaEnergia.dispositivos[comodo];
            return `O ${dispositivo.nome} está ${dispositivo.status ? 'ligado' : 'desligado'} com consumo de ${dispositivo.consumo}W. O limite é ${dispositivo.limite}W.`;
        }
    }
    
    if (lowerMessage.includes('custo') || lowerMessage.includes('valor') || lowerMessage.includes('conta')) {
        const custoEstimado = sistemaEnergia.consumoTotal * sistemaEnergia.custoPorW * 24 * 30;
        return `O custo estimado mensal é de R$${custoEstimado.toFixed(2).replace('.', ',')} considerando o consumo atual.`;
    }
    
    if (lowerMessage.includes('alerta') || lowerMessage.includes('problema') || lowerMessage.includes('crítico')) {
        const alertas = [];
        
        for (let comodo in sistemaEnergia.dispositivos) {
            const dispositivo = sistemaEnergia.dispositivos[comodo];
            if (dispositivo.consumo > dispositivo.limite) {
                alertas.push(`${dispositivo.nome} está acima do limite (${dispositivo.consumo}W / ${dispositivo.limite}W)`);
            }
        }
        
        if (alertas.length > 0) {
            return "Atenção! Foram detectados os seguintes alertas:\n" + alertas.join("\n");
        } else {
            return "Não foram detectados alertas no momento. Todos os cômodos estão dentro dos limites de consumo.";
        }
    }
    
    if (lowerMessage.includes('ajuda') || lowerMessage.includes('comando') || lowerMessage.includes('o que você faz')) {
        return "Posso ajudar com:\n- Dicas de economia de energia\n- Informações sobre consumo de cada cômodo\n- Status geral do sistema\n- Cálculo de custos\n- Alertas de consumo\n- Status do ESP32\n\nExperimente perguntar: 'Qual o consumo da cozinha?' ou 'Me dê uma dica de economia'.";
    }
    
    return "Desculpe, não entendi sua pergunta. Você pode perguntar sobre dicas de economia, consumo de energia, status dos cômodos, custos ou o ESP32. Digite 'ajuda' para ver todos os comandos disponíveis.";
}

document.addEventListener('DOMContentLoaded', function() {
    sistemaEnergia.atualizarInterface();
    sistemaEnergia.atualizarGrafico();
    
    setTimeout(() => {
        sistemaEnergia.controlarDispositivo('sala', 'on');
        sistemaEnergia.controlarDispositivo('cozinha', 'on');
    }, 1000);
});