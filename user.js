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
  fetch(`backend.py?action=get_slots&date=${date}`)
    .then(res => res.json())
    .then(slots => {
      const container = document.getElementById("slotsContainer");
      container.innerHTML = '';
      if (slots.length === 0) {
        container.textContent = "Nessuno slot disponibile per questa data";
        document.getElementById("bookingForm").style.display = "none";
        return;
      }
      slots.forEach(slot => {
        const btn = document.createElement("button");
        btn.textContent = slot;
        btn.onclick = () => {
          selectedSlot = slot;
          document.getElementById("bookingForm").style.display = "block";
        };
        container.appendChild(btn);
      });
      document.getElementById("bookingForm").style.display = "none";
    });
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
