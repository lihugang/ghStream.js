/* ghStream.js
   Copyright: (c) 2018-2021 Air-Team 
   lihugang@outlook.com
   Dec.10,2021
*/
function _init_ghStream() {
    var token = ["EOF", "NULL", "DEFAULT", "NO_USING_TOKEN", "SEEK_SET", "SEEK_CUR", "SEEK_END", "FOPEN_MAX", "FILENAME_MAX", "L_tmpnam", "TMP_MAX", "stdin", "stdout", "stderr", "_gh_token_arr", "_tmpfile_hash_table", "FILE_POINTER", "fpos_t", "data_t", "cfg_gh_token", "_check_match", "fopen", "fclose", "_update_sha", "_string_to_array", "_array_to_string", "fclose", "_rand", "freopen", "printf", "scanf", "putchar", "getchar", "feof", "fgetpos", "retfgetpos", "fread", "retfread", "fseek", "fsetpos", "ftell", "fwrite", "easy_fwrite", "remove", "rename", "rewind", "tmpfile", "tmpnam", "getdata", "setdata"]

    const EOF = -1;
    const NULL = 0;
    const DEFAULT = 0;
    const NO_USING_TOKEN = -1;
    const SEEK_SET = -1001;
    const SEEK_CUR = -1002;
    const SEEK_END = -1003;
    const FOPEN_MAX = 4;
    const FILENAME_MAX = 128;
    const L_tmpnam = 36;
    const TMP_MAX = 65536;
    const stdin = new FILE_POINTER({
        f_info: {
            username: "",
            repo_name: "",
            path_name: ""
        },
        f_status: 0,
        f_mode: "r",
        f_content: [],
        f_sha: null,
        gh_token: null,
        pos: 0
    });
    const stdout = new FILE_POINTER({
        f_info: {
            username: "",
            repo_name: "",
            path_name: ""
        },
        f_status: 0,
        f_mode: "w",
        f_content: [],
        f_sha: null,
        gh_token: null,
        pos: 0
    });
    const stderr = new FILE_POINTER({
        f_info: {
            username: "",
            repo_name: "",
            path_name: ""
        },
        f_status: 0,
        f_mode: "w",
        f_content: [],
        f_sha: null,
        gh_token: null,
        pos: 0
    });
    _gh_token_arr = [];
    _tmpfile_hash_table = new Map();
    String.prototype.contains = String.prototype.contains || function(w) {
        return this.indexOf(w) !== -1;
    };

    function FILE_POINTER(args) {
        for (var key in args) {
            this[key] = args[key];
        };
    };

    function fpos_t(x) {
        this.pos = x;
    };

    function data_t(data) {
        this.data = data;
    };

    function cfg_gh_token(Mode, Token = null) {
        console.assert(Token != null, "Token cannot be null");
        if (Token == null) {
            return -1;
        }
        if (Mode.toLowerCase() == "a" || Mode.toLowerCase() == "append") {
            if (Token != null)
                _gh_token_arr.push(Token);
            else {
                console.error("Invalid token");
                throw (-1);
            };
        } else if (Mode.toLowerCase() == "d" || Mode.toLowercase() == "delete") {
            if (Token == null) {
                console.error("Invalid token");
                throw (-1);
            };
            for (var i = 0; i < gh_token.length; i++) {
                if (_gh_token_arr[i] == Token)
                    _gh_token_arr.splice(i, 1);
            };
        };
    };

    function _check_match(str, arr) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] == str)
                return true;
        };
        return false;
    }

    function fopen(Filename, Mode, gh_token = DEFAULT) {
        console.assert(Filename && Mode, "Invalid filename or mode.");
        if (!(Filename && Mode)) {
            throw (-1);
        }
        if (gh_token == DEFAULT) {
            gh_token = _gh_token_arr[0] || null;
        } else if (gh_token == NO_USING_TOKEN) {
            gh_token = null;
        } else if (typeof(gh_token) == "string") {
            //No operation  
        } else if (typeof(gh_token) == "number") {
            console.assert(gh_token < _gh_token_arr.length, "Array overflow detected");
            if (gh_token >= _gh_token_arr.length) {
                return NULL;
            };
            gh_token = _gh_token_arr[gh_token];
        } else gh_token = null;
        if (!(Mode.contains("r") && !(Mode.contains("+")))) {
            //Not readonly mode
            //Need submit changes
            //Must have gh_token
            console.assert(gh_token != null, "Must have gh_token");
            if (gh_token == null) {
                return NULL;
            };
        };
        var username = Filename.substring(0, Filename.indexOf("/"));
        var repo_name = Filename.substring(username.length + 1, username.length + 1 + Filename.substring(username.length + 1).indexOf("/"));
        var path = Filename.substring(username.length + repo_name.length + 2);
        var window = window || globalThis || global || {};
        if (window.XMLHttpRequest) {
            var xhr = new XMLHttpRequest();
        } else if (window.ActiveXObject) {
            var xhr = new ActiveXObject("Microsoft.XMLHTTP");
        } else {
            console.error("Unsupported XMLHttpRequest");
            throw (-1);
        };
        xhr.open("GET", "https://api.github.com/repos/" + username + "/" + repo_name + "/contents/" + path + "?rand=" + _rand(16), false);
        if (gh_token != null && gh_token != NULL && gh_token != "null")
            xhr.setRequestHeader("Authorization", "token " + gh_token);
        xhr.send();
        if (xhr.status >= 200 && xhr.status < 400) {
            //Successful
            if (Mode.contains("w"))
                return new FILE_POINTER({
                    f_info: {
                        username: username,
                        repo_name: repo_name,
                        path: path,
                        fname: Filename
                    },
                    f_status: xhr.status,
                    f_mode: Mode,
                    f_content: [],
                    f_sha: JSON.parse(xhr.response).sha,
                    gh_token: gh_token,
                    pos: 0
                });
            else
                return new FILE_POINTER({
                    f_info: {
                        username: username,
                        repo_name: repo_name,
                        path: path,
                        fname: Filename
                    },
                    f_status: xhr.status,
                    f_mode: Mode,
                    f_content: _string_to_array(atob(JSON.parse(xhr.response).content)),
                    f_sha: JSON.parse(xhr.response).sha,
                    gh_token: gh_token,
                    pos: 0
                });
        } else {
            if (Mode.contains("r"))
                return NULL;
            else return new FILE_POINTER({
                f_info: {
                    username: username,
                    repo_name: repo_name,
                    path: path,
                    fname: Filename
                },
                f_status: xhr.status,
                f_mode: Mode,
                f_content: [],
                f_sha: null,
                gh_token: gh_token,
                pos: 0
            });
        };
    };

    function _update_sha(fp) {
        var tmp = fopen(fp.f_info.fname, "r");
        fp.f_sha = tmp.f_sha;
        fclose(tmp);
    };

    function _string_to_array(s) {
        var res = [];
        for (var i = 0; i < s.length; i++) res[i] = s[i];
        return res;
    };

    function _array_to_string(arr) {
        var res = "";
        for (var i = 0; i < arr.length; i++) res += arr[i];
        return res;
    }

    function fclose(fp) {
        if (typeof(fp.isTmpFile) != "undefined" && fp.isTmpFile) {
            //Temp file
            delete fp;
            _tmpfile_hash_table.delete(fp.f_info.path.substring("tmp/file".length));
            return 1;
        } else if (fp.f_mode.contains("r") && !(fp.f_mode.contains("+"))) {
            //Readonly file
            delete fp;
            return 1;
        } else {
            if (window.XMLHttpRequest) {
                var xhr = new XMLHttpRequest();
            } else if (window.ActiveXObject) {
                var xhr = new ActiveXObject("Microsoft.XMLHTTP");
            } else {
                console.error("Unsupported XMLHttpRequest");
                throw (-1);
            };
            xhr.open("PUT", "https://api.github.com/repos/" + fp.f_info.username + "/" + fp.f_info.repo_name + "/contents/" + fp.f_info.path + "?rand=" + _rand(16), false);
            xhr.setRequestHeader("Authorization", "token " + fp.gh_token);
            xhr.send(JSON.stringify({ message: "ghStream.js submited the file", sha: fp.f_sha, content: btoa(_array_to_string(fp.f_content)) }));
            if (xhr.status >= 200 && xhr.status < 400) {
                //Successful upload
                delete fp;
                return 1;
            } else if (xhr.status == 409) {
                //sha code error
                _update_sha(fp);
                return fclose(fp);
            } else return NULL;
        }
    };

    function _rand(len) {
        var str = "";
        do {
            str += Math.random().toString(36).substring(2, len + 2);
        } while (str.length < len);
        return str.substring(0, len);
    };

    function freopen(filename, mode, stream, gh_token = DEFAULT) {
        stream = fopen(filename, mode, gh_token);
        return stream;
    };

    function printf(string, ...args) {
        return fprintf(stdout, string, ...args);
    };

    function scanf(string, ...args) {
        return fscanf(stdin, string, ...args);
    };

    function putchar(ch) {
        return putc(ch, stdout);
    };

    function getchar() {
        return getc(stdin);
    };

    function feof(stream) {
        return !!(stream.pos >= stream.f_content.length);
    };

    function fgetpos(stream, pos) {
        if (feof(stream)) return EOF;
        pos.pos = stream.pos;
        return 0;
    };

    function retfgetpos(stream) {
        var res = new fpos_t(EOF);
        fgetpos(stream, res);
        return res.pos;
    }

    function fread(ptr, size, blocks, stream) {
        var len = size * blocks;
        if (len < 0) return null;
        var p = stream.pos;
        var res = "";
        for (var i = 0;
            (i + p) < stream.f_content.length && i < len; i++) {
            res += stream.f_content[i];
        };
        var successful_blocks = parseInt(res.length / size);
        res = res.substring(0, successful_blocks * size);
        stream.pos += size * blocks;
        ptr.data = res;
        return successful_blocks;
    };

    function retfread(size, stream) {
        if (size < 0) return NULL;
        var res = new data_t(NULL);
        fread(res, 1, size, stream);
        return res.data;
    };

    function fseek(stream, offset, whence) {
        if (whence == SEEK_SET) {
            whence = 0;
        } else if (whence == SEEK_CUR) {
            whence = stream.pos;
        } else if (whence = SEEK_END) {
            whence = stream.f_content.length;
        };
        if ((whence + offset) > stream.f_content.length || (whence + offset) < 0) return EOF;
        stream.pos = whence + offset;
        return 0;
    };

    function fsetpos(stream, pos) {
        if (pos > stream.f_content.length || pos < 0) return EOF;
        stream.pos = pos;
    };

    function ftell(stream) {
        return stream.pos;
    };

    function fwrite(ptr, size, blocks, stream) {
        var len = size * blocks;
        var p = stream.pos;
        for (var i = 0; i < len; i++) {
            stream.f_content[p + i] = ptr[i];
        };
        stream.pos += len;
        return blocks;
    };

    function easy_fwrite(ptr, stream) {
        return fwrite(ptr, 1, ptr.length, stream);
    };

    function remove(filename, gh_token = DEFAULT) {
        if (gh_token == DEFAULT) {
            gh_token = _gh_token_arr[0] || null;
        } else if (gh_token == NO_USING_TOKEN) {
            gh_token = null;
        } else if (typeof(gh_token) == "string") {
            //No operation  
        } else if (typeof(gh_token) == "number") {
            console.assert(gh_token < _gh_token_arr.length, "Array overflow detected");
            if (gh_token >= _gh_token_arr.length) {
                return -1;
            };
            gh_token = _gh_token_arr[gh_token];
        } else gh_token = null;
        //Need submit changes
        //Must have gh_token
        console.assert(gh_token != null, "Must have gh_token");
        if (gh_token == null) {
            return -1;
        };
        var tmp = fopen(filename, "r");
        var sha = tmp.f_sha;
        var username = tmp.f_info.username;
        var repo_name = tmp.f_info.repo_name;
        var path = tmp.f_info.path;
        fclose(tmp);
        if (window.XMLHttpRequest) {
            var xhr = new XMLHttpRequest();
        } else if (window.ActiveXObject) {
            var xhr = new ActiveXObject("Microsoft.XMLHTTP");
        } else {
            console.error("Unsupported XMLHttpRequest");
            throw (-1);
        };
        xhr.open("DELETE", "https://api.github.com/repos/" + username + "/" + repo_name + "/contents/" + path + "?rand=" + _rand(16), false);
        xhr.setRequestHeader("Authorization", "token " + gh_token);
        xhr.send(JSON.stringify({ message: "ghStream.js deleted a file.", sha: sha }));
        if (xhr.status >= 200 && xhr.status < 400)
            return 0;
        else return -1;
    };

    function rename(old_filename, new_filename, gh_token = DEFAULT) {
        if (gh_token == DEFAULT) {
            gh_token = _gh_token_arr[0] || null;
        } else if (gh_token == NO_USING_TOKEN) {
            gh_token = null;
        } else if (typeof(gh_token) == "string") {
            //No operation  
        } else if (typeof(gh_token) == "number") {
            console.assert(gh_token < _gh_token_arr.length, "Array overflow detected");
            if (gh_token >= _gh_token_arr.length) {
                return -1;
            };
            gh_token = _gh_token_arr[gh_token];
        } else gh_token = null;
        //Need submit changes
        //Must have gh_token
        console.assert(gh_token != null, "Must have gh_token");
        if (gh_token == null) {
            return -1;
        };
        var fp = fopen(old_filename, "r+", gh_token);
        var p = fp.f_info.path.lastIndexOf("/");
        fp.f_info.path = fp.f_info.path.substring(0, p) + new_filename;
        fclose(fp);
        return remove(old_filename, gh_token);
    };

    function rewind(stream) {
        fseek(stream, 0, SEEK_SET);
    };

    function tmpfile() {
        var filename = tmpnam(NULL);
        return new FILE_POINTER({
            f_info: {
                username: null,
                repo_name: null,
                path: filename
            },
            f_status: 0,
            f_mode: "rb+",
            f_content: [],
            f_sha: null,
            gh_token: null,
            isTmpFile: true,
            pos: 0
        });
    };

    function tmpnam(dat) {
        do {
            var filename = _rand(36 - "tmp/file".length);
        } while (typeof(_tmpfile_hash_table.get(filename)) != "undefined");
        _tmpfile_hash_table.set(filename, true);
        if (dat != NULL && typeof(dat.data) != "undefined" && dat.data != NULL) {
            dat.data = "tmp/file" + filename;
        };
        return "tmp/file" + filename;
    };

    //Useful functions
    function getdata(stream) {
        return _array_to_string(stream.f_content);
    };

    function setdata(stream, data) {
        stream.f_content = _string_to_array(data);
    };

    //Map functions

    for (var i = 0; i < token.length; i++) {
        window[token[i]] = this[token[i]];
    };
};
_init_ghStream();
