import { Link } from 'react-router-dom';
import '../Design/main.css'

function Landing() {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <h1>Bem-vinde à Plataforma de Streaming mais melhor do mundo!</h1>
        <p className="landing-subtitle">
            Bem vinde ao melhor streaming de Criciúma e região
        </p>
      </header>

      <section className="landing-features">
        <div className="feature-card">
          <h2>Conteúdo Centralizado</h2>
          <p>Filmes, series e mais, tudo em um só lugar, fácil de encontrar.</p>
        </div>
        <div className="feature-card">
          <h2>Busca Inteligente</h2>
          <p>Encontre exatamente o que busca com nossa ferramenta de streaming.</p>
        </div>
        <div className="feature-card">
          <h2>Acesso Personalizado</h2>
          <p>Materiais selecionados e direcionados para suas necessidades.</p>
        </div>
      </section>

      <section className="landing-cta">
        <h2>Comece Agora!</h2>
        <p>Acesse sua conta ou crie um novo cadastro para ter acesso completo.</p>
        <div className="landing-buttons">
          <Link to="/Login" className="btn btn-primary">
            Entrar
          </Link>
          <Link to="/Cadastro" className="btn btn-secondary">
            Cadastrar
          </Link>
        </div>
      </section>

      {/* Opcionalmente, um footer simples específico para a landing page,
          ou você pode optar por não ter footer aqui. */}
      <footer className="landing-footer-simple">
        <p>&copy; {new Date().getFullYear()} Ariane Soluções Digitais.</p>
      </footer>
    </div>
  );
}

export default Landing;