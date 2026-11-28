package fburl

import (
	"context"
	"database/sql"
	"strings"
)

// URL ports getUrlPath for the Web branch. It returns "" for empty params or a service
// without config/<service>.inc.php. App-only rewriting (article/job on IsApp, tieba/job on
// IsAndroidApp), member links and website preview/site links return ErrUnsupported.
func (r *Resolver) URL(ctx context.Context, p Params, o Options) (string, error) {
	if len(p) == 0 {
		return "", nil
	}
	service := p.get("service")
	switch {
	case (service == "article" || service == "job") && o.IsApp,
		(service == "tieba" || service == "job") && o.IsAndroidApp:
		return "", ErrUnsupported
	}
	params := p.clone()

	switch service {
	case "job":
		params = rewriteJob(params)
	case "task":
		line := params.get("param")
		if phpEmpty(line) {
			line = ""
		}
		if line != "" {
			line += "&"
		}
		params = params.set("param", line+"appFullScreen=1")
	case "custom":
		return params.get("param"), nil
	}

	mod, ok := r.cfg.Modules[service]
	if !ok {
		return "", nil
	}
	template := params.get("template")
	if service == "website" && (strings.Contains(template, "preview") || strings.Contains(template, "site")) {
		return "", ErrUnsupported
	}

	params = encodeParam(params)
	after := ""
	if v := params.get("param"); !phpEmpty(v) {
		after = "?" + v
	}

	// Only evaluated when an output path needs it (PHP result is unused otherwise).
	var domain string
	haveDomain := false
	getDomain := func() (string, error) {
		if haveDomain {
			return domain, nil
		}
		var err error
		switch {
		case service == "siteConfig":
			domain = r.base(o)
		case service == "member":
			// 会员链接域名（getUrlPath 的 member else 分支 → member.config 的
			// userDomain/busiDomain：secure + basehost + "/" + hn_domain 目录，
			// 按参数 type=user/busi 取通道；cfg_userSubDomain/cfg_busiSubDomain
			// 为 2（目录模式）时如此，0/1 同 member.class.php config 公式）。
			domain = r.memberChannelDomain(ctx, mod, params.get("type"), o)
		default:
			domain, err = r.Domain(ctx, service, mod.SubDomain, true, o)
		}
		haveDomain = err == nil
		return domain, err
	}

	if service == "siteConfig" && template == "protocol" && !phpEmpty(params.get("title")) {
		var err error
		if params, err = r.protocolID(ctx, params); err != nil {
			return "", err
		}
	}

	flags := strings.Split(params.get("flag"), ",")
	redirect := params.get("redirecturl")
	redirectType := false
	for _, f := range flags {
		if f == "t" {
			redirectType = true
		}
	}
	jump := redirectType && !phpEmpty(redirect)

	if (service == "article" || service == "image") && !jump {
		if u, done, err := r.newsPath(ctx, service, mod, params, after, getDomain); err != nil || done {
			return u, err
		}
	}
	if jump {
		return redirect + `" target="_blank`, nil
	}

	var param, rewrite []string
	for _, kv := range params {
		if kv.Key == "flag" || kv.Key == "redirecturl" {
			continue
		}
		if kv.Key == "param" {
			param = append(param, kv.Value)
		} else {
			param = append(param, kv.Key+"="+kv.Value)
		}
		if (r.cfg.Rewrite || service == "member") && kv.Key != "service" && kv.Key != "param" &&
			!(service == "member" && kv.Key == "type") {
			rewrite = append(rewrite, kv.Value)
		}
	}
	if !r.cfg.Rewrite && service != "member" {
		return r.base(o) + "/index.php?" + strings.Join(param, "&"), nil
	}
	d, err := getDomain()
	if err != nil {
		return "", err
	}
	sep := "/"
	if strings.HasSuffix(d, "/") {
		sep = ""
	}
	if len(rewrite) == 0 {
		if sep == "" || after == "" {
			sep = ""
		}
		return d + sep + after, nil
	}
	// PHP（common.func.php:4973）：member chat 模板挂在 im/ 目录下。
	if service == "member" && template == "chat" {
		if !strings.HasSuffix(d, "/") {
			d += "/"
		}
		d += "im"
	}
	ext := ".html"
	if template == "announcement-detail" || (service == "job" && o.IsMobile) {
		ext = ""
	}
	return d + sep + strings.Join(rewrite, "-") + ext + after, nil
}

