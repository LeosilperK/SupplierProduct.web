import { useEffect, useMemo, useState } from 'react';
import { X, Building2, MapPin, Phone, FileText, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  analisarFiscalFornecedor,
  aprovarFiscalFornecedor,
  corrigirEnderecoIbgeFornecedor,
  integrarFornecedorErp,
  listarErpMunicipios,
  reabrirCadastroFornecedor,
  reprovarFiscalFornecedor,
  listarErpCentrosCusto,
  listarErpContasContabeis,
  listarErpMoedas,
  listarErpTiposFornecedor,
  type ComboErp,
  type FornecedorAnaliseFiscalPayload,
  type FornecedorPreCadastroDetalhe,
} from '../lib/supplier-api';
import { Combobox, type ComboboxOption } from './ui/combobox';

interface FornecedorDetalhesModalProps {
  fornecedor: FornecedorPreCadastroDetalhe;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (id: number, statusFluxo: number) => void;
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

export function FornecedorDetalhesModal({ fornecedor, isOpen, onClose, onStatusChange }: FornecedorDetalhesModalProps) {
  if (!isOpen) return null;

  const normalizeCidade = (value: string) =>
    value
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase();

  // StatusFornecedorCadastro (API):
  // 1=PreCadastro, 2=AguardandoFiscal, 3=ReprovadoFiscal, 4=AprovadoParaIntegracao, 5=IntegradoErp
  const isAprovadoParaIntegracaoInicial = fornecedor.statusFluxo === 4 || fornecedor.statusFluxo === 5;
  const [isAprovadoParaIntegracao, setIsAprovadoParaIntegracao] = useState(isAprovadoParaIntegracaoInicial);
  const [isIntegrating, setIsIntegrating] = useState(false);
  const canEditarAnaliseFiscal = fornecedor.statusFluxo === 2 && !isAprovadoParaIntegracao;
  const canAprovarFiscal = fornecedor.statusFluxo === 2;
  const [isFixingEndereco, setIsFixingEndereco] = useState(false);
  const [enderecoCidadeUf, setEnderecoCidadeUf] = useState<{ cidade: string; uf: string }>({
    cidade: fornecedor.cidade ? normalizeCidade(fornecedor.cidade) : '',
    uf: (fornecedor.uf ?? '').toUpperCase(),
  });
  const [municipiosEnderecoOptions, setMunicipiosEnderecoOptions] = useState<ComboboxOption[]>([]);
  const [loadingMunicipiosEndereco, setLoadingMunicipiosEndereco] = useState(false);

  useEffect(() => {
    setEnderecoCidadeUf({
      cidade: fornecedor.cidade ? normalizeCidade(fornecedor.cidade) : '',
      uf: (fornecedor.uf ?? '').toUpperCase(),
    });
  }, [fornecedor.cidade, fornecedor.uf]);

  const comboErpToOptions = (items: ComboErp[]): ComboboxOption[] =>
    (items ?? [])
      .filter((x) => (x?.codigo ?? '').toString().trim().length > 0)
      .map((x) => ({
        value: String(x.codigo),
        label: x.descricao?.toString() ?? String(x.codigo),
      }));

  const initialFiscal = useMemo<FornecedorAnaliseFiscalPayload>(
    () => ({
      tipo: fornecedor.tipo ?? '',
      centroCusto: fornecedor.centroCusto ?? '',
      condicaoPgto: fornecedor.condicaoPgto ?? '',
      moeda: fornecedor.moeda ?? '',
      ctbContaContabil: fornecedor.ctbContaContabil ?? '',
      lxMetodoPagamento: null,
      forneceMatConsumo: Boolean(fornecedor.forneceMatConsumo),
      forneceMateriais: Boolean(fornecedor.forneceMateriais),
      forneceProdAcab: Boolean(fornecedor.forneceProdAcab),
      beneficiador: Boolean(fornecedor.beneficiador),
      forneceOutros: Boolean(fornecedor.forneceOutros),
      prop00014: fornecedor.prop00014 ?? '1',
      prop00035: fornecedor.prop00035 ?? 'LEADTIME',
      prop00123: fornecedor.prop00123 ?? '0',
      obsFiscal: fornecedor.obsFiscal ?? null,
    }),
    [fornecedor],
  );

  const [fiscal, setFiscal] = useState<FornecedorAnaliseFiscalPayload>(initialFiscal);
  const [isSaving, setIsSaving] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const [loadingCombos, setLoadingCombos] = useState(false);
  const [combosDisponiveis, setCombosDisponiveis] = useState(false);
  const [tiposFornecedorOptions, setTiposFornecedorOptions] = useState<ComboboxOption[]>([]);
  const [centrosCustoOptions, setCentrosCustoOptions] = useState<ComboboxOption[]>([]);
  const [moedasOptions, setMoedasOptions] = useState<ComboboxOption[]>([]);
  const [contasContabeisOptions, setContasContabeisOptions] = useState<ComboboxOption[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingCombos(true);
        const [tiposFornecedor, centrosCusto, moedas, contas] = await Promise.all([
          listarErpTiposFornecedor(),
          listarErpCentrosCusto(),
          listarErpMoedas(),
          listarErpContasContabeis(),
        ]);

        setTiposFornecedorOptions(comboErpToOptions(tiposFornecedor));
        setCentrosCustoOptions(comboErpToOptions(centrosCusto));
        setMoedasOptions(comboErpToOptions(moedas));
        setContasContabeisOptions(comboErpToOptions(contas));
        setCombosDisponiveis(true);
      } catch (e) {
        setCombosDisponiveis(false);
        toast.error('Não foi possível carregar listas do ERP para os combos.', {
          description: e instanceof Error ? e.message : 'Tente novamente.',
        });
      } finally {
        setLoadingCombos(false);
      }
    };

    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
                <Field label="Cidade" value={fornecedor.cidade || '-'} />
                <Field label="País" value={fornecedor.pais || '-'} />
                <div className="md:col-span-2">
                  <Field label="Endereço" value={fornecedor.endereco || '-'} />
                </div>
                <Field label="Número" value={fornecedor.numero || '-'} />
                <div className="md:col-span-2">
                  <Field label="Complemento" value={fornecedor.complemento || '-'} />
                </div>
                <Field label="Bairro" value={fornecedor.bairro || '-'} />
              </div>

