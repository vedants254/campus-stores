# Campus Stores

Campus Stores is a Product Engineer work sample set at a fictional campus media equipment desk. The [candidate brief](CANDIDATE_BRIEF.md) is separate from the staff interface.

## Run the app

Open `index.html` in a modern browser. The app includes its scripts, styles, and icons and can run offline.

To serve it over local HTTP, run this from the repository folder and visit `http://localhost:8000`.

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Each browser stores its own sample shift locally when browser storage is available. **Restart sample shift** restores the fictional starting records.

## Would I keep it?

Yes. I would keep the physical unit as the unit of record. In the starter, closing the slips for projector `PR-04` and speaker `SP-02` left adapter `AD-12` open. That matches what was physically back on the shelf.

I would change how the next shift finds the return instructions. The open adapter slip showed Kabir and the Friday due time, while Leela and Saturday at 9 am appeared in a separate Desk book message. At the counter, the next person had to match those records while deciding which physical unit to accept.

The prototype places the kit checklist on the approved request. The desk can issue the kit in one action and still get one slip per physical unit. Staff can attach a person and an expected arrival to an open slip. The expectation is visible on the request and in the register, alongside the original due time. Inventory still shows shelf and repair status, and the Desk book still holds general messages.

## Replay the shift

1. Open **Courtyard screening**. Confirm the chosen projector, speaker and USB-C adapter, then issue the equipment to Kabir Sen. Try choosing `AD-15` so you can verify the handover follows the actual unit.
2. Select **Move to return time**. Record the projector and speaker returns. On the adapter, select **Add handover**, enter `Leela Das` and `Saturday, 9 am`, then save.
3. Select **Move to next morning**. Match the adapter ID to the open slip and record its return. The Film Society request should read **Returned**. The Debate Union microphone should remain in **Loan register → Outstanding**.

At a real counter, I would watch whether a colleague coming on shift can match the adapter and close the correct slip on the first attempt without asking the outgoing worker.

The design borrows the short labels and distinct item marks of [Gödel Machines](https://www.goedelmachines.com/). Equipment names, physical IDs and the next action lead the desk views. [University of Puget Sound equipment checkout](https://www.pugetsound.edu/technology-services/media-services/checkout-equipment) informed which details matter during pickup and return.

The supplied `logo.png` sets the orange, teal and charcoal palette. The [product breakdown and design sources](docs/product-breakdown.html#sources) document the starter evidence, inFlow references, and which proposals are implemented locally.

## Source

- `index.html` contains the desk layout and bundled icons.
- `app.js` contains the request checklist, loan and handover logic, and sample records.
- `styles.css` defines the desktop and mobile layouts.

Icon license notices are in [third-party/lucide-LICENSE.txt](third-party/lucide-LICENSE.txt).

Run the workflow regression with `node --test`.

## Submit your work

1. [Fork Campus Stores](https://github.com/virinchi-healthcare/campus-stores/fork) into your GitHub account. Complete the candidate brief and push your changes to your public fork. In your README, point reviewers to your work and explain the decision you made.
2. In your fork, open **Commits**, select the final commit you want reviewed, and copy the page URL. It should look like `https://github.com/YOUR-USERNAME/campus-stores/commit/COMMIT-SHA`.
3. [Submit your work through the Google Form](https://docs.google.com/forms/d/e/1FAIpQLScvzoh1R4WS-SkiwAVBQbMvniieJYSoOEfLMyVo5CyjOvYUgQ/viewform). Your **roll number**, **email ID**, and **final commit link from your public fork** are required. Enter your roll number and email ID in the form only.
