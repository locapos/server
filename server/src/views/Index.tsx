import { raw } from "hono/html";
import type { FC } from "hono/jsx";

type Props = {
  mapsApiKey: string;
};

const gaScript = `(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;(i[r]=i[r]||function(){(i[r].q=i[r].q||[]).push(arguments)}),(i[r].l=1*new Date());(a=s.createElement(o)),(m=s.getElementsByTagName(o)[0]);a.async=1;a.src=g;m.parentNode.insertBefore(a,m)})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');ga('create','UA-87698594-1','auto');ga('send','pageview');`;

export const Index: FC<Props> = ({ mapsApiKey }) => {
  return (
    <>
      {raw("<!DOCTYPE html>")}
      <html lang="ja">
        <head>
          <meta charset="utf-8" />
          <meta http-equiv="X-UA-Compatible" content="IE=edge" />
          <meta
            name="viewport"
            content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"
          />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="theme-color" content="#4DB6AC" />
          <meta name="description" content="locapos(ろけぽす)は位置情報を共有するサービスです." />
          <meta name="keywords" content="gps,locapos,位置情報" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin="" />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100..900&display=swap"
          />
          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.css"
          />
          <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
          />
          <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.conditional.min.css"
          />
          <link rel="stylesheet" href="/css/map.css" />
          <link rel="prefetch" href="/res/0/0.png" />
          <script
            src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js"
            defer
          ></script>
          <script
            src="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js"
            defer
          ></script>
          <meta name="color-scheme" content="light dark" />
          <title>LocaPos | Overview</title>
        </head>
        <body>
          <div class="layout-root">
            <div id="search-bar">
              <div class="search-bar">
                <button type="button" id="menu" class="effect icon" popovertarget="popover">
                  <i class="bi bi-three-dots-vertical"></i>
                </button>
                <form id="search-form">
                  <input id="place-search" placeholder="Search in locapos" />
                  <button type="button" id="clear" class="effect icon">
                    <i class="bi bi-x"></i>
                  </button>
                </form>
              </div>
            </div>
            <div id="map-canvas">
              <p>loading...</p>
            </div>
          </div>
          <div id="popover" popover="auto">
            <div class="content">
              <p class="caption">Theme</p>
              <div class="segments">
                <label class="segment">
                  <input id="daynight_day" type="radio" name="daynight" />
                  <span>Day</span>
                </label>
                <label class="segment">
                  <input id="daynight_auto" type="radio" name="daynight" checked />
                  <span>Auto</span>
                </label>
                <label class="segment">
                  <input id="daynight_night" type="radio" name="daynight" />
                  <span>Night</span>
                </label>
              </div>
              <p class="caption">Layers</p>
              <div class="switch pico">
                <label>
                  {/* biome-ignore lint/a11y/useAriaPropsForRole: native checkbox maps checked→aria-checked automatically */}
                  <input id="swTraffic" type="checkbox" role="switch" />
                  <span>Traffic</span>
                </label>
              </div>
              <div class="switch pico">
                <label>
                  {/* biome-ignore lint/a11y/useAriaPropsForRole: native checkbox maps checked→aria-checked automatically */}
                  <input id="swWeather" type="checkbox" role="switch" />
                  <span>Weather</span>
                </label>
              </div>
            </div>
          </div>
          <button type="button" id="focus_trick"></button>
          <script
            src={`https://maps.googleapis.com/maps/api/js?key=${mapsApiKey}&libraries=places&loading=async`}
            defer
          ></script>
          <script
            src="https://unpkg.com/@googlemaps/markerwithlabel/dist/index.min.js"
            defer
          ></script>
          <script src="/js/app.js" defer></script>
          <script dangerouslySetInnerHTML={{ __html: gaScript }}></script>
        </body>
      </html>
    </>
  );
};
