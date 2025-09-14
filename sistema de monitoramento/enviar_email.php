<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    exit;
}

$destinatario = isset($_POST['destinatario']) ? $_POST['destinatario'] : '';
$assunto = isset($_POST['assunto']) ? $_POST['assunto'] : '';
$mensagem = isset($_POST['mensagem']) ? $_POST['mensagem'] : '';
$relatorio = isset($_POST['relatorio']) ? $_POST['relatorio'] : '';
$tipo = isset($_POST['tipo']) ? $_POST['tipo'] : '';
$remetente = isset($_POST['remetente']) ? $_POST['remetente'] : 'site@fixa.tech';

if (empty($destinatario) || empty($assunto)) {
    echo json_encode(['success' => false, 'message' => 'Campos obrigatórios não preenchidos']);
    exit;
}

$corpo_email = "<html><body>";
$corpo_email .= "<h2>Relatório de Consumo de Energia</h2>";
$corpo_email .= "<p><strong>Data:</strong> " . date('d/m/Y H:i:s') . "</p>";
$corpo_email .= "<p><strong>Tipo de Relatório:</strong> " . ($tipo == 'todos' ? 'Relatório Geral' : 'Relatório de ' . ucfirst($tipo)) . "</p>";

if (!empty($mensagem)) {
    $corpo_email .= "<h3>Mensagem Personalizada:</h3>";
    $corpo_email .= "<p>" . nl2br(htmlspecialchars($mensagem)) . "</p>";
}

$corpo_email .= "<h3>Dados do Relatório:</h3>";
$corpo_email .= "<pre>" . htmlspecialchars($relatorio) . "</pre>";
$corpo_email .= "</body></html>";

$headers = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=UTF-8\r\n";
$headers .= "From: " . $remetente . "\r\n";
$headers .= "Reply-To: " . $remetente . "\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

// Habilitar relatório de erros para depuração
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    if (mail($destinatario, $assunto, $corpo_email, $headers)) {
        echo json_encode(['success' => true, 'message' => 'Email enviado com sucesso']);
    } else {
        $error = error_get_last();
        echo json_encode(['success' => false, 'message' => 'Erro ao enviar email: ' . ($error['message'] ?? 'Erro desconhecido')]);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Exceção ao enviar email: ' . $e->getMessage()]);
}
?>