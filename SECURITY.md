# Security Policy

## 🔒 Supported Versions

We actively support the following versions of Trama with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | ✅ Yes             |
| < 1.0   | ❌ No              |

## 🚨 Reporting a Vulnerability

We take the security of Trama seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### 📧 How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to: **security@doctomermaid.com**

Include the following information in your report:
- Type of issue (e.g. buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit the issue

### 🕐 Response Timeline

We will acknowledge receipt of your vulnerability report within **48 hours** and will send a more detailed response within **7 days** indicating the next steps in handling your report.

After the initial reply to your report, we will:
- Keep you informed of the progress towards a fix and full announcement
- May ask for additional information or guidance
- Credit you in the security advisory (if desired)

### 🏆 Responsible Disclosure

We follow the principle of responsible disclosure:

1. **Report**: Submit the vulnerability report privately
2. **Acknowledge**: We acknowledge receipt within 48 hours
3. **Investigate**: We investigate and develop a fix
4. **Fix**: We release a patch for supported versions
5. **Disclose**: We publicly disclose the vulnerability after the fix is available

### 🎯 Scope

#### In Scope
- Cross-site scripting (XSS)
- Cross-site request forgery (CSRF)
- Server-side request forgery (SSRF)
- SQL injection
- Authentication bypass
- Authorization bypass
- Remote code execution (RCE)
- Local file inclusion (LFI)
- Directory traversal
- Sensitive data exposure
- Insecure direct object references
- Security misconfigurations

#### Out of Scope
- Denial of Service (DoS) attacks
- Physical attacks
- Social engineering attacks
- Attacks requiring physical access to a user's device
- Issues in third-party dependencies (please report to the respective maintainers)
- Self-XSS that cannot be used to exploit other users
- Missing security headers that do not lead to a vulnerability
- Vulnerabilities in outdated versions

## 🛡️ Security Measures

### Current Security Implementations

- **Input Validation**: All user inputs are validated and sanitized
- **API Security**: Rate limiting and authentication for API endpoints
- **File Upload Security**: PDF files are processed in isolated environments
- **Environment Variables**: Sensitive data stored in environment variables
- **HTTPS**: All communications encrypted in transit
- **Content Security Policy**: CSP headers implemented
- **Dependency Scanning**: Regular security audits of dependencies

### Security Best Practices for Users

1. **Keep Updated**: Always use the latest version of Trama
2. **Secure API Keys**: Never expose your API keys in client-side code
3. **Environment Variables**: Store sensitive configuration in environment variables
4. **HTTPS**: Always use HTTPS in production deployments
5. **Regular Updates**: Keep all dependencies updated
6. **Access Control**: Implement proper access controls for your deployment

## 🔍 Security Audits

We regularly conduct security audits and assessments:

- **Automated Scanning**: Continuous dependency vulnerability scanning
- **Code Review**: Security-focused code reviews for all changes
- **Penetration Testing**: Regular security testing by third parties
- **Static Analysis**: Automated static code analysis for security issues

## 📋 Security Checklist for Contributors

When contributing to Trama, please ensure:

- [ ] No hardcoded secrets or API keys
- [ ] Input validation for all user inputs
- [ ] Proper error handling without information disclosure
- [ ] Secure file handling for PDF uploads
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities
- [ ] Proper authentication and authorization
- [ ] Secure communication protocols
- [ ] Dependencies are up to date and secure

## 🚀 Security Updates

Security updates will be released as:

- **Critical**: Immediate patch release
- **High**: Patch release within 7 days
- **Medium**: Included in next minor release
- **Low**: Included in next major release

## 📞 Contact Information

- **Security Email**: security@doctomermaid.com
- **General Contact**: your-email@example.com
- **GitHub Security Advisories**: [GitHub Security Tab](https://github.com/your-username/DocToMermaid/security)

## 🙏 Acknowledgments

We would like to thank the following security researchers for their responsible disclosure:

<!-- Security researchers will be listed here after responsible disclosure -->

---

**Note**: This security policy is subject to change. Please check back regularly for updates.