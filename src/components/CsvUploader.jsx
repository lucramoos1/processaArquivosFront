import { useState, useRef } from 'react';
import { compararPlanilhas } from '../services/csvService';
import './CsvUploader.css';

export default function CsvUploader() {
  const [planilhaAtual, setPlanilhaAtual] = useState(null);
  const [planilhaAntiga, setPlanilhaAntiga] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  const inputAtualRef = useRef(null);
  const inputAntigaRef = useRef(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro(null);
    setResultado(null);
    setLoading(true);

    try {
      const { blob, novosNomes, totalNovos } = await compararPlanilhas(
        planilhaAtual,
        planilhaAntiga
      );

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'planilha_atualizada.csv';
      link.click();
      URL.revokeObjectURL(url);

      setResultado({ novosNomes, totalNovos });
    } catch (err) {
      if (err.response?.data instanceof Blob) {
        const text = await err.response.data.text();
        setErro(text || 'Erro ao processar os arquivos.');
      } else {
        setErro(err.response?.data || 'Erro ao processar os arquivos. Verifique se a API está rodando.');
      }
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setPlanilhaAtual(null);
    setPlanilhaAntiga(null);
    setResultado(null);
    setErro(null);
    if (inputAtualRef.current) inputAtualRef.current.value = '';
    if (inputAntigaRef.current) inputAntigaRef.current.value = '';
  }

  return (
    <div className="uploader-container">
      <div className="uploader-card">
        <div className="card-header">
          <div className="icon-csv">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <h1>Processador de CSV</h1>
          <p className="subtitle">
            Compare duas planilhas de alunos e identifique os novos nomes adicionados.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="file-inputs">
            <div className="file-group">
              <label htmlFor="planilhaAtual">
                <span className="label-icon">📋</span>
                Planilha Atual
                <span className="label-hint">Lista completa de alunos</span>
              </label>
              <div className={`file-drop ${planilhaAtual ? 'has-file' : ''}`}>
                <input
                  ref={inputAtualRef}
                  id="planilhaAtual"
                  type="file"
                  accept=".csv"
                  onChange={e => setPlanilhaAtual(e.target.files[0])}
                  required
                />
                {planilhaAtual ? (
                  <span className="file-name">{planilhaAtual.name}</span>
                ) : (
                  <span className="file-placeholder">
                    Clique ou arraste um arquivo .csv
                  </span>
                )}
              </div>
            </div>

            <div className="file-group">
              <label htmlFor="planilhaAntiga">
                <span className="label-icon">📂</span>
                Planilha Antiga
                <span className="label-hint">Cópia anterior</span>
              </label>
              <div className={`file-drop ${planilhaAntiga ? 'has-file' : ''}`}>
                <input
                  ref={inputAntigaRef}
                  id="planilhaAntiga"
                  type="file"
                  accept=".csv"
                  onChange={e => setPlanilhaAntiga(e.target.files[0])}
                  required
                />
                {planilhaAntiga ? (
                  <span className="file-name">{planilhaAntiga.name}</span>
                ) : (
                  <span className="file-placeholder">
                    Clique ou arraste um arquivo .csv
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="actions">
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !planilhaAtual || !planilhaAntiga}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Processando...
                </>
              ) : (
                'Comparar e Baixar'
              )}
            </button>

            {(resultado || erro) && (
              <button type="button" className="btn-secondary" onClick={handleReset}>
                Nova comparação
              </button>
            )}
          </div>
        </form>

        {erro && (
          <div className="alert alert-error">
            <span className="alert-icon">❌</span>
            <div>
              <strong>Erro</strong>
              <p>{typeof erro === 'string' ? erro : 'Erro desconhecido ao processar os arquivos.'}</p>
            </div>
          </div>
        )}

        {resultado && (
          <div className="alert alert-success">
            <span className="alert-icon">✅</span>
            <div>
              <strong>Download iniciado!</strong>
              <p>
                Novos alunos adicionados: <strong>{resultado.totalNovos || 0}</strong>
              </p>
              {resultado.novosNomes && (
                <div className="new-names">
                  <span>Nomes novos:</span>
                  <div className="tags">
                    {resultado.novosNomes.split(',').map((nome, i) => (
                      <span key={i} className="tag">{nome.trim()}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="info-section">
          <h3>Como funciona?</h3>
          <ol>
            <li>Selecione a <strong>planilha atual</strong> com todos os alunos do curso.</li>
            <li>Selecione a <strong>planilha antiga</strong> (uma cópia anterior).</li>
            <li>Clique em <strong>Comparar e Baixar</strong>.</li>
            <li>O sistema identifica os nomes novos e gera um arquivo atualizado para download.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
