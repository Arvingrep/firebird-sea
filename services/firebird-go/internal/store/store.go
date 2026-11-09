// Package store 装配 MySQL 连接池与 Redis 连通性检查。
// Redis 探活用手写 RESP PING 而不是引客户端库：骨架只需要 PING，
// 少一个依赖，等 #236（sqlc + 连接池）落地时再评估是否统一引入。
package store

import (
	"context"
	"database/sql"
	"fmt"
	"net"
	"time"

	_ "github.com/go-sql-driver/mysql" // database/sql 驱动注册

	"github.com/arvingrep/firebird-sea/services/firebird-go/internal/config"
)

// Store 持有 MySQL 连接池与 Redis 地址；包内只暴露就绪检查，
// 具体查询由后续 issue（#236）在这里长出来。
type Store struct {
	DB *sql.DB

	redisAddr     string
	redisPassword string
	dialTimeout   time.Duration
}

// New 建立 MySQL 连接池。参数来自 config；连接按需建立（sql.DB 惰性），
// 启动时不强求 MySQL 已可达——可连性由 /readyz 上报，避免「数据库抖一下 = 全站重启」。
func New(cfg config.Config) (*Store, error) {
	dsn := fmt.Sprintf(
		"%s:%s@tcp(%s:%s)/%s?parseTime=true&charset=utf8mb4&loc=Local",
		cfg.DBUser, cfg.DBPassword, cfg.DBHost, cfg.DBPort, cfg.DBName,
	)
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		return nil, fmt.Errorf("打开 MySQL 连接池: %w", err)
	}
	db.SetMaxOpenConns(cfg.DBMaxOpenConns)
	db.SetMaxIdleConns(cfg.DBMaxIdleConns)
	db.SetConnMaxLifetime(5 * time.Minute)

	return &Store{
		DB:            db,
		redisAddr:     net.JoinHostPort(cfg.RedisHost, cfg.RedisPort),
		redisPassword: cfg.RedisPassword,
		dialTimeout:   2 * time.Second,
	}, nil
}

// PingMySQL 用短超时探测 MySQL；错误原样返回供 /readyz 汇总。
func (s *Store) PingMySQL(ctx context.Context) error {
	ctx, cancel := context.WithTimeout(ctx, s.dialTimeout)
	defer cancel()
	return s.DB.PingContext(ctx)
}

// PingRedis 向 Redis 发 RESP PING，期望 +PONG；配置了密码则先 AUTH。
// 只解析状态回复（+OK / +PONG / -ERR），足够判断「可连」。
func (s *Store) PingRedis(ctx context.Context) error {
	var d net.Dialer
	conn, err := d.DialContext(ctx, "tcp", s.redisAddr)
	if err != nil {
		return fmt.Errorf("redis 连接失败: %w", err)
	}
	defer conn.Close()

	deadline, ok := ctx.Deadline()
	if !ok {
		deadline = time.Now().Add(s.dialTimeout)
	}
	_ = conn.SetDeadline(deadline)

	if s.redisPassword != "" {
		if err := writeCommand(conn, "AUTH", s.redisPassword); err != nil {
			return fmt.Errorf("redis AUTH 发送失败: %w", err)
		}
		if err := expectSimpleReply(conn, "OK"); err != nil {
			return fmt.Errorf("redis AUTH: %w", err)
		}
	}

	if err := writeCommand(conn, "PING"); err != nil {
		return fmt.Errorf("redis PING 发送失败: %w", err)
	}
	return expectSimpleReply(conn, "PONG")
}

// Ready 依次探测 MySQL 与 Redis，全部可连返回 nil；否则返回汇总错误。
func (s *Store) Ready(ctx context.Context) error {
	var errs []error
	if err := s.PingMySQL(ctx); err != nil {
		errs = append(errs, fmt.Errorf("mysql: %w", err))
	}
	if err := s.PingRedis(ctx); err != nil {
		errs = append(errs, fmt.Errorf("redis: %w", err))
	}
	if len(errs) > 0 {
		return errs[0]
	}
	return nil
}

// writeCommand 按 RESP 协议写一条命令（参数按 bulk string 编码）。
func writeCommand(conn net.Conn, args ...string) error {
	out := fmt.Sprintf("*%d\r\n", len(args))
	for _, a := range args {
		out += fmt.Sprintf("$%d\r\n%s\r\n", len(a), a)
	}
	_, err := conn.Write([]byte(out))
	return err
}

// expectSimpleReply 读一行 RESP 状态回复，必须是 +<want>；错误回复（-...）原样透出。
func expectSimpleReply(conn net.Conn, want string) error {
	buf := make([]byte, 128)
	n, err := conn.Read(buf)
	if err != nil {
		return fmt.Errorf("读取回复: %w", err)
	}
	line := string(buf[:n])
	switch {
	case len(line) > 0 && line[0] == '+':
		got := trimCRLF(line[1:])
		if got != want {
			return fmt.Errorf("期望 +%s，实际 +%s", want, got)
		}
		return nil
	case len(line) > 0 && line[0] == '-':
		return fmt.Errorf("redis 错误: %s", trimCRLF(line[1:]))
	default:
		return fmt.Errorf("非状态回复: %q", line)
	}
}

func trimCRLF(s string) string {
	for len(s) > 0 && (s[len(s)-1] == '\n' || s[len(s)-1] == '\r') {
		s = s[:len(s)-1]
	}
	return s
}
