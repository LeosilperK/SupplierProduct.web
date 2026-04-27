import { useNavigate } from 'react-router';
import { Layout } from './Layout';
import { ArrowLeft, Building, Calculator } from 'lucide-react';

export function ColaboradorLogin() {
  const navigate = useNavigate();

  const handleSelectDepartment = (department: 'fiscal' | 'compras') => {
    navigate('/colaborador/login/auth', {
      state: { department },
    });
  };

  return (
    <Layout>
      <div className="w-full max-w-4xl">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 border-2 border-white/20 shadow-2xl animate-[fadeIn_0.6s_ease-out]">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Acesso Colaborador
            </h1>
            <div className="w-24 h-1 bg-white/40 mx-auto rounded-full mb-6"></div>
            <p className="text-white/80 text-lg" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
              Autenticação via Windows 
            </p>
          </div>

          {/* Department Selection */}
          <div className="mb-8">
            <h2 className="text-2xl text-white/95 mb-6 text-center" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 500 }}>
              Selecione seu departamento
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <button
                onClick={() => handleSelectDepartment('fiscal')}
                className="group relative bg-white/10 backdrop-blur-md rounded-2xl p-10 border-2 border-white/20 hover:border-white/40 transition-all duration-500 hover:scale-105 hover:bg-white/15 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative z-10">
                  <div className="flex justify-center mb-6">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-6 group-hover:bg-white/30 transition-all duration-300">
                      <Calculator className="w-14 h-14 text-white" strokeWidth={1.5} />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Fiscal
                  </h3>
                  <p className="text-lg text-white/80 mb-6" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                    Análise e aprovação fiscal de produtos
                  </p>
                  <div className="inline-flex items-center text-white font-medium" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    Selecionar
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleSelectDepartment('compras')}
                className="group relative bg-white/10 backdrop-blur-md rounded-2xl p-10 border-2 border-white/20 hover:border-white/40 transition-all duration-500 hover:scale-105 hover:bg-white/15 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative z-10">
                  <div className="flex justify-center mb-6">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-6 group-hover:bg-white/30 transition-all duration-300">
                      <Building className="w-14 h-14 text-white" strokeWidth={1.5} />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Compras
                  </h3>
                  <p className="text-lg text-white/80 mb-6" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                    Análise e aprovação comercial de produtos
                  </p>
                  <div className="inline-flex items-center text-white font-medium" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    Selecionar
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center text-white/80 hover:text-white text-lg transition-colors duration-300 py-4 mt-6"
            style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Não é colaborador? Voltar
          </button>
        </div>
      </div>
    </Layout>
  );
}
