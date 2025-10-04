import React from 'react'

function App() {
  console.log('🚀 React está funcionando!');

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#e0f0ff',
      padding: '20px',
      fontFamily: 'system-ui'
    }}>
      <h1>🚀 AppMari 2.0</h1>
      <h2>React está funcionando!</h2>
      <p>Agora você pode implementar o sistema completo.</p>
      <button 
        onClick={() => alert('JavaScript funcionando! Sistema pronto!')}
        style={{
          padding: '10px 20px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Testar Sistema
      </button>
    </div>
  )
}

export default App