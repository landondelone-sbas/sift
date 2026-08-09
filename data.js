/* Sift — reference data.
   Loaded as a plain script, not fetched as JSON, so the app also works
   when opened directly from disk (file:// blocks fetch of local files).

   Each entry carries the ONE variant question that separates a real find
   from a common piece. `yes` is the tier floor if the answer is yes.
   `hyped: true` marks names that are famous but almost always common —
   they are on the list so you get a fast, definitive no.
   No prices anywhere: this tool flags candidates, it does not appraise. */

const WATCHLIST = [
  {n:"Peanut", a:["elephant"], q:"Is the blue a deep royal or navy blue — not pale periwinkle?", yes:1, note:"The royal blue Peanut is the one piece in this category with a consistent high-value record."},
  {n:"Brownie", a:["cubbie"], q:"Does the tag read Brownie, not Cubbie?", yes:1, note:"Brownie was renamed Cubbie almost immediately. The original name is scarce."},
  {n:"Nana", a:["bongo","monkey"], q:"Does the tag read Nana, not Bongo?", yes:1, note:"Nana was renamed Bongo. The original name is scarce."},
  {n:"Pinchers", a:["punchers","lobster"], q:"Does either tag read Punchers instead of Pinchers?", yes:1, note:"A genuine cross-tag misprint on an Original 9 piece."},
  {n:"Chilly", a:["polar bear"], q:"Does the hang tag have no poem inside (1st–3rd generation)?", yes:1, note:"Short production run, retired 1995."},
  {n:"Peking", a:["panda"], q:"Does the hang tag have no poem inside (1st–3rd generation)?", yes:1, note:"Short production run, retired 1995."},
  {n:"Humphrey", a:["camel"], q:"Does the hang tag have no poem inside (1st–3rd generation)?", yes:1, note:"Short production run, retired 1995."},
  {n:"Slither", a:["snake"], q:"Does the hang tag have no poem inside (1st–3rd generation)?", yes:1, note:"Short production run, retired 1995."},
  {n:"Web", a:["spider"], q:"Does the hang tag have no poem inside (1st–3rd generation)?", yes:1, note:"Short production run, retired 1995."},
  {n:"Trap", a:["mouse"], q:"Does the hang tag have no poem inside (1st–3rd generation)?", yes:1, note:"Short production run, retired 1995."},
  {n:"Teddy", a:["old face","bear"], q:"Is it an OLD FACE teddy — flat muzzle, eyes set wide to the sides — in violet, magenta, jade, teal or cranberry?", yes:1, note:"New-face teddies in these colours are far more common."},
  {n:"Quackers", a:["quacker","duck"], q:"Is it the version with NO wings?", yes:1, note:"The wingless first run is scarce."},
  {n:"Patti", a:["platypus"], q:"Is the fur deep maroon — noticeably darker than bright magenta?", yes:1, note:"The maroon first run is scarce. Magenta Patti is common."},
  {n:"Inky", a:["octopus"], q:"Is it tan or grey AND has no mouth?", yes:1, note:"Pink Inky with a mouth is common."},
  {n:"Happy", a:["hippo"], q:"Is the hippo GREY, not lavender?", yes:1, note:"Lavender Happy is common."},
  {n:"Digger", a:["crab"], q:"Is the crab ORANGE, not red?", yes:1, note:"Red Digger is common."},
  {n:"Spot", a:["dog"], q:"Is it the version with NO spot on its back?", yes:1, note:"The spotless first run predates the design change."},
  {n:"Lucky", a:["ladybug"], q:"Does it have exactly 7 glued-on felt spots (not printed spots)?", yes:1, note:"Printed-spot versions, including the 21-spot, are common."},
  {n:"Employee bear", a:["employee","staff bear"], q:"Is there a tush tag but no hang tag, and no retail name?", yes:1, note:"Very small run, given to Ty staff. Needs third-party authentication."},
  {n:"Sting", a:["stingray","ray"], q:"Does the hang tag have no poem inside (1st–3rd generation)?", yes:1, note:"Early tie-dye ray."},
  {n:"Rex", a:["dinosaur","t-rex"], q:"Does the hang tag have no poem inside (1st–3rd generation)?", yes:1, note:"1995 dinosaur trio, short run."},
  {n:"Bronty", a:["dinosaur","brontosaurus"], q:"Does the hang tag have no poem inside (1st–3rd generation)?", yes:1, note:"1995 dinosaur trio, short run."},
  {n:"Steg", a:["dinosaur","stegosaurus"], q:"Does the hang tag have no poem inside (1st–3rd generation)?", yes:1, note:"1995 dinosaur trio, short run."},

  {n:"Legs", a:["frog"], q:"Does the hang tag have no poem inside (1st–3rd generation)?", yes:2, note:"Original 9. Later-generation examples are common."},
  {n:"Squealer", a:["pig"], q:"Does the hang tag have no poem inside (1st–3rd generation)?", yes:2, note:"Original 9. Later-generation examples are common."},
  {n:"Flash", a:["dolphin"], q:"Does the hang tag have no poem inside (1st–3rd generation)?", yes:2, note:"Original 9. Later-generation examples are common."},
  {n:"Splash", a:["whale","orca"], q:"Does the hang tag have no poem inside (1st–3rd generation)?", yes:2, note:"Original 9. Later-generation examples are common."},
  {n:"Chocolate", a:["moose"], q:"Does the hang tag have no poem inside (1st–3rd generation)?", yes:2, note:"Original 9. Later-generation examples are common."},
  {n:"Cubbie", a:["bear"], q:"Does the hang tag have no poem inside (1st–3rd generation)?", yes:2, note:"Original 9. Later-generation examples are common."},

  {n:"Britannia", a:["uk bear"], q:"Is the flag an embroidered patch rather than printed?", yes:2, note:"UK exclusive. Counterfeits are common — check the stitching quality."},
  {n:"Maple", a:["canada bear"], q:"Does the tush tag read Pride rather than Maple?", yes:2, note:"Canadian exclusive with an early name error."},
  {n:"Erin", a:["ireland bear"], q:"Does the hang tag have no poem, or an obvious print error?", yes:2, note:"Irish-themed release, widely produced."},
  {n:"Libearty", a:["liberty"], q:"Does the tush tag or hang tag carry a printing error?", yes:2, note:"1996 US release; error versions carry the premium."},
  {n:"Garcia", a:["tie dye bear"], q:"Does the hang tag have no poem inside (1st–3rd generation)?", yes:2, note:"Retired 1997 tie-dye bear."},
  {n:"Peace", a:["tie dye"], q:"Is this an early example — hand-signed, or an unusual dye pattern?", yes:2, note:"Late-run Peace bears are extremely common."},
  {n:"Curly", a:["bear"], q:"Is there an obvious tag or stitching error?", yes:2, note:"Mass-produced without an error."},

  {n:"Princess", a:["princess diana","diana"], q:"Does the tush tag read P.V.C. PELLETS?", yes:2, hyped:true, note:"MYTH: not worth thousands. Millions were made. The PE-pellet version — which is nearly all of them — trades in the single-to-low-double digits."},
  {n:"Millennium", a:["millenium","new millennium"], q:"Does the hang tag have no poem inside (1st–3rd generation)?", yes:2, hyped:true, note:"MYTH: the 'Millenium' spelling appears on nearly every one of these. A universal misprint is not an error premium."},
  {n:"Mystic", a:["unicorn"], q:"Is the horn iridescent AND the mane coarse and yarn-like (earliest run)?", yes:2, hyped:true, note:"MYTH: four versions were made across 1994–99. Most trade around the price of a coffee."},
  {n:"Valentino", a:["valentina"], q:"Is the name misspelled on the tag, or is the nose brown rather than black?", yes:2, hyped:true, note:"MYTH: standard Valentino is common. Only the documented variants matter."},
  {n:"Iggy", a:["iguana","rainbow"], q:"Is Iggy tie-dyed with a tongue, or Rainbow plain-coloured — i.e. the tags were swapped?", yes:2, hyped:true, note:"The Iggy/Rainbow tag swap is real but was produced in quantity."},
  {n:"Snort", a:["tabasco","bull"], q:"Does the tag read Tabasco rather than Snort?", yes:2, hyped:true, note:"Tabasco was renamed after a trademark dispute. Snort itself is common."},
  {n:"Halo", a:["angel bear"], q:"Is the nose brown rather than black?", yes:2, hyped:true, note:"Brown-nose Halo is the only variant that matters."},
  {n:"Tusk", a:["tuck","walrus"], q:"Is the name misspelled as Tuck on the hang tag?", yes:2, hyped:true, note:"Correctly-spelled Tusk is common."},
  {n:"Spinner", a:["creepy","spider"], q:"Does the tush tag read Creepy rather than Spinner?", yes:2, hyped:true, note:"Correctly-tagged Spinner is common."},
  {n:"Gobbles", a:["turkey"], q:"Does it have a double wattle — two red flaps, not one?", yes:2, hyped:true, note:"Single-wattle Gobbles is common."},
  {n:"Magic", a:["dragon"], q:"Is the stitching on the wings hot pink rather than pale pink?", yes:2, hyped:true, note:"Pale-pink stitching is the common version."},
  {n:"Tank", a:["armadillo"], q:"Does it have 7 or 9 ridged lines AND no shell?", yes:2, hyped:true, note:"The 9-line-with-shell version is common."},
  {n:"Snowball", a:["snowman"], q:"Does the scarf have string fringe rather than cut fabric?", yes:2, hyped:true, note:"Cut-fabric scarf is the common version."},
  {n:"Bubbles", a:["fish"], q:"Is there a documented tag error, or a no-poem early tag?", yes:2, hyped:true, note:"Standard Bubbles is common."}
];
