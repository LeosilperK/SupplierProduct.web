import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Layout } from './Layout';
import { ArrowLeft, Eye, EyeOff, Calculator, Building, Shield } from 'lucide-react';
import { toast } from 'sonner';

export function ColaboradorAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  const department = location.state?.department as 'fiscal' | 'compras' | undefined;

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  if (!department) {
    navigate('/colaborador/login');
    return null;
  }

  const handleLogin = () => {
    if (!formData.username || !formData.password) {
      toast.error('Campos obrigatórios', {
        description: 'Preencha usuário e senha.',
        duration: 2000,
      });
      return;
    }

    toast.success('Autenticação Windows realizada!', {
      description: `Bem-vindo ao departamento ${department === 'fiscal' ? 'Fiscal' : 'Compras'}`,
      duration: 2000,
    });

    setTimeout(() => {
      if (department === 'fiscal') {
        navigate('/colaborador/fiscal/dashboard', {
          state: {
            userName: formData.username,
            department: 'Fiscal',
          },
        });
      } else {
        navigate('/colaborador/compras/dashboard', {
          state: {
            userName: formData.username,
            department: 'Compras',
          },
        });
      }
    }, 2000);
  };

  const isFormValid = Boolean(formData.username && formData.password);

  const departmentInfo = {
    fiscal: {
      title: 'Fiscal',
      icon: Calculator,
      description: 'Análise e aprovação fiscal de produtos',
    },
    compras: {
      title: 'Compras',
      icon: Building,
      description: 'Análise e aprovação comercial de produtos',
    },
  } as const;

  const info = departmentInfo[department];
  const Icon = info.icon;

  return (
    <Layout>
      <div className="w-full max-w-2xl">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 border-2 border-white/20 shadow-2xl animate-[fadeIn_0.6s_ease-out]">
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 border-2 border-white/30">
              <Icon className="w-6 h-6 text-white" strokeWidth={1.5} />
              <span className="text-white font-semibold text-lg" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {info.title}
              </span>
            </div>
          </div>

          <div className="text-center mb-10">
            <h1 className="text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Autenticação Windows
            </h1>
            <div className="w-24 h-1 bg-white/40 mx-auto rounded-full mb-6"></div>
            <p className="text-white/80 text-lg" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
              {info.description}
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 mb-8 border border-white/20 flex items-start gap-3">
            <Shield className="w-5 h-5 text-white/80 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-white/90 text-sm" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                Use suas credenciais do Windows
              </p>
              <p className="text-white/60 text-xs mt-1" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                Mesmo usuário e senha da rede corporativa
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-white/90 text-lg mb-3" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                Usuário (Windows)
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="usuario@dominio"
                className="w-full px-5 py-4 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl text-white text-lg placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                style={{ fontFamily: 'Outfit, sans-serif' }}
                onKeyPress={(e) => e.key === 'Enter' && isFormValid && handleLogin()}
              />
            </div>

            <div>
              <label className="block text-white/90 text-lg mb-3" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-5 py-4 pr-14 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl text-white text-lg placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                  onKeyPress={(e) => e.key === 'Enter' && isFormValid && handleLogin()}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={!isFormValid}
              className="w-full bg-white text-[#ca0404] py-5 px-8 rounded-xl text-xl font-semibold hover:bg-white/90 disabled:bg-white/20 disabled:text-white/40 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] mt-8"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Entrar
            </button>

            <div className="text-center mt-6">
              <button
                className="text-white/80 hover:text-white text-base transition-colors duration-300"
                style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}
              >
                Problemas com o acesso?
              </button>
            </div>

            <button
              onClick={() => navigate('/colaborador/login')}
              className="w-full flex items-center justify-center text-white/80 hover:text-white text-lg transition-colors duration-300 py-4 mt-4"
              style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar à seleção de departamento
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

