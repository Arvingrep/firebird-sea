package httpbody

import (
	"context"
	"net/http"
)

// WithFields 把已解析的字段表写进 context。
func WithFields(ctx context.Context, fields map[string]any) context.Context {
	return context.WithValue(ctx, contextKey{}, fields)
}

// WithRaw 把原始 body 写进 context（下游若要原样转发还需要它）。
func WithRaw(ctx context.Context, raw []byte) context.Context {
	return context.WithValue(ctx, rawKey{}, raw)
}

// RawOf 取原始 body；没有则返回 nil。
func RawOf(req *http.Request) []byte {
	raw, _ := req.Context().Value(rawKey{}).([]byte)
	return raw
}

func fieldsFrom(req *http.Request) (map[string]any, bool) {
	fields, ok := req.Context().Value(contextKey{}).(map[string]any)
	return fields, ok
}

type rawKey struct{}
