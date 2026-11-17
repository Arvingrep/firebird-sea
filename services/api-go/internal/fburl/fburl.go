// Package fburl ports PHP getUrlPath / getDomainFullUrl / getFilePath / getRealFilePath.
//
// Everything request-scoped (Host, city, mobile/App flags, WithoutCityDomain) is passed in
// explicitly through Options; nothing is read from HTTP headers or kept in global state.
package fburl

import (
	"database/sql"
	"encoding/json"
	"errors"
	"net"
	"regexp"
)

//go:generate go run ./generate -root ../../../.. -out config_gen.go

// ErrUnsupported is returned for PHP branches that are deliberately not ported yet
// (App-only link rewriting, member links, website preview/site links).
var ErrUnsupported = errors.New("fburl: unsupported URL branch")

// Param is one entry of the PHP params array.
type Param struct{ Key, Value string }

// Params preserves PHP array insertion order (it matters for the generated path).
// Keys must be unique; values are the PHP scalar string representation.
type Params []Param

func (p Params) lookup(k string) (string, bool) {
	for _, v := range p {
		if v.Key == k {
			return v.Value, true
		}
	}
	return "", false
}

func (p Params) get(k string) string { v, _ := p.lookup(k); return v }

// set updates in place if the key exists, otherwise appends (PHP array assignment).
func (p Params) set(k, v string) Params {
	for i := range p {
		if p[i].Key == k {
			p[i].Value = v
			return p
		}
	}
	return append(p, Param{k, v})
}

func (p Params) del(k string) Params {
	out := make(Params, 0, len(p))
	for _, v := range p {
		if v.Key != k {
			out = append(out, v)
		}
	}
	return out
}

func (p Params) clone() Params { return append(Params(nil), p...) }

// City is the resolved sub-site (PHP $siteCityInfo). The caller resolves cookie/URL precedence.
type City struct {
	Count, Type int
	Domain, URL string
}

// Options is per call. The zero value selects Web, desktop, city domains enabled.
type Options struct {
	Host string // request Host (port is stripped)
	City City
	// IsApp / IsAndroidApp follow PHP isApp()/isAndroidApp() (UA based); the App-only
	// link rewriting is not ported, so affected services return ErrUnsupported.
	IsApp, IsAndroidApp bool
	IsMobile            bool // PHP isMobile()
	WithoutCityDomain   bool // PHP $withoutCityDomain, single call only
	DomainNoCity        bool // PHP $domainNoCity
}

// Storage mirrors the cfg_* / custom_* storage literals.
type Storage struct {
	Type, State                    int
	URL, Dir, OSS, Qiniu, OBS, COS string
	UploadDir                      string
}

// Module is the per-service config/*.inc.php literal set.
type Module struct {
	SubDomain, ListRule, DetailRule int
	CustomFTP, CustomUpload         bool
	Storage                         Storage
}

// Config holds the build-time literals extracted from webroot/include/config.
type Config struct {
	Secure, Rewrite, RemoteUnify bool
	Storage                      Storage
	Modules                      map[string]Module
	// LocalFiles is a build-time inventory of webroot/static and webroot/uploads
	// (the api-go container does not ship them).
	LocalFiles map[string]bool
}

// DefaultConfig returns the generated build-time configuration.
func DefaultConfig() Config {
	var c Config
	if err := json.Unmarshal([]byte(generatedConfig), &c); err != nil {
		panic(err)
	}
	return c
}

// Resolver reads table data at run time (with a bounded in-process cache).
type Resolver struct {
	db     *sql.DB
	prefix string
	cfg    Config
	cache  *rowCache
}

var prefixRe = regexp.MustCompile(`^[A-Za-z0-9_]+$`)

// New creates a Resolver. The config is deep-copied.
func New(db *sql.DB, prefix string, c Config) (*Resolver, error) {
	if prefix == "" {
		prefix = "huoniao_"
	}
	if !prefixRe.MatchString(prefix) {
		return nil, errors.New("fburl: invalid table prefix")
	}
	b, err := json.Marshal(c)
	if err != nil {
		return nil, err
	}
	var snapshot Config
	if err = json.Unmarshal(b, &snapshot); err != nil {
		return nil, err
	}
	return &Resolver{db: db, prefix: prefix, cfg: snapshot, cache: newRowCache(1024)}, nil
}

func (r *Resolver) scheme() string {
	if r.cfg.Secure {
		return "https://"
	}
	return "http://"
}

// base is PHP $cfg_secureAccess.$cfg_basehost (basehost = request Host without port).
func (r *Resolver) base(o Options) string {
	host := o.Host
	if h, _, err := net.SplitHostPort(host); err == nil {
		host = h
	}
	return r.scheme() + host
}
