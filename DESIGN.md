---
name: Ode
description: Each ode gets one Roman floor mosaic, drawn by Claude and laid tile by tile on a plaster wall.
colors:
  plaster: "#e6e0d6"
  plaster-shade: "#dcd4c7"
  plaster-line: "#cfc6b8"
  ink: "#221e1b"
  umber: "#2b2420"
  umber-lifted: "#4a3e36"
  umber-soft: "#5b5148"
  limewash: "#f6f2ea"
  oxblood: "#a8352a"
  grout: "#C4B79E"
  ground-stone: "#E9E0CC"
  sketch: "rgba(150, 62, 40, 0.75)"
  lapis-1: "#BCD4E3"
  lapis-2: "#7AA6C7"
  lapis-3: "#3F6E9C"
  lapis-4: "#203E66"
  serpentine-1: "#C6D7A2"
  serpentine-2: "#8EAE63"
  serpentine-3: "#5B7F3E"
  serpentine-4: "#33502A"
  slate-1: "#E3E0DA"
  slate-2: "#B6B1A8"
  slate-3: "#7F7A72"
  slate-4: "#4B4742"
  sienna-1: "#DBC09E"
  sienna-2: "#B18B63"
  sienna-3: "#7D5B3E"
  sienna-4: "#4A3423"
  terracotta-1: "#F3C38B"
  terracotta-2: "#E39445"
  terracotta-3: "#C06A27"
  terracotta-4: "#84441A"
  rosso-1: "#EAA696"
  rosso-2: "#D2614B"
  rosso-3: "#A8352A"
  rosso-4: "#6E1F1A"
  giallo-1: "#F5DF95"
  giallo-2: "#E3BA47"
  giallo-3: "#BA8B26"
  giallo-4: "#7D5C1A"
  stone-white: "#F7F4EE"
  stone-cream: "#EDE3CC"
  stone-black: "#2A2522"
typography:
  display:
    fontFamily: "Young Serif, Georgia, serif"
    fontSize: "clamp(4.5rem, 12vw, 6rem)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Young Serif, Georgia, serif"
    fontSize: "clamp(2.5rem, 5vw, 3.75rem)"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Young Serif, Georgia, serif"
    fontSize: "1.625rem"
    fontWeight: 400
    lineHeight: 1.5
  wordmark:
    fontFamily: "Young Serif, Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 400
    lineHeight: 1.33
  verse:
    fontFamily: "Newsreader Variable, Georgia, serif"
    fontSize: "1.25rem"
    fontWeight: 400
    lineHeight: 1.55
  verse-compact:
    fontFamily: "Newsreader Variable, Georgia, serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.55
  status:
    fontFamily: "Newsreader Variable, Georgia, serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.5
  lede:
    fontFamily: "Figtree Variable, ui-sans-serif, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: "Figtree Variable, ui-sans-serif, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  button:
    fontFamily: "Figtree Variable, ui-sans-serif, sans-serif"
    fontSize: "1rem"
    fontWeight: 500
  input:
    fontFamily: "Figtree Variable, ui-sans-serif, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
  label:
    fontFamily: "Figtree Variable, ui-sans-serif, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1
  small:
    fontFamily: "Figtree Variable, ui-sans-serif, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
  caption:
    fontFamily: "Figtree Variable, ui-sans-serif, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.33
rounded:
  none: "0"
  tile: "2px"
  md: "0.3rem"
spacing:
  gutter: "1rem"
  gutter-wide: "3rem"
  tight: "0.75rem"
  exhibit-gap: "2.5rem"
  actions-gap: "2.75rem"
  column-gap: "3.5rem"
  verse-measure: "34rem"
components:
  button-primary:
    backgroundColor: "{colors.umber}"
    textColor: "{colors.limewash}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "0.625rem 1.25rem"
    height: "3rem"
  button-primary-hover:
    backgroundColor: "{colors.umber-lifted}"
  button-outline:
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "0.625rem 1.25rem"
    height: "3rem"
  button-outline-hover:
    backgroundColor: "{colors.plaster-shade}"
  button-ghost:
    textColor: "{colors.umber-soft}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "0.625rem 1.25rem"
    height: "3rem"
  button-ghost-hover:
    backgroundColor: "{colors.plaster-shade}"
    textColor: "{colors.ink}"
  input-rule:
    textColor: "{colors.ink}"
    typography: "{typography.input}"
    rounded: "{rounded.none}"
    height: "3rem"
  input-title:
    textColor: "{colors.ink}"
    typography: "{typography.headline}"
    rounded: "{rounded.none}"
  tooltip:
    backgroundColor: "{colors.umber}"
    textColor: "{colors.limewash}"
    typography: "{typography.caption}"
    rounded: "{rounded.md}"
    padding: "0.5rem 0.75rem"
  mosaic-panel:
    backgroundColor: "{colors.grout}"
    rounded: "{rounded.none}"
    width: "25rem"
  mosaic-panel-compact:
    backgroundColor: "{colors.grout}"
    rounded: "{rounded.none}"
    width: "17.5rem"
  loader-tile:
    rounded: "{rounded.tile}"
    size: "0.875rem"
