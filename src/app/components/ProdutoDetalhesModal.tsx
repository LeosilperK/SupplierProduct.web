import { useState } from 'react';
import { X, Package, FileText, Palette, DollarSign, Camera, Barcode, CheckCircle, XCircle, ClipboardList } from 'lucide-react';

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

interface ProdutoDetalhesModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAprovar?: () => void;
  onReprovar?: () => void;
  onIniciarAnalise?: () => void;
  showActions?: boolean;
  departamento?: 'fiscal' | 'compras';
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

export function ProdutoDetalhesModal({
  product,
  isOpen,
  onClose,
  onAprovar,
  onReprovar,
  onIniciarAnalise,
  showActions = true,
  departamento,
}: ProdutoDetalhesModalProps) {
  if (!isOpen) return null;

  const [formFiscal, setFormFiscal] = useState({
    ncm: product.ncm || '',
    cest: '',
    tributOrigem: '',
    tributIcms: '',
    tipoItemSped: '',
    idExcecaoGrupo: '',
    classificacaoFiscalFinal: '',
    obsFiscal: '',
  });

  const [formCompras, setFormCompras] = useState({
    grupoProduto: '',
    subgrupoProduto: '',
    codCategoria: '',
    codSubcategoria: '',
    unidade: '',
    cest: '',
    tipoStatusProduto: '',
    sexoTipo: '',
    contaContabil: '',
    contaContabilCompra: '',
    contaContabilVenda: '',
    contaContabilDevCompra: '',
    contaContabilDevVenda: '',
    indicadorCfop: '',
    continuidade: '',
    periodoPcp: '',
    redeLojas: '',
    codProdutoSolucao: '',
    sujeitoSubstituicaoTributaria: '',
    codProdutoSegmento: '',
    obsCompras: '',
  });

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

  const canAprovar = (departamento === 'fiscal' && product.statusFluxo === 5) || (departamento === 'compras' && product.statusFluxo === 3);
  const canIniciar = (departamento === 'fiscal' && product.statusFluxo === 4) || (departamento === 'compras' && product.statusFluxo === 2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-[fadeIn_0.3s_ease-out]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative bg-white/10 backdrop-blur-2xl rounded-3xl border-2 border-white/30 shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden animate-[slideUp_0.4s_ease-out]">
        <div className="sticky top-0 z-10 bg-white/15 backdrop-blur-xl border-b-2 border-white/20 px-8 py-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
              Detalhes do Produto
            </h2>
            <p className="text-white/70 text-sm" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
              ID #{product.id} • {product.fornecedor}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-180px)] px-8 py-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span
                className={`inline-flex px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(product.statusFluxo)}`}
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                {STATUS_FLUXO[product.statusFluxo] || 'Desconhecido'}
              </span>
              <p className="text-white/60 text-sm" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                Cadastrado em: {formatDate(product.dataCadastro)}
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <Package className="w-6 h-6 text-white" />
                <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Informações Básicas
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-white/60 text-sm mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                    Descrição do Produto
                  </label>
                  <p className="text-white text-lg font-medium" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {product.descProduto}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-white/60 text-sm mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                    Descrição Nota Fiscal
                  </label>
                  <p className="text-white text-lg" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {product.descProdutoNf || '-'}
                  </p>
                </div>

                <div>
                  <label className="block text-white/60 text-sm mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                    Referência Fabricante
                  </label>
                  <p className="text-white text-lg font-medium" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {product.referFabricante}
                  </p>
                </div>

                <div>
                  <label className="block text-white/60 text-sm mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                    NCM
                  </label>
                  <p className="text-white text-lg font-mono" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {product.ncm}
                  </p>
                </div>

                {product.tipoProduto && (
                  <div>
                    <label className="block text-white/60 text-sm mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                      Tipo de Produto
                    </label>
                    <p className="text-white text-lg" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      {product.tipoProduto}
                    </p>
                  </div>
                )}

                {product.fabricante && (
                  <div>
                    <label className="block text-white/60 text-sm mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                      Fabricante
                    </label>
                    <p className="text-white text-lg" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      {product.fabricante}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {(product.composicao || product.grade || product.linha || product.griffe || product.colecao || product.obsFornecedor) && (
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-6">
                  <FileText className="w-6 h-6 text-white" />
                  <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Características
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {product.composicao && (
                    <div>
                      <label className="block text-white/60 text-sm mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                        Composição
                      </label>
                      <p className="text-white text-lg" style={{ fontFamily: 'Outfit, sans-serif' }}>
                        {product.composicao}
                      </p>
                    </div>
                  )}

                  {product.grade && (
                    <div>
                      <label className="block text-white/60 text-sm mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                        Grade
                      </label>
                      <p className="text-white text-lg" style={{ fontFamily: 'Outfit, sans-serif' }}>
                        {product.grade}
                      </p>
                    </div>
                  )}

                  {product.linha && (
                    <div>
                      <label className="block text-white/60 text-sm mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                        Linha
                      </label>
                      <p className="text-white text-lg" style={{ fontFamily: 'Outfit, sans-serif' }}>
                        {product.linha}
                      </p>
                    </div>
                  )}

                  {product.griffe && (
                    <div>
                      <label className="block text-white/60 text-sm mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                        Griffe
                      </label>
                      <p className="text-white text-lg" style={{ fontFamily: 'Outfit, sans-serif' }}>
                        {product.griffe}
                      </p>
                    </div>
                  )}

                  {product.colecao && (
                    <div>
                      <label className="block text-white/60 text-sm mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                        Coleção
                      </label>
                      <p className="text-white text-lg" style={{ fontFamily: 'Outfit, sans-serif' }}>
                        {product.colecao}
                      </p>
                    </div>
                  )}

                  {product.obsFornecedor && (
                    <div className="md:col-span-2">
                      <label className="block text-white/60 text-sm mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                        Observações do Fornecedor
                      </label>
                      <p className="text-white text-lg" style={{ fontFamily: 'Outfit, sans-serif' }}>
                        {product.obsFornecedor}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {product.cores && product.cores.length > 0 && (
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-6">
                  <Palette className="w-6 h-6 text-white" />
                  <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Cores ({product.cores.length})
                  </h3>
                </div>
                <div className="space-y-4">
                  {product.cores.map((cor, index) => (
                    <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                        <div>
                          <span className="text-white/60" style={{ fontFamily: 'Outfit, sans-serif' }}>
                            Código:{' '}
                          </span>
                          <span className="text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                            {cor.codCor}
                          </span>
                        </div>
                        <div>
                          <span className="text-white/60" style={{ fontFamily: 'Outfit, sans-serif' }}>
                            Descrição:{' '}
                          </span>
                          <span className="text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                            {cor.descCor}
                          </span>
                        </div>
                        <div>
                          <span className="text-white/60" style={{ fontFamily: 'Outfit, sans-serif' }}>
                            Origem:{' '}
                          </span>
                          <span className="text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                            {cor.origemCor}
                          </span>
                        </div>
                        <div>
                          <span className="text-white/60" style={{ fontFamily: 'Outfit, sans-serif' }}>
                            Cor Fab.:{' '}
                          </span>
                          <span className="text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                            {cor.corFabricante}
                          </span>
                        </div>
                        <div>
                          <span className="text-white/60" style={{ fontFamily: 'Outfit, sans-serif' }}>
                            NCM:{' '}
                          </span>
                          <span className="text-white font-mono" style={{ fontFamily: 'Outfit, sans-serif' }}>
                            {cor.ncm}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {product.precos && product.precos.length > 0 && (
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-6">
                  <DollarSign className="w-6 h-6 text-white" />
                  <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Tabela de Preços ({product.precos.length})
                  </h3>
                </div>
                <div className="space-y-3">
                  {product.precos.map((preco, index) => (
                    <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10 flex justify-between items-center">
                      <div>
                        <span className="text-white/60 text-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>
                          Tabela:{' '}
                        </span>
                        <span className="text-white font-medium" style={{ fontFamily: 'Outfit, sans-serif' }}>
                          {preco.codigoTabelaPreco}
                        </span>
                      </div>
                      <div className="text-white text-xl font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                        R$ {preco.preco.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {product.fotos && product.fotos.length > 0 && (
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-6">
                  <Camera className="w-6 h-6 text-white" />
                  <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Fotos do Produto ({product.fotos.length})
                  </h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {product.fotos.map((foto, index) => (
                    <div key={index} className="bg-white/5 rounded-xl p-3 border border-white/10">
                      {foto.base64Foto && (
                        <img
                          src={`data:image/jpeg;base64,${foto.base64Foto}`}
                          alt={foto.nomeArquivo}
                          className="w-full h-48 object-cover rounded-lg mb-2"
                        />
                      )}
                      <p className="text-white/80 text-xs truncate" style={{ fontFamily: 'Outfit, sans-serif' }}>
                        {foto.nomeArquivo}
                      </p>
                      {foto.corLinx && (
                        <p className="text-white/60 text-xs" style={{ fontFamily: 'Outfit, sans-serif' }}>
                          Cor: {foto.corLinx}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {product.barras && product.barras.length > 0 && (
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-6">
                  <Barcode className="w-6 h-6 text-white" />
                  <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Códigos de Barras ({product.barras.length})
                  </h3>
                </div>
                <div className="space-y-3">
                  {product.barras.map((barra, index) => (
                    <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <span className="text-white/60" style={{ fontFamily: 'Outfit, sans-serif' }}>
                            Código:{' '}
                          </span>
                          <span className="text-white font-mono" style={{ fontFamily: 'Outfit, sans-serif' }}>
                            {barra.codigoBarra}
                          </span>
                        </div>
                        <div>
                          <span className="text-white/60" style={{ fontFamily: 'Outfit, sans-serif' }}>
                            Cor:{' '}
                          </span>
                          <span className="text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                            {barra.corProduto}
                          </span>
                        </div>
                        <div>
                          <span className="text-white/60" style={{ fontFamily: 'Outfit, sans-serif' }}>
                            Tamanho:{' '}
                          </span>
                          <span className="text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                            {barra.tamanho}
                          </span>
                        </div>
                        <div>
                          <span className="text-white/60" style={{ fontFamily: 'Outfit, sans-serif' }}>
                            Grade:{' '}
                          </span>
                          <span className="text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                            {barra.grade}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {departamento === 'fiscal' && canIniciar && (
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-6">
                  <ClipboardList className="w-6 h-6 text-white" />
                  <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Análise Fiscal
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-white/90 mb-2 text-sm" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                      NCM
                    </label>
                    <input
                      type="text"
                      value={formFiscal.ncm}
                      onChange={(e) => setFormFiscal({ ...formFiscal, ncm: e.target.value })}
                      className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                      style={{ fontFamily: 'Outfit, sans-serif' }}
                    />
                  </div>

                  <div>
                    <label className="block text-white/90 mb-2 text-sm" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                      CEST
                    </label>
                    <input
                      type="text"
                      value={formFiscal.cest}
                      onChange={(e) => setFormFiscal({ ...formFiscal, cest: e.target.value })}
                      className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                      style={{ fontFamily: 'Outfit, sans-serif' }}
                    />
                  </div>

                  <div>
                    <label className="block text-white/90 mb-2 text-sm" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                      Tribut. Origem
                    </label>
                    <input
                      type="text"
                      value={formFiscal.tributOrigem}
                      onChange={(e) => setFormFiscal({ ...formFiscal, tributOrigem: e.target.value })}
                      className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                      style={{ fontFamily: 'Outfit, sans-serif' }}
                    />
                  </div>

                  <div>
                    <label className="block text-white/90 mb-2 text-sm" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                      Tribut. ICMS
                    </label>
                    <input
                      type="text"
                      value={formFiscal.tributIcms}
                      onChange={(e) => setFormFiscal({ ...formFiscal, tributIcms: e.target.value })}
                      className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                      style={{ fontFamily: 'Outfit, sans-serif' }}
                    />
                  </div>

                  <div>
                    <label className="block text-white/90 mb-2 text-sm" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                      Tipo Item SPED
                    </label>
                    <input
                      type="text"
                      value={formFiscal.tipoItemSped}
                      onChange={(e) => setFormFiscal({ ...formFiscal, tipoItemSped: e.target.value })}
                      className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                      style={{ fontFamily: 'Outfit, sans-serif' }}
                    />
                  </div>

                  <div>
                    <label className="block text-white/90 mb-2 text-sm" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                      ID Exceção Grupo
                    </label>
                    <input
                      type="text"
                      value={formFiscal.idExcecaoGrupo}
                      onChange={(e) => setFormFiscal({ ...formFiscal, idExcecaoGrupo: e.target.value })}
                      className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                      style={{ fontFamily: 'Outfit, sans-serif' }}
                    />
                  </div>

                  <div>
                    <label className="block text-white/90 mb-2 text-sm" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                      Classificação Fiscal Final
                    </label>
                    <input
                      type="text"
                      value={formFiscal.classificacaoFiscalFinal}
                      onChange={(e) => setFormFiscal({ ...formFiscal, classificacaoFiscalFinal: e.target.value })}
                      className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                      style={{ fontFamily: 'Outfit, sans-serif' }}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-white/90 mb-2 text-sm" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                      Observações Fiscal
                    </label>
                    <textarea
                      value={formFiscal.obsFiscal}
                      onChange={(e) => setFormFiscal({ ...formFiscal, obsFiscal: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300 resize-none"
                      style={{ fontFamily: 'Outfit, sans-serif' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {departamento === 'compras' && canIniciar && (
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-6">
                  <ClipboardList className="w-6 h-6 text-white" />
                  <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Análise Compras
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-white/90 mb-2 text-sm" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                      Grupo Produto
                    </label>
                    <input
                      type="text"
                      value={formCompras.grupoProduto}
                      onChange={(e) => setFormCompras({ ...formCompras, grupoProduto: e.target.value })}
                      className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                      style={{ fontFamily: 'Outfit, sans-serif' }}
                    />
                  </div>

                  <div>
                    <label className="block text-white/90 mb-2 text-sm" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                      Subgrupo Produto
                    </label>
                    <input
                      type="text"
                      value={formCompras.subgrupoProduto}
                      onChange={(e) => setFormCompras({ ...formCompras, subgrupoProduto: e.target.value })}
                      className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                      style={{ fontFamily: 'Outfit, sans-serif' }}
                    />
                  </div>

                  <div>
                    <label className="block text-white/90 mb-2 text-sm" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                      Código Categoria
                    </label>
                    <input
                      type="text"
                      value={formCompras.codCategoria}
                      onChange={(e) => setFormCompras({ ...formCompras, codCategoria: e.target.value })}
                      className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                      style={{ fontFamily: 'Outfit, sans-serif' }}
                    />
                  </div>

                  <div>
                    <label className="block text-white/90 mb-2 text-sm" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                      Código Subcategoria
                    </label>
                    <input
                      type="text"
                      value={formCompras.codSubcategoria}
                      onChange={(e) => setFormCompras({ ...formCompras, codSubcategoria: e.target.value })}
                      className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                      style={{ fontFamily: 'Outfit, sans-serif' }}
                    />
                  </div>

                  <div>
                    <label className="block text-white/90 mb-2 text-sm" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                      Unidade
                    </label>
                    <input
                      type="text"
                      value={formCompras.unidade}
                      onChange={(e) => setFormCompras({ ...formCompras, unidade: e.target.value })}
                      className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                      style={{ fontFamily: 'Outfit, sans-serif' }}
                    />
                  </div>

                  <div>
                    <label className="block text-white/90 mb-2 text-sm" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                      CEST
                    </label>
                    <input
                      type="text"
                      value={formCompras.cest}
                      onChange={(e) => setFormCompras({ ...formCompras, cest: e.target.value })}
                      className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                      style={{ fontFamily: 'Outfit, sans-serif' }}
                    />
                  </div>

                  <div>
                    <label className="block text-white/90 mb-2 text-sm" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                      Tipo Status Produto
                    </label>
                    <input
                      type="text"
                      value={formCompras.tipoStatusProduto}
                      onChange={(e) => setFormCompras({ ...formCompras, tipoStatusProduto: e.target.value })}
                      className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                      style={{ fontFamily: 'Outfit, sans-serif' }}
                    />
                  </div>

                  <div>
                    <label className="block text-white/90 mb-2 text-sm" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                      Sexo Tipo
                    </label>
                    <input
                      type="text"
                      value={formCompras.sexoTipo}
                      onChange={(e) => setFormCompras({ ...formCompras, sexoTipo: e.target.value })}
                      className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                      style={{ fontFamily: 'Outfit, sans-serif' }}
                    />
                  </div>

                  <div>
                    <label className="block text-white/90 mb-2 text-sm" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                      Conta Contábil
                    </label>
                    <input
                      type="text"
                      value={formCompras.contaContabil}
                      onChange={(e) => setFormCompras({ ...formCompras, contaContabil: e.target.value })}
                      className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                      style={{ fontFamily: 'Outfit, sans-serif' }}
                    />
                  </div>

                  <div>
                    <label className="block text-white/90 mb-2 text-sm" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                      Conta Contábil Compra
                    </label>
                    <input
                      type="text"
                      value={formCompras.contaContabilCompra}
                      onChange={(e) => setFormCompras({ ...formCompras, contaContabilCompra: e.target.value })}
                      className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                      style={{ fontFamily: 'Outfit, sans-serif' }}
                    />
                  </div>

                  <div>
                    <label className="block text-white/90 mb-2 text-sm" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                      Conta Contábil Venda
                    </label>
                    <input
                      type="text"
                      value={formCompras.contaContabilVenda}
                      onChange={(e) => setFormCompras({ ...formCompras, contaContabilVenda: e.target.value })}
                      className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                      style={{ fontFamily: 'Outfit, sans-serif' }}
                    />
                  </div>

                  <div>
                    <label className="block text-white/90 mb-2 text-sm" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                      Conta Contábil Dev. Compra
                    </label>
                    <input
                      type="text"
                      value={formCompras.contaContabilDevCompra}
                      onChange={(e) => setFormCompras({ ...formCompras, contaContabilDevCompra: e.target.value })}
                      className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                      style={{ fontFamily: 'Outfit, sans-serif' }}
                    />
                  </div>

                  <div>
                    <label className="block text-white/90 mb-2 text-sm" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                      Conta Contábil Dev. Venda
                    </label>
                    <input
                      type="text"
                      value={formCompras.contaContabilDevVenda}
                      onChange={(e) => setFormCompras({ ...formCompras, contaContabilDevVenda: e.target.value })}
                      className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                      style={{ fontFamily: 'Outfit, sans-serif' }}
                    />
                  </div>

                  <div>
                    <label className="block text-white/90 mb-2 text-sm" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                      Indicador CFOP
                    </label>
                    <input
                      type="text"
                      value={formCompras.indicadorCfop}
                      onChange={(e) => setFormCompras({ ...formCompras, indicadorCfop: e.target.value })}
                      className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                      style={{ fontFamily: 'Outfit, sans-serif' }}
                    />
                  </div>

                  <div>
                    <label className="block text-white/90 mb-2 text-sm" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                      Continuidade
                    </label>
                    <input
                      type="text"
                      value={formCompras.continuidade}
                      onChange={(e) => setFormCompras({ ...formCompras, continuidade: e.target.value })}
                      className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                      style={{ fontFamily: 'Outfit, sans-serif' }}
                    />
                  </div>

                  <div>
                    <label className="block text-white/90 mb-2 text-sm" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                      Período PCP
                    </label>
                    <input
                      type="text"
                      value={formCompras.periodoPcp}
                      onChange={(e) => setFormCompras({ ...formCompras, periodoPcp: e.target.value })}
                      className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                      style={{ fontFamily: 'Outfit, sans-serif' }}
                    />
                  </div>

                  <div>
                    <label className="block text-white/90 mb-2 text-sm" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                      Rede Lojas
                    </label>
                    <input
                      type="text"
                      value={formCompras.redeLojas}
                      onChange={(e) => setFormCompras({ ...formCompras, redeLojas: e.target.value })}
                      className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                      style={{ fontFamily: 'Outfit, sans-serif' }}
                    />
                  </div>

                  <div>
                    <label className="block text-white/90 mb-2 text-sm" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                      Código Produto Solução
                    </label>
                    <input
                      type="text"
                      value={formCompras.codProdutoSolucao}
                      onChange={(e) => setFormCompras({ ...formCompras, codProdutoSolucao: e.target.value })}
                      className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                      style={{ fontFamily: 'Outfit, sans-serif' }}
                    />
                  </div>

                  <div>
                    <label className="block text-white/90 mb-2 text-sm" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                      Sujeito Subst. Tributária
                    </label>
                    <input
                      type="text"
                      value={formCompras.sujeitoSubstituicaoTributaria}
                      onChange={(e) => setFormCompras({ ...formCompras, sujeitoSubstituicaoTributaria: e.target.value })}
                      className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                      style={{ fontFamily: 'Outfit, sans-serif' }}
                    />
                  </div>

                  <div>
                    <label className="block text-white/90 mb-2 text-sm" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                      Código Produto Segmento
                    </label>
                    <input
                      type="text"
                      value={formCompras.codProdutoSegmento}
                      onChange={(e) => setFormCompras({ ...formCompras, codProdutoSegmento: e.target.value })}
                      className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                      style={{ fontFamily: 'Outfit, sans-serif' }}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-white/90 mb-2 text-sm" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                      Observações Compras
                    </label>
                    <textarea
                      value={formCompras.obsCompras}
                      onChange={(e) => setFormCompras({ ...formCompras, obsCompras: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300 resize-none"
                      style={{ fontFamily: 'Outfit, sans-serif' }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {showActions && (
          <div className="sticky bottom-0 bg-white/15 backdrop-blur-xl border-t-2 border-white/20 px-8 py-6">
            <div className="flex items-center justify-end gap-4">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/30 transition-all duration-300"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                Fechar
              </button>

              {canIniciar && onIniciarAnalise && (
                <button
                  onClick={() => {
                    if (departamento === 'fiscal') {
                      console.log('Dados Fiscais preenchidos:', formFiscal);
                    } else if (departamento === 'compras') {
                      console.log('Dados Compras preenchidos:', formCompras);
                    }
                    onIniciarAnalise();
                    onClose();
                  }}
                  className="px-6 py-3 bg-blue-500/30 hover:bg-blue-500/50 text-white rounded-xl border border-blue-400/30 transition-all duration-300 font-medium"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  Iniciar Análise
                </button>
              )}

              {canAprovar && (
                <>
                  {onReprovar && (
                    <button
                      onClick={() => {
                        onReprovar();
                        onClose();
                      }}
                      className="px-6 py-3 bg-red-500/30 hover:bg-red-500/50 text-white rounded-xl border border-red-400/30 transition-all duration-300 font-medium flex items-center gap-2"
                      style={{ fontFamily: 'Outfit, sans-serif' }}
                    >
                      <XCircle className="w-4 h-4" />
                      Reprovar
                    </button>
                  )}
                  {onAprovar && (
                    <button
                      onClick={() => {
                        onAprovar();
                        onClose();
                      }}
                      className="px-6 py-3 bg-green-500/30 hover:bg-green-500/50 text-white rounded-xl border border-green-400/30 transition-all duration-300 font-medium flex items-center gap-2"
                      style={{ fontFamily: 'Outfit, sans-serif' }}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Aprovar
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

