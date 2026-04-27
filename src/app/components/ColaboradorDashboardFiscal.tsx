import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Layout } from './Layout';
import { LogOut, CheckCircle, XCircle, Filter, Eye } from 'lucide-react';
import { ImageWithFallback } from './ui/image-with-fallback';
import { toast } from 'sonner';
import { ProdutoDetalhesModal } from './ProdutoDetalhesModal';
import { FornecedorDetalhesModal } from './FornecedorDetalhesModal';
import { ApiError, getFornecedorCadastroCompletoByCgcCpf, type FornecedorCadastroCompleto } from '../lib/supplier-api';

interface Cor {
  codCor: string;
  descCor: string;
  origemCor: string;
  corFabricante: string;
  ncm: string;
}

interface Preco {
  codigoTabelaPreco: string;
  preco: number;
}

interface Foto {
  corLinx: string;
  nomeArquivo: string;
  caminhoArquivo: string;
  base64Foto: string;
  ordemFoto: number;
}

interface Barra {
  codigoBarra: string;
  corProduto: string;
  tamanho: string;
  grade: string;
}

interface Product {
  id: number;
  descProduto: string;
  descProdutoNf: string;
  referFabricante: string;
  ncm: string;
  statusFluxo: number;
  dataCadastro: string;
  fornecedor: string;
  tipoProduto?: string;
  fabricante?: string;
  composicao?: string;
  grade?: string;
  linha?: string;
  griffe?: string;
  colecao?: string;
  obsFornecedor?: string;
  cores?: Cor[];
  precos?: Preco[];
  fotos?: Foto[];
  barras?: Barra[];
}

interface Fornecedor {
  id: number;
  nomeFornecedor: string;
  cgcCpf: string;
  centroCusto: string;
  tipo: string;
  condicaoPgto: string;
  moeda: string;
  statusAprovacao: 'pendente' | 'aprovado' | 'reprovado';
  dataCadastro: string;
}

const STATUS_FLUXO: { [key: number]: string } = {
  1: 'Pré-Cadastro Fornecedor',
  2: 'Aguardando Compras',
  3: 'Em Análise Compras',
  4: 'Aguardando Fiscal',
  5: 'Em Análise Fiscal',
  6: 'Aprovado para Integração',
  7: 'Integrado ERP',
  8: 'Reprovado Compras',
  9: 'Reprovado Fiscal',
};

const getStatusColor = (status: number) => {
  switch (status) {
    case 1:
      return 'bg-blue-500/20 text-blue-100 border-blue-400/30';
    case 2:
      return 'bg-yellow-500/20 text-yellow-100 border-yellow-400/30';
    case 3:
      return 'bg-orange-500/20 text-orange-100 border-orange-400/30';
    case 4:
      return 'bg-purple-500/20 text-purple-100 border-purple-400/30';
    case 5:
      return 'bg-indigo-500/20 text-indigo-100 border-indigo-400/30';
    case 6:
      return 'bg-green-500/20 text-green-100 border-green-400/30';
    case 7:
      return 'bg-emerald-500/20 text-emerald-100 border-emerald-400/30';
    case 8:
      return 'bg-red-500/20 text-red-100 border-red-400/30';
    case 9:
      return 'bg-red-500/20 text-red-100 border-red-400/30';
    default:
      return 'bg-gray-500/20 text-gray-100 border-gray-400/30';
  }
};

type FilterType = 'all' | 'aguardando' | 'analise' | 'aprovado' | 'integrado';
type ViewType = 'produtos' | 'fornecedores';

