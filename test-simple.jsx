import React from 'react'

function TestComponent() {
  return (
    <div style={{padding: "20px", backgroundColor: "#f0f0f0"}}>
      <h1>Teste Simples</h1>
      <p>Se você está vendo isso, o React está funcionando!</p>
      <button onClick={() => alert('Clique funcionou!')}>
        Testar JavaScript
      </button>
    </div>
  )
}

export default TestComponent
