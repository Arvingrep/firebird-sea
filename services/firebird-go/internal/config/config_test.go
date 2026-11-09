package config

import (
	"strings"
	"testing"
	"time"
)

// baseEnv 一组完整合法的必填环境变量，各用例在它基础上增删。
func baseEnv(t *testing.T) {
	t.Helper()
	for k, v := range map[string]string{
		"DB_HOST": "127.0.0.1", "DB_PORT": "3306", "DB_NAME": "firebird_demo",
		"DB_USER": "u", "DB_PASSWORD": "p",
		"REDIS_HOST": "127.0.0.1", "REDIS_PORT": "6379",
	} {
		t.Setenv(k, v)
	}
}

func TestLoadOK(t *testing.T) {
	baseEnv(t)
	cfg, err := Load()
	if err != nil {
		t.Fatalf("Load() err = %v", err)
	}
	if cfg.Port != "8080" {
		t.Errorf("默认 Port = %q, want 8080", cfg.Port)
	}
	if cfg.RequestTimeout != 10*time.Second {
		t.Errorf("默认 RequestTimeout = %v, want 10s", cfg.RequestTimeout)
	}
	if cfg.DBName != "firebird_demo" || cfg.RedisPort != "6379" {
		t.Errorf("DB/Redis 配置未正确读取: %+v", cfg)
	}
}

func TestLoadMissingRequired(t *testing.T) {
	baseEnv(t)
	t.Setenv("DB_PASSWORD", "")
	t.Setenv("REDIS_HOST", "")
	_, err := Load()
	if err == nil {
		t.Fatal("缺必填项时应返回 error")
	}
	// 一次报全所有缺失项，不逐个挤牙膏
	for _, want := range []string{"DB_PASSWORD", "REDIS_HOST"} {
		if !strings.Contains(err.Error(), want) {
			t.Errorf("错误信息应包含 %s，实际: %v", want, err)
		}
	}
}

func TestLoadInvalidOptional(t *testing.T) {
	baseEnv(t)
	t.Setenv("DB_MAX_OPEN_CONNS", "zero")
	if _, err := Load(); err == nil || !strings.Contains(err.Error(), "DB_MAX_OPEN_CONNS") {
		t.Fatalf("非法整数应报 DB_MAX_OPEN_CONNS，实际: %v", err)
	}

	baseEnv(t)
	t.Setenv("REQUEST_TIMEOUT_SECONDS", "-3")
	if _, err := Load(); err == nil || !strings.Contains(err.Error(), "REQUEST_TIMEOUT_SECONDS") {
		t.Fatalf("非正超时应报错，实际: %v", err)
	}
}

func TestLoadOverrides(t *testing.T) {
	baseEnv(t)
	t.Setenv("PORT", "9000")
	t.Setenv("REQUEST_TIMEOUT_SECONDS", "3")
	t.Setenv("DB_MAX_OPEN_CONNS", "20")
	cfg, err := Load()
	if err != nil {
		t.Fatalf("Load() err = %v", err)
	}
	if cfg.Port != "9000" || cfg.RequestTimeout != 3*time.Second || cfg.DBMaxOpenConns != 20 {
		t.Errorf("覆盖未生效: %+v", cfg)
	}
}
