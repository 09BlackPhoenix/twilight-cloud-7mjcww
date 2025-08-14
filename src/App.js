import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import emailjs from "emailjs-com";

export default function SuperBikeShuttle() {
  const [orders, setOrders] = useState([]);
  const [csvUrl, setCsvUrl] = useState("");

  const USER_ID = "qMobA9k4bOqXP3hMr";
  const SERVICE_ID = "service_ftkp4cx";

  useEffect(() => {
    if (!csvUrl) return;

    const fetchCsv = async () => {
      try {
        const text = await (await fetch(csvUrl)).text();
        const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
        const updated = parsed.data.map((o) => ({
          ...o,
          status: o.status || "offen",
        }));
        setOrders(updated.reverse());
      } catch (e) {
        console.error(e);
      }
    };

    fetchCsv();
    const interval = setInterval(fetchCsv, 15000);
    return () => clearInterval(interval);
  }, [csvUrl]);

  const markAsDone = (index) => {
    const inputPrice = prompt(
      "Gib den Basispreis für diese Bestellung ein (in €):"
    );
    if (!inputPrice) return;

    const calculatedPrice = (parseFloat(inputPrice) * 1.25).toFixed(2); // 25% Aufschlag
    const order = orders[index];
    const newOrders = [...orders];
    newOrders[index].status = "erledigt";
    newOrders[index].price = calculatedPrice;
    setOrders(newOrders);

    emailjs
      .send(
        SERVICE_ID,
        "template_9gh283v",
        {
          to_email: order["E-Mail-Adresse"],
          order_item: order["Was möchten Sie bestellen?"],
          delivery_address: order["Wohin soll ich es bringen?"],
          price: calculatedPrice,
        },
        USER_ID
      )
      .then(() =>
        alert(
          `Besteller wurde benachrichtigt. Endpreis inkl. 25% Aufschlag: ${calculatedPrice}€`
        )
      )
      .catch((err) => console.error("Fehler beim Senden der Email:", err));
  };

  const deleteOrder = (index) => {
    const reason = prompt("Gib den Grund für das Löschen der Bestellung ein:");
    if (!reason) return;

    const order = orders[index];
    const newOrders = [...orders];
    newOrders.splice(index, 1);
    setOrders(newOrders);

    emailjs
      .send(
        SERVICE_ID,
        "template_247a484",
        {
          to_email: order["E-Mail-Adresse"],
          order_item: order["Was möchten Sie bestellen?"],
          delivery_address: order["Wohin soll ich es bringen?"],
          reason: reason,
        },
        USER_ID
      )
      .then(() => alert("Besteller wurde über Löschung informiert"))
      .catch((err) => console.error("Fehler beim Senden der Email:", err));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "erledigt":
        return "rgba(0, 200, 150, 0.6)"; // Grün-Blau Glass
      case "offen":
        return "rgba(30, 144, 255, 0.6)"; // Blau Glass
      default:
        return "rgba(255, 77, 77, 0.6)"; // Rot Glass
    }
  };

  return (
    <div
      style={{
        fontFamily: "'Roboto', sans-serif",
        minHeight: "100vh",
        padding: "50px 20px",
        background: "linear-gradient(135deg, #74ebd5 0%, #ACB6E5 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Sanfte Hintergrundformen */}
      <div
        style={{
          position: "absolute",
          width: "600px",
          height: "600px",
          background: "rgba(255,255,255,0.1)",
          borderRadius: "50%",
          top: "-200px",
          left: "-200px",
          filter: "blur(120px)",
        }}
      ></div>
      <div
        style={{
          position: "absolute",
          width: "500px",
          height: "500px",
          background: "rgba(255,255,255,0.1)",
          borderRadius: "50%",
          bottom: "-150px",
          right: "-150px",
          filter: "blur(100px)",
        }}
      ></div>

      <h1
        style={{
          color: "#fff",
          marginBottom: "40px",
          textAlign: "center",
          textShadow: "2px 2px 15px rgba(0,0,0,0.2)",
        }}
      >
        🚲 Super Fahrrad-Shuttle
      </h1>

      <input
        style={{
          width: "100%",
          maxWidth: "650px",
          padding: "16px",
          borderRadius: "25px",
          border: "none",
          fontSize: "16px",
          marginBottom: "35px",
          boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
          outline: "none",
          background: "rgba(255,255,255,0.3)",
          backdropFilter: "blur(10px)",
          color: "#fff",
          textShadow: "1px 1px 2px rgba(0,0,0,0.2)",
        }}
        placeholder="Öffentlichen CSV-Link hier einfügen"
        value={csvUrl}
        onChange={(e) => setCsvUrl(e.target.value)}
      />

      <ul
        style={{
          listStyle: "none",
          padding: 0,
          width: "100%",
          maxWidth: "700px",
        }}
      >
        {orders.map((order, index) => (
          <li
            key={index}
            style={{
              background: "rgba(255,255,255,0.15)",
              borderLeft: `8px solid ${getStatusColor(order.status)}`,
              marginBottom: "20px",
              padding: "22px",
              borderRadius: "25px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
              backdropFilter: "blur(10px)",
              transition: "all 0.3s",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <div>
                <strong
                  style={{
                    color: "#fff",
                    fontSize: "16px",
                    textShadow: "1px 1px 4px rgba(0,0,0,0.5)",
                  }}
                >
                  {order["E-Mail-Adresse"] || "Unbekannt"}
                </strong>
                <br />
                <span style={{ fontSize: "15px", color: "#e0f7fa" }}>
                  {order["Was möchten Sie bestellen?"] || "Keine Angaben"}
                </span>{" "}
                →
                <em
                  style={{
                    marginLeft: "5px",
                    fontSize: "15px",
                    color: "#e0f7fa",
                  }}
                >
                  {order["Wohin soll ich es bringen?"] || "Keine Angaben"}
                </em>
                {order.price && (
                  <span
                    style={{
                      marginLeft: "10px",
                      fontWeight: "bold",
                      color: "#fff",
                    }}
                  >
                    {" "}
                    | Preis inkl. 25%: {order.price}€
                  </span>
                )}
              </div>
              <div style={{ marginTop: "10px" }}>
                <button
                  onClick={() => markAsDone(index)}
                  style={{
                    marginRight: "12px",
                    padding: "12px 24px",
                    background: "linear-gradient(45deg, #00c6ff, #0072ff)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "18px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
                    transition: "all 0.3s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  ✔ Zugestellt
                </button>
                <button
                  onClick={() => deleteOrder(index)}
                  style={{
                    padding: "12px 24px",
                    background: "linear-gradient(45deg, #ff5f6d, #ffc371)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "18px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
                    transition: "all 0.3s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  🗑 Löschen
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
