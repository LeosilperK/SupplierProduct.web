import { X, Building2, MapPin, Phone, DollarSign, Package, FileText } from 'lucide-react';
import type { FornecedorCadastroCompleto } from '../lib/supplier-api';

interface FornecedorDetalhesModalProps {
  fornecedor: FornecedorCadastroCompleto;
  isOpen: boolean;
  onClose: () => void;
}

function formatMetodoPagamento(value: number | null | undefined) {
  if (value == null) return '-';
  switch (value) {
    case 0:
      return 'Boleto';
    case 1:
      return 'Transferência';
    case 2:
      return 'Pix';
    case 3:
      return 'Outros';
    default:
      return String(value);
  }
}

function yesNo(value: boolean | null | undefined) {
  if (value == null) return '-';
  return value ? 'Sim' : 'Não';
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <label className="block text-white/60 text-sm mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
        {label}
      </label>
      <p className="text-white text-lg" style={{ fontFamily: 'Outfit, sans-serif' }}>
        {value ?? '-'}
      </p>
    </div>
  );
}

export function FornecedorDetalhesModal({ fornecedor, isOpen, onClose }: FornecedorDetalhesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-[fadeIn_0.3s_ease-out]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative bg-white/10 backdrop-blur-2xl rounded-3xl border-2 border-white/30 shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden animate-[slideUp_0.4s_ease-out]">
        <div className="sticky top-0 z-10 bg-white/15 backdrop-blur-xl border-b-2 border-white/20 px-8 py-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
              Detalhes do Fornecedor
            </h2>
            <p className="text-white/70 text-sm" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
              {fornecedor.razaoSocial || fornecedor.nomeCliFor || fornecedor.nomeFornecedor || 'Fornecedor'} • {fornecedor.cgcCpf}
            </p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all duration-200">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)] px-8 py-6">
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <Building2 className="w-6 h-6 text-white" />
                <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Dados Básicos
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="CNPJ/CPF" value={fornecedor.cgcCpf || '-'} />
                <Field label="Tipo (PJ/PF)" value={fornecedor.pjPf === 0 ? 'Pessoa Jurídica' : fornecedor.pjPf === 1 ? 'Pessoa Física' : '-'} />
                <div className="md:col-span-2">
                  <Field label="Razão Social" value={fornecedor.razaoSocial || '-'} />
                </div>
                <div className="md:col-span-2">
                  <Field label="Nome Fantasia" value={fornecedor.nomeCliFor || '-'} />
                </div>
                <Field label="RG/IE" value={fornecedor.rgIe || '-'} />
                <Field label="CliFor" value={fornecedor.cliFor ?? '-'} />
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="w-6 h-6 text-white" />
                <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Endereço
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <Field label="CEP" value={fornecedor.cep || '-'} />
                <Field label="UF" value={fornecedor.uf || '-'} />
                <Field label="País" value={fornecedor.pais || '-'} />
                <div className="md:col-span-2">
                  <Field label="Endereço" value={fornecedor.endereco || '-'} />
                </div>
                <Field label="Número" value={fornecedor.numero || '-'} />
                <div className="md:col-span-2">
                  <Field label="Complemento" value={fornecedor.complemento || '-'} />
                </div>
                <Field label="Bairro" value={fornecedor.bairro || '-'} />
                <Field label="Cidade" value={fornecedor.cidade || '-'} />
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <Phone className="w-6 h-6 text-white" />
                <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Contato
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <Field label="DDI" value={fornecedor.ddi || '-'} />
                <Field label="DDD 1" value={fornecedor.ddd1 || '-'} />
                <Field label="DDD 2" value={fornecedor.ddd2 || '-'} />
                <Field label="E-mail" value={fornecedor.email || '-'} />
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <DollarSign className="w-6 h-6 text-white" />
                <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Dados Financeiros
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Tipo" value={fornecedor.tipo || '-'} />
                <Field label="Centro de Custo" value={fornecedor.centroCusto || '-'} />
                <Field label="Condição de Pagamento" value={fornecedor.condicaoPgto || '-'} />
                <Field label="Moeda" value={fornecedor.moeda || '-'} />
                <Field label="Conta Contábil" value={fornecedor.ctbContaContabil || '-'} />
                <Field label="Método de Pagamento" value={formatMetodoPagamento(fornecedor.lxMetodoPagamento)} />
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <Package className="w-6 h-6 text-white" />
                <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Tipo de Fornecimento
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Fornece Material de Consumo" value={yesNo(fornecedor.forneceMatConsumo)} />
                <Field label="Fornece Materiais" value={yesNo(fornecedor.forneceMateriais)} />
                <Field label="Fornece Produtos Acabados" value={yesNo(fornecedor.forneceProdAcab)} />
                <Field label="Beneficiador" value={yesNo(fornecedor.beneficiador)} />
                <Field label="Fornece Outros" value={yesNo(fornecedor.forneceOutros)} />
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="w-6 h-6 text-white" />
                <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Informações Adicionais
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <Field label="Propriedade 00014" value={fornecedor.prop00014 || '-'} />
                <Field label="Propriedade 00035" value={fornecedor.prop00035 || '-'} />
                <Field label="Propriedade 00123" value={fornecedor.prop00123 || '-'} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

