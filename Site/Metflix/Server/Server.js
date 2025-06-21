//libs
const express = require('express');
const app = express();
const cors = require('cors');
const env = require('dotenv').config();

//rotas
const cadastro = require('./Functions/Cadastro');
const login = require('./Functions/Login');
const planos = require('./Functions/Planos')
const perfis = require('./Functions/Perfis')
const conteudos = require('./Functions/Admin/Conteudos')
app.use(express.json());
app.use(cors());

app.use('/api', cadastro);
app.use('/api', login);
app.use('/api', conteudos)
app.use('/api', planos)
app.use('/api', perfis)

const port = 4000;
app.listen(port, '0.0.0.0', () => {
  console.log('Servidor rodando na porta: ' + port);
});