export function ColaboradorDashboardFiscal() {
  const navigate = useNavigate();
  const location = useLocation();
  const userName = location.state?.userName || 'Usuário';

  const [viewType, setViewType] = useState<ViewType>('produtos');
  const [activeFilter, setActiveFilter] = useState<FilterType>('aguardando');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedFornecedor, setSelectedFornecedor] = useState<Fornecedor | null>(null);
  const [fornecedorDetalhe, setFornecedorDetalhe] = useState<FornecedorCadastroCompleto | null>(null);
  const [isFornecedorModalOpen, setIsFornecedorModalOpen] = useState(false);
  const [isLoadingFornecedorDetalhe, setIsLoadingFornecedorDetalhe] = useState(false);
  const [products, setProducts] = useState<Product[]>([
    {
      id: 1,
      descProduto: 'Tenis Teste Atualizado',
      descProdutoNf: 'Tenis Teste NF Atualizado',
      referFabricante: 'REF999',
      ncm: '64041100',
      statusFluxo: 4,
      dataCadastro: '2026-04-16T15:47:56.1108294',
      fornecedor: 'TESTE API FORNECEDOR 3',
      tipoProduto: 'Calçado Esportivo',
      fabricante: 'Nike Brasil',
      composicao: '60% Sintético, 40% Tecido',
      grade: '36, 37, 38, 39, 40, 41, 42',
      linha: 'Performance',
      griffe: 'Nike',
      colecao: 'Verão 2026',
      obsFornecedor: 'Produto importado. Entrega em 15 dias úteis.',
      cores: [
        { codCor: '001', descCor: 'Preto', origemCor: 'Nacional', corFabricante: 'Black 001', ncm: '64041100' },
        { codCor: '002', descCor: 'Branco', origemCor: 'Nacional', corFabricante: 'White 002', ncm: '64041100' },
      ],
      precos: [
        { codigoTabelaPreco: 'TAB001', preco: 299.9 },
        { codigoTabelaPreco: 'TAB002', preco: 349.9 },
      ],
      fotos: [
        {
          corLinx: '001',
          nomeArquivo: 'tenis-preto-frente.jpg',
          caminhoArquivo: 'produtos/tenis/tenis-preto-frente.jpg',
          base64Foto: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          ordemFoto: 1,
        },
      ],
      barras: [{ codigoBarra: '7891234567890', corProduto: 'Preto', tamanho: '40', grade: 'Adulto' }],
    },
    {
      id: 2,
      descProduto: 'Camisa Polo Premium',
      descProdutoNf: 'Camisa Polo NF',
      referFabricante: 'REF001',
      ncm: '61051000',
      statusFluxo: 5,
      dataCadastro: '2026-04-15T10:30:00',
      fornecedor: 'FORNECEDOR XYZ LTDA',
      tipoProduto: 'Vestuário',
      fabricante: 'Lacoste',
      composicao: '100% Algodão Pima',
      grade: 'P, M, G, GG',
      linha: 'Classic',
      griffe: 'Lacoste',
      colecao: 'Primavera 2026',
      obsFornecedor: 'Algodão peruano de alta qualidade. Lavagem a seco recomendada.',
      cores: [{ codCor: '010', descCor: 'Azul Marinho', origemCor: 'Importado', corFabricante: 'Navy Blue', ncm: '61051000' }],
      precos: [{ codigoTabelaPreco: 'TAB001', preco: 389.9 }],
      fotos: [
        {
          corLinx: '010',
          nomeArquivo: 'polo-azul-marinho.jpg',
          caminhoArquivo: 'produtos/polo/polo-azul-marinho.jpg',
          base64Foto: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          ordemFoto: 1,
        },
      ],
      barras: [{ codigoBarra: '7891234567892', corProduto: 'Azul Marinho', tamanho: 'M', grade: 'Adulto' }],
    },
    {
      id: 3,
      descProduto: 'Calça Jeans Masculina',
      descProdutoNf: 'Calça Jeans NF',
      referFabricante: 'REF002',
      ncm: '62034200',
      statusFluxo: 7,
      dataCadastro: '2026-04-14T08:15:00',
      fornecedor: 'FORNECEDOR ABC S.A.',
      tipoProduto: 'Vestuário',
      fabricante: "Levi's",
      composicao: '98% Algodão, 2% Elastano',
      grade: '38, 40, 42, 44, 46',
      linha: 'Skinny',
      griffe: "Levi's",
      colecao: 'Outono 2026',
      obsFornecedor: 'Modelo slim fit com elasticidade. Stonewashed.',
      cores: [{ codCor: '020', descCor: 'Azul Escuro', origemCor: 'Nacional', corFabricante: 'Dark Blue', ncm: '62034200' }],
      precos: [{ codigoTabelaPreco: 'TAB001', preco: 259.9 }],
      fotos: [],
      barras: [{ codigoBarra: '7891234567895', corProduto: 'Azul Escuro', tamanho: '42', grade: 'Adulto' }],
    },
    {
      id: 4,
      descProduto: 'Jaqueta de Couro',
      descProdutoNf: 'Jaqueta NF',
      referFabricante: 'REF003',
      ncm: '42031000',
      statusFluxo: 6,
      dataCadastro: '2026-04-13T14:20:00',
      fornecedor: 'COURO PREMIUM LTDA',
    },
  ]);

  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([
    {
      id: 1,
      nomeFornecedor: 'TEXTIL PREMIUM LTDA',
      cgcCpf: '12.345.678/0001-90',
      centroCusto: '29100',
      tipo: 'FABRICANTE',
      condicaoPgto: '30/60 dias',
      moeda: 'R$',
      statusAprovacao: 'pendente',
      dataCadastro: '2026-04-23T14:30:00',
    },
    {
      id: 2,
      nomeFornecedor: 'CALÇADOS ELITE S.A.',
      cgcCpf: '98.765.432/0001-11',
      centroCusto: '29200',
      tipo: 'DISTRIBUIDOR',
      condicaoPgto: '45 dias',
      moeda: 'R$',
      statusAprovacao: 'pendente',
      dataCadastro: '2026-04-22T10:15:00',
    },
    {
      id: 3,
      nomeFornecedor: 'CONFECÇÕES MODERNAS EIRELI',
      cgcCpf: '55.666.777/0001-88',
      centroCusto: '29100',
      tipo: 'FABRICANTE',
      condicaoPgto: '30 dias',
      moeda: 'R$',
      statusAprovacao: 'aprovado',
      dataCadastro: '2026-04-20T16:45:00',
    },
    {
      id: 4,
      nomeFornecedor: 'ACESSÓRIOS FASHION LTDA',
      cgcCpf: '22.333.444/0001-55',
      centroCusto: '29300',
      tipo: 'IMPORTADOR',
      condicaoPgto: '60 dias',
      moeda: 'USD',
      statusAprovacao: 'reprovado',
      dataCadastro: '2026-04-19T09:20:00',
    },
  ]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleAprovar = (productId?: number) => {
    const id = productId || selectedProduct?.id;
    if (!id) return;

    setProducts((prevProducts) => prevProducts.map((product) => (product.id === id ? { ...product, statusFluxo: 6 } : product)));

    toast.success('Produto aprovado!', {
      description: 'Produto encaminhado para integração no ERP.',
      duration: 3000,
    });
  };

  const handleReprovar = (productId?: number) => {
    const id = productId || selectedProduct?.id;
    if (!id) return;

    setProducts((prevProducts) => prevProducts.map((product) => (product.id === id ? { ...product, statusFluxo: 9 } : product)));

    toast.error('Produto reprovado', {
      description: 'Produto retornado ao fornecedor com status de reprovação fiscal.',
      duration: 3000,
    });
  };

  const handleIniciarAnalise = (productId: number) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      setIsModalOpen(true);
    }
  };

  const handleIniciarAnaliseConfirm = () => {
    if (selectedProduct) {
      setProducts((prevProducts) => prevProducts.map((product) => (product.id === selectedProduct.id ? { ...product, statusFluxo: 5 } : product)));

      toast.info('Análise iniciada', {
        description: 'Produto movido para Em Análise Fiscal.',
        duration: 2000,
      });
    }
  };

  const handleAprovarFornecedor = (fornecedorId: number) => {
    setFornecedores((prevFornecedores) =>
      prevFornecedores.map((fornecedor) => (fornecedor.id === fornecedorId ? { ...fornecedor, statusAprovacao: 'aprovado' } : fornecedor)),
    );

    toast.success('Fornecedor aprovado!', {
      description: 'Fornecedor liberado para cadastrar produtos.',
      duration: 3000,
    });
  };

  const handleReprovarFornecedor = (fornecedorId: number) => {
    setFornecedores((prevFornecedores) =>
      prevFornecedores.map((fornecedor) => (fornecedor.id === fornecedorId ? { ...fornecedor, statusAprovacao: 'reprovado' } : fornecedor)),
    );

    toast.error('Fornecedor reprovado', {
      description: 'Cadastro do fornecedor foi recusado.',
      duration: 3000,
    });
  };

  const handleVerDetalhesFornecedor = async (fornecedor: Fornecedor) => {
    setSelectedFornecedor(fornecedor);
    setIsFornecedorModalOpen(true);
    setIsLoadingFornecedorDetalhe(true);
    setFornecedorDetalhe(null);

    try {
      const detalhe = await getFornecedorCadastroCompletoByCgcCpf(fornecedor.cgcCpf);
      setFornecedorDetalhe(detalhe);
    } catch (error) {
      toast.error('Não foi possível carregar o cadastro completo do fornecedor.', {
        description: error instanceof ApiError || error instanceof Error ? error.message : 'Tente novamente em instantes.',
        duration: 3000,
      });
    } finally {
      setIsLoadingFornecedorDetalhe(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    switch (activeFilter) {
      case 'aguardando':
        return product.statusFluxo === 4;
      case 'analise':
        return product.statusFluxo === 5;
      case 'aprovado':
        return product.statusFluxo === 6;
      case 'integrado':
        return product.statusFluxo === 7;
      case 'all':
      default:
        return [4, 5, 6, 7].includes(product.statusFluxo);
    }
  });

  const counts = {
    aguardando: products.filter((p) => p.statusFluxo === 4).length,
    analise: products.filter((p) => p.statusFluxo === 5).length,
    aprovado: products.filter((p) => p.statusFluxo === 6).length,
    integrado: products.filter((p) => p.statusFluxo === 7).length,
  };

  return (
    <Layout showLogo={false}>
      <div className="w-full max-w-7xl">
        <div className="animate-[fadeIn_0.6s_ease-out]">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-6">
              <ImageWithFallback src="/src/imports/kallan-mark.png" alt="Kallan" className="w-20 h-20 drop-shadow-2xl" />
              <div>
                <h1 className="text-5xl font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Dashboard Fiscal
                </h1>
                <p className="text-2xl text-white/80" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                  Bem-vindo, <span className="font-medium">{userName}</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-6 py-3 rounded-xl border-2 border-white/20 hover:border-white/40 transition-all duration-300"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              <LogOut className="w-5 h-5" />
              Sair
            </button>
          </div>

          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setViewType('produtos')}
              className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                viewType === 'produtos' ? 'bg-white text-[#ca0404] shadow-lg' : 'bg-white/10 text-white hover:bg-white/20 border-2 border-white/20'
              }`}
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Produtos
            </button>
            <button
              onClick={() => setViewType('fornecedores')}
              className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                viewType === 'fornecedores' ? 'bg-white text-[#ca0404] shadow-lg' : 'bg-white/10 text-white hover:bg-white/20 border-2 border-white/20'
              }`}
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Fornecedores
            </button>
          </div>

          {viewType === 'produtos' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <button
                  onClick={() => setActiveFilter('aguardando')}
                  className={`bg-white/10 backdrop-blur-xl rounded-2xl p-6 border-2 transition-all duration-300 hover:scale-105 ${
                    activeFilter === 'aguardando' ? 'border-purple-400/60 bg-white/20' : 'border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-white/70 text-sm" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                      Aguardando Fiscal
                    </p>
                    <div className="bg-purple-500/30 rounded-full p-2">
                      <Filter className="w-5 h-5 text-purple-200" />
                    </div>
                  </div>
                  <p className="text-4xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {counts.aguardando}
                  </p>
                </button>

                <button
                  onClick={() => setActiveFilter('analise')}
                  className={`bg-white/10 backdrop-blur-xl rounded-2xl p-6 border-2 transition-all duration-300 hover:scale-105 ${
                    activeFilter === 'analise' ? 'border-indigo-400/60 bg-white/20' : 'border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-white/70 text-sm" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                      Em Análise Fiscal
                    </p>
                    <div className="bg-indigo-500/30 rounded-full p-2">
                      <Filter className="w-5 h-5 text-indigo-200" />
                    </div>
                  </div>
                  <p className="text-4xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {counts.analise}
                  </p>
                </button>

                <button
                  onClick={() => setActiveFilter('aprovado')}
                  className={`bg-white/10 backdrop-blur-xl rounded-2xl p-6 border-2 transition-all duration-300 hover:scale-105 ${
                    activeFilter === 'aprovado' ? 'border-green-400/60 bg-white/20' : 'border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-white/70 text-sm" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                      Aprovado Integração
                    </p>
                    <div className="bg-green-500/30 rounded-full p-2">
                      <CheckCircle className="w-5 h-5 text-green-200" />
                    </div>
                  </div>
                  <p className="text-4xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {counts.aprovado}
                  </p>
                </button>

                <button
                  onClick={() => setActiveFilter('integrado')}
                  className={`bg-white/10 backdrop-blur-xl rounded-2xl p-6 border-2 transition-all duration-300 hover:scale-105 ${
                    activeFilter === 'integrado' ? 'border-emerald-400/60 bg-white/20' : 'border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-white/70 text-sm" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                      Integrado ERP
                    </p>
                    <div className="bg-emerald-500/30 rounded-full p-2">
                      <CheckCircle className="w-5 h-5 text-emerald-200" />
                    </div>
                  </div>
                  <p className="text-4xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {counts.integrado}
                  </p>
                </button>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 border-2 border-white/20 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                      {activeFilter === 'aguardando' && 'Produtos Aguardando Fiscal'}
                      {activeFilter === 'analise' && 'Produtos Em Análise Fiscal'}
                      {activeFilter === 'aprovado' && 'Produtos Aprovados para Integração'}
                      {activeFilter === 'integrado' && 'Produtos Integrados no ERP'}
                      {activeFilter === 'all' && 'Todos os Produtos'}
                    </h2>
                    <p className="text-white/60 text-sm" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                      {filteredProducts.length} produto(s) encontrado(s)
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border-2 border-white/20">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-white/20 backdrop-blur-sm">
                        <th className="text-left px-4 py-4 text-white font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                          ID
                        </th>
                        <th className="text-left px-4 py-4 text-white font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                          Produto
                        </th>
                        <th className="text-left px-4 py-4 text-white font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                          Fornecedor
                        </th>
                        <th className="text-left px-4 py-4 text-white font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                          Ref. Fabricante
                        </th>
                        <th className="text-left px-4 py-4 text-white font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                          NCM
                        </th>
                        <th className="text-left px-4 py-4 text-white font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                          Status
                        </th>
                        <th className="text-left px-4 py-4 text-white font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                          Data Cadastro
                        </th>
                        <th className="text-center px-4 py-4 text-white font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-6 py-12 text-center">
                            <p className="text-white/60 text-lg" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                              Nenhum produto encontrado nesta categoria.
                            </p>
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map((product, index) => (
                          <tr
                            key={product.id}
                            className="border-t-2 border-white/10 hover:bg-white/10 transition-colors duration-200"
                            style={{ animationDelay: `${index * 0.1}s` }}
                          >
                            <td className="px-4 py-5 text-white/80 text-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>
                              #{product.id}
                            </td>
                            <td className="px-4 py-5 text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                              {product.descProduto}
                            </td>
                            <td className="px-4 py-5 text-white/80 text-sm" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                              {product.fornecedor}
                            </td>
                            <td className="px-4 py-5 text-white/80" style={{ fontFamily: 'Outfit, sans-serif' }}>
                              {product.referFabricante}
                            </td>
                            <td className="px-4 py-5 text-white/80 text-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>
                              {product.ncm}
                            </td>
                            <td className="px-4 py-5">
                              <span
                                className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(product.statusFluxo)}`}
                                style={{ fontFamily: 'Outfit, sans-serif' }}
                              >
                                {STATUS_FLUXO[product.statusFluxo] || 'Desconhecido'}
                              </span>
                            </td>
                            <td className="px-4 py-5 text-white/70 text-sm" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                              {formatDate(product.dataCadastro)}
                            </td>
                            <td className="px-4 py-5">
                              <div className="flex items-center justify-center gap-2">
                                {product.statusFluxo === 4 && (
                                  <button
                                    onClick={() => handleIniciarAnalise(product.id)}
                                    className="text-white bg-indigo-500/30 hover:bg-indigo-500/50 transition-all duration-200 px-3 py-2 rounded-lg border border-indigo-400/30 text-xs"
                                    style={{ fontFamily: 'Outfit, sans-serif' }}
                                  >
                                    Iniciar Análise
                                  </button>
                                )}
                                {product.statusFluxo === 5 && (
                                  <>
                                    <button
                                      onClick={() => handleAprovar(product.id)}
                                      className="text-white bg-green-500/30 hover:bg-green-500/50 transition-all duration-200 px-3 py-2 rounded-lg border border-green-400/30 text-xs flex items-center gap-1"
                                      style={{ fontFamily: 'Outfit, sans-serif' }}
                                    >
                                      <CheckCircle className="w-3 h-3" />
                                      Aprovar
                                    </button>
                                    <button
                                      onClick={() => handleReprovar(product.id)}
                                      className="text-white bg-red-500/30 hover:bg-red-500/50 transition-all duration-200 px-3 py-2 rounded-lg border border-red-400/30 text-xs flex items-center gap-1"
                                      style={{ fontFamily: 'Outfit, sans-serif' }}
                                    >
                                      <XCircle className="w-3 h-3" />
                                      Reprovar
                                    </button>
                                  </>
                                )}
                                {(product.statusFluxo === 6 || product.statusFluxo === 7) && (
                                  <span className="text-white/40 text-xs" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                                    {product.statusFluxo === 6 ? 'Aguardando integração' : 'Finalizado'}
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {viewType === 'fornecedores' && (
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 border-2 border-white/20 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Fornecedores Cadastrados
                  </h2>
                  <p className="text-white/60 text-sm" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                    {fornecedores.filter((f) => f.statusAprovacao === 'pendente').length} fornecedor(es) aguardando aprovação
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border-2 border-white/20">
                <table className="w-full">
                  <thead>
                    <tr className="bg-white/20 backdrop-blur-sm">
                      <th className="text-left px-4 py-4 text-white font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                        ID
                      </th>
                      <th className="text-left px-4 py-4 text-white font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                        Nome Fornecedor
                      </th>
                      <th className="text-left px-4 py-4 text-white font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                        CNPJ/CPF
                      </th>
                      <th className="text-left px-4 py-4 text-white font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                        Tipo
                      </th>
                      <th className="text-left px-4 py-4 text-white font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                        Condição Pgto
                      </th>
                      <th className="text-left px-4 py-4 text-white font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                        Status
                      </th>
                      <th className="text-left px-4 py-4 text-white font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                        Data Cadastro
                      </th>
                      <th className="text-center px-4 py-4 text-white font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {fornecedores.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center">
                          <p className="text-white/60 text-lg" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                            Nenhum fornecedor cadastrado.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      fornecedores.map((fornecedor, index) => (
                        <tr
                          key={fornecedor.id}
                          className="border-t-2 border-white/10 hover:bg-white/10 transition-colors duration-200"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <td className="px-4 py-5 text-white/80 text-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>
                            #{fornecedor.id}
                          </td>
                          <td className="px-4 py-5 text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                            {fornecedor.nomeFornecedor}
                          </td>
                          <td className="px-4 py-5 text-white/80 text-sm" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                            {fornecedor.cgcCpf}
                          </td>
                          <td className="px-4 py-5 text-white/80" style={{ fontFamily: 'Outfit, sans-serif' }}>
                            {fornecedor.tipo}
                          </td>
                          <td className="px-4 py-5 text-white/80 text-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>
                            {fornecedor.condicaoPgto}
                          </td>
                          <td className="px-4 py-5">
                            <span
                              className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${
                                fornecedor.statusAprovacao === 'pendente'
                                  ? 'bg-yellow-500/20 text-yellow-100 border-yellow-400/30'
                                  : fornecedor.statusAprovacao === 'aprovado'
                                    ? 'bg-green-500/20 text-green-100 border-green-400/30'
                                    : 'bg-red-500/20 text-red-100 border-red-400/30'
                              }`}
                              style={{ fontFamily: 'Outfit, sans-serif' }}
                            >
                              {fornecedor.statusAprovacao === 'pendente' && 'Pendente Aprovação'}
                              {fornecedor.statusAprovacao === 'aprovado' && 'Aprovado'}
                              {fornecedor.statusAprovacao === 'reprovado' && 'Reprovado'}
                            </span>
                          </td>
                          <td className="px-4 py-5 text-white/70 text-sm" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                            {formatDate(fornecedor.dataCadastro)}
                          </td>
                          <td className="px-4 py-5">
                            <div className="flex items-center justify-center gap-2">
                              {fornecedor.statusAprovacao === 'pendente' && (
                                <>
                                  <button
                                    onClick={() => handleVerDetalhesFornecedor(fornecedor)}
                                    className="text-white bg-white/15 hover:bg-white/25 transition-all duration-200 px-3 py-2 rounded-lg border border-white/30 text-xs flex items-center gap-1"
                                    style={{ fontFamily: 'Outfit, sans-serif' }}
                                  >
                                    <Eye className="w-3 h-3" />
                                    Ver detalhes
                                  </button>
                                  <button
                                    onClick={() => handleAprovarFornecedor(fornecedor.id)}
                                    className="text-white bg-green-500/30 hover:bg-green-500/50 transition-all duration-200 px-3 py-2 rounded-lg border border-green-400/30 text-xs flex items-center gap-1"
                                    style={{ fontFamily: 'Outfit, sans-serif' }}
                                  >
                                    <CheckCircle className="w-3 h-3" />
                                    Aprovar
                                  </button>
                                  <button
                                    onClick={() => handleReprovarFornecedor(fornecedor.id)}
                                    className="text-white bg-red-500/30 hover:bg-red-500/50 transition-all duration-200 px-3 py-2 rounded-lg border border-red-400/30 text-xs flex items-center gap-1"
                                    style={{ fontFamily: 'Outfit, sans-serif' }}
                                  >
                                    <XCircle className="w-3 h-3" />
                                    Reprovar
                                  </button>
                                </>
                              )}
                              {fornecedor.statusAprovacao !== 'pendente' && (
                                <span className="text-white/40 text-xs" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                                  {fornecedor.statusAprovacao === 'aprovado' ? 'Finalizado' : 'Recusado'}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedProduct && (
        <ProdutoDetalhesModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedProduct(null);
          }}
          onAprovar={() => handleAprovar()}
          onReprovar={() => handleReprovar()}
          onIniciarAnalise={handleIniciarAnaliseConfirm}
          showActions
          departamento="fiscal"
        />
      )}

      {isFornecedorModalOpen && selectedFornecedor && (
        <>
          {isLoadingFornecedorDetalhe || !fornecedorDetalhe ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-[fadeIn_0.3s_ease-out]">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsFornecedorModalOpen(false)}></div>
              <div className="relative bg-white/10 backdrop-blur-2xl rounded-3xl border-2 border-white/30 shadow-2xl max-w-xl w-full p-10">
                <p className="text-white text-lg" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Carregando cadastro completo de {selectedFornecedor.nomeFornecedor}...
                </p>
                <button
                  onClick={() => setIsFornecedorModalOpen(false)}
                  className="mt-6 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/30 transition-all duration-300"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  Fechar
                </button>
              </div>
            </div>
          ) : (
            <FornecedorDetalhesModal
              fornecedor={fornecedorDetalhe}
              isOpen={isFornecedorModalOpen}
              onClose={() => {
                setIsFornecedorModalOpen(false);
                setSelectedFornecedor(null);
                setFornecedorDetalhe(null);
              }}
            />
          )}
        </>
      )}
    </Layout>
  );
}