---

# Design System: Ode

## Overview

**Creative North Star: "The Emblema on Plaster"**

Every ode is an exhibit: one square Roman floor mosaic, framed in stone bands and hung on a plaster wall, with the poem set below it. The mosaic holds the room's color, depth and texture. Everything else is limewashed wall, dark ink and a single oxblood red, so the picture reads as a made thing and the interface reads as the museum around it.

The system is quiet and low in density. A screen holds one panel, one title in a heavy old-style serif, and a centered column of text. The picture is drawn by Claude for each subject as flat closed shapes, then cut into stone in the browser: small tiles run in courses along every contour, the way a mosaicist's lines follow a form, with thin warm grout between them and a small shift of tone from tile to tile.

The signature moment is the laying. The picture appears first as a red-brown sketch on bare mortar, then tiles go down from each shape's outline inward, then the cream ground fills in around it. The poem waits until the last tile is down. Someone who prefers reduced motion gets the finished mosaic at once, and a returning reader finds it already laid.

**Key Characteristics:**

- One framed square mosaic per screen, centered above the text.
- A warm plaster page with dark ink and one interface hue.
- A closed palette of 31 stones that only ever appears as tiles.
- Three type voices: Young Serif names, Figtree operates, Newsreader sings.
- Depth reserved for the panel; the interface is otherwise flat.
- A timed laying sequence with a complete reduced-motion path.

## Colors

The "Plaster" scheme: a restrained warm-neutral interface with one red, around a full polychrome stone palette confined to the mosaic.

### Primary

