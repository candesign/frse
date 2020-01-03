import React, { useState, useEffect } from "react";
import { Chart } from "react-google-charts";
import "./App.css";

let allData = require("./frse.json");

function App() {
  const [data, setData] = useState([]);
  const [mapResolution, setMapResolution] = useState("");
  const [sector, setSector] = useState("Łącznie");
  const [province, setProvince] = useState("");
  const [provinceData, setProvinceData] = useState("");

  useEffect(() => {
    if (mapResolution === "") {
      setProvinceData("");
      setProvince("");
    }
    return setData(() => createGlobalData());
  }, [sector, province, provinceData, mapResolution]);

  useEffect(() => {
    return setData(() => createGlobalData());
  }, [sector, province, mapResolution]);

  useEffect(() => {
    if (province === "") return;
    return setProvinceData(() => createProvinceData());
  }, [sector, province, mapResolution]);

  function createGlobalData() {
    let globalData = allData["Całość"];
    let constructedArray = [["Wojewodztwo", "Wnioski"]];
    let resolution;

    if (mapResolution === "") {
      resolution = "PL";
    } else {
      resolution = "";
    }

    globalData.map(row => {
      if (provinceData === "") {
        if (row.A.includes(resolution) && row.B === sector) {
          let innerArray = [row.A, row.C];
          constructedArray.push(innerArray);
        }
      } else {
        if (row.A === province && row.B === sector) {
          let innerArray = [row.A, row.C];
          constructedArray.push(innerArray);
        }
      }
    });
    return constructedArray;
  }

  function createProvinceData() {
    let globalData = allData["Całość"];
    let constructedArray = [];

    globalData.map(row => {
      if (row.A === province && row.B === sector) {
        const regex = /[A-Z]\d*/;
        const rowF = regex.exec(row.F)[0];
        const rowG = regex.exec(row.G)[0];
        const rowH = regex.exec(row.H)[0];

        let keys = Object.keys(allData);
        let rowFKey, rowGKey, rowHKey;
        keys.map(key => {
          if (key.includes(`${rowF} `)) {
            rowFKey = key;
            console.log(rowF, rowFKey);
          }
          if (key.includes(rowG)) {
            rowGKey = key;
          }
          if (key.includes(rowH)) {
            rowHKey = key;
          }
        });
        let rowFArray = allData[rowFKey];
        let rowGArray = allData[rowGKey];
        let rowHArray = allData[rowHKey];

        let innerArray = [
          row.A,
          row.C,
          row.D,
          row.E,
          rowFArray,
          rowGArray,
          rowHArray
        ];
        constructedArray.push(innerArray);
      }
    });
    console.log(constructedArray);
    return constructedArray;
  }

  const chartEvents = [
    {
      eventName: "select",
      callback: ({ chartWrapper }) => {
        const chart = chartWrapper.getChart();
        const selection = chart.getSelection();
        if (selection.length === 0) return;
        const region = data[selection[0].row + 1];
        if (region[0] === "PL") return;
        setProvince(region[0]);
      }
    }
  ];

  return (
    <div className="App">
      <div className={"map-container"}>
        <Chart
          width={"100vw"}
          height={"80vh"}
          chartType="GeoChart"
          data={data}
          options={{
            region: "PL",
            resolution: mapResolution,
            legend: "none",
            colorAxis: { colors: ["green", "blue"] }
          }}
          mapsApiKey="AIzaSyDRQ19XrIf8WjDBz3HPrbCFcr2PoaLr-hY"
          rootProps={{ "data-testid": "1" }}
          chartEvents={chartEvents}
        />
      </div>

      <div className="maps-toggle">
        <button
          onClick={() => setMapResolution("")}
          disabled={mapResolution === "" ? true : false}
        >
          Polska
        </button>
        <button
          onClick={() => setMapResolution("provinces")}
          disabled={mapResolution === "provinces" ? true : false}
        >
          Województwa
        </button>
        {provinceData === "" ? (
          ""
        ) : (
          <button
            onClick={() => {
              setProvinceData("");
              setProvince("");
            }}
          >
            Wróć
          </button>
        )}
      </div>
      <div className="sectors-toggle">
        <button
          onClick={() => setSector("Łącznie")}
          disabled={sector === "Łącznie" ? true : false}
        >
          Wszystkie sektory
        </button>
        <button
          onClick={() => setSector("AE")}
          disabled={sector === "AE" ? true : false}
        >
          AE
        </button>
        <button
          onClick={() => setSector("HE")}
          disabled={sector === "HE" ? true : false}
        >
          HE
        </button>
        <button
          onClick={() => setSector("SE")}
          disabled={sector === "SE" ? true : false}
        >
          SE
        </button>
        <button
          onClick={() => setSector("VET")}
          disabled={sector === "VET" ? true : false}
        >
          VET
        </button>
        <button
          onClick={() => setSector("Y")}
          disabled={sector === "Y" ? true : false}
        >
          Y
        </button>
      </div>
      <div className="header">
        <p>Mapa: {mapResolution === "" ? "Polska" : "Województwa"}</p>
        <p>Sektor: {sector === "Łącznie" ? "Wszystkie" : sector}</p>
        <p>Województwo: {province === "" ? "Wszystkie" : province}</p>
      </div>

      {provinceData === "" ? (
        ""
      ) : (
        <div className="info">
          <h3>Województwo {province}</h3>
          <ul>
            <li>Liczba złożonych wniosków: {provinceData[0][1]}</li>
            <li>
              Liczba dofinansowanych projektów (E+& PO WER):{" "}
              {provinceData[0][2]}
            </li>
            <li>Dofinansowanie (E+ & PO WER, EUR): {provinceData[0][3]}</li>
          </ul>

          <h3>Liczba projektów z udziałem podmiotów z określonego kraju</h3>
          <ul>
            {provinceData[0][4].map(single => (
              <li>
                {single.A}: {single.B}
              </li>
            ))}
          </ul>

          <h3>
            Liczba mobilności z Polski/województwa do Poszczególnych krajów
          </h3>
          <ul>
            {provinceData[0][5].map(single => (
              <li>
                {single.A}: {single.B}
              </li>
            ))}
          </ul>

          <h3>
            Liczba mobilności z poszczególnych krajów do Polski/województwa
          </h3>
          <ul>
            {provinceData[0][6].map(single => (
              <li>
                {single.A}: {single.B}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
