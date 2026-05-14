import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Layout } from './Layout';
import { Plus, LogOut, Send, X, Eye } from 'lucide-react';
import { ImageWithFallback } from './ui/image-with-fallback';
import { toast } from 'sonner';
import { clearAuthSession, getAuthSession } from '../lib/auth-storage';
import {
  ApiError,
  enriquecerNcmResumosFornecedor,
  enviarProdutoParaCompras,
  getFornecedorByCgcCpf,
  listarMeusCadastrosProdutos,
  type FornecedorData as FornecedorDataApi,
  type ProdutoCadastroResumo,
} from '../lib/supplier-api';

type Product = ProdutoCadastroResumo;

type FornecedorData = FornecedorDataApi;

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
    case 9:
      return 'bg-red-500/20 text-red-100 border-red-400/30';
    default:
      return 'bg-gray-500/20 text-gray-100 border-gray-400/30';
  }
};

export function FornecedorDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const session = useMemo(() => getAuthSession(), []);
  const fornecedorDataFromNav = location.state?.fornecedorData as FornecedorData | undefined;
  const [fornecedorData, setFornecedorData] = useState<FornecedorData | null>(fornecedorDataFromNav ?? null);
  const [isLoadingFornecedor, setIsLoadingFornecedor] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);

  useEffect(() => {
    if (!session?.token) {
      navigate('/fornecedor/cnpj');
      return;
    }

    const load = async () => {
      setIsLoadingProducts(true);

      try {
        const data = await listarMeusCadastrosProdutos(session.token);
        const comNcm = await enriquecerNcmResumosFornecedor(session.token, data);
        setProducts(comNcm);
      } catch (error) {
        toast.error('Não foi possível carregar seus produtos.', {
          description: error instanceof ApiError || error instanceof Error ? error.message : 'Tente novamente mais tarde.',
          duration: 2500,
        });
      } finally {
        setIsLoadingProducts(false);
      }
    };

    void load();
  }, [navigate, session?.token]);

  useEffect(() => {
    if (fornecedorData || !session?.cgcCpf) {
      return;
    }

    const loadFornecedor = async () => {
      setIsLoadingFornecedor(true);

      try {
        const data = await getFornecedorByCgcCpf(session.cgcCpf);
        setFornecedorData(data);
      } catch (error) {
        toast.error('Não foi possível carregar os dados do fornecedor.', {
          description: error instanceof Error ? error.message : 'Tente novamente mais tarde.',
          duration: 2500,
        });
      } finally {
        setIsLoadingFornecedor(false);
      }
    };

    void loadFornecedor();
  }, [fornecedorData, session?.cgcCpf]);

  const handleSelectProduct = (productId: number) => {
    const product = products.find((p) => p.id === productId);

    if (product && product.statusFluxo !== 1) {
      toast.error('Produto não pode ser selecionado', {
        description: 'Apenas produtos em Pré-Cadastro podem ser enviados.',
        duration: 2000,
      });
      return;
    }

    setSelectedProducts((prev) => (prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]));
  };

  const handleSelectAll = () => {
    const productosSelectionaveis = products.filter((p) => p.statusFluxo === 1);

    if (selectedProducts.length === productosSelectionaveis.length && productosSelectionaveis.length > 0) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(productosSelectionaveis.map((p) => p.id));
    }
  };

  const handleCancelSelection = () => {
    setSelectedProducts([]);
  };

  const handleEnviarParaAnaliseFiscal = async () => {
    if (!session?.token) {
      navigate('/fornecedor/cnpj');
      return;
    }

    if (selectedProducts.length === 0) {
      toast.error('Nenhum produto selecionado', {
        description: 'Selecione ao menos um produto para enviar.',
        duration: 2000,
      });
      return;
    }

    try {
      for (const id of selectedProducts) {
        // eslint-disable-next-line no-await-in-loop
        await enviarProdutoParaCompras(session.token, id);
      }

      const data = await listarMeusCadastrosProdutos(session.token);
      setProducts(data);

      toast.success('Produtos enviados com sucesso!', {
        description: `${selectedProducts.length} produto(s) encaminhado(s) para Compras.`,
        duration: 3000,
      });

      setSelectedProducts([]);
    } catch (error) {
      toast.error('Não foi possível enviar os produtos.', {
        description: error instanceof ApiError || error instanceof Error ? error.message : 'Tente novamente mais tarde.',
        duration: 3000,
      });
    }
  };

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

  const productosSelectionaveis = products.filter((p) => p.statusFluxo === 1);
  const allSelectableSelected = productosSelectionaveis.length > 0 && selectedProducts.length === productosSelectionaveis.length;

  return (
    <Layout showLogo={false}>
      <div className="w-full max-w-7xl">
        {selectedProducts.length > 0 && (
          <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 animate-[slideDown_0.3s_ease-out]">
            <div className="bg-white/15 backdrop-blur-2xl border-2 border-white/30 rounded-2xl px-8 py-4 shadow-2xl flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center">
                  <span className="text-white font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {selectedProducts.length}
                  </span>
                </div>
                <span className="text-white font-medium text-lg" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {selectedProducts.length === 1 ? 'item selecionado' : 'itens selecionados'}
                </span>
              </div>

              <div className="w-px h-8 bg-white/30"></div>

              <button
                onClick={handleEnviarParaAnaliseFiscal}
                className="flex items-center gap-3 bg-white text-[#ca0404] px-6 py-3 rounded-xl font-semibold hover:bg-white/90 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                <Send className="w-5 h-5" />
                Encaminhar para análise fiscal
              </button>

              <button
                onClick={handleCancelSelection}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-3 rounded-xl font-medium border border-white/30 transition-all duration-300"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                <X className="w-4 h-4" />
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div className="animate-[fadeIn_0.6s_ease-out]">
          {/* Header with Logo */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-6">
              <ImageWithFallback
                src="/src/imports/kallan-mark.png"
                alt="Kallan"
                className="w-20 h-20 drop-shadow-2xl"
              />
              <div>
                <h1 className="text-5xl font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Área do Fornecedor
                </h1>
                <p className="text-2xl text-white/80" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                  Bem-vindo,{' '}
                  <span className="font-medium">{isLoadingFornecedor ? 'Carregando...' : fornecedorData?.nomeFornecedor ?? 'Fornecedor'}</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                clearAuthSession();
                navigate('/');
              }}
              className="flex items-center gap-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-6 py-3 rounded-xl border-2 border-white/20 hover:border-white/40 transition-all duration-300"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              <LogOut className="w-5 h-5" />
              Sair
            </button>
          </div>

          {/* Dados do Fornecedor */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border-2 border-white/20 shadow-xl mb-10">
            <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
              Dados do Fornecedor
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <p className="text-white/60 text-sm mb-1" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                  Código Fornecedor
                </p>
                <p className="text-white text-xl font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {fornecedorData?.codigoFornecedor ?? '-'}
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <p className="text-white/60 text-sm mb-1" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                  CliFor
                </p>
                <p className="text-white text-xl font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {fornecedorData?.cliFor ?? '-'}
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <p className="text-white/60 text-sm mb-1" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                  CGC/CPF
                </p>
                <p className="text-white text-xl font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {fornecedorData?.cgcCpf ?? session?.cgcCpf ?? '-'}
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <p className="text-white/60 text-sm mb-1" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                  Centro de Custo
                </p>
                <p className="text-white text-xl font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {fornecedorData?.centroCusto ?? '-'}
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <p className="text-white/60 text-sm mb-1" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                  Tipo
                </p>
                <p className="text-white text-xl font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {fornecedorData?.tipo ?? '-'}
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <p className="text-white/60 text-sm mb-1" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                  Condição de Pagamento
                </p>
                <p className="text-white text-xl font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {fornecedorData?.condicaoPgto ?? '-'}
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <p className="text-white/60 text-sm mb-1" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                  Moeda
                </p>
                <p className="text-white text-xl font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {fornecedorData?.moeda ?? '-'}
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <p className="text-white/60 text-sm mb-1" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                  Status
                </p>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${fornecedorData?.inativo ? 'bg-red-400' : 'bg-green-400'}`}></div>
                  <p className="text-white text-xl font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {fornecedorData?.inativo ? 'Inativo' : 'Ativo'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 border-2 border-white/20 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Seus Produtos Cadastrados
                </h2>
                {isLoadingProducts ? (
                  <p className="text-white/60 text-sm" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                    Carregando produtos...
                  </p>
                ) : products.filter((p) => p.statusFluxo === 1).length > 0 ? (
                  <p className="text-white/60 text-sm" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                    {products.filter((p) => p.statusFluxo === 1).length} produto(s) disponível(eis) para envio
                  </p>
                ) : null}
              </div>
              <button
                onClick={() => navigate('/fornecedor/produto/novo', { state: { fornecedorData } })}
                className="flex items-center gap-3 bg-white text-[#ca0404] px-6 py-3 rounded-xl font-semibold hover:bg-white/90 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                <Plus className="w-5 h-5" />
                Novo Produto
              </button>
            </div>

            {/* Products Table */}
            <div className="overflow-x-auto rounded-xl border-2 border-white/20">
              <table className="w-full">
                <thead>
                  <tr className="bg-white/20 backdrop-blur-sm">
                    <th className="px-4 py-4 w-12">
                      <div className="relative group">
                        <input
                          type="checkbox"
                          checked={allSelectableSelected}
                          onChange={handleSelectAll}
                          disabled={productosSelectionaveis.length === 0}
                          className={`w-5 h-5 rounded border-2 border-white/40 bg-white/20 checked:bg-white checked:border-white focus:outline-none focus:ring-2 focus:ring-white/40 transition-all duration-300 accent-white ${
                            productosSelectionaveis.length > 0 ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'
                          }`}
                        />
                        {productosSelectionaveis.length > 0 && (
                          <div
                            className="absolute left-1/2 -translate-x-1/2 -bottom-8 bg-white/90 text-[#ca0404] px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                            style={{ fontFamily: 'Outfit, sans-serif' }}
                          >
                            {productosSelectionaveis.length} selecionáveis
                          </div>
                        )}
                      </div>
                    </th>
                    <th className="text-left px-4 py-4 text-white font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      ID
                    </th>
                    <th className="text-left px-4 py-4 text-white font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      Produto
                    </th>
                    <th className="text-left px-4 py-4 text-white font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      Descrição NF
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
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center">
                        <p className="text-white/60 text-lg" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                          {isLoadingProducts ? 'Carregando...' : 'Nenhum produto cadastrado ainda.'}
                        </p>
                        <p className="text-white/40 text-sm mt-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                          Clique em "Novo Produto" para começar.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    products.map((product, index) => {
                      const isSelectable = product.statusFluxo === 1;
                      return (
                        <tr
                          key={product.id}
                          className={`border-t-2 border-white/10 hover:bg-white/10 transition-colors duration-200 ${
                            selectedProducts.includes(product.id) ? 'bg-white/15' : ''
                          } ${!isSelectable ? 'opacity-60' : ''}`}
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <td className="px-4 py-5">
                            <input
                              type="checkbox"
                              checked={selectedProducts.includes(product.id)}
                              onChange={() => handleSelectProduct(product.id)}
                              disabled={!isSelectable}
                              className={`w-5 h-5 rounded border-2 border-white/40 bg-white/20 checked:bg-white checked:border-white focus:outline-none focus:ring-2 focus:ring-white/40 transition-all duration-300 accent-white ${
                                isSelectable ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'
                              }`}
                            />
                          </td>
                          <td className="px-4 py-5 text-white/80 text-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>
                            #{product.id}
                          </td>
                          <td className="px-4 py-5 text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                            {product.descProduto}
                          </td>
                          <td className="px-4 py-5 text-white/80 text-sm" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                            {product.descProdutoNf ?? '-'}
                          </td>
                          <td className="px-4 py-5 text-white/80" style={{ fontFamily: 'Outfit, sans-serif' }}>
                            {product.referFabricante ?? '-'}
                          </td>
                          <td className="px-4 py-5 text-white/80 text-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>
                            {product.ncm ?? '-'}
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
                          <td className="px-4 py-5 text-center">
                            {product.statusFluxo === 1 ? (
                              <button
                                onClick={() =>
                                  navigate(`/fornecedor/produto/editar/${product.id}`, { state: { fornecedorData } })
                                }
                                className="text-white bg-white/20 hover:bg-white/30 transition-all duration-200 px-4 py-2 rounded-lg border border-white/30 text-sm"
                                style={{ fontFamily: 'Outfit, sans-serif' }}
                              >
                                Editar
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  navigate(`/fornecedor/produto/detalhes/${product.id}`, { state: { fornecedorData } })
                                }
                                className="inline-flex items-center gap-2 text-white bg-white/15 hover:bg-white/25 transition-all duration-200 px-4 py-2 rounded-lg border border-white/30 text-sm"
                                style={{ fontFamily: 'Outfit, sans-serif' }}
                              >
                                <Eye className="w-4 h-4" />
                                Ver detalhes do produto
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
