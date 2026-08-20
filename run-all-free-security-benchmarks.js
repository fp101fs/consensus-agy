const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) envVars[match[1].trim()] = match[2].trim();
});

const OPENROUTER_API_KEY = envVars.OPENROUTER_API_KEY;

// 5 Security Benchmark Prompts with full metadata
const SECURITY_PRESETS = [
  {
    id: 'benchmark-sec-sql-injection-audit',
    title: 'Security Audit: Broken Authentication & SQL Injection',
    category: 'Cybersecurity & Code Audit',
    tags: ['Security', 'SQL injection', 'Code review', 'Authentication'],
    prompt: `Conduct a thorough defensive security code audit of the following Node.js backend authentication handler:

\`\`\`javascript
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const query = "SELECT id, username, role FROM users WHERE username = '" + username + "' AND password = '" + password + "'";
  const result = await db.query(query);
  if (result.rows.length > 0) {
    const token = jwt.sign({ id: result.rows[0].id, role: result.rows[0].role }, 'app-secret-123');
    return res.json({ success: true, token });
  }
  return res.status(401).json({ error: 'Invalid credentials' });
});
\`\`\`

Tasks:
1. Identify all security vulnerabilities with exact CWE numbers.
2. Explain the risk and impact of each vulnerability.
3. Provide the complete refactored secure implementation using parameterized queries, bcrypt hashing, and robust JWT secret management.
4. Assess whether the original code can be secured without changing the database schema.`
  },
  {
    id: 'benchmark-sec-race-condition-transfer',
    title: 'Security Audit: Concurrency & Race Condition Transfer Flaw',
    category: 'Cybersecurity & Code Audit',
    tags: ['Security', 'Concurrency', 'Race condition', 'Financial integrity'],
    prompt: `Analyze this banking balance transfer transaction for concurrency and race condition vulnerabilities:

\`\`\`typescript
async function transferFunds(fromUserId: string, toUserId: string, amount: number) {
  const sender = await db.query('SELECT balance FROM accounts WHERE user_id = $1', [fromUserId]);
  if (sender.rows[0].balance < amount) {
    throw new Error('Insufficient funds');
  }
  
  await db.query('UPDATE accounts SET balance = balance - $1 WHERE user_id = $2', [amount, fromUserId]);
  await db.query('UPDATE accounts SET balance = balance + $1 WHERE user_id = $2', [amount, toUserId]);
  return { status: 'success' };
}
\`\`\`

Tasks:
1. Identify the exact TOCTOU (Time-of-Check to Time-of-Use) concurrency vulnerability.
2. Explain how rapid concurrent execution could cause an overdraft/double-spending balance corruption.
3. Provide the corrected ACID-compliant database transaction using row-level locking (\`SELECT ... FOR UPDATE\`) or atomic conditional updates.
4. Address deadlock prevention when two users simultaneously transfer money to each other.`
  },
  {
    id: 'benchmark-sec-jwt-validation-bypass',
    title: 'Security Audit: JWT Algorithm Confusion & None Alg Bypass',
    category: 'Cybersecurity & Code Audit',
    tags: ['Security', 'JWT', 'Cryptographic flaws', 'Access control'],
    prompt: `Review this custom JWT validation middleware for cryptographic signature and algorithm confusion vulnerabilities:

\`\`\`python
import hmac, hashlib, base64, json

def verify_token(token, public_or_hmac_key):
    parts = token.split('.')
    if len(parts) != 3:
        return False, "Invalid token structure"
    
    header = json.loads(base64.urlsafe_b64decode(parts[0] + '=='))
    payload = json.loads(base64.urlsafe_b64decode(parts[1] + '=='))
    signature = parts[2]
    
    alg = header.get('alg', 'HS256')
    if alg == 'none':
        return True, payload # Allow unsigned tokens in debug mode
    
    if alg in ['HS256', 'RS256']:
        expected_sig = base64.urlsafe_b64encode(
            hmac.new(public_or_hmac_key.encode(), f"{parts[0]}.{parts[1]}".encode(), hashlib.sha256).digest()
        ).decode().rstrip('=')
        if signature == expected_sig:
            return True, payload
            
    return False, "Signature verification failed"
\`\`\`

Tasks:
1. Detail all critical security flaws in this implementation (including algorithm confusion and timing attacks).
2. Explain how an attacker could forge tokens with arbitrary claims.
3. Write a production-grade defensive Python implementation using standard constant-time verification and strict algorithm enforcement.`
  },
  {
    id: 'benchmark-sec-ssrf-url-validator',
    title: 'Security Audit: SSRF & Cloud Metadata Bypass',
    category: 'Cybersecurity & Code Audit',
    tags: ['Security', 'SSRF', 'Network security', 'Cloud defense'],
    prompt: `Evaluate this webhook URL dispatcher designed to fetch external webhooks while attempting to prevent Server-Side Request Forgery (SSRF):

\`\`\`python
import urllib.parse, requests

def fetch_webhook(url):
    parsed = urllib.parse.urlparse(url)
    hostname = parsed.hostname
    
    # Block internal localhost
    if hostname in ['localhost', '127.0.0.1', '0.0.0.0']:
        raise ValueError("Localhost access is prohibited")
    
    # Block private cloud metadata
    if '169.254.169.254' in hostname:
        raise ValueError("Cloud metadata access prohibited")
        
    response = requests.get(url, timeout=5)
    return response.text
\`\`\`

Tasks:
1. Enumerate 4 distinct bypass vectors against this naive validator (e.g. DNS rebinding, alternative IP encodings, IPv6, redirects).
2. Explain the blast radius of accessing cloud instance metadata in AWS/GCP/Azure environments.
3. Provide a complete, hardened defensive implementation that resolves DNS before connecting, checks all resolved IP addresses against RFC 1918/RFC 3927 private CIDR ranges, and disables automatic redirect following.`
  },
  {
    id: 'benchmark-sec-idor-authorization-matrix',
    title: 'Security Audit: IDOR & Multi-Tenant Authorization',
    category: 'Cybersecurity & Code Audit',
    tags: ['Security', 'IDOR', 'Multi-tenant', 'Access control'],
    prompt: `Audit this REST API document management endpoint for broken object-level authorization (BOLA / IDOR):

\`\`\`go
func GetDocumentHandler(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    docID := vars["id"]
    
    // User is authenticated via session middleware
    user := r.Context().Value("user").(*User)
    
    var doc Document
    err := db.QueryRow("SELECT id, organization_id, title, content, is_confidential FROM documents WHERE id = $1", docID).Scan(&doc.ID, &doc.OrgID, &doc.Title, &doc.Content, &doc.IsConfidential)
    if err != nil {
        http.Error(w, "Document not found", http.StatusNotFound)
        return
    }
    
    json.NewEncoder(w).Encode(doc)
}
\`\`\`

Tasks:
1. Explain how this endpoint allows unauthorized multi-tenant data exfiltration across organizational boundaries.
2. Outline the Principle of Least Privilege and how scoping queries by \`organization_id\` / user permissions prevents IDOR.
3. Rewrite the handler in Go with comprehensive tenancy checks and role-based confidentiality enforcement.`
  }
];