              {(fornecedor.statusFluxo === 2 || fornecedor.statusFluxo === 4 || fornecedor.statusFluxo === 5) && (
                <div className="mt-6 rounded-xl border border-amber-300/30 bg-white/5 p-4">
                  <p className="text-amber-100 text-sm" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                    Se a integração falhar por Cidade/UF (IBGE), você pode corrigir aqui. Sem mexer na API, a correção automática só funciona quando o fornecedor
                    está em <strong>Aguardando Fiscal</strong> (status 2), porque a API só permite <strong>reprovar</strong> e <strong>reabrir</strong> nesse fluxo.
                  </p>

                  {fornecedor.statusFluxo === 2 ? (
                    <>
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-white/90 mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                            Município / Cidade
                          </label>
                          <Combobox
                            value={null}
                            options={municipiosEnderecoOptions}
                            onChange={(val) => {
                              if (!val) return;
                              const selected = municipiosEnderecoOptions.find((o) => o.value === val) ?? null;
                              const label = selected?.label ?? '';
                              setEnderecoCidadeUf((prev) => ({ ...prev, cidade: normalizeCidade(label) }));
                            }}
                            placeholder={loadingMunicipiosEndereco ? 'Carregando...' : 'Selecione o município'}
                            searchPlaceholder="Buscar município..."
                            disabled={loadingMunicipiosEndereco}
                            buttonClassName="px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white hover:bg-white/25 focus-visible:ring-white/30 disabled:opacity-60"
                            className="bg-white/10 backdrop-blur-xl border-white/20"
                            commandClassName="bg-[#ca0404] text-white"
                          />
                          <div className="mt-2 flex gap-3 items-center">
                            <button
                              type="button"
                              disabled={loadingMunicipiosEndereco}
                              onClick={async () => {
                                setLoadingMunicipiosEndereco(true);
                                try {
                                  const cidade = (enderecoCidadeUf.cidade || fornecedor.cidade || '').trim();
                                  const items = await listarErpMunicipios(cidade.length ? cidade : null);
                                  setMunicipiosEnderecoOptions(
                                    (items ?? []).map((x) => ({
                                      value: String(x.codigo),
                                      label: String(x.descricao ?? x.codigo),
                                    })),
                                  );
                                } catch (e) {
                                  toast.error('Não foi possível carregar municípios do ERP.', {
                                    description: e instanceof Error ? e.message : 'Tente novamente.',
                                  });
                                } finally {
                                  setLoadingMunicipiosEndereco(false);
                                }
                              }}
                              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-all duration-200 text-xs"
                              style={{ fontFamily: 'Outfit, sans-serif' }}
                            >
                              Atualizar lista
                            </button>
                            <span className="text-white/60 text-xs" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                              Selecionado: {enderecoCidadeUf.cidade || '-'}
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-white/90 mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                            UF
                          </label>
                          <input
                            value={enderecoCidadeUf.uf}
                            onChange={(e) => setEnderecoCidadeUf((prev) => ({ ...prev, uf: e.target.value.toUpperCase().slice(0, 2) }))}
                            placeholder="SP"
                            maxLength={2}
                            className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300 uppercase"
                            style={{ fontFamily: 'Outfit, sans-serif' }}
                          />
                        </div>
                      </div>

                      <div className="mt-4">
                        <button
                          disabled={isFixingEndereco || !enderecoCidadeUf.cidade.trim() || !enderecoCidadeUf.uf.trim()}
                          onClick={async () => {
                            setIsFixingEndereco(true);
                            try {
                              await reprovarFiscalFornecedor(fornecedor.id, 'Correção de endereço (Cidade/UF) para integração no ERP.');
                              await reabrirCadastroFornecedor(fornecedor.id, {
                                cep: fornecedor.cep,
                                endereco: fornecedor.endereco,
                                cidade: enderecoCidadeUf.cidade.trim(),
                                bairro: fornecedor.bairro,
                                uf: enderecoCidadeUf.uf.trim().toUpperCase(),
                                pais: fornecedor.pais,
                                ddi: fornecedor.ddi,
                                ddd1: fornecedor.ddd1,
                                ddd2: fornecedor.ddd2,
                                email: fornecedor.email,
                                numero: fornecedor.numero,
                                complemento: fornecedor.complemento,
                                obsFornecedor: fornecedor.obsFornecedor,
                              });

                              toast.success('Pré-cadastro reaberto com endereço corrigido.', {
                                description: 'O fornecedor voltou para “Aguardando Fiscal”. Revise e aprove novamente para integrar.',
                              });
                              onStatusChange?.(fornecedor.id, 2);
                              onClose();
                            } catch (e) {
                              toast.error('Não foi possível corrigir o endereço.', {
                                description: e instanceof Error ? e.message : 'Tente novamente.',
                              });
                            } finally {
                              setIsFixingEndereco(false);
                            }
                          }}
                          className="w-full bg-amber-200/20 hover:bg-amber-200/30 text-amber-50 py-3 px-4 rounded-xl border border-amber-200/30 disabled:opacity-50 transition-all duration-300"
                          style={{ fontFamily: 'Outfit, sans-serif' }}
                        >
                          {isFixingEndereco ? 'Corrigindo...' : 'Corrigir Cidade/UF (reprovar e reabrir)'}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-white/70 text-sm mt-4" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                        Este fornecedor não está em status 2. Ainda assim, você pode corrigir Cidade/UF (IBGE) sem alterar o status e tentar integrar novamente.
                      </p>
                      <div className="mt-4">
                        <button
                          disabled={isFixingEndereco || !enderecoCidadeUf.cidade.trim() || !enderecoCidadeUf.uf.trim()}
                          onClick={async () => {
                            setIsFixingEndereco(true);
                            try {
                              await corrigirEnderecoIbgeFornecedor(fornecedor.id, {
                                cidade: enderecoCidadeUf.cidade.trim(),
                                uf: enderecoCidadeUf.uf.trim().toUpperCase(),
                              });
                              toast.success('Cidade/UF atualizados com sucesso.', {
                                description: 'Agora tente integrar novamente.',
                              });
                            } catch (e) {
                              toast.error('Não foi possível corrigir Cidade/UF.', {
                                description: e instanceof Error ? e.message : 'Tente novamente.',
                              });
                            } finally {
                              setIsFixingEndereco(false);
                            }
                          }}
                          className="w-full bg-amber-200/20 hover:bg-amber-200/30 text-amber-50 py-3 px-4 rounded-xl border border-amber-200/30 disabled:opacity-50 transition-all duration-300"
                          style={{ fontFamily: 'Outfit, sans-serif' }}
                        >
                          {isFixingEndereco ? 'Corrigindo...' : 'Corrigir Cidade/UF (sem reabrir)'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
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
                <FileText className="w-6 h-6 text-white" />
                <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Observações
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-5">
                <Field label="Observações do fornecedor" value={fornecedor.obsFornecedor || '-'} />
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-white" />
                  <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Análise Fiscal
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    disabled={!canAprovarFiscal || isApproving || isSaving || isRejecting}
                    onClick={async () => {
                      setIsApproving(true);
                      try {
                        await aprovarFiscalFornecedor(fornecedor.id);
                        toast.success('Fornecedor aprovado pelo fiscal.');
                        setIsAprovadoParaIntegracao(true);
                        onStatusChange?.(fornecedor.id, 4);
                      } catch (e) {
                        toast.error('Não foi possível aprovar.', { description: e instanceof Error ? e.message : 'Tente novamente.' });
                      } finally {
                        setIsApproving(false);
                      }
                    }}
                    className="text-white bg-green-500/30 hover:bg-green-500/50 disabled:opacity-50 transition-all duration-200 px-3 py-2 rounded-lg border border-green-400/30 text-xs flex items-center gap-1"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                    title={!canAprovarFiscal ? 'A API só permite aprovar quando o fornecedor está em “Aguardando Fiscal”.' : undefined}
                  >
                    <CheckCircle className="w-3 h-3" />
                    Aprovar
                  </button>
                  <button
                    disabled={!isAprovadoParaIntegracao || isIntegrating || isSaving || isApproving || isRejecting}
                    onClick={async () => {
                      setIsIntegrating(true);
                      try {
                        // Pré-validação: evita 500 de integração quando município/UF não batem.
                        const cidade = (fornecedor.cidade ?? '').trim();
                        const uf = (fornecedor.uf ?? '').trim().toUpperCase();
                        if (cidade && uf) {
                          const municipios = await listarErpMunicipios(cidade);
                          const options = (municipios ?? []).map((m) => `${m.descricao ?? ''}`.toUpperCase());
                          const hasMatch = options.some((d) => d.includes(cidade.toUpperCase()) && d.endsWith(`- ${uf}`));
                          if (!hasMatch) {
                            // Essa checagem é "best effort" e pode falhar por divergência de formatação (acentos, hífen, abreviações).
                            // Como a integração no backend já valida de verdade, não bloqueamos o usuário aqui.
                            toast.warning('Verificação de Município/UF não confirmou match no ERP.', {
                              description: 'Vou tentar integrar mesmo assim. Se falhar, ajuste Cidade/UF no pré-cadastro e tente novamente.',
                            });
                          }
                        }
                        await integrarFornecedorErp(fornecedor.id);
                        toast.success('Fornecedor integrado ao ERP com sucesso.');
                        onStatusChange?.(fornecedor.id, 5);
                        onClose();
                      } catch (e) {
                        toast.error('Não foi possível integrar no ERP.', { description: e instanceof Error ? e.message : 'Tente novamente.' });
                      } finally {
                        setIsIntegrating(false);
                      }
                    }}
                    className="text-white bg-emerald-500/30 hover:bg-emerald-500/50 disabled:opacity-50 transition-all duration-200 px-3 py-2 rounded-lg border border-emerald-400/30 text-xs flex items-center gap-1"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                    title={!isAprovadoParaIntegracao ? 'Aprove o fornecedor antes de integrar no ERP.' : undefined}
                  >
                    <CheckCircle className="w-3 h-3" />
                    {isIntegrating ? 'Integrando...' : 'Integrar ERP'}
                  </button>
                  {fornecedor.statusFluxo === 2 && (
                    <button
                      disabled={isApproving || isSaving || isRejecting}
                      onClick={async () => {
                        const motivo = window.prompt('Motivo da reprovação:');
                        if (!motivo || !motivo.trim()) return;
                        setIsRejecting(true);
                        try {
                          await reprovarFiscalFornecedor(fornecedor.id, motivo.trim());
                          toast.error('Fornecedor reprovado pelo fiscal.');
                          onClose();
                        } catch (e) {
                          toast.error('Não foi possível reprovar.', { description: e instanceof Error ? e.message : 'Tente novamente.' });
                        } finally {
                          setIsRejecting(false);
                        }
                      }}
                      className="text-white bg-red-500/30 hover:bg-red-500/50 disabled:opacity-50 transition-all duration-200 px-3 py-2 rounded-lg border border-red-400/30 text-xs flex items-center gap-1"
                      style={{ fontFamily: 'Outfit, sans-serif' }}
                    >
                      <XCircle className="w-3 h-3" />
                      Reprovar
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-white/90 mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                    Tipo *
                  </label>
                  <Combobox
                    value={fiscal.tipo || null}
                    options={tiposFornecedorOptions}
                    onChange={(value) => setFiscal({ ...fiscal, tipo: value ?? '' })}
                    placeholder={loadingCombos ? 'Carregando...' : 'Selecione...'}
                    searchPlaceholder="Buscar tipo..."
                    disabled={!combosDisponiveis || loadingCombos}
                    buttonClassName="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                    className="bg-[#ca0404] text-white border-white/30"
                    commandClassName="bg-[#ca0404] text-white"
                  />
                </div>
                <div>
                  <label className="block text-white/90 mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                    Centro de Custo *
                  </label>
                  <Combobox
                    value={fiscal.centroCusto || null}
                    options={centrosCustoOptions}
                    onChange={(value) => setFiscal({ ...fiscal, centroCusto: value ?? '' })}
                    placeholder={loadingCombos ? 'Carregando...' : 'Selecione...'}
                    searchPlaceholder="Buscar centro de custo..."
                    disabled={!combosDisponiveis || loadingCombos}
                    buttonClassName="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                    className="bg-[#ca0404] text-white border-white/30"
                    commandClassName="bg-[#ca0404] text-white"
                  />
                </div>
                <div>
                  <label className="block text-white/90 mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                    Condição Pgto *
                  </label>
                  <input
                    value={fiscal.condicaoPgto}
                    maxLength={3}
                    onChange={(e) => {
                      const raw = e.target.value ?? '';
                      const next = raw.toUpperCase().replace(/\s+/g, '').slice(0, 3);
                      setFiscal({ ...fiscal, condicaoPgto: next });
                    }}
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  />
                  <p className="text-white/60 text-xs mt-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                    Informe o código da condição de pagamento (3 caracteres).
                  </p>
                </div>
                <div>
                  <label className="block text-white/90 mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                    Moeda *
                  </label>
                  <Combobox
                    value={fiscal.moeda || null}
                    options={moedasOptions}
                    onChange={(value) => setFiscal({ ...fiscal, moeda: value ?? '' })}
                    placeholder={loadingCombos ? 'Carregando...' : 'Selecione...'}
                    searchPlaceholder="Buscar moeda..."
                    disabled={!combosDisponiveis || loadingCombos}
                    buttonClassName="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                    className="bg-[#ca0404] text-white border-white/30"
                    commandClassName="bg-[#ca0404] text-white"
                  />
                </div>
                <div>
                  <label className="block text-white/90 mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                    Conta Contábil *
                  </label>
                  <Combobox
                    value={fiscal.ctbContaContabil || null}
                    options={contasContabeisOptions}
                    onChange={(value) => setFiscal({ ...fiscal, ctbContaContabil: value ?? '' })}
                    placeholder={loadingCombos ? 'Carregando...' : 'Selecione...'}
                    searchPlaceholder="Buscar conta contábil..."
                    disabled={!combosDisponiveis || loadingCombos}
                    buttonClassName="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                    className="bg-[#ca0404] text-white border-white/30"
                    commandClassName="bg-[#ca0404] text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-white/90 mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                    Tipo de fornecimento
                  </label>
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
                          checked={Boolean((fiscal as any)[item.key])}
                          onChange={(e) => setFiscal({ ...fiscal, [item.key]: e.target.checked } as any)}
                          className="w-5 h-5 rounded border-2 border-white/30 bg-white/20 checked:bg-white checked:border-white focus:outline-none focus:ring-2 focus:ring-white/40 transition-all duration-300 cursor-pointer"
                        />
                        <span className="text-white/90 group-hover:text-white transition-colors" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                          {item.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-white/90 mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                    Prop00014
                  </label>
                  <input
                    value={fiscal.prop00014}
                    onChange={(e) => setFiscal({ ...fiscal, prop00014: e.target.value })}
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  />
                </div>
                <div>
                  <label className="block text-white/90 mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                    Prop00035
                  </label>
                  <input
                    value={fiscal.prop00035}
                    onChange={(e) => setFiscal({ ...fiscal, prop00035: e.target.value })}
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  />
                </div>
                <div>
                  <label className="block text-white/90 mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                    Prop00123
                  </label>
                  <input
                    value={fiscal.prop00123}
                    onChange={(e) => setFiscal({ ...fiscal, prop00123: e.target.value })}
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-white/90 mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                    Observações do fiscal
                  </label>
                  <textarea
                    value={fiscal.obsFiscal ?? ''}
                    onChange={(e) => setFiscal({ ...fiscal, obsFiscal: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300 resize-none"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  />
                </div>
              </div>

              <div className="mt-6">
                {!canEditarAnaliseFiscal && (
                  <p className="text-white/70 text-sm mb-4" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                    Este fornecedor não está mais em “Aguardando Fiscal”, então a API não permite alterar a análise fiscal. Para integrar, use o botão “Integrar ERP”.
                  </p>
                )}
                <button
                  disabled={!canEditarAnaliseFiscal || isSaving || isApproving || isRejecting}
                  onClick={async () => {
                    if (!fiscal.tipo.trim() || !fiscal.centroCusto.trim() || !fiscal.condicaoPgto.trim() || !fiscal.moeda.trim() || !fiscal.ctbContaContabil.trim()) {
                      toast.error('Preencha os campos obrigatórios antes de salvar.');
                      return;
                    }
                    if (fiscal.condicaoPgto.trim().length > 3) {
                      toast.error('Condição de pagamento inválida.', {
                        description: 'A API aceita somente 3 caracteres (ex.: 001).',
                      });
                      return;
                    }
                    setIsSaving(true);
                    try {
                      await analisarFiscalFornecedor(fornecedor.id, { ...fiscal, lxMetodoPagamento: null });
                      toast.success('Análise fiscal salva com sucesso.');
                    } catch (e) {
                      toast.error('Não foi possível salvar.', { description: e instanceof Error ? e.message : 'Tente novamente.' });
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  className="w-full bg-white text-[#ca0404] py-4 px-6 rounded-xl text-lg font-semibold hover:bg-white/90 disabled:bg-white/20 disabled:text-white/40 disabled:cursor-not-allowed transition-all duration-300"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  {isSaving ? 'Salvando...' : 'Salvar Análise Fiscal'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

