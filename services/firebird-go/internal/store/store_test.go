package store

import (
	"bufio"
	"context"
	"fmt"
	"net"
	"testing"

	"github.com/arvingrep/firebird-sea/services/firebird-go/internal/config"
)

// testStore 用给定的 Redis 地址与密码构造 Store（MySQL 指向不可达地址，测试只关心 redis 路径）。
func testStore(t *testing.T, redisAddr, redisPassword string) *Store {
	t.Helper()
	cfg := config.Config{
		DBHost: "127.0.0.1", DBPort: "1", DBName: "t", DBUser: "u", DBPassword: "p",
		RedisHost: hostOf(redisAddr), RedisPort: portOf(redisAddr), RedisPassword: redisPassword,
	}
	s, err := New(cfg)
	if err != nil {
		t.Fatalf("New: %v", err)
	}
	t.Cleanup(func() { _ = s.DB.Close() })
	return s
}

func hostOf(addr string) string {
	h, _, err := net.SplitHostPort(addr)
	if err != nil {
		return addr
	}
	return h
}

func portOf(addr string) string {
	_, p, err := net.SplitHostPort(addr)
	if err != nil {
		return "0"
	}
	return p
}

// fakeRedis 起一个最小 RESP 服务：应答 AUTH/PING（可选要求 AUTH，或返回错误），
// 用来测 PingRedis 的协议实现，不依赖真实 Redis。
type fakeRedis struct {
	requireAuth bool
	replyErr    string
}

func (f *fakeRedis) serve(t *testing.T) string {
	t.Helper()
	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatalf("listen: %v", err)
	}
	t.Cleanup(func() { _ = ln.Close() })

	go func() {
		for {
			conn, err := ln.Accept()
			if err != nil {
				return
			}
			go func(c net.Conn) {
				defer c.Close()
				authed := !f.requireAuth
				rd := bufio.NewReader(c)
				for {
					cmd, err := readCommand(rd)
					if err != nil {
						return
					}
					switch {
					case len(cmd) == 2 && cmd[0] == "AUTH" && !authed:
						authed = true
						_, _ = c.Write([]byte("+OK\r\n"))
					case len(cmd) == 1 && cmd[0] == "PING":
						switch {
						case !authed:
							_, _ = c.Write([]byte("-NOAUTH Authentication required\r\n"))
						case f.replyErr != "":
							_, _ = c.Write([]byte("-" + f.replyErr + "\r\n"))
						default:
							_, _ = c.Write([]byte("+PONG\r\n"))
						}
					default:
						_, _ = c.Write([]byte("-ERR unknown\r\n"))
					}
				}
			}(conn)
		}
	}()
	return ln.Addr().String()
}

// readCommand 读一条 RESP 数组命令（bulk string 形式）。
func readCommand(rd *bufio.Reader) ([]string, error) {
	line, err := rd.ReadString('\n')
	if err != nil {
		return nil, err
	}
	var n int
	if _, err := fmt.Sscanf(line[:len(line)-2], "*%d", &n); err != nil {
		return nil, err
	}
	args := make([]string, 0, n)
	for i := 0; i < n; i++ {
		hdr, err := rd.ReadString('\n')
		if err != nil {
			return nil, err
		}
		var l int
		if _, err := fmt.Sscanf(hdr[:len(hdr)-2], "$%d", &l); err != nil {
			return nil, err
		}
		buf := make([]byte, l+2) // 数据 + CRLF
		if _, err := fill(rd, buf); err != nil {
			return nil, err
		}
		args = append(args, string(buf[:l]))
	}
	return args, nil
}

func fill(rd *bufio.Reader, buf []byte) (int, error) {
	total := 0
	for total < len(buf) {
		n, err := rd.Read(buf[total:])
		total += n
		if err != nil {
			return total, err
		}
	}
	return total, nil
}

func TestPingRedisPONG(t *testing.T) {
	addr := (&fakeRedis{}).serve(t)
	s := testStore(t, addr, "")
	if err := s.PingRedis(context.Background()); err != nil {
		t.Fatalf("PingRedis err = %v, want nil", err)
	}
}

func TestPingRedisWithAuth(t *testing.T) {
	addr := (&fakeRedis{requireAuth: true}).serve(t)
	s := testStore(t, addr, "secret")
	if err := s.PingRedis(context.Background()); err != nil {
		t.Fatalf("带 AUTH 的 PingRedis err = %v, want nil", err)
	}

	// 没带密码应失败
	s2 := testStore(t, addr, "")
	if err := s2.PingRedis(context.Background()); err == nil {
		t.Fatal("要求 AUTH 但未提供时应失败")
	}
}

func TestPingRedisErrorReply(t *testing.T) {
	addr := (&fakeRedis{replyErr: "ERR broken"}).serve(t)
	s := testStore(t, addr, "")
	if err := s.PingRedis(context.Background()); err == nil {
		t.Fatal("Redis 返回错误时应失败")
	}
}

func TestPingRedisUnreachable(t *testing.T) {
	// 127.0.0.1:1 端口必然拒绝连接
	s := testStore(t, "127.0.0.1:1", "")
	if err := s.PingRedis(context.Background()); err == nil {
		t.Fatal("连不上时应失败")
	}
}

func TestReadyReportsFailure(t *testing.T) {
	// MySQL 指向不可达地址：Ready 必须报错（redis 正常也不该掩盖 mysql 失败）
	addr := (&fakeRedis{}).serve(t)
	s := testStore(t, addr, "")
	s.DB.SetMaxOpenConns(1)
	if err := s.Ready(context.Background()); err == nil {
		t.Fatal("MySQL 不可达时 Ready 应失败")
	}
}
