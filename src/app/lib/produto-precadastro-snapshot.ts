import type { ProdutoPreCadastroPayload } from './supplier-api';

/** Persiste o último payload enviado com sucesso — o GET /produtos/:id não devolve todos os campos do pré-cadastro. */
const key = (id: number) => `supplierproduct:precadastro-payload:v1:${id}`;

export function saveProdutoPreCadastroSnapshot(id: number, payload: ProdutoPreCadastroPayload) {
  try {
    localStorage.setItem(key(id), JSON.stringify(payload));
  } catch {
    // quota / private mode
  }
}

export function loadProdutoPreCadastroSnapshot(id: number): ProdutoPreCadastroPayload | null {
  try {
    const raw = localStorage.getItem(key(id));
    if (!raw) return null;
    return JSON.parse(raw) as ProdutoPreCadastroPayload;
  } catch {
    return null;
  }
}
