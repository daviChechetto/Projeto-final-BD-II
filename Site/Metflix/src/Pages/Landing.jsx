import { Link } from 'react-router-dom';
import '../Design/main.css'

function Landing() {
  return (
    <div style={{textAlign:"center"}} className="landing-page">
      <header className="landing-header">
        <h1>Bem-vindos à Plataforma de Streaming mais melhor do mundo!</h1>
        <p className="landing-subtitle">
            A melhor plataforma de streaming de Criciúma e região
        </p>
      </header>

      <section className="landing-features">
        <div className="feature-card">
          <h2>Conteúdo Centralizado</h2>
          <p>Filmes, series e mais, tudo em um só lugar, fácil de encontrar.</p>
        </div>
        <div className="feature-card">
          <h2>Lista e Historio</h2>
          <p>Salve para assistir mais tarde e acompanhe oque você já viu</p>
        </div>
      </section>

      <section className="landing-cta">
        <h2>Comece Agora!</h2>
        <p>Acesse sua conta ou crie um novo cadastro para ter acesso completo.</p>
        <div className="landing-buttons">
        <button style={{marginBottom:"10px"}}><Link to="/Login" className="btn btn-primary">Entrar</Link></button>
        <button><Link to="/Cadastro" className="btn btn-secondary">Cadastrar</Link></button>
        </div>
      </section>

      <footer className="landing-footer-simple">
        <p>&copy; {new Date().getFullYear()} Direitos reservados a Metflix.</p>
      </footer>
    </div>
  );
}

export default Landing;