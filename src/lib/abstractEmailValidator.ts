interface AbstractAPIConfig {
  apiKey: string;
  timeout: number;
  maxBatchSize: number;
  apiUrl: string;
}

interface AbstractEmailData {
  email: string;
  autocorrect: string;
  deliverability: 'DELIVERABLE' | 'UNDELIVERABLE' | 'UNKNOWN';
  quality_score: number;
  is_valid_format: {
    value: boolean;
    text: string;
  };
  is_free_email: {
    value: boolean;
    text: string;
  };
  is_disposable_email: {
    value: boolean;
    text: string;
  };
  is_role_email: {
    value: boolean;
    text: string;
  };
  is_catchall_email: {
    value: boolean;
    text: string;
  };
  is_mx_found: {
    value: boolean;
    text: string;
  };
  is_smtp_valid: {
    value: boolean;
    text: string;
  };
}

interface ValidationResult {
  email: string;
  isValid: boolean;
  status: string;
  reason: string;
  details: AbstractEmailData | null;
}

interface BatchValidationResult {
  validEmails: string[];
  invalidEmails: ValidationResult[];
  totalProcessed: number;
  validCount: number;
  invalidCount: number;
}

class AbstractEmailValidator {
  private config: AbstractAPIConfig;
  private requestCount: number = 0;
  private lastRequestTime: number = 0;
  private rateLimitResetTime: number = 0;

  constructor() {
    // Get API key from environment variable
    const apiKey = import.meta.env.VITE_ABSTRACT_API_KEY || '';
    
    this.config = {
      apiKey: apiKey,
      timeout: 30000, // 30 seconds timeout
      maxBatchSize: 100, // Process in smaller batches for better performance
      apiUrl: 'https://emailvalidation.abstractapi.com/v1/'
    };

    // Log configuration status
    if (this.isApiKeyConfigured()) {
      console.log('✅ Abstract API Email Validation configured with key:', `${this.config.apiKey.substring(0, 8)}...`);
      console.log('🌐 Using Abstract API endpoint:', this.config.apiUrl);
    } else {
      console.warn('⚠️ Abstract API key not configured - falling back to basic validation');
    }
  }

  private isApiKeyConfigured(): boolean {
    return typeof this.config.apiKey === 'string' && this.config.apiKey.trim() !== '';
  }

  private isValidEmailFormat(email: string): boolean {
    // RFC 5322 compliant email validation
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (!emailRegex.test(email)) {
      return false;
    }

    const [localPart, domain] = email.split('@');
    
    // Check local part length (max 64 characters)
    if (localPart.length > 64) {
      return false;
    }
    
    // Check domain length (max 253 characters)
    if (domain.length > 253) {
      return false;
    }
    
    // Check for consecutive dots
    if (email.includes('..')) {
      return false;
    }
    
    // Check for leading/trailing dots in local part
    if (localPart.startsWith('.') || localPart.endsWith('.')) {
      return false;
    }
    
    return true;
  }

