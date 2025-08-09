# 🎵 Áudio de Fundo - TV Saúde

## Arquivos de Áudio Disponíveis

### Faixas Ambiente
- `ambient-relaxing.mp3` - Música ambiente relaxante para saúde
- `nature-calm.mp3` - Sons da natureza calmos
- `meditation.mp3` - Música para meditação e bem-estar

## Como Adicionar Novos Áudios

1. Coloque os arquivos de áudio nesta pasta
2. Formatos suportados: MP3, WAV, OGG
3. Recomendado: arquivos com loop suave
4. Volume recomendado: normalizado para evitar picos

## Configuração

Os áudios são gerenciados pelo `AudioManager` no frontend da TV.
Para adicionar novas faixas, edite o arquivo:
`frontend-tv/src/utils/audioManager.js`

## Características Recomendadas

- **Duração**: 3-10 minutos (com loop)
- **Volume**: Normalizado, sem picos
- **Estilo**: Ambiente, relaxante, adequado para ambiente hospitalar
- **Qualidade**: 128kbps ou superior
- **Formato**: MP3 preferível para compatibilidade

## Uso no Sistema

O áudio de fundo é reproduzido automaticamente quando:
- A TV está ligada
- Não há vídeo tocando ou o vídeo está pausado
- O volume é automaticamente balanceado com o áudio do vídeo

## Controles Disponíveis

Via controle remoto:
- `background_music_on` - Liga áudio de fundo
- `background_music_off` - Desliga áudio de fundo
- `toggle_background_music` - Alterna áudio de fundo
- `change_background_track` - Troca faixa (com parâmetro)
