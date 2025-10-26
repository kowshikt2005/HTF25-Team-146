'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../lib/auth';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { 
  Users, 
  Sparkles, 
  ArrowRight, 
  CheckCircle, 
  Zap, 
  Shield, 
  Globe,
  Target,
  Clock,
  BarChart3
} from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        const user = authService.getUser();
        setIsAuthenticated(true);
        // Small delay to show the landing page briefly
        setTimeout(() => {
          if (user?.role === 'mentor') {
            router.push('/mentor/dashboard');
          } else {
            router.push('/employee/dashboard');
          }
        }, 1500);
      } else {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg animate-pulse">
            <Users className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Collaborative Workspace System
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            {isAuthenticated ? 'Redirecting to your dashboard...' : 'Loading...'}
          </p>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: <Target className="h-6 w-6" />,
      title: "Project Management",
      description: "Create, organize, and track projects with intuitive tools"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Team Collaboration",
      description: "Seamless collaboration between mentors and employees"
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Real-time Updates",
      description: "Live task updates and instant notifications"
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Progress Tracking",
      description: "Visual dashboards and analytics for better insights"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with role-based access"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Lightning Fast",
      description: "Optimized performance for smooth user experience"
    }
  ];

  const benefits = [
    "Streamlined project workflows",
    "Enhanced team productivity",
    "Real-time collaboration tools",
    "Comprehensive progress tracking",
    "Secure data management",
    "Mobile-responsive design"
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Dot Pattern */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, #9C92AC 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          opacity: 0.1
        }}></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="px-4 py-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">CollabSpace</span>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => router.push('/auth/login')}
                className="hidden sm:flex"
              >
                Sign In
              </Button>
              <Button
                onClick={() => router.push('/auth/register')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Get Started
              </Button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Sparkles className="h-5 w-5 text-purple-500" />
              <span className="text-purple-600 font-medium">Modern Workspace Solution</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Collaborate.{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Create.
              </span>{' '}
              Succeed.
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Transform your team's productivity with our comprehensive project management platform. 
              Built for mentors and employees to collaborate seamlessly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => router.push('/auth/register')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Start Free Trial
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push('/auth/login')}
                className="px-8 py-4 text-lg border-2 hover:bg-gray-50"
              >
                Sign In
              </Button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="px-4 py-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Everything you need to succeed
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Powerful features designed to streamline your workflow and boost team productivity
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="p-6 hover:shadow-lg transition-all duration-200 backdrop-blur-sm bg-white/80 border-white/20">
                  <div className="h-12 w-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="px-4 py-20">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 md:p-12 backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    Why teams choose CollabSpace
                  </h2>
                  <div className="space-y-4">
                    {benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
                    <Globe className="h-12 w-12 mb-4 opacity-80" />
                    <h3 className="text-xl font-semibold mb-2">
                      Join thousands of teams
                    </h3>
                    <p className="opacity-90">
                      Already using CollabSpace to manage their projects and boost productivity.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Ready to transform your workflow?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of teams already using CollabSpace to achieve their goals.
            </p>
            <Button
              size="lg"
              onClick={() => router.push('/auth/register')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Get Started Today
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-4 py-8 border-t border-gray-200 bg-white/50 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-gray-600">
              © 2024 CollabSpace. Built for modern teams.
            </p>
          </div>
        </footer>
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
      `}</style>
    </div>
  );
}
