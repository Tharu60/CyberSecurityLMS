import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/ChatBot.css';

const ChatBot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: `Hello${user ? ` ${user.name}` : ''}! I'm your CyberSec Learning Assistant. I can help you with:

• Cybersecurity concepts and questions
• Course navigation and progress
• Security best practices
• Threat explanations
• Study tips and resources

How can I assist you today?`,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const getBotResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();

    // Cybersecurity knowledge base
    const responses = {
      // Greetings
      greeting: {
        keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
        response: `Hello! I'm here to help you with cybersecurity learning. Feel free to ask me about security concepts, threats, best practices, or course-related questions!`
      },

      // Phishing
      phishing: {
        keywords: ['phishing', 'phish', 'email attack', 'fake email'],
        response: `Phishing is a social engineering attack where attackers impersonate legitimate organizations to steal sensitive information.

**Key Indicators:**
• Suspicious sender addresses
• Urgent or threatening language
• Requests for personal information
• Suspicious links or attachments
• Poor grammar and spelling

**Protection Tips:**
• Verify sender identity
• Don't click suspicious links
• Enable multi-factor authentication
• Report suspicious emails
• Use email filters

Would you like to know more about a specific aspect of phishing?`
      },

      // Malware
      malware: {
        keywords: ['malware', 'virus', 'trojan', 'ransomware', 'spyware', 'worm'],
        response: `Malware is malicious software designed to harm or exploit systems.

**Common Types:**
• **Virus**: Attaches to programs and spreads
• **Trojan**: Disguises as legitimate software
• **Ransomware**: Encrypts files and demands payment
• **Spyware**: Secretly monitors activities
• **Worm**: Self-replicates across networks

**Prevention:**
• Keep software updated
• Use antivirus software
• Be cautious with downloads
• Regular backups
• Email scanning

Need more details on any specific malware type?`
      },

      // Password Security
      password: {
        keywords: ['password', 'passwords', 'strong password', 'password manager'],
        response: `Strong passwords are your first line of defense!

**Best Practices:**
• Use 12+ characters
• Mix uppercase, lowercase, numbers, symbols
• Avoid personal information
• Use unique passwords for each account
• Consider passphrases (e.g., "Coffee!Sunrise@Mountain2024")

**Tools:**
• Password managers (LastPass, 1Password, Bitwarden)
• Two-factor authentication (2FA)
• Password strength checkers

**Never:**
• Share passwords
• Reuse passwords
• Write them down visibly
• Use simple patterns (123456, password, qwerty)

Want to learn about password managers or 2FA?`
      },

      // MFA/2FA
      mfa: {
        keywords: ['mfa', '2fa', 'two factor', 'multi factor', 'authentication'],
        response: `Multi-Factor Authentication (MFA) adds extra security layers beyond passwords.

**Three Factors:**
1. **Something you know** (password, PIN)
2. **Something you have** (phone, security key)
3. **Something you are** (fingerprint, face)

**Common MFA Methods:**
• SMS codes (less secure)
• Authenticator apps (Google, Microsoft, Authy)
• Hardware tokens (YubiKey)
• Biometrics

**Benefits:**
• Blocks 99.9% of automated attacks
• Protects against password theft
• Required for sensitive accounts

Always enable MFA on email, banking, and social media!`
      },

      // Firewall
      firewall: {
        keywords: ['firewall', 'network security', 'packet filtering'],
        response: `A firewall is a network security system that monitors and controls traffic.

**Types:**
• **Packet Filtering**: Examines packets based on rules
• **Stateful Inspection**: Tracks connection states
• **Application Layer**: Inspects application data
• **Next-Gen Firewalls**: Advanced threat detection

**Key Functions:**
• Block unauthorized access
• Allow legitimate traffic
• Log security events
• Prevent malware spread

**Best Practices:**
• Keep firewall enabled
• Configure proper rules
• Regular updates
• Monitor logs

Both software and hardware firewalls are important!`
      },

      // VPN
      vpn: {
        keywords: ['vpn', 'virtual private network', 'encrypted connection'],
        response: `VPN (Virtual Private Network) creates a secure, encrypted connection.

**Benefits:**
• Encrypts internet traffic
• Hides IP address
• Secures public Wi-Fi usage
• Bypasses geo-restrictions
• Protects privacy

**Use Cases:**
• Remote work
• Public Wi-Fi
• Privacy protection
• Accessing regional content

**Choosing a VPN:**
• Strong encryption (AES-256)
• No-logs policy
• Kill switch feature
• Fast servers
• Trusted provider

**Popular VPNs:** NordVPN, ExpressVPN, ProtonVPN

Never use free VPNs for sensitive data!`
      },

      // Encryption
      encryption: {
        keywords: ['encryption', 'encrypt', 'cryptography', 'aes', 'rsa'],
        response: `Encryption converts data into unreadable format to protect confidentiality.

**Types:**
• **Symmetric** (AES): Same key for encryption/decryption
• **Asymmetric** (RSA): Public/private key pairs
• **Hashing** (SHA): One-way transformation

**Common Uses:**
• HTTPS websites (SSL/TLS)
• File encryption
• Email encryption (PGP)
• Disk encryption (BitLocker)
• Messaging (Signal, WhatsApp)

**Key Concepts:**
• End-to-end encryption
• Encryption at rest
• Encryption in transit
• Key management

Encryption is essential for data protection!`
      },

      // Social Engineering
      social_engineering: {
        keywords: ['social engineering', 'manipulation', 'pretexting', 'baiting'],
        response: `Social Engineering manipulates people into revealing information or performing actions.

**Common Techniques:**
• **Phishing**: Fake emails/messages
• **Pretexting**: Creating false scenarios
• **Baiting**: Offering something enticing
• **Tailgating**: Following authorized persons
• **Quid Pro Quo**: Offering services for information

**Defense Strategies:**
• Verify identities
• Be skeptical of urgency
• Don't share sensitive info
• Security awareness training
• Report suspicious activities

**Remember:** Attackers target human psychology, not just technology!`
      },

      // SQL Injection
      sql_injection: {
        keywords: ['sql injection', 'sql', 'database attack', 'sqli'],
        response: `SQL Injection attacks insert malicious SQL code into database queries.

**How It Works:**
Attackers exploit input fields to manipulate database queries.

**Example:**
Instead of username: "admin"
Attacker inputs: "admin' OR '1'='1"

**Impact:**
• Data theft
• Data modification
• Authentication bypass
• System compromise

**Prevention:**
• Parameterized queries
• Input validation
• Least privilege access
• Web Application Firewall (WAF)
• Regular security testing

Always sanitize user inputs!`
      },

      // Zero Trust
      zero_trust: {
        keywords: ['zero trust', 'never trust always verify', 'zero trust architecture'],
        response: `Zero Trust is a security model: "Never trust, always verify"

**Core Principles:**
1. Verify explicitly
2. Least privilege access
3. Assume breach

**Key Components:**
• Identity verification
• Device compliance
• Micro-segmentation
• Continuous monitoring
• Just-in-time access

**Benefits:**
• Reduces attack surface
• Limits lateral movement
• Better visibility
• Cloud-friendly

**Implementation:**
• Multi-factor authentication
• Network segmentation
• Endpoint security
• Access policies

Traditional perimeter security is no longer enough!`
      },

      // Course Help
      course: {
        keywords: ['course', 'stages', 'progress', 'quiz', 'assessment', 'certificate', 'how to start'],
        response: `Let me help you with the course!

**Course Structure:**
• **Initial Assessment**: Tests your current knowledge
• **6 Stages**: Progressive learning path
• **Stage Quizzes**: Test your understanding
• **Videos**: Expert tutorials
• **Certificate**: Upon completion

**Getting Started:**
1. Complete initial assessment
2. Unlock stages based on performance
3. Watch videos and study materials
4. Take stage quizzes
5. Track your progress
6. Earn your certificate!

**Tips:**
• Don't rush through stages
• Review videos multiple times
• Practice concepts
• Use the progress tracker

Which stage are you currently on?`
      },

      // Thanks
      thanks: {
        keywords: ['thank', 'thanks', 'appreciate', 'helpful'],
        response: `You're very welcome! I'm glad I could help. Keep up the great work with your cybersecurity learning!

Feel free to ask me anything else anytime. Stay secure! 🛡️`
      },

      // Default fallback
      default: {
        keywords: [],
        response: `I'd be happy to help! I can assist you with:

**Cybersecurity Topics:**
• Phishing and social engineering
• Malware and threats
• Passwords and MFA
• Encryption and VPNs
• Firewalls and network security
• SQL injection and vulnerabilities
• Zero Trust architecture

**Course Help:**
• Navigation and progress
• Stages and quizzes
• Videos and resources
• Certificate requirements

What would you like to know more about?`
      }
    };

    // Find matching response
    for (const [key, value] of Object.entries(responses)) {
      if (key === 'default') continue;

      for (const keyword of value.keywords) {
        if (lowerMessage.includes(keyword)) {
          return value.response;
        }
      }
    }

    return responses.default.response;
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: inputText,
      timestamp: new Date()
    };

    setMessages([...messages, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate bot thinking time and add bot response
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        type: 'bot',
        text: getBotResponse(inputText),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button className="chat-bubble" onClick={() => setIsOpen(true)}>
          <i className="bi bi-chat-dots-fill"></i>
          <span className="chat-badge">AI</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window">
          {/* Chat Header */}
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="chat-avatar">
                <i className="bi bi-robot"></i>
              </div>
              <div className="chat-header-text">
                <h4>CyberSec Assistant</h4>
                <span className="status-online">
                  <i className="bi bi-circle-fill"></i> Online
                </span>
              </div>
            </div>
            <button className="chat-close" onClick={() => setIsOpen(false)}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          {/* Messages Container */}
          <div className="chat-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.type === 'user' ? 'message-user' : 'message-bot'}`}
              >
                {message.type === 'bot' && (
                  <div className="message-avatar">
                    <i className="bi bi-robot"></i>
                  </div>
                )}
                <div className="message-content">
                  <div className="message-text">{message.text}</div>
                  <div className="message-time">{formatTime(message.timestamp)}</div>
                </div>
                {message.type === 'user' && (
                  <div className="message-avatar message-avatar-user">
                    <i className="bi bi-person-circle"></i>
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="message message-bot">
                <div className="message-avatar">
                  <i className="bi bi-robot"></i>
                </div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="chat-input-container">
            <div className="chat-input-wrapper">
              <input
                ref={inputRef}
                type="text"
                className="chat-input"
                placeholder="Ask me anything about cybersecurity..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button
                className="chat-send-btn"
                onClick={handleSendMessage}
                disabled={!inputText.trim()}
              >
                <i className="bi bi-send-fill"></i>
              </button>
            </div>
            <div className="chat-footer-text">
              Powered by AI • Ask about cybersecurity topics
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
