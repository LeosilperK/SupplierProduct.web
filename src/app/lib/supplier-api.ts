const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

export interface FornecedorData {
  nomeFornecedor: string;
  centroCusto: string | null;
  tipo: string | null;
  codigoFornecedor: string;
  cliFor: string;
  condicaoPgto: string;
  cgcCpf: string;
  inativo: boolean;
  moeda: string | null;
}

export interface LoginResponse {
  token: string;
  login: string;
  nomeFornecedor: string;
  cgcCpf: string;
  expiracao: string;
}

export interface UsuarioAutenticado {
  login: string;
  nomeFornecedor: string;
  cgcCpf: string;
  id: string;
}

export interface ColaboradorLoginResponse {
  token: string;
  login: string;
  nome?: string | null;
  expiracao?: string | null;
}

export interface ProdutoPendenteCompras {
  id: number;
  nomeFornecedor: string;
  cgcCpfFornecedor: string;
  descProduto: string;
  descProdutoNf: string | null;
  referFabricante: string | null;
  ncm: string | null;
  statusFluxo: number;
  dataCadastro: string;
}

export interface ProdutoPendenteFiscal extends ProdutoPendenteCompras {
  cest: string | null;
}

export interface ProdutoAnaliseComprasPayload {
  grupoProduto?: string | null;
  subgrupoProduto?: string | null;
  codCategoria?: string | null;
  codSubcategoria?: string | null;
  unidade?: string | null;
  cest?: string | null;
  tipoStatusProduto?: string | null;
  sexoTipo?: string | null;
  contaContabil?: string | null;
  contaContabilCompra?: string | null;
  contaContabilVenda?: string | null;
  contaContabilDevCompra?: string | null;
  contaContabilDevVenda?: string | null;
  indicadorCfop?: string | null;
  continuidade?: string | null;
  periodoPcp?: string | null;
  redeLojas?: string | null;
  codProdutoSolucao?: string | null;
  sujeitoSubstituicaoTributaria?: string | null;
  codProdutoSegmento?: string | null;
  obsCompras?: string | null;
}

export interface ProdutoAnaliseFiscalPayload {
  ncm?: string | null;
  cest?: string | null;
  tributOrigem?: string | null;
  tributIcms?: string | null;
  tipoItemSped?: string | null;
  idExcecaoGrupo?: string | null;
  classificacaoFiscalFinal?: string | null;
  obsFiscal?: string | null;
}

export interface ReprovarProdutoPayload {
  motivo: string;
}

export interface CadastroFornecedorPayload {
  nomeCliFor: string;
  razaoSocial: string;
  cgcCpf: string;
  pjPf: number;
  rgIe: string;
  cep: string;
  endereco: string;
  cidade: string;
  bairro: string;
  uf: string;
  pais: string;
  ddi: string;
  ddd1: string;
  ddd2: string;
  email: string;
  numero: string;
  complemento: string;
  tipo: string;
  centroCusto: string;
  condicaoPgto: string;
  moeda: string;
  ctbContaContabil: string;
  lxMetodoPagamento: number | null;
  forneceMatConsumo: boolean;
  forneceMateriais: boolean;
  forneceProdAcab: boolean;
  beneficiador: boolean;
  forneceOutros: boolean;
  prop00014: string;
  prop00035: string;
  prop00123: string;
}

export interface FornecedorCadastroCompleto extends CadastroFornecedorPayload {
  id?: number | string | null;
  codigoFornecedor?: string | null;
  cliFor?: string | null;
  nomeFornecedor?: string | null;
  dataCadastro?: string | null;
  inativo?: boolean | null;
}

export interface ProdutoPreCadastroCorPayload {
  codCor: string;
  descCor: string;
  origemCor: string;
  corFabricante: string;
  ncm: string;
}

export interface ProdutoPreCadastroPrecoPayload {
  codigoTabelaPreco: string;
  preco: number;
}

export interface ProdutoPreCadastroFotoPayload {
  corLinx: string;
  nomeArquivo: string;
  caminhoArquivo: string;
  base64Foto: string;
  ordemFoto: number;
}

export interface ProdutoPreCadastroBarraPayload {
  codigoBarra: string;
  corProduto: string;
  tamanho: string;
  grade: string;
}

