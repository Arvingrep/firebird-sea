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
{{- if .Values.redis.passwordSecretRef }}
- name: REDIS_PASSWORD
  valueFrom:
    secretKeyRef:
      name: {{ .Values.redis.passwordSecretRef }}
      key: {{ .Values.redis.passwordSecretKey | default "password" }}
      optional: true
{{- end }}
{{- if .Values.configLock.enabled }}
- name: CONFIG_LOCK
  value: "1"
- name: CONFIG_LOCK_WRITABLE
  value: {{ join " " .Values.configLock.writable | quote }}
{{- end }}
{{- if .Values.memoryCache.redis.enabled }}
# ② 应用层内存缓存（$HN_memory）声明式指向 Redis；entrypoint 写入 dbinfo.inc.php 的 $cfg_memory
- name: MEMORY_CACHE_REDIS
  value: "1"
- name: MEMORY_CACHE_REDIS_DB
  value: "{{ .Values.memoryCache.redis.db | default 1 }}"
{{- end }}
{{- if .Values.fileCache.queryBypass }}
# AD-20：dsql.class.php::cache 内开关——跳过 FileDataCache 直查 DB（多副本缓存永不收敛，一致性优先）
- name: HN_DSQL_CACHE_SKIP
  value: "1"
{{- end }}
- name: DEFAULT_CURRENCY
  value: "{{ .Values.localization.defaultCurrency }}"
- name: SITE_ID
  value: "{{ .Values.siteId }}"
- name: SITE_BASEHOST
  value: "{{ .Values.domain | default "fbird.men" }}"
# FBS_GATEWAY_SECRET 注入见下方 {{ if .Values.gateway.secretRef }} 条目（canary 29334cf7 形态，
# gateway.secretRef/gateway.secretKey）；移植轮丢弃了旧分支里 api.secretRef 版的重复注入（N2），
# 否则同容器会出现两条同名 env，最后一个生效、来源不可审计。
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
{{- if .Values.gateway.secretRef }}
# TG 登录网关的 HMAC 密钥（api 侧同值）。PHP 读取顺序：$_SERVER['FBS_GATEWAY_SECRET'] → getenv()
# （webroot/api/fbs/index.php:103-108）。两处能取到都依赖官方 php:*-fpm 镜像自带的
# /usr/local/etc/php-fpm.d/docker.conf 里的 clear_env = no —— 若换基座镜像把 pool 改成 clear_env = yes，
# worker 将看不到容器 env，网关会一律 503（不要把该文件改回清空环境）。
# optional：Secret 未建时 Pod 照常启动，网关自身返回 503，不放大成 CrashLoop。
- name: FBS_GATEWAY_SECRET
  valueFrom:
    secretKeyRef:
      name: {{ .Values.gateway.secretRef }}
      key: {{ .Values.gateway.secretKey | default "FBS_GATEWAY_SECRET" }}
      optional: true
{{- end }}
# TG 专用站点的 service 白名单总开关（webroot/index.php 的 fbsTgServiceWhitelistEnabled()）。
# 默认 "1"：全站只放行 waimai / article / travel / member / siteConfig，其余 302 回首页。
# 紧急退回把 values 的 tgApp.serviceWhitelist 改成 "0" 重启 php 即可，不需要重建镜像。
# 取值语义：trim 转小写后命中 0|false|off|no 才关，其余（含未设置）一律视为开 —— 漏配时宁可收紧。
# 与 FBS_GATEWAY_SECRET 同一前提：靠官方 php:*-fpm 镜像 docker.conf 的 clear_env = no 才读得到。
# 这里不能用 `| default "1"`：Sprig 的 default 把整数 0 当空值，values 里写成不带引号的
# serviceWhitelist: 0 会被静默渲染成 "1" —— 运营以为关了、实际还开着，且没有任何可见差异。
# 用 hasKey 显式判存在、printf "%v" 保值，0 就渲染成 "0"。
{{- $whitelist := "1" }}
{{- if and .Values.tgApp (hasKey .Values.tgApp "serviceWhitelist") }}
{{- $whitelist = printf "%v" .Values.tgApp.serviceWhitelist }}
{{- end }}
- name: FBS_TG_SERVICE_WHITELIST
  value: {{ $whitelist | quote }}
# 网关 cookieDomain 兜底：data/cache/config.php 缺失（baked 模式 emptyDir 每次 Pod 重建清空）
# 或文件里没有 $cfg_cookieDomain（新版火鸟已移除该配置项）时，网关用它签发跨域 cookie。
# 只在 php-fpm 注入：cookie 由 PHP 签发，Node 侧只透传 set_cookies。
# 留空则不注入 → 网关保持原 fail-closed（两级都拿不到才 500，绝不回落 host-only）。
{{- if .Values.gateway.cookieDomain }}
- name: FBS_GATEWAY_COOKIE_DOMAIN
  value: {{ .Values.gateway.cookieDomain | quote }}
{{- end }}
- name: GOOGLE_MAPS_API_KEY
  valueFrom:
    secretKeyRef:
      name: firebird-storage-secret
      key: google-maps-api-key
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

{{- /* nginx 里 PHP location 的公共指令（普通 PHP 与 GitOps 锁下的 /admin/ PHP 共用） */ -}}
{{- define "firebird.nginxPhpBody" -}}
fastcgi_pass {{ if .Values.split.enabled }}firebird-php-{{ .Values.siteId }}:9000{{ else }}127.0.0.1:9000{{ end }};
fastcgi_index index.php;
fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
include fastcgi_params;
fastcgi_read_timeout 300;
fastcgi_buffer_size 128k;
fastcgi_buffers 4 256k;
fastcgi_busy_buffers_size 256k;
{{- end -}}
