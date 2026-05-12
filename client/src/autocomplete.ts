import autocomplete from "autocompleter";
import Hash from "./hash";
import type Markers from "./markers";
import type { Location } from "./markers";

type Match = { offset: number; length: number };

type Item = {
  label: string;
  value: string;
  type: "person-fill" | "geo-alt-fill";
  mainText: string;
  secondaryText: string;
  matches: Match[];
  placePrediction?: google.maps.places.PlacePrediction;
  user?: Location;
};

export default class Autocomplete {
  private element: HTMLInputElement | null = null;
  private sessionToken: google.maps.places.AutocompleteSessionToken | null = null;

  constructor(
    private map: google.maps.Map,
    private markers: Markers
  ) {}

  enable(element: HTMLInputElement) {
    this.element = element;
    const container = document.createElement("div");
    container.classList.add("search-autocomplete");
    document.querySelector(".search-bar")?.appendChild(container);

    autocomplete<Item>({
      input: this.element,
      container,
      className: "search-autocomplete",
      minLength: 2,
      debounceWaitMs: 250,
      preventSubmit: 1,
      fetch: (text, update) => {
        void this.runQuery(text, update);
      },
      onSelect: (item) => {
        void this.selectItem(item);
      },
      render: (item) => this.renderItem(item),
    });
  }

  private ensureSession(): google.maps.places.AutocompleteSessionToken {
    if (!this.sessionToken) {
      this.sessionToken = new google.maps.places.AutocompleteSessionToken();
    }
    return this.sessionToken;
  }

  private async runQuery(req: string, update: (items: Item[] | false) => void) {
    const users = this.queryUsers(req);
    try {
      const bounds = this.map.getBounds();
      const result = await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input: req,
        locationBias: bounds ?? undefined,
        sessionToken: this.ensureSession(),
      });
      const locations: Item[] = result.suggestions
        .map((s) => s.placePrediction)
        .filter((p): p is google.maps.places.PlacePrediction => p !== null)
        .map((p) => ({
          label: p.text.text,
          value: p.text.text,
          type: "geo-alt-fill" as const,
          mainText: p.mainText?.text ?? p.text.text,
          secondaryText: p.secondaryText?.text ?? "",
          matches: (p.mainText?.matches ?? []).map((m) => ({
            offset: m.startOffset,
            length: m.endOffset - m.startOffset,
          })),
          placePrediction: p,
        }));
      const all = users.concat(locations);
      update(all.length > 0 ? all : false);
    } catch {
      update(users.length > 0 ? users : false);
    }
  }

  private queryUsers(req: string): Item[] {
    const center = this.map.getCenter();
    const reqLower = req.toLowerCase();
    return this.markers
      .values()
      .map((x) => x.rawValue)
      .filter((x): x is Location => x !== undefined)
      .filter((x) => x.name.toLowerCase().includes(reqLower))
      .sort((a, b) => {
        if (!center) return 0;
        return (
          Math.sqrt((center.lat() - a.latitude) ** 2 + (center.lng() - a.longitude) ** 2) -
          Math.sqrt((center.lat() - b.latitude) ** 2 + (center.lng() - b.longitude) ** 2)
        );
      })
      .map((x) => {
        const offset = x.name.toLowerCase().indexOf(reqLower);
        const matches: Match[] = offset >= 0 ? [{ offset, length: req.length }] : [];
        return {
          label: x.name,
          value: x.name,
          type: "person-fill" as const,
          mainText: x.name,
          secondaryText: `${x.latitude},${x.longitude}`,
          matches,
          user: x,
        };
      });
  }

  private async selectItem(item: Item) {
    if (item.placePrediction) {
      try {
        const place = item.placePrediction.toPlace();
        await place.fetchFields({ fields: ["viewport", "location"] });
        if (place.viewport) {
          this.map.fitBounds(place.viewport);
        } else if (place.location) {
          this.map.setCenter(place.location);
          this.map.setZoom(17);
        }
      } catch {
        // best-effort; failures here don't need to surface to the user
      }
    } else if (item.user) {
      Hash.setInfo({ id: item.user.id });
      this.map.setCenter(new google.maps.LatLng(item.user.latitude, item.user.longitude));
    }
    this.sessionToken = null;
    if (this.element) this.element.value = item.value;
    window.setTimeout(() => document.getElementById("focus_trick")?.focus(), 0);
  }

  private renderItem(item: Item): HTMLDivElement {
    const row = document.createElement("div");
    row.className = `autocomplete-item item-${item.type}`;

    const content = document.createElement("span");

    const icon = document.createElement("i");
    icon.className = `bi bi-${item.type}`;
    icon.setAttribute("aria-hidden", "true");
    content.appendChild(icon);

    let pos = 0;
    for (const m of item.matches) {
      if (m.offset > pos) {
        content.appendChild(document.createTextNode(item.mainText.substring(pos, m.offset)));
      }
      const strong = document.createElement("strong");
      strong.textContent = item.mainText.substring(m.offset, m.offset + m.length);
      content.appendChild(strong);
      pos = m.offset + m.length;
    }
    if (pos < item.mainText.length) {
      content.appendChild(document.createTextNode(item.mainText.substring(pos)));
    }

    if (item.secondaryText) {
      const secondary = document.createElement("span");
      secondary.className = "secondary";
      secondary.textContent = item.secondaryText;
      content.appendChild(secondary);
    }

    row.appendChild(content);
    return row;
  }
}
