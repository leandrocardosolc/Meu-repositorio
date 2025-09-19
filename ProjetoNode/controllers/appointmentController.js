const fs = require("fs");
const path = require("path");
const services = require("../data/services.json");
const appointmentsFile = path.join(__dirname, "../data/appointments.json");

function loadAppointments() {
  return JSON.parse(fs.readFileSync(appointmentsFile, "utf8"));
}
function saveAppointments(data) {
  fs.writeFileSync(appointmentsFile, JSON.stringify(data, null, 2));
}

exports.createForm = (req, res) => {
  res.render("appointmentForm", { services });
};

exports.create = (req, res) => {
  const appointments = loadAppointments();
  const newAppt = {
    id: appointments.length + 1,
    clientName: req.body.clientName,
    phone: req.body.phone,
    serviceId: parseInt(req.body.serviceId),
    date: req.body.date,
    notes: req.body.notes
  };
  appointments.push(newAppt);
  saveAppointments(appointments);
  res.redirect(`/appointments/confirmation/${newAppt.id}`);
};

exports.confirmation = (req, res) => {
  const appointments = loadAppointments();
  const appt = appointments.find(a => a.id == req.params.id);
  if (!appt) return res.status(404).send("Agendamento não encontrado");
  const service = services.find(s => s.id === appt.serviceId);
  res.render("appointmentConfirmation", { appt, service });
};
