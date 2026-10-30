/** Rodapé partilhado por todas as rotas /print/* — antes só a avaliação de
 * scouting tinha rodapé; as outras 5 páginas não tinham nenhum. */
export function PrintFooter() {
  return (
    <footer className="print-footer">
      <span>Perfil de Desempenho</span>
      <span>Documento confidencial</span>
    </footer>
  );
}
