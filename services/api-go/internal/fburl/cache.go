package fburl

import (
	"container/list"
	"sync"
	"time"
)

// Only database results are cached. Hosts, options, and resize never leak between calls.
// Misses expire too; transient errors are never cached.
type rowEntry struct {
	key     string
	values  []string
	expires time.Time
}
type rowCache struct {
	mu       sync.Mutex
	capacity int
	items    map[string]*list.Element
	order    *list.List
}

func newRowCache(n int) *rowCache {
	return &rowCache{capacity: n, items: map[string]*list.Element{}, order: list.New()}
}
func (c *rowCache) get(k string) ([]string, bool) {
	c.mu.Lock()
	defer c.mu.Unlock()
	e, ok := c.items[k]
	if !ok {
		return nil, false
	}
	v := e.Value.(rowEntry)
	if time.Now().After(v.expires) {
		delete(c.items, k)
		c.order.Remove(e)
		return nil, false
	}
	c.order.MoveToFront(e)
	return v.values, true
}
func (c *rowCache) put(k string, v []string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	if e, ok := c.items[k]; ok {
		c.order.Remove(e)
	}
	c.items[k] = c.order.PushFront(rowEntry{k, v, time.Now().Add(time.Minute)})
	if c.order.Len() > c.capacity {
		e := c.order.Back()
		delete(c.items, e.Value.(rowEntry).key)
		c.order.Remove(e)
	}
}