- **Oxblood** (#a8352a): The interface's one hue. Focus rings, the active rule under a field, the text caret, error text, and the selection color (with limewash text). It holds 4.99:1 on plaster. It is the same stone as the innermost frame band, Rosso 3, so the page's accent is quarried from the picture.

### Secondary

The stones Claude draws with, each in four tones from lightest to darkest. Tile color codes are in parentheses.

- **Lapis** (b1 to b4, #BCD4E3 to #203E66): Blues.
- **Serpentine** (g1 to g4, #C6D7A2 to #33502A): Greens.
- **Slate** (k1 to k4, #E3E0DA to #4B4742): Grays. Slate 3 is the cast shadow under every drawn object.
- **Sienna** (n1 to n4, #DBC09E to #4A3423): Browns.
- **Terracotta** (o1 to o4, #F3C38B to #84441A): Oranges.
- **Rosso** (r1 to r4, #EAA696 to #6E1F1A): Reds. Rosso 1 is the palest step and the only pink-leaning stone; it exists to model light on a red object.
- **Giallo** (y1 to y4, #F5DF95 to #7D5C1A): Golds.

### Tertiary

The materials of the floor itself.

- **Stone Black** (K, #2A2522): The outer frame band, two tile courses deep, and a stone Claude may use.
- **Stone Cream** (C, #EDE3CC): The middle frame band, and a stone Claude may use.
- **Stone White** (W, #F7F4EE): The brightest stone Claude may use.
- **Ground Stone** (#E9E0CC): The empty field of every panel, laid around the picture last.
- **Grout** (#C4B79E): The bed the tiles sit in and the lines between them, 2.1px at the 720px canvas size.
- **Sketch Line** (rgba(150, 62, 40, 0.75)): The drawing on wet mortar before any picture tile goes down. It is only visible during the laying.

### Neutral

- **Plaster** (#e6e0d6): The page. Every screen sits directly on it.
- **Plaster Shade** (#dcd4c7): Hover fill for outline and ghost buttons.
- **Plaster Line** (#cfc6b8): The global default border color. No shipped surface draws a default border today.
- **Ink** (#221e1b): Text, field rules and the 2px comparison column rules (12.6:1 on plaster).
- **Umber** (#2b2420): The primary button and tooltips. **Umber Lifted** (#4a3e36) is the primary button's hover.
- **Soft Umber** (#5b5148): Secondary text, ledes, ghost button labels and status phrases (5.89:1 on plaster).
- **Limewash** (#f6f2ea): Text on umber and on oxblood selection.

### Named Rules

**The Stones Stay In The Floor Rule.** Stone colors appear on the page only as tiles: the panel and the twelve-tile loader. Text, fills and rules use the plaster neutrals and oxblood.

**The One Red Rule.** Oxblood is the only interface hue. It marks attention: focus, an active field, an error, a selection.

**The Closed Quarry Rule.** A picture is made only from the 31 named stone codes. The server drops any shape with another fill, so a drawing cannot introduce a color.

## Typography

**Display Font:** Young Serif, one weight (with Georgia, serif)
**Body Font:** Figtree Variable (with ui-sans-serif, sans-serif)
**Verse Font:** Newsreader Variable (with Georgia, serif)

**Character:** Young Serif has the weight of letters cut in a lintel, Newsreader is soft and bookish enough to carry short enjambed lines, and Figtree stays plain and out of the way for anything operated.

### Hierarchy

- **Display** (400, clamp(4.5rem, 12vw, 6rem), 1, -0.02em): "Ode" on the login page.
- **Headline** (400, clamp(2.5rem, 5vw, 3.75rem), 1.05, -0.02em): "Ode to {topic}" and other page titles, balanced and allowed to break anywhere so a long topic cannot overflow. The form sets "Ode to" at this size with the input inline, at 1.25 line height so the field fits.
- **Title** (400, 1.625rem, 1.5): Ode type names heading comparison columns.
- **Wordmark** (400, 1.5rem, 1.33): "Ode" in the logged-in header.
- **Verse** (400, 1.25rem, 1.55): The poem, left-aligned at up to 34rem, with a 1.5rem hanging indent on wrapped lines and 1.1em between stanzas. **Verse compact** (1.125rem, 1.55) sets the comparison columns.
- **Status** (Newsreader 400, 1.125rem, 1.5): Rotating progress phrases, 40ch at most.
- **Lede** (Figtree 400, 1.125rem, 1.5): The form hint and the declined reason, soft umber, balanced, 40 to 44ch. **Body** (1rem, 1.5) carries the ode type line.
- **Button** (500, 1rem) and **Input** (400, 1.125rem): Controls.
- **Label** (500, 0.875rem, 1) names a field. **Small** (400, 0.875rem) is column descriptions. **Caption** (400, 0.75rem) is tooltip text.

### Named Rules

**The Three Voices Rule.** Young Serif names things: the wordmark, titles, column headings. Newsreader carries anything sung or murmured: verse and progress phrases. Figtree carries everything operated or explained.

**The Single Weight Rule.** Young Serif ships in one weight (400). Hierarchy in display type comes from size alone.

## Layout

The layout is "Exhibit": one column on the center axis, with one framed panel above the text. The page has a slim header (wordmark left, Log out right) and a main column that centers everything. Header padding is 1rem and widens to 1.5rem by 3rem at 48rem; main has a 1rem gutter and 5rem of bottom padding.

The panel is square, 100% wide up to 25rem, and stays the same size through form, progress, declined and result, so the wall does not rearrange as the ode is made. The title sits 2.5rem below it. On the result, the type line, verse and actions follow on that axis, with the verse block left-aligned inside its centered 34rem measure and the actions 2.75rem below it, wrapping with 0.75rem gaps.

Comparison shrinks the panel to 17.5rem to give the poems room. Columns stack at up to 34rem and become three at 80rem, within 77.5rem and 3.5rem apart. Each column is headed by a 2px ink rule with 1.25rem above its title. Text aligns left there, because parallel poems need a shared edge.

Login is the one screen without a panel: the Ode wordmark at display size, centered on the full viewport, over a 24rem form.

### Named Rules

**The One Exhibit Rule.** A screen holds one panel, centered, above its text. Comparison shows several poems and still one picture.

## Elevation & Depth

Depth is reserved for the mosaic. The panel carries a two-layer warm shadow, as if the slab stands proud of the wall; the page is otherwise flat, with only a hairline shadow under the primary button to seat it. Texture and relief inside the panel come from tiles, grout and tone shift, all painted into the canvas.

### Shadow Vocabulary

- **Exhibit** (`box-shadow: 0 2px 3px rgb(52 40 30 / 0.18), 0 28px 60px -18px rgb(52 40 30 / 0.45)`): The mosaic panel, at every size, always.
- **Seat** (`box-shadow: 0 1px 2px rgb(43 36 32 / 0.3)`): The primary button only.

### Named Rules

**The Only Heavy Object Rule.** The deep shadow belongs to the panel. Nothing else on the wall casts one.

## Shapes

The panel is a hard square with no radius, because a slab has corners. Interface forms are near-square: buttons and tooltips use a slight 0.3rem radius, and fields have no box at all, only a rule beneath the text.

The tile is the system's real unit: 13px nominal on the 720px canvas, set at least 0.92 of that apart. Tiles are not grid squares. Each one is the cell around a point placed on a course that runs parallel to a shape's edge, so lines of stone bend around the picture. The loader's tiles are small flat squares (0.875rem) with a 2px radius and a slight tilt.

The frame is built from tile courses: stone black two courses deep at the outside, then stone cream one course, then rosso 3 one course, then one course of ground before the picture begins. The picture is inset five tile widths from each edge.

### Named Rules

**The Course Follows The Form Rule.** Tiles run along contours, never across a fixed grid. That is what makes the panel a mosaic and not a pixelated image.

## Components

Controls are shadcn primitives restyled to sit quietly on plaster; the panel does all the speaking.

### Buttons

- **Shape:** Slightly softened corners (0.3rem), 3rem minimum height.
- **Primary:** Umber with limewash text and a 2px matching border. At most one per view: "Write my ode", "Write another ode", "Log in".
- **Hover / Focus:** Colors transition on hover; primary lifts to umber lifted. Focus is a 2px oxblood outline, offset 3px. Disabled drops to 60% opacity.
- **Outline:** 2px ink border on no fill, plaster shade on hover. Secondary actions and suggested topics, whose labels may wrap.
- **Ghost:** Soft umber text with no border, ink on plaster shade on hover. "Log out", "Enter a different topic".

### Inputs / Fields

- **Style:** No box. Transparent, square, with a 2px ink rule beneath and an oxblood caret. Height 3rem.
- **Title field:** The topic field is set inside the headline, following the words "Ode to", with a 3px rule. It sizes to its content between 5ch and min(16ch, 80vw), and falls back to 9ch where content sizing is unsupported.
- **Focus:** The rule turns oxblood; the password field's rule also thickens to 3px.
- **Error / Disabled:** Oxblood text at weight 500 beneath the field, announced as an alert; the password field's rule also turns oxblood. Disabled fields drop to 60% opacity.

### Tooltip

Umber with limewash caption text, 0.3rem radius, 20rem at most. It explains the Pindaric section names in a poem; the trigger is dotted-underlined and opens on click as well as hover.

### Mosaic Panel

The system's signature. A square canvas 720px on a side, scaled to its container, with the Exhibit shadow and a screen-reader label. It has three states.

- **Waiting:** The empty panel (form, progress, declined). The first time on a page load, the frame's tiles go down around bare grout in a clockwise sweep over 1100ms. After that, or with reduced motion, the framed bed is painted at once.
- **Laying:** The sketch sits on the mortar for 650ms. Picture tiles then go down course by course from each shape's outline inward over 1900ms, then the ground over 1500ms. Both use a cubic ease-out over the count of tiles.
- **Laid:** The finished mosaic, with no animation. Used for returning views and comparison.

With prefers-reduced-motion, laying skips straight to the finished mosaic and reveals the poem immediately. On a fresh ode, the verse and actions stay hidden until the panel reports it is laid, then enter with the rise animation (800ms, cubic-bezier(0.16, 1, 0.3, 1), from 12px down and a 4px blur). Tile tone shifts by up to 9 levels per channel, from a fixed seed, so a drawing always lays the same way.

**How Claude draws.** Claude acts as a mosaicist and returns flat closed SVG paths with a stone code, on a 240-unit square, listed back to front. Its brief is an emblema from a Pompeii floor: one recognizable object, about 65% of the canvas, centered and whole, naturalistically modeled with three or four tones of each color lit from the upper left, with a soft Slate 3 cast shadow to the lower right and an empty background. Every piece is at least 10 units across so the tiles can resolve it. The server keeps at most 60 structurally valid shapes. With fewer than five, or if the drawing fails, the ode ships with its empty framed panel.

### Tile Loader

Twelve small stone tiles in a row, 0.25rem apart, each placed and lifted in turn (2.6s loop, 90ms stagger, tilts of up to 4 degrees), above a rotating status phrase. Stone colors repeat in the order rosso, serpentine, terracotta, lapis, stone black, giallo. With reduced motion the tiles sit still and fully visible.

## Do's and Don'ts

### Do:

- **Do** put new screens on plaster with one panel centered above the text, 2.5rem above the title.
- **Do** keep the panel the same size across a flow so the wall stays still.
- **Do** run new hues through the stone palette, as tile colors only.
- **Do** give every new motion a reduced-motion path that ends on the finished state, as the mosaic does.
- **Do** hold back the poem until a fresh mosaic is laid.

### Don't:

- **Don't** introduce pink to the page, the frame or any interface element. The user dislikes it. Rosso 1 stays a highlight inside a modeled red object.
- **Don't** give anything but the panel the Exhibit shadow.
- **Don't** add a second picture to a screen, or box the text in cards; text sits directly on plaster.
- **Don't** replace tile courses with a fixed grid or a pixelated image.
- **Don't** ask the generator for stroked contours; the shapes are filled and the courses of tile supply the line.
- **Don't** ask the generator for letters, numerals, people or faces on objects. This is a limit of its current brief, chosen so a stranger can name the subject; the Roman originals have all of them.