  private async checkRateLimit(): Promise<void> {
    const now = Date.now();
    
    // Abstract API free plan: 1 request per second
    // Paid plans have higher limits
    if (now - this.lastRequestTime < 1100) { // Wait 1.1 seconds between requests
      const waitTime = 1100 - (now - this.lastRequestTime);
      console.log(`⏳ Rate limiting: waiting ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();

    if (this.rateLimitResetTime > now) {
      const waitTime = this.rateLimitResetTime - now;
      console.log(`🚫 Rate limit penalty active. Waiting ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.rateLimitResetTime = 0;
    }
  }

  private getDetailedErrorMessage(emailData: AbstractEmailData): string {
    const deliverability = emailData.deliverability;
    const autocorrect = emailData.autocorrect;

    // Create detailed, user-friendly error messages
    switch (deliverability) {
      case 'UNDELIVERABLE':
        if (!emailData.is_valid_format.value) {
          return autocorrect 
            ? `Invalid email format. Did you mean "${autocorrect}"?`
            : 'Invalid email format. Please check for typos.';
        }
        
        if (emailData.is_disposable_email.value) {
          return 'This is a disposable/temporary email address. Please use a permanent email.';
        }
        
        if (emailData.is_role_email.value) {
          return 'Role-based emails (like admin@, info@) are not allowed. Please use a personal email.';
        }
        
        if (!emailData.is_mx_found.value) {
          return 'The domain doesn\'t have email servers configured.';
        }
        
        if (!emailData.is_smtp_valid.value) {
          return 'The email address doesn\'t exist on the server.';
        }
        
        return autocorrect 
          ? `Email is not deliverable. Did you mean "${autocorrect}"?`
          : 'Email address is not deliverable.';

      case 'UNKNOWN':
        if (!emailData.is_mx_found.value) {
          return 'Cannot verify email - domain has no mail servers configured.';
        }
        
        return 'Email verification inconclusive. The email server may be temporarily unavailable.';

      default:
        return 'Email validation returned unexpected result.';
    }
  }

  private validateEmailCriteria(emailData: AbstractEmailData): ValidationResult {
    const email = emailData.email;
    let isValid = false;
    let reason = '';

    console.log('🔍 Abstract API Response for', email, ':', {
      deliverability: emailData.deliverability,
      quality_score: emailData.quality_score,
      is_valid_format: emailData.is_valid_format.value,
      is_free_email: emailData.is_free_email.value,
      is_disposable_email: emailData.is_disposable_email.value,
      is_role_email: emailData.is_role_email.value,
      is_mx_found: emailData.is_mx_found.value,
      is_smtp_valid: emailData.is_smtp_valid.value,
      autocorrect: emailData.autocorrect
    });

    // STRICT VALIDATION: Only accept emails that are confirmed as deliverable
    switch (emailData.deliverability) {
      case 'DELIVERABLE':
        // Additional checks for quality
        if (emailData.quality_score >= 0.7) {
          isValid = true;
          reason = '✅ Email is confirmed deliverable with good quality score';
        } else if (emailData.quality_score >= 0.5) {
          // Accept medium quality emails but with warning
          isValid = true;
          reason = '✅ Email is deliverable but has medium quality score';
        } else {
          // Reject low quality emails even if deliverable
          isValid = false;
          reason = '❌ Email has low quality score and may be risky';
        }
        break;
        
      case 'UNDELIVERABLE':
        isValid = false;
        reason = `❌ ${this.getDetailedErrorMessage(emailData)}`;
        break;
        
      case 'UNKNOWN':
        // Be strict with unknown status - only accept if format is valid and has MX record
        if (emailData.is_valid_format.value && emailData.is_mx_found.value && !emailData.is_disposable_email.value) {
          isValid = true;
          reason = '✅ Email format is valid and domain has mail servers (verification inconclusive)';
        } else {
          isValid = false;
          reason = `❌ ${this.getDetailedErrorMessage(emailData)}`;
        }
        break;
        
      default:
        isValid = false;
        reason = `❌ ${this.getDetailedErrorMessage(emailData)}`;
        break;
    }

    return {
      email,
      isValid,
      status: emailData.deliverability.toLowerCase(),
      reason,
      details: emailData
    };
  }

  private getApiErrorMessage(error: any): string {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Handle common API errors with user-friendly messages
    if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
      return '🔑 Abstract API key is invalid. Please contact the administrator to update the API key.';
    }
    
    if (errorMessage.includes('422') || errorMessage.includes('Quota reached')) {
      return '💳 Abstract API quota reached. Please contact the administrator to upgrade the plan or wait for quota reset.';
    }
    
    if (errorMessage.includes('429') || errorMessage.includes('Too many requests')) {
      return '⏱️ Too many requests sent to Abstract API. Please wait a moment before trying again.';
    }
    
    if (errorMessage.includes('timeout') || errorMessage.includes('Request timeout')) {
      return '⏰ The validation request took too long. Please try again.';
    }
    
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return '🌐 Network connection error. Please check your internet connection and try again.';
    }
    
