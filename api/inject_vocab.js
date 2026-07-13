require('dotenv').config();
const { getPool, initializeDatabase } = require('./database/db');

const words = [
  { word: "caô", translation: "mentira, chamuyo", notes: "Isso aí é maior caô, não acredita nele." },
  { word: "pagar mico", translation: "pasar vergüenza, hacer un papelón", notes: "Paguei o maior mico na frente de todo mundo." },
  { word: "treta", translation: "pelea, quilombo, bardo", notes: "Deu uma treta maligna na saída do show." },
  { word: "abacaxi", translation: "problema grande, un perno", notes: "Tenho que descascar esse abacaxi no trabalho hoje." },
  { word: "chutar o balde", translation: "mandar todo a la mierda, descontrolar", notes: "Sexta-feira eu vou chutar o balde!" },
  { word: "folgado", translation: "caradura, aprovechador, fresco", notes: "Seu irmão é muito folgado, comeu tudo e não pagou nada." },
  { word: "pisar na bola", translation: "mandarse una cagada, fallarle a alguien", notes: "Ele pisou na bola comigo de novo." },
  { word: "dar um migué", translation: "meter excusa, chamuyar, hacerse el boludo", notes: "Ele deu um migué para não ir trabalhar hoje." },
  { word: "tamo junto (tmj)", translation: "estamos juntos, contá conmigo", notes: "Valeu pela ajuda, mano, tamo junto!" },
  { word: "sacanagem", translation: "una joda/maldad, algo injusto", notes: "Que sacanagem fazerem isso com você." },
  { word: "encher a cara", translation: "emborracharse, ponerse en pedo", notes: "Ontem nós enchemos a cara no bar." },
  { word: "ressaca", translation: "resaca", notes: "Estou com uma ressaca horrível hoje." },
  { word: "bater papo", translation: "charlar, conversar", notes: "Sentamos no café só para bater papo." },
  { word: "resenha", translation: "juntada informal, charla distendida", notes: "Vamos marcar uma resenha lá em casa no sábado." },
  { word: "mandar bem", translation: "hacerlo genial, romperla", notes: "Você mandou muito bem na apresentação!" },
  { word: "tirar onda", translation: "cancherear, mandarse la parte, burlarse", notes: "Ele adora tirar onda de carro novo." },
  { word: "pão-duro", translation: "tacaño, agarrete, codo", notes: "Ele é tão pão-duro que nunca divide a conta." },
  { word: "pechincha", translation: "ganga, algo muy barato", notes: "Comprei essa jaqueta por uma pechincha." },
  { word: "eita", translation: "¡epa!, ¡upa!, expresión de sorpresa o quilombo", notes: "Eita, a situação ficou tensa de verdade." },
  { word: "cafona", translation: "groncho, de mal gusto, kitsch", notes: "Achei essa decoração um pouco cafona." },
  { word: "fura-olho", translation: "traidor/a en el amor, buitre", notes: "Não confia nele, o cara é o maior fura-olho." },
  { word: "botar pilha", translation: "dar manija, incitar", notes: "Para de botar pilha na briga dos dois." },
  { word: "cabreiro", translation: "desconfiado, con la mosca en la oreja", notes: "Fiquei cabreiro com essa história dele." },
  { word: "queima-filme", translation: "algo que te deja mal parado, quema imagen", notes: "Sair com ele é maior queima-filme." },
  { word: "mala", translation: "insoportable, plomo, denso", notes: "Aquele professor é muito mala." },
  { word: "descolado", translation: "canchero, cool, moderno", notes: "Ela tem um estilo muito descolado." },
  { word: "barraco", translation: "escándalo en público, papelón", notes: "Ela armou o maior barraco na loja." },
  { word: "bafafá", translation: "chusmerío grande, rumor fuerte, lío", notes: "Deu o maior bafafá na reunião da empresa." },
  { word: "mó / maior", translation: "muy, tremendo/a (aumentativo informal)", notes: "Hoje o dia está mó paz." },
  { word: "jeitinho", translation: "el rebusque, la maña para resolver algo", notes: "Sempre tem um jeitinho de resolver isso." },
  { word: "bater perna", translation: "callejear, dar vueltas paseando", notes: "Fui no shopping bater perna a tarde toda." },
  { word: "biscoiteiro", translation: "alguien que busca llamar la atención", notes: "Ele só postou essa foto porque é biscoiteiro." },
  { word: "pipocar", translation: "arrugar, echarse atrás por miedo", notes: "Falou que ia falar com ela, mas pipocou." },
  { word: "valeu", translation: "gracias, de nada, chau", notes: "Valeu pela força, até amanhã!" },
  { word: "dar bobeira", translation: "dormirse en los laureles, dar ventaja", notes: "Não dá bobeira com a carteira no bolso de trás." }
];

async function inject() {
  await initializeDatabase();
  const db = getPool();

  const [users] = await db.execute('SELECT id, username FROM users');
  if (users.length === 0) {
    console.error('No users found in database!');
    process.exit(1);
  }

  const userId = users[0].id;
  console.log(`Injecting vocabulary for user ${users[0].username} (ID: ${userId})`);

  const today = new Date().toISOString().split('T')[0];

  for (const item of words) {
    await db.execute(
      'INSERT INTO vocabulary (user_id, word, translation, language, notes, next_review) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, item.word, item.translation, 'portugués', item.notes, today]
    );
  }

  console.log(`Successfully injected ${words.length} words.`);
  process.exit(0);
}

inject().catch(err => {
  console.error(err);
  process.exit(1);
});
