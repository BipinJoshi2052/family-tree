FAMILY TREE APP (v1.3)
======================

What's in this folder
---------------------
  index.html        The app's starting page (splash screen). Open it in Chrome or Edge.
  welcome.html, login.html, trees.html, editor.html
                    The app's other screens. index.html takes you to whichever one
                    applies; you shouldn't normally need to open these directly.
  css/, js/         Styles and scripts, one file per screen plus a few shared ones.
  lib/              jQuery and Bootstrap, so the app works offline.
  trees/            Your family trees. One JSON file per tree, named after the tree.
    index.json      List of the tree files. The app keeps it up to date.
    Whitmore-Reed Family.json
    Ortiz Family.json
    Novak side (draft).json
    Shrestha Family.json   (opens in Nepali; two people have no Nepali name)
    Shrestha Lineage.json  (your lineage list: 123 people)
    images/                Photos you upload - see "Photos" below.
    Karim Family.json      (shared with you, role: editor)
    Shah Family.json       (shared with you, role: viewer)

How to use it
-------------
1. Double-click index.html (Chrome or Edge).
2. Sign in (any email and password, or the demo Google option).
3. On "My trees", click "Link trees folder" and choose the trees folder
   (choosing the family-tree-app folder also works).
4. Allow the browser to view and save files. Your trees load from the JSON files.

From then on every change is written straight back to the files:
  - Adding a person in the editor updates that tree's file.
  - Renaming a tree renames its file.
  - New trees and copies get a new file; deleting a tree deletes its file.
The app remembers the folder. Next time, the browser may ask you to allow access
again; click "Reconnect folder".

Photos (new in 1.3)
-------------------
With the trees folder linked, a photo you upload (when adding a person, or with
"Upload photo" / "Change photo" in their Details window) is cropped square and
saved as two JPGs:
  trees/images/original/<tree id>/<person id>.jpg   full size, used in the Details window
  trees/images/thumb/<tree id>/<person id>.jpg       a small copy, used everywhere else
    (the tree view, card previews) so showing many people at once stays fast
The tree file stores the "original" path in "img"; the app derives the thumb path
from it, so there's nothing extra to manage. Replacing or removing a photo deletes
both old files; deleting a tree deletes both photo folders (unless a copy of the
tree still uses them). Photos you've already opened are cached in the browser, so
reopening the app or switching trees doesn't re-read them from disk every time.
If the folder isn't linked, the photo is stored inside the tree file instead (no
separate original/thumb files in that case).
Downloading a tree's JSON doesn't include its photos; copy the images folder too.

Languages (new in 1.2)
----------------------
Settings > Languages: English is always on. Turn on नेपाली (Nepali) to:
  - get a "Nepali name" field when you add a person (optional),
  - add or edit a person's Nepali name from their Details window,
  - get a language switch (EN / ने) at the top of every tree.
Each tree has a default language: the tree opens in it. Change it from the
language switch: pick a language, then "Open this tree in … by default".
If someone has no Nepali name, their English name is shown in Nepali view.
Turning Nepali off hides it everywhere; Nepali names stay saved in the files.

Other ways to open it
---------------------
- Firefox and Safari can't link folders. Use "Import JSON files" to view trees and
  "Download JSON file" on a tree to save changes as a file.
- If you serve the folder (for example: python -m http.server, then open
  http://localhost:8000), the app reads trees/ automatically, read-only, until you
  link the folder.

JSON file format
----------------
{
  "name": "Ortiz Family",       tree name (also the file name)
  "role": "owner",              owner | editor | viewer
  "owner": {...},               only for trees shared with you
  "created" / "updated":        ISO dates
  "starred", "access":          private | link
  "defaultLang": "en" | "ne"    language the tree opens in
  "collaborators": [...],       name, email, role, status (active | invited)
  "people": [                   one entry per person
    { "id", "name", "nameNe": Nepali name (optional), "gender": "male|female", "birthDate": "YYYY-MM-DD",
      "status": "living|deceased", "deathDate", "birthplace",
      "fid": father id, "mid": mother id,
      "pids": [spouse ids, several allowed], "img", "bio" }
  ]
}
"img": "images/original/<tree id>/<person id>.jpg" for an uploaded photo (the thumb
lives alongside it at images/thumb/...); "@auto" draws a placeholder portrait; ""
shows a silhouette; or use an image URL.
