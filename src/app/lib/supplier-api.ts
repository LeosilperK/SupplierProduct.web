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

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
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
    }),
  });
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

export async function getUsuarioAutenticado(token: string) {
  return request<UsuarioAutenticado>('/usuario/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
