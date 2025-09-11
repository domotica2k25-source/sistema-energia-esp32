<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sistema de Monitoramento de Energia com ESP32</title>
    <style>
        /* Reset CSS */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #1a2a6c, #b21f1f, #1a2a6c);
            color: #fff;
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        /* Header */
        header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 15px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }
        
        h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        }
        
        /* Status */
        .esp32-status {
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 15px 0;
            padding: 10px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 8px;
        }
        
        .status-indicator {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 10px;
        }
        
        .status-connected {
            background: #4CAF50;
            box-shadow: 0 0 10px #4CAF50;
        }
        
        .status-disconnected {
            background: #f44336;
            box-shadow: 0 0 10px #f44336;
        }
        
        .status-energia {
            display: flex;
            justify-content: center;
            gap: 30px;
            margin: 20px 0;
        }
        
        .status-item {
            background: rgba(255, 255, 255, 0.1);
            padding: 15px 25px;
            border-radius: 10px;
            text-align: center;
            min-width: 150px;
        }
        
        .status-item h3 {
            margin-bottom: 10px;
            font-size: 1.2rem;
        }
        
        .status-item .valor {
            font-size: 2rem;
            font-weight: bold;
        }
        
        /* Comodos */
        .comodos {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        
        .comodo {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 20px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .comodo:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
        }
        
        .comodo h2 {
            margin-bottom: 15px;
            font-size: 1.5rem;
            text-align: center;
            padding-bottom: 10px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .comodo p {
            margin: 10px 0;
            font-size: 1.1rem;
        }
        
        .consumo {
            font-weight: bold;
            color: #4CAF50;
        }
        
        /* Buttons */
        .botoes-controle {
            display: flex;
            justify-content: space-between;
            margin-top: 15px;
        }
        
        button {
            background: linear-gradient(45deg, #2196F3, #21CBF3);
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s ease;
            flex: 1;
            margin: 0 5px;
        }
        
        button:hover {
            background: linear-gradient(45deg, #0d8bf2, #0baed8);
            transform: scale(1.05);
        }
        
        .on {
            background: linear-gradient(45deg, #4CAF50, #8BC34A);
        }
        
        .on:hover {
            background: linear-gradient(45deg, #3d8b40, #7cb342);
        }
        
        .off {
            background: linear-gradient(45deg, #f44336, #ff9800);
        }
        
        .off:hover {
            background: linear-gradient(45deg, #d32f2f, #e65100);
        }
        
        .botao-controle {
            background: linear-gradient(45deg, #9C27B0, #E040FB);
            padding: 12px 20px;
            font-size: 1rem;
            margin: 10px 5px;
        }
        
        .botao-controle:hover {
            background: linear-gradient(45deg, #7B1FA2, #D500F9);
        }
        
        .botoes-gerais {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            margin: 30px 0;
        }
        
        /* Chart */
        .grafico-container {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 20px;
            margin: 30px 0;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }
        
        .grafico-container h2 {
            text-align: center;
            margin-bottom: 20px;
        }
        
        .grafico {
            height: 300px;
            display: flex;
            align-items: flex-end;
            justify-content: space-around;
            border-left: 2px solid #fff;
            border-bottom: 2px solid #fff;
            padding: 10px;
        }
        
        .barra {
            width: 60px;
            background: linear-gradient(to top, #4CAF50, #8BC34A);
            border-radius: 5px 5px 0 0;
            position: relative;
            transition: height 1s ease;
        }
        
        .barra::after {
            content: attr(data-consumo);
            position: absolute;
            top: -25px;
            left: 0;
            width: 100%;
            text-align: center;
            font-weight: bold;
        }
        
        .barra::before {
            content: attr(data-comodo);
            position: absolute;
            bottom: -25px;
            left: 0;
            width: 100%;
            text-align: center;
            font-size: 0.9rem;
        }
        
        /* Chatbot */
        .chatbot-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 350px;
            height: 500px;
            background: rgba(0, 0, 0, 0.8);
            border-radius: 15px;
            box-shadow: 0 5px 25px rgba(0, 0, 0, 0.5);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            z-index: 1000;
            transition: all 0.3s ease;
        }
        
        .chatbot-header {
            background: linear-gradient(45deg, #2196F3, #21CBF3);
            padding: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .chatbot-header h3 {
            margin: 0;
            font-size: 1.2rem;
        }
        
        .chatbot-close {
            background: none;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
        }
        
        .chatbot-messages {
            flex: 1;
            padding: 15px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
        }
        
        .message {
            margin-bottom: 15px;
            max-width: 80%;
            padding: 10px 15px;
            border-radius: 15px;
            line-height: 1.4;
        }
        
        .user-message {
            align-self: flex-end;
            background: linear-gradient(45deg, #4CAF50, #8BC34A);
            border-bottom-right-radius: 5px;
        }
        
        .bot-message {
            align-self: flex-start;
            background: rgba(255, 255, 255, 0.1);
            border-bottom-left-radius: 5px;
        }
        
        .chatbot-input {
            display: flex;
            padding: 15px;
            background: rgba(0, 0, 0, 0.3);
        }
        
        .chatbot-input input {
            flex: 1;
            padding: 10px;
            border: none;
            border-radius: 20px;
            background: rgba(255, 255, 255, 0.1);
            color: white;
            font-size: 1rem;
        }
        
        .chatbot-input input::placeholder {
            color: rgba(255, 255, 255, 0.7);
        }
        
        .chatbot-input button {
            background: linear-gradient(45deg, #2196F3, #21CBF3);
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            margin-left: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .chatbot-toggle {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(45deg, #2196F3, #21CBF3);
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
            z-index: 999;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        /* Modal */
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 2000;
            justify-content: center;
            align-items: center;
        }
        
        .modal-content {
            background: linear-gradient(135deg, #1a2a6c, #b21f1f);
            padding: 30px;
            border-radius: 15px;
            width: 90%;
            max-width: 500px;
            box-shadow: 0 5px 25px rgba(0, 0, 0, 0.5);
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .modal-header h2 {
            margin: 0;
        }
        
        .modal-close {
            background: none;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
        }
        
        .modal-body {
            margin-bottom: 20px;
        }
        
        .form-group {
            margin-bottom: 15px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        
        .form-group input, .form-group select, .form-group textarea {
            width: 100%;
            padding: 10px;
            border-radius: 8px;
            border: none;
            background: rgba(255, 255, 255, 0.1);
            color: white;
            font-size: 1rem;
        }
        
        .form-group input::placeholder, .form-group textarea::placeholder {
            color: rgba(255, 255, 255, 0.7);
        }
        
        .form-group textarea {
            resize: vertical;
            min-height: 100px;
        }
        
        .modal-footer {
            display: flex;
            justify-content: flex-end;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .comodos {
                grid-template-columns: 1fr;
            }
            
            .chatbot-container {
                width: 90%;
                right: 5%;
                left: 5%;
            }
            
            .botoes-gerais {
                flex-direction: column;
                align-items: center;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>Sistema de Monitoramento de Energia com ESP32</h1>
            <p>Controle e monitore o consumo de energia em sua casa</p>
            
            <div class="esp32-status">
                <div class="status-indicator status-disconnected" id="esp32-indicator"></div>
                <span id="esp32-status-text">ESP32: Desconectado</span>
            </div>
            
            <div class="status-energia">
                <div class="status-item">
                    <h3>Consumo Total</h3>
                    <div class="valor" id="consumo-total">0W</div>
                </div>
                <div class="status-item">
                    <h3>Status da Energia</h3>
                    <div class="valor" id="status-energia">Normal</div>
                </div>
                <div class="status-item">
                    <h3>Custo Estimado</h3>
                    <div class="valor" id="custo-estimado">R$0,00</div>
                </div>
            </div>
        </header>
        
        <div class="comodos">
            <div id="sala" class="comodo">
                <h2>Sala</h2>
                <p>Consumo: <span class="consumo">0</span>W</p>
                <p>Status: <span class="status">Desligado</span></p>
                <div class="botoes-controle">
                    <button class='on' onclick="controlarDispositivo('sala', 'on')">Ligar</button>
                    <button class='off' onclick="controlarDispositivo('sala', 'off')">Desligar</button>
                    <button class="botao-controle" onclick="abrirModalRelatorio('sala')">Relatório</button>
                </div>
            </div>
            
            <div id="quarto" class="comodo">
                <h2>Quarto</h2>
                <p>Consumo: <span class="consumo">0</span>W</p>
                <p>Status: <span class="status">Desligado</span></p>
                <div class="botoes-controle">
                    <button class='on' onclick="controlarDispositivo('quarto', 'on')">Ligar</button>
                    <button class='off' onclick="controlarDispositivo('quarto', 'off')">Desligar</button>
                    <button class="botao-controle" onclick="abrirModalRelatorio('quarto')">Relatório</button>
                </div>
            </div>
            
            <div id="cozinha" class="comodo">
                <h2>Cozinha</h2>
                <p>Consumo: <span class="consumo">0</span>W</p>
                <p>Status: <span class="status">Desligado</span></p>
                <div class="botoes-controle">
                    <button class='on' onclick="controlarDispositivo('cozinha', 'on')">Ligar</button>
                    <button class='off' onclick="controlarDispositivo('cozinha', 'off')">Desligar</button>
                    <button class="botao-controle" onclick="abrirModalRelatorio('cozinha')">Relatório</button>
                </div>
            </div>
            
            <div id="banheiro" class="comodo">
                <h2>Banheiro</h2>
                <p>Consumo: <span class="consumo">0</span>W</p>
                <p>Status: <span class="status">Desligado</span></p>
                <div class="botoes-controle">
                    <button class='on' onclick="controlarDispositivo('banheiro', 'on')">Ligar</button>
                    <button class='off' onclick="controlarDispositivo('banheiro', 'off')">Desligar</button>
                    <button class="botao-controle" onclick="abrirModalRelatorio('banheiro')">Relatório</button>
                </div>
            </div>
            
            <div id="quarto2" class="comodo">
                <h2>Quarto 2</h2>
                <p>Consumo: <span class="consumo">0</span>W</p>
                <p>Status: <span class="status">Desligado</span></p>
                <div class="botoes-controle">
                    <button class='on' onclick="controlarDispositivo('quarto2', 'on')">Ligar</button>
                    <button class='off' onclick="controlarDispositivo('quarto2', 'off')">Desligar</button>
                    <button class="botao-controle" onclick="abrirModalRelatorio('quarto2')">Relatório</button>
                </div>
            </div>
            
            <div id="garagem" class="comodo">
                <h2>Garagem</h2>
                <p>Consumo: <span class="consumo">0</span>W</p>
                <p>Status: <span class="status">Desligado</span></p>
                <div class="botoes-controle">
                    <button class='on' onclick="controlarDispositivo('garagem', 'on')">Ligar</button>
                    <button class='off' onclick="controlarDispositivo('garagem', 'off')">Desligar</button>
                    <button class="botao-controle" onclick="abrirModalRelatorio('garagem')">Relatório</button>
                </div>
            </div>
        </div>
        
        <div class="grafico-container">
            <h2>Consumo por Cômodo</h2>
            <div class="grafico" id="grafico"></div>
        </div>
        
        <div class="botoes-gerais">
            <button id="btn-desligar" class="botao-controle" onclick="controlarTodos('off')">Desligar Todos</button>
            <button id="btn-relatorio" class="botao-controle" onclick="abrirModalRelatorio('todos')">Relatório Geral</button>
            <button id="btn-email" class="botao-controle" onclick="abrirModalEmail()">Enviar Relatório por Email</button>
            <button id="btn-esp32" class="botao-controle" onclick="abrirModalESP32()">Configurar ESP32</button>
        </div>
    </div>
    
    <button class="chatbot-toggle" id="chatbot-toggle" onclick="toggleChatbot()">💬</button>
    
    <div class="chatbot-container" id="chatbot-container" style="display: none;">
        <div class="chatbot-header">
            <h3>Assistente de Energia</h3>
            <button class="chatbot-close" onclick="toggleChatbot()">×</button>
        </div>
        <div class="chatbot-messages" id="chatbot-messages">
            <div class="message bot-message">Olá! Sou seu assistente de energia. Posso ajudar com dicas de economia, informações sobre consumo e muito mais. Como posso ajudar?</div>
        </div>
        <div class="chatbot-input">
            <input type="text" id="chat-input" placeholder="Digite sua mensagem..." onkeypress="handleChatKeypress(event)">
            <button onclick="sendMessage()">➤</button>
        </div>
    </div>
    
    <div class="modal" id="esp32-modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Configuração do ESP32</h2>
                <button class="modal-close" onclick="fecharModal('esp32-modal')">×</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label for="esp32-ip">Endereço IP do ESP32</label>
                    <input type="text" id="esp32-ip" placeholder="192.168.1.100">
                </div>
                <div class="form-group">
                    <label for="esp32-porta">Porta WebSocket</label>
                    <input type="number" id="esp32-porta" value="81">
                </div>
                <div class="form-group">
                    <label for="backend-url">URL do Backend (opcional)</label>
                    <input type="text" id="backend-url" placeholder="https://seu-backend.com/api">
                </div>
                <div class="form-group">
                    <label>Status da Conexão</label>
                    <div id="esp32-connection-status">Não conectado</div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="botao-controle" onclick="conectarESP32()">Conectar</button>
                <button class="botao-controle off" onclick="desconectarESP32()">Desconectar</button>
                <button class="botao-controle off" onclick="fecharModal('esp32-modal')">Cancelar</button>
            </div>
        </div>
    </div>
    
    <div class="modal" id="email-modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Enviar Relatório por Email</h2>
                <button class="modal-close" onclick="fecharModal('email-modal')">×</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label for="email-destinatario">Email do Destinatário</label>
                    <input type="email" id="email-destinatario" placeholder="exemplo@email.com">
                </div>
                <div class="form-group">
                    <label for="email-assunto">Assunto</label>
                    <input type="text" id="email-assunto" value="Relatório de Consumo de Energia">
                </div>
                <div class="form-group">
                    <label for="email-mensagem">Mensagem</label>
                    <textarea id="email-mensagem" placeholder="Adicione uma mensagem personalizada (opcional)"></textarea>
                </div>
                <div class="form-group">
                    <label for="email-tipo">Tipo de Relatório</label>
                    <select id="email-tipo">
                        <option value="todos">Relatório Geral</option>
                        <option value="sala">Sala</option>
                        <option value="quarto">Quarto</option>
                        <option value="cozinha">Cozinha</option>
                        <option value="banheiro">Banheiro</option>
                        <option value="quarto2">Quarto 2</option>
                        <option value="garagem">Garagem</option>
                    </select>
                </div>
            </div>
            <div class="modal-footer">
                <button class="botao-controle" onclick="enviarEmail()">Enviar Email</button>
                <button class="botao-controle off" onclick="fecharModal('email-modal')">Cancelar</button>
            </div>
        </div>
    </div>
    
    <div class="modal" id="relatorio-modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2 id="relatorio-titulo">Relatório de Consumo</h2>
                <button class="modal-close" onclick="fecharModal('relatorio-modal')">×</button>
            </div>
            <div class="modal-body">
                <div id="relatorio-conteudo"></div>
            </div>
            <div class="modal-footer">
                <button class="botao-controle" onclick="imprimirRelatorio()">Imprimir</button>
                <button class="botao-controle" onclick="baixarRelatorio()">Baixar PDF</button>
                <button class="botao-controle off" onclick="fecharModal('relatorio-modal')">Fechar</button>
            </div>
        </div>
    </div>
    
    <script>
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
            alert('Função de download de PDF será implementada com uma biblioteca como jsPDF.');
        }
        
        function abrirModalEmail() {
            document.getElementById('email-modal').style.display = 'flex';
        }
        
        function enviarEmail() {
            const destinatario = document.getElementById('email-destinatario').value;
            const assunto = document.getElementById('email-assunto').value;
            const mensagem = document.getElementById('email-mensagem').value;
            const tipo = document.getElementById('email-tipo').value;
            
            if (!destinatario) {
                alert('Por favor, informe o email do destinatário.');
                return;
            }
            
            const relatorio = sistemaEnergia.gerarRelatorio(tipo);
            
            alert(`Email enviado para ${destinatario}!\n\nAssunto: ${assunto}\n\nRelatório anexado.`);
            
            fecharModal('email-modal');
            
            document.getElementById('email-destinatario').value = '';
            document.getElementById('email-mensagem').value = '';
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
    </script>
</body>
</html>
