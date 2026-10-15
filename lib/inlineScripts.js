// Inline <Script> snippets. They live here so lib/csp.js can hash the exact same text that is rendered.
// Any change to these strings changes their CSP hash, which is recomputed on every build.

// Version pinned, so the Subresource Integrity hash never changes. Use the file published to npm and not the
// `.min.js` that jsDelivr minifies on the fly, which may be regenerated with different bytes.
const ISBOT_SRC = 'https://cdn.jsdelivr.net/npm/isbot@5.1.23/index.iife.js'
const ISBOT_INTEGRITY = 'sha384-dfSspci7YVmlbvsbx0J5UrreMFMgQnPIO9cYeo7in1xalhUUqC70Ag17OAr+EhUh'

const googleTagInit = () => `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

gtag('config', "G-B0CSXD2KZL");
gtag('config', "AW-11226587097", { "groups": "default" });`

// Waits until isbot is a function. Anything else means it isn't loaded yet, including the element that
// named access returns for window.isbot if the page has an element with id="isbot". Gives up after ~30s
// (e.g. isbot blocked by a content blocker) instead of polling forever.
const segmentInit = (metabaseKey) => `(function checkAndLoadAnalytics(attempt) {
  if (typeof(window.isbot) === 'function'){
    if (!window.isbot(navigator.userAgent)) {
      !function(){var analytics=window.analytics=window.analytics||[];if(!analytics.initialize)if(analytics.invoked)window.console&&console.error&&console.error("Segment snippet included twice.");else{analytics.invoked=!0;analytics.methods=["trackSubmit","trackClick","trackLink","trackForm","pageview","identify","reset","group","track","ready","alias","debug","page","once","off","on","addSourceMiddleware","addIntegrationMiddleware","setAnonymousId","addDestinationMiddleware"];analytics.factory=function(e){return function(){var t=Array.prototype.slice.call(arguments);t.unshift(e);analytics.push(t);return analytics}};for(var e=0;e<analytics.methods.length;e++){var key=analytics.methods[e];analytics[key]=analytics.factory(key)}analytics.load=function(key,e){var t=document.createElement("script");t.type="text/javascript";t.async=!0;t.src="https://cdn.segment.com/analytics.js/v1/" + key + "/analytics.min.js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(t,n);analytics._loadOptions=e};analytics._writeKey="${metabaseKey}";;analytics.SNIPPET_VERSION="4.15.3";
      analytics.load("${metabaseKey}");
      analytics.page();
      }}();
    }
  } else if ((attempt || 0) < 300) {
    setTimeout(function () { checkAndLoadAnalytics((attempt || 0) + 1) }, 100);
  }
})();`

const plausibleInit = () => `window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) }`

const intercomInit = (appId, hideDefaultLauncher) => `window.intercomSettings = {
    api_base: "https://api-iam.intercom.io",
    app_id: "${appId}",
    hide_default_launcher: ${hideDefaultLauncher}
};
(function () {
  var w = window;
  var ic = w.Intercom;
  if (typeof ic === "function") {
    ic('reattach_activator');
    ic('update', w.intercomSettings);
  } else {
    var d = document;
    var i = function () {
      i.c(arguments);
    };
    i.q = [];
    i.c = function (args) {
      i.q.push(args);
    };
    w.Intercom = i;
    var l = function () {
      setTimeout(function () {
        var s = d.createElement('script');
        s.type = 'text/javascript';
        s.async = true;
        s.src = 'https://widget.intercom.io/widget/${appId}';
        var x = d.getElementsByTagName('script')[0];
        x.parentNode.insertBefore(s, x);
      }, 5000);
    };

    if (w.attachEvent) {
      w.attachEvent('onload', l);
    } else {
      w.addEventListener('load', l, false);
    }
  }
})();`

const fbPixelInit = () => `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '486890793629175');
fbq('track', 'PageView');`

// The partner id is read from the script's data-partner-id attribute, so the snippet (and its hash) stays static
const linkedinPartnerId = () => `_linkedin_partner_id = document.currentScript.getAttribute('data-partner-id');
window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
window._linkedin_data_partner_ids.push(_linkedin_partner_id);`

const linkedinTracking = () => `(function(l) {
if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
window.lintrk.q=[]}
var s = document.getElementsByTagName("script")[0];
var b = document.createElement("script");
b.type = "text/javascript";b.async = true;
b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
s.parentNode.insertBefore(b, s);})(window.lintrk);`

module.exports = {
  ISBOT_SRC,
  ISBOT_INTEGRITY,
  googleTagInit,
  segmentInit,
  plausibleInit,
  intercomInit,
  fbPixelInit,
  linkedinPartnerId,
  linkedinTracking,
}
