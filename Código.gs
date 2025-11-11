const SHEET_NAME = "Registros";
const FOLDER_ID = "11Av25yquRi0O4gy9txWfjn9LIaewR3GK"; // seu ID de pasta no Drive

// 🔥 TRATA O PRÉ-REQUISITO CORS (preflight OPTIONS)
function doGet(e) {
  return ContentService.createTextOutput("OK")
    .setMimeType(ContentService.MimeType.TEXT);
}

// 🔥 LIDA COM OPTIONS (CORS preflight)
function doOptions(e) {
  return ContentService
    .createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeader("Access-Control-Allow-Origin", "*")
    .setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    .setHeader("Access-Control-Allow-Headers", "Content-Type");
}

// 🔥 TRATA O POST PRINCIPAL
function doPost(e) {
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  try {
    if (!e || !e.postData || !e.postData.contents) {
      return withCors(JSON.stringify({ status: "erro", message: "Corpo vazio" }));
    }

    const data = JSON.parse(e.postData.contents);

    if (!data.masterImage || !data.newImage) {
      return withCors(JSON.stringify({ status: "erro", message: "Imagens ausentes" }));
    }

    const folder = DriveApp.getFolderById(FOLDER_ID);

    // Salva imagens
    const masterFile = folder.createFile(
      Utilities.base64Decode(data.masterImage),
      "master_" + Date.now() + ".jpg",
      MimeType.JPEG
    );
    const newFile = folder.createFile(
      Utilities.base64Decode(data.newImage),
      "nova_" + Date.now() + ".jpg",
      MimeType.JPEG
    );

    // Simula resultado
    const score = Math.round((8 + Math.random() * 2) * 10) / 10;
    const desvio = "Leve variação no magenta";
    const ajuste = "M: -3%";
    const aceitavel = score > 8.5 ? "Sim" : "Não";

    // Grava na planilha
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);
    sheet.appendRow([
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
    ]);

    return withCors(JSON.stringify({
      status: "ok",
      message: "Registro salvo com sucesso!"
    }));

  } catch (err) {
    return withCors(JSON.stringify({
      status: "erro",
      message: "Erro interno: " + err.message
    }));
  }
}

// 🔧 Adiciona CORS aos retornos
function withCors(content) {
  return ContentService
    .createTextOutput(content)
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader("Access-Control-Allow-Origin", "*")
    .setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    .setHeader("Access-Control-Allow-Headers", "Content-Type");
}
