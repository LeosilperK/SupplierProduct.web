import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Layout } from './Layout';
import { LogOut, CheckCircle, XCircle, Filter } from 'lucide-react';
import { ImageWithFallback } from './ui/image-with-fallback';
import { toast } from 'sonner';
import { ProdutoDetalhesModal } from './ProdutoDetalhesModal';
import {
  ApiError,
  aprovarCompras,
  enriquecerNcmListaDetalheInterno,
  listarPendentesCompras,
  ncmPrincipalDoProduto,
  obterProdutoCadastroInterno,
  reprovarCompras,
  comprasAnaliseDraftStorageKey,
  type ProdutoCadastroDetalhe,
  type ProdutoPendenteCompras,
} from '../lib/supplier-api';

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

/** Alinhado ao enum StatusProdutoCadastro (backend). */
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

type FilterType = 'all' | 'aguardando' | 'analise' | 'aguardandoFiscal' | 'integrado';

/** Status após compras aprovar até integração no ERP (conforme `PRODUTO_CADASTRO.STATUS_FLUXO`). */
const FISCAL_PIPELINE_STATUS = new Set([4, 5, 6]);

/** Status exibidos no dashboard de compras (acompanhamento do pipeline). */
const COMPRAS_DASHBOARD_STATUS = new Set([2, 3, 4, 5, 6, 7]);

