import { useState, useEffect, useRef } from 'react';
import { DndContext, DragEndEvent, DragOverlay } from '@dnd-kit/core';
import { DraggableKey } from './components/DraggableKey';
import { Keyboard } from './components/Keyboard';

// GERÇEK TÜRKÇE Q KLAVYE DÜZENİ - 56 TUŞ
const keyboardLayout = [
  { keys: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '*', '-', 'Backspace'] },
  { keys: ['Tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Ğ', 'Ü'] },
  { keys: ['CapsLock', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ş', 'İ', 'Enter'] },
  { keys: ['LeftShift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Ö', 'Ç', '.', 'RightShift'] },
  { keys: ['LeftCtrl', 'Alt', 'Space', 'AltGr', 'RightCtrl'] }
];

const allKeys: string[] = keyboardLayout.flatMap(row => row.keys);

function shuffleArray(array: string[]): string[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function App() {
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const [showMainMenu, setShowMainMenu] = useState<boolean>(false);
  const [placedKeys, setPlacedKeys] = useState<Record<string, string>>({});
  const [remainingKeys, setRemainingKeys] = useState<string[]>(shuffleArray(allKeys));
  const [wrongAttempts, setWrongAttempts] = useState<number>(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);
  const [timer, setTimer] = useState<number>(0);
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);
  const [lastPenaltyTime, setLastPenaltyTime] = useState<number>(0);

  // SES REF'LERİ
  const correctSoundRef = useRef<HTMLAudioElement | null>(null);
  const wrongSoundRef = useRef<HTMLAudioElement | null>(null);

  const totalKeys = allKeys.length;
  const placedCount = Object.keys(placedKeys).length;
  const isCompleted = placedCount === totalKeys;

  // SES DOSYALARINI YÜK
  useEffect(() => {
    correctSoundRef.current = new Audio('/sounds/correct.mp3');
    wrongSoundRef.current = new Audio('/sounds/wrong.mp3');

    if (correctSoundRef.current) correctSoundRef.current.volume = 0.15;
    if (wrongSoundRef.current) wrongSoundRef.current.volume = 0.15;

    correctSoundRef.current.load();
    wrongSoundRef.current.load();
  }, []);

  // SES ÇALMA FONKSİYONLARI
  const playCorrectSound = () => {
    if (correctSoundRef.current) {
      correctSoundRef.current.currentTime = 0;
      correctSoundRef.current.play().catch(err => console.log('Ses çalınamadı:', err));
    }
  };

  const playWrongSound = () => {
    if (wrongSoundRef.current) {
      wrongSoundRef.current.currentTime = 0;
      wrongSoundRef.current.play().catch(err => console.log('Ses çalınamadı:', err));
    }
  };

  // TIMER EFFECT
  useEffect(() => {
    if (!gameStarted || isCompleted || showMainMenu) return;

    const interval = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [gameStarted, isCompleted, showMainMenu]);

  // HER 10 SANİYEDE -10 PUAN
  useEffect(() => {
    if (!gameStarted || isCompleted || showMainMenu) return;

    const currentTenSeconds = Math.floor(timer / 10);
    if (currentTenSeconds > lastPenaltyTime && timer > 0) {
      setScore(prevScore => prevScore - 10);
      setLastPenaltyTime(currentTenSeconds);
    }
  }, [timer, gameStarted, isCompleted, lastPenaltyTime, showMainMenu]);

  // Oyun başladığında timer'ı başlat
  useEffect(() => {
    if (gameStarted && !gameStartTime) {
      setGameStartTime(Date.now());
    }
  }, [gameStarted, gameStartTime]);

  function handleDragStart(event: any) {
    setActiveId(event.active.id);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const draggedChar = active.id as string;
    const targetSlotId = over.id as string;

    const parts = targetSlotId.split('-');
    if (parts.length !== 3) return;

    if (placedKeys[targetSlotId]) {
      setWrongAttempts(prev => prev + 1);
      setScore(prev => prev - 5);
      playWrongSound();
      return;
    }

    const rowIndex = parseInt(parts[1]);
    const colIndex = parseInt(parts[2]);
    const expectedChar = keyboardLayout[rowIndex].keys[colIndex];

    let isMatch = false;

    if (draggedChar.includes('Shift') && expectedChar.includes('Shift')) {
      isMatch = true;
    } else if (draggedChar.includes('Ctrl') && expectedChar.includes('Ctrl')) {
      isMatch = true;
    } else if (draggedChar === expectedChar) {
      isMatch = true;
    }

    if (isMatch) {
      setScore(prev => prev + 10);
      playCorrectSound();

      setPlacedKeys(prev => ({ ...prev, [targetSlotId]: draggedChar }));
      setRemainingKeys(prev => prev.filter(key => key !== draggedChar));
    } else {
      setWrongAttempts(prev => prev + 1);
      setScore(prev => prev - 5);
      playWrongSound();
    }
  }

  function handleDragCancel() {
    setActiveId(null);
  }

  function resetGame() {
    setPlacedKeys({});
    setRemainingKeys(shuffleArray(allKeys));
    setWrongAttempts(0);
    setScore(0);
    setTimer(0);
    setGameStartTime(null);
    setActiveId(null);
    setLastPenaltyTime(0);
  }

  function openMainMenu() {
    setShowMainMenu(true);
  }

  function closeMainMenu() {
    setShowMainMenu(false);
  }

  if (!gameStarted) {
    return (
      <div style={{
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'linear-gradient(rgba(26, 26, 46, 0.7), rgba(15, 52, 96, 0.7)), url(/background-dark.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        fontFamily: 'Arial, sans-serif',
        padding: '20px',
        position: 'relative',
      }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(30,58,95,0.95) 0%, rgba(22,33,62,0.95) 100%)',
          padding: '50px',
          borderRadius: '30px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
          border: '2px solid rgba(0,173,181,0.3)',
          maxWidth: '600px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '80px', marginBottom: '20px' }}>⌨️</div>
          <h1 style={{
            color: '#00adb5',
            fontSize: '42px',
            marginBottom: '15px',
            textShadow: '0 0 20px rgba(0,173,181,0.5)',
          }}>
            TUŞ AVI
          </h1>
          <p style={{
            color: '#93a8c1',
            fontSize: '18px',
            marginBottom: '40px',
            lineHeight: '1.6',
          }}>
            Türkçe Q klavye düzenini öğrenmek için eğlenceli bir oyun!
          </p>

          {showInstructions && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10000,
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #1e3a5f 0%, #2a5298 100%)',
                padding: '40px',
                borderRadius: '25px',
                maxWidth: '600px',
                border: '2px solid #00adb5',
                boxShadow: '0 0 50px rgba(0,173,181,0.5)',
                maxHeight: '90vh',
                overflowY: 'auto',
              }}>
                <h2 style={{
                  color: '#00d9ff',
                  fontSize: '32px',
                  marginBottom: '25px',
                  textAlign: 'center',
                }}>
                  📖 Nasıl Oynanır?
                </h2>

                <div style={{ color: '#93a8c1', fontSize: '16px', lineHeight: '1.8', textAlign: 'left' }}>
                  <div style={{ marginBottom: '15px' }}>
                    <strong style={{ color: '#00adb5' }}>🎯 Amaç:</strong>
                    <br />
                    Tüm tuşları klavyedeki doğru yerlerine yerleştir.
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <strong style={{ color: '#00adb5' }}>🖱️ Nasıl Oynanır:</strong>
                    <br />
                    1. Alttaki tuşlardan birini <strong>tıkla ve tut</strong>
                    <br />
                    2. Klavyede doğru yere <strong>sürükle</strong>
                    <br />
                    3. Doğru yerde <strong>bırak</strong>
                  </div>
                  <div style={{
                    backgroundColor: 'rgba(0,173,181,0.2)',
                    padding: '15px',
                    borderRadius: '10px',
                    border: '1px solid rgba(0,173,181,0.4)',
                    marginBottom: '15px',
                  }}>
                    <strong style={{ color: '#00d9ff', fontSize: '18px' }}>📋 Kurallar:</strong>
                    <div style={{ marginTop: '10px' }}>
                      • Doğru yerleştirme: <strong style={{ color: '#00d9ff' }}>+10 puan</strong>
                      <br />
                      • Yanlış yerleştirme: <strong style={{ color: '#e84118' }}>-5 puan</strong>
                      <br />
                      • Her 10 saniye: <strong style={{ color: '#e84118' }}>-10 puan</strong>
                    </div>
                  </div>

                  <div style={{
                    backgroundColor: 'rgba(0,173,181,0.2)',
                    padding: '15px',
                    borderRadius: '10px',
                    border: '1px solid rgba(0,173,181,0.4)',
                  }}>
                    <strong style={{ color: '#00d9ff' }}>💡 İpucu:</strong>
                    <br />
                    Türkçe Q klavye düzeni: Üst sıra QWERTY, orta sıra ASDF ile başlar!
                  </div>
                </div>

                <button
                  onClick={() => setShowInstructions(false)}
                  style={{
                    marginTop: '30px',
                    padding: '15px 40px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#1a1a2e',
                    background: 'linear-gradient(135deg, #00adb5 0%, #00d9ff 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    boxShadow: '0 5px 20px rgba(0,173,181,0.4)',
                    width: '100%',
                  }}
                >
                  Anladım!
                </button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <button
              onClick={() => setGameStarted(true)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,173,181,0.7)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,173,181,0.5)';
              }}
              style={{
                padding: '20px 50px',
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#1a1a2e',
                background: 'linear-gradient(135deg, #00adb5 0%, #00d9ff 100%)',
                border: 'none',
                borderRadius: '15px',
                cursor: 'pointer',
                boxShadow: '0 8px 30px rgba(0,173,181,0.5)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
            >
              🎮 Oyuna Başla
            </button>

            <button
              onClick={() => setShowInstructions(true)}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0,173,181,0.2)';
                e.currentTarget.style.borderColor = '#00d9ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = '#00adb5';
              }}
              style={{
                padding: '15px 40px',
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#00d9ff',
                background: 'transparent',
                border: '2px solid #00adb5',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              📖 Nasıl Oynanır?
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div style={{
        padding: '15px',
        fontFamily: 'Arial, sans-serif',
        height: '100vh',
        overflow: 'hidden',
        backgroundImage: 'linear-gradient(rgba(26, 26, 46, 0.7), rgba(15, 52, 96, 0.7)), url(/background-dark.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}>

        <div style={{
          position: 'relative',
          zIndex: 1,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          filter: isCompleted || showMainMenu ? 'blur(3px)' : 'none',
          opacity: isCompleted || showMainMenu ? 0.3 : 1,
          pointerEvents: isCompleted || showMainMenu ? 'none' : 'auto',
          transition: 'all 0.3s ease',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '10px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <button
                onClick={openMainMenu}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,173,181,0.8) 0%, rgba(0,217,255,0.8) 100%)';
                  e.currentTarget.style.borderColor = '#00d9ff';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(30,58,95,0.8) 0%, rgba(22,33,62,0.8) 100%)';
                  e.currentTarget.style.borderColor = 'rgba(0,173,181,0.5)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                style={{
                  padding: '10px 20px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#00d9ff',
                  background: 'linear-gradient(135deg, rgba(30,58,95,0.8) 0%, rgba(22,33,62,0.8) 100%)',
                  border: '2px solid rgba(0,173,181,0.5)',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                }}
              >
                ☰ Menü
              </button>

              <h1 style={{
                margin: '0',
                color: '#00adb5',
                textShadow: '0 0 20px rgba(0,173,181,0.5)',
                fontSize: '28px',
                fontWeight: 'bold',
              }}>
                ⌨️ TUŞ AVI
              </h1>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, rgba(30,58,95,0.95) 0%, rgba(22,33,62,0.95) 100%)',
              padding: '15px',
              borderRadius: '12px',
              boxShadow: '0 8px 25px rgba(0,0,0,0.5)',
              border: '1px solid rgba(0,173,181,0.3)',
              minWidth: '200px',
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid rgba(0,173,181,0.2)' }}>
                    <td style={{ padding: '8px 0', color: '#93a8c1', fontSize: '14px' }}>📊 İlerleme:</td>
                    <td style={{ padding: '8px 0', color: '#00d9ff', fontSize: '16px', fontWeight: 'bold', textAlign: 'right' }}>
                      {placedCount}/{totalKeys}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(0,173,181,0.2)' }}>
                    <td style={{ padding: '8px 0', color: '#93a8c1', fontSize: '14px' }}>🎯 Puan:</td>
                    <td style={{
                      padding: '8px 0',
                      color: score < 0 ? '#e84118' : '#00d9ff',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      textAlign: 'right'
                    }}>
                      {score}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(0,173,181,0.2)' }}>
                    <td style={{ padding: '8px 0', color: '#93a8c1', fontSize: '14px' }}>⏱️ Süre:</td>
                    <td style={{ padding: '8px 0', color: '#00d9ff', fontSize: '16px', fontWeight: 'bold', textAlign: 'right' }}>
                      {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 0', color: '#93a8c1', fontSize: '14px' }}>❌ Yanlış:</td>
                    <td style={{ padding: '8px 0', color: '#e84118', fontSize: '16px', fontWeight: 'bold', textAlign: 'right' }}>
                      {wrongAttempts}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ marginBottom: '10px', flex: 1, minHeight: 0 }}>
            <Keyboard placedKeys={placedKeys} />
          </div>

          <div style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            padding: '15px',
            background: 'linear-gradient(135deg, rgba(30,58,95,0.7) 0%, rgba(22,33,62,0.7) 100%)',
            borderRadius: '15px',
            boxShadow: '0 15px 40px rgba(0,0,0,0.5)',
            height: '180px',
            alignContent: 'flex-start',
            overflowY: 'auto',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0,173,181,0.2)',
          }}>
            <h3 style={{
              width: '100%',
              textAlign: 'center',
              color: '#00adb5',
              margin: '0 0 10px 0',
              fontSize: '16px',
              textShadow: '0 0 10px rgba(0,173,181,0.5)',
            }}>
              {remainingKeys.length > 0 ? '⬇️ Tuşları Yukarıya Sürükle' : '✅ Tamamlandı!'}
            </h3>
            {remainingKeys.map((char: string) => (
              <DraggableKey key={char} id={char} char={char} />
            ))}
          </div>
        </div>

        {showMainMenu && (
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10000,
            textAlign: 'center',
            padding: '40px',
            background: 'linear-gradient(135deg, rgba(30,58,95,0.98) 0%, rgba(22,33,62,0.98) 100%)',
            color: '#ffffff',
            borderRadius: '25px',
            boxShadow: '0 30px 80px rgba(0,0,0,0.8)',
            border: '3px solid rgba(0,173,181,0.5)',
            minWidth: '400px',
          }}>
            <div style={{ fontSize: '50px', marginBottom: '15px' }}>⚙️</div>
            <h2 style={{
              fontSize: '32px',
              marginBottom: '30px',
              color: '#00adb5',
              textShadow: '0 0 20px rgba(0,173,181,0.5)',
            }}>
              Ana Menü
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <button
                onClick={closeMainMenu}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,173,181,0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,173,181,0.4)';
                }}
                style={{
                  padding: '18px 40px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#1a1a2e',
                  background: 'linear-gradient(135deg, #00adb5 0%, #00d9ff 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 6px 20px rgba(0,173,181,0.4)',
                }}
              >
                ▶️ Oyuna Devam Et
              </button>

              <button
                onClick={() => {
                  resetGame();
                  closeMainMenu();
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0,173,181,0.2)';
                  e.currentTarget.style.borderColor = '#00d9ff';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = '#00adb5';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                style={{
                  padding: '18px 40px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#00d9ff',
                  background: 'transparent',
                  border: '2px solid #00adb5',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                🔄 Yeni Oyun
              </button>

              <button
                onClick={() => {
                  setGameStarted(false);
                  setShowMainMenu(false);
                  resetGame();
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(232,65,24,0.2)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                style={{
                  padding: '18px 40px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#e84118',
                  background: 'transparent',
                  border: '2px solid #e84118',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                🏠 Ana Ekrana Dön
              </button>
            </div>
          </div>
        )}

        {isCompleted && (
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10000,
            textAlign: 'center',
            padding: '40px',
            background: 'linear-gradient(135deg, #00adb5 0%, #00d9ff 100%)',
            color: '#1a1a2e',
            borderRadius: '25px',
            boxShadow: '0 30px 80px rgba(0,173,181,0.8)',
            border: '3px solid rgba(255,255,255,0.4)',
            minWidth: '500px',
          }}>
            <div style={{ fontSize: '60px', marginBottom: '15px' }}>🏆</div>
            <div style={{ fontSize: '32px', marginBottom: '20px', fontWeight: 'bold' }}>
              TEBRİKLER!
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '25px' }}>
              {score} Puan Aldınız! 🎯
            </div>

            <div style={{
              display: 'flex',
              gap: '20px',
              justifyContent: 'center',
              alignItems: 'stretch',
              marginTop: '25px',
            }}>
              <div style={{
                flex: 1,
                background: 'rgba(0,0,0,0.2)',
                padding: '25px',
                borderRadius: '15px',
                border: '2px solid rgba(255,255,255,0.3)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}>
                <div style={{ fontSize: '18px', opacity: 0.9, marginBottom: '15px' }}>
                  İstatistikler
                </div>
                <div style={{ fontSize: '16px', opacity: 0.9, marginBottom: '8px' }}>
                  ⏱️ Süre: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                </div>
                <div style={{ fontSize: '16px', opacity: 0.9 }}>
                  ⚡ Yanlış: {wrongAttempts}
                </div>
              </div>

              <button
                onClick={resetGame}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)';
                  e.currentTarget.style.boxShadow = '0 12px 35px rgba(0,0,0,0.5)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, #2a5298 0%, #1e3a5f 100%)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.4)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, #1e3a5f 0%, #2a5298 100%)';
                }}
                style={{
                  flex: 1,
                  padding: '25px',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#ffffff',
                  background: 'linear-gradient(135deg, #1e3a5f 0%, #2a5298 100%)',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderRadius: '15px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.4)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                }}
              >
                <span style={{ fontSize: '36px' }}>🔄</span>
                <span>Tekrar Oyna</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DRAGOVERLAY - GÖLGESIZ */}
      <DragOverlay dropAnimation={null}>
        {activeId ? (
          <div style={{
            padding: '10px 8px',
            border: '2px solid #00d9ff',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #1e3a5f 0%, #2a5298 100%)',
            fontSize: activeId.length > 5 ? '10px' : activeId.length > 3 ? '12px' : '18px',
            fontWeight: 'bold',
            textAlign: 'center',
            width: activeId === 'Space' ? '280px' : activeId === 'Backspace' ? '90px' : activeId.includes('Shift') || activeId.includes('Ctrl') ? '90px' : activeId.length > 4 ? '80px' : '38px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#00d9ff',
            cursor: 'grabbing',
          }}>
            {activeId.replace('Left', '').replace('Right', '')}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default App;
