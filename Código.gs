function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // seu código aqui (salvar imagens, etc.)

    const response = {
      status: "ok",
      message: "Dados recebidos com sucesso!"
    };

    return ContentService
      .createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader("Access-Control-Allow-Origin", "*") // 🔥 Permite acesso de qualquer site
      .setHeader("Access-Control-Allow-Methods", "POST") // 🔥 Permite POST
      .setHeader("Access-Control-Allow-Headers", "Content-Type"); // 🔥 Permite JSON
  } catch (err) {
    const erro = {
      status: "erro",
      message: err.toString()
    };

    return ContentService
      .createTextOutput(JSON.stringify(erro))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader("Access-Control-Allow-Origin", "*")
      .setHeader("Access-Control-Allow-Methods", "POST")
      .setHeader("Access-Control-Allow-Headers", "Content-Type");
  }
}

const SHEET_NAME = "Registros";
const FOLDER_ID = "11Av25yquRi0O4gy9txWfjn9LIaewR3GK"; // <<< substitua pelo ID correto

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index.html')
    .setTitle('Controle de Cor')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({ status: "erro", message: "Requisição inválida: corpo vazio" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const data = JSON.parse(e.postData.contents);

    // Validações simples
    if (!data.masterImage || !data.newImage) {
      return ContentService.createTextOutput(JSON.stringify({ status: "erro", message: "Imagens não enviadas" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Tenta obter a pasta do Drive
    let folder;
    try {
      folder = DriveApp.getFolderById(FOLDER_ID);
    } catch (err) {
      // Mensagem clara para depuração
      const msg = "Erro ao acessar a pasta do Drive. Verifique FOLDER_ID e se a conta que executa o script tem acesso. (" + err.message + ")";
      return ContentService.createTextOutput(JSON.stringify({ status: "erro", message: msg }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Salva arquivos (decodifica base64)
    const masterFile = folder.createFile(Utilities.base64Decode(data.masterImage), "master_" + Date.now() + ".jpg", MimeType.JPEG);
    const newFile = folder.createFile(Utilities.base64Decode(data.newImage), "nova_" + Date.now() + ".jpg", MimeType.JPEG);

    // Simula IA (substituir por integração real depois)
    const score = Math.round(8 + Math.random() * 2 * 10) / 10;
    const desvio = "Leve variação no magenta";
    const ajuste = "M: -3%";
    const aceitavel = score > 8.5 ? "Sim" : "Não";

    // Grava na planilha
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({ status: "erro", message: "Aba '" + SHEET_NAME + "' não encontrada na planilha." }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const row = [
      Utilities.getUuid(),
      new Date(),
      data.operador || "",
      data.lote || "",
      masterFile.getUrl(),
      newFile.getUrl(),
      score,
      desvio,
      ajuste,
      aceitavel,
      ""
    ];
    sheet.appendRow(row);

    return ContentService.createTextOutput(JSON.stringify({ status: "ok" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    // Erro genérico — envie stack para logs e resposta amigável
    console.error(err);
    return ContentService.createTextOutput(JSON.stringify({ status: "erro", message: "Erro interno: " + err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
