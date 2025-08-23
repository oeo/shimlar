# shimlar game design

**important**: this document defines the core game mechanics. it supersedes any conflicting design documents.

## game vision

shimlar is a terminal-based arpg that captures the depth and complexity of path of exile while embracing terminal constraints. we achieve depth through simple, composable systems rather than numerous complex features.

## core gameplay loop

```
explore zone → fight monsters → collect loot → improve character → tackle harder content
```

this loop should be satisfying within 5 minutes of play.

## combat system

### tick-based real-time combat

- runs at 100ms tick resolution
- player can interrupt at any time to issue commands
- combat continues automatically between commands
- enemies act independently based on ai

### position system

three positions create tactical depth:
- **melee**: close combat range
- **close**: mid-range, movement abilities
- **far**: projectile range

```
[FAR]   skeleton archer    ▓▓▓░░░ 
[CLOSE] zombie             ▓▓▓▓▓▓
[MELEE] * rhoa charging *  ▓▓▓▓▓▓

YOU [MELEE]               ▓▓▓▓░░░
```

### damage types

five damage types with distinct identities:
- **physical**: reduced by armor
- **fire**: ignites, damage over time
- **cold**: slows and freezes
- **lightning**: shocks for increased damage
- **chaos**: bypasses energy shield

### defensive layers

multiple defense types encourage build diversity:
- **life**: primary health pool
- **energy shield**: regenerating buffer
- **armor**: reduces physical damage
- **evasion**: chance to avoid attacks
- **resistances**: -60% to 75% (capped)

### combat formula

```typescript
final_damage = base_damage 
  * (1 + sum_increased_modifiers) 
  * product_more_modifiers
  * (1 - resistance/100)
  * armor_reduction
  * (1 - block_chance)
```

## character system

### classes

seven classes forming a triangle of attributes:

```
       witch (int)
      /           \
templar           shadow
(str/int)       (int/dex)
    |               |
marauder  scion  ranger
  (str)  (all)   (dex)
    \             /
      duelist
    (str/dex)
```

### attributes

- **strength**: +5 life, +2% melee physical damage per 10
- **dexterity**: +2 accuracy, +2% evasion per 10  
- **intelligence**: +5 mana, +2% energy shield per 10

### progression

- gain experience from killing monsters
- level up to increase base stats
- allocate passive skill points
- find and equip better items
- unlock new skills and abilities

## item system

### rarity tiers

visual distinction through color:
- **normal** (white): no modifiers
- **magic** (blue): 1-2 modifiers
- **rare** (yellow): 4-6 modifiers
- **unique** (orange): fixed special modifiers

### item display

```
╔════════════════════╗
║ tyrannical         ║
║ demon sword        ║
║ ⚔ 45-67 physical  ║
╠════════════════════╣
║ +42 maximum life   ║
║ +18% fire resist   ║
║ 12% attack speed   ║
╚════════════════════╝
requires: level 35, 80 str
```

### affix system

items can have:
- **prefixes**: offensive modifiers (up to 3)
- **suffixes**: defensive modifiers (up to 3)
- **implicit**: base item modifier

### equipment slots

ten slots for character customization:
- weapons (1-2 slots)
- helm, body, gloves, boots
- belt, amulet, rings (2)

## flask system

five flask slots provide active combat decisions:
- **life flasks**: restore health
- **mana flasks**: restore mana
- **utility flasks**: temporary buffs
- charges consumed on use
- charges gained from kills

## skill system

### active skills

each class has 3-5 signature skills:
- **strike**: basic melee attack
- **spell**: magical effect
- **projectile**: ranged attack
- **aura**: persistent buff
- **movement**: positioning skill

### skill scaling

skills scale with:
- character level
- weapon damage
- spell damage
- attribute bonuses
- passive tree modifiers

## monster system

### enemy variety

- **normal**: standard enemies
- **magic** (blue): one modifier pack
- **rare** (yellow): multiple modifiers
- **unique** (purple): boss enemies

### monster modifiers

modifiers create variety:
- **substantial**: more life
- **fleet**: faster movement
- **accurate**: cannot miss
- **resistant**: elemental resistance
- **volatile**: explodes on death

### boss mechanics

bosses have:
- multiple phases
- telegraphed attacks
- special abilities
- guaranteed rare drops

## zone system

### zone progression

linear zone difficulty:
1. **the coast**: level 1-5
2. **the caves**: level 5-10
3. **the prison**: level 10-15
4. continuing through endgame

### zone properties

each zone has:
- monster level range
- specific enemy types
- environmental hazards
- unique boss encounter

## crafting system

### currency orbs

simplified but recognizable:
- **transmutation**: normal → magic
- **alteration**: reroll magic
- **alchemy**: normal → rare
- **chaos**: reroll rare
- **exalted**: add modifier

### crafting outcomes

initially deterministic for learning:
- predictable modifier pools
- visible probabilities
- no failed crafts initially

## endgame systems

### maps (future)

- items that create zones
- rolled with modifiers
- increasing tiers (1-16)
- atlas progression system

### leagues (future)

- seasonal content
- fresh economy
- new mechanics
- challenge rewards

## death and difficulty

### death penalties

- **softcore**: lose 10% current level xp
- **hardcore**: permanent death (optional)

### difficulty scaling

- monster level increases
- new monster types appear
- modifiers become more common
- resistances become crucial

## user interface

### main combat view

```
zone name - depth          character name lvl
═══════════════════════════════════════════════
enemy list                 player status
  positioning                hp/mp/es bars
  health bars                flask display
                            buff/debuff list
combat log
  damage messages
  ability usage
  status effects
═══════════════════════════════════════════════
[action bar] q w e r t - skills, 1-5 flasks
```

### design principles

1. **information density**: pack meaningful data efficiently
2. **keyboard only**: no mouse support
3. **ascii aesthetic**: embrace terminal limitations
4. **clear feedback**: every action has visible result
5. **minimal ui chrome**: focus on game, not interface

## what makes it fun

1. **meaningful choices**: every level up, item, and skill matters
2. **power progression**: feel character getting stronger
3. **loot excitement**: identifying items is like opening presents
4. **build diversity**: multiple ways to play each class
5. **challenge**: death is possible but preventable
6. **discovery**: hidden mechanics reward experimentation

## balance philosophy

- player should feel powerful but vulnerable
- no single dominant strategy
- every stat and modifier has value
- death should feel fair (telegraphed attacks)
- progression should feel earned

## technical constraints

- must work in 80x24 terminal
- keyboard only controls
- ascii/unicode characters only
- 100ms minimum tick rate
- sub-second response time

## future expansion

the design supports adding:
- multiplayer parties
- player trading
- pvp combat
- guild systems
- infinite progression systems

but these are not initial goals.

## for future developers

this design is intentionally simpler than path of exile while maintaining its core appeal. if you see references to:
- socket systems
- atlas passives
- maven witnesses
- delve depths
- syndicate boards

these are **future** considerations, not current features. focus on making the core loop fun first.