export interface ProdutoPreCadastroPayload {
  descProduto: string;
  descProdutoNf: string | null;
  referFabricante: string | null;
  ncm: string | null;
  tipoProduto: string | null;
  fabricante: string | null;
  composicao: string | null;
  grade: string | null;
  linha: string | null;
  griffe: string | null;
  colecao: string | null;
  obsFornecedor: string | null;
  cores: ProdutoPreCadastroCorPayload[];
  precos: ProdutoPreCadastroPrecoPayload[];
  fotos: ProdutoPreCadastroFotoPayload[];
  barras: ProdutoPreCadastroBarraPayload[];
}

export interface ProdutoCadastroResumo {
  id: number;
  descProduto: string;
  descProdutoNf: string | null;
  referFabricante: string | null;
  ncm: string | null;
  statusFluxo: number;
  dataCadastro: string;
}

export interface ProdutoCadastroDetalhe {
  id: number;
  descProduto: string;
  descProdutoNf: string | null;
  referFabricante: string | null;
  ncm: string | null;
  tipoProduto: string | null;
  fabricante: string | null;
  composicao: string | null;
  grade: string | null;
  linha: string | null;
  griffe: string | null;
  colecao: string | null;
  obsFornecedor: string | null;
  statusFluxo: number;
  dataCadastro: string;

  cores: Array<{
    id: number;
    codCor: string | null;
    descCor: string | null;
    origemCor: string | null;
    corFabricante: string | null;
    ncm: string | null;
  }>;
  precos: Array<{
    id: number;
    codigoTabelaPreco: string | null;
    preco: number;
  }>;
  fotos: Array<{
    id: number;
    corLinx: string | null;
    nomeArquivo: string | null;
    caminhoArquivo: string | null;
    base64Foto: string | null;
    ordemFoto: number;
  }>;
  barras: Array<{
    id: number;
    codigoBarra: string | null;
    corProduto: string | null;
    tamanho: string | null;
    grade: string | null;
  }>;
}

interface ApiErrorPayload {
  mensagem?: string;
}

interface CadastroFornecedorResponse {
  sucesso: boolean;
  mensagem: string;
  cliforGerado?: string | null;
  fornecedor?: string | null;
}

