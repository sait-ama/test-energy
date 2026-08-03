import { metrics, Span } from '@opentelemetry/api';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { containerDetector } from '@opentelemetry/resource-detector-container';
import {
  envDetector,
  hostDetector,
  osDetector,
  processDetector,
  resourceFromAttributes,
} from '@opentelemetry/resources';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { ClientRequest, IncomingMessage, ServerResponse } from 'http';

const OTEL_EXPORTER_OTLP_ENDPOINT = 'http://otel-collector:4318';

const metricsObj = {
  requestCounter: null,
  requestDuration: null,
  requestSize: null,
  responseSize: null,
  responseStatusCounter: null,
  activeRequests: null,
};

function initializeMetrics() {
  const meter = metrics.getMeter('my-app');

  metricsObj.requestCounter = meter.createCounter('http_server_requests', {
    description: 'Count requests per endpoint',
  });

  metricsObj.requestDuration = meter.createHistogram('http_server_duration', {
    description: 'Duration of HTTP requests',
  });

  metricsObj.requestSize = meter.createHistogram('http_server_size', {
    description: 'Size of HTTP requests',
    unit: 'By',
  });

  metricsObj.responseSize = meter.createHistogram('http_server_response_size', {
    description: 'Size of HTTP responses',
    unit: 'By',
  });

  metricsObj.responseStatusCounter = meter.createCounter('http_server_response_status', {
    description: 'Count of HTTP responses per status code',
  });

  metricsObj.activeRequests = meter.createUpDownCounter('http_server_active_requests', {
    description: 'Number of active HTTP requests',
  });

  console.log('OpenTelemetry metrics initialized');
}

const httpinstrumentation = {
  ignoreIncomingRequestHook: (request: IncomingMessage) => {
    const ignorePatterns = [/^\/_next\/static.*/, /\/?_rsc=*/, /favicon/, /\/api\/health/];

    if (request.url && ignorePatterns.some((m) => m.test(request.url!))) {
      return true;
    }

    return false;
  },

  startIncomingSpanHook: (request: IncomingMessage) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (request as any)._otelStartTime = process.hrtime();

    let urlObj;
    try {
      const urlString = request.url || '';
      urlObj = urlString.startsWith('http')
        ? new URL(urlString)
        : new URL(urlString, `http://${request.headers.host || 'localhost'}`);
    } catch {
      urlObj = { pathname: request.url || '', search: '' };
    }

    const pathParts = (urlObj.pathname || '').split('/').filter(Boolean);
    const method = request.method || 'UNKNOWN';
    const url = request.url || '/';

    if (metricsObj.activeRequests) {
      metricsObj.activeRequests.add(1, {
        'http.route': url,
        'http.method': method,
        'http.query': urlObj.search || '',
      });
    }

    return {
      name: `${method} ${url}`,
      'request.path': request.url,
      'request.pathname': urlObj.pathname || '',
      'request.host': request.headers.host || '',
      'request.method': request.method || '',
      'request.route': pathParts.length > 0 ? pathParts[0] : '/',
      'request.referer': request.headers.referer || '',
      'request.timestamp': Date.now(),
    };
  },

  requestHook: (span: Span, request: ClientRequest | IncomingMessage) => {
    const incomingMessage = request as IncomingMessage;
    let urlObj;
    try {
      const urlString = incomingMessage.url || '';
      urlObj = urlString.startsWith('http')
        ? new URL(urlString)
        : new URL(urlString, `http://${incomingMessage.headers.host || 'localhost'}`);
    } catch {
      urlObj = { pathname: incomingMessage.url || '', search: '' };
    }

    const method = request.method || 'UNKNOWN';
    const url = incomingMessage.url || '/';
    span.updateName(`${method} ${url}`);

    span.setAttributes({
      'http.method': method,
      'http.route': incomingMessage.url,
      'http.query': urlObj.search || '',
      'http.user_agent': incomingMessage.headers['user-agent'] || '',
      'http.request_content_length': incomingMessage.headers['content-length'] || '',
      'http.client_ip':
        incomingMessage.headers['x-forwarded-for'] || incomingMessage.socket.remoteAddress || '',
      'http.flavor': incomingMessage.httpVersion || '',
      'request.id': incomingMessage.headers['x-request-id'] || '',
    });

    if (metricsObj.requestCounter) {
      metricsObj.requestCounter.add(1, {
        'http.method': method,
        'http.route': incomingMessage.url,
        'http.query': urlObj.search || '',
      });
    }

    const start = incomingMessage._otelStartTime;
    if (start && metricsObj.requestDuration) {
      const diff = process.hrtime(start);
      const durationMs = diff[0] * 1000 + diff[1] / 1e6;
      metricsObj.requestDuration.record(durationMs, {
        'http.route': incomingMessage.url,
        'http.method': request.method,
        'http.query': urlObj.search || '',
      });
    }

    const size = incomingMessage.headers['content-length'];
    if (size && metricsObj.requestSize) {
      metricsObj.requestSize.record(parseInt(size), {
        'http.route': incomingMessage.url,
        'http.method': request.method,
        'http.query': urlObj.search || '',
      });
    }
  },

  responseHook: (span: Span, response: IncomingMessage | ServerResponse) => {
    const incomingMessage = response as IncomingMessage;
    const urlObj = { pathname: incomingMessage.url || '', search: '' };
    const method = incomingMessage.method || 'UNKNOWN';
    const url = incomingMessage.url || '/';

    activeRequests.add(-1, {
      'http.route': url,
      'http.method': method,
      'http.query': urlObj.search || '',
    });
  },
};

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME,
    [ATTR_SERVICE_VERSION]: process.env.BUILD,
  }),
  traceExporter: new OTLPTraceExporter({
    url: `${OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`,
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: `${OTEL_EXPORTER_OTLP_ENDPOINT}/v1/metrics`,
    }),
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': {
        enabled: false,
      },
      '@opentelemetry/instrumentation-http': httpinstrumentation,
    }),
  ],

  resourceDetectors: [containerDetector, envDetector, hostDetector, osDetector, processDetector],
});

sdk.start();
initializeMetrics();

process.on('SIGTERM', () => {
  sdk
    .shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error: unknown) => console.log('Error terminating tracing', error))
    .finally(() => process.exit(0));
});
