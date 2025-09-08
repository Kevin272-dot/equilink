import React from 'react';

function App() {
  return (
    <div className="App">
      <h1 style={{textAlign: 'center', margin: '50px', color: '#4F46E5'}}>
        🛡️ Equilink PWA
      </h1>
      <p style={{textAlign: 'center', fontSize: '18px'}}>
        React application is running successfully!
      </p>
      <div style={{textAlign: 'center', marginTop: '30px'}}>
        <button style={{
          backgroundColor: '#4F46E5',
          color: 'white',
          padding: '12px 24px',
          border: 'none',
          borderRadius: '6px',
          fontSize: '16px',
          cursor: 'pointer'
        }}>
          Test Button - Click me!
        </button>
      </div>
      <div style={{textAlign: 'center', marginTop: '20px', color: '#666'}}>
        <p>If you can see this page, the React setup is working correctly.</p>
        <p>Dependencies have been installed and the application is ready.</p>
      </div>
    </div>
  );
}

export default App;
