import os

files = [
    'src/components/VictoryOverlay.jsx',
    'src/components/WordFeverResultOverlay.jsx',
    'src/components/MysteryBoxModal.jsx',
    'src/components/MasteryModal.jsx',
    'src/components/LuckyWheelModal.jsx',
    'src/components/LevelUpOverlay.jsx',
    'src/components/DailyRewardModal.jsx',
    'src/components/BattleResultOverlay.jsx'
]

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Replace import
    content = content.replace(
        "import confetti from 'canvas-confetti';",
        "import { fireConfetti as confetti, resetConfetti } from '../utils/confettiHelper';"
    )
    
    # Replace confetti.reset()
    content = content.replace("confetti.reset()", "resetConfetti()")
    
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)
print('Done!')
