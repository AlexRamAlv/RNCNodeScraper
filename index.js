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
  }

  try {
    const browser = await puppeteer.launch(/*{ headless: true }*/);
    const page = await browser.newPage();
    await page.goto(url);
    await page.type("#ctl00_cphMain_txtRNCCedula", rnc);
    await page.click("#ctl00_cphMain_btnBuscarPorRNC");
    await page.waitForSelector("tbody");
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
    console.log(error);
  }
});

const port = parseInt(process.env.PORT) || 10000;
app.listen(port);
