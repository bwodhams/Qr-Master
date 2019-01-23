const Hero = require('./hero-model');
const ReadPreference = require('mongodb').ReadPreference;

require('./mongo').connect();

function get(req, res) {
  const docquery = Hero.find({}).read(ReadPreference.NEAREST);
  docquery
    .exec()
    .then(heroes => {
      res.json(heroes);
    })
    .catch(err => {
      res.status(500).send(err);
    });
}

function create(req, res) {
  const { email, name } = req.body;

  const hero = new Hero({ email, name });
  hero
    .save()
    .then(() => {
      res.json(hero);
    })
    .catch(err => {
      res.status(500).send(err);
    });
}

function update(req, res) {
  const { email, name } = req.body;

  Hero.findOne({ email })
    .then(hero => {
      hero.name = name;
      hero.save().then(res.json(hero));
    })
    .catch(err => {
      res.status(500).send(err);
    });
}

function destroy(req, res) {
  const { email } = req.params;

  Hero.findOneAndRemove({ email })
    .then(hero => {
      res.json(hero);
    })
    .catch(err => {
      res.status(500).send(err);
    });
}

module.exports = { get, create, update, destroy };