interface CriarAcessoResponse {
  sucesso: boolean;
  mensagem: string;
  login?: string | null;
  fornecedor?: string | null;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function normalizeText(value: string) {
  return value.trim();
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  const hasBody = init?.body != null;
  const isFormData =
    typeof FormData !== 'undefined' && init?.body instanceof FormData;

  if (hasBody && !isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    let message = 'Não foi possível concluir a operação.';

    try {
      const payload = (await response.json()) as ApiErrorPayload | string;
      if (typeof payload === 'string') {
        message = payload;
      } else if (payload?.mensagem) {
        message = payload.mensagem;
      }
    } catch {
      message = response.statusText || message;
    }

    throw new ApiError(message, response.status);
  }

  return response.json() as Promise<T>;
}

export function sanitizeDocument(value: string) {
  return value.replace(/\D/g, '');
}

export async function getFornecedorByCgcCpf(cgcCpf: string) {
  const document = sanitizeDocument(cgcCpf);
  return request<FornecedorData>(`/fornecedores/por-cgc-cpf/${document}`);
}

export async function cadastrarFornecedor(payload: CadastroFornecedorPayload) {
  return request<CadastroFornecedorResponse>('/fornecedores/cadastro-completo', {
    method: 'POST',
    body: JSON.stringify({
      ...payload,
      cgcCpf: sanitizeDocument(payload.cgcCpf),
      cep: payload.cep.replace(/\D/g, ''),
      nomeCliFor: normalizeText(payload.nomeCliFor),
      razaoSocial: normalizeText(payload.razaoSocial),
      rgIe: normalizeText(payload.rgIe),
      endereco: normalizeText(payload.endereco),
      cidade: normalizeText(payload.cidade),
      bairro: normalizeText(payload.bairro),
      uf: normalizeText(payload.uf).toUpperCase(),
      pais: normalizeText(payload.pais),
      email: normalizeText(payload.email),
      numero: normalizeText(payload.numero),
      complemento: normalizeText(payload.complemento),
      tipo: normalizeText(payload.tipo),
      centroCusto: normalizeText(payload.centroCusto),
      condicaoPgto: normalizeText(payload.condicaoPgto),
      moeda: normalizeText(payload.moeda),
      ctbContaContabil: normalizeText(payload.ctbContaContabil),
    }),
  });
}

export async function getFornecedorCadastroCompletoByCgcCpf(cgcCpf: string) {
  const document = sanitizeDocument(cgcCpf);
  // Contrato esperado: endpoint retorna o cadastro completo (mesmos campos do POST).
  // Ajuste o path se sua API expuser por outro recurso.
  return request<FornecedorCadastroCompleto>(`/fornecedores/cadastro-completo/${document}`);
}

export async function criarAcessoFornecedor(payload: {
  cgcCpf: string;
  login: string;
  senha: string;
}) {
  return request<CriarAcessoResponse>('/fornecedores/acesso', {
    method: 'POST',
    body: JSON.stringify({
      ...payload,
      cgcCpf: sanitizeDocument(payload.cgcCpf),
    }),
  });
}

export async function loginFornecedor(payload: { login: string; senha: string }) {
  return request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function loginColaborador(payload: { login: string; senha: string }) {
  // Endpoint esperado na API: autenticação AD/Windows para colaborador.
  // Ajuste o path caso sua API use outro contrato.
  return request<ColaboradorLoginResponse>('/auth/colaborador/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getUsuarioAutenticado(token: string) {
  return request<UsuarioAutenticado>('/usuario/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function listarPendentesCompras(token: string) {
  return request<ProdutoPendenteCompras[]>('/produtos/pendentes-compras', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function listarPendentesFiscal(token: string) {
  return request<ProdutoPendenteFiscal[]>('/produtos/pendentes-fiscal', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function iniciarAnaliseCompras(token: string, id: number, payload: ProdutoAnaliseComprasPayload) {
  return request<{ mensagem: string; id: number; statusFluxo: number }>(`/produtos/${id}/iniciar-analise-compras`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function iniciarAnaliseFiscal(token: string, id: number, payload: ProdutoAnaliseFiscalPayload) {
  return request<{ mensagem: string; id: number; statusFluxo: number }>(`/produtos/${id}/iniciar-analise-fiscal`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function aprovarCompras(token: string, id: number) {
  return request<{ mensagem: string; id: number; statusFluxo: number }>(`/produtos/${id}/aprovar-compras`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function reprovarCompras(token: string, id: number, payload: ReprovarProdutoPayload) {
  return request<{ mensagem: string; id: number; statusFluxo: number }>(`/produtos/${id}/reprovar-compras`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function aprovarFiscal(token: string, id: number) {
  return request<{ mensagem: string; id: number; statusFluxo: number }>(`/produtos/${id}/aprovar-fiscal`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function reprovarFiscal(token: string, id: number, payload: ReprovarProdutoPayload) {
  return request<{ mensagem: string; id: number; statusFluxo: number }>(`/produtos/${id}/reprovar-fiscal`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function integrarProdutoErp(token: string, id: number) {
  return request<{ mensagem: string; id: number; statusFluxo: number }>(`/produtos/${id}/integrar-erp`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function criarPreCadastroProduto(token: string, payload: ProdutoPreCadastroPayload) {
  return request<{ mensagem: string; id: number; statusFluxo: number }>('/produtos/pre-cadastro', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function atualizarPreCadastroProduto(token: string, id: number, payload: ProdutoPreCadastroPayload) {
  return request<{ mensagem: string; id: number; statusFluxo: number }>(`/produtos/pre-cadastro/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function listarMeusCadastrosProdutos(token: string) {
  return request<ProdutoCadastroResumo[]>('/produtos/meus-cadastros', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function obterDetalheProduto(token: string, id: number) {
  return request<ProdutoCadastroDetalhe>(`/produtos/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function enviarProdutoParaCompras(token: string, id: number) {
  return request<{ mensagem: string; id: number; statusFluxo: number }>(`/produtos/${id}/enviar-para-compras`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
