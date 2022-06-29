const fs = require("fs");

class Logger {
  static memory;

  static logger;

  constructor() {
    this.memory = [];
    this.logger = null;
  }

  getSpacer(size, char = "_") {
    let spacer = "";
    for (let i = 0; i < size; i += 1) {
      spacer += char;
    }
    return spacer;
  }

  setLogger(logger) {
    LoggerSingleton.getInstance().logger = logger;
  }

  runLogger(data) {
    if (!LoggerSingleton.getInstance().logger) {
      return;
    }
    LoggerSingleton.getInstance().logger(data);
  }

  log(
    print,
    {
      pretty = false,
      stringify = false,
      stdout = false,
      marginTop = false,
      emoji = "⚙️ ",
      start = false,
      end = false,
    } = {}
  ) {
    if (pretty) {
      return;
    }

    if (stringify) {
      return;
    }

    let text = null;

    LoggerSingleton.getInstance().runLogger({
      print,
      pretty,
      stringify,
      stdout,
      marginTop,
      emoji,
      start,
      end,
    });

    if (typeof print !== "string") {
      if (print?.length) {
        const spacer = LoggerSingleton.getInstance().getSpacer(
          42 - print[0].length
        );

        if (!Array.isArray(print[1])) {
          text = `[ ${emoji} ] ${print[0]} ${spacer} ${print[1] || ""}`;
        } else {
          const lines = print[1];
          const base = `[ ${emoji} ] ${print[0]} ${spacer}`;
          const padding = LoggerSingleton.getInstance().getSpacer(
            base.length,
            " "
          );
          text = [];
          lines.forEach((line, index) => {
            if (index === 0) {
              text.push(`${base} ${line}`);
              return;
            }
            text.push(`${padding} ↑ ${line}`);
          });
        }
      }
    } else {
      text = `[ ${emoji} ] ${print}`;
    }

    if (typeof text === "string") {
      LoggerSingleton.getInstance().memory.push(text);
    } else {
      if (Array.isArray(text)) {
        text.forEach((str) => {
          LoggerSingleton.getInstance().memory.push(str);
        });
      }
    }

    if (start) {
    }

    if (marginTop) {
    }

    if (stdout) {
      return;
    }

    if (typeof text === "string") {
      console.log(text);
    } else if (Array.isArray(text)) {
      text.forEach((line) => {
        console.log(line);
      });
    } else {
      console.log(text);
    }

    if (end) {
      LoggerSingleton.getInstance().save();
    }
  }

  save() {
    if (!LoggerSingleton.getInstance().memory?.length) {
      return false;
    }

    const path = "./outputs";
    const filename = `${path}/process.log`;

    try {
      fs.mkdirSync(path);
    } catch (e) {}

    const data = LoggerSingleton.getInstance()
      .memory.map((item) =>
        item
          .trim()
          .replace(/^(\[[^\]]+\])(.*)/gim, "$2")
          .trim()
      )
      .join("\n");

    if (fs.existsSync(filename)) {
      fs.appendFileSync(filename, `${data}`);
      return;
    }

    fs.writeFileSync(filename, `${data}`, "utf8");
  }
}

export class LoggerSingleton {
  static instance;

  static getInstance() {
    if (!LoggerSingleton.instance) {
      LoggerSingleton.instance = new Logger();
    }
    return LoggerSingleton.instance;
  }
}
