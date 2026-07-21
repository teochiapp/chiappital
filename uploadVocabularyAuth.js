const readline = require('readline');

// Lista de palabras
const words = [
  { word: 'Burrice', translation: 'Estupidez / Tontería', language: 'portugués', notes: 'Ex: Que burrice esquecer a chave dentro de casa!' },
  { word: 'Franzino', translation: 'Enclenque / Debilucho', language: 'portugués', notes: 'Ex: Ele era um menino franzino, mas muito inteligente.' },
  { word: 'Mole', translation: 'Blando / Suave', language: 'portugués', notes: 'Ex: O colchão dessa cama é muito mole.' },
  { word: 'Quicar', translation: 'Rebotar', language: 'portugués', notes: 'Ex: A bola começou a quicar no chão.' },
  { word: 'Folha', translation: 'Hoja (de árbol o papel)', language: 'portugués', notes: 'Ex: Pegue uma folha de papel e anote a senha.' },
  { word: 'Gorjeta', translation: 'Propina', language: 'portugués', notes: 'Ex: Nós deixamos uma boa gorjeta para o garçom.' },
  { word: 'Ofegava', translation: 'Jadeaba', language: 'portugués', notes: 'Ex: Ele ofegava depois de correr dez quilômetros.' },
  { word: 'Lareira', translation: 'Chimenea / Hogar', language: 'portugués', notes: 'Ex: No inverno, gosto de ler perto da lareira.' },
  { word: 'Dica', translation: 'Consejo / Pista / Tip', language: 'portugués', notes: 'Ex: Posso te dar uma dica sobre o livro?' },
  { word: 'Nojento', translation: 'Asqueroso / Repugnante', language: 'portugués', notes: 'Ex: Esse inseto é muito nojento!' },
  { word: 'Grasnaram', translation: 'Graznaron (aves)', language: 'portugués', notes: 'Ex: Os corvos grasnaram nas árvores escuras.' },
  { word: 'Para cima', translation: 'Hacia arriba', language: 'portugués', notes: 'Ex: Olhe para cima, o céu está lindo!' }
];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const API_BASE_URL = 'https://apichiappital.surcodes.com/api';

console.log('🚀 Script en Node.js para subir palabras a la Base de Datos');
console.log('------------------------------------------------------------');

rl.question('Ingresa tu email de usuario (Chiappital):\n> ', (email) => {
  rl.question('Ingresa tu contraseña:\n> ', async (password) => {
    console.log('\nAutenticando...');
    try {
      // 1. Login para obtener el token
      const authRes = await fetch(`${API_BASE_URL}/auth/local`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: email, password })
      });
      
      const authData = await authRes.json();
      
      if (!authData.jwt) {
        console.log('❌ Error de autenticación: Verifica tu email y contraseña.');
        rl.close();
        return;
      }
      
      const token = authData.jwt;
      console.log('✅ Autenticación exitosa. Subiendo palabras...');
      
      // 2. Subir palabras una por una
      let successCount = 0;
      for (const w of words) {
        const res = await fetch(`${API_BASE_URL}/personal/vocabulary`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(w)
        });
        
        if (res.ok) {
          console.log(`✅ Agregada: ${w.word}`);
          successCount++;
        } else {
          console.log(`❌ Error al agregar "${w.word}": HTTP ${res.status}`);
        }
      }
      
      console.log('------------------------------------------------');
      console.log(`🎉 ¡Proceso finalizado! Se agregaron ${successCount} de ${words.length} palabras.`);
    } catch (error) {
      console.log('❌ Error en el proceso:', error.message);
    }
    rl.close();
  });
});
