import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Lock, User, Sparkles, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { register, isAuthenticated } from '@/lib/auth.js';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    number: false
  });

  useEffect(() => {
    // Se já estiver logado, redirecionar para dashboard
    if (isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  // Verificar requisitos da senha
  useEffect(() => {
    const pass = formData.password;
    setPasswordRequirements({
      length: pass.length >= 6,
      lowercase: /[a-z]/.test(pass),
      uppercase: /[A-Z]/.test(pass),
      number: /\d/.test(pass)
    });
  }, [formData.password]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(''); // Limpar erro ao digitar
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Nome é obrigatório');
      return false;
    }
    if (formData.name.trim().length < 2) {
      setError('Nome deve ter pelo menos 2 caracteres');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email é obrigatório');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Email inválido');
      return false;
    }
    if (!formData.password) {
      setError('Senha é obrigatória');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Senhas não coincidem');
      return false;
    }
    const { length, lowercase, uppercase, number } = passwordRequirements;
    if (!length || !lowercase || !uppercase || !number) {
      setError('A senha deve atender todos os requisitos');
      return false;
    }
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await register(formData.name.trim(), formData.email.trim(), formData.password);
      navigate('/dashboard');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  const allRequirementsMet = Object.values(passwordRequirements).every(req => req);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Criar Conta AppMari ✨
          </CardTitle>
          <p className="text-gray-600 text-sm mt-2">
            Registre-se para começar a gerenciar suas redes sociais
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-center">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                👤 Nome Completo
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Seu nome completo"
                  className="pl-10 bg-white border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                📧 Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="seu@email.com"
                  className="pl-10 bg-white border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                🔒 Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Crie uma senha forte"
                  className="pl-10 pr-10 bg-white border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Requisitos da senha */}
              {formData.password && (
                <div className="space-y-1 text-xs">
                  <div className={`flex items-center space-x-2 ${passwordRequirements.length ? 'text-green-600' : 'text-gray-500'}`}>
                    <span>{passwordRequirements.length ? '✅' : '❌'}</span>
                    <span>Pelo menos 6 caracteres</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${passwordRequirements.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
                    <span>{passwordRequirements.lowercase ? '✅' : '❌'}</span>
                    <span>Uma letra minúscula</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${passwordRequirements.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
                    <span>{passwordRequirements.uppercase ? '✅' : '❌'}</span>
                    <span>Uma letra maiúscula</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${passwordRequirements.number ? 'text-green-600' : 'text-gray-500'}`}>
                    <span>{passwordRequirements.number ? '✅' : '❌'}</span>
                    <span>Um número</span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                🔒 Confirmar Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Digite a senha novamente"
                  className="pl-10 pr-10 bg-white border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !allRequirementsMet || formData.password !== formData.confirmPassword}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg rounded-xl py-3 text-white font-medium transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Criando conta...
                </>
              ) : (
                '🚀 Criar Conta'
              )}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-gray-600 text-sm">
              Já tem uma conta?{' '}
              <button
                onClick={handleLoginRedirect}
                className="text-blue-600 hover:text-blue-700 font-medium underline-offset-4 hover:underline"
              >
                Fazer Login
              </button>
            </p>
          </div>

          <div className="text-center pt-4 border-t border-gray-200">
            <button
              onClick={() => navigate('/login')}
              className="flex items-center justify-center space-x-2 text-gray-500 hover:text-gray-700 text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao Login</span>
            </button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              🔒 Seus dados serão salvos localmente e de forma segura
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
