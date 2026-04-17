import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Layout } from './Layout';
import { Plus, LogOut, Package, BarChart3 } from 'lucide-react';
import { ImageWithFallback } from './ui/image-with-fallback';

interface Product {
  id: number;
  name: string;
  code: string;
  stock: number;
}

interface FornecedorData {
  nomeFornecedor: string;
  centroCusto: string;
  tipo: string;
  codigoFornecedor: string;
  cliFor: string;
  condicaoPgto: string;
  cgcCpf: string;
  inativo: boolean;
  moeda: string;
}

export function FornecedorDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  // Dados do fornecedor vindos da consulta
  const fornecedorData: FornecedorData = location.state?.fornecedorData || {
    nomeFornecedor: 'TESTE API FORNECEDOR 3',
    centroCusto: '29100',
    tipo: 'OUTROS',
    codigoFornecedor: '307300',
    cliFor: '307300',
    condicaoPgto: '001',
    cgcCpf: '12345678903',
    inativo: false,
    moeda: 'R$',
  };

  const [products] = useState<Product[]>([
    { id: 1, name: 'Produto Premium A', code: 'PRD-001', stock: 150 },
    { id: 2, name: 'Produto Executive B', code: 'PRD-002', stock: 89 },
    { id: 3, name: 'Produto Professional C', code: 'PRD-003', stock: 234 },
    { id: 4, name: 'Produto Elite D', code: 'PRD-004', stock: 45 },
  ]);

  return (
    <Layout showLogo={false}>
      <div className="w-full max-w-7xl">
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
                  Bem-vindo, <span className="font-medium">{fornecedorData.nomeFornecedor}</span>
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
                  {fornecedorData.codigoFornecedor}
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <p className="text-white/60 text-sm mb-1" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                  CliFor
                </p>
                <p className="text-white text-xl font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {fornecedorData.cliFor}
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <p className="text-white/60 text-sm mb-1" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                  CGC/CPF
                </p>
                <p className="text-white text-xl font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {fornecedorData.cgcCpf}
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <p className="text-white/60 text-sm mb-1" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                  Centro de Custo
                </p>
                <p className="text-white text-xl font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {fornecedorData.centroCusto}
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <p className="text-white/60 text-sm mb-1" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                  Tipo
                </p>
                <p className="text-white text-xl font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {fornecedorData.tipo}
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <p className="text-white/60 text-sm mb-1" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                  Condição de Pagamento
                </p>
                <p className="text-white text-xl font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {fornecedorData.condicaoPgto}
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <p className="text-white/60 text-sm mb-1" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                  Moeda
                </p>
                <p className="text-white text-xl font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {fornecedorData.moeda}
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <p className="text-white/60 text-sm mb-1" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                  Status
                </p>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${fornecedorData.inativo ? 'bg-red-400' : 'bg-green-400'}`}></div>
                  <p className="text-white text-xl font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {fornecedorData.inativo ? 'Inativo' : 'Ativo'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border-2 border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm mb-1" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                    Total de Produtos
                  </p>
                  <p className="text-4xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {products.length}
                  </p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                  <Package className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border-2 border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm mb-1" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                    Estoque Total
                  </p>
                  <p className="text-4xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {products.reduce((sum, p) => sum + p.stock, 0)}
                  </p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border-2 border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm mb-1" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                    Média por Produto
                  </p>
                  <p className="text-4xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {Math.round(products.reduce((sum, p) => sum + p.stock, 0) / products.length)}
                  </p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                  <Package className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 border-2 border-white/20 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                Seus Produtos Cadastrados
              </h2>
              <button
                className="flex items-center gap-3 bg-white text-[#ca0404] px-6 py-3 rounded-xl font-semibold hover:bg-white/90 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                <Plus className="w-5 h-5" />
                Novo Produto
              </button>
            </div>

            {/* Products Table */}
            <div className="overflow-hidden rounded-xl border-2 border-white/20">
              <table className="w-full">
                <thead>
                  <tr className="bg-white/20 backdrop-blur-sm">
                    <th className="text-left px-6 py-4 text-white font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      Produto
                    </th>
                    <th className="text-left px-6 py-4 text-white font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      Código
                    </th>
                    <th className="text-left px-6 py-4 text-white font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      Estoque
                    </th>
                    <th className="text-right px-6 py-4 text-white font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => (
                    <tr
                      key={product.id}
                      className="border-t-2 border-white/10 hover:bg-white/10 transition-colors duration-200"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td className="px-6 py-5 text-white text-lg" style={{ fontFamily: 'Outfit, sans-serif' }}>
                        {product.name}
                      </td>
                      <td className="px-6 py-5 text-white/80" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                        {product.code}
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex px-4 py-1 rounded-full text-sm font-medium ${
                            product.stock > 100
                              ? 'bg-green-500/20 text-green-100 border border-green-400/30'
                              : product.stock > 50
                              ? 'bg-yellow-500/20 text-yellow-100 border border-yellow-400/30'
                              : 'bg-red-500/20 text-red-100 border border-red-400/30'
                          }`}
                          style={{ fontFamily: 'Outfit, sans-serif' }}
                        >
                          {product.stock} un.
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button className="text-white/70 hover:text-white transition-colors duration-200 px-4 py-2 hover:bg-white/10 rounded-lg" style={{ fontFamily: 'Outfit, sans-serif' }}>
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