// memberChannelDomain 复刻 member.config 的 userDomain/busiDomain
// （handlers/member.class.php config）：
//	cfg_userSubDomain/cfg_busiSubDomain == 0 → scheme + hn_domain 目录；
//	== 1 → scheme + 目录 + "." + basehost（去 www.）；
//	== 2 → scheme + basehost + "/" + 目录（canary/本地）。
// 目录取 hn_domain WHERE module='member' AND part=<user|busi>。
func (r *Resolver) memberChannelDomain(ctx context.Context, mod Module, typ string, o Options) string {
	part := "busi"
	sub := mod.BusiSubDomain
	if typ == "user" {
		part = "user"
		sub = mod.UserSubDomain
	}
	dir, err := r.memberDomainDir(ctx, part)
	if err != nil {
		return ""
	}
	switch sub {
	case 1:
		return r.scheme() + dir + "." + strings.ReplaceAll(hostOf(r.base(o)), "www.", "")
	case 2:
		return r.base(o) + "/" + dir
	default:
		return r.scheme() + dir
	}
}

// memberDomainDir 查 hn_domain 的 member 通道目录（part=busi/user）。
func (r *Resolver) memberDomainDir(ctx context.Context, part string) (string, error) {
	v, err := r.cached("domain:member:"+part, func() ([]string, error) {
		var d sql.NullString
		q := "SELECT `domain` FROM `" + r.prefix + "domain` WHERE `module` = 'member' AND `part` = ?"
		if err := r.db.QueryRowContext(ctx, q, part).Scan(&d); err != nil {
			return nil, err
		}
		return []string{d.String}, nil
	})
	if err != nil {
		return "", err
	}
	return v[0], nil
}

// newsPath is the article/image custom-rule block. done=false falls through to the generic tail.
func (r *Resolver) newsPath(ctx context.Context, ser string, mod Module, params Params, after string, getDomain func() (string, error)) (string, bool, error) {
	template, typeid, id := params.get("template"), params.get("typeid"), params.get("id")
	switch {
	case template == "list":
		if phpEmpty(typeid) || !isNumeric(typeid) || (mod.ListRule != 1 && mod.ListRule != 2) {
			return "", false, nil
		}
		domain, err := getDomain()
		if err != nil {
			return "", true, err
		}
		pinyin, py, found, err := r.typePinyin(ctx, ser, typeid)
		if err != nil || !found {
			return "", false, err
		}
		seg := pinyin
		if mod.ListRule == 2 {
			seg = py
		}
		return domain + "/" + seg + "/" + after, true, nil
	case template == "detail" && !phpEmpty(id):
		domain, err := getDomain()
		if err != nil {
			return "", true, err
		}
		folder := ""
		if mod.ListRule == 1 || mod.ListRule == 2 {
			var pinyin, py string
			var found bool
			if !phpEmpty(typeid) && isNumeric(typeid) {
				pinyin, py, found, err = r.typePinyin(ctx, ser, typeid)
			} else {
				pinyin, py, found, err = r.typePinyinByItem(ctx, ser, id)
			}
			if err != nil {
				return "", true, err
			}
			if found {
				folder = "/" + pinyin
				if mod.ListRule == 2 {
					folder = "/" + py
				}
			}
		}
		if mod.DetailRule == 1 {
			return domain + folder + "/" + id + ".html" + after, true, nil
		}
		return domain + folder + "/detail-" + id + ".html" + after, true, nil
	}
	return "", false, nil
}

