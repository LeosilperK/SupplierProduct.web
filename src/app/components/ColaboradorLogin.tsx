import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Layout } from './Layout';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

export function ColaboradorLogin() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleLogin = () => {
    // Simulate AD authentication
    console.log('Login attempt:', formData);
    // In a real app, this would authenticate against Active Directory
  };

  const isFormValid = formData.username && formData.password;

  return (
    <Layout>
      <div className="w-full max-w-2xl">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 border-2 border-white/20 shadow-2xl animate-[fadeIn_0.6s_ease-out]">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Acesso Colaborador
            </h1>
            <div className="w-24 h-1 bg-white/40 mx-auto rounded-full mb-6"></div>
            <p className="text-white/80 text-lg" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
              Faça login com sua conta Active Directory
            </p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <div>
              <label className="block text-white/90 text-lg mb-3" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                Usuário (AD)
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="usuario@dominio"
                className="w-full px-5 py-4 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl text-white text-lg placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-300"
                style={{ fontFamily: 'Outfit, sans-serif' }}
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
              <button className="text-white/80 hover:text-white text-base transition-colors duration-300" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                Esqueceu a senha?
              </button>
            </div>

            <button
              onClick={() => navigate('/')}
              className="w-full flex items-center justify-center text-white/80 hover:text-white text-lg transition-colors duration-300 py-4 mt-4"
              style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Não é colaborador? Voltar
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
