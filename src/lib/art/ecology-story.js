const clamp = (value) => Math.max(0, Math.min(1, value));
export function ecologyFrame(progress) {
  const capture = clamp((progress * 7 - 4) * 6);
  const removal = clamp((progress * 7 - 4 - 0.12) * 3);
  return {
    chapter: Math.min(6, Math.floor(clamp(progress) * 7)),
    cycle: Math.min(1, clamp(progress) * 1.75),
    capture,
    removal,
    damage: clamp((progress * 7 - 5) * 1.7),
    spread: clamp((progress * 7 - 6) * 1.7),
    absent: removal === 1,
  };
}
export const ecologySteps = [
  {
    label: "1. Coleta",
    title: "O almoço está no chão.",
    text: "Entre os grãos do fundo há pequenas partículas de matéria orgânica. O pepino-do-mar as recolhe ao se alimentar.",
  },
  {
    label: "2. Fragmentação",
    title: "O que entra sai menor.",
    text: "Ao se alimentar, ele fragmenta esse material. O sedimento passa pelo corpo e volta ao fundo com partículas menores.",
  },
  {
    label: "3. Bactérias",
    title: "O trabalho continua.",
    text: "Bactérias decompõem as partículas fragmentadas. O pepino-do-mar participa de um processo feito por muitos organismos.",
  },
  {
    label: "4. Nutrientes",
    title: "A matéria volta ao ciclo.",
    text: "A decomposição devolve nutrientes ao ambiente. Esse trabalho discreto faz parte da reciclagem de matéria no oceano.",
  },
  {
    label: "5. Retirada",
    title: "Se a retirada continuar…",
    text: "Quando a captura supera a recuperação da população, esse trabalho começa a faltar. A perda fica no lugar de onde os animais saíram.",
  },
  {
    label: "6. Dano local",
    title: "A perda começa aqui.",
    text: "O dano pode alcançar os corais. Em experimentos em recifes, retirar pepinos-do-mar aumentou a doença e a perda de tecido nos corais em contato com o sedimento.",
  },
  {
    label: "7. Pressão ampliada",
    title: "Um lugar vazio. Depois outro.",
    text: "A sobrepesca já levou pepinos-do-mar à extinção local. Quando uma população se esgota, o recife perde parte desse trabalho — e quem vive da pesca perde uma fonte de renda.",
  },
];