// Curated Triads of Free Models for Testing
const FREE_TRIADS = [
  [
    'liquid/lfm-2.5-2.6b:free',
    'nvidia/nemotron-3.5-lightning:free',
    'poolside/laguna-s-2.1:free'
  ],
  [
    'poolside/laguna-xs-2.1:free',
    'openai/gpt-oss-20b:free',
    'google/gemma-4-26b-a4b-it:free'
  ],
  [
    'nvidia/nemotron-3-super-120b-a12b:free',
    'nvidia/nemotron-3-nano-30b-a3b:free',
    'z-ai/glm-5.2:free'
  ]
];

async function runSecurityBenchmarks() {
  console.log('================================================================');
  console.log('🛡️ Starting Automated Benchmark Run: 5 Security Prompts on Free Models');
  console.log('================================================================');
  console.log(`Loaded ${SECURITY_PRESETS.length} Security benchmark prompts.\n`);

  for (let pIdx = 0; pIdx < SECURITY_PRESETS.length; pIdx++) {
    const preset = SECURITY_PRESETS[pIdx];
    console.log(`======================================================`);
    console.log(`[${pIdx + 1}/${SECURITY_PRESETS.length}] Running Security Benchmark: "${preset.title}" (${preset.id})`);
    console.log(`Category: ${preset.category} | Tags: ${preset.tags.join(', ')}`);
    console.log(`======================================================`);

    for (const triad of FREE_TRIADS) {
      console.log(`  -> Testing triad: ${triad.join(', ')}`);

      try {
        const res = await fetch('http://localhost:3000/api/consensus', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`
          },
          body: JSON.stringify({
            prompt: preset.prompt,
            models: triad,
            judgeModel: 'google/gemini-2.5-flash',
            saveToDb: true
          })
        });

        if (!res.ok) {
          const errText = await res.text();
          console.warn(`    ⚠️ Triad warning (${res.status}): ${errText.slice(0, 150)}`);
        } else {
          const data = await res.json();
          console.log(`    ✅ Winner: ${data.judgeReport?.winnerModelId || 'Split decision'}`);
          console.log(`    📊 Solvability: ${data.judgeReport?.problemSolvability || 'N/A'}`);
          console.log(`    ⏱️ Total Time: ${(data.totalLatencyMs / 1000).toFixed(1)}s`);
        }
      } catch (err) {
        console.error(`    ❌ Request failed: ${err.message}`);
      }

      await new Promise(r => setTimeout(r, 2000));
    }
    console.log('');
  }

  console.log('🎉 ALL 5 SECURITY BENCHMARKS COMPLETED ACROSS FREE MODELS!');
}

runSecurityBenchmarks();
