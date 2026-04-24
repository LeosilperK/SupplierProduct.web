export type ViaCepResult = {
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
};

export class CepError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CepError';
  }
}

export async function pesquisacep(valor: string): Promise<ViaCepResult | null> {
  // Nova variável "cep" somente com dígitos.
  const cep = valor.replace(/\D/g, '');

  // Verifica se campo cep possui valor informado.
  if (cep === '') {
    return null;
  }

  // Expressão regular para validar o CEP.
  const validacep = /^[0-9]{8}$/;

  // Valida o formato do CEP.
  if (!validacep.test(cep)) {
    throw new CepError('Formato de CEP inválido.');
  }

  const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
  const data = (await response.json()) as {
    erro?: boolean;
    logradouro?: string;
    bairro?: string;
    localidade?: string;
    uf?: string;
  };

  if (!response.ok || data.erro) {
    throw new CepError('CEP não encontrado.');
  }

  return {
    endereco: (data.logradouro ?? '').trim(),
    bairro: (data.bairro ?? '').trim(),
    cidade: (data.localidade ?? '').trim(),
    estado: (data.uf ?? '').trim().toUpperCase(),
  };
}