function statusFluxoFromPendenteCompras(p: ProdutoPendenteCompras): number {
  const r = p as unknown as Record<string, unknown>;
  const raw = r.statusFluxo ?? r.StatusFluxo;
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

function nomeFornecedorFromPendenteCompras(p: ProdutoPendenteCompras): string {
  const r = p as unknown as Record<string, unknown>;
  const v = r.nomeFornecedor ?? r.NomeFornecedor;
  return typeof v === 'string' ? v : p.nomeFornecedor ?? '';
}

function mapPendenteToProduct(p: ProdutoPendenteCompras): Product {
  return {
    id: p.id,
    descProduto: p.descProduto,
    descProdutoNf: p.descProdutoNf ?? '',
    referFabricante: p.referFabricante ?? '',
    ncm: p.ncm ?? '',
    statusFluxo: statusFluxoFromPendenteCompras(p),
    dataCadastro: p.dataCadastro,
    fornecedor: nomeFornecedorFromPendenteCompras(p),
  };
}

function statusFluxoFromDetalhe(d: ProdutoCadastroDetalhe): number {
  const r = d as unknown as Record<string, unknown>;
  const raw = r.statusFluxo ?? r.StatusFluxo;
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  const n = Number(raw);
  return Number.isFinite(n) ? n : d.statusFluxo;
}

function mapInternoToProduct(d: ProdutoCadastroDetalhe, nomeFornecedor: string): Product {
  return {
    id: d.id,
    descProduto: d.descProduto,
    descProdutoNf: d.descProdutoNf ?? '',
    referFabricante: d.referFabricante ?? '',
    ncm: ncmPrincipalDoProduto(d.ncm, d.cores) ?? '',
    statusFluxo: statusFluxoFromDetalhe(d),
    dataCadastro: d.dataCadastro,
    fornecedor: nomeFornecedor,
    tipoProduto: d.tipoProduto ?? undefined,
    fabricante: d.fabricante ?? undefined,
    composicao: d.composicao ?? undefined,
    grade: d.grade ?? undefined,
    linha: d.linha ?? undefined,
    griffe: d.griffe ?? undefined,
    colecao: d.colecao ?? undefined,
    obsFornecedor: d.obsFornecedor ?? undefined,
    cores: (d.cores ?? []).map((c) => ({
      codCor: c.codCor ?? '',
      descCor: c.descCor ?? '',
      origemCor: c.origemCor ?? '',
      corFabricante: c.corFabricante ?? '',
      ncm: c.ncm ?? '',
    })),
    precos: (d.precos ?? []).map((pr) => ({
      codigoTabelaPreco: pr.codigoTabelaPreco ?? '',
      preco: Number(pr.preco ?? 0),
    })),
    fotos: (d.fotos ?? []).map((f) => ({
      corLinx: f.corLinx ?? '',
      nomeArquivo: f.nomeArquivo ?? '',
      caminhoArquivo: f.caminhoArquivo ?? '',
      base64Foto: f.base64Foto ?? '',
      ordemFoto: f.ordemFoto,
    })),
    barras: (d.barras ?? []).map((b) => ({
      codigoBarra: b.codigoBarra ?? '',
      corProduto: b.corProduto ?? '',
      tamanho: b.tamanho ?? '',
      grade: b.grade ?? '',
    })),
  };
}

export function ColaboradorDashboardCompras() {
  const navigate = useNavigate();
  const location = useLocation();
  const userName = location.state?.userName || 'Usuário';

  const [activeFilter, setActiveFilter] = useState<FilterType>('aguardando');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [detailLoadingId, setDetailLoadingId] = useState<number | null>(null);

  const loadPendentes = useCallback(async () => {
    setIsLoadingList(true);
    try {
      setLoadError(null);
      const rows = await listarPendentesCompras();
      const mapped = (rows ?? []).map((p) => mapPendenteToProduct(p));
      const enriched = await enriquecerNcmListaDetalheInterno(mapped);
      setProducts(enriched);
    } catch (error) {
      const message =
        error instanceof ApiError || error instanceof Error ? error.message : 'Erro ao carregar lista.';
      setLoadError(message);
      toast.error('Não foi possível carregar produtos pendentes de compras.', { description: message });
    } finally {
      setIsLoadingList(false);
    }
  }, []);

  useEffect(() => {
    void loadPendentes();
  }, [loadPendentes]);

  useEffect(() => {
    const tick = () => void loadPendentes();
    const iv = window.setInterval(tick, 45_000);
    const onVis = () => {
      if (document.visibilityState === 'visible') tick();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.clearInterval(iv);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [loadPendentes]);

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

  const handleAprovar = async (productId?: number) => {
    const id = productId ?? selectedProduct?.id;
    if (!id) return;

    try {
      await aprovarCompras(id);
      try {
        window.sessionStorage.removeItem(comprasAnaliseDraftStorageKey(id));
      } catch {
        /* ignore */
      }
      toast.success('Produto aprovado por compras!', {
        description:
          'O cadastro segue para a fila fiscal; a lista abaixo acompanha o status gravado em PRODUTO_CADASTRO (atualização automática).',
        duration: 4000,
      });
      setIsModalOpen(false);
      setSelectedProduct(null);
      setActiveFilter('aguardandoFiscal');
      await loadPendentes();
    } catch (error) {
      let desc = error instanceof ApiError || error instanceof Error ? error.message : undefined;
      if (
        error instanceof ApiError &&
        error.status === 400 &&
        desc &&
        /obrigat[oó]rios|aguardando compras|em análise de compras/i.test(desc)
      ) {
        desc =
          `${desc} Se você aprovou pela grade, abra «Revisar análise»: no modal, o botão Aprovar grava a análise e só então envia ao fiscal.`;
      }
      toast.error('Não foi possível aprovar o produto.', {
        description: desc,
      });
      throw error;
    }
  };

  const handleReprovar = async (productId?: number) => {
    const id = productId ?? selectedProduct?.id;
    if (!id) return;

    const motivo = window.prompt('Informe o motivo da reprovação comercial:');
    if (motivo === null) {
      throw new Error('cancelado');
    }
    if (!motivo.trim()) {
      toast.error('Motivo obrigatório para reprovar.');
      throw new Error('validação');
    }

    try {
      await reprovarCompras(id, { motivo: motivo.trim() });
      try {
        window.sessionStorage.removeItem(comprasAnaliseDraftStorageKey(id));
      } catch {
        /* ignore */
      }
      toast.error('Produto reprovado por compras.', {
        description: 'O fornecedor será notificado pelo status do cadastro.',
        duration: 4000,
      });
      setIsModalOpen(false);
      setSelectedProduct(null);
      await loadPendentes();
    } catch (error) {
      toast.error('Não foi possível reprovar o produto.', {
        description: error instanceof ApiError || error instanceof Error ? error.message : undefined,
      });
      throw error;
    }
  };

  const handleIniciarAnalise = async (productId: number) => {
    const row = products.find((p) => p.id === productId);
    if (!row) return;

    setDetailLoadingId(productId);
    try {
      const detalhe = await obterProdutoCadastroInterno(productId);
      setSelectedProduct(mapInternoToProduct(detalhe, row.fornecedor));
      setIsModalOpen(true);
    } catch (error) {
      toast.error('Não foi possível carregar o cadastro completo do produto.', {
        description: error instanceof ApiError || error instanceof Error ? error.message : undefined,
      });
    } finally {
      setDetailLoadingId(null);
    }
  };

  const filteredProducts = products.filter((product) => {
    switch (activeFilter) {
      case 'aguardando':
        return product.statusFluxo === 2;
      case 'analise':
        return product.statusFluxo === 3;
      case 'aguardandoFiscal':
        return FISCAL_PIPELINE_STATUS.has(product.statusFluxo);
      case 'integrado':
        return product.statusFluxo === 7;
      case 'all':
      default:
        return COMPRAS_DASHBOARD_STATUS.has(product.statusFluxo);
    }
  });

  const counts = {
    aguardando: products.filter((p) => p.statusFluxo === 2).length,
    analise: products.filter((p) => p.statusFluxo === 3).length,
    aguardandoFiscal: products.filter((p) => FISCAL_PIPELINE_STATUS.has(p.statusFluxo)).length,
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
                  Dashboard Compras
                </h1>
                <p className="text-2xl text-white/80" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                  Bem-vindo, <span className="font-medium">{userName}</span>
                </p>
                <p className="text-white/55 text-sm mt-3 max-w-2xl" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                  A lista reflete o STATUS_FLUXO em PRODUTO_CADASTRO: 2 aguardando compras, 3 após salvar análise de compras, 4–6 no
                  fluxo fiscal até integração, 7 integrado ao ERP. A página atualiza periodicamente; reprovações (8/9) saem desta
                  visão.
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

          {loadError && (
            <div
              className="mb-6 rounded-xl border border-red-400/40 bg-red-500/15 px-5 py-4 text-white text-sm"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              {loadError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
            <button
              onClick={() => setActiveFilter('aguardando')}
              className={`bg-white/10 backdrop-blur-xl rounded-2xl p-6 border-2 transition-all duration-300 hover:scale-105 ${
                activeFilter === 'aguardando' ? 'border-yellow-400/60 bg-white/20' : 'border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-white/70 text-sm" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                  Aguardando Compras
                </p>
                <div className="bg-yellow-500/30 rounded-full p-2">
                  <Filter className="w-5 h-5 text-yellow-200" />
                </div>
              </div>
              <p className="text-4xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                {counts.aguardando}
              </p>
            </button>

            <button
              onClick={() => setActiveFilter('analise')}
              className={`bg-white/10 backdrop-blur-xl rounded-2xl p-6 border-2 transition-all duration-300 hover:scale-105 ${
                activeFilter === 'analise' ? 'border-orange-400/60 bg-white/20' : 'border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-white/70 text-sm" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                  Em Análise Compras
                </p>
                <div className="bg-orange-500/30 rounded-full p-2">
                  <Filter className="w-5 h-5 text-orange-200" />
                </div>
              </div>
              <p className="text-4xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                {counts.analise}
              </p>
            </button>

            <button
              onClick={() => setActiveFilter('aguardandoFiscal')}
              className={`bg-white/10 backdrop-blur-xl rounded-2xl p-6 border-2 transition-all duration-300 hover:scale-105 ${
                activeFilter === 'aguardandoFiscal' ? 'border-purple-400/60 bg-white/20' : 'border-white/20'
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
                {counts.aguardandoFiscal}
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
                  {activeFilter === 'aguardando' && 'Produtos Aguardando Compras'}
                  {activeFilter === 'analise' && 'Produtos Em Análise Compras'}
                  {activeFilter === 'aguardandoFiscal' && 'Produtos na fila fiscal (acompanhamento)'}
                  {activeFilter === 'integrado' && 'Produtos Integrados no ERP'}
                  {activeFilter === 'all' && 'Todos os Produtos'}
                </h2>
                <p className="text-white/60 text-sm" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                  {isLoadingList ? 'Carregando…' : `${filteredProducts.length} produto(s) encontrado(s)`}
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
                            {product.statusFluxo === 2 && (
                              <button
                                onClick={() => handleIniciarAnalise(product.id)}
                                disabled={detailLoadingId === product.id}
                                className="text-white bg-orange-500/30 hover:bg-orange-500/50 transition-all duration-200 px-3 py-2 rounded-lg border border-orange-400/30 text-xs disabled:opacity-50"
                                style={{ fontFamily: 'Outfit, sans-serif' }}
                              >
                                {detailLoadingId === product.id ? 'Carregando...' : 'Analisar cadastro'}
                              </button>
                            )}
                            {product.statusFluxo === 3 && (
                              <>
                                <button
                                  onClick={() => handleIniciarAnalise(product.id)}
                                  disabled={detailLoadingId === product.id}
                                  className="text-white bg-orange-500/20 hover:bg-orange-500/40 transition-all duration-200 px-3 py-2 rounded-lg border border-orange-400/25 text-xs disabled:opacity-50"
                                  style={{ fontFamily: 'Outfit, sans-serif' }}
                                >
                                  {detailLoadingId === product.id ? 'Carregando...' : 'Revisar análise'}
                                </button>
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
                            {FISCAL_PIPELINE_STATUS.has(product.statusFluxo) && (
                              <span className="text-white/45 text-xs text-center block" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                                Acompanhamento fiscal (somente leitura neste painel)
                              </span>
                            )}
                            {product.statusFluxo === 7 && (
                              <span className="text-white/40 text-xs" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                                Finalizado
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
        </div>
      </div>

      {selectedProduct && (
        <ProdutoDetalhesModal
          key={selectedProduct.id}
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedProduct(null);
          }}
          onAprovar={() => handleAprovar()}
          onReprovar={() => handleReprovar()}
          onMutationSuccess={() => {
            if (selectedProduct) {
              setSelectedProduct((p) => (p ? { ...p, statusFluxo: 3 } : null));
            }
            void loadPendentes();
          }}
          showActions
          departamento="compras"
        />
      )}
    </Layout>
  );
}

