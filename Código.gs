const SHEET_NAME = "Registros";
const FOLDER_ID = "11Av25yquRi0O4gy9txWfjn9LIaewR3GK"; // substitua pelo ID correto

// ✅ Trata requisições OPTIONS (preflight)
function doGet(e) {
  return ContentService.createTextOutput("OK")
    .setMimeType(ContentService.MimeType.TEXT);
}

// ✅ Função principal — trata POST
function doPost(e) {
  const response = ContentService.createTextOutput();
  response.setMimeType(ContentService.MimeType.JSON);

  try {
    // 🔥 Adiciona CORS dinamicamente
    const setCorsHeaders = (output) => {
      const resp = output;
      const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      };
      for (const key in headers) {
        try { resp[key] = headers[key]; } catch (e) {}
      }
      return resp;
    };

    if (!e || !e.postData || !e.postData.contents) {
      response.setContent(JSON.stringify({ status: "erro", message: "Requisição vazia" }));
      return setCorsHeaders(response);
    }

    const data = JSON.parse(e.postData.contents);

    if (!data.masterImage || !data.newImage) {
      response.setContent(JSON.stringify({ status: "erro", message: "Imagens não enviadas" }));
      return setCorsHeaders(response);
    }

    // 🗂️ Acessa pasta
    let folder;
    try {
      folder = DriveApp.getFolderById(FOLDER_ID);
    } catch (err) {
      response.setContent(JSON.stringify({
        status: "erro",
        message: "Erro ao acessar pasta: " + err.message
      }));
      return setCorsHeaders(response);
    }

    // 📸 Cria arquivos
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

    // 🎯 Resultados simulados
    const score = Math.round((8 + Math.random() * 2) * 10) / 10;
    const desvio = "Leve variação no magenta";
    const ajuste = "M: -3%";
    const aceitavel = score > 8.5 ? "Sim" : "Não";

    // 📊 Registra na planilha
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      response.setContent(JSON.stringify({ status: "erro", message: "Aba não encontrada." }));
      return setCorsHeaders(response);
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

    response.setContent(JSON.stringify({
      status: "ok",
      message: "Registro salvo com sucesso!"
    }));
    return setCorsHeaders(response);

  } catch (err) {
    response.setContent(JSON.stringify({
      status: "erro",
      message: "Erro interno: " + err.message
    }));
    return response;
  }
}
