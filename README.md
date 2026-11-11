# Lucid — a theme for EspoCRM

Lucid is a light, readable theme for [EspoCRM](https://www.espocrm.com/) with a modern SaaS feel.
It reworks the record view — fields on one side, activity on the other, or the classic EspoCRM
arrangement, your choice — adds a band with the record's owner and pipeline stages, and makes every
block collapsible.
It uses a deep indigo (`#292B6B`) for actions and cyan (`#00B6ED`) as the signature accent, comes
with a dark palette that can follow the operating system, and targets WCAG 2.1 AA / RGAA.

![Lead record with the stage band, the About card and the activity stream](docs/screenshots/record-lead.png)

## In motion

![Creating a call from the quick actions, folding blocks and moving a lead along its pipeline](docs/screenshots/demo-overview.gif)

Quick actions open EspoCRM's own side panel, every block folds like an accordion, and a click on a
stage moves the record along its pipeline.

| | |
|---|---|
| ![Resizing the About column and folding a section](docs/screenshots/demo-resize-collapse.gif) | ![Showing and hiding empty fields](docs/screenshots/demo-empty-fields.gif) |
| Drag the handle between the columns to widen About; fold the sections you don't need | Empty fields stay out of the way until you ask for them |

![Folding and unfolding the groups of the side menu](docs/screenshots/demo-menu-groups.gif)

A click on a title of the side menu folds its group; the page you are on stays visible.

![Switching between Light, Dark and System from the top bar](docs/screenshots/demo-dark-mode.gif)

The button next to the notifications switches the palette at once; System follows the operating system.

## Three themes

The extension adds three themes to EspoCRM's theme list. They share the same design and features;
the colours, typefaces and shapes change.

- **Lucid**: deep indigo actions, cyan accent, the Lexend typeface.
- **Lucid Monochrome**: white and near-black, black actions, tables in a full grid, the Inter
  typeface.
- **Lucid Brut**: thick outlines, hard shadows, yellow and pink, the Space Grotesk typeface.

Each one has its light and dark palette. The administrator picks the theme in **Administration >
User Interface**, each user in **Preferences** or from the Appearance menu of the top bar, unless
the administrator imposes the theme.

## Two layouts

The record view comes in two layouts, picked from the Appearance menu of the top bar. They share the
same design and features; only the arrangement of the record view changes.

| **Split** | **Classic** |
|---|---|
| ![Split layout: fields on the left, activity on the right](docs/screenshots/record-lead.png) | ![Classic layout: fields and bottom panels on the left, side panels on the right](docs/screenshots/record-lead-classic.png) |
| Fields on the left, bottom panels on the right: the activity is visible as soon as the record opens | Fields and bottom panels on the left, side panels on the right, as in stock EspoCRM |

The administrator sets the default layout in **Administration > User Interface**, below the theme;
each user can still pick the other one.

## Screenshots

| | |
|---|---|
| ![Contact record](docs/screenshots/record-contact.png) | ![Account record](docs/screenshots/record-account.png) |
| Contact: About card, Record info card, quick actions and stream | Account: layout panels on the left, relationship tabs on the right |
| ![Opportunity list](docs/screenshots/list-opportunities.png) | ![Create call side panel](docs/screenshots/create-call.png) |
| List as a card, marked column headers, coloured record links, stage badges | Native EspoCRM side panel, detached from the page |

All data in the screenshots is fictitious.

## Features

- **Side-by-side record view** (Split layout). The **About** card on the left holds the layout panels as a
  compact property list (tab breaks become tabs, styled like those of the main column), followed by a **Record info** card
  (assigned user, teams, dates, followers) and the side panels (Activities, History, Tasks…). The
  right column starts with the **Stream** tab — quick actions (Note, Email, Call, Meeting, Task)
  above the stream as a timeline — then one tab per bottom panel, with its count. Which panels show
  where is left to the layouts set in the Entity Manager: side panels on the left, bottom panels on
  the right, exactly as configured.
- **Band** at the top of each record: name, assigned users and teams, record actions and, for
  entities with an active pipeline, the stage path (click a stage to move the record if you may
  edit it). On narrow screens the path folds into the current stage and a progress bar; tap it to
  see every stage.
- **Collapsible blocks.** About, Record info, the side panels, each layout panel and the bottom
  panels block fold like an accordion. The state is remembered per user and record type; everything
  opens while editing.
- **Collapsible menu groups.** A click on a title of the side menu (CRM, Activities…) folds the items
  below it, up to the next title. The page in progress stays visible, the state is remembered per
  user, and an icons-only menu keeps every item.
- **Adjustable column.** A handle between the columns sets the width of the narrow column, from 300
  to 720 px (mouse, or arrow keys / Home / End; double-click to reset), remembered per user and per
  layout. The main column keeps at least 480 px.
- **Empty fields hidden** behind a "Show N empty fields" link, all shown while editing.
- **Readability.** One typeface for text and titles (Lexend in the Lucid theme); labels as large as values; record
  links coloured so that what is clickable stands out; comfortable form fields.
- **Light palette.** White sidebar, ice-blue top bar and record band, cards with a cyan corner mark.
  Colours are CSS tokens (`--lucid-band-*`, `--lucid-sidebar-*`, `--lucid-table-*`), easy to retune.
- **Appearance menu.** A button in the top bar (next to the notifications; in the menu on a phone),
  each choice saved in the user's preferences and applied at once, without reloading the page:
  - **Theme:** Lucid, Lucid Monochrome or Lucid Brut (see above), EspoCRM's own theme preference.
    Shown when users may choose their theme; the administrator's theme is marked as the default.
  - **Mode:** Light, Dark, or System, which follows the operating system, even when it switches at
    nightfall. Each theme has its dark palette; Lucid's tints its surfaces towards the indigo.
  - **Layout:** Split or Classic (see above). A record on screen is shown again in the new layout.
    The default layout is set in **Administration > User Interface**, below the theme.
  - **Density:** Comfortable or Compact (13 px text, lower rows and fields: about 30 % more rows
    in a list).

  Mode, layout and density stay available when the administrator imposes the theme. E-mail bodies,
  code editors, charts and the calendar follow the theme and the palette, as with EspoCRM's own
  Dark theme; e-mails that bring their own colours stay on a light background.
- **Marked table columns.** Tinted uppercase headers with vertical lines, a cyan tint when hovering a
  column, and a clearer row hover, in lists and in the tables of a record.
- **Quiet loading indicator.** EspoCRM's spinner becomes a small white pill with a turning cyan ring
  in the top bar, and only shows when a wait is long enough to notice.
- **Speaks every EspoCRM language.** Labels come from EspoCRM's own translations; the theme's own
  (the Appearance menu, the empty-fields link, the Record info title) are translated into every
  language EspoCRM ships.

Knowledge base articles (and any entity with a rich-text `body`) keep their fields in the main
column, full width. Email and User records, and detail views opened in dialogs, keep the EspoCRM
layout. Panel actions, inline editing and access rights are EspoCRM's own. Panel colours chosen in
the layouts (Danger, Warning, Success, Info, Primary) show as in EspoCRM: a tinted band across the
block with the title in colour, in the About card, the side cards and the main column alike.

## Accessibility

- Text contrast of at least 4.5:1 and form field borders of at least 3:1, checked for every colour
  of both palettes;
  titles and action icons on coloured panel headings (Danger, Warning…) are darkened to stay above
  4.5:1 on their tint.
- Visible keyboard focus, including on dark areas; reduced motion when the system asks for it.
- The record name is the page heading; pipeline steps wrap instead of being cut when zoomed.
- The page declares its language and allows zooming on mobile (EspoCRM does neither by default).
- Custom controls (tabs, accordions, column handle) expose their state to screen readers.

Some remaining issues come from EspoCRM's own markup (icon-only buttons, unlabeled list
checkboxes) and are outside the scope of a theme.

