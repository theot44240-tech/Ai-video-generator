import React, { useState, useEffect } from 'react';
import { Play, Upload, Settings, TrendingUp, BookOpen, Smile, Calendar, Eye, Youtube, Music2, Link, Check, X, Edit3, Download, AlertCircle, Key, Shield, Clock, Plus, Trash2, Send, BarChart3, Zap, Star, Filter } from 'lucide-react';

const AIVideosGenerator = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [showScheduleModal, setShowScheduleModal] = useState(null);
  const [connectedAccounts, setConnectedAccounts] = useState({
    youtube: {
      connected: false,
      username: null,
      channelName: null,
      subscribers: null,
      accessToken: null
    },
    tiktok: {
      connected: false,
      username: null,
      displayName: null,
      followers: null,
      accessToken: null
    }
  });

  // Configuration OAuth
  const OAUTH_CONFIG = {
    youtube: {
      clientId: 'VOTRE_YOUTUBE_CLIENT_ID.apps.googleusercontent.com',
      redirectUri: window.location.origin + '/auth/youtube/callback',
      scope: 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly',
      authUrl: 'https://accounts.google.com/oauth2/auth'
    },
    tiktok: {
      clientId: 'VOTRE_TIKTOK_CLIENT_ID',
      redirectUri: window.location.origin + '/auth/tiktok/callback',
      scope: 'video.upload,user.info.basic',
      authUrl: 'https://www.tiktok.com/auth/authorize/'
    }
  };

  // Données d'exemple enrichies
  const [trendingTopics] = useState([
    { id: 1, topic: 'Intelligence Artificielle 2024', category: 'Tech', engagement: '95%', type: 'éducatif', difficulty: 'Facile', trend: '+12%' },
    { id: 2, topic: 'Recettes 5 minutes', category: 'Lifestyle', engagement: '89%', type: 'divertissement', difficulty: 'Très facile', trend: '+8%' },
    { id: 3, topic: 'Productivité étudiants', category: 'Education', engagement: '92%', type: 'éducatif', difficulty: 'Moyen', trend: '+15%' },
    { id: 4, topic: 'Fails compilation', category: 'Humour', engagement: '87%', type: 'divertissement', difficulty: 'Facile', trend: '+5%' },
    { id: 5, topic: 'Économiser argent', category: 'Finance', engagement: '91%', type: 'éducatif', difficulty: 'Moyen', trend: '+18%' },
    { id: 6, topic: 'Danses virales 2024', category: 'Danse', engagement: '94%', type: 'divertissement', difficulty: 'Difficile', trend: '+22%' }
  ]);

  const [analytics] = useState({
    totalViews: '2.4M',
    totalLikes: '185K',
    totalShares: '42K',
    engagementRate: '8.7%',
    weeklyGrowth: '+23%'
  });

  useEffect(() => {
    // Simulation de données programmées existantes
    setScheduledPosts([
      { 
        id: 1, 
        content: { topic: '5 Astuces IA pour étudiants', type: 'éducatif' },
        platforms: ['youtube', 'tiktok'], 
        scheduledTime: '2024-01-15T14:00:00', 
        status: 'scheduled',
        estimatedReach: '12K-18K'
      },
      { 
        id: 2, 
        content: { topic: 'Pourquoi les chats font ça ?', type: 'divertissement' },
        platforms: ['tiktok'], 
        scheduledTime: '2024-01-15T16:30:00', 
        status: 'publishing',
        estimatedReach: '8K-15K'
      }
    ]);
  }, []);

  // Authentification functions (simplified for demo)
  const initiateAuth = (platform) => {
    // Simulation de connexion réussie
    setTimeout(() => {
      setConnectedAccounts(prev => ({
        ...prev,
        [platform]: {
          connected: true,
          username: platform === 'youtube' ? '@MonChannel' : '@MonTikTok',
          channelName: platform === 'youtube' ? 'Mon Super Channel' : null,
          displayName: platform === 'tiktok' ? 'Mon TikTok' : null,
          subscribers: platform === 'youtube' ? '15.2K' : null,
          followers: platform === 'tiktok' ? '8.7K' : null,
          accessToken: 'demo_token_' + platform
        }
      }));
    }, 2000);
  };

  const disconnectAccount = (platform) => {
    setConnectedAccounts(prev => ({
      ...prev,
      [platform]: {
        connected: false,
        username: null,
        channelName: null,
        displayName: null,
        subscribers: null,
        followers: null,
        accessToken: null
      }
    }));
  };

  const generateContent = async (topics) => {
    setIsGenerating(true);
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const newContent = topics.map((topic, index) => ({
      id: Date.now() + index,
      topic: topic.topic,
      type: topic.type,
      category: topic.category,
      difficulty: topic.difficulty,
      script: topic.type === 'éducatif' ? 
        `🎓 ${topic.topic} : Ce que vous devez savoir !\n\n✅ Point clé 1: Concept principal expliqué simplement\n✅ Point clé 2: Application pratique immédiate\n✅ Point clé 3: Résultats que vous obtiendrez\n\n💡 Action: Commencez dès maintenant et likez si c'est utile !` :
        `😂 ${topic.topic} - Vous allez mourir de rire !\n\n🔥 Situation hilarante du quotidien\n🎭 Twist complètement inattendu\n🤣 Chute qui va vous surprendre\n\n👆 Likez si vous avez déjà vécu ça ! 😭`,
      hashtags: topic.type === 'éducatif' ? 
        '#education #tips #motivation #shorts #apprendre #conseil' : 
        '#funny #viral #entertainment #shorts #humour #mdr',
      duration: '45-60s',
      engagement: topic.engagement,
      thumbnail: `https://via.placeholder.com/300x400/${topic.type === 'éducatif' ? '4f46e5' : 'ec4899'}/ffffff?text=${encodeURIComponent(topic.topic.slice(0, 20))}`,
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      voiceover: topic.type === 'éducatif' ? 'Voix claire et pédagogique' : 'Voix énergique et fun',
      music: topic.type === 'éducatif' ? 'Musique motivante douce' : 'Beat tendance 2024',
      estimatedViews: Math.floor(Math.random() * 50000) + 10000
    }));
    
    setGeneratedContent(prev => [...prev, ...newContent]);
    setIsGenerating(false);
    setSelectedTopics([]);
  };

  const scheduleContent = (content, platforms, scheduledTime) => {
    const newScheduledPost = {
      id: Date.now(),
      content: content,
      platforms: platforms,
      scheduledTime: scheduledTime,
      status: 'scheduled',
      estimatedReach: `${Math.floor(content.estimatedViews * 0.6 / 1000)}K-${Math.floor(content.estimatedViews * 1.2 / 1000)}K`
    };

    setScheduledPosts(prev => [...prev, newScheduledPost]);
    setShowScheduleModal(null);
  };

  const deleteScheduledPost = (id) => {
    setScheduledPosts(prev => prev.filter(post => post.id !== id));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'publishing': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'published': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'failed': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'scheduled': return 'Programmé';
      case 'publishing': return 'En cours...';
      case 'published': return 'Publié';
      case 'failed': return 'Échec';
      default: return 'Inconnu';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header amélioré */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
            🚀 AI Shorts Creator Pro
          </h1>
          <p className="text-lg text-gray-300">Automatisez votre succès sur YouTube & TikTok</p>
          
          {/* Quick stats */}
          <div className="flex justify-center space-x-6 mt-4 text-sm">
            <div className="text-center">
              <div className="font-bold text-green-400">{analytics.totalViews}</div>
              <div className="text-gray-400">Vues totales</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-pink-400">{analytics.engagementRate}</div>
              <div className="text-gray-400">Engagement</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-blue-400">{analytics.weeklyGrowth}</div>
              <div className="text-gray-400">Croissance</div>
            </div>
          </div>
        </div>

        {/* Navigation améliorée */}
        <div className="flex flex-wrap justify-center gap-1 mb-8 bg-white/10 p-1 rounded-lg backdrop-blur-sm">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'accounts', label: 'Comptes', icon: Shield },
            { id: 'trends', label: 'Tendances', icon: TrendingUp },
            { id: 'generate', label: 'Contenu', icon: Zap },
            { id: 'schedule', label: 'Programmation', icon: Calendar }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-3 md:px-4 py-2 rounded-md transition-all text-sm ${
                activeTab === tab.id 
                  ? 'bg-white text-purple-900 font-medium shadow-lg' 
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon size={16} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">📊 Vue d'ensemble</h2>
            
            {/* Status cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-green-500/20 rounded-lg">
                    <Check className="text-green-400" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Comptes connectés</h3>
                    <p className="text-gray-300">
                      {Object.values(connectedAccounts).filter(acc => acc.connected).length}/2 plateformes
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <Play className="text-blue-400" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Contenus générés</h3>
                    <p className="text-gray-300">{generatedContent.length} vidéos prêtes</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-purple-500/20 rounded-lg">
                    <Calendar className="text-purple-400" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Publications programmées</h3>
                    <p className="text-gray-300">{scheduledPosts.length} en attente</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <h3 className="font-bold text-xl mb-4">🚀 Actions rapides</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button 
                  onClick={() => setActiveTab('trends')}
                  className="bg-gradient-to-r from-yellow-400 to-pink-500 text-black px-4 py-3 rounded-lg font-semibold hover:scale-105 transition-transform"
                >
                  Générer contenu
                </button>
                <button 
                  onClick={() => setActiveTab('schedule')}
                  className="bg-blue-500 hover:bg-blue-600 px-4 py-3 rounded-lg font-semibold transition-colors"
                >
                  Programmer post
                </button>
                <button 
                  onClick={() => setActiveTab('accounts')}
                  className="bg-green-500 hover:bg-green-600 px-4 py-3 rounded-lg font-semibold transition-colors"
                >
                  Connecter compte
                </button>
                <button className="bg-purple-500 hover:bg-purple-600 px-4 py-3 rounded-lg font-semibold transition-colors">
                  Voir analytics
                </button>
              </div>
            </div>

            {/* Recent activity */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <h3 className="font-bold text-xl mb-4">📈 Activité récente</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-black/20 rounded-lg">
                  <div className="p-2 bg-green-500/20 rounded-full">
                    <Upload className="text-green-400" size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">Vidéo "IA 2024" publiée</p>
                    <p className="text-sm text-gray-400">YouTube • il y a 2h • 1.2K vues</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-black/20 rounded-lg">
                  <div className="p-2 bg-blue-500/20 rounded-full">
                    <Clock className="text-blue-400" size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">5 vidéos programmées</p>
                    <p className="text-sm text-gray-400">Publication prévue cette semaine</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Accounts Tab */}
        {activeTab === 'accounts' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">🔐 Gestion des comptes</h2>
            
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="text-blue-400 mt-1" size={20} />
                <div>
                  <h3 className="font-semibold text-blue-300">Mode démonstration</h3>
                  <p className="text-blue-100 text-sm mt-1">
                    Cliquez sur "Connecter" pour simuler la connexion. En production, cela utilisera OAuth réel.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* YouTube */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="flex items-center space-x-3 mb-4">
                  <Youtube className="text-red-500" size={32} />
                  <h3 className="text-xl font-bold">YouTube</h3>
                </div>
                
                {connectedAccounts.youtube.connected ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-green-400">
                      <Check size={20} />
                      <span className="font-semibold">Connecté avec succès !</span>
                    </div>
                    <div className="bg-black/20 rounded-lg p-3 space-y-2">
                      <div><span className="font-semibold">Chaîne:</span> {connectedAccounts.youtube.channelName}</div>
                      <div><span className="font-semibold">Abonnés:</span> {connectedAccounts.youtube.subscribers}</div>
                      <div><span className="font-semibold">ID:</span> {connectedAccounts.youtube.username}</div>
                    </div>
                    <button
                      onClick={() => disconnectAccount('youtube')}
                      className="w-full bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors"
                    >
                      Déconnecter
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-gray-300 text-sm">
                      Connectez votre chaîne YouTube pour publier automatiquement.
                    </p>
                    <button
                      onClick={() => initiateAuth('youtube')}
                      className="w-full bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                      <Key size={20} />
                      <span>Connecter YouTube</span>
                    </button>
                  </div>
                )}
              </div>

              {/* TikTok */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="flex items-center space-x-3 mb-4">
                  <Music2 className="text-pink-500" size={32} />
                  <h3 className="text-xl font-bold">TikTok</h3>
                </div>
                
                {connectedAccounts.tiktok.connected ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-green-400">
                      <Check size={20} />
                      <span className="font-semibold">Connecté avec succès !</span>
                    </div>
                    <div className="bg-black/20 rounded-lg p-3 space-y-2">
                      <div><span className="font-semibold">Nom:</span> {connectedAccounts.tiktok.displayName}</div>
                      <div><span className="font-semibold">Abonnés:</span> {connectedAccounts.tiktok.followers}</div>
                      <div><span className="font-semibold">ID:</span> {connectedAccounts.tiktok.username}</div>
                    </div>
                    <button
                      onClick={() => disconnectAccount('tiktok')}
                      className="w-full bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors"
                    >
                      Déconnecter
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-gray-300 text-sm">
                      Connectez votre compte TikTok pour publier automatiquement.
                    </p>
                    <button
                      onClick={() => initiateAuth('tiktok')}
                      className="w-full bg-pink-500 hover:bg-pink-600 px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                      <Key size={20} />
                      <span>Connecter TikTok</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Trending Topics Tab amélioré */}
        {activeTab === 'trends' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">🔥 Tendances actuelles</h2>
              <div className="flex items-center space-x-3">
                <button className="bg-white/10 px-3 py-1 rounded-lg text-sm hover:bg-white/20 transition-colors">
                  <Filter size={16} className="inline mr-1" />
                  Filtrer
                </button>
                <div className="text-sm text-gray-300">Mis à jour il y a 3 min</div>
              </div>
            </div>

            {!connectedAccounts.youtube.connected && !connectedAccounts.tiktok.connected && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <p className="text-yellow-300">⚠️ Connectez au moins un compte pour générer du contenu.</p>
              </div>
            )}

            <div className="grid gap-4">
              {trendingTopics.map((topic) => (
                <div
                  key={topic.id}
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer hover:shadow-lg ${
                    selectedTopics.find(t => t.id === topic.id)
                      ? 'border-yellow-400 bg-yellow-400/10 shadow-yellow-400/20'
                      : 'border-white/20 bg-white/10 hover:bg-white/15 hover:border-white/30'
                  } backdrop-blur-sm`}
                  onClick={() => setSelectedTopics(prev => 
                    prev.find(t => t.id === topic.id) 
                      ? prev.filter(t => t.id !== topic.id)
                      : [...prev, topic]
                  )}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg">{topic.topic}</h3>
                    <div className="flex items-center space-x-2">
                      {topic.type === 'éducatif' ? 
                        <BookOpen className="text-blue-400" size={16} /> : 
                        <Smile className="text-pink-400" size={16} />
                      }
                      <span className="text-xs bg-green-500 px-2 py-1 rounded-full font-semibold">
                        {topic.engagement}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-300">
                    <span>📂 {topic.category}</span>
                    <span className="capitalize">🎯 {topic.type}</span>
                    <span>📊 {topic.difficulty}</span>
                    <span className="text-green-400">📈 {topic.trend}</span>
                  </div>
                </div>
              ))}
            </div>

            {selectedTopics.length > 0 && (connectedAccounts.youtube.connected || connectedAccounts.tiktok.connected) && (
              <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
                <div className="bg-gradient-to-r from-yellow-400 to-pink-500 text-black px-6 py-3 rounded-full shadow-xl flex items-center space-x-3">
                  <span className="font-bold">{selectedTopics.length} sélectionné{selectedTopics.length > 1 ? 's' : ''}</span>
                  <button
                    onClick={() => generateContent(selectedTopics)}
                    disabled={isGenerating}
                    className="bg-black/20 hover:bg-black/30 px-4 py-2 rounded-full font-bold transition-all disabled:opacity-50 flex items-center space-x-2"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent"></div>
                        <span>Génération...</span>
                      </>
                    ) : (
                      <>
                        <Zap size={16} />
                        <span>Générer</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Generated Content Tab amélioré */}
        {activeTab === 'generate' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">⚡ Contenu généré</h2>
              <div className="text-sm text-gray-300">{generatedContent.length} vidéo{generatedContent.length !== 1 ? 's' : ''}</div>
            </div>
            
            {generatedContent.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Zap size={64} className="mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">Aucun contenu généré</h3>
                <p className="mb-6">Sélectionnez des tendances et générez votre premier contenu viral !</p>
                <button 
                  onClick={() => setActiveTab('trends')}
                  className="bg-gradient-to-r from-yellow-400 to-pink-500 text-black px-6 py-3 rounded-lg font-bold hover:scale-105 transition-transform"
                >
                  Découvrir les tendances
                </button>
              </div>
            ) : (
              <div className="grid gap-6">
                {generatedContent.map((content) => (
                  <div key={content.id} className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden hover:border-white/30 transition-all">
                    <div className="flex flex-col md:flex-row">
                      <div className="w-full md:w-48 h-48 md:h-64 bg-gray-800 flex-shrink-0 relative group">
                        <img 
                          src={content.thumbnail} 
                          alt={content.topic}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button className="bg-white text-black px-4 py-2 rounded-full font-semibold hover:scale-105 transition-transform">
                            <Eye className="inline mr-2" size={16} />
                            Aperçu
                          </button>
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {content.duration}
                        </div>
                        <div className="absolute top-2 left-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            content.type === 'éducatif' ? 'bg-blue-500' : 'bg-pink-500'
                          }`}>
                            {content.type}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex-1 p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-bold text-xl mb-2">{content.topic}</h3>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-300">
                              <span className="flex items-center space-x-1">
                                <Star className="text-yellow-400" size={14} />
                                <span>{content.engagement}</span>
                              </span>
                              <span>📂 {content.category}</span>
                              <span>📊 ~{(content.estimatedViews / 1000).toFixed(1)}K vues</span>
                              <span>🎵 {content.music}</span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => setShowScheduleModal(content)}
                              className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                            >
                              <Calendar size={16} />
                              <span className="hidden sm:inline">Programmer</span>
                            </button>
                          </div>
                        </div>
                        
                        <div className="bg-black/30 rounded-lg p-4 mb-4">
                          <h4 className="font-semibold mb-2 flex items-center">
                            <Edit3 size={16} className="mr-2" />
                            Script généré
                          </h4>
                          <div className="whitespace-pre-line text-gray-100 text-sm max-h-24 overflow-y-auto">
                            {content.script}
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center justify-between text-sm">
                          <div className="text-blue-300 mb-2 md:mb-0">
                            <span className="font-semibold">Hashtags:</span> {content.hashtags}
                          </div>
                          <div className="flex space-x-2">
                            {connectedAccounts.youtube.connected && (
                              <button className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-xs transition-colors">
                                <Youtube size={12} className="inline mr-1" />
                                Publier
                              </button>
                            )}
                            {connectedAccounts.tiktok.connected && (
                              <button className="bg-pink-500 hover:bg-pink-600 px-3 py-1 rounded text-xs transition-colors">
                                <Music2 size={12} className="inline mr-1" />
                                Publier
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Schedule Tab - Nouvelle interface complète */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">📅 Programmation de publications</h2>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-300">{scheduledPosts.length} publication{scheduledPosts.length !== 1 ? 's' : ''} programmée{scheduledPosts.length !== 1 ? 's' : ''}</span>
              </div>
            </div>

            {/* Calendrier rapide */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <h3 className="font-bold text-lg mb-4">📊 Planning de la semaine</h3>
              <div className="grid grid-cols-7 gap-2">
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, index) => (
                  <div key={day} className="text-center">
                    <div className="text-xs text-gray-400 mb-2">{day}</div>
                    <div className={`h-12 rounded-lg border-2 border-dashed flex items-center justify-center text-xs ${
                      scheduledPosts.some(post => new Date(post.scheduledTime).getDay() === (index + 1) % 7) 
                        ? 'border-blue-400 bg-blue-500/10 text-blue-300' 
                        : 'border-gray-600 text-gray-500'
                    }`}>
                      {scheduledPosts.filter(post => new Date(post.scheduledTime).getDay() === (index + 1) % 7).length || ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Liste des publications programmées */}
            <div className="space-y-4">
              {scheduledPosts.length === 0 ? (
                <div className="text-center py-12 text-gray-400 bg-white/5 rounded-lg border border-white/10">
                  <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Aucune publication programmée</h3>
                  <p className="mb-4">Programmez vos premiers contenus pour automatiser vos publications !</p>
                  <button 
                    onClick={() => setActiveTab('generate')}
                    className="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Voir le contenu généré
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {scheduledPosts
                    .sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime))
                    .map((post) => (
                    <div key={post.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:border-white/30 transition-all">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-bold text-lg">{post.content.topic}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(post.status)}`}>
                              {getStatusText(post.status)}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm text-gray-300">
                            <div>
                              <span className="font-semibold">📅 Date:</span>{' '}
                              {new Date(post.scheduledTime).toLocaleDateString('fr-FR')}
                            </div>
                            <div>
                              <span className="font-semibold">🕐 Heure:</span>{' '}
                              {new Date(post.scheduledTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div>
                              <span className="font-semibold">📱 Plateformes:</span>{' '}
                              {post.platforms.map(p => p === 'youtube' ? 'YT' : 'TT').join(' + ')}
                            </div>
                            <div>
                              <span className="font-semibold">📊 Portée est.:</span>{' '}
                              {post.estimatedReach}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button className="bg-yellow-500 hover:bg-yellow-600 p-2 rounded-lg transition-colors">
                            <Edit3 size={16} />
                          </button>
                          <button 
                            onClick={() => deleteScheduledPost(post.id)}
                            className="bg-red-500 hover:bg-red-600 p-2 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Conseils de programmation */}
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-4">
              <h3 className="font-bold text-purple-300 mb-2">💡 Conseils de programmation optimale</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
                <div>
                  <h4 className="font-semibold text-white mb-1">📺 YouTube Shorts:</h4>
                  <ul className="space-y-1">
                    <li>• Meilleure heure: 15h-18h et 20h-22h</li>
                    <li>• Jours optimaux: Mardi à Jeudi</li>
                    <li>• Éviter: Lundi matin et weekend soir</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">🎵 TikTok:</h4>
                  <ul className="space-y-1">
                    <li>• Meilleure heure: 18h-21h</li>
                    <li>• Jours optimaux: Mardi, Jeudi, Dimanche</li>
                    <li>• Éviter: Mercredi et Samedi matin</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de programmation */}
        {showScheduleModal && (
          <ScheduleModal 
            content={showScheduleModal}
            connectedAccounts={connectedAccounts}
            onSchedule={scheduleContent}
            onClose={() => setShowScheduleModal(null)}
          />
        )}
      </div>
    </div>
  );
};

// Composant Modal de programmation
const ScheduleModal = ({ content, connectedAccounts, onSchedule, onClose }) => {
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  const availablePlatforms = [
    { id: 'youtube', name: 'YouTube', connected: connectedAccounts.youtube.connected, icon: Youtube, color: 'bg-red-500' },
    { id: 'tiktok', name: 'TikTok', connected: connectedAccounts.tiktok.connected, icon: Music2, color: 'bg-pink-500' }
  ];

  const togglePlatform = (platformId) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handleSchedule = () => {
    if (selectedPlatforms.length > 0 && scheduledDate && scheduledTime) {
      const scheduledDateTime = `${scheduledDate}T${scheduledTime}:00`;
      onSchedule(content, selectedPlatforms, scheduledDateTime);
    }
  };

  // Date minimale = aujourd'hui
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold">📅 Programmer la publication</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Aperçu du contenu */}
          <div className="bg-white/5 rounded-lg p-4">
            <h3 className="font-bold mb-2">{content.topic}</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-300">
              <span className={`px-2 py-1 rounded-full ${content.type === 'éducatif' ? 'bg-blue-500/20 text-blue-300' : 'bg-pink-500/20 text-pink-300'}`}>
                {content.type}
              </span>
              <span>📊 ~{(content.estimatedViews / 1000).toFixed(1)}K vues prévues</span>
              <span>⏱️ {content.duration}</span>
            </div>
          </div>

          {/* Sélection des plateformes */}
          <div>
            <h4 className="font-semibold mb-3">📱 Choisir les plateformes :</h4>
            <div className="grid grid-cols-2 gap-3">
              {availablePlatforms.map(platform => (
                <label 
                  key={platform.id} 
                  className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    !platform.connected 
                      ? 'border-gray-600 bg-gray-800/50 opacity-50 cursor-not-allowed'
                      : selectedPlatforms.includes(platform.id)
                        ? 'border-blue-400 bg-blue-500/10'
                        : 'border-gray-600 bg-white/5 hover:border-gray-500'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedPlatforms.includes(platform.id)}
                    onChange={() => platform.connected && togglePlatform(platform.id)}
                    disabled={!platform.connected}
                    className="rounded"
                  />
                  <platform.icon className={platform.connected ? 'text-white' : 'text-gray-500'} size={20} />
                  <div>
                    <span className={platform.connected ? 'text-white' : 'text-gray-500'}>
                      {platform.name}
                    </span>
                    {!platform.connected && <div className="text-xs text-gray-500">Non connecté</div>}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Sélection de la date et heure */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-2">📅 Date de publication :</label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={today}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold mb-2">🕐 Heure de publication :</label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Créneaux recommandés */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h4 className="font-semibold text-blue-300 mb-2">⏰ Créneaux recommandés :</h4>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-semibold">YouTube :</span> 15h-18h, 20h-22h
              </div>
              <div>
                <span className="font-semibold">TikTok :</span> 18h-21h (Mar, Jeu, Dim)
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex space-x-3">
            <button
              onClick={handleSchedule}
              disabled={selectedPlatforms.length === 0 || !scheduledDate || !scheduledTime}
              className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
            >
              <Send size={20} />
              <span>Programmer la publication</span>
            </button>
            <button
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIVideosGenerator;
