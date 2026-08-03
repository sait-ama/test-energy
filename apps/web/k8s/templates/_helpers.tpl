{{/*
Expand the name of the chart.
*/}}
{{- define "nextjs-monorepo.name" -}}
{{- default .Values.nameOverride .Values.chartName | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "nextjs-monorepo.fullname" -}}
{{- if .Values.nameOverride }}
  {{- .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
  {{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "nextjs-monorepo.labels" -}}
helm.sh/chart: {{ include "nextjs-monorepo.chart" . }}
{{ include "nextjs-monorepo.selectorLabels" . }}
{{- if .Values.appVersion }}
app.kubernetes.io/version: {{ .Values.appVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: helm
{{- end }}

{{/*
Selector labels
*/}}
{{- define "nextjs-monorepo.selectorLabels" -}}
app.kubernetes.io/name: {{ include "nextjs-monorepo.name" . }}
app.kubernetes.io/instance: {{ .Release.Name | default "default-instance" }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "nextjs-monorepo.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "nextjs-monorepo.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "nextjs-monorepo.chart" -}}
{{- printf "%s-%s" .Values.chartName .Values.chartVersion | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Service Port
*/}}
{{- define "nextjs-monorepo.servicePort" -}}
{{- .Values.service.port | default 3000 -}}
{{- end }}
