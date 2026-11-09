// Package config 只读环境变量装配服务配置。
//
// 规则（#231）：缺任一必填项，Load 返回 error，main 启动即失败——
// 宁可 CrashLoop 让人看见，也不要带着半套配置起来后 readyz 误导。
package config

import (
	"fmt"
	"os"
	"strconv"
	"time"
)

// Config 服务运行所需的全部配置。字段只在这里赋值一次，其余包只读。
type Config struct {
	Port string // 监听端口，默认 8080

	DBHost    string
	DBPort    string
	DBName    string
	DBUser    string
	DBPassword string

	RedisHost     string
	RedisPort     string
	RedisPassword string // 空 = 无 AUTH（与 cronjob 里 REDIS_PASSWORD optional 同口径）

	// 请求超时与连接池参数：有默认值，均可被环境变量覆盖。
	RequestTimeout time.Duration
	DBMaxOpenConns int
	DBMaxIdleConns int
}

// required 必填变量清单。新增必填项时同步补 config_test.go 的用例。
var required = []string{
	"DB_HOST", "DB_PORT", "DB_NAME", "DB_USER", "DB_PASSWORD",
	"REDIS_HOST", "REDIS_PORT",
}

// Load 从环境变量读取配置；缺必填项时返回包含全部缺失项的错误（一次报全，省得逐个补）。
func Load() (Config, error) {
	missing := make([]string, 0, len(required))
	for _, name := range required {
		if os.Getenv(name) == "" {
			missing = append(missing, name)
		}
	}
	if len(missing) > 0 {
		return Config{}, fmt.Errorf("缺少必填环境变量: %v", missing)
	}

	cfg := Config{
		Port:       envOr("PORT", "8080"),
		DBHost:     os.Getenv("DB_HOST"),
		DBPort:     os.Getenv("DB_PORT"),
		DBName:     os.Getenv("DB_NAME"),
		DBUser:     os.Getenv("DB_USER"),
		DBPassword: os.Getenv("DB_PASSWORD"),

		RedisHost:     os.Getenv("REDIS_HOST"),
		RedisPort:     os.Getenv("REDIS_PORT"),
		RedisPassword: os.Getenv("REDIS_PASSWORD"),

		RequestTimeout: 10 * time.Second,
		DBMaxOpenConns: 10,
		DBMaxIdleConns: 5,
	}

	if v := os.Getenv("REQUEST_TIMEOUT_SECONDS"); v != "" {
		n, err := strconv.Atoi(v)
		if err != nil || n <= 0 {
			return Config{}, fmt.Errorf("REQUEST_TIMEOUT_SECONDS 非法: %q", v)
		}
		cfg.RequestTimeout = time.Duration(n) * time.Second
	}
	if n, ok, err := envInt("DB_MAX_OPEN_CONNS"); err != nil {
		return Config{}, err
	} else if ok {
		cfg.DBMaxOpenConns = n
	}
	if n, ok, err := envInt("DB_MAX_IDLE_CONNS"); err != nil {
		return Config{}, err
	} else if ok {
		cfg.DBMaxIdleConns = n
	}

	return cfg, nil
}

func envOr(name, def string) string {
	if v := os.Getenv(name); v != "" {
		return v
	}
	return def
}

func envInt(name string) (int, bool, error) {
	v := os.Getenv(name)
	if v == "" {
		return 0, false, nil
	}
	n, err := strconv.Atoi(v)
	if err != nil || n <= 0 {
		return 0, false, fmt.Errorf("%s 非法: %q", name, v)
	}
	return n, true, nil
}
