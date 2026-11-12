package fburl

import (
	"context"
	"database/sql"
	"errors"
	"strings"
)

// File ports getFilePath: empty input yields "", otherwise getRealFilePath(resize=true).
func (r *Resolver) File(ctx context.Context, path string, o Options) (string, error) {
	if phpEmpty(path) {
		return "", nil
	}
	return r.RealFile(ctx, path, true, true, o)
}

var mediaExts = []string{".jpg", ".jpeg", ".gif", ".png", ".bmp", ".mp4", ".mov", ".wav", ".mp3", ".wma", ".amr"}
var imageExts = mediaExts[:5]

func containsAny(s string, subs []string) bool {
	for _, x := range subs {
		if strings.Contains(s, x) {
			return true
		}
	}
	return false
}

// resizeParam ports getRemoteImageResizeParam (the click-count side effect is not ported).
func resizeParam(platform int, file string, resize bool) string {
	if strings.Contains(file, "plugins") || strings.Contains(file, "editor") {
		return ""
	}
	if resize && platform != 0 && file != "" && containsAny(file, imageExts) && !strings.Contains(file, "?") {
		switch platform {
		case 1:
			return "?x-oss-process=image/resize,m_fill,w_4096,h_4096"
		case 2:
			return "?imageView2/2/interlace/1/q/90/w/4096/h/4096"
		case 3:
			return "?x-image-process=image/resize,m_fill,w_4096,h_4096"
		case 4:
			return "?imageMogr2/gravity/center/crop/4096x4096/interlace/1"
		}
	}
	return ""
}

// withScheme prefixes the secure scheme unless the configured domain already has one.
func (r *Resolver) withScheme(u string) string {
	if strings.Contains(u, "http") {
		return u
	}
	return r.scheme() + u
}

// RealFile ports getRealFilePath. The PHP cache key ignores resize (first caller wins);
// here only the attachment row is cached, so resize never leaks between calls.
// Encrypted (non-numeric, slash-less) attachment ids are decrypted like PHP
// (RenrenCrypt) and looked up by id. Difference from PHP: external storage is resolved from the build-time
// configuration only (no SDK access).
func (r *Resolver) RealFile(ctx context.Context, file string, resize, local bool, o Options) (string, error) {
	if file == "" {
		return "", nil
	}
	file = strings.ReplaceAll(file, "||", "")
	if !strings.Contains(file, "?") {
		file = strings.ReplaceAll(file, "&type=", "?type=")
	}
	if !strings.Contains(file, "http") {
		file = strings.SplitN(file, ",", 2)[0]
	}
	st := r.cfg.Storage
	uploadDir := strings.ReplaceAll(st.UploadDir, "../", "")
	base := r.base(o)

	if strings.Contains(file, "http") || strings.Contains(file, "//") {
		if strings.HasPrefix(file, "//") {
			return "https:" + file + resizeParam(st.Type, file, resize), nil
		}
		return file + resizeParam(st.Type, file, resize), nil
	}

	filetype := 0
	if containsAny(file, mediaExts) {
		fileDomain := base
		if !strings.Contains(file, uploadDir) {
			fileDomain += uploadDir
		}
		stripUploads := func() {
			if strings.Contains(file, "/uploads") {
				file = strings.ReplaceAll(file, "/uploads", "")
			}
		}
		switch {
		case strings.Contains(file, "/static/"):
			filetype = 1
			fileDomain = base
			if r.cfg.LocalFiles[file] {
				return fileDomain + file, nil
			}
		case st.Type == 0 && st.State == 1:
			fileDomain = st.URL + st.Dir
			stripUploads()
		case st.Type == 1:
			fileDomain = r.withScheme(st.OSS)
			stripUploads()
		case st.Type == 2:
			fileDomain = st.Qiniu
		case st.Type == 3:
			fileDomain = r.withScheme(st.OBS)
			stripUploads()
		case st.Type == 4:
			fileDomain = r.withScheme(st.COS)
			stripUploads()
		default:
			p := file
			if !strings.Contains(file, uploadDir) {
				p = uploadDir + file
			}
			if r.cfg.LocalFiles[p] {
				return fileDomain + file, nil
			}
		}
		if filetype == 0 && r.cfg.RemoteUnify {
			// PHP deliberately skips the local-file check here (1 == 2 dead branch).
			return fileDomain + file + resizeParam(st.Type, file, resize), nil
		}
	}
	return r.attachmentURL(ctx, file, resize, base)
}

// attachmentURL resolves a numeric attachment id or a path through #@__attachment.
func (r *Resolver) attachmentURL(ctx context.Context, file string, resize bool, base string) (string, error) {
	// PHP: $fid = is_numeric($file) || strstr($file,'/') ? $file : php_decrypt(base64_decode($file))
	// (php_decrypt base64-decodes again, so the input is decoded twice).
	fid := file
	if !isNumeric(file) && !strings.Contains(file, "/") {
		fid = renrenDecrypt(phpBase64Decode(file))
	}
	var q, arg, kind string
	if isNumeric(fid) {
		kind = "id:"
		q = "SELECT `id`, `path` FROM `" + r.prefix + "attachment` WHERE `id` = ?"
		arg = fid
	} else {
		kind = "path:"
		arg = strings.TrimSpace(stripTagsRe.ReplaceAllString(strings.TrimSpace(file), ""))
		q = "SELECT `id`, `path` FROM `" + r.prefix + "attachment` WHERE `path` = ?"
	}
	row, err := r.cached("attachment:"+kind+arg, func() ([]string, error) {
		var id, path sql.NullString
		err := r.db.QueryRowContext(ctx, q, arg).Scan(&id, &path)
		if errors.Is(err, sql.ErrNoRows) {
			return []string{}, nil
		}
		if err != nil {
			return nil, err
		}
		return []string{id.String, path.String}, nil
	})
	if err != nil || len(row) == 0 {
		return "", err
	}
	path := strings.ReplaceAll(row[1], "/uploads", "")
	module := "siteConfig"
	if parts := strings.Split(path, "/"); len(parts) > 1 {
		if parts[1] != "uploads" {
			module = parts[1]
		}
	} else {
		module = ""
	}
	mod, ok := r.cfg.Modules[module]
	if !ok {
		return "", nil
	}
	st := r.cfg.Storage
	editorDir := st.UploadDir
	var siteFileURL string
	platform := st.Type
	if mod.CustomFTP {
		cs := mod.Storage
		platform = cs.Type
		switch cs.Type {
		case 0:
			if cs.State == 1 {
				siteFileURL = cs.URL + cs.Dir
			} else if mod.CustomUpload {
				siteFileURL = base + cs.UploadDir
			} else {
				siteFileURL = base + editorDir
			}
		case 1:
			siteFileURL = r.withScheme(cs.OSS)
		case 2:
			siteFileURL = r.withScheme(cs.Qiniu)
		case 3:
			siteFileURL = r.withScheme(cs.OBS)
		case 4:
			siteFileURL = r.withScheme(cs.COS)
		}
	} else {
		switch st.Type {
		case 0:
			if st.State == 1 {
				siteFileURL = st.URL + st.Dir
			} else {
				siteFileURL = base + editorDir
			}
		case 1:
			siteFileURL = r.withScheme(st.OSS)
		case 2:
			siteFileURL = r.withScheme(st.Qiniu)
		case 3:
			siteFileURL = r.withScheme(st.OBS)
		case 4:
			siteFileURL = r.withScheme(st.COS)
		}
	}
	return siteFileURL + path + resizeParam(platform, path, resize), nil
}
