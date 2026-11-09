// 服务入口：装配 config → store → 路由 → httpx 中间件，监听并优雅退出。
package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/arvingrep/firebird-sea/services/firebird-go/internal/config"
	"github.com/arvingrep/firebird-sea/services/firebird-go/internal/httpx"
	"github.com/arvingrep/firebird-sea/services/firebird-go/internal/modules/example"
	"github.com/arvingrep/firebird-sea/services/firebird-go/internal/store"
)

func main() {
	// slog JSON → stdout（#231 约定）。先于 config.Load：配置错误也要结构化输出。
	slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stdout, nil)))

	cfg, err := config.Load()
	if err != nil {
		slog.Error("config_load_failed", "err", err)
		os.Exit(1)
	}

	st, err := store.New(cfg)
	if err != nil {
		slog.Error("store_init_failed", "err", err)
		os.Exit(1)
	}
	defer st.DB.Close()

	mux := http.NewServeMux()
	registerRoutes(mux, st)

	srv := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           httpx.Chain(mux, cfg.RequestTimeout),
		ReadHeaderTimeout: 5 * time.Second,
	}

	// 优雅退出：收到 SIGTERM/SIGINT 后给在途请求 10s 收尾（K8s 滚动更新走这条路径）。
	go func() {
		slog.Info("server_listening", "port", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			slog.Error("server_failed", "err", err)
			os.Exit(1)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGTERM, syscall.SIGINT)
	<-stop

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		slog.Error("shutdown_failed", "err", err)
	}
	slog.Info("server_stopped")
}

// registerRoutes 集中挂载探针与各模块路由。
// /healthz 只回答进程活着（不碰依赖）；/readyz 回答依赖可连（MySQL、Redis）。
func registerRoutes(mux *http.ServeMux, st *store.Store) {
	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	})

	mux.HandleFunc("GET /readyz", func(w http.ResponseWriter, r *http.Request) {
		if err := st.Ready(r.Context()); err != nil {
			slog.Warn("readyz_failed", "err", err)
			w.WriteHeader(http.StatusServiceUnavailable)
			_, _ = w.Write([]byte("not ready"))
			return
		}
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ready"))
	})

	// 后续迁移模块在这里逐个注册（#233 起按 service 挂到 internal/modules/<service>）。
	(&example.Handler{}).Register(mux)
}
