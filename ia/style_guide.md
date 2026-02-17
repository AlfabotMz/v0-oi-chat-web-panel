# 🎨 OICHAT — STYLE GUIDE

## 1️⃣ Filosofia Visual

O OiChat deve transmitir:

* Confiança operacional
* Organização
* Automação inteligente
* Produto premium, não experimental

Referência de maturidade visual:
Notion
Linear
Vercel

A UI deve parecer:

> 96–98% neutra
> 2–4% acento estratégico

---

# 🎨 CAMADAS DE COR

---

## 🔹 1. Neutral Foundation (Modo Claro)

Base quase totalmente neutra.

### Estrutura de Hierarquia

| Elemento             | Estratégia                                 |
| -------------------- | ------------------------------------------ |
| Background principal | Branco levemente aquecido                  |
| Seções alternadas    | -2% luminosidade                           |
| Cards                | -3% luminosidade                           |
| Sidebar              | -4% luminosidade                           |
| Bordas               | Mesmo tom, 8% mais escuro, baixa opacidade |

Pequenas variações criam profundidade sem parecer “colorido”.

---

### Texto

Base neutra escura com variação de branco:

| Tipo         | Regra         |
| ------------ | ------------- |
| Headline     | 11% branco    |
| Texto normal | 15–20% branco |
| Subtexto     | 40–45% branco |
| Desativado   | 55–60% branco |

Isso cria hierarquia sem depender de peso tipográfico excessivo.

---

## 🔹 2. Functional Accent

A cor principal não é uma única cor — é uma escala.

### Escala: Electric Violet

```
electric-violet:
50  #faf4ff
100 #f2e5ff
200 #e8d0ff
300 #d6acff
400 #bd76ff
500 #a442ff
600 #8a14ff
700 #7a0ee2
800 #6812b7
900 #561093
950 #3a006f
```

### Uso correto

| Uso              | Tom |
| ---------------- | --- |
| Botão primário   | 600 |
| Hover botão      | 700 |
| Link             | 400 |
| Foco ativo       | 500 |
| Badge sutil      | 100 |
| Fundo decorativo | 50  |

Regra crítica:

> Quanto mais escuro o botão, mais importante ele é.

---

# 🌙 MODO DARK

No modo escuro:

Se no light:
Diferença entre fundo e card = 2%

No dark:
Diferença deve ser 4%

Aumentar contraste estrutural evita UI “lavada”.

### Accent no Dark

Usar:

* 400 ou 500 como principal
* Bordas leves com 600 a 10% opacity

---

# 🧠 SEMANTIC COMMUNICATION (OKLCH)

Base:

```
oklch(0.6469 0.1834 333.29)
```

Alterar apenas hue (matiz):

| Estado  | Hue aproximado |
| ------- | -------------- |
| Sucesso | ~145           |
| Erro    | ~25            |
| Aviso   | ~80            |
| Info    | ~260           |

Isso mantém coerência de luminosidade e saturação.

---

# 🎨 THEME ENGINE

Para criar variações de tema:

1. Diminuir luminosidade em -0.03
2. Aumentar chroma em +0.02
3. Alterar hue

Isso permite criar:

* OiChat Purple
* OiChat Blue
* OiChat Emerald

Sem quebrar consistência.

---

# 🧱 LAYOUT SYSTEM

## Hero

* Texto forte
* CTA destacado
* Elemento gráfico quebrado (overflow)
* Objetivo: forçar scroll

---

## Seção Interativa com Selector

Pequeno menu tipo tabs:

* Clique troca conteúdo
* Animação suave
* Transição fade + slide 8px

---

## Layout Patterns

* Bento layout
* Grids simples
* Cards com borda leve
* Uso estratégico de imagens reais

---

# 🧩 REDUÇÃO DE “CARA DE IA”

❌ Evitar excesso de emoji
✅ Usar biblioteca de ícones como `react-icons`
✅ Preferir ícones lineares minimalistas
✅ Não usar gradientes exagerados
✅ Evitar brilho excessivo

---

# 🏗 OICHAT DESIGN SYSTEM

Agora transformando isso em sistema técnico.

---

## 1️⃣ Design Tokens

### Colors

```
--background-primary
--background-secondary
--background-card
--border-subtle
--text-primary
--text-secondary
--text-muted
--accent-400
--accent-500
--accent-600
--accent-700
--success
--error
--warning
--info
```

---

## 2️⃣ Component Tokens

### Button

Primary:

* bg: accent-600
* hover: accent-700
* text: white
* radius: 12px
* padding: 12px 20px

Secondary:

* bg: neutral
* border: subtle
* hover: accent-100

---

### Card

* background: background-card
* border: subtle
* radius: 16px
* shadow: leve (apenas light mode)

---

### Input

* border: subtle
* focus: accent-500 ring 2px
* background: background-secondary

---

## 3️⃣ Spacing System

Base 8px grid:

4
8
12
16
24
32
48
64
96

---

## 4️⃣ Radius System

| Tipo         | Radius |
| ------------ | ------ |
| Pequeno      | 8px    |
| Médio        | 12px   |
| Grande       | 16px   |
| Hero / Bento | 24px   |

---

## 5️⃣ Motion System

* Hover: 150ms ease-out
* Fade in: 250ms
* Slide: translateY(8px → 0)
* Stagger: 60ms

Nada exagerado.

---

# 🎯 Resultado Esperado

Com esse sistema, OiChat parecerá:

* Produto SaaS maduro
* Estruturado
* Confiável
* Minimalista
* Profissional
* Não “startup artificial”

