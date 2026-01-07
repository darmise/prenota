
const CONFIG = {
  slot: { startHour: "09:00", endHour: "18:00", intervalMinutes: 30 }
};

let selectedDateAdmin = null;

const adminCode = prompt("Inserisci codice admin:");

fetch("https://tuo-backend/verify_admin", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ code: adminCode })
})
.then(res => res.json())
.then(data => {
  if(data.valid){
      document.getElementById("manualForm").style.display = "block";
      document.getElementById("reservationsContainer").style.display = "block";
  } else {
      alert("Codice errato!");
      window.location.href = "505.html";
  }
});
// Genera tutti gli slot giornalieri
function generateSlots() {
  const slots = [];
  let [startH, startM] = CONFIG.slot.startHour.split(":").map(Number);
  let [endH, endM] = CONFIG.slot.endHour.split(":").map(Number);
  let start = new Date(0,0,0,startH,startM);
  const end = new Date(0,0,0,endH,endM);
  while (start < end) {
    const endSlot = new Date(start.getTime() + CONFIG.slot.intervalMinutes*60000);
    slots.push(`${start.getHours().toString().padStart(2,"0")}:${start.getMinutes().toString().padStart(2,"0")} - ${endSlot.getHours().toString().padStart(2,"0")}:${endSlot.getMinutes().toString().padStart(2,"0")}`);
    start = endSlot;
  }
  return slots;
}

// Quando seleziono la data, carica prenotazioni e slot liberi
document.getElementById("datePickerAdmin").addEventListener("change", (e)=>{
  selectedDateAdmin = e.target.value;
  loadAdminReservations(selectedDateAdmin);
  loadAvailableSlots(selectedDateAdmin);
});

// Mostra tutte le prenotazioni effettuate
function loadAdminReservations(date){
  fetch(`backend.py/get_all_bookings?date=${date}`)
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("reservationsContainer");
      container.innerHTML = '';
      if(data.length===0){
        container.textContent = "Nessuna prenotazione";
        return;
      }
      const table = document.createElement("table");
      table.style.width = "100%";
      table.border = "1";
      const header = table.insertRow();
      ["Slot", "Nome", "Contatto", "Data Creazione"].forEach(h => {
        const th = document.createElement("th");
        th.textContent = h;
        header.appendChild(th);
      });
      data.forEach(b => {
        const row = table.insertRow();
        row.insertCell().textContent = b.slot;
        row.insertCell().textContent = b.name;
        row.insertCell().textContent = b.contact;
        row.insertCell().textContent = b.created_at;
      });
      container.appendChild(table);
    });
}

// Carica solo slot liberi per il form di inserimento
function loadAvailableSlots(date){
  fetch(`backend.py?action=get_slots&date=${date}`)
    .then(res=>res.json())
    .then(slots=>{
      const select = document.getElementById("manualSlotSelect");
      select.innerHTML = '';
      if(slots.length===0){
        const option = document.createElement("option");
        option.textContent = "Nessuno slot disponibile";
        option.disabled = true;
        select.appendChild(option);
        return;
      }
      slots.forEach(slot=>{
        const option = document.createElement("option");
        option.value = slot;
        option.textContent = slot;
        select.appendChild(option);
      });
    });
}

// Inserimento prenotazione manuale
function manualBooking(){
  const name = document.getElementById("manualName").value.trim();
  const contact = document.getElementById("manualContact").value.trim();
  const slot = document.getElementById("manualSlotSelect").value;

  if(!name || !contact || !selectedDateAdmin || !slot){
    alert("Compila tutti i campi!");
    return;
  }

  fetch(`backend.py?action=book`, {
    method:"POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({date:selectedDateAdmin, slot, name, contact})
  })
  .then(res=>res.json())
  .then(data=>{
    alert(data.message);
    loadAdminReservations(selectedDateAdmin);
    loadAvailableSlots(selectedDateAdmin);
  });
}




