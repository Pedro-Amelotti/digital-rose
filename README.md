# Digital Rose

Experiência visual interativa em desenvolvimento, dedicada a rosas digitais de inspiração botânica e estética sombria. Um buquê procedural combina rosas, flores inspiradas em escabiosas e ramos delicados. As rosas góticas predominam em todas as composições. Cada novo buquê varia a quantidade e a distribuição das flores, os ramos e a composição e é convertido em caracteres ASCII enquanto cresce e floresce.

## Stack

Vite, JavaScript com ES Modules, HTML5, CSS3, Canvas 2D e GSAP. Não há backend nem fontes externas.

## Executar

Requer Node.js compatível com a versão instalada do Vite.

```sh
npm install
npm run dev
npm run build
npm run preview
```

## Publicação no GitHub Pages

Em **Settings → Pages → Build and deployment**, selecione **GitHub Actions** como fonte. A cada push na branch `main`, ou por execução manual em **Actions → Deploy GitHub Pages**, o workflow instala as dependências, gera o site e publica somente o conteúdo de `dist/`. A pasta gerada continua fora do Git.

O build do workflow usa o nome do repositório como caminho base. Para o repositório atual, o endereço esperado é `https://pedro-amelotti.github.io/digital-rose/` após a configuração e a primeira publicação bem-sucedida. Caso seja configurado um domínio personalizado, ajuste o caminho base do build no workflow para `/`.

## Revisão de buquês

Use `?gen=1` (ou qualquer inteiro de 1 a 12, por exemplo `?gen=12`) para abrir uma galeria com 12 buquês diferentes já florescidos. Cada cartão permite gerar outro buquê; o botão superior troca todos. Sem o parâmetro, ou com valor inválido, a página mantém a experiência original com um buquê animado. O número ativa a galeria e não controla a quantidade de cartões.

## Estrutura

```text
public/assets/{images,fonts}/  Recursos locais futuros
src/canvas/                   CanvasManager e Renderer
src/entities/                 Buquê, flores, folhagens e posicionamento procedural
src/animation/                AnimationController
src/interactions/             PointerController
src/utils/                    Utilitários matemáticos
src/styles/                   Variáveis, reset e layout
src/main.js                   Inicialização
index.html                    Página de entrada
```

`CanvasManager` configura o contexto, as dimensões e a densidade de pixels; `Renderer` converte a composição procedural em caracteres ASCII e desenha apenas quando necessário. As entidades compõem o buquê e desenham as rosas, as pétalas, os caules e as folhas. `AnimationController` coordena a sequência com GSAP; `PointerController` permite gerar outro buquê com mouse ou toque. O botão também permite gerar outro pelo teclado. Com movimento reduzido ativado no sistema, o buquê aparece já florescido. Todos os controladores que possuem recursos oferecem `dispose()`. Os diretórios de recursos são reservados para uso posterior.

## Roadmap

Cada etapa parte da anterior e deve ser validada antes de avançar. O escopo visual e os detalhes de interação podem ser ajustados durante o desenvolvimento.

### 1. Estrutura e configuração inicial — concluída

- Configurar Vite, GSAP e a organização modular do projeto.
- Preparar canvas responsivo, ciclo de renderização e descarte de recursos.
- Criar o layout base e documentar a execução local.

**Critério de conclusão:** build concluído e página inicial exibida com o canvas vazio.

### 2. Construção procedural de uma rosa — implementada

- Definir parâmetros básicos da rosa e a composição das pétalas.
- Implementar a geometria procedural e a renderização inicial no Canvas 2D.
- Ajustar cores, formas e proporções à identidade visual do projeto.

**Critério de conclusão:** uma rosa estática é gerada por código, sem imagens de rosas, e aparece corretamente em diferentes tamanhos de tela.

### 3. Crescimento do caule e das folhas — implementada

- Definir a geometria do caule e das folhas e sua ligação com a rosa.
- Implementar o crescimento progressivo desses elementos.
- Ajustar a sequência e as proporções para manter um movimento orgânico.

**Critério de conclusão:** caule e folhas crescem de forma coordenada e permanecem alinhados à rosa.

### 4. Animação de florescimento — implementada

- Definir os estados e a sequência de abertura das pétalas.
- Usar GSAP para coordenar o florescimento com o crescimento anterior.
- Refinar duração e suavidade do movimento.

**Critério de conclusão:** a sequência completa evolui do crescimento ao florescimento sem saltos visíveis.

### 5. Renderização com estética ASCII/partículas — implementada

A composição procedural é amostrada e reconstruída com uma grade fina de caracteres ASCII coloridos; as rosas têm pétalas assimétricas com dobras e nervuras, e os caules usam curvas compartilhadas com as folhas e flores. A folhagem fica atrás das flores, enquanto as flores de apoio variam entre posições à frente e atrás das rosas. A geração favorece rosas próximas, com sobreposições naturais de um buquê de mão, evitando centros excessivamente próximos, favorece lacunas internas para as flores de apoio e preserva sobreposições leves e posições laterais. As rosas variam em abertura, perspectiva e tons; perfis variados, folhagens com nervuras e ramos irregulares enriquecem a silhueta. Uma fita com nó e pontas variadas reúne os caules.

- Explorar uma representação visual coerente com a estética botânica, gótica e pixelada.
- Implementar a abordagem escolhida no renderizador, preservando a leitura da rosa.
- Ajustar densidade, cores e contraste em diferentes telas.

**Critério de conclusão:** o efeito escolhido é reconhecível, mantém a forma da rosa e funciona junto à animação.

### 6. Interatividade e refinamento visual — implementada

- Definir interações apropriadas para mouse e toque antes de implementá-las.
- Integrar os eventos à experiência sem interromper a sequência visual.
- Refinar composição, tipografia e resposta às interações.

**Critério de conclusão:** as interações definidas funcionam em mouse e toque, com comportamento consistente e compreensível.

### 7. Performance, acessibilidade e ajustes responsivos — em andamento

O desenho ocorre sob demanda, limita a varredura ASCII à área da composição e respeita movimento reduzido. Ainda é necessária validação de desempenho e acessibilidade em mais dispositivos e navegadores.

- Medir e reduzir custos de renderização e animação em dispositivos distintos.
- Considerar movimento reduzido, contraste e alternativas acessíveis para o conteúdo visual.
- Revisar layout, redimensionamento, recursos e compatibilidade nos tamanhos de tela relevantes.

**Critério de conclusão:** experiência validada nos dispositivos e navegadores definidos para o projeto, incluindo movimento reduzido e ausência de erros conhecidos que impeçam o uso.
