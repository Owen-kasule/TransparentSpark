import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Upload, Download, CheckCircle, XCircle, AlertCircle, Loader, TestTube, Shield, Zap } from 'lucide-react';
import { abstractEmailValidator, BatchValidationResult, ValidationResult } from '../../lib/abstractEmailValidator';
import GlassCard from '../ui/GlassCard';
import toast from 'react-hot-toast';

const EmailValidator: React.FC = () => {
  const [emails, setEmails] = useState<string>('');
  const [isValidating, setIsValidating] = useState(false);
  const [results, setResults] = useState<BatchValidationResult | null>(null);
  const [showResults, setShowResults] = useState(false);

  const handleValidation = async () => {
    if (!emails.trim()) {
      toast.error('Please enter at least one email address');
      return;
    }

    const emailList = emails
      .split(/[\n,;]/)
      .map(email => email.trim())
      .filter(email => email.length > 0);

    if (emailList.length === 0) {
      toast.error('No valid email addresses found');
      return;
    }

    if (emailList.length > 100) {
      toast.error('Maximum 100 emails allowed per batch');
      return;
    }

    setIsValidating(true);
    setResults(null);
    setShowResults(false);

    try {
      console.log('🚀 Starting OFFICIAL Abstract API validation process...');
      console.log('📧 Emails to validate:', emailList);
      
      const validationResults = await abstractEmailValidator.validateEmailsInChunks(emailList);
      
      console.log('✅ Validation completed:', validationResults);
      
      setResults(validationResults);
      setShowResults(true);
      
      toast.success(
        `Validation complete! ${validationResults.validCount} valid, ${validationResults.invalidCount} invalid`
      );
    } catch (error) {
      console.error('❌ Validation error:', error);
      toast.error(error instanceof Error ? error.message : 'Validation failed');
    } finally {
      setIsValidating(false);
    }
  };

  const testSingleEmail = async (email: string) => {
    setEmails(email);
    setIsValidating(true);
    
    try {
      console.log(`🧪 Testing single email with OFFICIAL Abstract API: ${email}`);
      const result = await abstractEmailValidator.validateSingleEmail(email);
      console.log(`🧪 Test result for ${email}:`, result);
      
      if (result.isValid) {
        toast.success(`✅ ${email} is VALID: ${result.reason}`);
      } else {
        toast.error(`❌ ${email} is INVALID: ${result.reason}`);
      }
    } catch (error) {
      console.error('❌ Test error:', error);
      toast.error(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsValidating(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setEmails(content);
    };
    reader.readAsText(file);
  };

  const downloadResults = (type: 'valid' | 'invalid' | 'all') => {
    if (!results) return;

    let data: string[] = [];
    let filename = '';

    switch (type) {
      case 'valid':
        data = results.validEmails;
        filename = 'valid_emails.txt';
        break;
      case 'invalid':
        data = results.invalidEmails.map(r => `${r.email} - ${r.reason}`);
        filename = 'invalid_emails.txt';
        break;
      case 'all':
        data = [
          '=== VALID EMAILS ===',
          ...results.validEmails,
          '',
          '=== INVALID EMAILS ===',
          ...results.invalidEmails.map(r => `${r.email} - ${r.reason}`)
        ];
        filename = 'email_validation_results.txt';
        break;
    }

    const blob = new Blob([data.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (result: ValidationResult) => {
    if (result.isValid) {
      return <CheckCircle className="text-green-400" size={16} />;
    } else if (result.status === 'error') {
      return <AlertCircle className="text-yellow-400" size={16} />;
    } else {
      return <XCircle className="text-red-400" size={16} />;
    }
  };

  const getStatusColor = (result: ValidationResult) => {
    if (result.isValid) return 'text-green-400';
    if (result.status === 'error') return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Mail className="text-azure-400" size={24} />
          <h2 className="text-xl font-bold text-white">Email Validator</h2>
          <div className="flex items-center space-x-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-lg border border-green-500/30">
            <Zap size={16} />
            <span className="text-sm font-medium">ABSTRACT API</span>
          </div>
          <div className="flex items-center space-x-2 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30">
            <Shield size={16} />
            <span className="text-sm font-medium">STRICT MODE</span>
          </div>
        </div>

        {/* Official API Info */}
        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="text-blue-400" size={16} />
            <h4 className="text-blue-400 font-medium">⚡ Official Abstract API Implementation</h4>
          </div>
          <p className="text-white/70 text-sm mb-2">
            <strong>Now using the official Abstract API Email Validation service:</strong>
          </p>
          <ul className="text-white/70 text-sm space-y-1">
            <li>• 🚀 <strong>API Endpoint</strong>: https://emailvalidation.abstractapi.com/v1/</li>
            <li>• ⚡ <strong>Rate Limits</strong>: 1 request/second (free), higher limits on paid plans</li>
            <li>• 🔧 <strong>Features</strong>: Deliverability check, quality scoring, auto-correction</li>
            <li>• 🛡️ <strong>Strict Validation</strong>: Only accepts high-quality deliverable emails</li>
            <li>• 📊 <strong>Quality Score</strong>: 0.01-0.99 confidence rating</li>
          </ul>
        </div>

        <div className="space-y-4">
          {/* Test Email Quick Input */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <TestTube className="text-azure-400" size={16} />
              <h4 className="text-white font-medium">🧪 Quick Test (Official Abstract API)</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => testSingleEmail('owenatug@gmail.com')}
                disabled={isValidating}
                className="px-3 py-1 bg-green-500/20 text-green-400 rounded text-sm hover:bg-green-500/30 transition-colors disabled:opacity-50"
              >
                Test: owenatug@gmail.com ✅
              </button>
              <button
                onClick={() => testSingleEmail('owenkaule.m.2018@gmail.com')}
                disabled={isValidating}
                className="px-3 py-1 bg-green-500/20 text-green-400 rounded text-sm hover:bg-green-500/30 transition-colors disabled:opacity-50"
              >
                Test: owenkaule.m.2018@gmail.com ✅
              </button>
              <button
                onClick={() => testSingleEmail('owenkaule.m.201@gmail.com')}
                disabled={isValidating}
                className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-sm hover:bg-red-500/30 transition-colors disabled:opacity-50"
              >
                Test: owenkaule.m.201@gmail.com ❌
              </button>
              <button
                onClick={() => testSingleEmail('mkasule@byupathway.edu')}
                disabled={isValidating}
                className="px-3 py-1 bg-green-500/20 text-green-400 rounded text-sm hover:bg-green-500/30 transition-colors disabled:opacity-50"
              >
                Test: mkasule@byupathway.edu ✅
              </button>
              <button
                onClick={() => testSingleEmail('invalid@nonexistentdomain12345.com')}
                disabled={isValidating}
                className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-sm hover:bg-red-500/30 transition-colors disabled:opacity-50"
              >
                Test: invalid@nonexistentdomain12345.com ❌
              </button>
              <button
                onClick={() => setEmails('owenatug@gmail.com\nowenkaule.m.2018@gmail.com\nmkasule@byupathway.edu\nowenkaule.m.201@gmail.com\ninvalid@nonexistentdomain12345.com')}
                disabled={isValidating}
                className="px-3 py-1 bg-azure-500/20 text-azure-400 rounded text-sm hover:bg-azure-500/30 transition-colors disabled:opacity-50"
              >
                Load Mixed Test Emails (valid + invalid)
              </button>
            </div>
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Email Addresses (one per line, comma or semicolon separated)
            </label>
            <textarea
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              placeholder="Enter email addresses here...&#10;owenatug@gmail.com&#10;owenkaule.m.2018@gmail.com&#10;mkasule@byupathway.edu"
              rows={8}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-azure-400 transition-colors duration-300 resize-none font-mono text-sm"
              disabled={isValidating}
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-white/60 text-xs">
                {emails.split(/[\n,;]/).filter(e => e.trim()).length} emails entered (max 100)
              </p>
              <label className="cursor-pointer bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded text-xs transition-colors duration-300 flex items-center space-x-1">
                <Upload size={12} />
                <span>Upload File</span>
                <input
                  type="file"
                  accept=".txt,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isValidating}
                />
              </label>
            </div>
          </div>

          {/* Validation Button */}
          <button
            onClick={handleValidation}
            disabled={isValidating || !emails.trim()}
            className="w-full bg-azure-500 hover:bg-azure-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-colors duration-300 font-medium flex items-center justify-center space-x-2"
          >
            {isValidating ? (
              <>
                <Loader className="animate-spin" size={20} />
                <span>Validating with Official Abstract API...</span>
              </>
            ) : (
              <>
                <CheckCircle size={20} />
                <span>Validate Emails (Abstract API + Strict Mode)</span>
              </>
            )}
          </button>

          {/* Validation Info */}
          <div className="bg-azure-500/10 border border-azure-500/20 rounded-lg p-4">
            <h4 className="text-azure-400 font-medium mb-2">🛡️ Official Abstract API Validation Process:</h4>
            <ul className="text-white/70 text-sm space-y-1">
              <li>• 🚀 <strong>Uses Official Abstract API</strong> for comprehensive email validation</li>
              <li>• ✅ <strong>Accepts "DELIVERABLE" emails</strong> with good quality scores (≥0.7)</li>
              <li>• ⚠️ <strong>Cautiously accepts medium quality</strong> deliverable emails (0.5-0.7)</li>
              <li>• ❌ <strong>Rejects "UNDELIVERABLE" emails</strong> (invalid format, no mailbox)</li>
              <li>• ❌ <strong>Rejects disposable email services</strong> (temporary emails)</li>
              <li>• ❌ <strong>Rejects role-based emails</strong> (admin@, info@, support@)</li>
              <li>• ❌ <strong>Rejects low quality emails</strong> (quality score &lt;0.5)</li>
              <li>• 🔧 <strong>Auto-corrects typos</strong> and suggests fixes</li>
              <li>• ❌ <strong>Rejects emails when API fails</strong> (safety first approach)</li>
            </ul>
          </div>
        </div>
      </GlassCard>

      {/* Results */}
      {showResults && results && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Summary */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-bold text-white mb-4">Official Abstract API Validation Results</h3>
            
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{results.validCount}</div>
                <div className="text-white/60 text-sm">Valid Emails</div>
                <div className="text-white/40 text-xs">High quality & deliverable</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{results.invalidCount}</div>
                <div className="text-white/60 text-sm">Invalid Emails</div>
                <div className="text-white/40 text-xs">Rejected by strict criteria</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{results.totalProcessed}</div>
                <div className="text-white/60 text-sm">Total Processed</div>
                <div className="text-white/40 text-xs">By Official Abstract API</div>
              </div>
            </div>

            {/* Download Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => downloadResults('valid')}
                disabled={results.validCount === 0}
                className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-1"
              >
                <Download size={14} />
                <span>Download Valid ({results.validCount})</span>
              </button>
              <button
                onClick={() => downloadResults('invalid')}
                disabled={results.invalidCount === 0}
                className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-1"
              >
                <Download size={14} />
                <span>Download Invalid ({results.invalidCount})</span>
              </button>
              <button
                onClick={() => downloadResults('all')}
                className="bg-azure-500 hover:bg-azure-600 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-1"
              >
                <Download size={14} />
                <span>Download All Results</span>
              </button>
            </div>
          </GlassCard>

          {/* Valid Emails */}
          {results.validEmails.length > 0 && (
            <GlassCard className="p-6">
              <h4 className="text-lg font-bold text-green-400 mb-4">
                ✅ Valid Emails ({results.validEmails.length})
              </h4>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {results.validEmails.map((email, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="text-green-400" size={14} />
                    <span className="text-white font-mono">{email}</span>
                    <span className="text-green-400 text-xs">✅ Verified by Abstract API</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Invalid Emails */}
          {results.invalidEmails.length > 0 && (
            <GlassCard className="p-6">
              <h4 className="text-lg font-bold text-red-400 mb-4">
                ❌ Invalid Emails ({results.invalidEmails.length})
              </h4>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {results.invalidEmails.map((result, index) => (
                  <div key={index} className="flex items-start space-x-2 text-sm">
                    {getStatusIcon(result)}
                    <div className="flex-1">
                      <div className="font-mono text-white">{result.email}</div>
                      <div className={`text-xs ${getStatusColor(result)}`}>
                        {result.reason}
                      </div>
                      {result.details?.autocorrect && (
                        <div className="text-xs text-azure-400">
                          Suggestion: {result.details.autocorrect}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default EmailValidator;