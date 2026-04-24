import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Layout } from './Layout';
import { ArrowLeft, Building2, FileText, MapPin, Phone, DollarSign, Package } from 'lucide-react';
import { toast } from 'sonner';
import { CepError, pesquisacep } from '../lib/viacep';
import {
  cadastrarFornecedor,
  criarAcessoFornecedor,
  getFornecedorByCgcCpf,
  sanitizeDocument,
  type CadastroFornecedorPayload,
} from '../lib/supplier-api';

interface FornecedorFormData {
  nomeCliFor: string;
  razaoSocial: string;
  cgcCpf: string;
  pjPf: number;
  rgIe: string;
  inscricaoMunicipal: string;
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
  login: string;
  senha: string;
  confirmarSenha: string;
}

export function FornecedorCadastro() {
  const navigate = useNavigate();
  const location = useLocation();
  const cnpjFromState = location.state?.cnpj || '';

  const [formData, setFormData] = useState<FornecedorFormData>({
    nomeCliFor: '',
    razaoSocial: '',
    cgcCpf: cnpjFromState,
    pjPf: 0,
    rgIe: '',
    inscricaoMunicipal: '',
    cep: '',
    endereco: '',
    cidade: '',
    bairro: '',
    uf: '',
    pais: 'Brasil',
    ddi: '+55',
    ddd1: '',
    ddd2: '',
    email: '',
    numero: '',
    complemento: '',
    tipo: '',
    centroCusto: '',
    condicaoPgto: '',
    moeda: 'BRL',
    ctbContaContabil: '',
    lxMetodoPagamento: null,
    forneceMatConsumo: false,
    forneceMateriais: false,
    forneceProdAcab: false,
    beneficiador: false,
    forneceOutros: false,
    prop00014: '',
    prop00035: '',
    prop00123: '',
    login: '',
    senha: '',
    confirmarSenha: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCepLoading, setIsCepLoading] = useState(false);
  const cepNumbers = useMemo(() => formData.cep.replace(/\D/g, ''), [formData.cep]);

  const canLookupCep = useMemo(() => cepNumbers.length === 8, [cepNumbers.length]);

  useEffect(() => {
    if (!canLookupCep) {
      return;
    }

    let isCancelled = false;

    const lookupCep = async () => {
      setIsCepLoading(true);

      try {
        const result = await pesquisacep(cepNumbers);

        if (isCancelled || !result) {
          return;
        }

        setFormData((current) => ({
          ...current,
          endereco: result.endereco || current.endereco,
          bairro: result.bairro || current.bairro,
          cidade: result.cidade || current.cidade,
          uf: result.estado || current.uf,
          pais: current.pais || 'Brasil',
        }));
      } catch (error) {
        if (!isCancelled) {
          toast.error('Não foi possível consultar o CEP.', {
            description:
              error instanceof CepError
                ? error.message
                : error instanceof Error
                  ? error.message
                  : 'Tente novamente em instantes.',
          });
        }
      } finally {
        if (!isCancelled) {
          setIsCepLoading(false);
        }
      }
    };

    void lookupCep();

    return () => {
      isCancelled = true;
    };
  }, [canLookupCep, cepNumbers]);

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 8) {
      return numbers.replace(/^(\d{5})(\d)/, '$1-$2');
    }
    return value;
  };

  const handleChange = (field: keyof FornecedorFormData, value: string | number | boolean | null) => {
    if (field === 'cep' && typeof value === 'string') {
      setFormData({ ...formData, [field]: formatCEP(value) });
    } else if (field === 'uf' && typeof value === 'string') {
      setFormData({ ...formData, [field]: value.toUpperCase().trim() });
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleSubmit = async () => {
    if (formData.senha !== formData.confirmarSenha) {
      toast.error('As senhas não conferem.');
      return;
    }

    setIsSubmitting(true);

    try {
      const cadastroPayload: CadastroFornecedorPayload = {
        nomeCliFor: formData.nomeCliFor,
        razaoSocial: formData.razaoSocial,
        cgcCpf: formData.cgcCpf,
        pjPf: formData.pjPf,
        rgIe: formData.rgIe,
        cep: formData.cep,
        endereco: formData.endereco,
        cidade: formData.cidade,
        bairro: formData.bairro,
        uf: formData.uf,
        pais: formData.pais,
        ddi: formData.ddi,
        ddd1: formData.ddd1,
        ddd2: formData.ddd2,
        email: formData.email,
        numero: formData.numero,
        complemento: formData.complemento,
        tipo: formData.tipo,
        centroCusto: formData.centroCusto,
        condicaoPgto: formData.condicaoPgto,
        moeda: formData.moeda,
        ctbContaContabil: formData.ctbContaContabil,
        lxMetodoPagamento: formData.lxMetodoPagamento,
        forneceMatConsumo: formData.forneceMatConsumo,
        forneceMateriais: formData.forneceMateriais,
        forneceProdAcab: formData.forneceProdAcab,
        beneficiador: formData.beneficiador,
        forneceOutros: formData.forneceOutros,
        prop00014: formData.prop00014 || '1',
        prop00035: formData.prop00035 || 'LEADTIME',
        prop00123: formData.prop00123 || '0',
      };

      const cadastroResponse = await cadastrarFornecedor(cadastroPayload);

      if (!cadastroResponse.sucesso) {
        throw new Error(cadastroResponse.mensagem || 'Não foi possível cadastrar o fornecedor.');
      }

      const acessoResponse = await criarAcessoFornecedor({
        cgcCpf: formData.cgcCpf,
        login: formData.login,
        senha: formData.senha,
      });

      if (!acessoResponse.sucesso) {
        throw new Error(acessoResponse.mensagem || 'Não foi possível criar o acesso do fornecedor.');
      }

      const fornecedorData = await getFornecedorByCgcCpf(sanitizeDocument(formData.cgcCpf));

      toast.success('Cadastro realizado com sucesso!', {
        description: 'Faça login para acessar o sistema.',
        duration: 2000,
      });

      setTimeout(() => {
        navigate('/fornecedor/login', {
          state: {
            fornecedorData,
            cgcCpf: fornecedorData.cgcCpf,
          },
        });
      }, 1200);
    } catch (error) {
      toast.error('Erro ao cadastrar fornecedor', {
        description: error instanceof Error ? error.message : 'Tente novamente em instantes.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    formData.razaoSocial &&
    formData.email &&
    formData.nomeCliFor &&
    formData.login &&
    formData.senha &&
    formData.confirmarSenha;

  return (
    <Layout>
      <div className="w-full max-w-6xl py-8">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 border-2 border-white/20 shadow-2xl animate-[fadeIn_0.6s_ease-out]">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Cadastro de Fornecedor
            </h1>
            <div className="w-24 h-1 bg-white/40 mx-auto rounded-full mb-6"></div>
            <p className="text-white/80 text-lg" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
              CNPJ não encontrado. Preencha os dados para continuar
            </p>
          </div>

          {/* Form */}
          <div className="space-y-8">
            {/* Dados Básicos */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <Building2 className="w-6 h-6 text-white" />
                <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Dados Básicos
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-white/90 mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                    CNPJ/CPF
                  </label>
                  <input
                    type="text"
                    value={formData.cgcCpf}
                    disabled
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white/60 cursor-not-allowed"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  />
                </div>

                <div>
                  <label className="block text-white/90 mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                    Tipo *
                  </label>
                  <select
                    value={formData.pjPf}
                    onChange={(e) => handleChange('pjPf', Number(e.target.value))}
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  >
                    <option value={0} className="bg-[#ca0404] text-white">Pessoa Jurídica</option>
                    <option value={1} className="bg-[#ca0404] text-white">Pessoa Física</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-white/90 mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                    Razão Social *
                  </label>
                  <input
                    type="text"
                    value={formData.razaoSocial}
                    onChange={(e) => handleChange('razaoSocial', e.target.value)}
                    placeholder="Digite a razão social"
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-white/90 mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                    Nome Fantasia *
                  </label>
                  <input
                    type="text"
                    value={formData.nomeCliFor}
                    onChange={(e) => handleChange('nomeCliFor', e.target.value)}
                    placeholder="Digite o nome fantasia"
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  />
                </div>

                <div>
                  <label className="block text-white/90 mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                    RG/IE
                  </label>
                  <input
                    type="text"
                    value={formData.rgIe}
                    onChange={(e) => handleChange('rgIe', e.target.value)}
                    placeholder="Digite RG ou Inscrição Estadual"
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  />
                </div>

                <div>
                  <label className="block text-white/90 mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                    Inscrição Municipal
                  </label>
                  <input
                    type="text"
                    value={formData.inscricaoMunicipal}
                    onChange={(e) => handleChange('inscricaoMunicipal', e.target.value)}
                    placeholder="Digite a inscrição municipal"
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  />
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="w-6 h-6 text-white" />
                <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Endereço
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-white/90 mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                    CEP
                  </label>
                  <input
                    type="text"
                    value={formData.cep}
                    onChange={(e) => handleChange('cep', e.target.value)}
                    placeholder="00000-000"
                    maxLength={9}
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  />
                  <p className="text-white/60 text-sm mt-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                    {isCepLoading ? 'Consultando CEP...' : 'Ao preencher o CEP, cidade/UF são validados automaticamente.'}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-white/90 mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                    Endereço
                  </label>
                  <input
                    type="text"
                    value={formData.endereco}
                    onChange={(e) => handleChange('endereco', e.target.value)}
                    placeholder="Rua, Avenida, etc."
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  />
                </div>

                <div>
                  <label className="block text-white/90 mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                    Número
                  </label>
                  <input
                    type="text"
                    value={formData.numero}
                    onChange={(e) => handleChange('numero', e.target.value)}
                    placeholder="Nº"
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-white/90 mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                    Complemento
                  </label>
                  <input
                    type="text"
                    value={formData.complemento}
                    onChange={(e) => handleChange('complemento', e.target.value)}
                    placeholder="Apto, Sala, Bloco, etc."
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  />
                </div>

                <div>
                  <label className="block text-white/90 mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                    Bairro
                  </label>
                  <input
                    type="text"
                    value={formData.bairro}
                    onChange={(e) => handleChange('bairro', e.target.value)}
                    placeholder="Bairro"
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  />
                </div>

                <div>
                  <label className="block text-white/90 mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={formData.cidade}
                    onChange={(e) => handleChange('cidade', e.target.value)}
                    placeholder="Cidade"
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  />
                </div>

                <div>
                  <label className="block text-white/90 mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                    UF
                  </label>
                  <input
                    type="text"
                    value={formData.uf}
                    onChange={(e) => handleChange('uf', e.target.value)}
                    placeholder="SP"
                    maxLength={2}
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300 uppercase"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  />
                </div>

                <div>
                  <label className="block text-white/90 mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                    País
                  </label>
                  <input
                    type="text"
                    value={formData.pais}
                    onChange={(e) => handleChange('pais', e.target.value)}
                    placeholder="País"
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  />
                </div>
              </div>
            </div>

            {/* Contato */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <Phone className="w-6 h-6 text-white" />
                <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Contato
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <div>
                  <label className="block text-white/90 mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                    DDI
                  </label>
                  <input
                    type="text"
                    value={formData.ddi}
                    onChange={(e) => handleChange('ddi', e.target.value)}
                    placeholder="+55"
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  />
                </div>

                <div>
                  <label className="block text-white/90 mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                    DDD 1
                  </label>
                  <input
                    type="text"
                    value={formData.ddd1}
                    onChange={(e) => handleChange('ddd1', e.target.value)}
                    placeholder="11"
                    maxLength={3}
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  />
                </div>

                <div>
                  <label className="block text-white/90 mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                    DDD 2
                  </label>
                  <input
                    type="text"
                    value={formData.ddd2}
                    onChange={(e) => handleChange('ddd2', e.target.value)}
                    placeholder="11"
                    maxLength={3}
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  />
                </div>

                <div>
                  <label className="block text-white/90 mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                    E-mail *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="exemplo@empresa.com.br"
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  />
                </div>
              </div>
            </div>

            {/* Dados Financeiros */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <DollarSign className="w-6 h-6 text-white" />
                <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Dados Financeiros
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-white/90 mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                    Tipo
                  </label>
                  <input
                    type="text"
                    value={formData.tipo}
                    onChange={(e) => handleChange('tipo', e.target.value)}
                    placeholder="Tipo de fornecedor"
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  />
                </div>

                <div>
                  <label className="block text-white/90 mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                    Centro de Custo
                  </label>
                  <input
                    type="text"
                    value={formData.centroCusto}
                    onChange={(e) => handleChange('centroCusto', e.target.value)}
                    placeholder="Centro de custo"
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  />
                </div>

                <div>
                  <label className="block text-white/90 mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                    Condição de Pagamento
                  </label>
                  <input
                    type="text"
                    value={formData.condicaoPgto}
                    onChange={(e) => handleChange('condicaoPgto', e.target.value)}
                    placeholder="Ex: 30 dias"
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  />
                </div>

                <div>
                  <label className="block text-white/90 mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                    Moeda
                  </label>
                  <input
                    type="text"
                    value={formData.moeda}
                    onChange={(e) => handleChange('moeda', e.target.value)}
                    placeholder="BRL"
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  />
                </div>

                <div>
                  <label className="block text-white/90 mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                    Conta Contábil
                  </label>
                  <input
                    type="text"
                    value={formData.ctbContaContabil}
                    onChange={(e) => handleChange('ctbContaContabil', e.target.value)}
                    placeholder="Conta contábil"
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  />
                </div>

                <div>
                  <label className="block text-white/90 mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                    Método de Pagamento
                  </label>
                  <select
                    value={formData.lxMetodoPagamento ?? ''}
                    onChange={(e) =>
                      handleChange(
                        'lxMetodoPagamento',
                        e.target.value === '' ? null : Number(e.target.value),
                      )
                    }
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  >
                    <option value="" className="bg-[#ca0404] text-white">
                      Selecione...
                    </option>
                    <option value={0} className="bg-[#ca0404] text-white">
                      Boleto
                    </option>
                    <option value={1} className="bg-[#ca0404] text-white">
                      Transferência
                    </option>
                    <option value={2} className="bg-[#ca0404] text-white">
                      Pix
                    </option>
                    <option value={3} className="bg-[#ca0404] text-white">
                      Outros
                    </option>
                  </select>
                </div>
              </div>
            </div>

            {/* Tipo de Fornecimento */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <Package className="w-6 h-6 text-white" />
                <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Tipo de Fornecimento
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'forneceMatConsumo', label: 'Fornece Material de Consumo' },
                  { key: 'forneceMateriais', label: 'Fornece Materiais' },
                  { key: 'forneceProdAcab', label: 'Fornece Produtos Acabados' },
                  { key: 'beneficiador', label: 'Beneficiador' },
                  { key: 'forneceOutros', label: 'Fornece Outros' },
                ].map((item) => (
                  <label key={item.key} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData[item.key as keyof FornecedorFormData] as boolean}
                      onChange={(e) => handleChange(item.key as keyof FornecedorFormData, e.target.checked)}
                      className="w-5 h-5 rounded border-2 border-white/30 bg-white/20 checked:bg-white checked:border-white focus:outline-none focus:ring-2 focus:ring-white/40 transition-all duration-300 cursor-pointer"
                    />
                    <span className="text-white/90 group-hover:text-white transition-colors" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Campos Customizados */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="w-6 h-6 text-white" />
                <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Informações Adicionais
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-white/90 mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                    Propriedade 00014
                  </label>
                  <input
                    type="text"
                    value={formData.prop00014}
                    onChange={(e) => handleChange('prop00014', e.target.value)}
                    placeholder="Campo customizado"
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  />
                </div>

                <div>
                  <label className="block text-white/90 mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                    Propriedade 00035
                  </label>
                  <input
                    type="text"
                    value={formData.prop00035}
                    onChange={(e) => handleChange('prop00035', e.target.value)}
                    placeholder="Campo customizado"
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  />
                </div>

                <div>
                  <label className="block text-white/90 mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                    Propriedade 00123
                  </label>
                  <input
                    type="text"
                    value={formData.prop00123}
                    onChange={(e) => handleChange('prop00123', e.target.value)}
                    placeholder="Campo customizado"
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="w-6 h-6 text-white" />
                <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Acesso ao Portal
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-white/90 mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                    Login *
                  </label>
                  <input
                    type="text"
                    value={formData.login}
                    onChange={(e) => handleChange('login', e.target.value)}
                    placeholder="Crie seu login"
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  />
                </div>

                <div>
                  <label className="block text-white/90 mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                    Senha *
                  </label>
                  <input
                    type="password"
                    value={formData.senha}
                    onChange={(e) => handleChange('senha', e.target.value)}
                    placeholder="Crie sua senha"
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  />
                </div>

                <div>
                  <label className="block text-white/90 mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                    Confirmar senha *
                  </label>
                  <input
                    type="password"
                    value={formData.confirmarSenha}
                    onChange={(e) => handleChange('confirmarSenha', e.target.value)}
                    placeholder="Repita sua senha"
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4 pt-4">
              <button
                onClick={handleSubmit}
                disabled={!isFormValid || isSubmitting}
                className="w-full bg-white text-[#ca0404] py-5 px-8 rounded-xl text-xl font-semibold hover:bg-white/90 disabled:bg-white/20 disabled:text-white/40 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                {isSubmitting ? 'Cadastrando...' : 'Cadastrar Fornecedor'}
              </button>

              <button
                onClick={() => navigate('/fornecedor/cnpj')}
                className="w-full flex items-center justify-center text-white/80 hover:text-white text-lg transition-colors duration-300 py-4"
                style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Já possui cadastro? Voltar
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
