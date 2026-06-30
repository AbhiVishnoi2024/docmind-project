// src/App.jsx — DocMind.ai v2.0 with Profile Editing, Drive Upload, History, Suggested Questions, Animations
import React, { useState, useRef, useEffect } from 'react';
import './App.css';

const navigationItems = [
  { id: 'upload', label: 'Upload Space', icon: '☁️' },
  { id: 'summary', label: 'Smart Summary', icon: '🧠' },
  { id: 'querylab', label: 'QueryLab', icon: '⚡' },
  { id: 'quiz', label: 'Knowledge Quiz', icon: '📝' },
  { id: 'profile', label: 'My Profile', icon: '👤' }
];

export default function App() {
  const [currentView, setCurrentView] = useState('auth');
  const [isRegistering, setIsRegistering] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [profile, setProfile] = useState({ name: 'Guest', email: 'guest@docmind.ai', role: 'Student' });
  const [documentId, setDocumentId] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [summaryText, setSummaryText] = useState('');
  const [quizData, setQuizData] = useState(null);
  const [quizDifficulty, setQuizDifficulty] = useState('medium');
  const [quizCount, setQuizCount] = useState(5);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  const [driveLink, setDriveLink] = useState('');
  const [uploadMode, setUploadMode] = useState('file'); // 'file' | 'drive'
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const [historyMessages, setHistoryMessages] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [questionDifficulty, setQuestionDifficulty] = useState('beginner');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const toastTimer = useRef(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Token persistence
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const authHeader = () => ({ Authorization: `Bearer ${token}` });

  // ========== UPLOAD ==========
  const handleFileUpload = async (file) => {
    if (!file) return;
    if (!token) return showToast('Please login first', 'error');
    if (!file.name.toLowerCase().endsWith('.pdf')) return showToast('Only PDF files are supported', 'error');
    if (file.size > 50 * 1024 * 1024) return showToast('File too large (max 50MB)', 'error');

    setLoading(true);
    setUploadedFileName(file.name);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch('/api/v1/documents/upload', {
        method: 'POST',
        headers: { ...authHeader() },
        body: formData 
      });

      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      
      setDocumentId(data.id); 
      setMessages([]); 
      setSummaryText(''); 
      setQuizData(null); 
      setSuggestedQuestions([]);
      setHistoryMessages([]);

      showToast('📄 Document processed successfully!', 'success');
      // Questions will load when you visit QueryLab tab and click "Generate Questions"
    } catch (e) {
      showToast('Upload failed: ' + (e.message || e), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDriveUpload = async () => {
    if (!driveLink.trim()) return showToast('Please paste a Google Drive link', 'error');
    if (!token) return showToast('Please login first', 'error');
    
    setLoading(true);
    try {
      const response = await fetch('/api/v1/documents/upload/drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ drive_link: driveLink.trim() })
      });

      if (!response.ok) {
        // If drive upload endpoint doesn't exist, gracefully fallback
        if (response.status === 404) {
          showToast('Drive upload not available on server yet. Please use file upload.', 'error');
          setLoading(false);
          return;
        }
        throw new Error(await response.text());
      }
      
      const data = await response.json();
      setDocumentId(data.id);
      setMessages([]);
      setSummaryText('');
      setQuizData(null);
      setSuggestedQuestions([]);
      setHistoryMessages([]);
      setDriveLink('');
      showToast('📄 Document from Drive processed!', 'success');
      // Questions will load when you visit QueryLab tab and click "Generate Questions"
    } catch (e) {
      showToast('Drive upload failed: ' + (e.message || e), 'error');
    } finally {
      setLoading(false);
    }
  };

  // ========== SUMMARY ==========
  const handleGenerateSummary = async () => {
    if (!documentId) return showToast("Please upload a document first.", 'error');
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/assessment/summary/${documentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() }
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const summary = data.summary_text || data.summary || '';
      // Check for raw API error in response
      if (summary.includes('429') || summary.includes('quota exceeded') || summary.includes('ResourceExhausted')) {
        setSummaryText('⚠️ Gemini API quota exceeded. Free tier resets after ~1 hour. Please wait and try again.');
        showToast('⚠️ API quota exceeded. Try again later.', 'error');
      } else {
        setSummaryText(summary || 'Summary generated successfully.');
        showToast('✨ Summary generated!', 'success');
      }
    } catch (e) {
      showToast("API quota exceeded. Wait ~1 hour for reset.", 'error');
    } finally {
      setLoading(false);
    }
  };

  // ========== SUGGESTED QUESTIONS ==========
  const fetchSuggestedQuestions = async (docId, level) => {
    if (!docId) return;
    try {
      const res = await fetch(`/api/v1/assessment/questions/${docId}/${level}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() }
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSuggestedQuestions(Array.isArray(data) ? data : []);
    } catch (e) {
      // Silent fail — questions are optional
      setSuggestedQuestions([]);
    }
  };

  // Only fetch history when entering querylab — NOT questions (handled by onChange)
  useEffect(() => {
    if (documentId && currentView === 'querylab') {
      fetchChatHistory(documentId);
    }
  }, [documentId, currentView]);

  // ========== CHAT HISTORY ==========
  const fetchChatHistory = async (docId) => {
    if (!docId) return;
    try {
      const res = await fetch(`/api/v1/chat/history/${docId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', ...authHeader() }
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        // Transform history into message format
        const historyMsgs = [];
        data.forEach((item) => {
          // ChatResponse has {answer, history_id} — we don't have query stored here, but the backend logs it
          // We'll just show answers as bot messages — query wasn't returned by this endpoint
        });
        setHistoryMessages(data);
      }
    } catch (e) {
      // Silent fail
    }
  };

  // ========== CHAT ==========
  const handleSendChat = async () => {
    if (!inputMessage.trim()) return;
    if (!documentId) return showToast('Upload a document first to start asking questions', 'error');

    const userMsg = inputMessage;
    setMessages((prev) => [...prev, { from: 'user', text: userMsg }]);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/v1/chat/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ message: userMsg, history_id: documentId })
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      // Check if answer contains raw API error — show friendly message instead
      const answer = data.answer || '';
      if (answer.includes('429') || answer.includes('quota exceeded') || answer.includes('ResourceExhausted')) {
        setMessages((prev) => [...prev, { from: 'bot', text: '⚠️ Gemini API quota exceeded. Free tier resets after ~1 hour. Please wait and try again.' }]);
      } else {
        setMessages((prev) => [...prev, { from: 'bot', text: answer }]);
      }
    } catch (e) {
      showToast('Chat temporarily unavailable (API quota). Try again later.', 'error');
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestedClick = (question) => {
    setInputMessage(question.question_text || question);
  };

  const handleSendSuggested = (question) => {
    const text = question.question_text || question;
    if (!documentId) return showToast('Upload a document first', 'error');
    setMessages((prev) => [...prev, { from: 'user', text }]);
    setLoading(true);
    fetch('/api/v1/chat/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify({ message: text, history_id: documentId })
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setMessages((prev) => [...prev, { from: 'bot', text: data.answer }]);
      })
      .catch(() => {
        showToast('Chat failed, try again', 'error');
        setMessages((prev) => prev.slice(0, -1));
      })
      .finally(() => setLoading(false));
  };

  // ========== QUIZ ==========
  const handleGenerateQuiz = async (difficulty) => {
    if (!documentId) return showToast("Please upload a document first.", 'error');
    setLoading(true);
    setQuizSubmitted(false);
    setQuizScore(null);
    setSelectedAnswers({});
    try {
      const res = await fetch(`/api/v1/assessment/quiz/${documentId}?difficulty=${difficulty}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() }
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const qData = data.quiz_data || data.quiz || data.quizData || [];
      if (typeof qData === 'string' && (qData.includes('429') || qData.includes('quota'))) {
        showToast('⚠️ API quota exceeded. Try again later.', 'error');
        setQuizData(null);
      } else {
        // Limit questions based on quizCount
        const limitedData = Array.isArray(qData) ? qData.slice(0, quizCount) : [];
        setQuizData(limitedData);
        showToast(`🎯 Quiz generated (${limitedData.length} questions)!`, 'success');
      }
    } catch (e) {
      showToast("API quota exceeded. Wait ~1 hour for reset.", 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle option selection
  const handleSelectAnswer = (questionIdx, option) => {
    if (quizSubmitted) return; // Don't allow changes after submit
    setSelectedAnswers((prev) => ({ ...prev, [questionIdx]: option }));
  };

  // Submit quiz and calculate score
  const handleSubmitQuiz = () => {
    const total = quizData.length;
    const answered = Object.keys(selectedAnswers).length;
    
    if (answered < total) {
      showToast(`⚠️ Please answer all ${total} questions before submitting.`, 'error');
      return;
    }

    // Calculate score by comparing against correct_answer from API
    let correct = 0;
    let incorrect = [];
    quizData.forEach((q, idx) => {
      const selected = selectedAnswers[idx];
      const correctAns = q.correct_answer;
      if (selected && correctAns && selected.toLowerCase() === correctAns.toLowerCase()) {
        correct++;
      } else if (selected) {
        incorrect.push({ index: idx, selected, correct: correctAns });
      }
    });

    const percentage = Math.round((correct / total) * 100);
    setQuizScore({ correct, total, percentage, incorrect });
    setQuizSubmitted(true);
    showToast(`📊 Quiz submitted! Score: ${correct}/${total}`, 'success');
  };

  // Reset quiz
  const handleResetQuiz = () => {
    setQuizData(null);
    setQuizSubmitted(false);
    setQuizScore(null);
    setSelectedAnswers({});
  };

  // ========== AUTH ==========
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    const isReg = isRegistering;
    setLoading(true);

    try {
      const endpoint = isReg ? '/api/v1/auth/register' : '/api/v1/auth/login';
      let options;

      if (isReg) {
        options = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: authForm.name, email: authForm.email, password: authForm.password })
        };
      } else {
        const params = new URLSearchParams();
        params.append('username', authForm.email);
        params.append('password', authForm.password);
        options = {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params.toString()
        };
      }

      const response = await fetch(endpoint, options);
      if (!response.ok) {
        const respBody = await response.text().catch(() => '');
        throw new Error(`Auth failed - ${response.status} ${respBody}`);
      }

      const data = await response.json();
      if (!isReg) {
        setToken(data.access_token);
        // Try to fetch user profile
        try {
          const profileRes = await fetch('/api/v1/auth/me', {
            headers: { Authorization: `Bearer ${data.access_token}` }
          });
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            setProfile({
              name: profileData.name || authForm.email.split('@')[0],
              email: profileData.email || authForm.email,
              role: 'Student'
            });
          } else {
            setProfile({
              name: authForm.name || authForm.email.split('@')[0],
              email: authForm.email,
              role: 'Student'
            });
          }
        } catch {
          setProfile({
            name: authForm.name || authForm.email.split('@')[0],
            email: authForm.email,
            role: 'Student'
          });
        }
        setCurrentView('upload');
        showToast('🎉 Welcome back!', 'success');
      } else {
        showToast('✅ Registration successful! Please sign in.', 'success');
        setIsRegistering(false);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // ========== PROFILE ==========
  const startEditing = () => {
    setEditForm({ name: profile.name, email: profile.email });
    setEditingProfile(true);
  };

  const cancelEditing = () => {
    setEditingProfile(false);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ name: editForm.name, email: editForm.email })
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setProfile({ name: data.name, email: data.email, role: profile.role });
      setEditingProfile(false);
      showToast('✅ Profile updated!', 'success');
    } catch (err) {
      showToast('Update failed: ' + (err.message || err), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken('');
    setCurrentView('auth');
    setProfile({ name: 'Guest', email: 'guest@docmind.ai', role: 'Student' });
    setDocumentId('');
    setSummaryText('');
    setQuizData(null);
    setMessages([]);
    setSuggestedQuestions([]);
    setHistoryMessages([]);
    setUploadedFileName('');
    showToast('👋 Logged out successfully', 'success');
  };

  // ========== RENDER AUTH ==========
  if (currentView === 'auth' || !token) {
    return (
      <div className="auth-shell">
        <div className="auth-bg-animation">
          <div className="glow-orb orb-primary"></div>
          <div className="glow-orb orb-secondary"></div>
          <div className="glow-orb orb-tertiary"></div>
        </div>
        
        <div className="auth-card glass-panel fade-in">
          <div className="auth-visual">
            <div className="brand-badge animate-float">DM</div>
            <h1 className="gradient-text animate-gradient">DocMind.ai</h1>
            <p className="auth-subtitle">Elevate your study experience with AI.</p>
            <div className="auth-features">
              <div className="feature-chip slide-in-left" style={{animationDelay: '0.1s'}}>✨ Smart Summaries</div>
              <div className="feature-chip slide-in-left" style={{animationDelay: '0.2s'}}>💬 Conversational AI</div>
              <div className="feature-chip slide-in-left" style={{animationDelay: '0.3s'}}>🎯 Dynamic Quizzes</div>
            </div>
          </div>

          <div className="auth-form-container">
            <h2 className="slide-in-right">{isRegistering ? 'Create Account' : 'Welcome Back'}</h2>
            <p className="text-muted slide-in-right" style={{animationDelay: '0.1s'}}>
              {isRegistering ? 'Join the future of learning.' : 'Access your workspace.'}
            </p>
            
            <form onSubmit={handleAuthSubmit} className="auth-form">
              {isRegistering && (
                <div className="input-group slide-in-right" style={{animationDelay: '0.15s'}}>
                  <input type="text" required placeholder="Full Name" value={authForm.name} onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })} />
                </div>
              )}
              <div className="input-group slide-in-right" style={{animationDelay: isRegistering ? '0.2s' : '0.15s'}}>
                <input type="email" required placeholder="Email Address" value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} />
              </div>
              <div className="input-group slide-in-right" style={{animationDelay: isRegistering ? '0.25s' : '0.2s'}}>
                <input type="password" required placeholder="Password" value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} />
              </div>
              
              <button type="submit" className="primary-btn pulse-hover slide-in-right" style={{animationDelay: '0.3s'}} disabled={loading}>
                {loading ? <span className="spinner"></span> : (isRegistering ? 'Sign Up' : 'Log In')}
              </button>
            </form>
            
            <button className="switch-link fade-in" style={{animationDelay: '0.4s'}} onClick={() => setIsRegistering(!isRegistering)}>
              {isRegistering ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>

        {/* Toast */}
        {toast.show && <div className={`toast-notification ${toast.type} slide-in-right`}>{toast.message}</div>}
      </div>
    );
  }

  // ========== RENDER MAIN APP ==========
  return (
    <div className="app-shell dark-theme">
      <div className="bg-orbs">
        <div className="glow-orb orb-one"></div>
        <div className="glow-orb orb-two"></div>
        <div className="glow-orb orb-three"></div>
      </div>

      <div className="app-layout glass-panel fade-in">
        
        {/* === SIDEBAR === */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <div className="brand-badge small animate-spin-slow">DM</div>
            <div className="brand-text">
              <h2>DocMind</h2>
              <span>Workspace</span>
            </div>
          </div>

          <nav className="nav-menu">
            {navigationItems.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`nav-btn ${currentView === item.id ? 'active' : ''} slide-in-left`}
                style={{animationDelay: `${0.05 * idx}s`}}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="sidebar-footer">
            <div className="profile-mini">
              <div className="avatar-circle animate-pulse-glow">{profile.name.charAt(0).toUpperCase()}</div>
              <div className="profile-info">
                <strong>{profile.name}</strong>
                <span>{profile.role}</span>
              </div>
            </div>
            <button className="logout-btn" onClick={handleLogout}>🚪 Log out</button>
          </div>
        </aside>

        {/* === MAIN CONTENT === */}
        <main className="main-content">
          <header className="topbar">
            <div>
              <p className="eyebrow">Document Intelligence</p>
              <h1 className="view-title animate-gradient-text">
                {currentView === 'upload' && '📤 Document Upload'}
                {currentView === 'summary' && '🧠 Smart Analysis'}
                {currentView === 'querylab' && '⚡ QueryLab'}
                {currentView === 'quiz' && '📝 Knowledge Check'}
                {currentView === 'profile' && '👤 User Settings'}
              </h1>
            </div>
            <div className="topbar-right">
              {documentId && (
                <div className="status-badge success animate-pulse-border">
                  <span className="dot"></span> Document Active
                </div>
              )}
              {uploadedFileName && documentId && (
                <div className="file-name-badge">{uploadedFileName}</div>
              )}
            </div>
          </header>

          <div className="view-container">
            
            {/* ===== UPLOAD VIEW ===== */}
            {currentView === 'upload' && (
              <div className="upload-view fade-in-up">
                <div className="hero-banner">
                  <div className="hero-content">
                    <h2>Transform PDFs into actionable knowledge.</h2>
                    <p>Drag & drop, browse, or import from Google Drive.</p>
                  </div>
                  <div className="hero-illustration animate-float">📄✨</div>
                </div>

                {/* Upload Mode Tabs */}
                <div className="upload-mode-tabs">
                  <button 
                    className={`mode-tab ${uploadMode === 'file' ? 'active' : ''}`}
                    onClick={() => setUploadMode('file')}
                  >📁 File Upload</button>
                  <button 
                    className={`mode-tab ${uploadMode === 'drive' ? 'active' : ''}`}
                    onClick={() => setUploadMode('drive')}
                  >☁️ Google Drive</button>
                </div>

                {uploadMode === 'file' ? (
                  <div
                    className={`drop-zone ${dragActive ? 'drag-active' : ''}`}
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFileUpload(e.dataTransfer.files?.[0]); }}
                  >
                    <div className="drop-icon animate-bounce">📥</div>
                    <h3>Drag & Drop your PDF here</h3>
                    <p className="text-muted">Maximum file size: 50MB</p>
                    <label className="primary-btn btn-shimmer">
                      {loading ? <span className="spinner"></span> : '📂 Browse Files'}
                      <input type="file" accept=".pdf" ref={fileInputRef} hidden onChange={(e) => handleFileUpload(e.target.files?.[0])} disabled={loading} />
                    </label>
                    {loading && <p className="loading-text animate-pulse-text">Processing document...</p>}
                  </div>
                ) : (
                  <div className="drive-upload-section fade-in-up">
                    <div className="drive-icon">☁️</div>
                    <h3>Import from Google Drive</h3>
                    <p className="text-muted">Paste a shareable Google Drive PDF link below</p>
                    <div className="drive-input-group">
                      <input
                        type="url"
                        placeholder="https://drive.google.com/file/d/..."
                        value={driveLink}
                        onChange={(e) => setDriveLink(e.target.value)}
                        disabled={loading}
                        className="drive-input"
                      />
                      <button className="primary-btn" onClick={handleDriveUpload} disabled={loading || !driveLink.trim()}>
                        {loading ? <span className="spinner"></span> : 'Import'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ===== SUMMARY VIEW ===== */}
            {currentView === 'summary' && (
              <div className="summary-view fade-in-up">
                <div className="panel full-width">
                  <div className="panel-header">
                    <h3>📋 Executive Summary</h3>
                    {documentId && <span className="badge">ID: {documentId.slice(0,8)}...</span>}
                  </div>
                  <div className="panel-body custom-scrollbar summary-body">
                    {summaryText ? (
                      <div className="prose fade-in">{summaryText}</div>
                    ) : (
                      <div className="empty-state">
                        <div className="empty-icon animate-float">✨</div>
                        <h4>Ready to analyze</h4>
                        <p>Generate a comprehensive summary of your uploaded document.</p>
                        <button className="primary-btn btn-shimmer" onClick={handleGenerateSummary} disabled={loading || !documentId}>
                          {loading ? <span className="spinner"></span> : '🚀 Generate Summary'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ===== QUERYLAB VIEW (Separate Chat) ===== */}
            {currentView === 'querylab' && (
              <div className="querylab-view fade-in-up">
                <div className="ql-header">
                  <div className="ql-header-left">
                    <h3>⚡ QueryLab</h3>
                    <p className="text-muted">Ask deep questions about your document</p>
                  </div>
                  <div className="ql-controls">
                    {documentId && (
                      <>
                        <select 
                          value={questionDifficulty} 
                          onChange={(e) => setQuestionDifficulty(e.target.value)} 
                          className="modern-select"
                        >
                          <option value="beginner">🟢 Beginner</option>
                          <option value="intermediate">🟡 Intermediate</option>
                          <option value="advanced">🔴 Advanced</option>
                        </select>
                        <button 
                          className="ghost-btn"
                          onClick={() => setShowHistory(!showHistory)}
                        >
                          {showHistory ? '✕ Close History' : '📜 History'}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="ql-layout">
                  {/* Suggested Questions Panel */}
                  <div className="ql-suggestions-panel">
                    <div className="panel-header">
                      <h4>💡 Suggested Questions</h4>
                      {suggestedQuestions.length > 0 && <span className="badge">{suggestedQuestions.length}</span>}
                    </div>
                    <div className="suggestions-body custom-scrollbar">
                      {!documentId ? (
                        <div className="empty-state small">
                          <p>Upload a document to see suggested questions.</p>
                        </div>
                      ) : suggestedQuestions.length === 0 ? (
                        <div className="empty-state small">
                          <p>Click "Generate" to get questions, or just type below.</p>
                          <button 
                            className="primary-btn small-btn" 
                            onClick={() => fetchSuggestedQuestions(documentId, questionDifficulty)}
                            disabled={loading}
                          >
                            {loading ? <span className="spinner"></span> : '🔄 Generate Questions'}
                          </button>
                        </div>
                      ) : (
                        <div className="suggestions-list">
                          {suggestedQuestions.map((q, idx) => (
                            <div 
                              key={idx} 
                              className="suggestion-chip slide-in-right"
                              style={{animationDelay: `${idx * 0.08}s`}}
                              onClick={() => handleSendSuggested(q)}
                            >
                              <span className="q-badge">Q{idx + 1}</span>
                              <span>{q.question_text || q}</span>
                              <span className="send-icon">➤</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Chat Panel */}
                  <div className="ql-chat-panel">
                    <div className="panel-header">
                      <h4>💬 Conversation</h4>
                      <span className="badge live">Live</span>
                    </div>
                    <div className="chat-messages custom-scrollbar">
                      {messages.length === 0 && (
                        <div className="empty-chat fade-in">
                          <div className="empty-icon">💭</div>
                          <p>Ask anything about your document.</p>
                          <div className="quick-prompts">
                            <span onClick={() => setInputMessage("What are the key takeaways?")}>📌 Key takeaways</span>
                            <span onClick={() => setInputMessage("Explain this simply.")}>🔍 Simplify this</span>
                            <span onClick={() => setInputMessage("List the main arguments.")}>📋 Main arguments</span>
                          </div>
                        </div>
                      )}
                      {messages.map((msg, idx) => (
                        <div key={idx} className={`message-wrapper ${msg.from} fade-in`} style={{animationDelay: '0.05s'}}>
                          <div className="avatar-tiny">{msg.from === 'user' ? 'U' : 'AI'}</div>
                          <div className="message-bubble">{msg.text}</div>
                        </div>
                      ))}
                      {loading && messages.length > 0 && (
                        <div className="typing-indicator"><span>.</span><span>.</span><span>.</span></div>
                      )}
                      <div ref={chatEndRef} />
                    </div>
                    <div className="chat-input-area">
                      <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                        placeholder="Type your question..."
                        disabled={loading || !documentId}
                      />
                      <button className="send-btn pulse-hover" onClick={handleSendChat} disabled={loading || !documentId || !inputMessage.trim()}>
                        ➤
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===== QUIZ VIEW ===== */}
            {currentView === 'quiz' && (
              <div className="quiz-view fade-in-up">
                <div className="panel full-width">
                  <div className="panel-header">
                    <h3>📝 Comprehension Assessment</h3>
                    <div className="quiz-controls">
                      <select value={quizDifficulty} onChange={(e) => setQuizDifficulty(e.target.value)} className="modern-select">
                        <option value="easy">🟢 Easy Level</option>
                        <option value="medium">🟡 Medium Level</option>
                        <option value="hard">🔴 Hard Level</option>
                      </select>
                      <select value={quizCount} onChange={(e) => setQuizCount(Number(e.target.value))} className="modern-select">
                        <option value={2}>2 Questions</option>
                        <option value={5}>5 Questions</option>
                        <option value={10}>10 Questions</option>
                      </select>
                      <button className="primary-btn btn-shimmer" onClick={() => handleGenerateQuiz(quizDifficulty)} disabled={loading || !documentId}>
                        {loading ? <span className="spinner"></span> : '🎯 Generate Quiz'}
                      </button>
                      {quizData && (
                        <button className="ghost-btn" onClick={handleResetQuiz}>🔄 New Quiz</button>
                      )}
                    </div>
                  </div>
                  
                  <div className="panel-body custom-scrollbar">
                    {!quizData ? (
                      <div className="empty-state">
                        <div className="empty-icon animate-float">🎯</div>
                        <h4>Test your knowledge</h4>
                        <p>Select difficulty, question count, then generate a quiz.</p>
                      </div>
                    ) : (
                      <>
                        {/* Score Results */}
                        {quizSubmitted && quizScore && (
                          <div className="quiz-score-card animate-scale-in">
                            <div className="score-ring">
                              <svg viewBox="0 0 120 120" className="score-svg">
                                <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                                <circle 
                                  cx="60" cy="60" r="52" fill="none" stroke="var(--primary-accent)" strokeWidth="8"
                                  strokeLinecap="round"
                                  strokeDasharray={`${(quizScore.percentage / 100) * 327} 327`}
                                  transform="rotate(-90 60 60)"
                                  className="score-arc"
                                />
                              </svg>
                              <div className="score-text">
                                <span className="score-pct">{quizScore.percentage}%</span>
                                <span className="score-frac">{quizScore.correct}/{quizScore.total}</span>
                              </div>
                            </div>
                            <div className="score-details">
                              <h4>
                                {quizScore.percentage >= 80 ? '🌟 Excellent!' : 
                                 quizScore.percentage >= 60 ? '👍 Good Job!' : 
                                 '📚 Keep Practicing!'}
                              </h4>
                              <p>You answered {quizScore.correct} out of {quizScore.total} questions correctly.</p>
                              {quizScore.incorrect && quizScore.incorrect.length > 0 && (
                                <div className="incorrect-list">
                                  <p className="text-muted" style={{marginTop: '0.5rem', fontSize: '0.85rem'}}>
                                    ✏️ Review incorrect answers below (highlighted in green)
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Progress Bar */}
                        <div className="quiz-progress-bar">
                          <div className="progress-track">
                            <div 
                              className="progress-fill" 
                              style={{width: `${(Object.keys(selectedAnswers).length / quizData.length) * 100}%`}}
                            ></div>
                          </div>
                          <span className="progress-text">{Object.keys(selectedAnswers).length}/{quizData.length} answered</span>
                        </div>

                        {/* Questions */}
                        <div className="quiz-container">
                          {quizData.map((q, i) => {
                            const selected = selectedAnswers[i];
                            const isAnswered = selected !== undefined;
                            return (
                              <div key={i} className={`quiz-card slide-in-right ${isAnswered ? 'answered' : ''} ${quizSubmitted ? 'submitted' : ''}`} style={{animationDelay: `${i * 0.08}s`}}>
                                <h4 className="question-text">
                                  <span className="q-num">Q{i+1}.</span> {q.question_text || q.question}
                                </h4>
                                <div className="options-grid">
                                  {q.options?.map((opt, optIdx) => {
                                    const isSelected = selected === opt;
                                    return (
                                      <label 
                                        key={optIdx} 
                                        className={`option-label ${isSelected ? 'selected' : ''} ${quizSubmitted && isSelected ? 'correct-highlight' : ''}`}
                                        onClick={() => handleSelectAnswer(i, opt)}
                                      >
                                        <input 
                                          type="radio" 
                                          name={`question-${i}`} 
                                          checked={isSelected}
                                          onChange={() => handleSelectAnswer(i, opt)}
                                          disabled={quizSubmitted}
                                        />
                                        <span className="option-box">
                                          {isSelected && <span className="check-mark">✓</span>}
                                          {opt}
                                        </span>
                                      </label>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Submit Button */}
                        {!quizSubmitted && quizData.length > 0 && (
                          <div className="quiz-actions">
                            <button 
                              className="primary-btn pulse-hover submit-btn" 
                              onClick={handleSubmitQuiz}
                            >
                              📤 Submit Quiz
                            </button>
                            <span className="text-muted">
                              {Object.keys(selectedAnswers).length}/{quizData.length} answered
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ===== PROFILE VIEW ===== */}
            {currentView === 'profile' && (
              <div className="profile-view fade-in-up">
                <div className="panel full-width profile-layout">
                  <div className="profile-hero">
                    <div className="avatar-massive animate-pulse-glow">{profile.name.charAt(0).toUpperCase()}</div>
                    <h2>{profile.name}</h2>
                    <p className="text-muted">{profile.email}</p>
                    <span className="role-badge">{profile.role}</span>
                    {!editingProfile && (
                      <button className="primary-btn edit-btn" onClick={startEditing}>✏️ Edit Profile</button>
                    )}
                  </div>

                  {editingProfile ? (
                    <div className="profile-edit-form fade-in-up">
                      <h3>✏️ Edit Your Profile</h3>
                      <form onSubmit={handleProfileUpdate}>
                        <div className="input-group">
                          <label>Full Name</label>
                          <input 
                            type="text" 
                            value={editForm.name} 
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            placeholder="Your name"
                          />
                        </div>
                        <div className="input-group">
                          <label>Email Address</label>
                          <input 
                            type="email" 
                            value={editForm.email} 
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            placeholder="Your email"
                          />
                        </div>
                        <div className="edit-actions">
                          <button type="submit" className="primary-btn" disabled={loading}>
                            {loading ? <span className="spinner"></span> : '💾 Save Changes'}
                          </button>
                          <button type="button" className="ghost-btn" onClick={cancelEditing}>Cancel</button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div className="stats-grid">
                      <div className="stat-card hover-lift">
                        <span className="stat-value">{documentId ? '1' : '0'}</span>
                        <span className="stat-label">📄 Active Docs</span>
                      </div>
                      <div className="stat-card hover-lift">
                        <span className="stat-value">{messages.length}</span>
                        <span className="stat-label">💬 Chat Interactions</span>
                      </div>
                      <div className="stat-card hover-lift">
                        <span className="stat-value">{quizData ? quizData.length : '0'}</span>
                        <span className="stat-label">📝 Quiz Questions</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Toast Notification */}
      {toast.show && <div className={`toast-notification ${toast.type} slide-in-right`}>{toast.message}</div>}
    </div>
  );
}