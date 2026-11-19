package fburl

import (
	"context"
	"database/sql"
	"errors"
	"strconv"
	"strings"
)

// cached runs load once per key (hits and misses alike); errors are never cached.
func (r *Resolver) cached(key string, load func() ([]string, error)) ([]string, error) {
	if v, ok := r.cache.get(key); ok {
		return v, nil
	}
	v, err := load()
	if err != nil {
		return nil, err
	}
	r.cache.put(key, v)
	return v, nil
}

// siteModuleCount is PHP $siteModule (enabled, named system modules).
func (r *Resolver) siteModuleCount(ctx context.Context) (int, error) {
	v, err := r.cached("site_module_count", func() ([]string, error) {
		var n sql.NullInt64
		q := "SELECT count(`id`) total FROM `" + r.prefix + "site_module` WHERE `state` = 0 AND `type` = 0 AND `name` != ''"
		if err := r.db.QueryRowContext(ctx, q).Scan(&n); err != nil {
			return nil, err
		}
		return []string{strconv.FormatInt(n.Int64, 10)}, nil
	})
	if err != nil {
		return 0, err
	}
	n, _ := strconv.Atoi(v[0])
	return n, nil
}

// moduleDomain is getDomain($module,'config')['domain']; a missing row is a cached empty domain.
func (r *Resolver) moduleDomain(ctx context.Context, module string) (string, error) {
	v, err := r.cached("domain:"+module, func() ([]string, error) {
		var d sql.NullString
		q := "SELECT `domain` FROM `" + r.prefix + "domain` WHERE `module` = ? AND `part` = 'config'"
		err := r.db.QueryRowContext(ctx, q, module).Scan(&d)
		if errors.Is(err, sql.ErrNoRows) {
			return []string{""}, nil
		}
		if err != nil {
			return nil, err
		}
		return []string{d.String}, nil
	})
	if err != nil {
		return "", err
	}
	return v[0], nil
}

// Domain ports getDomainFullUrl. subDomain is the module's $customSubDomain
// (0 = own host, 1 = sub-domain, 2 = directory); hasParams mirrors a non-empty $params.
func (r *Resolver) Domain(ctx context.Context, module string, subDomain int, hasParams bool, o Options) (string, error) {
	base := r.base(o)
	siteModule, err := r.siteModuleCount(ctx)
	if err != nil {
		return "", err
	}
	if module == "" {
		return base, nil
	}
	domain, err := r.moduleDomain(ctx, module)
	if err != nil {
		return "", err
	}
	if o.DomainNoCity {
		return base + "/" + domain, nil
	}
	oneModule := siteModule == 1 && module != "business"
	c := o.City
	if c.Count > 1 && !o.WithoutCityDomain {
		cityURL := strings.TrimSuffix(c.URL, "/")
		tail := "/" + domain
		if oneModule {
			tail = ""
		}
		switch {
		case subDomain == 1:
			switch c.Type {
			case 0:
				domain = r.scheme() + domain + "." + strings.ReplaceAll(c.Domain, "www.", "")
			case 1:
				domain = r.scheme() + domain + "." + strings.ReplaceAll(c.Domain, "www.", "") + "." + hostOf(base)
			case 2:
				domain = cityURL + tail
			}
		case subDomain == 2 && c.Type == 2:
			// Force the main host + directory so a polluted cookie cannot leak into the link.
			domain = base + "/" + c.Domain + tail
		default:
			domain = cityURL + tail
		}
	} else {
		if oneModule && module != "website" &&
			((o.IsMobile && module != "job") || (!o.IsMobile && module == "job")) {
			return base, nil
		}
		switch subDomain {
		case 0:
			domain = r.scheme() + domain
		case 1:
			domain = r.scheme() + domain + "." + strings.ReplaceAll(hostOf(base), "www.", "")
		case 2:
			domain = base + "/" + domain
		}
	}
	if !hasParams {
		domain += "/"
	}
	return domain, nil
}

func hostOf(base string) string {
	return strings.TrimPrefix(strings.TrimPrefix(base, "https://"), "http://")
}
