import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Layout } from './Layout';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { ApiError, getFornecedorByCgcCpf, sanitizeDocument } from '../lib/supplier-api';

export function FornecedorCNPJ() {
  const navigate = useNavigate();
  const [cnpj, setCnpj] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const formatDocument = (value: string) => {
    const numbers = value.replace(/\D/g, '');

    // CPF
    if (numbers.length <= 11) {
      return numbers
        .replace(/^(\d{3})(\d)/, '$1.$2')
        .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1-$2');
    }

    // CNPJ (até 14)
    if (numbers.length <= 14) {
      return numbers
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }
    return value;
  };

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCnpj(formatDocument(e.target.value));
  };

  const handleContinue = async () => {
    const numbers = sanitizeDocument(cnpj);
    setIsLoading(true);

    try {
      const fornecedorData = await getFornecedorByCgcCpf(numbers);

      const fornecedorDocLen = sanitizeDocument(fornecedorData?.cgcCpf ?? '').length;
      const isCpf = numbers.length === 11 || fornecedorDocLen === 11;

      // Fluxo solicitado: quando for CPF (cadastro fiscal), direciona primeiro para criação de acesso (login/senha).
      if (isCpf) {
        navigate('/fornecedor/acesso', {
          state: {
            fornecedorData,
            cgcCpf: numbers,
          },
        });
        return;
      }

      // Caso seja CNPJ, segue para autenticação (login/senha).
      navigate('/fornecedor/login', {
        state: {
          fornecedorData,
          cgcCpf: numbers,
        },
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        // CPF: o fornecedor só deve seguir para primeiro acesso após integração/aprovação no ERP.
        if (numbers.length === 11) {
          toast.info('Aguardando aprovação', {
            description: 'Seu perfil ainda não foi integrado/aprovado pela equipe fiscal. Tente novamente mais tarde.',
          });
          return;
        }

        navigate('/fornecedor/cadastro', { state: { cnpj: numbers } });
        return;
      }

      toast.error('Não foi possível consultar o CNPJ.', {
        description: error instanceof Error ? error.message : 'Tente novamente em instantes.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const docLen = cnpj.replace(/\D/g, '').length;
  const isDocValid = docLen === 11 || docLen === 14;

  return (
    <Layout>
      <div className="w-full max-w-2xl">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 border-2 border-white/20 shadow-2xl animate-[fadeIn_0.6s_ease-out]">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Acesso Fornecedor
            </h1>
            <div className="w-24 h-1 bg-white/40 mx-auto rounded-full"></div>
          </div>

          {/* Form */}
          <div className="space-y-8">
            <div>
              <label className="block text-white/90 text-xl mb-4" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                Digite seu CPF ou CNPJ para continuar
              </label>
              <input
                type="text"
                value={cnpj}
                onChange={handleCNPJChange}
                placeholder="000.000.000-00 ou 00.000.000/0000-00"
                maxLength={18} // CPF (14) ou CNPJ (18)
                disabled={isLoading}
                className="w-full px-6 py-5 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl text-white text-2xl placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              />
            </div>

            <button
              onClick={handleContinue}
              disabled={!isDocValid || isLoading}
              className="w-full bg-white text-[#ca0404] py-5 px-8 rounded-xl text-xl font-semibold hover:bg-white/90 disabled:bg-white/20 disabled:text-white/40 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              {isLoading ? 'Consultando...' : 'Continuar'}
            </button>

            <button
              onClick={() => navigate('/')}
              className="w-full flex items-center justify-center text-white/80 hover:text-white text-lg transition-colors duration-300 py-4"
              style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Não é fornecedor? Voltar
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
