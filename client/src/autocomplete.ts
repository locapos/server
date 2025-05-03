import Hash from "./hash";
import Markers from "./markers";

type AutocompleteItem = {
  label: string;
  secondary: string;
  value: string;
  type: "person-fill" | "geo-alt-fill";
  placeId?: string;
  userId?: string;
  raw: unknown;
};

export default class Autocomplete {
  private autocomplete: google.maps.places.AutocompleteService;
  private places: google.maps.places.PlacesService;
  private element: HTMLElement | null = null;

  constructor(
    private map: google.maps.Map,
    private markers: Markers
  ) {
    this.autocomplete = new google.maps.places.AutocompleteService();
    this.places = new google.maps.places.PlacesService(map);
  }

  enable(element: HTMLElement) {
    this.element = element;
    const source = (req: { term: string }, callback: (data: AutocompleteItem[]) => void) =>
      this.runQuery(req.term, callback);
    $(this.element)
      .autocomplete({
        source: source,
        appendTo: ".search-bar",
        select: (a, b) => this.selectItem(a, b),
        open: () => {
          $(".ui-autocomplete").off("hover mouseover mouseenter");
        },
      })
      .data("ui-autocomplete")._renderItem = (ul: JQuery, item: AutocompleteItem) => {
      const secondary = $("<span>" + item.secondary + "</span>").addClass("secondary");
      const icon = $("<i>")
        .addClass("bi")
        .addClass("bi-" + item.type)
        .attr("aria-hidden", "true");
      const content = $("<span>" + item.label + "</span>")
        .append(secondary)
        .prepend(icon);
      const li = $("<li></li>").append(content);
      li.addClass("item-" + item.type);
      return li.appendTo(ul);
    };
  }

  selectItem(_element: JQueryEventObject, ui: JQueryUI.AutocompleteUIParams) {
    if (ui.item.placeId) {
      this.places.getDetails({ placeId: ui.item.placeId }, (place) => {
        if (!place?.geometry) {
          return;
        }
        if (place.geometry.viewport) {
          this.map.fitBounds(place.geometry.viewport);
        } else if (place.geometry.location) {
          this.map.setCenter(place.geometry.location);
          this.map.setZoom(17);
        }
      });
    } else {
      Hash.setInfo({ id: ui.item.userId });
      this.map.setCenter(new google.maps.LatLng(ui.item.raw.latitude, ui.item.raw.longitude));
    }
    window.setTimeout(() => $("#focus_trick").focus(), 0);
  }

  runQuery(req: string, callback: (data: AutocompleteItem[]) => void) {
    this.autocomplete.getPlacePredictions(
      { input: req, bounds: this.map.getBounds() },
      (results) => {
        const users = this.queryUsers(req);
        const locations = (results || []).map((x) => ({
          label: this.format(x.structured_formatting),
          secondary: x.structured_formatting.secondary_text,
          value: x.description,
          type: "geo-alt-fill" as const,
          placeId: x.place_id,
          raw: x,
        }));
        callback(users.concat(locations));
      }
    );
  }

  queryUsers(req: string): Array<AutocompleteItem> {
    const center = this.map.getCenter();
    const reqLower = req.toLowerCase();
    return this.markers
      .values()
      .map((x) => x.rawValue!)
      .filter((x) => ~x.name.toLowerCase().indexOf(reqLower))
      .sort((a, b) => {
        if (!center) return 0;
        return (
          Math.sqrt(
            Math.pow(center.lat() - a.latitude, 2) + Math.pow(center.lng() - a.longitude, 2)
          ) -
          Math.sqrt(
            Math.pow(center.lat() - b.latitude, 2) + Math.pow(center.lng() - b.longitude, 2)
          )
        );
      })
      .map((x) => ({
        label: this.formatUser(req, x.name),
        secondary: `${x.latitude},${x.longitude}`,
        value: x.name,
        type: "person-fill" as const,
        userId: `${x.provider}:${x.id}`,
        raw: x,
      }));
  }

  format(item: {
    main_text: string;
    main_text_matched_substrings: Array<{ offset: number; length: number }>;
  }) {
    let p = 0;
    let s = "";
    for (let i = 0; i < item.main_text_matched_substrings.length; ++i) {
      const f = item.main_text_matched_substrings[i];
      if (p < f.offset) {
        s += item.main_text.substring(p, f.offset - p);
      }
      s += "<strong>" + item.main_text.substring(f.offset, f.offset + f.length) + "</strong>";
      p = f.offset + f.length;
    }
    if (p < item.main_text.length) {
      s += item.main_text.substring(p);
    }
    return s;
  }

  formatUser(req: string, name: string) {
    const index = name.toLowerCase().indexOf(req);
    return this.format({
      main_text: name,
      main_text_matched_substrings: [{ offset: index, length: req.length }],
    });
  }
}
