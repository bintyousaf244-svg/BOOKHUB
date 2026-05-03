import React, { useEffect, useState } from "react";

export function WhatsAppFloat() {
  const [waNumber, setWaNumber] = useState("");

  useEffect(() => {
    fetch("/api/payment-settings")
      .then((r) => r.json())
      .then((data) => {
        const raw = (data.whatsappNumber || "").replace(/\D/g, "");
        if (raw) {
          setWaNumber(raw.startsWith("0") ? "92" + raw.slice(1) : raw);
        }
      })
      .catch(() => {});
  }, []);

  if (!waNumber) return null;

  const msg = encodeURIComponent(
    "Assalamu Alaikum! I have a question about your books at Learner's Grove."
  );

  return (
    <a
      href={`https://wa.me/${waNumber}?text=${msg}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95"
      style={{ backgroundColor: "#25d366" }}
    >
      {/* Official WhatsApp icon SVG */}
      <svg viewBox="0 0 32 32" className="w-8 h-8" fill="white" xmlns="http://www.w3.org/2000/svg">
        <path d="M16.002 3C9.373 3 4 8.373 4 15.002c0 2.13.558 4.13 1.532 5.867L4 29l8.348-1.51A11.94 11.94 0 0 0 16.002 28C22.63 28 28 22.627 28 15.998 28 9.373 22.63 3 16.002 3Zm6.906 16.63c-.29.816-1.69 1.56-2.308 1.61-.618.052-1.2.247-4.048-.844-3.41-1.308-5.59-4.79-5.757-5.015-.166-.226-1.36-1.81-1.36-3.453 0-1.644.86-2.453 1.165-2.79.305-.337.665-.422.887-.422.221 0 .443 0 .636.01.203.01.476-.077.744.568.29.676.983 2.358 1.07 2.526.087.168.143.363.029.583-.114.22-.172.357-.338.55-.166.193-.35.43-.499.578-.166.166-.34.345-.145.676.193.33.86 1.42 1.847 2.3 1.27 1.13 2.34 1.48 2.67 1.648.33.166.524.14.716-.084.193-.224.824-.96 1.044-1.29.22-.33.44-.276.74-.166.3.11 1.907.899 2.234 1.063.33.165.55.247.635.385.086.137.086.795-.204 1.61Z"/>
      </svg>

      {/* Pulse ring */}
      <span className="absolute inline-flex h-full w-full rounded-full opacity-30 animate-ping" style={{ backgroundColor: "#25d366" }} />
    </a>
  );
}