func (r *Resolver) typePinyin(ctx context.Context, ser, typeid string) (pinyin, py string, found bool, err error) {
	q := "SELECT `pinyin`, `py` FROM `" + r.prefix + ser + "type` WHERE `id` = ?"
	return r.pinyinRow(ctx, "type_py:"+ser+":"+typeid, q, typeid)
}

func (r *Resolver) typePinyinByItem(ctx context.Context, ser, id string) (pinyin, py string, found bool, err error) {
	q := "SELECT t.`pinyin`, t.`py` FROM `" + r.prefix + ser + "type` t LEFT JOIN `" + r.prefix + ser + "list` l ON l.`typeid` = t.`id` WHERE l.`id` = ?"
	return r.pinyinRow(ctx, "item_py:"+ser+":"+id, q, id)
}

func (r *Resolver) pinyinRow(ctx context.Context, key, q, arg string) (string, string, bool, error) {
	row, err := r.cached(key, func() ([]string, error) {
		rows, err := r.db.QueryContext(ctx, q, arg)
		if err != nil {
			return nil, err
		}
		defer rows.Close()
		if rows.Next() {
			var a, b sql.NullString
			if err := rows.Scan(&a, &b); err != nil {
				return nil, err
			}
			return []string{a.String, b.String}, nil
		}
		return []string{}, rows.Err()
	})
	if err != nil || len(row) == 0 {
		return "", "", false, err
	}
	return row[0], row[1], true, nil
}

// rewriteJob ports the (always-on) job adaptation for a non-App request: every param
// other than service/template is folded into a single "param" query line.
func rewriteJob(params Params) Params {
	line := params.get("param")
	if phpEmpty(line) {
		line = ""
	}
	out := Params{}
	for _, kv := range params {
		switch kv.Key {
		case "service", "template":
			out = append(out, kv)
		case "param":
		default:
			if line != "" {
				line += "&"
			}
			line += kv.Key + "=" + kv.Value
		}
	}
	return out.set("param", line)
}

// encodeParam url-encodes values containing Chinese characters, like PHP: each "k=v" is
// rebuilt as k=<v part before a second '='> (anything after it is dropped, as in PHP).
// EncodeParam 复刻 getUrlPath 对 `param` 的重新编码（parse_str + http_build_query 口径：
// 没有 `=` 的键会补成 `k=`，中文值再 urlencode）。未走 URL() 的调用方（member 链接）用它保持同一口径。
func EncodeParam(params Params) Params { return encodeParam(params) }

func encodeParam(params Params) Params {
	v := params.get("param")
	if phpEmpty(v) {
		return params
	}
	parts := strings.Split(v, "&")
	for i, seg := range parts {
		kv := strings.Split(seg, "=")
		val := ""
		if len(kv) > 1 {
			val = kv[1]
		}
		if chineseRe.MatchString(val) {
			val = phpURLEncode(phpURLDecode(val))
		}
		parts[i] = kv[0] + "=" + val
	}
	return params.set("param", strings.Join(parts, "&"))
}

// protocolID resolves siteConfig protocol links given by title (exact match, then fuzzy).
func (r *Resolver) protocolID(ctx context.Context, params Params) (Params, error) {
	title := params.get("title")
	params = params.del("title")
	for _, c := range []struct{ q, arg string }{
		{"SELECT `id` FROM `" + r.prefix + "site_singellist` WHERE `type` = 'agree' AND `title` = ?", title},
		{"SELECT `id` FROM `" + r.prefix + "site_singellist` WHERE `type` = 'agree' AND `title` LIKE ? ORDER BY `id` DESC", "%" + title + "%"},
	} {
		rows, err := r.db.QueryContext(ctx, c.q, c.arg)
		if err != nil {
			return nil, err
		}
		var id sql.NullString
		found := false
		if rows.Next() {
			found = true
			err = rows.Scan(&id)
		}
		rows.Close()
		if err != nil {
			return nil, err
		}
		if found {
			return params.set("id", id.String), nil
		}
	}
	return params, nil
}
