import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Layout } from './Layout';
import { ArrowLeft, Package, FileText, Palette, DollarSign, Camera, Barcode, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { getAuthSession } from '../lib/auth-storage';
import {
  ApiError,
  atualizarPreCadastroProduto,
  criarPreCadastroProduto,
  type ProdutoCadastroDetalhe,
  type ProdutoPreCadastroPayload,
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

interface ProdutoFormData {
  descProduto: string;
  descProdutoNf: string;
  referFabricante: string;
  ncm: string;
  tipoProduto: string;
  fabricante: string;
  composicao: string;
  grade: string;
  linha: string;
  griffe: string;
  colecao: string;
  obsFornecedor: string;
  cores: Cor[];
  precos: Preco[];
  fotos: Foto[];
  barras: Barra[];
}

type ProdutoCadastroMode = 'create' | 'edit';

function toPayload(formData: ProdutoFormData): ProdutoPreCadastroPayload {
  return {
    descProduto: formData.descProduto,
    descProdutoNf: formData.descProdutoNf || null,
    referFabricante: formData.referFabricante || null,
    ncm: formData.ncm || null,
    tipoProduto: formData.tipoProduto || null,
    fabricante: formData.fabricante || null,
    composicao: formData.composicao || null,
    grade: formData.grade || null,
    linha: formData.linha || null,
    griffe: formData.griffe || null,
    colecao: formData.colecao || null,
    obsFornecedor: formData.obsFornecedor || null,
    cores: formData.cores.map((c) => ({
      codCor: c.codCor,
      descCor: c.descCor,
      origemCor: c.origemCor,
      corFabricante: c.corFabricante,
      ncm: c.ncm,
    })),
    precos: formData.precos.map((p) => ({
      codigoTabelaPreco: p.codigoTabelaPreco,
      preco: p.preco,
    })),
    fotos: formData.fotos.map((f) => ({
      corLinx: f.corLinx,
      nomeArquivo: f.nomeArquivo,
      caminhoArquivo: f.caminhoArquivo,
      base64Foto: f.base64Foto,
      ordemFoto: f.ordemFoto,
    })),
    barras: formData.barras.map((b) => ({
      codigoBarra: b.codigoBarra,
      corProduto: b.corProduto,
      tamanho: b.tamanho,
      grade: b.grade,
    })),
  };
}

function fromDetalhe(produto: ProdutoCadastroDetalhe): ProdutoFormData {
  return {
    descProduto: produto.descProduto ?? '',
    descProdutoNf: produto.descProdutoNf ?? '',
    referFabricante: produto.referFabricante ?? '',
    ncm: produto.ncm ?? '',
    tipoProduto: produto.tipoProduto ?? '',
    fabricante: produto.fabricante ?? '',
    composicao: produto.composicao ?? '',
    grade: produto.grade ?? '',
    linha: produto.linha ?? '',
    griffe: produto.griffe ?? '',
    colecao: produto.colecao ?? '',
    obsFornecedor: produto.obsFornecedor ?? '',
    cores: (produto.cores ?? []).map((c) => ({
      codCor: c.codCor ?? '',
      descCor: c.descCor ?? '',
      origemCor: c.origemCor ?? '',
      corFabricante: c.corFabricante ?? '',
      ncm: c.ncm ?? '',
    })),
    precos: (produto.precos ?? []).map((p) => ({
      codigoTabelaPreco: p.codigoTabelaPreco ?? '',
      preco: Number(p.preco ?? 0),
    })),
    fotos: (produto.fotos ?? []).map((f) => ({
      corLinx: f.corLinx ?? '',
      nomeArquivo: f.nomeArquivo ?? '',
      caminhoArquivo: f.caminhoArquivo ?? '',
      base64Foto: f.base64Foto ?? '',
      ordemFoto: Number(f.ordemFoto ?? 0),
    })),
    barras: (produto.barras ?? []).map((b) => ({
      codigoBarra: b.codigoBarra ?? '',
      corProduto: b.corProduto ?? '',
      tamanho: b.tamanho ?? '',
      grade: b.grade ?? '',
    })),
  };
}

export function ProdutoCadastro({
  mode = 'create',
  fornecedorData: fornecedorDataProp,
  produtoId,
  produtoDetalhe,
  isLoading = false,
  readOnly = false,
}: {
  mode?: ProdutoCadastroMode;
  fornecedorData?: unknown;
  produtoId?: number;
  produtoDetalhe?: ProdutoCadastroDetalhe;
  isLoading?: boolean;
  readOnly?: boolean;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const fornecedorData = useMemo(() => fornecedorDataProp ?? location.state?.fornecedorData, [fornecedorDataProp, location.state]);
  const isReadOnly = Boolean(readOnly);

  const [formData, setFormData] = useState<ProdutoFormData>({
    descProduto: '',
    descProdutoNf: '',
    referFabricante: '',
    ncm: '',
    tipoProduto: '',
    fabricante: '',
    composicao: '',
    grade: '',
    linha: '',
    griffe: '',
    colecao: '',
    obsFornecedor: '',
    cores: [],
    precos: [],
    fotos: [],
    barras: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && produtoDetalhe) {
      setFormData(fromDetalhe(produtoDetalhe));
    }
  }, [mode, produtoDetalhe]);

  const handleChange = (field: keyof ProdutoFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleAddCor = () => {
    setFormData({
      ...formData,
      cores: [...formData.cores, { codCor: '', descCor: '', origemCor: '', corFabricante: '', ncm: '' }],
    });
  };

  const handleRemoveCor = (index: number) => {
    setFormData({
      ...formData,
      cores: formData.cores.filter((_, i) => i !== index),
    });
  };

  const handleCorChange = (index: number, field: keyof Cor, value: string) => {
    const newCores = [...formData.cores];
    newCores[index] = { ...newCores[index], [field]: value };
    setFormData({ ...formData, cores: newCores });
  };

  const handleAddPreco = () => {
    setFormData({
      ...formData,
      precos: [...formData.precos, { codigoTabelaPreco: '', preco: 0 }],
    });
  };

  const handleRemovePreco = (index: number) => {
    setFormData({
      ...formData,
      precos: formData.precos.filter((_, i) => i !== index),
    });
  };

  const handlePrecoChange = (index: number, field: keyof Preco, value: string | number) => {
    const newPrecos = [...formData.precos];
    newPrecos[index] = { ...newPrecos[index], [field]: value };
    setFormData({ ...formData, precos: newPrecos });
  };

  const handleAddBarra = () => {
    setFormData({
      ...formData,
      barras: [...formData.barras, { codigoBarra: '', corProduto: '', tamanho: '', grade: '' }],
    });
  };

  const handleRemoveBarra = (index: number) => {
    setFormData({
      ...formData,
      barras: formData.barras.filter((_, i) => i !== index),
    });
  };

  const handleBarraChange = (index: number, field: keyof Barra, value: string) => {
    const newBarras = [...formData.barras];
    newBarras[index] = { ...newBarras[index], [field]: value };
    setFormData({ ...formData, barras: newBarras });
  };

  const handleAddFoto = () => {
    setFormData({
      ...formData,
      fotos: [
        ...formData.fotos,
        { corLinx: '', nomeArquivo: '', caminhoArquivo: '', base64Foto: '', ordemFoto: formData.fotos.length + 1 },
      ],
    });
  };

  const handleRemoveFoto = (index: number) => {
    setFormData({
      ...formData,
      fotos: formData.fotos.filter((_, i) => i !== index),
    });
  };

  const handleFotoChange = (index: number, field: keyof Foto, value: string | number) => {
    const newFotos = [...formData.fotos];
    newFotos[index] = { ...newFotos[index], [field]: value };
    setFormData({ ...formData, fotos: newFotos });
  };

  const handleFileUpload = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1] ?? '';

      const newFotos = [...formData.fotos];
      newFotos[index] = {
        ...newFotos[index],
        nomeArquivo: file.name,
        caminhoArquivo: file.name,
        base64Foto: base64Data,
      };
      setFormData({ ...formData, fotos: newFotos });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (isReadOnly) {
      navigate('/fornecedor/dashboard', { state: { fornecedorData } });
      return;
    }
    const session = getAuthSession();

    if (!session?.token) {
      toast.error('Sessão expirada', {
        description: 'Faça login novamente.',
        duration: 2500,
      });
      navigate('/fornecedor/cnpj');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = toPayload(formData);

      if (mode === 'edit') {
        if (!produtoId) {
          throw new Error('Produto inválido para edição.');
        }

        await atualizarPreCadastroProduto(session.token, produtoId, payload);

        toast.success('Produto atualizado com sucesso!', {
          description: 'O pré-cadastro foi salvo.',
          duration: 2000,
        });
      } else {
        await criarPreCadastroProduto(session.token, payload);

        toast.success('Produto cadastrado com sucesso!', {
          description: 'O pré-cadastro foi salvo e está disponível no dashboard.',
          duration: 2000,
        });
      }

      setTimeout(() => {
        navigate('/fornecedor/dashboard', { state: { fornecedorData } });
      }, 700);
    } catch (error) {
      toast.error(mode === 'edit' ? 'Não foi possível atualizar o produto.' : 'Não foi possível cadastrar o produto.', {
        description: error instanceof ApiError || error instanceof Error ? error.message : 'Tente novamente mais tarde.',
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = Boolean(formData.descProduto && formData.referFabricante);

  return (
    <Layout>
      <div className="w-full max-w-7xl py-8">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 border-2 border-white/20 shadow-2xl animate-[fadeIn_0.6s_ease-out]">
          <div className="text-center mb-10">
            <h1 className="text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              {isReadOnly ? 'Detalhes do Produto' : 'Cadastro de Produto'}
            </h1>
            <div className="w-24 h-1 bg-white/40 mx-auto rounded-full mb-6"></div>
            <p className="text-white/80 text-lg" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
              {isReadOnly ? 'Visualize as informações cadastradas do produto' : 'Preencha as informações do produto para pré-cadastro'}
            </p>
          </div>

          <div className="space-y-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <Package className="w-6 h-6 text-white" />
                <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Informações Básicas
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-white/90 mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                    Descrição do Produto *
                  </label>
                  <input
                    type="text"
                    value={formData.descProduto}
                    onChange={(e) => handleChange('descProduto', e.target.value)}
                    placeholder="Ex: Camiseta Polo Premium"
                    disabled={isReadOnly}
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-white/90 mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                    Descrição Nota Fiscal
                  </label>
                  <input
                    type="text"
                    value={formData.descProdutoNf}
                    onChange={(e) => handleChange('descProdutoNf', e.target.value)}
                    placeholder="Descrição que aparecerá na NF"
                    disabled={isReadOnly}
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  />
                </div>

                <div>
                  <label className="block text-white/90 mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                    Referência Fabricante *
                  </label>
                  <input
                    type="text"
                    value={formData.referFabricante}
                    onChange={(e) => handleChange('referFabricante', e.target.value)}
                    placeholder="Código do fabricante"
                    disabled={isReadOnly}
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  />
                </div>

                <div>
                  <label className="block text-white/90 mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                    NCM
                  </label>
                  <input
                    type="text"
                    value={formData.ncm}
                    onChange={(e) => handleChange('ncm', e.target.value)}
                    placeholder="00000000"
                    maxLength={8}
                    disabled={isReadOnly}
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  />
                </div>

                <div>
                  <label className="block text-white/90 mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                    Tipo de Produto
                  </label>
                  <input
                    type="text"
                    value={formData.tipoProduto}
                    onChange={(e) => handleChange('tipoProduto', e.target.value)}
                    placeholder="Ex: Vestuário"
                    disabled={isReadOnly}
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  />
                </div>

                <div>
                  <label className="block text-white/90 mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                    Fabricante
                  </label>
                  <input
                    type="text"
                    value={formData.fabricante}
                    onChange={(e) => handleChange('fabricante', e.target.value)}
                    placeholder="Nome do fabricante"
                    disabled={isReadOnly}
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
                  Características
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-white/90 mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                    Composição
                  </label>
                  <input
                    type="text"
                    value={formData.composicao}
                    onChange={(e) => handleChange('composicao', e.target.value)}
                    placeholder="Ex: 100% Algodão"
                    disabled={isReadOnly}
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  />
                </div>

                <div>
                  <label className="block text-white/90 mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                    Grade
                  </label>
                  <input
                    type="text"
                    value={formData.grade}
                    onChange={(e) => handleChange('grade', e.target.value)}
                    placeholder="Ex: P, M, G, GG"
                    disabled={isReadOnly}
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  />
                </div>

                <div>
                  <label className="block text-white/90 mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                    Linha
                  </label>
                  <input
                    type="text"
                    value={formData.linha}
                    onChange={(e) => handleChange('linha', e.target.value)}
                    placeholder="Linha do produto"
                    disabled={isReadOnly}
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  />
                </div>

                <div>
                  <label className="block text-white/90 mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                    Griffe
                  </label>
                  <input
                    type="text"
                    value={formData.griffe}
                    onChange={(e) => handleChange('griffe', e.target.value)}
                    placeholder="Griffe/Marca"
                    disabled={isReadOnly}
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  />
                </div>

                <div>
                  <label className="block text-white/90 mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                    Coleção
                  </label>
                  <input
                    type="text"
                    value={formData.colecao}
                    onChange={(e) => handleChange('colecao', e.target.value)}
                    placeholder="Ex: Verão 2026"
                    disabled={isReadOnly}
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-white/90 mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                    Observações do Fornecedor
                  </label>
                  <textarea
                    value={formData.obsFornecedor}
                    onChange={(e) => handleChange('obsFornecedor', e.target.value)}
                    placeholder="Observações adicionais sobre o produto"
                    rows={3}
                    disabled={isReadOnly}
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300 resize-none"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Palette className="w-6 h-6 text-white" />
                  <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Cores
                  </h2>
                </div>
                {!isReadOnly && (
                  <button
                    onClick={handleAddCor}
                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg border border-white/30 transition-all duration-300"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Cor
                  </button>
                )}
              </div>

              {formData.cores.length === 0 ? (
                <p className="text-white/60 text-center py-8" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                  Nenhuma cor adicionada. Clique em "Adicionar Cor" para começar.
                </p>
              ) : (
                <div className="space-y-4">
                  {formData.cores.map((cor, index) => (
                    <div key={index} className="bg-white/5 rounded-xl p-5 border border-white/10">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-white font-medium" style={{ fontFamily: 'Outfit, sans-serif' }}>
                          Cor #{index + 1}
                        </span>
                        {!isReadOnly && (
                          <button onClick={() => handleRemoveCor(index)} className="text-red-300 hover:text-red-100 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-white/80 text-sm mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                            Código da Cor
                          </label>
                          <input
                            type="text"
                            value={cor.codCor}
                            onChange={(e) => handleCorChange(index, 'codCor', e.target.value)}
                            placeholder="Código"
                            disabled={isReadOnly}
                            className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:border-white/60"
                            style={{ fontFamily: 'Outfit, sans-serif' }}
                          />
                        </div>
                        <div>
                          <label className="block text-white/80 text-sm mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                            Descrição
                          </label>
                          <input
                            type="text"
                            value={cor.descCor}
                            onChange={(e) => handleCorChange(index, 'descCor', e.target.value)}
                            placeholder="Ex: Azul Marinho"
                            disabled={isReadOnly}
                            className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:border-white/60"
                            style={{ fontFamily: 'Outfit, sans-serif' }}
                          />
                        </div>
                        <div>
                          <label className="block text-white/80 text-sm mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                            Origem
                          </label>
                          <input
                            type="text"
                            value={cor.origemCor}
                            onChange={(e) => handleCorChange(index, 'origemCor', e.target.value)}
                            placeholder="Origem"
                            disabled={isReadOnly}
                            className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:border-white/60"
                            style={{ fontFamily: 'Outfit, sans-serif' }}
                          />
                        </div>
                        <div>
                          <label className="block text-white/80 text-sm mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                            Cor Fabricante
                          </label>
                          <input
                            type="text"
                            value={cor.corFabricante}
                            onChange={(e) => handleCorChange(index, 'corFabricante', e.target.value)}
                            placeholder="Cor do fabricante"
                            disabled={isReadOnly}
                            className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:border-white/60"
                            style={{ fontFamily: 'Outfit, sans-serif' }}
                          />
                        </div>
                        <div>
                          <label className="block text-white/80 text-sm mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                            NCM
                          </label>
                          <input
                            type="text"
                            value={cor.ncm}
                            onChange={(e) => handleCorChange(index, 'ncm', e.target.value)}
                            placeholder="NCM"
                            disabled={isReadOnly}
                            className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:border-white/60"
                            style={{ fontFamily: 'Outfit, sans-serif' }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-6 h-6 text-white" />
                  <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Tabela de Preços
                  </h2>
                </div>
                {!isReadOnly && (
                  <button
                    onClick={handleAddPreco}
                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg border border-white/30 transition-all duration-300"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Preço
                  </button>
                )}
              </div>

              {formData.precos.length === 0 ? (
                <p className="text-white/60 text-center py-8" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                  Nenhum preço adicionado. Clique em "Adicionar Preço" para começar.
                </p>
              ) : (
                <div className="space-y-4">
                  {formData.precos.map((preco, index) => (
                    <div key={index} className="bg-white/5 rounded-xl p-5 border border-white/10">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-white font-medium" style={{ fontFamily: 'Outfit, sans-serif' }}>
                          Preço #{index + 1}
                        </span>
                        {!isReadOnly && (
                          <button onClick={() => handleRemovePreco(index)} className="text-red-300 hover:text-red-100 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-white/80 text-sm mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                            Código Tabela de Preço
                          </label>
                          <input
                            type="text"
                            value={preco.codigoTabelaPreco}
                            onChange={(e) => handlePrecoChange(index, 'codigoTabelaPreco', e.target.value)}
                            placeholder="Ex: TAB001"
                            disabled={isReadOnly}
                            className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:border-white/60"
                            style={{ fontFamily: 'Outfit, sans-serif' }}
                          />
                        </div>
                        <div>
                          <label className="block text-white/80 text-sm mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                            Preço
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={preco.preco}
                            onChange={(e) => handlePrecoChange(index, 'preco', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            disabled={isReadOnly}
                            className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:border-white/60"
                            style={{ fontFamily: 'Outfit, sans-serif' }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Camera className="w-6 h-6 text-white" />
                  <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Fotos do Produto
                  </h2>
                </div>
                {!isReadOnly && (
                  <button
                    onClick={handleAddFoto}
                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg border border-white/30 transition-all duration-300"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Foto
                  </button>
                )}
              </div>

              {formData.fotos.length === 0 ? (
                <p className="text-white/60 text-center py-8" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                  Nenhuma foto adicionada. Clique em "Adicionar Foto" para começar.
                </p>
              ) : (
                <div className="space-y-4">
                  {formData.fotos.map((foto, index) => (
                    <div key={index} className="bg-white/5 rounded-xl p-5 border border-white/10">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-white font-medium" style={{ fontFamily: 'Outfit, sans-serif' }}>
                          Foto #{index + 1}
                        </span>
                        {!isReadOnly && (
                          <button onClick={() => handleRemoveFoto(index)} className="text-red-300 hover:text-red-100 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-white/80 text-sm mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                            Cor Linx
                          </label>
                          <input
                            type="text"
                            value={foto.corLinx}
                            onChange={(e) => handleFotoChange(index, 'corLinx', e.target.value)}
                            placeholder="Código da cor"
                            disabled={isReadOnly}
                            className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:border-white/60"
                            style={{ fontFamily: 'Outfit, sans-serif' }}
                          />
                        </div>
                        <div>
                          <label className="block text-white/80 text-sm mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                            Ordem da Foto
                          </label>
                          <input
                            type="number"
                            value={foto.ordemFoto}
                            onChange={(e) => handleFotoChange(index, 'ordemFoto', parseInt(e.target.value) || 0)}
                            placeholder="1"
                            disabled={isReadOnly}
                            className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:border-white/60"
                            style={{ fontFamily: 'Outfit, sans-serif' }}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-white/80 text-sm mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                            Upload da Foto
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(index, e)}
                            disabled={isReadOnly}
                            className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-white/30 file:text-white file:cursor-pointer hover:file:bg-white/40 transition-all"
                            style={{ fontFamily: 'Outfit, sans-serif' }}
                          />
                          {foto.nomeArquivo && (
                            <p className="text-white/60 text-xs mt-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                              Arquivo: {foto.nomeArquivo}
                            </p>
                          )}
                        </div>
                        {foto.base64Foto && (
                          <div className="md:col-span-2">
                            <label className="block text-white/80 text-sm mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                              Preview
                            </label>
                            <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                              <img
                                src={`data:image/jpeg;base64,${foto.base64Foto}`}
                                alt={`Preview ${index + 1}`}
                                className="max-w-full h-auto max-h-48 rounded-lg mx-auto"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Barcode className="w-6 h-6 text-white" />
                  <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Códigos de Barras
                  </h2>
                </div>
                {!isReadOnly && (
                  <button
                    onClick={handleAddBarra}
                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg border border-white/30 transition-all duration-300"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Código
                  </button>
                )}
              </div>

              {formData.barras.length === 0 ? (
                <p className="text-white/60 text-center py-8" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                  Nenhum código de barras adicionado. Clique em "Adicionar Código" para começar.
                </p>
              ) : (
                <div className="space-y-4">
                  {formData.barras.map((barra, index) => (
                    <div key={index} className="bg-white/5 rounded-xl p-5 border border-white/10">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-white font-medium" style={{ fontFamily: 'Outfit, sans-serif' }}>
                          Código #{index + 1}
                        </span>
                        {!isReadOnly && (
                          <button onClick={() => handleRemoveBarra(index)} className="text-red-300 hover:text-red-100 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-white/80 text-sm mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                            Código de Barras
                          </label>
                          <input
                            type="text"
                            value={barra.codigoBarra}
                            onChange={(e) => handleBarraChange(index, 'codigoBarra', e.target.value)}
                            placeholder="EAN/SKU"
                            disabled={isReadOnly}
                            className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:border-white/60"
                            style={{ fontFamily: 'Outfit, sans-serif' }}
                          />
                        </div>
                        <div>
                          <label className="block text-white/80 text-sm mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                            Cor
                          </label>
                          <input
                            type="text"
                            value={barra.corProduto}
                            onChange={(e) => handleBarraChange(index, 'corProduto', e.target.value)}
                            placeholder="Cor"
                            disabled={isReadOnly}
                            className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:border-white/60"
                            style={{ fontFamily: 'Outfit, sans-serif' }}
                          />
                        </div>
                        <div>
                          <label className="block text-white/80 text-sm mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                            Tamanho
                          </label>
                          <input
                            type="text"
                            value={barra.tamanho}
                            onChange={(e) => handleBarraChange(index, 'tamanho', e.target.value)}
                            placeholder="P/M/G"
                            disabled={isReadOnly}
                            className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:border-white/60"
                            style={{ fontFamily: 'Outfit, sans-serif' }}
                          />
                        </div>
                        <div>
                          <label className="block text-white/80 text-sm mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                            Grade
                          </label>
                          <input
                            type="text"
                            value={barra.grade}
                            onChange={(e) => handleBarraChange(index, 'grade', e.target.value)}
                            placeholder="Grade"
                            disabled={isReadOnly}
                            className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:border-white/60"
                            style={{ fontFamily: 'Outfit, sans-serif' }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4 pt-4">
              {!isReadOnly && (
                <button
                  onClick={handleSubmit}
                  disabled={!isFormValid || isSubmitting || isLoading}
                  className="w-full bg-white text-[#ca0404] py-5 px-8 rounded-xl text-xl font-semibold hover:bg-white/90 disabled:bg-white/20 disabled:text-white/40 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  {isLoading ? 'Carregando...' : isSubmitting ? 'Salvando...' : mode === 'edit' ? 'Salvar Alterações' : 'Cadastrar Produto'}
                </button>
              )}

              <button
                onClick={() => navigate('/fornecedor/dashboard', { state: { fornecedorData } })}
                className="w-full flex items-center justify-center text-white/80 hover:text-white text-lg transition-colors duration-300 py-4"
                style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Voltar ao Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
