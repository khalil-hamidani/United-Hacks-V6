import { useState } from 'react';
import { Send, Mail, CheckCircle, XCircle } from 'lucide-react';
import { demoApi } from '../api';

export function DemoPage() {
  const [triggeringDemo, setTriggeringDemo] = useState(false);
  const [demoResult, setDemoResult] = useState<any>(null);

  const handleTriggerDemo = async () => {
    if (!confirm('This will send emails to all your trusted recipients with their assigned legacy messages. Continue?')) {
      return;
    }
    
    setTriggeringDemo(true);
    setDemoResult(null);
    try {
      const result = await demoApi.triggerRelease();
      setDemoResult(result);
    } catch (error: any) {
      console.error('Failed to trigger demo:', error);
      const errorDetail = error.response?.data?.detail || 'Failed to trigger demo release';
      setDemoResult({
        success: false,
        message: errorDetail,
        notifications: []
      });
    } finally {
      setTriggeringDemo(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="stagger-1">
        <h1 className="text-2xl md:text-3xl font-light text-white tracking-tight mb-1 md:mb-2">
          Demo & Testing
        </h1>
        <p style={{ color: '#64748b' }} className="text-sm md:text-base">
          Test the automated email system safely before it goes live.
        </p>
      </div>

      {/* Email System Test */}
      <div className="glass-panel p-6 md:p-8 stagger-2">
        <div className="flex items-center gap-3 mb-4">
          <Mail size={24} style={{ color: '#8b5cf6' }} />
          <h2 className="text-xl font-light text-white">Email System Test</h2>
        </div>
        
        <p style={{ color: '#94a3b8' }} className="text-sm mb-6">
          This will send a test email to all your trusted recipients with their assigned legacy messages.
          The emails will be sent immediately, regardless of your check-in status.
        </p>

        <div className="space-y-4">
          <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(234, 179, 8, 0.05)', border: '1px solid rgba(234, 179, 8, 0.2)' }}>
            <h3 className="text-sm font-medium text-white mb-2">What will be sent:</h3>
            <ul className="space-y-1 text-xs" style={{ color: '#94a3b8' }}>
              <li>• Beautiful HTML email with your legacy messages</li>
              <li>• Each recipient gets only their assigned messages</li>
              <li>• Financial obligations (if any) are included</li>
              <li>• All content is decrypted and formatted</li>
            </ul>
          </div>

          <button
            onClick={handleTriggerDemo}
            disabled={triggeringDemo}
            className="calm-button-primary flex items-center gap-2 disabled:opacity-50"
          >
            <Send size={18} />
            {triggeringDemo ? 'Sending Emails...' : 'Send Test Emails'}
          </button>
        </div>

        {/* Results */}
        {demoResult && (
          <div className="mt-6 space-y-4">
            <div className="p-4 rounded-lg" style={{ 
              backgroundColor: demoResult.success ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
              border: `1px solid ${demoResult.success ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}` 
            }}>
              <div className="flex items-center gap-2 mb-3">
                {demoResult.success ? (
                  <CheckCircle size={20} style={{ color: '#4ade80' }} />
                ) : (
                  <XCircle size={20} style={{ color: '#f87171' }} />
                )}
                <p className="text-sm font-medium" style={{ color: demoResult.success ? '#4ade80' : '#f87171' }}>
                  {demoResult.message}
                </p>
              </div>

              {demoResult.notifications && demoResult.notifications.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium" style={{ color: '#94a3b8' }}>Email Status:</p>
                  {demoResult.notifications.map((notif: any, idx: number) => (
                    <div 
                      key={idx} 
                      className="flex items-start gap-2 p-3 rounded-lg" 
                      style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
                    >
                      <span style={{ color: notif.status === 'sent' ? '#4ade80' : '#f87171', fontSize: '16px' }}>
                        {notif.status === 'sent' ? '✓' : '✗'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium">{notif.recipient_name}</p>
                        <p className="text-xs" style={{ color: '#94a3b8' }}>{notif.recipient_email}</p>
                        <p className="text-xs mt-1" style={{ color: '#6b7280' }}>
                          {notif.messages_count} message{notif.messages_count !== 1 ? 's' : ''} sent
                        </p>
                        {notif.error && (
                          <p className="text-xs mt-1" style={{ color: '#f87171' }}>
                            Error: {notif.error}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Info Panel */}
      <div className="glass-panel p-6 md:p-8 stagger-3">
        <h3 className="text-base font-medium text-white mb-3">Testing Notes</h3>
        <div className="space-y-2 text-sm" style={{ color: '#94a3b8' }}>
          <p>• This is a safe testing environment - no real triggers are activated</p>
          <p>• Emails are sent using your configured SMTP settings</p>
          <p>• Recipients will receive real emails, so use test addresses if needed</p>
          <p>• Check your spam folder if emails don't arrive</p>
          <p>• All sent emails are logged in the database</p>
        </div>
      </div>
    </div>
  );
}
