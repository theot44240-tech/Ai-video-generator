import React, { useState, useEffect } from 'react';

const AIShortsCreator = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [videos, setVideos] = useState([]);
  const [scheduled, setScheduled] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [accounts, setAccounts] = useState({
    youtube: false,
    tiktok: false
  });

  // Tendances disponibles
  const topics = [
    { 
      id: 1, 
      title: "IA révolutionne tout en 2024", 
      category: "Tech", 
      viral: true, 
      views: "2.1M",
      type: "educational" 
    },
    { 
      id: 2, 
      title: "Recettes en 60 secondes", 
      category: "Food", 
      viral: true, 
      views: "1.8M",
      type: "fun" 
    },
    { 
      id: 3, 
      title: "Astuces productivité", 
      category: "Tips", 
      viral: false, 
      views: "890K",
      type: "educational" 
    },
    { 
      id: 4, 
      title: "Danse virale TikTok", 
      category: "Dance", 
      viral: true, 
      views: "3.2M",
      type: "fun" 
    },
    { 
      id: 5, 
      title: "Life hacks géniaux", 
      category: "Lifestyle", 
      viral: true, 
      views: "2.5M",
      type: "fun" 
    }
  ];

  // Chargement initial
  useEffect(() => {
    const saved = localStorage.getItem('aiShortsData');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setVideos(data.videos || []);
        setScheduled(data.scheduled || []);
        setAccounts(data.accounts || { youtube: false, tiktok: false });
      } catch (e) {
        console.log('Données corrompues, reset');
      }
    }
  }, []);

  // Sauvegarde
  useEffect(() => {
    localStorage.setItem('aiShortsData', JSON.stringify({
      videos,
      scheduled,
      accounts
    }));
  }, [videos, scheduled, accounts]);

  // Ajouter notification
  const addNotif = (title, message) => {
    setNotifications(prev => [{
      id: Date.now(),
      title,
      message,
      time: 'maintenant'
    }, ...prev.slice(0, 4)]);
  };

  // Connecter compte
  const connect = (platform) => {
    setAccounts(prev => ({ ...prev, [platform]: true }));
    addNotif(`${platform} connecté !`, 'Prêt à publier');
  };

  // Sélectionner sujet
  const toggleTopic = (topic) => {
    setSelectedTopics(prev => {
      const exists = prev.find(t => t.id === topic.id);
      return exists 
        ? prev.filter(t => t.id !== topic.id)
        : [...prev, topic];
    });
  };

  // Générer vidéos
  const generate = () => {
    if (selectedTopics.length === 0) return;
    
    setGenerating(true);
    
    setTimeout(() => {
      const newVideos = selectedTopics.map(topic => ({
        id: Date.now() + Math.random(),
        title: topic.title,
        category: topic.category,
        type: topic.type,
        script: topic.type === 'educational' 
          ? `🎓 ${topic.title}\n\n✅ Point 1: Concept clé\n✅ Point 2: Application\n✅ Point 3: Résultat\n\n💡 Likez si utile !`
          : `🔥 ${topic.title}\n\n😱 Découverte incroyable\n🤯 Astuce secrète\n🎉 Résultat wow\n\n👆 Likez !`,
        hashtags: `#shorts #viral #${topic.category.toLowerCase()}`,
        thumbnail: `https://picsum.photos/300/400?random=${Math.random()}`,
        views: Math.floor(Math.random() * 50000) + 10000,
        created: new Date().toLocaleString()
      }));
      
      setVideos(prev => [...newVideos, ...prev]);
      setSelectedTopics([]);
      setGenerating(false);
      addNotif(`${newVideos.length} vidéo(s) créée(s) !`, 'Prêt à publier');
    }, 2500);
  };

  // Publier
  const publish = (video, platform) => {
    addNotif(`Publié sur ${platform} !`, `"${video.title}" est en ligne`);
  };

  // Programmer
  const schedule = () => {
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const ytChecked = document.getElementById('yt').checked;
    const ttChecked = document.getElementById('tt').checked;
    
    if (date && time && (ytChecked || ttChecked) && currentVideo) {
      const platforms = [];
      if (ytChecked) platforms.push('YouTube');
      if (ttChecked) platforms.push('TikTok');
      
      setScheduled(prev => [...prev, {
        id: Date.now(),
        video: currentVideo,
        datetime: `${date} ${time}`,
        platforms: platforms.join(' + ')
      }]);
      
      setShowModal(false);
      addNotif('Programmé !', `"${currentVideo.title}" sera publié automatiquement`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      
      {/* Header */}
      <div className="bg-black/20 p-4 border-b border-white/10 sticky top-0 z-40">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-pink-500 rounded-xl flex items-center justify-center font-bold text-black">
              AI
            </div>
            <h1 className="text-xl font-bold">Shorts Creator</h1>
          </div>
          
          <div className="relative">
            <button className="p-2 hover:bg-white/10 rounded-lg">
              🔔
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="pb-20">
        
        {/* HOME */}
        {activeTab === 'home' && (
          <div className="p-4 space-y-6">
            <div className="text-center py-8">
              <h2 className="text-3xl font-bold mb-2">Salut ! 👋</h2>
              <p className="text-gray-300">Créez du contenu viral avec l'IA</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{videos.length}</div>
                <div className="text-sm text-gray-400">Vidéos créées</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">{scheduled.length}</div>
                <div className="text-sm text-gray-400">Programmées</div>
              </div>
            </div>

            <div className="bg-white/10 rounded-xl p-6">
              <h3 className="font-bold text-lg mb-4">🚀 Actions rapides</h3>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setActiveTab('create')}
                  className="bg-gradient-to-r from-yellow-400 to-pink-500 text-black p-4 rounded-xl font-bold text-center"
                >
                  ⚡<br/>Créer
                </button>
                <button 
                  onClick={() => setActiveTab('videos')}
                  className="bg-blue-500 p-4 rounded-xl font-bold text-center"
                >
                  📹<br/>Mes vidéos
                </button>
              </div>
            </div>

            <div className="bg-white/10 rounded-xl p-6">
              <h3 className="font-bold text-lg mb-4">📱 Comptes</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>📺 YouTube</span>
                  <span className={`px-3 py-1 rounded-full text-sm ${accounts.youtube ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {accounts.youtube ? '✅ Connecté' : '❌ Déconnecté'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>🎵 TikTok</span>
                  <span className={`px-3 py-1 rounded-full text-sm ${accounts.tiktok ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {accounts.tiktok ? '✅ Connecté' : '❌ Déconnecté'}
                  </span>
                </div>
              </div>
              {(!accounts.youtube || !accounts.tiktok) && (
                <button 
                  onClick={() => setActiveTab('accounts')}
                  className="w-full mt-4 bg-blue-500 py-2 rounded-lg"
                >
                  Connecter comptes
                </button>
              )}
            </div>
          </div>
        )}

        {/* CREATE */}
        {activeTab === 'create' && (
          <div className="p-4 space-y-6">
            <h2 className="text-2xl font-bold">🔥 Créer du contenu</h2>
            
            <input
              type="text"
              placeholder="🔍 Rechercher..."
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400"
            />

            <div className="space-y-4">
              {topics.map(topic => (
                <div
                  key={topic.id}
                  onClick={() => toggleTopic(topic)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedTopics.some(t => t.id === topic.id)
                      ? 'border-yellow-400 bg-yellow-400/10'
                      : 'border-white/20 bg-white/10'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-lg">{topic.title}</h3>
                        {topic.viral && (
                          <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                            🔥 VIRAL
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-300">
                        <span>📂 {topic.category}</span>
                        <span>👁️ {topic.views}</span>
                      </div>
                    </div>
                    {selectedTopics.some(t => t.id === topic.id) && (
                      <span className="text-yellow-400 text-xl">✓</span>
                    )}
                  </div>
                  
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    topic.type === 'educational' 
                      ? 'bg-blue-500/20 text-blue-300' 
                      : 'bg-pink-500/20 text-pink-300'
                  }`}>
                    {topic.type === 'educational' ? '📚 Éducatif' : '🎭 Divertissement'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIDEOS */}
        {activeTab === 'videos' && (
          <div className="p-4 space-y-6">
            <h2 className="text-2xl font-bold">📹 Mes vidéos ({videos.length})</h2>
            
            {videos.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <div className="text-6xl mb-4">📹</div>
                <h3 className="text-xl font-bold mb-2">Aucune vidéo</h3>
                <p className="mb-6">Créez votre première vidéo !</p>
                <button 
                  onClick={() => setActiveTab('create')}
                  className="bg-gradient-to-r from-yellow-400 to-pink-500 text-black px-6 py-3 rounded-xl font-bold"
                >
                  Commencer
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {videos.map(video => (
                  <div key={video.id} className="bg-white/10 rounded-xl border border-white/20 overflow-hidden">
                    <div className="flex">
                      <div className="w-24 h-32 bg-gray-800 flex-shrink-0">
                        <img 
                          src={video.thumbnail} 
                          className="w-full h-full object-cover"
                          alt={video.title}
                        />
                      </div>
                      
                      <div className="flex-1 p-4">
                        <h3 className="font-bold mb-2">{video.title}</h3>
                        <div className="flex items-center gap-3 text-xs text-gray-300 mb-3">
                          <span className="bg-gray-700 px-2 py-1 rounded">{video.category}</span>
                          <span>👁️ {Math.floor(video.views/1000)}K vues</span>
                          <span className="text-green-400">✨ Prêt</span>
                        </div>
                        
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              setCurrentVideo(video);
                              setShowModal(true);
                            }}
                            className="flex-1 bg-blue-500 px-3 py-2 rounded-lg text-sm font-bold"
                          >
                            📅 Programmer
                          </button>
                          {accounts.youtube && (
                            <button 
                              onClick={() => publish(video, 'YouTube')}
                              className="bg-red-500 px-3 py-2 rounded-lg text-sm"
                            >
                              📺
                            </button>
                          )}
                          {accounts.tiktok && (
                            <button 
                              onClick={() => publish(video, 'TikTok')}
                              className="bg-pink-500 px-3 py-2 rounded-lg text-sm"
                            >
                              🎵
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SCHEDULE */}
        {activeTab === 'schedule' && (
          <div className="p-4 space-y-6">
            <h2 className="text-2xl font-bold">📅 Programmation ({scheduled.length})</h2>
            
            {scheduled.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-xl font-bold mb-2">Aucune programmation</h3>
                <p className="mb-6">Programmez vos publications !</p>
                <button 
                  onClick={() => setActiveTab('videos')}
                  className="bg-blue-500 px-6 py-3 rounded-xl font-bold"
                >
                  Voir mes vidéos
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {scheduled.map(item => (
                  <div key={item.id} className="bg-white/10 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <img 
                        src={item.video.thumbnail} 
                        className="w-16 h-20 object-cover rounded-lg"
                        alt={item.video.title}
                      />
                      <div className="flex-1">
                        <h3 className="font-bold mb-1">{item.video.title}</h3>
                        <div className="text-sm text-gray-300 space-y-1">
                          <div>📅 {item.datetime}</div>
                          <div>📱 {item.platforms}</div>
                        </div>
                        <span className="inline-block mt-2 px-3 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">
                          Programmé
                        </span>
                      </div>
                      <button 
                        onClick={() => setScheduled(prev => prev.filter(p => p.id !== item.id))}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ACCOUNTS */}
        {activeTab === 'accounts' && (
          <div className="p-4 space-y-6">
            <h2 className="text-2xl font-bold">🔐 Mes comptes</h2>
            
            <div className="space-y-4">
              <div className="bg-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">📺</span>
                  <h3 className="text-xl font-bold">YouTube</h3>
                </div>
                
                {accounts.youtube ? (
                  <div className="space-y-3">
                    <div className="text-green-400">✅ Connecté avec succès !</div>
                    <div className="bg-black/20 rounded-lg p-3">
                      <div>Chaîne: Ma Chaîne YouTube</div>
                      <div>Abonnés: 15.2K</div>
                    </div>
                    <button
                      onClick={() => setAccounts(prev => ({...prev, youtube: false}))}
                      className="w-full bg-red-500 py-2 rounded-lg"
                    >
                      Déconnecter
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-gray-300">Connectez YouTube pour publier automatiquement.</p>
                    <button
                      onClick={() => connect('youtube')}
                      className="w-full bg-red-500 py-2 rounded-lg font-bold"
                    >
                      🔑 Connecter YouTube
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">🎵</span>
                  <h3 className="text-xl font-bold">TikTok</h3>
                </div>
                
                {accounts.tiktok ? (
                  <div className="space-y-3">
                    <div className="text-green-400">✅ Connecté avec succès !</div>
                    <div className="bg-black/20 rounded-lg p-3">
                      <div>Nom: Mon TikTok</div>
                      <div>Abonnés: 8.7K</div>
                    </div>
                    <button
                      onClick={() => setAccounts(prev => ({...prev, tiktok: false}))}
                      className="w-full bg-red-500 py-2 rounded-lg"
                    >
                      Déconnecter
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-gray-300">Connectez TikTok pour publier automatiquement.</p>
                    <button
                      onClick={() => connect('tiktok')}
                      className="w-full bg-pink-500 py-2 rounded-lg font-bold"
                    >
                      🔑 Connecter TikTok
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bouton génération flottant */}
      {selectedTopics.length > 0 && (
        <div className="fixed bottom-20 right-4">
          <button
            onClick={generate}
            disabled={generating}
            className="bg-gradient-to-r from-yellow-400 to-pink-500 text-black px-6 py-4 rounded-full font-bold shadow-lg hover:scale-105 transition-all disabled:opacity-50"
          >
            {generating ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin w-5 h-5 border-2 border-black border-t-transparent rounded-full"></div>
                Génération...
              </div>
            ) : (
              `⚡ Générer (${selectedTopics.length})`
            )}
          </button>
        </div>
      )}

      {/* Navigation bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/30 backdrop-blur-sm border-t border-white/10 px-4 py-2">
        <div className="flex justify-around">
          {[
            { id: 'home', icon: '🏠', label: 'Accueil' },
            { id: 'create', icon: '⚡', label: 'Créer' },
            { id: 'videos', icon: '📹', label: 'Videos' },
            { id: 'schedule', icon: '📅', label: 'Planning' },
            { id: 'accounts', icon: '👤', label: 'Comptes' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all ${
                activeTab === tab.id ? 'text-white bg-white/20' : 'text-gray-400'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className="text-xs mt-1">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Modal programmation */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-end justify-center z-50">
          <div className="bg-gray-900 rounded-t-2xl w-full max-h-[80vh] p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">📅 Programmer</h3>
              <button onClick={() => setShowModal(false)} className="text-2xl">❌</button>
            </div>
            
            {currentVideo && (
              <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl mb-6">
                <img src={currentVideo.thumbnail} className="w-12 h-16 object-cover rounded-lg" alt="" />
                <div>
                  <h4 className="font-bold">{currentVideo.title}</h4>
                  <p className="text-sm text-gray-400">Prêt à programmer</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block font-bold mb-2">📱 Plateformes</label>
                <div className="space-y-2">
                  {accounts.youtube && (
                    <label className="flex items-center gap-3 p-3 bg-white/10 rounded-xl">
                      <input type="checkbox" id="yt" className="w-4 h-4" />
                      <span className="text-xl">📺</span>
                      <span>YouTube</span>
                    </label>
                  )}
                  {accounts.tiktok && (
                    <label className="flex items-center gap-3 p-3 bg-white/10 rounded-xl">
                      <input type="checkbox" id="tt" className="w-4 h-4" />
                      <span className="text-xl">🎵</span>
                      <span>TikTok</span>
                    </label>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-2">📅 Date</label>
                  <input
                    type="date"
                    id="date"
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-2">🕐 Heure</label>
                  <input
                    type="time"
                    id="time"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                  />
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <h4 className="font-bold text-blue-300 mb-2">💡 Conseils</h4>
                <div className="text-sm space-y-1">
                  <div>📺 YouTube: 15h-18h et 20h-22h</div>
                  <div>🎵 TikTok: 18h-21h (Mar, Jeu, Dim)</div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={schedule}
                  className="flex-1 bg-green-500 py-4 rounded-xl font-bold"
                >
                  ✅ Programmer
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-gray-600 px-6 py-4 rounded-xl font-bold"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications toast */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50">
          {notifications.slice(0, 1).map(notif => (
            <div key={notif.id} className="bg-black/90 text-white p-4 rounded-xl border border-white/20 max-w-sm animate-slide-in-right">
              <h4 className="font-bold text-sm">{notif.title}</h4>
              <p className="text-xs text-gray-300">{notif.message}</p>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AIShortsCreator;
