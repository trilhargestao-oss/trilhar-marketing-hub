function App() {
  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'white', 
      color: 'black',
      fontSize: '32px',
      fontWeight: 'bold',
      position: 'fixed',
      inset: 0,
      zIndex: 9999
    }}>
      TESTE DE RENDERIZAÇÃO: SE VOCÊ ESTÁ VENDO ISSO, O REACT FUNCIONOU!
    </div>
  );
}

export default App;