## Install

Requires EspoCRM 10.0 or later and PHP 8.3+ (tested on 10.0.3, 10.0.11 and 10.1.0).

1. Download `lucid-theme-<version>.zip` from the
   [latest release](https://github.com/AlexisSantin/espocrm-lucid-theme/releases/latest).
2. In EspoCRM: **Administration > Extensions > Upload**, choose the ZIP, then **Install**.
3. Select **Lucid**, **Lucid Monochrome** or **Lucid Brut** in **Administration > User Interface >
   Theme** (default for everyone, also used on the login page) or per user in **Preferences**.
4. Below the theme, on the same page, choose the default record layout. Each user can then pick
   another theme, layout, mode or density from the Appearance menu of the top bar.

Updates install the same way, over the previous version, and keep everyone's look:
- up to 0.20, Lucid Classic and Lucid Split were two themes: whoever used Lucid Classic (default
  theme, users, portals) moves to Lucid with the Classic layout, and those who had chosen Lucid
  Split keep the Split layout;
- in 0.21, Monochrome and Brut were styles chosen in the Appearance menu: the default style becomes
  the default theme (Lucid Monochrome or Lucid Brut), and each user's style becomes their theme.

## Development

```bash
cd lucid-theme
npm install
npm run sync          # copy src/files into ../site
npm run clear-cache   # after metadata or translation changes
npm run extension     # build build/lucid-theme-<version>.zip
```

- The CSS files imported by `lucid.css` and `lucid-iframe.css` carry `?v=<version>`: bump it
  together with `package.json` on every release so browsers drop stale copies.
- The module is bundled: in production EspoCRM loads `lib/module-lucid-theme.js` through
  `lib/init.js`, listed in `app/client.json` `scriptList`. Developer mode loads the transpiled
  sources instead, so test a release on an instance with developer mode off.
- The record layout is the `lucidLayout` preference, else the `lucidLayout` setting (the
  administrator's default), else Split; the handler picks the record template from it (`getLayout`
  in `src/lucid.js`), and the column width is remembered per layout. `src/scripts/AfterInstall.php`
  moves the former `LucidClassic` theme (system, preferences, portals) to `Lucid` with the Classic
  layout, without replacing a layout already chosen, and the 0.21 styles (`lucidStyle` preference
  and setting) to the Lucid Monochrome and Lucid Brut themes.
- The record view is applied by a `record/detail` view setup handler that derives the bottom view
  configured for the entity instead of replacing it. If it cannot apply (an unexpected EspoCRM
  version, for instance), the record keeps the EspoCRM layout. Apart from the top bar button, an
  EspoCRM view, the module imports no EspoCRM client module, and it never uses admin-only
  translation scopes (they are not sent to regular users).
- Themes: the three themes share one stylesheet and differ by their style. Each theme declares it
  in its `lucidStyle` parameter (`isLucidTheme` and `getStyle` in `src/lucid.js`) and has its own
  entry stylesheet, `css/lucid.css` or `css/lucid-<style>.css`, which imports `lucid.css` and sets
  `--theme-name` (EspoCRM checks it to know the user's theme is applied).
- Appearance: `js/appearance.js`, a plain script listed before the stylesheet, sets
  `data-lucid-style`, `data-lucid-scheme` and `data-lucid-density` on the root element, so a page
  never flashes the default look. The style comes from the name of the theme's stylesheet (followed
  when EspoCRM swaps it for the user's theme); the palette and density from the choices remembered
  by the browser. The dark palette (`css/lucid-dark.css`), the density (`css/lucid-density.css`)
  and each style (`css/lucid-style-<name>.css`) redefine the tokens under those attributes; a
  style's light block is scoped to `:not([data-lucid-scheme="dark"])` and its dark block sets every
  value on top of the dark palette. The top bar button stores the theme in EspoCRM's `theme`
  preference (the Lucid themes share their stylesheet, so it applies without reloading) and the
  other choices in the `lucidColorScheme`, `lucidLayout` and `lucidDensity` preferences. The
  administrator's default layout is the `lucidLayout` setting, which `src/handlers/user-interface.js`
  (a `record/edit` setup handler of Settings) inserts below the theme in EspoCRM's own layout of
  Administration > User Interface, instead of replacing that layout.
  EspoCRM reads `isDark`, the e-mail stylesheets and the chart and calendar colours from theme
  parameters: each theme declares them for the light palette, and the theme manager returns the
  theme's `lucidDark` values instead while the dark palette applies (`src/helpers/appearance.js`).
  If that cannot apply, those elements keep the look of the light palette.
- A new theme: a `css/lucid-style-<name>.css` file imported by `lucid.css`, an entry stylesheet
  `css/lucid-<name>.css`, its swatch in `lucid-shell.css`, its e-mail stylesheets, and a
  `metadata/themes/<Theme>.json` with `"lucidStyle": "<name>"` and its `lucidDark` values; the
  Appearance menu lists it on its own.

```
src/files/custom/Espo/Modules/LucidTheme/Resources/
    metadata/themes/Lucid*.json         the three themes: style, parameters, chart and calendar colours,
                                        and their values in the dark palette (lucidDark)
    metadata/app/client.json            js/appearance.js, lib/init.js (bundle loader in production)
    metadata/app/clientNavbar.json      top bar button (theme, mode, layout, density)
    metadata/entityDefs/Preferences.json  the lucidColorScheme, lucidLayout and lucidDensity preferences
    metadata/entityDefs/Settings.json   lucidLayout, the administrator's default layout
    metadata/clientDefs/Global.json     view setup handlers
    metadata/clientDefs/Settings.json   the default layout on Administration > User Interface
    i18n/en_US, i18n/fr_FR              the theme's own labels
src/files/client/custom/modules/lucid-theme/
    css/lucid.css                       entry point (imports the stock light theme, then the layers)
    css/lucid-monochrome.css, -brut.css entry points of Lucid Monochrome and Lucid Brut
    css/lucid-tokens.css                colours, radii, shadows, band and sidebar tokens
    css/lucid-espo-vars.css             EspoCRM variables mapped to the tokens
    css/lucid-*.css                     base, shell, controls, data, record, detail, overlays, login
    css/lucid-dark.css                  dark palette
    css/lucid-density.css               compact density
    css/lucid-style-monochrome.css      Monochrome style, light and dark
    css/lucid-style-brut.css            Brut style, light and dark
    css/lucid-iframe-*.css              e-mail bodies per style and palette
    res/templates/record/detail*.tpl    record view templates
    src/handlers/record-detail.js       applies the record view
    src/handlers/page-a11y.js           document language and zoom
    src/handlers/user-interface.js      default layout on Administration > User Interface
    src/helpers/record-band.js          band: identity, people, pipeline stage path
    src/helpers/panel-collapse.js       collapsible blocks
    src/helpers/column-resizer.js       width handle for About
    src/helpers/empty-fields.js         hides empty fields
    js/nav-groups.js                    collapsible groups of the side menu (plain script)
    js/appearance.js                    applies style, palette and density before the page shows (plain script)
    src/views/navbar/appearance.js      top bar button: theme, mode, layout, density
    src/helpers/appearance.js           EspoCRM's theme parameters in the dark palette
    src/mixins/detail-bottom.js         right column: tabs, quick actions, counts
    fonts/                              Lexend, Inter, Space Grotesk (OFL)
src/scripts/AfterInstall.php            upgrades: Lucid Classic, then the 0.21 styles, to themes
```

## License

GPL-3.0-or-later. The bundled Lexend, Inter and Space Grotesk typefaces are licensed under the
SIL Open Font License 1.1 (`fonts/Lexend-OFL.txt`, `fonts/Inter-OFL.txt`,
`fonts/SpaceGrotesk-OFL.txt`).
