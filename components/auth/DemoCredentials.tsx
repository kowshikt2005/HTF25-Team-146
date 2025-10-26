'use client';

import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { User, Crown, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface DemoCredentialsProps {
  onFillCredentials: (email: string, password: string) => void;
}

export const DemoCredentials: React.FC<DemoCredentialsProps> = ({ onFillCredentials }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const demoAccounts = [
    {
      role: 'Mentor',
      email: 'mentor@demo.com',
      password: 'mentor123',
      icon: <Crown className="h-4 w-4" />,
      color: 'from-purple-500 to-indigo-500'
    },
    {
      role: 'Employee',
      email: 'alice@demo.com',
      password: 'employee123',
      icon: <User className="h-4 w-4" />,
      color: 'from-blue-500 to-cyan-500'
    }
  ];

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
      <div className="text-center mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-1">Demo Accounts</h3>
        <p className="text-xs text-gray-500">Try the app with these test credentials</p>
      </div>
      
      <div className="space-y-3">
        {demoAccounts.map((account, index) => (
          <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`h-6 w-6 bg-gradient-to-r ${account.color} rounded-full flex items-center justify-center text-white`}>
                  {account.icon}
                </div>
                <span className="text-sm font-medium text-gray-700">{account.role}</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onFillCredentials(account.email, account.password)}
                className="text-xs px-2 py-1 h-6"
              >
                Use Account
              </Button>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Email:</span>
                <div className="flex items-center gap-1">
                  <code className="bg-gray-100 px-1 rounded text-gray-700">{account.email}</code>
                  <button
                    onClick={() => copyToClipboard(account.email, `${account.role}-email`)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {copiedField === `${account.role}-email` ? 
                      <Check className="h-3 w-3 text-green-500" /> : 
                      <Copy className="h-3 w-3" />
                    }
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Password:</span>
                <div className="flex items-center gap-1">
                  <code className="bg-gray-100 px-1 rounded text-gray-700">{account.password}</code>
                  <button
                    onClick={() => copyToClipboard(account.password, `${account.role}-password`)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {copiedField === `${account.role}-password` ? 
                      <Check className="h-3 w-3 text-green-500" /> : 
                      <Copy className="h-3 w-3" />
                    }
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};