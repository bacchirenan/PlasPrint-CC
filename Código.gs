const SHEET_NAME = "Registros";
const FOLDER_ID = "11Av25yquRi0O4gy9txWfjn9LIaewR3GK"; // substitua pelo seu ID

// ✅ Função utilitária: retorna JSON com CORS sem usar setHeader
function corsResponse(jsonObj) {
  const output = ContentService.createTextOutput(JSON.stringify(jsonObj));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

// ✅ Permite requisição OPTIONS (preflight do navegador)
function doGet(e) {
  return corsResponse({ status: "ok", message: "CORS habilitado (GET)" });
}

// ✅ Requisição principal (POST)
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return corsResponse({ status: "erro", message: "Corpo da requisição vazio" });
    }

    const data = JSON.parse(e.postData.contents);

    if (!data.masterImage || !data.newImage) {
      return corsResponse({ status: "erro", message: "Imagens não enviadas" });
    }

    // Pega a pasta do Drive
    const folder = DriveApp.getFolderById(FOLDER_ID);

    // Salva as imagens
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

    // Simula IA
    const score = Math.round((8 + Math.random() * 2) * 10) / 10;
    const desvio = "Leve variação no magenta";
    const ajuste = "M: -3%";
    const aceitavel = score > 8.5 ? "Sim" : "Não";

    // Grava na planilha
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      return corsResponse({ status: "erro", message: "Aba 'Registros' não encontrada." });
    }

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

    return corsResponse({ status: "ok", message: "Dados salvos com sucesso!" });
  } catch (err) {
    return corsResponse({ status: "erro", message: err.message });
  }
}
