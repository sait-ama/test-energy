class GoogleAnalytics {
  pageView = (url: string) => {
    if (window.dataLayer) {
      window.dataLayer.push?.({
        event: 'pageview',
        page: url,
      });
    }
  };
}

export const gAnalytics = new GoogleAnalytics();
