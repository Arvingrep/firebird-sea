{{- /* webroot.mode=baked 时返回 "true"（非空），否则返回空串；用法: {{- $baked := include "firebird.baked" . -}} */ -}}
{{- define "firebird.baked" -}}
{{- if eq (.Values.webroot.mode | default "copy") "baked" -}}true{{- end -}}
{{- end -}}

{{- /* 是否有 configVars（声明式配置变量覆盖） */ -}}
{{- define "firebird.hasConfigVars" -}}
{{- if .Values.configVars -}}true{{- end -}}
{{- end -}}

{{- /* php-fpm 容器环境变量 */ -}}
{{- define "firebird.phpEnv" -}}
- name: DB_HOST
  value: "{{ .Values.database.host }}"
- name: DB_NAME
  value: "{{ .Values.database.name }}"
- name: DB_USER
  value: "{{ .Values.database.user | default "firebird_user" }}"
{{- if .Values.database.passwordSecretRef }}
- name: DB_PASS
  valueFrom:
    secretKeyRef:
      name: {{ .Values.database.passwordSecretRef }}
      key: {{ .Values.database.passwordSecretKey | default "password" }}
{{- else if .Values.database.password }}
- name: DB_PASS
  value: "{{ .Values.database.password }}"
{{- end }}
- name: REDIS_HOST
  value: "{{ .Values.redis.host }}"
- name: REDIS_PORT
  value: "{{ .Values.redis.port | default 6379 }}"
{{- if .Values.memoryCache.redis.enabled }}
# ② 应用层内存缓存（$HN_memory）声明式指向 Redis；entrypoint 写入 dbinfo.inc.php 的 $cfg_memory
- name: MEMORY_CACHE_REDIS
  value: "1"
- name: MEMORY_CACHE_REDIS_DB
  value: "{{ .Values.memoryCache.redis.db | default 1 }}"
{{- end }}
- name: DEFAULT_CURRENCY
  value: "{{ .Values.localization.defaultCurrency }}"
- name: SITE_ID
  value: "{{ .Values.siteId }}"
- name: SITE_BASEHOST
  value: "{{ .Values.domain | default "fbird.men" }}"
- name: GCS_KEY_ID
  valueFrom:
    secretKeyRef:
      name: firebird-storage-secret
      key: gcs-key-id
      optional: true
- name: GCS_KEY_SECRET
  valueFrom:
    secretKeyRef:
      name: firebird-storage-secret
      key: gcs-key-secret
      optional: true
- name: RESEND_KEY
  valueFrom:
    secretKeyRef:
      name: firebird-storage-secret
      key: resend-key
      optional: true
{{- end -}}

{{- /* init 容器：播种 data/ 与配置 PVC 三方同步（脚本来自 ConfigMap firebird-init-<site>） */ -}}
{{- define "firebird.initContainer" -}}
{{- $baked := include "firebird.baked" . -}}
- name: init-webroot
  image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
  imagePullPolicy: {{ .Values.image.pullPolicy }}
  command: ["sh", "/scripts/init-webroot.sh"]
  env:
    - name: MODE
      value: {{ if $baked }}"baked"{{ else }}"copy"{{ end }}
  volumeMounts:
    {{- if $baked }}
    - name: data-shared
      mountPath: /shared
    {{- else }}
    - name: webroot-shared
      mountPath: /shared
    {{- end }}
    {{- if .Values.persistence.enabled }}
    - name: config-persistent
      mountPath: /config-pvc
    {{- end }}
    {{- if .Values.uploads.enabled }}
    - name: uploads-persistent
      mountPath: /uploads-pvc
    {{- end }}
    - name: init-scripts
      mountPath: /scripts
      readOnly: true
{{- end -}}

