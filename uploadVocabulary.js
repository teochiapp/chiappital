const fs = require('fs');
const readline = require('readline');

// Lista de palabras extraídas de Magnus Chase
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

const API_URL = 'https://apichiappital.surcodes.com/api/personal/vocabulary';

console.log('🚀 Script para subir palabras a la Base de Datos');
console.log('------------------------------------------------');

// Pedimos el token
rl.question('Por favor, pega tu token de sesión (lo puedes encontrar en localStorage "st_token"):\n> ', async (token) => {
  if (!token) {
    console.log('❌ Debes ingresar un token válido.');
    rl.close();
    return;
  }

  console.log(`\nIniciando subida de ${words.length} palabras...`);
  
  let successCount = 0;
  
  for (const w of words) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(w)
      });
      
      if (response.ok) {
        console.log(`✅ Agregada: ${w.word}`);
        successCount++;
      } else {
        const errorText = await response.text();
        console.log(`❌ Error al agregar "${w.word}": ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.log(`❌ Error de red al agregar "${w.word}": ${error.message}`);
    }
  }
  
  console.log('------------------------------------------------');
  console.log(`🎉 ¡Proceso finalizado! Se agregaron ${successCount} de ${words.length} palabras a la base de datos.`);
  rl.close();
});
