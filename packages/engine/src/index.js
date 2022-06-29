const fs = require("fs");
const { getDataFromFiles, clearFolder } = require("./utils");
const { Election } = require("./eleicoes/eleicoes");
const { LoggerSingleton } = require("./log");
const {
  PARTIALS_FOLDER,
  ORIGINAL_FILES_FOLDER,
  TEMP_FILE_PATH,
  FEDERAL_YEARS,
} = require("./constants");
import { getAncientData } from "./data/ancient";

const { log, setLogger } = LoggerSingleton.getInstance();

export function clearFolders(folder) {
  clearFolder(`${folder}/${PARTIALS_FOLDER}`);
  clearFolder(`${folder}/${ORIGINAL_FILES_FOLDER}`);
}

export function getAncientHistory(folder) {
  return getAncientData();
}

export function setupFolders(folder) {
  if (!fs.existsSync(`${folder}/outputs`)) {
    fs.mkdirSync(`${folder}/outputs`);
  }

  if (!fs.existsSync(`${folder}/outputs/data`)) {
    fs.mkdirSync(`${folder}/outputs/data`);
  }
  if (!fs.existsSync(`${folder}/${ORIGINAL_FILES_FOLDER}`)) {
    fs.mkdirSync(`${folder}/${ORIGINAL_FILES_FOLDER}`);
  }
  if (!fs.existsSync(`${folder}/${PARTIALS_FOLDER}`)) {
    fs.mkdirSync(`${folder}/${PARTIALS_FOLDER}`);
  }
  if (!fs.existsSync(`${folder}/${TEMP_FILE_PATH}`)) {
    fs.mkdirSync(`${folder}/${TEMP_FILE_PATH}`);
  }
}

export async function runPath({ files, section, folder, logger, callback }) {
  setLogger(logger);

  global.appFolder = folder;

  const election = new Election();

  if (!files?.length) {
    log(["NO FILES FOUND", "REVIEW YOUR data FOLDER AND --input ARGUMENT"], {
      emoji: "🛑",
    });
    return;
  }

  log(["FILES FOUND", files.join(", ")], {
    emoji: "🚀",
  });

  const splitted = section.split("-");

  const uf = splitted[0];
  const ano = splitted[1];
  const federal = FEDERAL_YEARS.indexOf(ano) !== -1;
  log(files, { emoji: "🛑", marginTop: true });
  const header = { uf, ano, federal };
  if (files.length === 1 && files[0].match(/_BR/gim)) {
    header.presidential = true;
  }

  election.resetAccumulator(header);

  try {
    await getDataFromFiles(
      files,
      header,
      (data) => {
        election.populateFromLine(data);
      },
      (data) => {
        election.isCountryCodeWithinScope(data);
      }
    );
  } catch (e) {
    log("UNKOWN ERROR", { emoji: "🛑", marginTop: true });
    clearFolders(folder);
    callback({ error: true });
  }

  election.updateGeneralInfo();

  election.printer({
    type: "print_ballots",
    extra: [],
    removed: ["zonas", "coligacoes"],
  });

  log("ALL DONE 🐍🪵", { emoji: "☑️ " });

  log("SPEAK UP, SPEAK LOUD → @GAVETAIO", {
    emoji: "📣",
  });

  clearFolders(folder);
  callback({ error: false });
}
