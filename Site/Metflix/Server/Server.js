const express = require('express');
const app = express();
const cors = require('cors');
const cadastro = require('./Functions/Cadastro');
const login = require('./Functions/Login');
const conteudo = require('./Functions/Conteudo')
const planos = require('./Functions/Planos')
const perfis = require('./Functions/Perfis')
app.use(express.json());
app.use(cors());

// Prefixando as rotas para evitar conflitos
app.use('/', cadastro);
app.use('/', login);
app.use('/', conteudo)
app.use('/', planos)
app.use('/', perfis)
const port = 4000;
app.listen(port, '0.0.0.0', () => {
  console.log('Servidor rodando na porta: ' + port);
});
