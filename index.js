import express from "express";
import puppeteer from "puppeteer";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send({ message: "hello from express" });
});

app.post("/scrape", async (req, res) => {
  const url =
    "https://www.dgii.gov.do/app/WebApps/ConsultasWeb/consultas/rnc.aspx";
  const { rnc } = req.body;

  if (!rnc) {
    return res.status(400).json({ Error: "RNC is required" });
  } else if (rnc.length !== 9 && rnc.length !== 11) {
    return res.status(404).json({
      message:
        "check number you entered. It must be composed by 9 or 11 numbers",
    });
  }

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    await page.type("#ctl00_cphMain_txtRNCCedula", rnc);
    await page.click("#ctl00_cphMain_btnBuscarPorRNC");
    await page.waitForSelector("tbody", {
      timeout: 10000,
    });
    const data = await page.evaluate(() => {
      const rows = document.querySelectorAll("tr");
      const result = [];
      rows.forEach((row) => {
        const cells = row.querySelectorAll("td");
        const rowData = [];
        debugger;
        cells.forEach((cell) => {
          rowData.push(cell.textContent);
        });
        result.push(rowData);
        result;
        resultJSON = {};
        result.forEach((par) => {
          const clave = par[0];
          const valor = par[1];
          resultJSON[clave] = valor;
        });
      });
      return resultJSON;
    });

    await browser.close();
    res.json({
      data,
    });
  } catch (error) {
    if (error.name === "TimeoutError") {
      res
        .status(400)
        .json({ message: "RNC number not found, please check it out" });
    } else {
      res.status(500).json({ message: `Se produjo un error: ${error}` });
    }
  }
});

const port = parseInt(process.env.PORT) || 10000;
app.listen(port);
