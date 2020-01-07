import React, { useState, useEffect } from "react";
import { Chart } from "react-google-charts";
import "./App.css";
import axios from "axios";

let allData = "";

function App() {
  const [data, setData] = useState([]);
  const [mapResolution, setMapResolution] = useState("");
  const [sector, setSector] = useState("Łącznie");
  const [province, setProvince] = useState("");
  const [provinceData, setProvinceData] = useState("");

  useEffect(() => {
    axios
      .get("https://xlsfrse.adpdev.click/download")
      .then(function(response) {
        // handle success
        allData = response.data;
        allData["Całość"].map(row => {
          const regex = /.*Polska.*/;
          row.A = row.A.replace(regex, "PL");

          const regex2 = /[A-Za-zżźćńółęąśŻŹĆĄŚĘŁÓŃ-]*/;
          row.A = regex2.exec(row.A)[0];
        });

        return setData(() => createGlobalData());
      })
      .catch(function(error) {
        // handle error
        console.log(error);
      });
  }, []);

  useEffect(() => {
    if (mapResolution === "") {
      // setProvinceData("");
      // setProvince("");
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
    if (allData === "") return;

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
    if (allData === "") return;
    let globalData = allData["Całość"];
    let constructedArray = [];

    globalData.map(row => {
      if (row.A === province && row.B === sector) {
        const regex = /[A-Z]\s?-?\s?\d*/;
        const rowF = regex.exec(row.F)[0];
        const rowG = regex.exec(row.G)[0];
        const rowH = regex.exec(row.H)[0];

        let keys = Object.keys(allData);
        let rowFKey, rowGKey, rowHKey;
        keys.map(key => {
          var trimmedKey = key.replace(/\s*?-|\s(?=\d)/, "");
          if (trimmedKey.includes(`${rowF} `)) {
            rowFKey = key;
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
        setProvince(region[0]);
      }
    }
  ];

  return (
    <div className="App">
      <div className="maps-toggle">
        <button
          onClick={() => {
            setMapResolution("");
            setProvinceData("");
            setProvince("");
          }}
          disabled={mapResolution === "" ? true : false}
        >
          Polska
        </button>
        <button
          onClick={() => {
            setMapResolution("provinces");
            setProvinceData("");
            setProvince("");
          }}
          disabled={mapResolution === "provinces" ? true : false}
        >
          Województwa
        </button>
      </div>

      <div className={"map-container"}>
        <Chart
          width={"100vw"}
          height={"62vw"}
          chartType="GeoChart"
          data={data}
          options={{
            region: "PL",
            resolution: mapResolution,
            legend: "none",
            colorAxis: {
              colors: [
                "#3366cc",
                "#dc3912",
                "#ff9900",
                "#109618",
                "#990099",
                "#0099c6",
                "#dd4477",
                "#66aa00",
                "#b82e2e",
                "#316395",
                "#994499",
                "#22aa99",
                "#aaaa11",
                "#6633cc",
                "#e67300",
                "#334655"
              ]
            }
          }}
          mapsApiKey="AIzaSyDRQ19XrIf8WjDBz3HPrbCFcr2PoaLr-hY"
          rootProps={{ "data-testid": "1" }}
          chartEvents={chartEvents}
        />
        {provinceData === "" ? (
          ""
        ) : (
          <button
            className="wroc"
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
        <div className="info">
          <p className="nothing-to-show">
            Kliknij w region na mapie, aby wyświetlić szczegółowe dane.
          </p>
        </div>
      ) : (
        <div className="info">
          <section className="table-1">
            {province === "PL" ? (
              <h3>Cała Polska</h3>
            ) : (
              <h3>Województwo {province}</h3>
            )}
            {sector === "Łącznie" ? (
              <h4>Wszystkie sektory</h4>
            ) : (
              <h4>Sektor: {sector}</h4>
            )}

            <table>
              <tbody>
                <tr>
                  <td>Liczba złożonych wniosków</td>
                  <td>{provinceData[0][1]}</td>
                </tr>
                <tr>
                  <td>Liczba dofinansowanych projektów (E+& PO WER)</td>
                  <td>{provinceData[0][2]}</td>
                </tr>
                <tr>
                  <td>Dofinansowanie (E+ & PO WER)</td>
                  <td>{provinceData[0][3]} EUR</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="table-2">
            <h4>Liczba projektów z udziałem podmiotów z określonego kraju</h4>
            <table>
              <tbody>
                {provinceData[0][4].map(single => (
                  <tr>
                    <td>{single.A}</td>
                    <td>{single.B}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="table-3">
            <h4>
              Liczba mobilności z Polski/województwa do Poszczególnych krajów
            </h4>
            <table>
              <tbody>
                {provinceData[0][5].map(single => (
                  <tr>
                    <td>{single.A}</td>
                    <td>{single.B}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="table-4">
            <h4>
              Liczba mobilności z poszczególnych krajów do Polski/województwa
            </h4>
            <table>
              <tbody>
                {provinceData[0][6].map(single => (
                  <tr>
                    <td>{single.A}</td>
                    <td>{single.B}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;
