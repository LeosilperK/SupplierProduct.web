/** Helpers alinhados à validação de integração ERP (PRODUTO → FORNECEDORES / CTB_LX_INDICADOR_CFOP). */

export function normalizeIndicadorCfopForPersist(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;
  if (/^\d{1,3}$/.test(s)) {
    const n = Number(s);
    if (n >= 0 && n <= 255) return String(n);
    return null;
  }
  const m = s.match(/^\s*(\d{1,3})\s*[—\-–]/);
  if (m) {
    const n = Number(m[1]);
    if (n >= 0 && n <= 255) return String(m[1]);
  }
  return null;
}

export function resolveFabricanteCodigoErpSalvo(
  raw: string,
  options: { value: string; label: string }[],
): string {
  const s = raw.trim();
  if (!s) return '';
  if (options.some((o) => o.value === s)) return s;
  const byCodFornecedor = options.find((o) => {
    const m = /\(([^)]+)\)\s*$/.exec(o.label);
    return m && m[1].trim() === s;
  });
  return byCodFornecedor?.value ?? s;
}

/** Combo ERP «código — descrição»: persiste somente o código. */
export function resolveCodigoDescricaoComboSalvo(
  raw: string,
  options: { value: string; label: string }[],
): string {
  const s = raw.trim();
  if (!s) return '';
  if (options.some((o) => o.value === s)) return s;
  const byLabel = options.find((o) => o.label === s);
  if (byLabel) return byLabel.value;
  const sep = ' — ';
  const byCodigoOuDescricao = options.find((o) => {
    const idx = o.label.indexOf(sep);
    if (idx < 0) return o.label === s;
    const codigo = o.label.slice(0, idx);
    const descricao = o.label.slice(idx + sep.length);
    return codigo === s || descricao === s;
  });
  if (byCodigoOuDescricao) return byCodigoOuDescricao.value;
  const m = s.match(/^([^—\-–]+?)\s*[—\-–]/);
  if (m) {
    const cod = m[1].trim();
    if (options.some((o) => o.value === cod)) return cod;
    return cod;
  }
  return s;
}