    if (errorMessage.includes('400') || errorMessage.includes('Bad request')) {
      return '📝 Invalid request format. Please check the email address format.';
    }
    
    if (errorMessage.includes('500') || errorMessage.includes('503')) {
      return '🔧 Abstract API servers are experiencing issues. Please try again in a few minutes.';
    }
    
    // Generic error with the original message
    return `❌ Validation service error: ${errorMessage}`;
  }

  /**
   * Single Email Validator using Abstract API
   * Following official documentation: https://emailvalidation.abstractapi.com/v1/
   */
  private async makeSingleEmailRequest(email: string): Promise<AbstractEmailData> {
    // Check if API key is configured
    if (!this.isApiKeyConfigured()) {
      throw new Error('Abstract API key is not configured. Please set VITE_ABSTRACT_API_KEY environment variable.');
    }

    await this.checkRateLimit();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      this.requestCount++;
      
      // Build URL parameters as per Abstract API documentation
      const params = new URLSearchParams({
        api_key: this.config.apiKey,
        email: email,
        auto_correct: 'true' // Enable auto-correction for typos
      });

      const apiUrl = `${this.config.apiUrl}?${params.toString()}`;

      console.log('🌐 Making Abstract API Email Validation request:', {
        url: apiUrl.replace(this.config.apiKey, 'API_KEY_HIDDEN'),
        email: email,
        auto_correct: true
      });

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Abstract-Portfolio-Validator/1.0'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log('📡 Abstract API response status:', response.status);

      // Handle rate limiting (429 status)
      if (response.status === 429) {
        this.rateLimitResetTime = Date.now() + 60000; // 1 minute penalty
        throw new Error('Rate limit exceeded - too many requests');
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Abstract API error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Abstract API response data:', data);

      // Check for API error in response
      if (data.error) {
        console.error('❌ Abstract API returned error:', data.error);
        throw new Error(data.error);
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('❌ Abstract API request failed:', error);
      throw error;
    }
  }

  public async validateSingleEmail(email: string): Promise<ValidationResult> {
    console.log(`🚀 Starting SINGLE EMAIL validation for: ${email}`);
    
    // Check basic format first
    if (!this.isValidEmailFormat(email)) {
      return {
        email,
        isValid: false,
        status: 'invalid',
        reason: '❌ Invalid email format. Please check for typos and ensure it follows the format: name@domain.com',
        details: null
      };
    }

    // If API key is not configured, use stricter validation rules
    if (!this.isApiKeyConfigured()) {
      console.warn('⚠️ Abstract API key not configured, using strict format validation');
      
      // Additional checks for common invalid patterns
      const emailParts = email.split('@');
      const domain = emailParts[1]?.toLowerCase();
      
      // Check for obviously invalid domains
      if (domain && (
        domain.includes('nonexistent') ||
        domain.includes('invalid') ||
        domain.includes('test') ||
        domain.includes('example') ||
        domain.includes('fake') ||
        domain.includes('dummy') ||
        (domain.length > 253) ||
        (domain.length < 3)
      )) {
        return {
          email,
          isValid: false,
          status: 'invalid_domain',
          reason: '❌ Invalid or suspicious domain detected',
          details: null
        };
      }
      
      // Check for common disposable email providers
      const disposableDomains = [
        'tempmail.org', '10minutemail.com', 'guerrillamail.com', 'mailinator.com',
        'yopmail.com', 'throwaway.email', 'temp-mail.org', 'sharklasers.com',
        'getairmail.com', 'mailnesia.com', 'maildrop.cc', 'mailmetrash.com',
        'trashmail.com', 'mailnull.com', 'spam4.me', 'bccto.me', 'chacuo.net',
        'dispostable.com', 'mailnesia.com', 'mailinator.com', 'tempr.email',
        'fakeinbox.com', 'mailcatch.com', 'mailinator2.com', 'mailinator.net',
        'mailinator.org', 'mailinator.info', 'mailinator.biz', 'mailinator.co',
        'mailinator.com', 'mailinator.net', 'mailinator.org', 'mailinator.info'
      ];
      
      if (domain && disposableDomains.includes(domain)) {
        return {
          email,
          isValid: false,
          status: 'disposable',
          reason: '❌ Disposable email addresses are not allowed',
          details: null
        };
      }
      
      // Check for role-based emails
      const localPart = email.split('@')[0]?.toLowerCase();
      const roleEmails = ['admin', 'info', 'support', 'help', 'contact', 'sales', 
                         'marketing', 'noreply', 'no-reply', 'donotreply', 'do-not-reply',
                         'webmaster', 'postmaster', 'hostmaster', 'abuse', 'security'];
      
      if (localPart && roleEmails.includes(localPart)) {
        return {
          email,
          isValid: false,
          status: 'role_email',
          reason: '❌ Role-based emails (admin@, info@, etc.) are not allowed',
          details: null
        };
      }
      
      return {
        email,
        isValid: true,
        status: 'format_valid',
        reason: '✅ Email format is valid (basic validation only)',
        details: null
      };
    }

    try {
      console.log(`🌐 Using Abstract API OFFICIAL EMAIL VALIDATION for: ${email}`);
      const emailData = await this.makeSingleEmailRequest(email);
      
      // Validate using our strict criteria
      const result = this.validateEmailCriteria(emailData);
      
      console.log(`✅ Single email validation result for ${email}:`, result);
      return result;
      
    } catch (error) {
      console.error('❌ Abstract API validation error:', error);
      
      // Return user-friendly error message
      return {
        email,
        isValid: false,
        status: 'error',
        reason: `🔧 ${this.getApiErrorMessage(error)}`,
        details: null
      };
    }
  }

  public async validateBatch(emails: string[]): Promise<BatchValidationResult> {
    if (emails.length === 0) {
      return {
        validEmails: [],
        invalidEmails: [],
        totalProcessed: 0,
        validCount: 0,
        invalidCount: 0
      };
    }

    if (emails.length > this.config.maxBatchSize) {
      throw new Error(`📊 Batch size cannot exceed ${this.config.maxBatchSize} emails. Please split your list into smaller batches.`);
    }

    const uniqueEmails = [...new Set(emails.map(email => email.trim().toLowerCase()))];
    
    // If API key is not configured, use stricter validation rules
    if (!this.isApiKeyConfigured()) {
      console.warn('⚠️ Abstract API key not configured, using strict format validation');
      
      const validEmails: string[] = [];
      const invalidEmails: ValidationResult[] = [];

      for (const email of uniqueEmails) {
        const result = await this.validateSingleEmail(email);
        if (result.isValid) {
          validEmails.push(email);
        } else {
          invalidEmails.push(result);
        }
      }

      return {
        validEmails,
        invalidEmails,
        totalProcessed: uniqueEmails.length,
        validCount: validEmails.length,
        invalidCount: invalidEmails.length
      };
    }
    
    // Abstract API doesn't have a batch endpoint, so we process emails one by one
    console.log(`🔄 Processing ${uniqueEmails.length} emails individually with Abstract API`);
    
    const validEmails: string[] = [];
    const invalidEmails: ValidationResult[] = [];

    for (const email of uniqueEmails) {
      try {
        const result = await this.validateSingleEmail(email);
        
        if (result.isValid) {
          validEmails.push(result.email);
        } else {
          invalidEmails.push(result);
        }
        
        // Add delay between requests to respect rate limits
        if (uniqueEmails.indexOf(email) < uniqueEmails.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1200)); // 1.2 second delay
        }
      } catch (error) {
        invalidEmails.push({
          email,
          isValid: false,
          status: 'error',
          reason: `🔧 ${this.getApiErrorMessage(error)}`,
          details: null
        });
      }
    }

    return {
      validEmails,
      invalidEmails,
      totalProcessed: uniqueEmails.length,
      validCount: validEmails.length,
      invalidCount: invalidEmails.length
    };
  }

  public async validateEmailsInChunks(emails: string[]): Promise<BatchValidationResult> {
    if (emails.length <= this.config.maxBatchSize) {
      return this.validateBatch(emails);
    }

    const chunks: string[][] = [];
    for (let i = 0; i < emails.length; i += this.config.maxBatchSize) {
      chunks.push(emails.slice(i, i + this.config.maxBatchSize));
    }

    const allValidEmails: string[] = [];
    const allInvalidEmails: ValidationResult[] = [];
    let totalProcessed = 0;

    for (let i = 0; i < chunks.length; i++) {
      console.log(`📦 Processing chunk ${i + 1} of ${chunks.length} (${chunks[i].length} emails)...`);
      
      try {
        const result = await this.validateBatch(chunks[i]);
        
        allValidEmails.push(...result.validEmails);
        allInvalidEmails.push(...result.invalidEmails);
        totalProcessed += result.totalProcessed;

        // Add delay between chunks to respect rate limits
        if (i < chunks.length - 1) {
          console.log('⏳ Waiting 5 seconds before processing next chunk...');
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      } catch (error) {
        console.error(`❌ Error processing chunk ${i + 1}:`, error);
        
        // If chunk fails, reject all emails in that chunk with user-friendly message
        for (const email of chunks[i]) {
          allInvalidEmails.push({
            email,
            isValid: false,
            status: 'error',
            reason: `🔧 Chunk processing failed: ${this.getApiErrorMessage(error)}`,
            details: null
          });
        }
        totalProcessed += chunks[i].length;
      }
    }

    return {
      validEmails: allValidEmails,
      invalidEmails: allInvalidEmails,
      totalProcessed,
      validCount: allValidEmails.length,
      invalidCount: allInvalidEmails.length
    };
  }

  public getApiUsageInfo(): { 
    requestCount: number; 
    rateLimitResetTime: number; 
    isConfigured: boolean;
    apiEndpoint: string;
  } {
    return {
      requestCount: this.requestCount,
      rateLimitResetTime: this.rateLimitResetTime,
      isConfigured: this.isApiKeyConfigured(),
      apiEndpoint: this.config.apiUrl
    };
  }

  public getConfigurationStatus(): {
    isConfigured: boolean;
    apiKey: string;
    endpoint: string;
    rateLimits: {
      free: string;
      paid: string;
    };
    features: string[];
    troubleshooting: {
      commonIssues: string[];
      solutions: string[];
    };
  } {
    return {
      isConfigured: this.isApiKeyConfigured(),
      apiKey: this.isApiKeyConfigured() ? `${this.config.apiKey.substring(0, 8)}...` : 'Not configured',
      endpoint: this.config.apiUrl,
      rateLimits: {
        free: '1 request per second (100 requests/month)',
        paid: 'Higher limits based on plan'
      },
      features: [
        'Email Format Validation',
        'Deliverability Check',
        'Quality Score (0.01-0.99)',
        'Auto-correction for Typos',
        'Free Email Detection',
        'Disposable Email Detection',
        'Role-based Email Detection',
        'Catch-all Email Detection',
        'MX Record Validation',
        'SMTP Validation'
      ],
      troubleshooting: {
        commonIssues: [
          'Invalid API Key error (401)',
          'Quota reached error (422)',
          'Rate limit exceeded (429)',
          'Network connection issues'
        ],
        solutions: [
          'Verify API key in Abstract API dashboard',
          'Check account usage and upgrade plan if needed',
          'Wait before making more requests',
          'Check internet connection'
        ]
      }
    };
  }
}

// Export singleton instance
export const abstractEmailValidator = new AbstractEmailValidator();

// Export types
export type { ValidationResult, BatchValidationResult, AbstractEmailData };