{{- /* php-fpm 容器 */ -}}
{{- define "firebird.phpContainer" -}}
{{- $baked := include "firebird.baked" . -}}
- name: php-fpm
  image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
  imagePullPolicy: {{ .Values.image.pullPolicy }}
  ports:
    - containerPort: 9000
  env:
    {{- include "firebird.phpEnv" . | nindent 4 }}
  volumeMounts:
    {{- if $baked }}
    - name: data-shared
      mountPath: /var/www/html/data
    {{- else }}
    - name: webroot-shared
      mountPath: /var/www/html
    {{- end }}
    {{- if .Values.persistence.enabled }}
    - name: config-persistent
      mountPath: /var/www/html/include/config
    {{- end }}
    {{- if .Values.uploads.enabled }}
    - name: uploads-persistent
      mountPath: /var/www/html/uploads
    {{- end }}
    {{- if and .Values.configOverrides (and .Values.configOverrides.enabled .Values.configOverrides.files) }}
    - name: config-overrides
      mountPath: /etc/firebird-configs
      readOnly: true
    {{- end }}
    {{- if include "firebird.hasConfigVars" . }}
    - name: config-vars
      mountPath: /etc/firebird-config-vars
      readOnly: true
    {{- end }}
  # entrypoint 要做 Redis 探活、配置兜底生成，慢启动期间不让 liveness 误杀
  startupProbe:
    tcpSocket:
      port: 9000
    periodSeconds: 2
    failureThreshold: 45
  readinessProbe:
    tcpSocket:
      port: 9000
    initialDelaySeconds: 5
    periodSeconds: 3
    timeoutSeconds: 2
    successThreshold: 1
    failureThreshold: 3
  livenessProbe:
    tcpSocket:
      port: 9000
    initialDelaySeconds: 15
    periodSeconds: 10
    timeoutSeconds: 2
    failureThreshold: 3
  resources:
    {{- toYaml .Values.resources | nindent 4 }}
{{- end -}}

{{- /*
  ① file_data 清扫 sidecar。
  FileDataCache 缓存配置类表的 SQL 结果，TTL=0（永不过期），全仓库没有任何地方清理，后台"清除缓存"也只删 data/cache 根目录的 *.json。
  现状靠"重启 Pod 清空 emptyDir"才生效；多 Pod 下每个 Pod 各自一份、各自永不过期。
  这里按 mtime 定期删除，使陈旧时间有界（默认 5 分钟），不改厂商代码。
*/ -}}
{{- define "firebird.sweeper" -}}
{{- $baked := include "firebird.baked" . -}}
- name: cache-sweeper
  image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
  imagePullPolicy: {{ .Values.image.pullPolicy }}
  env:
    - name: SWEEP_DIR
      value: {{ if $baked }}"/vol/cache/file_data"{{ else }}"/vol/data/cache/file_data"{{ end }}
    - name: MAX_AGE_MIN
      value: {{ .Values.fileCache.sweeper.maxAgeMinutes | default 5 | quote }}
    - name: INTERVAL_SEC
      value: {{ .Values.fileCache.sweeper.intervalSeconds | default 60 | quote }}
  command: ["sh", "-c"]
  args:
    - |
      echo "[sweeper] dir=$SWEEP_DIR maxAge=${MAX_AGE_MIN}m interval=${INTERVAL_SEC}s"
      while true; do
        find "$SWEEP_DIR" -type f -mmin "+$MAX_AGE_MIN" -delete 2>/dev/null
        sleep "$INTERVAL_SEC"
      done
  resources:
    requests: { cpu: 5m, memory: 8Mi }
    limits: { memory: 32Mi }
  volumeMounts:
    {{- if $baked }}
    - name: data-shared
      mountPath: /vol
    {{- else }}
    - name: webroot-shared
      mountPath: /vol
    {{- end }}
{{- end -}}

{{- /* php 侧卷（非拆分的整 Pod、拆分后的 php Pod 共用） */ -}}
{{- define "firebird.phpVolumes" -}}
{{- $baked := include "firebird.baked" . -}}
{{- if $baked }}
- name: data-shared
  emptyDir: {}
{{- else }}
- name: webroot-shared
  emptyDir: {}
{{- end }}
- name: init-scripts
  configMap:
    name: firebird-init-{{ .Values.siteId }}
{{- if .Values.persistence.enabled }}
- name: config-persistent
  persistentVolumeClaim:
    claimName: firebird-config-{{ .Values.siteId }}
{{- end }}
{{- if .Values.uploads.enabled }}
- name: uploads-persistent
  persistentVolumeClaim:
    claimName: firebird-uploads-{{ .Values.siteId }}
{{- end }}
{{- if and .Values.configOverrides (and .Values.configOverrides.enabled .Values.configOverrides.files) }}
- name: config-overrides
  configMap:
    name: firebird-configs-{{ .Values.siteId }}
{{- end }}
{{- if include "firebird.hasConfigVars" . }}
- name: config-vars
  configMap:
    name: firebird-config-vars-{{ .Values.siteId }}
{{- end }}
{{- end -}}

{{- /* 配置 PVC / uploads PVC 任一为 RWO 时，滚动更新会因 Multi-Attach 卡死 → 返回 "true" */ -}}
{{- define "firebird.rwoPvc" -}}
{{- if or (and .Values.uploads.enabled (eq (.Values.uploads.accessMode | default "ReadWriteOnce") "ReadWriteOnce")) (and .Values.persistence.enabled (eq (.Values.persistence.accessMode | default "ReadWriteOnce") "ReadWriteOnce")) -}}true{{- end -}}
{{- end -}}
