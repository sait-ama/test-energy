import React from 'react';
import Script from 'next/script';

import { publicEnv } from '~shared/utils/env';

export const VkPixelScript = () => {
  const pixelId = publicEnv('VK_PIXEL');

  if (!pixelId) return null;

  return (
    <>
      <Script
        id="vk-pixel"
        strategy="afterInteractive"
        type="text/javascript"
        dangerouslySetInnerHTML={{
          __html: `
                    var _tmr = window._tmr || (window._tmr = []);
                    _tmr.push({id: "${pixelId}", type: "pageView", start: (new Date()).getTime(), pid: "USER_ID"});
                    (function (d, w, id) {
                    if (d.getElementById(id)) return;
                    var ts = d.createElement("script"); ts.type = "text/javascript"; ts.async = true; ts.id = id;
                    ts.src = "https://top-fwz1.mail.ru/js/code.js";
                    var f = function () {var s = d.getElementsByTagName("script")[0]; s.parentNode.insertBefore(ts, s);};
                    if (w.opera == "[object Opera]") { d.addEventListener("DOMContentLoaded", f, false); } else { f(); }
                })(document, window, "tmr-code");
                        `,
        }}
      />

      <noscript>
        <div>
          <img
            src={`https://top-fwz1.mail.ru/counter?id=${pixelId};js=na`}
            style={{ position: 'absolute', left: -9999 }}
            alt="Top.Mail.Ru"
          />
        </div>
      </noscript>
    </>
  );
};
