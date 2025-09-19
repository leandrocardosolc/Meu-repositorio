const services = require("../data/services.json");

exports.list = (req, res) => {
  res.render("services", { services });
};

exports.details = (req, res) => {
  const id = parseInt(req.params.id);
  const service = services.find(s => s.id === id);
  if (!service) return res.status(404).send("Serviço não encontrado");
  res.render("serviceDetails", { service });
};
