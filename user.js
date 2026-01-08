const CONFIG = {
  businessName: "Test Studio",
  slot: { startHour: "09:00", endHour: "18:00", intervalMinutes: 30 },
  bookingPeriod: { startDate: "2026-01-01", endDate: "2026-01-30" }
};

document.getElementById("businessName").textContent = CONFIG.businessName;

let selectedDate = null;
let selectedSlot = null;

document.getElementById("datePicker").addEventListener("change", (e) => {
  selectedDate = e.target.value;
  loadSlots(selectedDate);
});

// Carica solo slot liberi dal backend
function loadSlots(date) {
  fetch("https://api.github.com/repos/darmise/prenotaprivate/actions/workflows/booking.yml/dispatches", {
    method: "POST",
    headers: {
      "Accept": "application/vnd.github+json"
    },
    body: JSON.stringify({
      ref: "main",
      inputs: {
        action: "get_slots",
        payload: JSON.stringify({ date })
      }
    })
  })
  .then(res => {
    if (!res.ok) throw new Error("Errore backend");
    return res.json(); // ⚠️ qui NON arriva JSON diretto
  })
  .then(() => {
    console.warn("GitHub Actions non restituisce risposta diretta");
  });
}

}

function submitBooking() {
  const name = document.getElementById("name").value.trim();
  const contact = document.getElementById("contact").value.trim();

  if(!name || !contact || !selectedDate || !selectedSlot){
    alert("Compila tutti i campi!");
    return;
  }

  fetch(`backend.py?action=book`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({date:selectedDate, slot:selectedSlot, name, contact})
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message);
    document.getElementById("form").style.display = "none";
    loadSlots(selectedDate); // Aggiorna slot disponibili
  });
}
