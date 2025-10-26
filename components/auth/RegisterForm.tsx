'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Card } from '../ui/Card';
import { authService } from '../../lib/auth';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  UserCheck, 
  ArrowRight, 
  Users, 
  Sparkles,
  Check,
  X
} from 'lucide-react';

export const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'employee' as 'mentor' | 'employee',
    phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Calculate password strength
    if (name === 'password') {
      let strength = 0;
      if (value.length >= 8) strength++;
      if (/[A-Z]/.test(value)) strength++;
      if (/[a-z]/.test(value)) strength++;
      if (/[0-9]/.test(value)) strength++;
      if (/[^A-Za-z0-9]/.test(value)) strength++;
      setPasswordStrength(strength);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const response = await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone: formData.phone
      });
      
      authService.setToken(response.token);
      authService.setUser(response.user);
      
      // Redirect based on role
      if (response.user.role === 'mentor') {
        router.push('/mentor/dashboard');
      } else {
        router.push('/employee/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: 'employee', label: 'Employee' },
    { value: 'mentor', label: 'Mentor' }
  ];

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-red-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 3) return 'Medium';
    return 'Strong';
  };

  const passwordsMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;
  const passwordsDontMatch = formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50">
        {/* Dot Pattern */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, #9C92AC 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          opacity: 0.1
        }}></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-gradient-to-r from-emerald-600 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Join our workspace
            </h2>
            <p className="text-gray-600 flex items-center justify-center gap-1">
              <Sparkles className="h-4 w-4 text-emerald-500" />
              Create your account to get started
            </p>
          </div>

          {/* Register Card */}
          <Card className="p-8 backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name
                </label>
                <Input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  required
                  placeholder="Enter your full name"
                  className={`pl-4 pr-4 py-3 transition-all duration-200 ${
                    focusedField === 'name' 
                      ? 'ring-2 ring-emerald-500 border-emerald-500 shadow-lg' 
                      : 'hover:border-gray-400'
                  }`}
                />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email address
                </label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  required
                  placeholder="Enter your email"
                  className={`pl-4 pr-4 py-3 transition-all duration-200 ${
                    focusedField === 'email' 
                      ? 'ring-2 ring-emerald-500 border-emerald-500 shadow-lg' 
                      : 'hover:border-gray-400'
                  }`}
                />
              </div>

              {/* Phone Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone (optional)
                </label>
                <Input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Enter your phone number"
                  className={`pl-4 pr-4 py-3 transition-all duration-200 ${
                    focusedField === 'phone' 
                      ? 'ring-2 ring-emerald-500 border-emerald-500 shadow-lg' 
                      : 'hover:border-gray-400'
                  }`}
                />
              </div>

              {/* Role Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  Role
                </label>
                <Select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  options={roleOptions}
                  required
                  className="py-3"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Password
                </label>
                <div className="relative">
                  <Input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    required
                    placeholder="Enter your password"
                    className={`pl-4 pr-12 py-3 transition-all duration-200 ${
                      focusedField === 'password' 
                        ? 'ring-2 ring-emerald-500 border-emerald-500 shadow-lg' 
                        : 'hover:border-gray-400'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                          style={{ width: `${(passwordStrength / 5) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600">{getPasswordStrengthText()}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('confirmPassword')}
                    onBlur={() => setFocusedField(null)}
                    required
                    placeholder="Confirm your password"
                    className={`pl-4 pr-12 py-3 transition-all duration-200 ${
                      focusedField === 'confirmPassword' 
                        ? 'ring-2 ring-emerald-500 border-emerald-500 shadow-lg' 
                        : passwordsMatch 
                        ? 'border-green-500' 
                        : passwordsDontMatch 
                        ? 'border-red-500' 
                        : 'hover:border-gray-400'
                    }`}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    {passwordsMatch && <Check className="h-4 w-4 text-green-500" />}
                    {passwordsDontMatch && <X className="h-4 w-4 text-red-500" />}
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm animate-shake">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                loading={loading}
                className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
                size="lg"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Already have an account?</span>
                </div>
              </div>

              {/* Sign In Link */}
              <button
                type="button"
                onClick={() => router.push('/auth/login')}
                className="w-full text-center py-3 px-4 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
              >
                Sign in instead
              </button>
            </form>
          </Card>

          {/* Footer */}
          <p className="text-center text-xs text-gray-500">
            Collaborative Workspace System • Secure & Reliable
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};